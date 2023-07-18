<script setup>
import { ref } from 'vue';
import draggable from 'vuedraggable';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps(['rows']);
const emits = defineEmits([
  'rowsReordered',
  'columnUpdated',
  'columnsReordered',
]);
const rowSectionType = '' + props.rows[0].type;
const headerMap = new Map();
props.rows.forEach((row) =>
  row?.attributes?.forEach((attr) => {
    if (!headerMap.has(attr.name)) headerMap.set(attr.name, []);
    headerMap.get(attr.name).push(attr);
  }),
);
const keys = ['', ...headerMap.keys(), ''];
const headers = ref(keys);
const theseRows = ref(props.rows);
const refresh = ref(0);

// Add all column to the first row. We will use it to control column dragging
const getCell = (row, col) => {
  let attribute = row?.attributes.find(
    (att) => att?.name?.toLowerCase() === col?.toLowerCase(),
  );
  if (!attribute) {
    attribute = { name: col, value: '' };
    row.attributes.push(attribute);
  }
  return attribute;
};

const reorderColumns = (event) => {
  const atts = theseRows.value[0].attributes;
  headers.value.forEach((header, i) => {
    if (header === '') return;
    const index = atts.findIndex((a) => a.name === header);
    const deleted = atts.splice(index, 1);
    atts.splice(i - 1, 0, deleted[0]);
  });
};

const addColumn = (event) => {
  const columnName = 'Column ' + (headers.value.length - 1);
  headers.value.splice(-1, 0, columnName);
  theseRows.value.forEach((row) =>
    row.attributes.push({ name: columnName, value: '' }),
  );
};

const addRow = (event) => {
  const row = { type: rowSectionType, attributes: [] };
  headers.value.forEach((header, i) => {
    if (i === 0 || i === headers.value.length - 1) return;
    row.attributes.push({ name: header, value: '' });
  });
  theseRows.value.push(row);
};

const deleteRow = (index) => {
  theseRows.value.splice(index, 1);
};

const updateColumnName = (event, index) => {
  if (index === headers.value.length - 1) return;
  const oldValue = headers.value[index];
  const newValue = event.target.value;
  if (headers.value.find((n) => n === newValue)) return;
  emits('columnUpdated', { old: oldValue, new: newValue, index: index });
};
</script>
<template>
  <div class="ps-3" :key="refresh">
    <table class="table table-responsive">
      <thead>
        <draggable
          v-model="headers"
          tag="tr"
          :item-key="(key) => key"
          @end.stop="reorderColumns"
        >
          <template #item="{ element: header, index: i }">
            <th :class="{ fixed: i === 0 || i === headers?.length - 1 }">
              <!--span class="grip">{{ header }}</span-->
              <input
                class="form-control form-control-sm"
                type="text"
                :value="header"
                v-if="i > 0 && i < headers.length - 1"
                @change.stop="(e) => updateColumnName(e, i)"
              />
            </th>
          </template>
        </draggable>
      </thead>
      <draggable
        v-model="theseRows"
        tag="tbody"
        item-key="name"
        @end="(e) => emits('rowsReordered', e)"
      >
        <template #item="{ element: row, index: index }">
          <tr>
            <td class="grip">
              <font-awesome-icon icon="fa-solid fa-grip-vertical" />
            </td>
            <td
              v-for="(col, j) in [...headers].filter(
                (v, i) => i > 0 && i < headers.length - 1,
              )"
              :key="j"
            >
              <input
                class="form-control form-control-sm"
                type="text"
                v-model="getCell(row, col).value"
              />
            </td>
            <td class="grip">
              <font-awesome-icon
                class="fa-sm"
                role="button"
                icon="fa-trash"
                @click="deleteRow(index)"
              ></font-awesome-icon>
            </td>
          </tr>
        </template>
      </draggable>
    </table>
    <div>
      <button class="btn btn-outline-secondary btn-sm" @click="addRow">
        Add Row
      </button>
      <button
        class="btn btn-outline-secondary btn-sm float-end"
        @click="addColumn"
      >
        Add Column
      </button>
    </div>
  </div>
</template>

<style scoped>
.grip {
  color: #cccccc;
}

.grip {
  cursor: grab;
}

.grip:active {
  cursor: grabbing;
}

.fixed {
  pointer-events: none;
}

span.grip {
  color: #555555;
  font-size: 10pt;
}

th {
  cursor: grab;
}

th:active {
  cursor: grabbing;
}
</style>
