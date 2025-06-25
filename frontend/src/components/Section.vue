<script setup>
import {computed, getCurrentInstance, nextTick, ref, inject, provide, onMounted, onUnmounted} from 'vue';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import Attributes from '@/components/Attributes.vue';
import SectionTable from '@/components/SectionTable.vue';
import SubsectionMenu from "@/components/SubsectionMenu.vue";
import {fillTemplate} from "@/templates/templates";
import utils from "@/utils";
import SubSectionTable from "@/components/SubSectionTable.vue";
import EditableLabel from "@/components/EditableLabel.vue";
import Authors from "@/components/Authors.vue";
import { Tooltip } from 'bootstrap';
import logger from "@fortawesome/vue-fontawesome/src/logger.js";



const props = defineProps(['section', 'sectionType', 'depth', 'sectionTypeMap']);
const emits = defineEmits(['delete', 'addTable']);

const componentInstance = getCurrentInstance();

const attributesComponent = ref(null);

const subsectionsRef = ref(null)
const sectionTablesRef = ref(null)
const sectionFilesRef = ref(null)
const sectionLinksRef = ref(null)
const parentDisplayType = inject('parentDisplayType')
const isPublicSubmission = inject('isPublicSubmission')
const errSecRefs = ref([])
const errSecTableRefs = ref([])
const errSpecialSecTableRefs = ref([])
const authorComponent = ref(null)



const thisSection = ref(props.section);
const deleteTag = (msg) => deleteAttribute(msg.index);
// if (props?.sectionType?.display) {
//   provide('parentDisplayType', props?.sectionType?.display)
// }
// hack: variable to trigger re-rendering of attributes when needed
// TODO: figure out how to avoid this
const attributesRefreshKey = ref(0);
const sectionsRefreshKey = ref(0);

const subSectionTypeMap = props.sectionTypeMap ? props.sectionTypeMap : new Map();
props?.sectionType?.tableTypes?.forEach(
  (tbType) => {
    if(tbType && tbType.name)
      subSectionTypeMap.set(tbType?.name?.toLowerCase(), tbType)
  }
);

onMounted(() => {
  nextTick(() => {
    const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipElements.forEach((el) => {
      // Dispose of any existing tooltip instance first (optional)
      const instance = Tooltip.getInstance(el);
      if (instance) instance.dispose();
      new Tooltip(el, {delay: {hide: 300}, trigger: 'hover'});
    });
  });
});

const renderedRowSections = new Set();
const getSectionsWithRowsAsSections = (type) => {
  renderedRowSections.add(type?.toLowerCase());
  const combined = thisSection?.value?.subsections?.filter(s => s?.type?.toLowerCase() === type.toLowerCase() && subSectionTypeMap.get(type.toLowerCase())?.rowAsSection)
  return combined
}

const specialSectionMap = computed(() => {
  const curMap = new Map();
  props?.sectionType?.tableTypes?.forEach(
    (tbType) => {
      const combined = getSectionsWithRowsAsSections(tbType.name);
      if (combined?.length > 0) {
        curMap.set(tbType.name, combined);
      }
    }
  );
  return curMap;
})


props.section?.subsections?.forEach((s) => {
  const subsection = Array.isArray(s) ? s[0] : s;
  const typeName = subsection?.type?.toLowerCase() === 'author' ? 'contact' : subsection?.type?.toLowerCase();
  const subsections = [
    ...(props.sectionType?.sectionTypes ?? []),
    ...(props.sectionType?.tableTypes ?? []),
  ];
  const type = subsections.find(
    (f) => f?.name?.toLowerCase() === typeName,
  );
  subSectionTypeMap.set(s?.type?.toLowerCase(), type)
});

const isCollapsed = ref((props?.depth ?? 0) >= 2);

// children are not allowed to change properties of a parent
// all section/attributes updates thus need to be at this level
const addSubsection = async (aSection, i, type) => {
  if(parentDisplayType.value === 'readonly')
    return;
  aSection.subsections = aSection.subsections || [];
  const obj = {}
  if (type != null)
    fillTemplate(obj, type)
  else {
    obj.accno = (props.section.accno ?? Date.now()) + '-' + (props.section.subsections.length + 1);
    obj.type = '';
    // obj.attributes = [{name: '', value: ''}];
  }
  obj.accno = String(obj.accno) + "-removable";

  // aSection.subsections.splice(i, 0, obj);
  aSection.subsections.push(obj)

  sectionsRefreshKey.value += 1

  // wait till the UI is updated and the focus the first attribute name
  await nextTick();
  const added = [...componentInstance?.refs?.sectionTablesRef || [], ...componentInstance?.refs?.subsectionsRef || []]?.pop();
  added.scrollIntoView();
  added.querySelector('input')?.focus();
  // Expand section if collapsed
  if (added.querySelector('.section-block')?.classList.contains('collapsed'))
    added.querySelector('.section-title').click();

};

