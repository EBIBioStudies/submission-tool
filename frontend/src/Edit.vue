<template xmlns="http://www.w3.org/1999/html">
  <teleport to="body">
    <div class="fixed-top text-end col">
      <font-awesome-icon icon="fas fa-user-secret" class="p-2 link-dark" type="button" @click="offCanvasJson.show();"></font-awesome-icon>
    </div>
  </teleport>
  <div v-if="success" className="card">
    <div  className="card-body">
      <h2  className="card-title ng-star-inserted">
        <i aria-hidden="true" className="fa fa-check-circle"></i> Study <span  className="ng-star-inserted">submitted</span>
      </h2>
      <p className="card-text mb-1 ng-star-inserted"> The study has been successfully submitted to the BioStudies database and is now being processed. </p>
      <div  className="mt-3 ng-star-inserted">
        <h5>Please note <i  className="far fa-hand-point-down"></i></h5>
        <ul>
          <li className="mb-3">
            <mark>As soon as your study is processed, you will receive its accession number by e-mail</mark>
          </li>
          <li className="mb-3">
            <mark> The system may take up to 24 hours after submission to register any new studies in the database. </mark>
          </li>
          <li className="mb-3">
            <mark>Any registered study will remain private and accessible only through login until the release date in the Western European Time Zone.</mark>
          </li>
        </ul>
      </div>
      <div className="mt-3 ng-star-inserted">
        <strong>
          <a target="_blank" href="http://europepmc.org/abstract/MED/26700850"> Citing the BioStudies database <i className="fa fa-fw fa-external-link-square"></i></a>
        </strong>
        <p>Sarkans U, Gostev M, Athar A, et al. <a href="http://doi.org/10.1093/nar/gkx965">The BioStudies database-one stop shop for all data supporting a life sciences study. </a><i>Nucleic Acids Res.</i> 2018;46(D1):D1266-D1270. doi:10.1093/nar/gkx965
        </p>
      </div>
      <a tooltip="List all other submitted studies" routerlink="/" className="btn btn-primary ng-star-inserted" href="/biostudies/submissions/"> Show all submitted </a>
    </div>
  </div>
  <div v-else >
    <div v-if="serverErrorMessage" class="card">
      <div class="card-body">
        {{serverErrorMessage}}
      </div>
    </div>
  </div>
  <div class="container">
    <div class="row">
      <div class="col text-end pb-4">
        <font-awesome-icon v-if="isSaving" :icon="['far','floppy-disk']" beat-fade class="pe-2"/>
        <button v-if="!displayType" class="btn btn-primary" type="button" @click="submitDraft()">Submit</button>
        <button v-if="!displayType" class="btn btn-outline-danger ms-2" type="button" @click="revertDraft()">Revert</button>
      </div>
    </div>
    <div class="row">
      <div class="col-1"></div>
      <div class="col-10">
        <Submission :submission="submission" :template="template" :accession="props.accession" ref="submissionComponent"/>
      </div>
      <div class="col-1"></div>
      <!--div id="json" class="json col-3"></div-->
    </div>
    <div class="offcanvas offcanvas-end" data-bs-scroll="true" data-bs-backdrop="false" id="offcanvasJson">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasScrollingLabel">Pagetab JSON</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body">
        <div id="json" class="json"></div>
      </div>
    </div>

    <div class="offcanvas offcanvas-end" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1"
         id="offcanvasErrors" aria-labelledby="offcanvasScrollingLabel">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasScrollingLabel">Validation</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body">
        <p v-if="validationErrors?.filter((e)=>e.control.errors).length">Please fix these errors before submitting.
          <ul class="list-group">
            <template v-for="error in validationErrors">
              <li v-if="error?.control?.errors?.length" role="button"
                  class="list-group-item list-group-item-action" @click="expandAndFocus(error?.element)">
                <strong>{{ error?.element.id}}:</strong> {{
                  error.errorMessage
                }}
              </li>
            </template>
          </ul>
        </p>
        <p v-else>
          <div class="pb-2">
            <font-awesome-icon icon="check" class="text-success"/>
            All good to go!
          </div>
          <div class="text-center">
            <button class="btn btn-primary text-center" type="button" @click="submitDraft()">Close and Submit</button>
          </div>
        </p>
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
  overflow: both;
}
</style>

<script setup>
import {computed, onMounted, provide, ref, watch, watchEffect} from 'vue';

import Default from './templates/Default.json';
import Submission from './components/Submission.vue';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {allTemplates} from "@/templates/templates";
import {Offcanvas} from "bootstrap";
import axios from "axios";
import utils from "@/utils";

const props = defineProps(['accession']);
const submission = ref({});
const template = ref({});
const isSaving = ref(true);
const hasValidated = ref(false);
const success = ref(false)
const serverErrorMessage = ref('')
const displayType = ref('')
provide('hasValidated', hasValidated)
provide('submission', submission)
provide('parentDisplayType', displayType)


const submissionComponent = ref({})

let offCanvasErrors = null;
let offCanvasJson = null;
let validationErrors = ref([]);

const submitDraft = async () => {
  hasValidated.value = true;
  validationErrors.value = submissionComponent.value?.errors;

  if (validationErrors.value.length) {
    offCanvasErrors.show();
  } else {
    offCanvasErrors.hide();
    try{
      const response = await axios.post(`/api/submissions/drafts/${props.accession}/submit`);
      if (response.status === 200) {
        success.value = true;
        displayType.value='readonly'
      }
      else{
        success.value=false;
      }
      console.log(response)
    }catch (error){
      success.value = false;
      serverErrorMessage.value = error?.response?.data?.log?.message || 'Unknown Error';

    }
  }
}

const revertDraft = async () => {
  if (!await utils.confirm("Revert to released version",
    "⚠️You are about to discard all changes made to this submission since it was last released. This operation cannot be undone.",
    "Revert")) return;
  const response = await axios.delete(
    `/api/submissions/drafts/${props.accession}`,
  );
  if (response.status === 200) {
    location.href = location.href;
  }
}

onMounted(() => {
  offCanvasErrors = Offcanvas.getOrCreateInstance('#offcanvasErrors', {'backdrop': false});
  offCanvasJson = Offcanvas.getOrCreateInstance('#offcanvasJson', {'backdrop': false});
})

watchEffect(async () => {
  if (props.accession) {
    // load from existing data
    const response = await axios.get(
      `/api/submissions/drafts/${props.accession}/content`,
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
      url: `/api/submissions/drafts/${props.accession}`,
      headers: {'content-type': 'application/json'},
      method: 'PUT',
      data: JSON.stringify(draft)
    }).then(() => isSaving.value = false);

  }, 1002)
  lastUpdated = Date.now();
  document.getElementById('json').innerText = JSON.stringify(draft, null, 2);
});


const expandAndFocus = async (el) => {
  let p = el.parentElement;
  while (p.localName != 'body') { // walk up the ancestors and expand
    if (p.classList.contains('section-block') && p.classList.contains('collapsed')) {
      await p.querySelector('.section-title').click();
    }
    p = p.parentElement;
  }
  await el.scrollIntoView()
}

</script>

<style class="scoped">
label {
  display: inherit;
  margin-bottom: inherit;
}

.form-group {
  margin-bottom: inherit;
}

</style>
