<script setup>
import StudySection from './StudySection.vue';
import { computed, ref } from 'vue';

const props = defineProps(['submission', 'template', 'accession']);
const studyComponent = ref(null);
const errors = computed(() => studyComponent.value.errors);
const doi = computed(() => props.submission?.attributes?.find(a => a.name.toLowerCase() === 'doi')?.value);
defineExpose({ errors });
</script>

<template>
  <div>
    <div v-if="template?.sectionType?.banner"
         :style="`background-color: ${template?.sectionType?.banner?.backgroundColor}`" class="card">
      <img :src="`${template?.sectionType?.banner?.src}`" height="70" />
    </div>
    <h5 class="text-success">
      {{ accession }} </h5>
    <h4>{{ submission?.attributes?.find(a => a.name.toLowerCase() === 'title')?.value }}&nbsp;</h4>
    <div v-if="doi" class="doi">
      <span v-if="doi.toLowerCase()==='true'">A Crossref DOI will be assigned after submission automatically.</span>
      <span v-else><a target="_blank" class="text-black-50" href="https://doi.org/10.6019/S-BSST1279/{{doi}}">DOI {{doi}}</a></span>
    </div>


    <StudySection v-if="submission?.section?.type?.toLowerCase() === 'study'" ref="studyComponent"
                  :section="submission.section" :sectionType="template?.sectionType" />

  </div>
</template>

<style scoped>
.doi {
  font-size: 8pt;
  color: #cccccc;
}
</style>
