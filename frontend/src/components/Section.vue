<script setup>
import {getCurrentInstance, nextTick, ref} from 'vue';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import Attributes from '@/components/Attributes.vue';
import SectionTable from '@/components/SectionTable.vue';
import SubsectionMenu from "@/components/SubsectionMenu.vue";
import utils from "@/utils";


const props = defineProps(['section', 'sectionType', 'depth']);
const emits = defineEmits(['delete', 'addTable']);

const componentInstance = getCurrentInstance();

const attributesComponent = ref(null);
const sectionsComponent = ref(null);
const filesComponent = ref(null);
const subsectionsRef = ref([])
const sectionTablesRef = ref([])

const thisSection = ref(props.section);
const deleteTag = (msg) => deleteAttribute(msg.index);


// hack: variable to trigger re-rendering of attributes when needed
// TODO: figure out how to avoid this
const attributesRefreshKey = ref(0);
const sectionsRefreshKey = ref(0);


const getSectionType = (aSubsection) => {
  const subsection = Array.isArray(aSubsection) ? aSubsection[0] : aSubsection;
  const subsections = [
    ...(props.sectionType?.sectionTypes ?? []),
    ...(props.sectionType?.tableTypes ?? []),
  ];
  return subsections.find(
    (f) => f?.name?.toLowerCase() === subsection?.type?.toLowerCase(),
  );
};

const canRender = (sec) => {
  return (
    ['author', 'organisation', 'organization'].indexOf(
      sec.type?.toLowerCase(),
    ) < 0
  );
};
const isCollapsed = ref((props?.depth ?? 0) >= 2);

// children are not allowed to change properties of a parent
// all section/attributes updates thus need to be at this level
const addSubsection = async (aSection, i, type) => {
  aSection.subsections = aSection.subsections || [];
  const obj = {}
  if (type != null)
    utils.fillTemplate(obj, type)
  else {
    obj.accno = (props.section.accno ?? Date.now()) + '-' + (props.section.subsections.length + 1);
    obj.type = '';
    obj.attributes = [{name: '', value: ''}];
  }

  aSection.subsections.splice(i, 0, obj);

  sectionsRefreshKey.value += 1

  // wait till the UI is updated and the focus the first attribute name
  await nextTick();
  const added = [...componentInstance.refs.sectionsComponent][i]
  added.scrollIntoView();
  added.querySelector('input')?.focus();
  // Expand section if collapsed
  if (added.querySelector('.section-block')?.classList.contains('collapsed'))
    added.querySelector('.section-title').click();

};

const addTable = async (aSection, i, type) => {
  aSection.subsections = aSection.subsections || [];
  const obj = {}
  if (type != null)
    utils.fillTemplate(obj, type)
  else {
    obj.accno = (props.section.accno ?? Date.now()) + '-' + (props.section.subsections.length + 1);
    obj.type = 'Table';
    obj.attributes = [{name: 'Column 1', value: ''}];
  }

  aSection.subsections.splice(i, 0, [obj]);

  sectionsRefreshKey.value += 1

  // wait till the UI is updated and the focus the first attribute name
  await nextTick();
  const added = [...componentInstance.refs.sectionsComponent][i]
  added.scrollIntoView();
  added.querySelector('input')?.focus();

  // Expand section if collapsed
  if (added.querySelector('.section-block')?.classList.contains('collapsed'))
    added.querySelector('.section-title').click();

};

const deleteSubSection = async (someSubSections, index) => {
  thisSection.value.subsections = someSubSections.filter((v, i) => i !== index);
  sectionsRefreshKey.value += 1;
};

const addAttribute = async (aSection) => {
  aSection.attributes = aSection.attributes || [];
  aSection.attributes.push({name: '', value: ''});
  attributesRefreshKey.value += 1;
  await nextTick();
  const added = [...componentInstance.refs.attributesComponent.$.ctx.$el.querySelectorAll('.attribute-name')].pop();
  added.scrollIntoView();
  added.focus();
};

const deleteAttribute = async (index) => {
  thisSection.value.attributes.splice(index, 1);
  attributesRefreshKey.value += 1;
};

const createTag = (msg) => {
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
  rows.splice(event.newIndex, 0, rows.splice(event.oldIndex, 1)[0]);
  //sectionsRefreshKey.value += 1;
};

