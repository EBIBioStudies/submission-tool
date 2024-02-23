<script setup>
import { computed, ref } from 'vue';
import draggable from 'vuedraggable';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Attribute from '@/components/Attribute.vue';

const props = defineProps(['rows', 'depth', 'sectionType', 'sectionSubType', 'parent', 'startCollapsed']);
const emits = defineEmits([
  'rowsReordered',
  'columnUpdated',
  'columnsReordered',
  'delete',
  'deleteOrg',
  'createOrg'
]);
const thisSection = ref(props.rows);
const rowSectionType = props.rows && props.rows[0]?.type ? ('' + props.rows[0].type) : '';
const tableType = ref(props.sectionSubType ?? rowSectionType);
const theseRows = ref(Array.isArray(props.rows[0]) ? props.rows[0] : props.rows);
const headerMap = new Map();

if (tableType.value === 'Files') {
  headerMap.set('File', []);
} else if (tableType.value === 'Links') {
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
  let name = attribute?.type?.toLowerCase() === 'file' ? 'File' : attribute?.name || attribute;
  // override affiliation
  if (name==='affiliation') {
    let fieldType = props.sectionType?.columnTypes?.find((f) => f.name?.toLowerCase() === 'organisation');
    if (fieldType) return {...fieldType, ...{name:'Organisation'}};
  }
  name = attribute.hasOwnProperty('url') ? 'Link' : name;
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
    (tableType.value === 'Files' && col === 'File')
    || (tableType.value === 'Links' && col === 'Link'))) {
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

const addColumn = (event) => {
  const columnName = 'Column ' + (headers.value.length - 1);
  headers.value.splice(-1, 0, columnName);
  theseRows.value.forEach((row) => {
      if (!row.attributes) row.attributes = [];
      row.attributes.push({ name: columnName, value: '' });
    },
  );
};

const addRow = (event) => {
  const row = {};
  if (tableType.value === 'Files') {
    row.path = null;
    row.attributes = [];
    row.type = rowSectionType;
  } else if (tableType.value === 'Links') {
    row.url = '';
    row.attributes = [];
  } else {
    row.type = rowSectionType;
    row.attributes = [];
  }
  headers.value.forEach((header, i) => {
    if (i === 0 || i === headers.value.length - 1
      || ((tableType.value === 'Files' || tableType.value === 'Links') && i === 1))
      return;
    row.attributes.push({ name: header, value: '' });
  });
  theseRows.value.push(row);
};

const deleteRow = (index) => {
  theseRows.value.splice(index, 1);
};

const deleteColumn = (index) => {
  theseRows.value.forEach((row) => {
    row.attributes.splice(row.attributes.findIndex(attr => attr.name === headers.value[index]), 1);
  });
  headers.value.splice(index, 1);
};

const updateColumnName = (event, index) => {
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
        <span v-if="sectionType?.name || props.sectionSubType ==='Files' || props.sectionSubType==='Links'" :data-bs-title="sectionType?.description"
              :data-bs-toggle="sectionType?.description ? 'tooltip' : false" class="ms-2"
              data-bs-html="true"><font-awesome-icon v-if="sectionType?.icon" :icon="sectionType?.icon"
                                                                           class="icon" />{{ tableType }}</span>
        <span v-else>
          <input v-model="tableType" class="ms-2" placeholder="Enter table name" type="text" @click.stop="" />
          <font-awesome-icon class="icon ps-2" icon="fa-trash" role="button" size="sm" @click="$emit('delete')"
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
                  <font-awesome-icon v-if="getFieldType(header)?.display!=='required'" role="button" @click.prevent="deleteColumn(i)" class="icon fa-sm"
                                     icon="fa-trash"></font-awesome-icon>
                </template>
                <template v-else>
                  <input ref="headerComponent" :value="header" class="form-control" type="text"
                       @change.stop="(e) => updateColumnName(e, i)">
                  <button v-if="getFieldType(header)?.display!=='required'"  class="btn btn-outline-secondary icon" type="button" @click.prevent="deleteColumn(i)">
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
                           :field-type="getFieldType(getCell(row, col))"
                           :isTableAttribute="true"
                           :parent="row.attributes"
                           @deleteAttribute="(v) => emits('deleteAttribute', index)"
                           @deleteOrg="(v) => emits('deleteOrg', {...v,...{'authorIndex':index}})"
                           @createOrg="(v) => emits('createOrg', {...v,...{'authorIndex':index}})"
                />
              </td>
              <td class="grip">
                <font-awesome-icon v-if="!(index===0 && sectionType?.display==='required' )" class="fa-sm" icon="fa-trash" role="button"
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
