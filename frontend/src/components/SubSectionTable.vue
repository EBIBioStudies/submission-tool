<script setup>
import {computed, inject, ref} from 'vue';
import draggable from 'vuedraggable';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Attribute from '@/components/Attribute.vue';

const props = defineProps(['rows', 'depth', 'sectionType', 'sectionSubType', 'parent', 'startCollapsed', 'title']);
const emits = defineEmits([
  'rowAdded',
  'rowsReordered',
  'columnUpdated',
  'columnsReordered',
  'delete',
  'deleteRow',
  'deleteOrg',
  'createOrg'
]);
const thisSection = ref(props.rows);
const rowSectionType = props.rows && props.rows[0]?.type ? ('' + props.rows[0].type) : '';
const tableType = ref(props.title || props.sectionSubType || rowSectionType);
const theseRows = ref(Array.isArray(props.rows[0]) ? props.rows[0] : props.rows);
const headerMap = new Map();
const parentDisplayType = inject('parentDisplayType')
const subSections = ref(props?.parent?.subsections)

if (tableType.value === 'File') {
  headerMap.set('File', []);
} else if (tableType.value === 'Link') {
  headerMap.set('Link', []);
}
theseRows?.value?.forEach((row) => {
    row?.attributes?.forEach((attr) => {
      if (!headerMap.has(attr.name)) headerMap.set(attr.name, []);
      headerMap.get(attr.name).push(attr);
    });
  },
);
const keys = ['', ...headerMap.keys(), ''];
const headers = ref(keys);
const refresh = ref(0);

const getFieldType = (attribute) => {
  let name = attribute?.type?.toLowerCase() === 'file' || attribute.hasOwnProperty('path') ? 'File' : attribute?.name || attribute;
  // override affiliation
  if (name==='affiliation') {
    let fieldType = props.sectionType?.columnTypes?.find((f) => f.name?.toLowerCase() === 'organisation');
    if (fieldType) return {...fieldType, ...{name:'Organisation'}};
  }
  name = attribute.hasOwnProperty('url') || attribute.name==='url'  ? 'Link' : name;
  // return the column type. Expects either an object or a column name (for use in draggable)
  let fieldType = props.sectionType?.columnTypes?.find((f) => f.name?.toLowerCase() === name?.toLowerCase());
  if (fieldType) return fieldType;
  if (!fieldType && name) {
    fieldType = {
      'name': name,
      'createdOnRender' : true,
      'controlType': {
        'name': name?.toLowerCase(),
      },
    };
  }
  return fieldType;
};


// Add all column to the first row. We will use it to control column dragging
const getCell = (row, col) => {
  let attribute = row?.attributes?.find(
    (att) => att?.name?.toLowerCase() === col?.toLowerCase(),
  );
  if (!attribute && (
    (tableType.value === 'File' && col === 'File')
    || (tableType.value === 'Link' && col === 'Link'))) {
    return row;
  }
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
  emits('columnsReordered');
};

const areObjectsEqual = (obj1, obj2) => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}


const addColumn = (event) => {
  if(parentDisplayType.value === 'readonly')
    return;
  const columnName = 'Column ' + (headers.value.length - 1);
  headers.value.splice(-1, 0, columnName);
  const rows = subSections.value.filter(item => item?.type?.toLowerCase() === tableType.value.toLowerCase());
  rows.forEach((row) => {
      if (!row.attributes) row.attributes = [];
      row.attributes.push({ name: columnName, value: '' });
    },
  );
  theseRows.value = rows;
};

const addRow = (event) => {
  if(parentDisplayType.value === 'readonly')
    return;
  const row = {};
  row.type=rowSectionType;
  if (tableType.value === 'File') {
    row.path = null;
    row.attributes = [];
  } else if (tableType.value === 'Link') {
    row.url = '';
    row.attributes = [];
  } else {
    row.attributes = [];
  }
  headers.value.forEach((header, i) => {
    if ((i === 0 || i === headers.value.length - 1) || ((tableType.value === 'File' || tableType.value === 'Link') && i === 1))
      return;
    row.attributes.push({ name: header, value: '' });
  });
  subSections.value.push(row);
  const rows = subSections.value.filter(item => item?.type?.toLowerCase() === tableType.value.toLowerCase());
  theseRows.value = rows;
  // emits('rowAdded', row); // Needed only for Authors component
};

const deleteRow = (index) => {
  if(parentDisplayType.value === 'readonly')
    return;
  const removedItem = theseRows.value[index];
  const delIndex = subSections.value.findIndex(item => areObjectsEqual(item, removedItem));
  if(delIndex!=-1)
    subSections.value.splice(delIndex, 1);
  const rows = subSections.value.filter(item => item?.type?.toLowerCase() === tableType.value.toLowerCase());
  theseRows.value = rows;
  // emits('deleteRow', index); // Needed only for Authors component
};

const deleteColumn = (index) => {
  if(parentDisplayType.value === 'readonly')
    return;
  theseRows.value.forEach((row) => {
    row.attributes.splice(row.attributes.findIndex(attr => attr.name === headers.value[index]), 1);
  });
  headers.value.splice(index, 1);
};

