<script setup>
import { computed, inject, ref, nextTick } from 'vue';
import draggable from 'vuedraggable';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Attribute from '@/components/Attribute.vue';
import utils from "@/utils";
import EditableLabel from "@/components/EditableLabel.vue";
import Multiselect from '@vueform/multiselect';



const props = defineProps(['rows', 'depth', 'sectionType', 'sectionSubType', 'parent', 'startCollapsed', 'title']);
const emits = defineEmits([
  'rowAdded',
  'rowsReordered',
  'columnUpdated',
  'columnsReordered',
  'delete',
  'deleteRow',
  'deleteOrg',
  'createOrg',
  'refreshSection'
]);

const thisSection = ref(props.rows);
const rowSectionType = props.rows && props.rows[0]?.type ? ('' + props.rows[0].type) : '';
const tableType = ref(props.title || props.sectionSubType || rowSectionType);
const theseRows = ref(props.rows);
const headerMap = new Map();
const parentDisplayType = inject('parentDisplayType');
const sectionsRefreshKey = ref(0);
const columnTypes = props?.sectionType?.columnTypes || [];
const requiredColumnsArr = columnTypes.filter(item => item.display !== "required").map(item => item.name);

const hideNonRequiredColumns = props?.sectionType?.hideColumns || false;

if (tableType.value === 'File') {
  headerMap.set('File', []);
} else if (tableType.value === 'Link') {
  headerMap.set('Link', []);
}

theseRows.value.forEach((row) => {
  row?.attributes?.forEach((attr) => {
    if (!headerMap.has(attr.name)) headerMap.set(attr.name, []);
    headerMap.get(attr.name).push(attr);
  });
});
const keys = ['', ...headerMap.keys(), ''];
const headers = ref(keys);
const refresh = ref(0);

const getFieldType = (attribute) => {
  let name = attribute?.type?.toLowerCase() === 'file' || attribute.hasOwnProperty('path') ? 'File' : attribute?.name || attribute;
  if (name === 'affiliation') {
    let fieldType = props.sectionType?.columnTypes?.find((f) => f.name?.toLowerCase() === 'organisation');
    if (fieldType) return { ...fieldType, ...{ name: 'Organisation' } };
  }
  name = attribute.hasOwnProperty('url') || attribute.name === 'url' ? 'Link' : name;
  let fieldType = props.sectionType?.columnTypes?.find((f) => (typeof f?.name === 'string') && (typeof name === 'string') && (f?.name?.toLowerCase() === name?.toLowerCase()));
  if (fieldType) return fieldType;
  if (!fieldType && name && typeof name==='string') {
    fieldType = {
      'name': name,
      'createdOnRender': true,
      'controlType': {
        'name': name?.toLowerCase(),
      },
    };
  }else{
    return ""
  }
  return fieldType;
};

const getCell = (row, col) => {
  let attribute = row?.attributes?.find(
    (att) => (typeof  col === "string") && (typeof att?.name === 'string') && (att?.name?.toLowerCase() === col?.toLowerCase()),
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

const addColumn = (event) => {
  if (parentDisplayType.value === 'readonly') return;
  const columnName = 'Column ' + (headers.value.length - 1);
  headers.value.splice(-1, 0, columnName);
  theseRows.value.forEach((row) => {
    if (!row.attributes) row.attributes = [];
    row.attributes.push({ name: columnName, value: '' });
  });
};

const addRow = (event) => {
  if (parentDisplayType.value === 'readonly') return;
  const row = {};
  row.type = rowSectionType;
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
    if ((i === 0 || i === headers.value.length - 1) || ((tableType.value === 'File' || tableType.value === 'Link') && i === 1)) return;
    row.attributes.push({ name: header, value: '' });
  });
  theseRows.value.push(row);
  emits('rowAdded', row);
};