const findLastInput = (item) => {
  let added = item && typeof item.querySelector === 'function' ? item : added?.$el;
  return added?.querySelector('input');
  // const lastInput = inputs && inputs.length > 1 ? inputs[inputs.length - 2] : inputs[0];
}

const findAddedSection = (type) => {
  let added;
  if(type === 'Link')
    added = componentInstance?.refs?.sectionLinksRef
  else if(type === 'File')
    added = componentInstance?.refs?.sectionFilesRef
  else if(type=='Contact')
    added = componentInstance?.refs?.authorComponent
  if(added) {
    return added.$el;
  }
  if(type)
    added = [...componentInstance?.refs?.sectionTablesRef || [], ...componentInstance?.refs?.subsectionsRef || []]?.filter(item => item?.innerText?.includes(type))?.pop()
  else
    added = [...componentInstance?.refs?.sectionTablesRef || [], ...componentInstance?.refs?.subsectionsRef || []]?.pop()

  return added;
}

const addTable = async (aSection, i, type) => {
  // if (type?.name?.toLowerCase()==='contact')
  //   authorComponent.add
  //   return
  if(parentDisplayType.value === 'readonly')
    return;
  aSection.subsections = aSection.subsections || [];
  let obj = {}
  if (type != null)
    fillTemplate(obj, type)
  else {
    obj.accno = (props.section.accno ?? Date.now()) + '-' + (props.section.subsections.length + 1);
    obj.type = 'Table';
    obj.attributes = [{name: 'Column 1', value: ''}];
  }
  obj.accno = String(obj.accno) + "-removable";
  if(type?.name === 'Link')
    aSection.links ? aSection.links.push(obj) : aSection.links = [obj]
  else if(type?.name === 'File')
    aSection.files ?  aSection.files.push(obj) : aSection.files = [obj]
  else {
    if(type?.name === 'Contact'){
      obj.type='Author'
      obj?.attributes?.forEach(attribute => {
        if (attribute.name === 'Organisation') {
          attribute.name = 'affiliation';
        }
      });
    }
    type ? aSection.subsections.push(obj) : aSection.subsections.push([obj])
  }

  // obj = (type?.name !== 'Publication' && type?.name !== 'Funding') ? [obj] : obj;
  // aSection.subsections.splice(i, 0, obj);

  sectionsRefreshKey.value += 1

  // wait till the UI is updated and the focus the first attribute name
  await nextTick();
  const added = findAddedSection(type?.name);
    //[...componentInstance.refs.sectionsComponent][0]
  added?.scrollIntoView();
  findLastInput(added)?.focus();

  // Expand section if collapsed
  if (added?.querySelector('.section-block')?.classList.contains('collapsed'))
    added?.querySelector('.section-title').click();

};

const deleteSubSection = async (someSubSections, index) => {
  if(parentDisplayType.value === 'readonly')
    return;
  if (!await utils.confirm("Delete Section", `Do you want to delete the section ${someSubSections[index].type}?`, "Delete")) return
  thisSection.value.subsections = someSubSections.filter((v, i) => i !== index);
  sectionsRefreshKey.value += 1;
};
const refreshSection = async () => {
  sectionsRefreshKey.value += 1;
}

const addAttribute = async () => {
  if(parentDisplayType.value === 'readonly')
    return;
  thisSection.value.attributes = thisSection.value.attributes || [];
  thisSection.value.attributes.push({name: '', value: ''});
  attributesRefreshKey.value += 1;
  await nextTick();
  const added = [...componentInstance.refs.attributesComponent.$.ctx.$el.querySelectorAll('.attribute-name')].pop();
  added.scrollIntoView();
  added.focus();
};

const deleteAttribute = async (index) => {
  if(parentDisplayType.value === 'readonly')
    return;
  thisSection.value.attributes.splice(index, 1);
  attributesRefreshKey.value += 1;
};

const createTag = (msg) => {
  if(parentDisplayType.value === 'readonly')
    return;
  thisSection.value.attributes = thisSection.value.attributes || [];
  // insert next to the last attribute with the same name
  // just to keep the structure cleaner
  let lastIndex = thisSection.value.attributes
    .map((a) => a.name)
    .lastIndexOf(msg.name);
  lastIndex =
    lastIndex === -1 ? thisSection.value.attributes.length : lastIndex;

  // fill in the value if it's the last tag -- add a new one otherwise
  if (thisSection.value.attributes[lastIndex].value === '') {
    thisSection.value.attributes[lastIndex].value = msg.value;
  } else {
    thisSection.value.attributes.splice(lastIndex + 1, 0, {
      name: msg.name,
      value: msg.value,
    });
  }
  attributesRefreshKey.value += 1;
};

