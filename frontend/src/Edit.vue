<template>
  <div class="container">
    <div class="row">
      <Submission class="col-8" :submission="submission" :template="template" />
      <div id="json" class="json col"></div>
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
import { computed, ref, watch, watchEffect } from 'vue';

import BioImages from './templates/BioImages.v4.json';
import Submission from './components/Submission.vue';

const props = defineProps(['accession']);
const submission = ref({});
const template = ref({});
const allTemplates = [BioImages];

watchEffect(async () => {
  const response = await fetch(
    `http://localhost:8080/study/${props.accession}`,
  );
  submission.value = await response.json();
  const templateNode = submission.value?.attributes?.find(
    (n) => n?.name?.toLowerCase() === 'template',
  );
  template.value = allTemplates.find(
    (t) => t?.name?.toLowerCase() === templateNode?.value?.toLowerCase(),
  );
});
const updatedSubmission = computed(() =>
  JSON.stringify(submission.value, null, 2),
);
watch(updatedSubmission, async (sub) => {
  document.getElementById('json').innerText = updatedSubmission.value;
});
</script>
