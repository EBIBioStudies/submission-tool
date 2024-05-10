<script setup>
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {inject} from "vue";

const props = defineProps(['sectionType'])
const emits = defineEmits(['newAttribute', 'newTable', 'newSection'])
const parentDisplayType = inject('parentDisplayType')

</script>

<template>
  <!--  add other sections button start -->
  <div v-if="parentDisplayType!=='readonly'" class="dropdown dropend">
    <svg class="plus-icon" height="1em" viewBox="0 0 640 512" aria-expanded="false"
         xmlns="http://www.w3.org/2000/svg" data-bs-toggle="dropdown" role="button">
      <path fill="currentColor"
            d="m 256,80 c -8.8,0 -16,7.2 -16,16 v 320 c 0,8.8 7.2,16 16,16 h 320 c 8.8,0 16,-7.2 16,-16 V 96 c 0,-8.8 -7.2,-16 -16,-16 z m -64,16 c 0,-35.3 28.7,-64 64,-64 h 320 c 35.3,0 64,28.7 64,64 v 320 c 0,35.3 -28.7,64 -64,64 H 256 c -35.3,0 -64,-28.7 -64,-64 V 280 H 0 v -50 h 192 z m 200,248 v -64 h -64 c -13.3,0 -24,-10.7 -24,-24 0,-13.3 10.7,-24 24,-24 h 64 v -64 c 0,-13.3 10.7,-24 24,-24 13.3,0 24,10.7 24,24 v 64 h 64 c 13.3,0 24,10.7 24,24 0,13.3 -10.7,24 -24,24 h -64 v 64 c 0,13.3 -10.7,24 -24,24 -13.3,0 -24,-10.7 -24,-24 z"/>
    </svg>

    <ul class="dropdown-menu">
      <li><a class="dropdown-item btn" @click="$emit('newAttribute')">
        <font-awesome-icon class="icon fa-fw" :icon="['fas','plus']"></font-awesome-icon>
        Text Attribute</a>
      </li>
<!--      <li v-for="(type,i) in props?.sectionType?.fieldTypes">-->
<!--        <a class="dropdown-item btn" @click="$emit('newAttribute', type)">-->
<!--          <font-awesome-icon class="icon" :icon="type.icon ?? 'fa-plus'"></font-awesome-icon>-->
<!--          {{ type.name }}</a>-->
<!--      </li>-->
      <li>
        <hr class="dropdown-divider">
      </li>
      <li><a class="dropdown-item btn" @click="$emit('newTable', null)">
        <font-awesome-icon class="icon fa-fw" icon="fa-table"></font-awesome-icon>
        Table</a>
      </li>
      <li v-for="(type,i) in props?.sectionType?.tableTypes">
        <a class="dropdown-item btn" @click="$emit('newTable', type)">
          <font-awesome-icon class="icon fa-fw" :icon="type.icon && type.icon!=='' ? type.icon : 'fa-table'"></font-awesome-icon>
          {{ type.name }}</a>
      </li>
      <li>
        <hr class="dropdown-divider">
      </li>
      <li><a class="dropdown-item btn" @click="$emit('newSection')">
        <font-awesome-icon class="icon fa-fw" icon="fa-caret-right"></font-awesome-icon>
        Subsection</a>
      </li>
      <li v-for="(type,i) in props?.sectionType?.sectionTypes">
        <a class="dropdown-item btn" @click="$emit('newSection', type)">
          <font-awesome-icon class="icon fa-fw" :icon="type.icon && type.icon!=='' ? type.icon : 'fa-caret-right'"></font-awesome-icon>
          {{ type.name }}</a>
      </li>
    </ul>
  </div>
  <!--  add other sections button end -->
</template>

<style scoped>

</style>
