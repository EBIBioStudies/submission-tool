<template xmlns="http://www.w3.org/1999/html">
  <teleport to="body">
    <div class="fixed-top text-end col">
      <font-awesome-icon icon="fas fa-user-secret" class="p-2 link-dark" type="button" @click="offCanvasJson.show();"></font-awesome-icon>
    </div>
  </teleport>
  <div v-if="isLoading" class="loading-overlay">
    <div class="spinner"></div>
  </div>
  <div v-else-if="success" className="card">
    <div  className="card-body">
      <h2  className="card-title ng-star-inserted">
        <i aria-hidden="true" className="fa fa-check-circle"></i> Study <span  className="ng-star-inserted">submitted</span>
      </h2>
      <p className="card-text mb-1 ng-star-inserted"> The study has been submitted to the BioStudies database and is now being processed. </p>
      <div  className="mt-3 ng-star-inserted">
        <h5>Please note <i  className="far fa-hand-point-down"></i></h5>
        <ul>
          <li className="mb-3">
            <mark>Data processing time depends on the number and size of your files.</mark>
          </li>
          <li className="mb-3">
            <mark>If there are any further validation errors, they will be available from the Submissions list page</mark>
          </li>
          <li className="mb-3">
            <mark>On successful processing you will receive the study accession number by e-mail.</mark>
          </li>
          <li className="mb-3">
            <mark>The study will remain private and accessible only via login until the release date in the Western European Time Zone.</mark>
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
      <RouterLink
        to="/"
        class="btn btn-primary ng-star-inserted"
        tooltip="'List all other submitted studies'"
      >
        Show all submitted
      </RouterLink>
    </div>
  </div>
  <div v-else >
    <div v-if="serverErrorMessage" class="card">
      <div class="card-body">
        {{serverErrorMessage}}
      </div>
    </div>
    <div v-else>
      <div  class="card ng-star-inserted">
        <div  class="card-body st-edit-status-message">
          <h2 v-if="displayType!=='readonly' && !accession.startsWith('TMP_')"  class="card-title ng-star-inserted">Edit submission</h2>
          <h2 v-else  class="card-title ng-star-inserted">New submission</h2>
          <p  class="card-text ng-star-inserted"> Please fill in the form below. The
            <span  class="font-weight-bold">Validation</span> tab on the right-hand side lists those fields still incomplete or incorrect. Use the
            <strong>Add or <font-awesome-icon :icon="['fas','plus']" class="icon fa-fw"></font-awesome-icon></strong> buttons to quickly add new rows or tables. </p>
          <div  role="alert" class="alert alert-warning mb-0 ng-star-inserted">
            <strong >Please note:</strong> all fields with * are required
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="container">
    <div class="row">
      <div class="col text-end pb-4">
        <font-awesome-icon v-if="isSaving" :icon="['far','floppy-disk']" beat-fade class="pe-2"/>
        <button v-if="!displayType" class="btn btn-primary btn-top-margin" type="button" @click="submitDraftPopUp()">Submit</button>
        <button v-if="isSubmittedSubmission" class="btn btn-outline-danger ms-2 btn-top-margin" type="button" @click="revertDraft()">Revert</button>
      </div>
    </div>
    <div v-if="showModal" class="modal-overlay">
      <ResubmitModal @hide="showModal = false" @resubmit="finalSubmitDraft" />
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
                <strong>{{ getErrorAttName(error)}}:</strong> {{
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
            <button class="btn btn-primary text-center" type="button" @click="finalSubmitDraft()">Close and Submit</button>
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
  overflow: auto;
}
</style>

<script setup>
import {computed, onMounted, provide, ref, watch, watchEffect} from 'vue';

import Default from './templates/Default.json';
import Submission from './components/Submission.vue';
import ResubmitModal from "./components/ResubmitModal.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {allTemplates} from "@/templates/templates";
import {Offcanvas} from "bootstrap";
import axios from "axios";
import utils from "@/utils";
import router from "./router.js";

const props = defineProps(['accession']);
const submission = ref({});
const template = ref({});
const isSaving = ref(true);
const hasValidated = ref(false);
const success = ref(false)
const serverErrorMessage = ref('')
const displayType = ref('')
const isLoading = ref(false);
provide('hasValidated', hasValidated)
provide('submission', submission)
provide('parentDisplayType', displayType)

const isSubmittedSubmission = displayType?.value!=='readonly' && !props?.accession?.startsWith('TMP_');
const showModal = ref(false);

const submissionComponent = ref({})

let offCanvasErrors = null;
let offCanvasJson = null;
let validationErrors = ref([]);

const submitDraftPopUp = ()=>{
  if(isSubmittedSubmission)
      showModal.value = true;
  else
    finalSubmitDraft("");
}

const finalSubmitDraft = async (option) => {
  showModal.value = false;
  hasValidated.value = true;
  validationErrors.value = submissionComponent.value?.errors;

  if (validationErrors.value.length) {
    offCanvasErrors.show();
  } else {
    offCanvasErrors.hide();
    try{
      isLoading.value = true;
      const headers = {
        "Submission_Type": "application/json"
      };
      let params = {
        preferredSources: "SUBMISSION"
      };
      params = option === "noFilesUpdated" ? params : {};
      const response = await axios.post(
        `/api/submissions/drafts/${props.accession}/submit`,
        {},
        { headers, params }
      );
      if (response.status === 200) {
        success.value = true;
        displayType.value='readonly'
      }
      else{
        success.value=false;
      }
    }catch (error){
      success.value = false;
      serverErrorMessage.value = error?.response?.data?.log?.message || 'Unknown Error';

    }finally {
      isLoading.value = false;
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

const getErrorAttName = (error) =>{
    if(error?.errorMessage) {
      const index = error?.errorMessage?.toLowerCase()?.indexOf("required"); // Find "required" case-insensitively
      if (index !== -1) {
        return error?.errorMessage?.slice(0, index)?.trim();
      }
    }
    return error?.element?.id
  }

</script>

<style class="scoped">

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* High z-index to ensure it's on top */
}

label {
  display: inherit;
  margin-bottom: inherit;
}

.btn-top-margin {
  margin-top: 10px; /* Adjust the width, style, and color as needed */
}

.form-group {
  margin-bottom: inherit;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.spinner {
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}


</style>
