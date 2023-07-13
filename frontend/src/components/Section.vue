<script setup>
import { getCurrentInstance, nextTick, ref } from 'vue';
import Attributes from './Attributes.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps(['section', 'sectionType', 'depth']);
defineEmits(['delete']);

const attributesComponent = ref(null);
const sectionsComponent = ref(null);
const thisSection = ref(props.section);

// hack: variable to trigger re-rendering of attributes when needed
// TODO: figure out how to avoid this
const attributesRefreshKey = ref(0);
const sectionsRefreshKey = ref(0);

const getSectionType = (subsection) => {
  const subsections = [
    ...(props.sectionType?.sectionTypes ?? []),
    ...(props.sectionType?.tableTypes ?? []),
  ];
  return subsections.find(
    (f) => f?.name?.toLowerCase() === subsection?.type?.toLowerCase(),
  );
};

const canRender = (sec) => {
  return ['author', 'organisation'].indexOf(sec.type?.toLowerCase()) < 0;
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
    attributes: [{ name: '', value: '' }],
    subsections: [],
  });
  // wait till the UI is updated and the focus the first attribute name
  await nextTick();
  const added = [...componentInstance.refs.sectionsComponent].pop().$.ctx.$el;
  added.scrollIntoView();
  await nextTick();
  // TODO: Fix bug - New section added to study is collapsed
  added.querySelector('.section-title').click();
  await nextTick();
  added.querySelector('input.input-group-text').focus();
};

const deleteSubSection = async (someSubSections, index) => {
  thisSection.value.subsections = someSubSections.filter((v, i) => i !== index);
  sectionsRefreshKey.value += 1;
};

const addAttribute = async (aSection) => {
  aSection.attributes = aSection.attributes || [];
  aSection.attributes.push({ name: '', value: '' });
  attributesRefreshKey.value += 1;
  await nextTick();
  const added = [
    ...componentInstance.refs.attributesComponent.$.ctx.$el.querySelectorAll(
      'input.input-group-text',
    ),
  ].pop();
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

const deleteTag = (msg) => {
  deleteAttribute(msg.index);
};

const toggle = () => {
  isCollapsed.value = !isCollapsed.value;
};

const componentInstance = getCurrentInstance();
</script>

<template>
  <div v-if="canRender(props.section)" class="section-block">
    <!-- section title -->
    <div>
      <span class="text-start btn btn-lg section-title" @click="toggle()">
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
            v-model="thisSection.type" />
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

    <transition name="slide">
      <div v-if="!isCollapsed">
        <!-- section body -->
        <div class="has-child-section slide-in">
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
          <!-- subsection -->
          <div :key="sectionsRefreshKey">
            <Section
              :section="subsection"
              :sectionType="getSectionType(subsection)"
              :depth="props.depth + 1"
              ref="sectionsComponent"
              v-for="(subsection, i) in section.subsections"
              @delete="deleteSubSection(section.subsections, i)"
              v-bind:key="i"
              collapsed="true"
            />
          </div>
        </div>

        <!-- add menu -->
        <div class="dropdown add-control">
          <div
            class="align-text-bottom"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            @click="isCollapsed = false"
          >
            <font-awesome-icon
              icon="fa-regular fa-square-plus"
              class="section-control"
            ></font-awesome-icon>
          </div>
          <ul class="dropdown-menu">
            <li>
              <a class="dropdown-item btn" @click="addAttribute(section)">
                <font-awesome-icon
                  class="icon"
                  icon="fa-solid fa-toggle-off"
                ></font-awesome-icon>
                New Attribute</a
              >
            </li>
            <!--          <li><a class="dropdown-item btn"><i class="fa-solid fa-table icon"></i> Table</a></li>-->
            <li>
              <a class="dropdown-item btn" @click="addSubsection(section)">
                <font-awesome-icon
                  class="icon"
                  icon="fa-caret-right"
                ></font-awesome-icon>
                New Section</a
              >
            </li>
          </ul>
        </div>
        <!--        {{-->
        <!--          [-->
        <!--            ...(sectionType?.sectionTypes ?? []),-->
        <!--            ...(sectionType?.tableTypes ?? []),-->
        <!--          ].map((t) => t.name)-->
        <!--        }}-->
      </div>
    </transition>
  </div>
</template>

<style>
.section-block {
  content: ' ';
  margin-top: 1em;
}

.section-block:nth-child(even) {
}
</style>
