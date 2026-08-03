<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { computed, inject, Ref } from 'vue';
import { Template } from '@/models/Template.model.ts';

const props = defineProps<{
  sectionType?: Template.SectionType;
}>();
const emits = defineEmits<{
  newTable: [table: Template.TableType | undefined];
  newSection: [section: Template.SectionType | undefined];
}>();
const parentDisplayType =
  inject<Ref<Template.DisplayType>>('parentDisplayType');

const _tableTypes = computed(
  () =>
    props.sectionType?.tableTypes?.filter((t) => t.display !== 'hidden') || [],
);
const tableTypes = computed(() =>
  parentDisplayType?.value === 'readonly'
    ? _tableTypes.value.filter((t) => t.overrideReadonly)
    : _tableTypes.value,
);

const _sectionTypes = computed(
  () =>
    props.sectionType?.sectionTypes?.filter((t) => t.display !== 'hidden') ||
    [],
);
const sectionTypes = computed(() =>
  parentDisplayType?.value === 'readonly'
    ? _sectionTypes.value.filter((t) => t.overrideReadonly)
    : _sectionTypes.value,
);

const canAddTable = computed(
  () => !props.sectionType?.disableCustomTable || tableTypes.value.length,
);
const canAddSection = computed(
  () => !props.sectionType?.disableCustomTable || sectionTypes.value.length,
);
const enabled = computed(() => canAddTable.value || canAddSection.value);
</script>

<template>
  <!--  add other sections button start -->
  <div v-if="enabled" class="dropdown dropend">
    <button
      data-bs-toggle="dropdown"
      class="btn btn-light btn-small add-btn text-muted mt-2 pw-0"
    >
      <font-awesome-icon :icon="['fas', 'plus']" class="icon fa-fw" />
      Add Section
    </button>

    <ul class="dropdown-menu">
      <li>
        <a
          class="dropdown-item btn"
          @click="emits('newTable', undefined)"
          v-if="!sectionType?.disableCustomTable"
        >
          <font-awesome-icon
            class="icon fa-fw"
            icon="fa-table"
          ></font-awesome-icon>
          Table</a
        >
      </li>
      <li v-for="type in tableTypes" :key="type.name">
        <a class="dropdown-item btn" @click="emits('newTable', type)">
          <font-awesome-icon
            class="icon fa-fw"
            :icon="type.icon || 'fa-table'"
          ></font-awesome-icon>
          {{ type.name }}</a
        >
      </li>
      <li v-if="canAddTable && canAddSection">
        <hr class="dropdown-divider" />
      </li>
      <li>
        <a
          class="dropdown-item btn"
          @click="emits('newSection', undefined)"
          v-if="!sectionType?.disableCustomSubsection"
        >
          <font-awesome-icon
            class="icon fa-fw"
            icon="fa-caret-right"
          ></font-awesome-icon>
          Subsection</a
        >
      </li>
      <li v-for="type in sectionTypes" :key="type.name">
        <a class="dropdown-item btn" @click="emits('newSection', type)">
          <font-awesome-icon
            class="icon fa-fw"
            :icon="type.icon || 'fa-caret-right'"
          ></font-awesome-icon>
          {{ type.name }}</a
        >
      </li>
    </ul>
  </div>
  <!--  add other sections button end -->
</template>

<style scoped>
.add-btn {
  position: relative;
  left: -15px;
  padding-left: 0;
}
</style>
