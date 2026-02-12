<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { computed, inject, Ref } from 'vue';
import { Template } from '@/models/Template.model.ts';

const props = defineProps<{
  sectionType?: Template.SectionType
}>()
const emits = defineEmits<{
  newTable: [table: Template.TableType | undefined],
  newSection: [section: Template.SectionType | undefined]
}>()
const parentDisplayType = inject<Ref<Template.DisplayType>>('parentDisplayType')

const canAddTable = computed(() => !props.sectionType?.disableCustomTable || props.sectionType?.tableTypes?.length)
const canAddSection = computed(() => !props.sectionType?.disableCustomTable || props.sectionType?.sectionTypes?.length)
const enabled = computed(() =>canAddTable.value || canAddSection.value)


</script>

<template>

  <!--  add other sections button start -->
  <div v-if="parentDisplayType!=='readonly' && enabled" class="dropdown dropend">
    <svg class="plus-icon" height="1em" viewBox="0 0 640 512" aria-expanded="false"
         xmlns="http://www.w3.org/2000/svg" data-bs-toggle="dropdown" role="button">
      <path fill="currentColor"
            d="m 256,80 c -8.8,0 -16,7.2 -16,16 v 320 c 0,8.8 7.2,16 16,16 h 320 c 8.8,0 16,-7.2 16,-16 V 96 c 0,-8.8 -7.2,-16 -16,-16 z m -64,16 c 0,-35.3 28.7,-64 64,-64 h 320 c 35.3,0 64,28.7 64,64 v 320 c 0,35.3 -28.7,64 -64,64 H 256 c -35.3,0 -64,-28.7 -64,-64 V 280 H 0 v -50 h 192 z m 200,248 v -64 h -64 c -13.3,0 -24,-10.7 -24,-24 0,-13.3 10.7,-24 24,-24 h 64 v -64 c 0,-13.3 10.7,-24 24,-24 13.3,0 24,10.7 24,24 v 64 h 64 c 13.3,0 24,10.7 24,24 0,13.3 -10.7,24 -24,24 h -64 v 64 c 0,13.3 -10.7,24 -24,24 -13.3,0 -24,-10.7 -24,-24 z"/>
    </svg>

    <ul class="dropdown-menu">
<!--      <li><a class="dropdown-item btn" @click="$emit('newAttribute')">-->
<!--        <font-awesome-icon class="icon fa-fw" :icon="['fas','plus']"></font-awesome-icon>-->
<!--        Text Attribute</a>-->
<!--      </li>-->
<!--      <li v-for="(type,i) in props?.sectionType?.fieldTypes">-->
<!--        <a class="dropdown-item btn" @click="$emit('newAttribute', type)">-->
<!--          <font-awesome-icon class="icon" :icon="type.icon ?? 'fa-plus'"></font-awesome-icon>-->
<!--          {{ type.name }}</a>-->
<!--      </li>-->
<!--      <li>-->
<!--        <hr class="dropdown-divider">-->
<!--      </li>-->
      <li><a class="dropdown-item btn" @click="emits('newTable', undefined)" v-if="!sectionType?.disableCustomTable">
        <font-awesome-icon class="icon fa-fw" icon="fa-table"></font-awesome-icon>
        Table</a>
      </li>
      <li v-for="(type) in sectionType?.tableTypes">
        <a class="dropdown-item btn" @click="emits('newTable', type)">
          <font-awesome-icon class="icon fa-fw" :icon="type.icon && type.icon!=='' ? type.icon : 'fa-table'"></font-awesome-icon>
          {{ type.name }}</a>
      </li>
      <li v-if="canAddTable && canAddSection">
        <hr class="dropdown-divider">
      </li>
      <li><a class="dropdown-item btn" @click="emits('newSection', undefined)" v-if="!sectionType?.disableCustomSubsection">
        <font-awesome-icon class="icon fa-fw" icon="fa-caret-right"></font-awesome-icon>
        Subsection</a>
      </li>
      <li v-for="(type) in props?.sectionType?.sectionTypes">
        <a class="dropdown-item btn" @click="emits('newSection', type)">
          <font-awesome-icon class="icon fa-fw" :icon="type.icon && type.icon!=='' ? type.icon : 'fa-caret-right'"></font-awesome-icon>
          {{ type.name }}</a>
      </li>
    </ul>
  </div>
  <!--  add other sections button end -->
</template>

<style scoped>

</style>
