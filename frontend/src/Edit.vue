<template xmlns="http://www.w3.org/1999/html">
  <div class="container">
    <div class="row">
      <div class="col text-end">
        <font-awesome-icon v-if="isSaving" :icon="['far','floppy-disk']" beat-fade class="pe-2"/>
        <button class="btn btn-primary" type="button" @click="submitDraft()">Submit</button>
        <button class="btn btn-outline-danger ms-2" type="button" @click="revertDraft()">Revert</button>
      </div>
    </div>
    <div class="row">
      <div class="col-1"></div>
      <div class="col-8">
        <Submission :submission="submission" :template="template" ref="submissionComponent"/>
      </div>
      <div id="json" class="json col-3"></div>
    </div>

    <div class="offcanvas offcanvas-end" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1"
         id="offcanvasErrors" aria-labelledby="offcanvasScrollingLabel">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasScrollingLabel">Errors</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body">
        <p>Please fix these errors before submitting</p>
        <ul class="list-group">
          <template v-for="error in validationErrors">
            <li v-if="error?.control?.errors?.length" role="button"
                class="list-group-item list-group-item-action" @click="error.element?.scrollIntoView()">
              <strong>{{ error?.element?.querySelector('.attribute-name').innerText }}:</strong> {{ error.errorMessage }}
            </li>
          </template>
        </ul>
      </div>
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
import {computed, onMounted, ref, watch, watchEffect} from 'vue';

import Default from './templates/Default.json';
import Submission from './components/Submission.vue';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {allTemplates} from "@/templates/templates";
import {Offcanvas} from "bootstrap";
import axios from "axios";
import utils from "@/utils";
import { provide } from 'vue'

const props = defineProps(['accession']);
const submission = ref({});
const template = ref({});
const isSaving = ref(true);
const hasValidated = ref(false);
provide('hasValidated', hasValidated)

const submissionComponent = ref({})

let offCanvasErrors = null;
let validationErrors = ref([]);

const submitDraft = () => {
  hasValidated.value = true;
  validationErrors.value = submissionComponent.value?.errors;
  if (validationErrors.value.length) {
    offCanvasErrors.show();
  }
}

const revertDraft = async () => {
  if (!await utils.confirm("Revert to released version",
    "⚠️You are about to discard all changes made to this submission since it was last released. This operation cannot be undone.",
    "Revert")) return;
  const response = await axios.delete(
    `${window.config.backendUrl}/api/submissions/drafts/${props.accession}`,
  );
  if (response.status === 200) {
    location.href = location.href;
  }
}

onMounted(() => {
  offCanvasErrors = Offcanvas.getOrCreateInstance('#offcanvasErrors', {'backdrop': false});
})

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
    } else if (submissionTitle && studySectionTitle) {
      const index = submissionJson?.attributes?.findIndex((attr) => attr.name === 'Title')
      submissionJson?.attributes?.splice(index, 1, studySectionTitle);
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
      // try finding the template with the same name as the collection
      tmpl = allTemplates.find(
        (t) => t?.title?.toLowerCase() === collection?.value?.toLowerCase(),
      );
      // try finding the template with the same name collection.v1 (works for BioImages)
      if (!tmpl) tmpl = allTemplates.find(
        (t) => t?.title?.toLowerCase() === collection?.value?.toLowerCase() + '.v1',
      );
    }
    console.log(`Using template ${tmpl.name}`)
    template.value = tmpl ?? Default;
  } else {
    //TODO: display error
    console.log('No such submission')
  }
});
const updatedSubmission = computed(() =>
  JSON.stringify(submission.value, null, 2),
);

let lastUpdated = Date.now();
let pendingSave = null;

watch(updatedSubmission, async (sub) => {
  const draft = JSON.parse(updatedSubmission.value);
  // Remove ReleaseDate from Study. It remains in the Submission
  draft?.section?.attributes.splice(draft?.section?.attributes.findIndex((a) => a.name === 'ReleaseDate'), 1);

  const delta = Date.now() - lastUpdated
  if (delta < 1000) {
    clearTimeout(pendingSave)
  }

  pendingSave = setTimeout(() => {
    isSaving.value = true
    axios({
      url: `${window.config.backendUrl}/api/submissions/drafts/${props.accession}`,
      headers: {'content-type': 'application/json'},
      method: 'PUT',
      data: JSON.stringify(draft)
    }).then(() => isSaving.value = false);

  }, 1002)
  lastUpdated = Date.now();
  document.getElementById('json').innerText = JSON.stringify(draft, null, 2);
});

</script>