const updateColumnName = (subsection, update) => {
  subsection.forEach(
    (row) =>
      (row.attributes.find((att) => att.name === update.old).name = update.new),
  );
  sectionsRefreshKey.value += 1;
};

const isValid = ref(true);
const validate = () => {
  let v = attributesComponent.value?.validate();
  filesComponent?.value?.validate();
  v = v && filesComponent?.value?.isValid;
  subsectionsRef?.value.forEach(a => {
    a.validate();
    v = v && a.value.isValid;
  });
  isValid.value = !!v;
}
defineExpose({validate, isValid});

</script>

<template>
  <div v-if="canRender(props.section)" class="section-block pb-2" :class="{ collapsed: isCollapsed }">
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
        <span v-if="sectionType?.name" class="ms-2"
              :data-bs-toggle="sectionType?.description ? 'tooltip' : false" :data-bs-title="sectionType?.description"><font-awesome-icon
          v-if="sectionType?.icon" class="icon" :icon="sectionType?.icon"/>{{ section.type }}</span>
        <span v-else>
          <input
            class="ms-2"
            @click.stop=""
            type="text"
            placeholder="Enter section type"
            v-model="thisSection.type"/>
          <font-awesome-icon
            class="icon ps-2"
            role="button"
            size="sm"
            @click="$emit('delete')"
            @click.stop=""
            icon="fa-trash"
          ></font-awesome-icon
          ></span>
      </span>
      <span v-if="depth===0" class="float-end text-danger" style="font-size: 8pt; padding-top:35px">* Required</span>
    </div>
    <!-- section content -->
    <transition name="slide">
      <div v-if="!isCollapsed">
        <div class="has-child-section ms-3 slide-in">

          <!-- attributes -->
          <Attributes
            :key="attributesRefreshKey"
            ref="attributesComponent"
            :attributes="section.attributes"
            :fieldTypes="sectionType?.fieldTypes || sectionType?.columnTypes"
            @deleteAttribute="deleteAttribute"
            @createTag="createTag"
            @deleteTag="deleteTag"
          />

          <SubsectionMenu
            :sectionType="sectionType"
            @newAttribute="addAttribute(section)"
            @newSection="(type)=> addSubsection(section,0, type)"
            @newTable="(type)=> addTable(section,0, type)"
          ></SubsectionMenu>


          <div class="p-0" :key="sectionsRefreshKey">

            <!-- Files -->
            <SectionTable
              v-if="section.files && section.files.length"
              :rows="Array.isArray(section.files[0]) ? section.files[0] : section.files "
              :depth="props.depth+1"
              :sectionType="(props.sectionType?.tableTypes ?? []).find( type=> type.name==='File')"
              @rowsReordered="(e) => rowsReordered(e, Array.isArray(section.files[0]) ? section.files[0] : section.files  )"
              @columnUpdated="(msg) => updateColumnName(Array.isArray(section.files[0]) ? section.files[0] : section.files, msg)"
              ref="filesComponent"
            />

            <!-- Subsections start -->
            <div v-for="(subsection, i) in section.subsections" key="i" ref="sectionsComponent">
              <!-- section -->
              <Section
                v-if="!Array.isArray(subsection)"
                :section="subsection"
                :sectionType="getSectionType(subsection)"
                :depth="props.depth + 1"
                @delete="deleteSubSection(section.subsections, i)"
                @addTable="(msg)=>addTable(msg.section, msg.instance)"
                ref="subsectionsRef"
              />
              <!-- or table -->
              <SectionTable
                v-else
                :rows="subsection"
                :depth="props.depth+1"
                :sectionType="getSectionType(subsection)"
                @rowsReordered="(e) => rowsReordered(e, subsection)"
                @columnUpdated="(msg) => updateColumnName(subsection, msg)"
                @columnsReordered="(msg) => sectionsRefreshKey+= 1"
                @delete="deleteSubSection(section.subsections, i)"
                ref="sectionTablesRef"
              />

              <SubsectionMenu v-if="canRender(subsection)"
                              :sectionType="sectionType"
                              @newAttribute="addAttribute(section)"
                              @newSection="(type)=> addSubsection(section,i+1, type)"
                              @newTable="(type)=> addTable(section,i+1, type)"
              ></SubsectionMenu>

            </div>
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

</style>
