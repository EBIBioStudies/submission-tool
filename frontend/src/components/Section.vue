<script setup>
import { getCurrentInstance, nextTick, ref } from 'vue';
import AttributeList from './AttributeList.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps(['section', 'sectionType', 'collapsed']);

const attributesComponent = ref(null);
const sectionsComponent = ref(null);
const thisSection = ref(props.section);
const refreshKey = ref(0);

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
const isCollapsed = ref(props.collapsed);

const addSubsection = async (aSection) => {
  aSection.subsections = aSection.subsections || [];
  aSection.subsections.push({
    accno:
      (props.section.accno ?? Date.now()) +
      '-' +
      (props.section.subsections.length + 1),
    type: 'New Section',
    attributes: [{ name: '', value: '' }],
    subsections: [],
  });
  await nextTick();
  const added = [...componentInstance.refs.sectionsComponent].pop().$.ctx.$el;
  added.scrollIntoView();
  await nextTick();
  added.querySelector('.section-title').click();
  await nextTick();
  added.querySelector('input.input-group-text').focus();
};

const addAttribute = async (aSection) => {
  aSection.attributes = aSection.attributes || [];
  aSection.attributes.push({ name: '', value: '' });
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
  refreshKey.value += 1;
};

const componentInstance = getCurrentInstance();

function toggle() {
  isCollapsed.value = !isCollapsed.value;
}
</script>

<script>
export default {
  data() {
    return {
      refreshKey: 0,
    };
  },
  methods: {
    forceRefresh() {
      this.refreshKey += 1;
    },
  },
};
</script>
<template>
  <div v-if="canRender(props.section)">
    <!-- section title -->
    <div>
      <span class="text-start btn btn-lg section-title" @click="toggle()">
        <font-awesome-icon
          class="section-control"
          :icon="'fa-caret-' + (isCollapsed ? 'right' : 'down')"
        ></font-awesome-icon>
        <span v-if="sectionType?.name" class="ms-2">{{ section.type }}</span>
        <input
          v-else
          class="ms-2"
          @click.stop=""
          type="text"
          v-model="section.type"
        />
      </span>
    </div>

    <transition name="slide">
      <div v-if="!isCollapsed">
        <!-- section body -->
        <div class="has-child-section slide-in">
          <AttributeList
            :key="refreshKey"
            ref="attributesComponent"
            :attributes="section.attributes"
            :fieldTypes="sectionType?.fieldTypes || sectionType?.columnTypes"
            @delete="deleteAttribute"
          />
          <Section
            :section="subsection"
            :sectionType="getSectionType(subsection)"
            ref="sectionsComponent"
            v-for="(subsection, i) in section.subsections"
            v-bind:key="i"
            collapsed="true"
          />
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
              icon="fa-square-plus"
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
                Attribute</a
              >
            </li>
            <!--          <li><a class="dropdown-item btn"><i class="fa-solid fa-table icon"></i> Table</a></li>-->
            <li>
              <a class="dropdown-item btn" @click="addSubsection(section)">
                <font-awesome-icon
                  class="icon"
                  icon="fa-caret-right"
                ></font-awesome-icon>
                Section</a
              >
            </li>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>
