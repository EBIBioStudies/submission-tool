<script setup>
import {ref} from 'vue';
import draggable from 'vuedraggable';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import FileFolderSelectModal from "./FileFolderSelectModal.vue";

const props = defineProps(['rows', 'depth', 'sectionType']);
const emits = defineEmits([
  'rowsReordered',
  'columnUpdated',
  'columnsReordered',
]);
const files = Array.isArray(props.rows[0]) ? props.rows[0] : props.rows
const attributeNames = ['', 'File'];
files.forEach((row) =>
  row?.attributes?.forEach((attr) => {
    if (!attributeNames.includes(attr.name)) attributeNames.push(attr.name)
  }),
);
attributeNames.push('')
const headers = ref(attributeNames);
const theseFiles = ref(files);

// Add all column to the first row. We will use it to control column dragging
const getCell = (row, col) => {
  let attribute = row?.attributes?.find(
    (att) => att?.name?.toLowerCase() === col?.toLowerCase(),
  );
  if (!attribute) {
    attribute = {name: col, value: ''};
    row.attributes.push(attribute);
  }
  return attribute;
};

const reorderColumns = (event) => {
  const atts = theseFiles.value[0].attributes;
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
  theseFiles.value.forEach((row) =>
    row.attributes.push({name: columnName, value: ''}),
  );
};

const addRow = (event) => {
  const row = {path: '', attributes: []};
  headers.value.forEach((header, i) => {
    if (i === 0 || i === 1 || i === headers.value.length - 1) return;
    row.attributes.push({name: header, value: ''});
  });
  theseFiles.value.push(row);
};

const deleteRow = (index) => {
  theseFiles.value.splice(index, 1);
};

const updateColumnName = (event, index) => {
  if (index === headers.value.length - 1) return;
  const oldValue = headers.value[index];
  const newValue = event.target.value;
  if (headers.value.find((n) => n === newValue)) return;
  emits('columnUpdated', {old: oldValue, new: newValue, index: index});
};


const hasColumnType = (header) =>
  props.sectionType?.columnTypes.find(col => col.name === header) != null


const isCollapsed = ref((props?.depth ?? 0) >= 2);
const toggle = () => (isCollapsed.value = !isCollapsed.value);
</script>
<template>
  <!-- section title -->
  <div>
    <span :class="[depth > 0 ? 'branch' : 'branch spacer']"></span>
    <span
      class="input-group-text text-start btn btn-lg ps-1 mt-2 section-title"
      @click="toggle()"
    >
        <font-awesome-icon
          class="section-control"
          :icon="'fa-caret-' + (isCollapsed ? 'right' : 'down')"
        ></font-awesome-icon>
        <span class="ms-2">Files ({{ theseFiles.length }})</span>
      </span>
  </div>
  <div class="ps-3 " v-if="!isCollapsed">
    <table class="table table-responsive border-start border-1">
      <thead>
      <draggable
        v-model="headers"
        tag="tr"
        :item-key="(key) => key"
        @end.stop="reorderColumns"
      >
        <template #item="{ element: header, index: i }">
          <th :class="{ fixed: i === 0 || i === 1 || i === headers?.length - 1 }">
               <span v-if="i > 0 && i < headers.length - 1">
                 <span v-if="i==1 || hasColumnType(header)">{{ header }} </span>
                 <input v-else
                        class="form-control form-control-sm"
                        type="text"
                        :value="header"
                        @change.stop="(e) => updateColumnName(e, i)"
                 />
               </span>
          </th>
        </template>
      </draggable>
      </thead>
      <draggable
        v-model="theseFiles"
        tag="tbody"
        item-key="name"
        @end="(e) => emits('rowsReordered', e)"
      >
        <template #item="{ element: row, index: index }">
          <tr class="border-white">
            <td class="grip">
              <font-awesome-icon icon="fa-solid fa-grip-vertical"/>
            </td>
            <td v-for="(col, j) in [...headers].filter((v, i) => i > 0 && i < headers.length - 1 )" :key="j">
              <FileFolderSelectModal v-if="j===0"  :file="row" />
              <input
                v-else
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
