<script setup>
import {allTemplates, latestTemplates, fillTemplate} from "@/templates/templates";
import {computed, onMounted, ref} from "vue";
import axios from "axios";
import router from "@/router";
import AuthService from "@/services/AuthService";


const emits = defineEmits(['select'])
const showMoreWasPressed = ref(false)
const selectedTemplate = ref(null)
const allowedCollections = ref([])

const createNewSubmission = async ()=> {

  // create new
  const thisTemplate = allTemplates.find((tmpl) => tmpl.name===selectedTemplate.value);
  const draft = {
    type: 'submission',
    attributes: [
      { name: 'Template', value: thisTemplate.name },
      { name: 'AttachTo', value: thisTemplate.title },
    ],
  };
  const tmpl = thisTemplate.sectionType;
  draft.section = { type: tmpl.name };
  fillTemplate(draft.section, tmpl);
  const author =  {
    accno : "author-1",
    type : "Author",
    attributes : [ {
      name : "Name",
      value : AuthService.user?.value?.fullname
    }, {
      name : "E-mail",
      value : AuthService.user?.value?.email
    }, {
      name : "Role",
      value : "submitter"
    }]
  };
  if (AuthService.user?.value?.orcid) {
    author.attributes.push({name:"ORCID", value:AuthService.user?.value?.orcid})
  }
  draft.section.subsections.push(author);
  const response = await axios.post (
    `${window.config.backendUrl}/api/submissions/drafts`,
    draft
  );
  await router.push(`/edit/${response.data.key}`)
}

const filteredTemplates = computed(() => {
  return latestTemplates.filter((tmpl) =>
    allowedCollections.value.some((allowed) => tmpl.name.includes(allowed.accno) || tmpl.name === 'Default')
  );
});

onMounted(async () => {
  if (!AuthService.isAuthenticated()) return;
  try {
    const response = await axios.get(`${window.config.backendUrl}/api/collections`);
    allowedCollections.value = response.data;
  } catch (error) {
    //console.error('Failed to fetch collections:', error);
  }
});


</script>

<template>
  <div class="modal fade modal-lg" id="newSubmissionModal" tabindex="-1" aria-labelledby="newSubmissionModal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5">New submission</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>
            Please select a BioStudies collection that you are submitting to.
          </p>
          <p>
            Imaging datasets must be submitted using the "BioImages" template. Submissions that do not do so may have
            their release delayed. For further details please see the <a
            href="https://www.ebi.ac.uk/bioimage-archive/help-images-at-ebi" target="_blank"> EMBL-EBI policy on imaging
            data submissions</a>.</p>

          <div v-for="(tmpl, i) in filteredTemplates" class="form-check template-button">
            <div v-if="i<3 || showMoreWasPressed">
              <input :id="`template_${i}`" type="radio" class="form-check visually-hidden" name="template"
                     v-model="selectedTemplate"
                     :value="tmpl.name"
              />
              <label class="input-group" :for="`template_${i}`"  :title="tmpl.name">
              <span class="input-group-text p-4">
                <img :alt="tmpl.displayName"  style="height: 40px; width: 40pt"
                     :src="`/images/template-icons/${tmpl.title||'Default'}.png`"
                     @error="(e)=>e.target.src='/images/template-icons/Default.png'"/>
              </span>
                <div class="form-control btn-group-vertical">
                  <div><strong>{{ tmpl.title }}</strong></div>
                  {{ tmpl.description }}
                </div>
              </label>
            </div>
          </div>

          <div class="text-center">
            <button v-if="filteredTemplates.length>3 && !showMoreWasPressed" type="button"
                    class="btn btn-link text-decoration-none"
                    @click="showMoreWasPressed=true">show more collections...
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button @click="createNewSubmission" :disabled="selectedTemplate==null" type="button" class="btn btn-primary" data-bs-dismiss="modal">Add</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.template-button {
  padding: 0 2em 1em;
}

label {
  cursor: pointer;
  border: 1pt solid #dddddd;
  border-radius: 5pt;
}


.icon img {
  width: 40pt;
}

.icon span {
  display: block;
  margin-top: 4pt;
}

.form-check + label:hover {
  border-color: #3b6fb6;
}

.form-check:checked + label {
  border-color: #3b6fb6;
}


.form-check:checked + label img {
  color: white;
  border-color: #3b6fb6;
}

.form-check:checked + label .input-group-text {
  background-color: #3b6fb6;
  border-color: #3b6fb6;
}


</style>