const updateColumnName = (event, index) => {
  if(parentDisplayType.value === 'readonly')
    return;
  if (index === headers.value.length - 1) return;
  const oldValue = headers.value[index];
  const newValue = event.target.value;
  if (headers.value.find((n) => n === newValue)) return;
  emits('columnUpdated', { old: oldValue, new: newValue, index: index });
};

const isCollapsed = ref((props?.depth ?? 0) >= 2 || props.startCollapsed);
const toggle = () => (isCollapsed.value = !isCollapsed.value);

const attributeRefs = ref([]);
const headerComponent = ref([]);

const errors = computed(() => {
  const _errors = [];
  attributeRefs?.value.forEach((a) => {
    const err = a.errors;
    if (err) _errors.push({ errorMessage: err, control: a, element: document.getElementById(a.attributeId) });
  });
  return _errors;
});

defineExpose({ errors, thisSection });

</script>
<template>
  <div class="section-block">
    <!-- section table title -->
    <div>
      <span :class="[depth > 0  ? 'branch' : 'branch spacer']"></span> <span
      class="input-group-text text-start btn btn-lg ps-1 mt-2 section-title" @click="toggle()">
        <font-awesome-icon :icon="'fa-caret-' + (isCollapsed ? 'right' : 'down')" class="section-control" />
        <span v-if="props.sectionSubType==='Funding' || props.sectionSubType==='Publication'" :data-bs-title="sectionType?.description"
              :data-bs-toggle="sectionType?.description ? 'tooltip' : false" class="ms-2"
              data-bs-html="true"><font-awesome-icon v-if="sectionType?.icon" :icon="sectionType?.icon"
                                                     class="icon" />{{ tableType }}</span>
        <span v-else>
          <input v-model="tableType" class="ms-2" placeholder="Enter table name" type="text" @click.stop="" />
          <font-awesome-icon v-if="parentDisplayType!=='readonly'" class="icon ps-2" icon="fa-trash" role="button" size="sm" @click="$emit('delete')"
                             @click.stop=""></font-awesome-icon>
        </span>
      </span>
    </div>
    <div v-if="!isCollapsed" :key="refresh" class="ps-3">
      <table class="table table-responsive">
        <thead>
        <draggable v-model="headers" :item-key="(key) => key" tag="tr" @end.stop="reorderColumns">
          <template #item="{ element: header, index: i }">
            <th :class="{ fixed: i === 0 || i === headers?.length - 1  }">
              <div v-if="i > 0 && i < headers.length - 1" class="input-group input-group-sm align-items-center">
                <template v-if="!getFieldType(header)?.createdOnRender">
                  <span class="form-control-sm">{{ getFieldType(header).name }}</span>
                  <font-awesome-icon v-if="getFieldType(header)?.display!=='required' && parentDisplayType!=='readonly'" role="button" @click.prevent="deleteColumn(i)" class="icon fa-sm"
                                     icon="fa-trash"></font-awesome-icon>
                </template>
                <template v-else>
                  <input ref="headerComponent" :value="header" class="form-control" :disabled="parentDisplayType==='readonly'" type="text"
                         @change.stop="(e) => updateColumnName(e, i)">
                  <button v-if="getFieldType(header)?.display!=='required' && parentDisplayType!=='readonly'"  class="btn btn-outline-secondary icon" type="button" @click.prevent="deleteColumn(i)">
                    <font-awesome-icon class="fa-sm" icon="fa-trash"></font-awesome-icon>
                  </button>
                </template>
              </div>
            </th>
          </template>
        </draggable>
        </thead>
        <draggable v-model="theseRows" item-key="name" tag="tbody" @end="(e) => emits('rowsReordered', e)">
          <template #item="{ element: row, index: index }">
            <tr>
              <td class="grip">
                <font-awesome-icon icon="fa-solid fa-grip-vertical" />
              </td>
              <td v-for="(col, j) in [...headers].filter((v, i) => i > 0 && i < headers.length - 1 )" :key="j">
                <Attribute :key="index"
                           ref="attributeRefs"
                           :attribute="getCell(row, col)"
                           :row="row"
                           :field-type="getFieldType(getCell(row, col))"
                           :isTableAttribute="true"
                           :parent="row.attributes"
                           @deleteAttribute="(v) => emits('deleteAttribute', index)"
                           @deleteOrg="(v) => emits('deleteOrg', {...v,...{'authorIndex':index}})"
                           @createOrg="(v) => emits('createOrg', {...v,...{'authorIndex':index}})"
                />
              </td>
              <td class="grip">
                <font-awesome-icon v-if="!(index===0 && sectionType?.display==='required' ) && parentDisplayType!=='readonly'" class="fa-sm" icon="fa-trash" role="button"
                                   @click="deleteRow(index)"></font-awesome-icon>
              </td>
            </tr>
          </template>
        </draggable>
      </table>
      <div v-if="parentDisplayType!=='readonly'">
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