const deleteRow = async (index) => {
  if (parentDisplayType.value === 'readonly') return;
  theseRows.value.splice(index, 1);

  if (theseRows.value.length === 0) {
    emits('refreshSection');  // Let Section.vue handle cleanup
  }else{
    sectionsRefreshKey.value += 1;
    await nextTick();
    emits('deleteRow', index);
  }
};

const deleteColumn = (index) => {
  if (parentDisplayType.value === 'readonly') return;
  theseRows.value.forEach((row) => {
    row.attributes.splice(row.attributes.findIndex(attr => attr.name === headers.value[index]), 1);
  });
  headers.value.splice(index, 1);
  sectionsRefreshKey.value += 1;
};

const updateColumnName = ( value, index) => {
  if(!value)
    value = " "
  if (parentDisplayType.value === 'readonly') return;
  if (index === headers.value.length - 1) return;
  const oldValue = headers.value[index];
  const newValue = value;
  if(newValue?.toLowerCase() === 'organisation' && headers.value.some(head => head?.toLowerCase() === 'affiliation')) return;
  if (headers.value.find((n) => n === newValue)) return;
  emits('columnUpdated', { old: oldValue, new: newValue, index: index });
};

const isCollapsed = ref(
  props.startCollapsed === undefined
    ? (props?.depth ?? 0) >= 2
    : props.startCollapsed);
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

const showHelp = (header) => {
  if (!header) return; // Ensure header is defined to avoid runtime errors

  utils.confirm(
    header?.name || "Help",
    `<p>${header?.helpContextual?.description || "No description available."}</p>` +
    (header?.helpContextual?.examples?.length
      ? `<p><h6>Examples:</h6><i>${header.helpContextual.examples.join('</i></p><p><i>')}</i></p>`
      : ""),
    "Close",
    true,
    false
  );
};


defineExpose({ errors, thisSection });

</script>

<template>
  <div class="section-block">
    <!-- section table title -->
    <div>
      <span :class="[depth > 0 ? 'branch' : 'branch spacer']"></span>
      <span class="input-group-text text-start btn btn-lg ps-1 mt-2 section-title" @click="toggle()">
        <font-awesome-icon :icon="'fa-caret-' + (isCollapsed ? 'right' : 'down')" class="section-control" />
        <span v-if="sectionType?.name || props.sectionSubType === 'File' || props.sectionSubType === 'Link'" :data-bs-title="sectionType?.description"
              :data-bs-toggle="sectionType?.description ? 'tooltip' : false" class="ms-2"
              data-bs-html="true"><font-awesome-icon v-if="sectionType?.icon" :icon="sectionType?.icon"
                                                     class="icon" />{{ tableType }}</span>
        <span v-else>
