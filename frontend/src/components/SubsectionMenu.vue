<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { computed, inject } from 'vue';

const props = defineProps(['sectionType']);
defineEmits(['newTable', 'newSection']);

const parentDisplayType = inject('parentDisplayType', 'readonly');
const collectionName = inject('collectionName', null);

const alwaysVisibleTablesByCollection = {
  ArrayExpress: ['Publication'],
};

const isParentDisplayTypeEditable = computed(
  () => parentDisplayType?.value !== 'readonly',
);

const mandatoryTablesForCollection = computed(() => {
  const names = alwaysVisibleTablesByCollection[collectionName?.value] || [];
  const tableTypes = props?.sectionType?.tableTypes || [];
  return tableTypes.filter((t) => names.includes(t.name));
});

const hasMandatoryTables = computed(
  () => mandatoryTablesForCollection.value.length > 0,
);
</script>

<template>
  <!--  add other sections button start -->
  <div
    v-if="isParentDisplayTypeEditable || hasMandatoryTables"
    class="dropdown dropend"
  >
    <svg
      class="plus-icon"
      height="1em"
      viewBox="0 0 640 512"
      aria-expanded="false"
      xmlns="http://www.w3.org/2000/svg"
      data-bs-toggle="dropdown"
      role="button"
    >
      <path
        fill="currentColor"
        d="m 256,80 c -8.8,0 -16,7.2 -16,16 v 320 c 0,8.8 7.2,16 16,16 h 320 c 8.8,0 16,-7.2 16,-16 V 96 c 0,-8.8 -7.2,-16 -16,-16 z m -64,16 c 0,-35.3 28.7,-64 64,-64 h 320 c 35.3,0 64,28.7 64,64 v 320 c 0,35.3 -28.7,64 -64,64 H 256 c -35.3,0 -64,-28.7 -64,-64 V 280 H 0 v -50 h 192 z m 200,248 v -64 h -64 c -13.3,0 -24,-10.7 -24,-24 0,-13.3 10.7,-24 24,-24 h 64 v -64 c 0,-13.3 10.7,-24 24,-24 13.3,0 24,10.7 24,24 v 64 h 64 c 13.3,0 24,10.7 24,24 0,13.3 -10.7,24 -24,24 h -64 v 64 c 0,13.3 -10.7,24 -24,24 -13.3,0 -24,-10.7 -24,-24 z"
      />
    </svg>

    <!-- parent editable: full menu -->
    <ul v-if="isParentDisplayTypeEditable" class="dropdown-menu">
      <li>
        <a class="dropdown-item btn" @click="$emit('newTable', null)">
          <font-awesome-icon class="icon fa-fw" icon="fa-table" />
          Table
        </a>
      </li>

      <li v-for="type in props?.sectionType?.tableTypes || []" :key="type.name">
        <a class="dropdown-item btn" @click="$emit('newTable', type)">
          <font-awesome-icon
            class="icon fa-fw"
            :icon="type.icon && type.icon !== '' ? type.icon : 'fa-table'"
          />
          {{ type.name }}
        </a>
      </li>

      <li>
        <hr class="dropdown-divider" />
      </li>

      <li>
        <a class="dropdown-item btn" @click="$emit('newSection')">
          <font-awesome-icon class="icon fa-fw" icon="fa-caret-right" />
          Subsection
        </a>
      </li>

      <li
        v-for="type in props?.sectionType?.sectionTypes || []"
        :key="type.name"
      >
        <a class="dropdown-item btn" @click="$emit('newSection', type)">
          <font-awesome-icon
            class="icon fa-fw"
            :icon="type.icon && type.icon !== '' ? type.icon : 'fa-caret-right'"
          />
          {{ type.name }}
        </a>
      </li>
    </ul>

    <!-- parent readonly but some tables must always be addable -->
    <ul v-else-if="hasMandatoryTables" class="dropdown-menu">
      <li v-for="type in mandatoryTablesForCollection" :key="type.name">
        <a class="dropdown-item btn" @click="$emit('newTable', type)">
          <font-awesome-icon
            class="icon fa-fw"
            :icon="type.icon && type.icon !== '' ? type.icon : 'fa-table'"
          />
          {{ type.name }}
        </a>
      </li>
    </ul>
  </div>
  <!--  add other sections button end -->
</template>

<style scoped></style>
