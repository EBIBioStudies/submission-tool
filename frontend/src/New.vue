<template>
  <div class="container">
    <div class="row">
      <div class="col"></div>
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

const submission = ref({});
const template = ref({});
const allTemplates = [BioImages];

const thisTemplate = allTemplates.find((v) => true);
const draft = {
  type: 'submission',
  attributes: [
    { name: 'Template', value: thisTemplate.name },
    { name: 'ReleaseDate', value: new Date().toISOString().substring(0, 10) },
    { name: 'Template', value: thisTemplate.title },
  ],
};

watchEffect(async () => {
  const tmpl = thisTemplate.sectionType;
  populate(draft, tmpl);
  submission.value = draft;
  template.value = allTemplates.find(
    (t) => t?.name?.toLowerCase() === thisTemplate.name.toLowerCase(),
  );

  console.log(submission.value);
  console.log(template.value);
});

function populate(parent, tmpl) {
  const sec = (parent.section = { type: tmpl.name });
  sec.attributes = [];
  tmpl?.fieldTypes?.forEach((field) => {
    const attr = { name: field.name };
    if (field?.controlType?.defaultValue)
      sec.value = field?.controlType?.defaultValue;
    else if (field?.controlType?.name === 'select') attr.value = '';
    sec.attributes.push(attr);
  });
}

const updatedSubmission = computed(() =>
  JSON.stringify(submission.value, null, 2),
);
watch(updatedSubmission, async (sub) => {
  document.getElementById('json').innerText = updatedSubmission.value;
});
</script>
