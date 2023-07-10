<template>
  <div class="container">
    <div class="row">
      <SubmissionSection
        class="col-8"
        v-model:submission="submission"
        :template="template"
      />
      <div class="json col">{{ submission }}</div>
    </div>
  </div>
</template>

<style scoped>
.json {
  font-family: monospace;
  font-size: 8pt;
  white-space: pre-wrap;
  color: #222222;
}
</style>

<script setup>
import { ref } from 'vue';

import BioImages from './templates/BioImages.v4.json';
import SubmissionSection from './components/Submission.vue';

const props = defineProps(['accession']);

const submission = ref({});
const template = ref({});
const allTemplates = [BioImages];

const fetchData = () => {
  fetch(`http://localhost:8080/study/${props.accession}`)
    .then((response) => response.json())
    .then((data) => {
      submission.value = data;
      const templateNode = data?.attributes?.find(
        (n) => n?.name?.toLowerCase() === 'template',
      );
      template.value = allTemplates.find(
        (t) => t?.name?.toLowerCase() === templateNode?.value?.toLowerCase(),
      );
    })
    .catch((error) => {
      console.error('Error fetching JSON data:', error);
    });
};

fetchData();
</script>