const rowsReordered = (event, rows) => {
  if(parentDisplayType.value === 'readonly')
    return;
  rows.splice(event.newIndex, 0, rows.splice(event.oldIndex, 1)[0]);
  sectionsRefreshKey.value += 1;
};

const updateColumnName = (subsection, update) => {
  if(parentDisplayType.value === 'readonly')
    return;
  subsection.forEach(
    (row) =>
      (row.attributes.find((att) => att.name === update.old).name = update.new),
  );
  sectionsRefreshKey.value += 1;
};



const canRender = (sec) => {
  return ['author', 'organisation', 'organization'].indexOf(sec?.type?.toLowerCase()) < 0;
}

const errors = computed(() => {
  let _errors = [...authorComponent.value?.errors??[], ...attributesComponent.value?.errors]
  if (sectionFilesRef) {
    _errors = [..._errors, ...sectionFilesRef?.value?.errors ?? []]
  }
  if (sectionLinksRef) {
    _errors = [..._errors, ...sectionLinksRef?.value?.errors ?? []]
  }
  // validate subsections
  errSpecialSecTableRefs?.value?.forEach(subsec => {
     if (!canRender(subsec.thisSection)) return
     _errors = [..._errors, ...subsec?.errors]
  });
  errSecRefs?.value?.forEach(subsec => {
    if (!canRender(subsec.thisSection)) return
    _errors = [..._errors, ...subsec?.errors]
  });
  errSecTableRefs?.value?.forEach(subsec => {
    if (!canRender(subsec.thisSection)) return
    _errors = [..._errors, ...subsec?.errors]
  });

  return _errors
});
// const log = (...args) => {
//   console.log(...args);
//   return '';
// };

defineExpose({errors, thisSection});
</script>

<template>

  <div v-if="canRender(props.section)" class="section-block pb-2" :class="{ collapsed: isCollapsed }">
    <div v-if="section?.type==='Study'" :key="sectionsRefreshKey">
      <Authors v-if="section" :section="section" :sectionType="sectionType?.tableTypes?.find( (s) => s.name.toLowerCase() === 'contact')" ref="authorComponent"/>
    </div>
    <!-- section title -->
    <div class="align-text-bottom">
      <span class="col" :class="[depth > 0 ? 'branch' : 'branch spacer']"></span>
      <span
        class="input-group-text text-start btn btn-lg ps-1 mt-2 section-title"
        @click="isCollapsed = !isCollapsed">
        <font-awesome-icon
          class="section-control"
          :icon="'fa-caret-' + (isCollapsed ? 'right' : 'down')"
        ></font-awesome-icon>
        <span v-if="typeof  props.sectionType !== 'string' || subSectionTypeMap.has(props.sectionType?.toLowerCase()) " class="ms-2"
              :data-bs-toggle="sectionType?.description ? 'tooltip' : false" data-bs-html="true"
              :data-bs-title="sectionType?.description"><font-awesome-icon
          v-if="props.sectionType?.icon" class="icon" :icon="props.sectionType?.icon"/>{{ section.type }}</span>
        <span v-else>
          <EditableLabel
            class="ms-2"
            @click.stop=""
            type="text"
            placeholder="Enter section type"
            :is-editable="true"
            :data="thisSection"/>
        </span>
      </span>
      <span v-if="(sectionType?.display!=='required' || thisSection?.accno?.includes('-removable')) && parentDisplayType!=='readonly' && sectionType?.name!=='Study' && !isPublicSubmission?.value" class="mt-2 btn btn-sm btn-delete" role="button">
        <font-awesome-icon
          role="button"
          @click="$emit('delete')"
          @click.stop=""
          icon="fa-trash"
        ></font-awesome-icon>
      </span>
      <span v-if="depth===0" class="float-end text-secondary" style="font-size: 8pt; padding-top:35px">* Required</span>
    </div>
    <!-- section content -->
    <transition name="slide">
      <div :class="{'visually-hidden': isCollapsed}">
        <div class="has-child-section ms-3 slide-in">

          <!-- attributes -->
          <Attributes
            :key="attributesRefreshKey"
            ref="attributesComponent"
            :attributes="section.attributes"
            :fieldTypes="sectionType?.fieldTypes || sectionType?.columnTypes"
            :isSectionAttribute="subSectionTypeMap.get(sectionType?.name?.toLowerCase())?.rowAsSection==false ? true : false"
            @deleteAttribute="deleteAttribute"
            @createTag="createTag"
            @deleteTag="deleteTag"
            @newAttribute="addAttribute"
          />




          <div class="p-0" :key="sectionsRefreshKey">
            <!-- Files -->
            <SectionTable
              v-if="section.files && section.files?.length > 0"
              :rows="section.files"
              :depth="props.depth+1"
              :sectionType="subSectionTypeMap.get('file')"
              sectionSubType="File"
              @rowsReordered="(e) => rowsReordered(e, section.files)"
              @columnUpdated="(msg) => updateColumnName(section.files, msg)"
              @columnsReordered="(msg) => sectionsRefreshKey+= 1"
              @delete="deleteSubSection(section.files, 0)"
              @refreshSection="refreshSection()"
              ref="sectionFilesRef"
            />

            <!-- Links -->
            <SectionTable
              v-if="section.links && section.links?.length>0"
              :rows="section.links"
              :depth="props.depth+1"
              :sectionType="subSectionTypeMap.get('link')"
              sectionSubType="Link"
              @rowsReordered="(e) => rowsReordered(e, section.links)"
              @columnUpdated="(msg) => updateColumnName(section.links, msg)"
              @columnsReordered="(msg) => sectionsRefreshKey+= 1"
              @delete="deleteSubSection(section.links, 0)"
              @refreshSection="refreshSection()"
              ref="sectionLinksRef"
            />
