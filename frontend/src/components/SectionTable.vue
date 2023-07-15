<script setup>
import { ref } from 'vue';
import draggable from 'vuedraggable';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps(['rows']);
const emits = defineEmits(['rowsSwapped', 'columnUpdated']);
const headerMap = new Map();
props.rows.forEach((row) =>
  row?.attributes?.forEach((attr) => {
    if (!headerMap.has(attr.name)) headerMap.set(attr.name, []);
    headerMap.get(attr.name).push(attr);
  }),
);
const keys = [' ', ...headerMap.keys()];
const headers = ref(keys);
const theseRows = ref(props.rows);

// Add all column to the first row. We will use it to control column dragging
// headers.value.forEach((col) => {
//   console.log(`Finding ${col}`);
//   const att = theseRows?.value[0]?.attributes?.find((att) => att.name === col);
//   console.log(att);
// });

const getCell = (row, col) => {
  let attribute = row.attributes.find(
    (att) => att.name.toLowerCase() === col.toLowerCase(),
  );
  if (!attribute) {
    attribute = { name: col, value: '' };
    row.attributes.push(attribute);
  }
  return attribute;
};

const swapColumn = (event) => {
  const temp = theseRows.value[0].attributes[event.oldIndex + 1];
  theseRows.value[0].attributes[event.oldIndex + 1] =
    theseRows.value[0].attributes[event.newIndex + 1];
  theseRows.value[0].attributes[event.newIndex + 1] = temp;
};

const addColumn = (event) => {
  headers.value.push('Column ' + headers.value.length);
  theseRows.value.forEach((row) =>
    row.attributes.push({ name: '', value: '' }),
  );
};

const updateColumnName = (event, index) => {
  const oldValue = headers.value[index];
  const newValue = event.target.value;
  emits('columnUpdated', { old: oldValue, new: newValue, index: index });
};
</script>
<template>
  <div class="ps-3">
    <table class="table table-responsive">
      <thead>
        <draggable
          v-model="headers"
          tag="tr"
          :item-key="(key) => key"
          @end="swapColumn"
        >
          <template #item="{ element: header, index: i }">
            <th :class="{ fixed: i === 0 }">
              <!--span class="grip">{{ header }}</span-->
              <input
                class="form-control form-control-sm"
                type="text"
                :value="header"
                v-if="i > 0"
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
        @end="(e) => emits('rowsSwapped', e)"
      >
        <template #item="{ element: row }">
          <tr>
            <td class="grip">
              <font-awesome-icon icon="fa-solid fa-grip-vertical" />
            </td>
            <td
              v-for="(col, j) in [...headers].filter((v, i) => i > 0)"
              :key="j"
            >
              <input
                class="form-control form-control-sm"
                type="text"
                v-model="getCell(row, col).value"
              />
            </td>
          </tr>
        </template>
      </draggable>
    </table>
    <div>
      <button class="btn btn-outline-secondary btn-sm">Add Row</button>
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
</style>
