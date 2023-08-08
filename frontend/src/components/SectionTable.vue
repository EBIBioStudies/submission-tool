<script setup>
import {ref} from 'vue';
import draggable from 'vuedraggable';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import Attribute from "@/components/Attribute.vue";

const props = defineProps(['rows', 'depth', 'sectionType']);
const emits = defineEmits([
  'rowsReordered',
  'columnUpdated',
  'columnsReordered',
]);
const rowSectionType = '' + props.rows[0].type;
const tableType = ref(rowSectionType === 'file' ? 'Files' : rowSectionType)
const headerMap = new Map();
if (rowSectionType.toLowerCase() === 'file') {
  headerMap.set('File', [])
}

props.rows.forEach((row) =>
  row?.attributes?.forEach((attr) => {
    if (!headerMap.has(attr.name)) headerMap.set(attr.name, []);
    headerMap.get(attr.name).push(attr);
  }),
);
const keys = ['', ...headerMap.keys(), ''];
const headers = ref(keys);
const theseRows = ref(Array.isArray(props.rows[0]) ? props.rows[0] : props.rows);
const refresh = ref(0);

const getFieldType = (attribute) => {
  const name = attribute.path ? 'File' : attribute?.name || attribute

  // return the column type. Expects either an object or a column name (for use in draggable)
  return props.sectionType?.columnTypes?.find((f) => f.name.toLowerCase() === name.toLowerCase());
};


// Add all column to the first row. We will use it to control column dragging
const getCell = (row, col) => {
  let attribute = row?.attributes.find(
    (att) => att?.name?.toLowerCase() === col?.toLowerCase(),
  );
  if (!attribute && row.type === 'file' && col === 'File') {
    return row;
  }
  if (!attribute) {
    attribute = {name: col, value: ''};
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
  emits('columnsReordered');
};

const addColumn = (event) => {
  const columnName = 'Column ' + (headers.value.length - 1);
  headers.value.splice(-1, 0, columnName);
  theseRows.value.forEach((row) =>
    row.attributes.push({name: columnName, value: ''}),
  );
};

const addRow = (event) => {
  const row = {type: rowSectionType, attributes: []};
  headers.value.forEach((header, i) => {
    if (i === 0 || i === headers.value.length - 1) return;
    row.attributes.push({name: header, value: ''});
  });
  theseRows.value.push(row);
};

const deleteRow = (index) => {
  theseRows.value.splice(index, 1);
};

const deleteColumn = (index) => {
  theseRows.value.forEach((row) => {
    row.attributes.splice(row.attributes.findIndex(attr => attr.name === headers.value[index]), 1)
  });
  headers.value.splice(index, 1);
};

const updateColumnName = (event, index) => {
  if (index === headers.value.length - 1) return;
  const oldValue = headers.value[index];
  const newValue = event.target.value;
  if (headers.value.find((n) => n === newValue)) return;
  emits('columnUpdated', {old: oldValue, new: newValue, index: index});
};

const isCollapsed = ref((props?.depth ?? 0) >= 2);
const toggle = () => (isCollapsed.value = !isCollapsed.value);
</script>
<template>
  <div class="section-block ">
    <!-- section title -->
    <div>
      <span :class="[depth > 0 ? 'branch' : 'branch spacer']"></span>
      <span class="input-group-text text-start btn btn-lg ps-1 mt-2 section-title" @click="toggle()">
        <font-awesome-icon class="section-control"
                           :icon="'fa-caret-' + (isCollapsed ? 'right' : 'down')">        </font-awesome-icon>
        <span v-if="sectionType?.name" class="ms-2">{{ tableType }}</span>
        <span v-else>
          <input class="ms-2" @click.stop="" type="text" placeholder="Enter table name" v-model="tableType"/>
          <font-awesome-icon class="icon ps-2" role="button" size="sm" @click="$emit('delete')" @click.stop=""
                             icon="fa-trash"></font-awesome-icon>
        </span>
      </span>
    </div>
    <div class="ps-3" v-if="!isCollapsed" :key="refresh">
      <table class="table table-responsive">
        <thead>
        <draggable v-model="headers" tag="tr" :item-key="(key) => key" @end.stop="reorderColumns">
          <template #item="{ element: header, index: i }">
            <th :class="{ fixed: i === 0 || i === headers?.length - 1 || getFieldType(header)?.display==='required' }">
              <span class="form-control-sm" v-if="getFieldType(header)?.display==='required'">{{ header }}</span>
              <div v-else-if="i > 0 && i < headers.length - 1" class="input-group input-group-sm">
                <input type="text" class="form-control" :value="header" @change.stop="(e) => updateColumnName(e, i)">
                <button class="btn btn-outline-secondary icon" type="button"
                        v-if="getFieldType(header)?.display!=='required' ">
                  <font-awesome-icon class="fa-sm" icon="fa-trash" @click="deleteColumn(i)"></font-awesome-icon>
                </button>
              </div>
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
                <font-awesome-icon icon="fa-solid fa-grip-vertical"/>
              </td>
              <td v-for="(col, j) in [...headers].filter((v, i) => i > 0 && i < headers.length - 1 )" :key="j">
                <Attribute
                  :key="index"
                  :attribute="getCell(row, col)"
                  :field-type="getFieldType(getCell(row, col))"
                  :parent="row.attributes"
                  :isTableAttribute="true"
                  @deleteAttribute="(v) => emits('deleteAttribute', index)"
                />
              </td>
              <td class="grip">
                <font-awesome-icon class="fa-sm" role="button" icon="fa-trash"
                                   @click="deleteRow(index)"></font-awesome-icon>
              </td>
            </tr>
          </template>
        </draggable>
      </table>
      <div>
        <button class="btn btn-outline-secondary btn-sm" @click="addRow">
          Add Row
        </button>
        <button class="btn btn-outline-secondary btn-sm float-end" @click="addColumn">
          Add Column
        </button>
      </div>
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

th .form-control {
  font-weight: bold;
}

th:active {
  cursor: grabbing;
}
</style>