<!--            render special sections in the computed specialSectionMap -->
            <div v-for="(item, index) in specialSectionMap" :key="index" ref="sectionTablesRef">
              <SubSectionTable
                v-if="Array.isArray(item[1]) && item[1]?.length > 0"
                :rows="item[1]"
                :depth="props.depth+1"
                :sectionType="subSectionTypeMap.get(item[0].toLowerCase())"
                :sectionSubType="item[0]"
                :parent=section
                @rowsReordered="(e) => rowsReordered(e, item[1])"
                @columnUpdated="(msg) => updateColumnName(item[1], msg)"
                @columnsReordered="(msg) => sectionsRefreshKey+= 1"
                @delete="deleteSubSection(section.subsections, index)"
                @refreshSection="refreshSection()"
                ref="errSpecialSecTableRefs"
              />
            </div>

            <!-- render general Sections and general Tables -->
            <div v-for="(subsection, i) in section.subsections" :key="i" ref="subsectionsRef">
              <!-- general section -->
              <Section
                v-if="!Array.isArray(subsection) && !subSectionTypeMap.get(subsection?.type?.toLowerCase())?.rowAsSection"
                :section="subsection"
                :sectionType="subSectionTypeMap.get(subsection?.type?.toLowerCase()) || subsection?.type?.toLowerCase()"
                :depth="props.depth + 1"
                :sectionTypeMap="subSectionTypeMap"
                @delete="deleteSubSection(section.subsections, i)"
                @addTable="(msg)=>addTable(msg.section, msg.instance)"
                ref="errSecRefs"
              />

              <!-- general Table -->
              <SectionTable
                v-if="Array.isArray(subsection) && subsection?.length > 0"
                :rows="subsection"
                :depth="props.depth+1"
                :sectionType="subSectionTypeMap.get(subsection?.name?.toLowerCase())"
                :sectionSubType="subSectionTypeMap.get(subsection?.name?.toLowerCase())?.name"
                :parent=section
                @rowsReordered="(e) => rowsReordered(e, subsection)"
                @columnUpdated="(msg) => updateColumnName(subsection, msg)"
                @columnsReordered="(msg) => sectionsRefreshKey+= 1"
                @delete="deleteSubSection(section.subsections, i)"
                @refreshSection="refreshSection()"
                ref="errSecTableRefs"
              />
            </div>
            <SubsectionMenu
                            :sectionType="sectionType"
                            @newSection="(type)=> addSubsection(section,1, type)"
                            @newTable="(type)=> addTable(section,1, type)"
            ></SubsectionMenu>


            <!-- Subsections end -->
          </div>
        </div>
      </div>
    </transition>
  </div> <!-- end rendered section -->
  <div v-else class="section-block"></div>
</template>

<style>

.plus-icon {
  color: #dedede;
}

.plus-icon:hover, .plus-icon.show {
  color: #bcbcbc;
}

.btn-delete {
  padding-top: 7px;
  opacity: 0.6;
}

.btn-delete:hover {
  color: var(--bs-danger);
  opacity: 1;
}
</style>
