<template>
  <div class="container">
    <div class="row">
      <div class="col-1"></div>
      <Submission class="col-8" :submission="submission" :template="template" />
      <div id="json" class="json col-3"></div>
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
import { computed, nextTick, ref, watch, watchEffect } from 'vue';

import BioImages from './templates/BioImages.v4.json';
import ArrayExpress from './templates/ArrayExpress.json';
import Submission from './components/Submission.vue';

const props = defineProps(['accession']);
const submission = ref({});
const template = ref({});
const allTemplates = [BioImages, ArrayExpress];

watchEffect(async () => {
  if (props.accession) {
    // load from existing data
    const response = await fetch(
      `${window.config.backendUrl}/api/submissions/drafts/${props.accession}/content`,
    );
    const submissionJson = await response.json();
    const releaseDate = submissionJson?.attributes?.find(
      (attr) => attr.name === 'ReleaseDate',
    );
    // insert the release date as a second attribute
    submissionJson?.section?.attributes.splice(1, 0, releaseDate);
    submission.value = submissionJson;
    const templateNode = submission.value?.attributes?.find(
      (n) => n?.name?.toLowerCase() === 'template',
    );
    let tmpl = allTemplates.find(
      (t) => t?.name?.toLowerCase() === templateNode?.value?.toLowerCase(),
    );
    if (!tmpl) {
      const collection = submission.value?.attributes?.find(
        (n) => n?.name?.toLowerCase() === 'attachto',
      );
      tmpl = allTemplates.find(
        (t) => t?.name?.toLowerCase() === collection?.value?.toLowerCase(),
      );
    }
    template.value = tmpl;
  } else {
    // create new
    const thisTemplate = allTemplates.find((v) => true);
    const draft = {
      type: 'submission',
      accno: 'TEMP',
      attributes: [
        { name: 'Template', value: thisTemplate.name },
        {
          name: 'ReleaseDate',
          value: new Date().toISOString().substring(0, 10),
        },
        { name: 'AttachTo', value: thisTemplate.title },
      ],
    };
    const tmpl = thisTemplate.sectionType;
    draft.section = { type: tmpl.name };
    buildTemplate(draft.section, tmpl);
    submission.value = draft;
    template.value = allTemplates.find(
      (t) => t?.name?.toLowerCase() === thisTemplate.name.toLowerCase(),
    );
    await nextTick();
    submission.value.accno = new Date();
  }
});
const updatedSubmission = computed(() =>
  JSON.stringify(submission.value, null, 2),
);
watch(updatedSubmission, async (sub) => {
  const draft = JSON.parse(updatedSubmission.value);
  // Remove ReleaseDate from Study. It remains in the Submission
  draft?.section?.attributes.splice(1, 1);
  document.getElementById('json').innerText = JSON.stringify(draft, null, 2);
});

function buildTemplate(section, tmpl) {
  // fill attributes
  section.attributes = [];
  [...(tmpl?.fieldTypes ?? []), ...(tmpl?.columnTypes ?? [])].forEach(
    (field) => {
      const attr = { name: field.name };
      if (field?.controlType?.defaultValue)
        attr.value = field?.controlType?.defaultValue;
      else if (field?.controlType?.name === 'select') attr.value = '';
      section.attributes.push(attr);
    },
  );

  // fill sections
  section.subsections = [];
  [...(tmpl?.tableTypes ?? []), ...(tmpl.sectionTypes ?? [])].forEach(
    (sectionTemplate) => {
      const subsection = { type: sectionTemplate.name };
      section.subsections.push(subsection);
      buildTemplate(subsection, sectionTemplate);
    },
  );
}
</script>