<!--          <input v-model="props.rows[0].type" class="ms-2" placeholder="Enter table name" type="text" @click.stop="" />-->
          <EditableLabel :data="props.rows[0]" class="ms-2" placeholder="Enter table name"  :isEditable="true"  />
          <font-awesome-icon v-if="parentDisplayType !== 'readonly'" class="icon ps-2" icon="fa-trash" role="button" size="sm" @click="$emit('delete')"
                             @click.stop=""></font-awesome-icon>
        </span>
      </span>
    </div>
    <div v-if="!isCollapsed" :key="sectionsRefreshKey" class="ps-3">
      <div :class="{ 'table-container': tableType === 'Contacts' }">
        <table class="table table-responsive">
          <thead>
          <draggable v-model="headers" :item-key="(key) => key" tag="tr" @end.stop="reorderColumns" :disabled="true">
            <template #item="{ element: header, index: i }">
              <th :class="{ fixed: i === 0 || i === headers?.length - 1 }">
                <div v-if="i > 0 && i < headers.length - 1" class="input-group input-group-sm align-items-center">
                  <template v-if="!getFieldType(header)?.createdOnRender">
                      <label class="input-group-text " >
  <!--                      <font-awesome-icon-->
  <!--                        v-if="getFieldType(header)?.icon"-->
  <!--                        class="icon"-->
  <!--                        :icon="getFieldType(header)?.icon"-->
  <!--                      ></font-awesome-icon>-->
  <!--                      <font-awesome-icon-->
  <!--                        v-else-->
  <!--                        class="icon"-->
  <!--                        inverse-->
  <!--                        icon="fa-check"-->
  <!--                      ></font-awesome-icon>-->
                        <span class="form-control-sm">{{ getFieldType(header).name }}
                          <span class="text-danger"
                                v-if="getFieldType(header)?.display==='required' || getFieldType(header)?.controlType?.minlength >0">*</span>
                        </span>
                        <font-awesome-icon v-if="getFieldType(header)?.helpContextual" :icon="['fas','circle-question']"
                                           class="text-black-50 ps-1 small"
                                           role="button" @click="showHelp(getFieldType(header))"/>

                    <font-awesome-icon v-if="getFieldType(header)?.display !== 'required' && parentDisplayType !== 'readonly' && hideNonRequiredColumns" role="button" @click.prevent="deleteColumn(i)" class="icon fa-sm"
                                       icon="fa-trash"></font-awesome-icon>
                      </label>
                  </template>
                  <template v-else-if="header?.toLowerCase()!=='type' || tableType!=='Link'">
                    <div class="input-group-text">
                      <input v-if="!hideNonRequiredColumns" ref="headerComponent" :value="header" class="form-control" :disabled="parentDisplayType === 'readonly'" type="text"
                             @change.stop="(e) => updateColumnName( e.target.value, i)">

                      <Multiselect v-else
                        ref="headerComponent"
                        :allow-absent="true"
                        label="value"
                        :value="header"
                        class="form-control"
                        :searchable="true"
                        :options="requiredColumnsArr"
                        :disabled="parentDisplayType==='readonly' "
                        :allow-empty="false"
                        :append-to-body="true"
                        :create-option="true"
                        @input="updateColumnName( $event, i)"
                        @remove="updateColumnName( $event, i)"
                      />
                      <button v-if="getFieldType(header)?.display !== 'required' && parentDisplayType !== 'readonly'" class="btn btn-outline-secondary icon" type="button" @click.prevent="deleteColumn(i)">
                        <font-awesome-icon class="fa-sm" icon="fa-trash"></font-awesome-icon>
                      </button>
                    </div>
                  </template>
                </div>
              </th>
            </template>
          </draggable>
          </thead>
          <draggable :disabled="true" v-model="theseRows" item-key="name" tag="tbody" @end="(e) => emits('rowsReordered', e)">
            <template #item="{ element: row, index: index }">
              <tr>
                <td class="grip">
                  <font-awesome-icon icon="fa-solid fa-grip-vertical" />
                </td>
                <td v-for="(col, j) in [...headers].filter((v, i) => i > 0 && i < headers.length - 1 )" :key="j">
                  <Attribute v-if="tableType!=='Link' || col?.toLowerCase()!=='type'" :key="index"
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
                  <font-awesome-icon v-if="!(index === 0 && sectionType?.display === 'required') && parentDisplayType !== 'readonly'" class="fa-sm" icon="fa-trash" role="button"
                                     @click="deleteRow(index)"></font-awesome-icon>
                </td>
              </tr>
            </template>
          </draggable>
        </table>
      </div>
      <div v-if="parentDisplayType !== 'readonly'">
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

th .form-control {
  font-weight: bold;
}

th:active {
  cursor: grabbing;
}


.table-container {
  width: 100%; /* Set your desired fixed width */
  overflow-x: scroll; /* Add horizontal scrollbar when content overflows */
  overflow-y: visible;
  white-space: nowrap; /* Prevent content from wrapping to the next line */
  display: flex;
}

.table-container table {
  flex: none; /* Prevents the table from shrinking */
  min-width: 100%; /* Ensures the table takes at least the full width of the container */
}



</style>
