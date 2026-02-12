<script setup lang="ts">
import StudySection from './StudySection.vue';
import { computed, ref, UnwrapRef } from 'vue';
import { PageTab } from '@/models/PageTab.model.ts';
import { Template } from '@/models/Template.model.ts';
import { SectionExpose } from 'components/expose.model.ts';

const props = defineProps<{
  submission: PageTab.LocalSubmission;
  template: Template.TemplateDefinition;
  accession: string;
}>();

const studyComponent = ref<UnwrapRef<SectionExpose>>();
const errors = computed(() => studyComponent.value?.errors || []);
const doi = computed(() => props.submission?.attributes?.find(a => a.name.toLowerCase() === 'doi')?.value);
let baseURL = import.meta.env.VITE_BASE_URL?.replace(/\/$/, '') || '';

const getAccNoToDisplay = (submission: PageTab.LocalSubmission) => submission.displayKey ? submission.displayKey : submission.accno

defineExpose<SectionExpose>({ errors });
</script>

<template>
  <div>
    <div v-if="template?.sectionType?.banner"
         :style="`background-color: ${template?.sectionType?.banner?.backgroundColor}`" class="card">
      <img :src="`${baseURL}${template?.sectionType?.banner?.src}`" height="70" />
    </div>
    <h5 class="text-success">
      {{ getAccNoToDisplay(submission) }}</h5>
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
