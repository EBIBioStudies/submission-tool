<script setup>
import {allTemplates} from "@/templates/templates";
import {ref} from "vue";
import axios from "axios";
import router from "@/router";
import utils from '@/utils'

const emits = defineEmits(['select'])
const showMoreWasPressed = ref(false)
const nameLatestVersionMap = new Map()
const nameTemplateMap = new Map()
const selectedTemplate = ref(null)

allTemplates.map((tmpl, i) => {
  const templateNameRe = /^(.+?)(?:\.v(\d+))?$/;
  let [_, collection, version] = templateNameRe.exec(tmpl.name) || [null, '', 0];
  version = Number(version) || 0;
  nameTemplateMap.set(`${collection}.v${version}`, tmpl);
  if (!nameLatestVersionMap.has(collection) || nameLatestVersionMap.get(collection) < version) {
    nameLatestVersionMap.set(collection, version);
  }
})

const latestTemplates = [...nameLatestVersionMap.keys()].map((collection) => nameTemplateMap.get(`${collection}.v${nameLatestVersionMap.get(collection)}`))
//TODO: Filter on user collection allow list


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
  utils.fillTemplate(draft.section, tmpl);
  const response = await axios.post (
    `${window.config.backendUrl}/api/submissions/drafts`,
    draft
  );
  await router.push(`/edit/${response.data.key}`)
}


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

          <div v-for="(tmpl, i) in latestTemplates" class="form-check template-button">
            <div v-if="i<2 || showMoreWasPressed">
              <input :id="`template_${i}`" type="radio" class="form-check visually-hidden" name="template"
                     v-model="selectedTemplate"
                     :value="tmpl.name"
              />
              <label class="input-group" :for="`template_${i}`">
              <span class="input-group-text p-4">
                <img :alt="tmpl.displayName" style="max-height: 50px"
                     :src="`/src/assets/images/template-icons/${tmpl.title||'Default'}.png`"
                     @error="(e)=>e.target.src='/src/assets/images/template-icons/Default.png'"/>
              </span>
                <div class="form-control btn-group-vertical">
                  <div><strong>{{ tmpl.name }}</strong></div>
                  {{ tmpl.description }}
                </div>
              </label>
            </div>
          </div>

          <div class="text-center">
            <button v-if="latestTemplates.length>=2 && !showMoreWasPressed" type="button"
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
