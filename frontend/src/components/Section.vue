<script setup>
import {getCurrentInstance, nextTick, ref} from 'vue';
import Attributes from './Attributes.vue';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import SectionTable from './SectionTable.vue';
import {addTable} from '@/utils';

const props = defineProps(['section', 'sectionType', 'depth']);
const emits = defineEmits(['delete','addTable']);

const componentInstance = getCurrentInstance();

const attributesComponent = ref(null);
const sectionsComponent = ref(null);
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
const addSubsection = async (aSection) => {
  aSection.subsections = aSection.subsections || [];
  aSection.subsections.push({
    accno:
      (props.section.accno ?? Date.now()) +
      '-' +
      (props.section.subsections.length + 1),
    type: '',
    attributes: [{name: '', value: ''}],
    subsections: [],
  });
  // wait till the UI is updated and the focus the first attribute name
  await nextTick();
  const added = [...componentInstance.refs.sectionsComponent].pop().$.ctx.$el;
  added.scrollIntoView();
  await nextTick();
  added.querySelector('.section-title input').focus();

  // New section added to first is always collapsed
  if (added.classList.contains('collapsed'))
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

</script>

<template>
  <div
    v-if="canRender(props.section)"
    class="section-block"
    :class="{ collapsed: isCollapsed }"
  >
    <!-- section title -->
    <div>
      <span :class="[depth > 0 ? 'branch' : 'branch spacer']"></span>
      <span
        class="input-group-text text-start btn btn-lg ps-1 mt-2 section-title"
        @click="isCollapsed = !isCollapsed"
      >
        <font-awesome-icon
          class="section-control"
          :icon="'fa-caret-' + (isCollapsed ? 'right' : 'down')"
        ></font-awesome-icon>
        <span v-if="sectionType?.name" class="ms-2">{{ section.type }}</span>
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

          <!-- add attribute button -->
          <div class="branch btn-group btn-group-sm " role="group" aria-label="Large button group">
            <button type="button" class="btn btn-add-element" @click="addAttribute(thisSection)">
              <font-awesome-icon
                class="icon" :icon="['fas', 'add']"></font-awesome-icon>
              New Attribute
            </button>
            <button type="button" class="btn btn-add-element" @click="()=>emits('addTable', {section:thisSection, instance:componentInstance})">
              <font-awesome-icon
                class="icon" :icon="['fas', 'table']"></font-awesome-icon>
              New Table
            </button>
          </div>


          <div class="p-0" :key="sectionsRefreshKey">

            <!-- Files -->
            <SectionTable
              v-if="section.files && section.files.length"
              :rows="Array.isArray(section.files[0]) ? section.files[0] : section.files "
              :depth="props.depth+1"
              :sectionType="(props.sectionType?.tableTypes ?? []).find( type=> type.name==='File')"
              @rowsReordered="(e) => rowsReordered(e, Array.isArray(section.files[0]) ? section.files[0] : section.files  )"
              @columnUpdated="(msg) => updateColumnName(Array.isArray(section.files[0]) ? section.files[0] : section.files, msg)"
            />

            <!-- Subsections -->
            <div v-for="(subsection, i) in section.subsections" v-bind:key="i">
              <!-- section -->
              <Section
                v-if="!Array.isArray(subsection)"
                ref="sectionsComponent"
                :section="subsection"
                :sectionType="getSectionType(subsection)"
                :depth="props.depth + 1"
                @delete="deleteSubSection(section.subsections, i)"
                @addTable="(msg)=>addTable(msg.section, msg.instance)"
              />
              <!-- or table -->
              <SectionTable
                v-else
                :rows="subsection"
                :depth="props.depth+1"
                :sectionType="getSectionType(subsection)"
                @rowsReordered="(e) => rowsReordered(e, subsection)"
                @columnUpdated="(msg) => updateColumnName(subsection, msg)"
              />
            </div>

          </div>

          <!-- add other sections button start -->
          <div class="input-group branch dropdown mt-2  dropend">
            <label class="input-group-text attribute new-button" role="button"
                   data-bs-toggle="dropdown"
                   aria-expanded="false"
                   @click="isCollapsed = false">
              <font-awesome-icon
                class="icon" :icon="['far', 'plus-square']"></font-awesome-icon>
              <span>New ...</span>
            </label>

            <ul class="dropdown-menu">
              <!--              <li><a class="dropdown-item btn" @click="addAttribute(section)">                <font-awesome-icon class="icon" :icon="['fas','plus']"></font-awesome-icon>                New Attribute</a>              </li>-->
              <!--              <li><a class="dropdown-item btn" @click="addTable(section)">-->
              <!--                <font-awesome-icon class="icon" icon="fa-table"></font-awesome-icon>-->
              <!--                Table</a>-->
              <!--              </li>-->
              <li><a class="dropdown-item btn" @click="addSubsection(section)">
                <font-awesome-icon class="icon" icon="fa-caret-right"></font-awesome-icon>
                Subsection</a>
              </li>
            </ul>
          </div>
          <!-- add other sections button end -->

        </div>

      </div>
    </transition>
  </div>
</template>

<style>
.section-block:nth-child(even) {
}

.btn-add-element {
  border: 1px dashed var(--bs-border-color);
  font-style: oblique;
  color: #999999;
}

.btn-add-element:hover {
  background-color: var(--bs-secondary-bg);
}


</style>
