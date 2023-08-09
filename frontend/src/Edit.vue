<template xmlns="http://www.w3.org/1999/html">
  <div class="container">
    <div class="row">
        <div class="col-1"></div>
        <Submission class="col-8" :submission="submission" :template="template"/>
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
import {computed, ref, watch, watchEffect} from 'vue';

import BioImages from './templates/BioImages.v4.json';
import ArrayExpress from './templates/ArrayExpress.json';
import Default from './templates/Default.json';
import Submission from './components/Submission.vue';
import axios from "axios";

const props = defineProps(['accession']);
const submission = ref({});
const template = ref({});
const allTemplates = [BioImages, Default, ArrayExpress];

watchEffect(async () => {
  if (props.accession) {
    // load from existing data
    const response = await axios.get(
      `${window.config.backendUrl}/api/submissions/drafts/${props.accession}/content`,
    );
    const submissionJson = await response.data;


    // insert the release date as needed
    const submissionReleaseDate = submissionJson?.attributes?.find((attr) => attr.name === 'ReleaseDate');
    const studySectionReleaseDate = submissionJson?.section?.attributes?.find((attr) => attr.name === 'ReleaseDate');
    if (!submissionReleaseDate && studySectionReleaseDate) {
      submissionJson?.attributes.splice(2, 0, studySectionReleaseDate);
    } else if (submissionReleaseDate && !studySectionReleaseDate) {
      submissionJson?.section?.attributes.splice(1, 0, submissionReleaseDate);
    } else {
      const releaseDate = {'name': 'ReleaseDate'};
      submissionJson?.attributes.splice(2, 0, releaseDate);
      submissionJson?.section?.attributes.splice(1, 0, releaseDate);
    }

    // insert the title as needed
    const submissionTitle = submissionJson?.attributes?.find((attr) => attr.name === 'Title');
    const studySectionTitle = submissionJson?.section?.attributes?.find((attr) => attr.name === 'Title');
    if (!submissionTitle && studySectionTitle) {
      submissionJson?.attributes.splice(0, 0, studySectionTitle);
    } else if (submissionTitle && !studySectionTitle) {
      submissionJson?.section?.attributes.splice(0, 0, submissionTitle);
    }

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
    //TODO: display error
    console.log('No such submission')
  }
});
const updatedSubmission = computed(() =>
  JSON.stringify(submission.value, null, 2),
);
watch(updatedSubmission, async (sub) => {
  const draft = JSON.parse(updatedSubmission.value);
  // Remove ReleaseDate from Study. It remains in the Submission
  draft?.section?.attributes.splice(draft?.section?.attributes.findIndex((a) => a.name === 'ReleaseDate'), 1);
  //document.getElementById('json').innerText = JSON.stringify(draft, null, 2);
});

</script>
