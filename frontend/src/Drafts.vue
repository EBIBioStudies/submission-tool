<template>
  <div class="container">
    <NewSubmission @select="(e)=>console.log(e)"></NewSubmission>
    <table class="table table-responsive table-striped table-hover">
      <thead>
      <th style="width: 180px">Draft Key</th>
      <th>Title</th>
      <th style="width: 75px">Actions</th>
      </thead>
      <tbody>
      <tr v-for="draft in drafts">
        <td>{{ getKeyToDisplay(draft) }}</td>
        <td>{{ getTitle(draft) }}</td>
        <td>
          <font-awesome-icon role="button" icon="fa-edit" class="text-primary fa-fw"
                             @click.stop="editDraft(draft.key)"></font-awesome-icon>
          <font-awesome-icon role="button" icon="fa-trash-can" class="icon fa-fw text-secondary ps-2"
                             @click.stop="deleteDraft(draft.key)"></font-awesome-icon>
        </td>
      </tr>
      </tbody>
      <tfoot>
      <tr class="border-white">
        <td colspan="3" class="text-end">
          <button v-if="showPrevious" class="btn btn-outline-primary btn-sm m-2" @click="updateOffset(-pageLength)">
            <font-awesome-icon icon="fa-chevron-left"></font-awesome-icon>
            Previous
          </button>
          <button v-if="showNext" class="btn btn-outline-primary btn-sm m-2"
                  @click="updateOffset(pageLength)">
            <font-awesome-icon icon="fa-chevron-right"></font-awesome-icon>
            Next
          </button>
        </td>
      </tr>
      </tfoot>
    </table>
    <div v-if="drafts?.length===0" class="text-center">Welcome! You can click the <b>New Submissions</b> button to start a new study draft.
    </div>

    <!--    <div class="input-group w-25">-->
    <!--      <input type="text" class="form-control" v-model="accession" placeholder="Enter accession"-->
    <!--             aria-label="Enter accession" autofocus/>-->
    <!--      <router-link :to="`/edit/${accession}`" class="btn btn-primary" role="button">Edit</router-link>-->
    <!--    </div>-->
  </div>
  <div v-if="isLoading" class="d-flex justify-content-center">
    <span v-if="isLoading" class="ps-1"><font-awesome-icon class="fa-spin" icon="fa-solid fa-spinner" /></span>
  </div>
  <a href="https://www.ebi.ac.uk/biostudies/studies/" target="_blank"> Search published submissions
    <font-awesome-icon icon="fa-solid fa-external-link-square"></font-awesome-icon>
  </a>
</template>

<script setup>
import {ref, watchEffect} from 'vue';
import AuthService from "./services/AuthService";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import router from "./router";
import axios from "axios";
import NewSubmission from "@/components/NewSubmission.vue";
import utils from "@/utils";

const accession = ref('');
const drafts = ref([]);
const offset = ref(0);
const oldOffset = ref(0);
const pageLength = ref(15);
const showNext = ref(true);
const showPrevious = ref(true);
const isLoading = ref(true);

const updateOffset = (delta) => {
  oldOffset.value = offset.value;
  offset.value += delta;
}

watchEffect(async () => {
  if (!AuthService.isAuthenticated()) return;
  isLoading.value = true;
  await axios(`/api/submissions/drafts?offset=${offset.value}&limit=15`)
    .then(response => {
      if (response.data.length)   {
        drafts.value = response.data;
        showNext.value = drafts.value.length % pageLength.value === 0 ;
        showPrevious.value = offset.value >0;
        isLoading.value = false;
      } else {
        showNext.value = false;
        showPrevious.value = oldOffset.value >0;
      }
      isLoading.value = false;
    });
})

const getKeyToDisplay = (draft) => {
  return draft.displayKey ? draft.displayKey : draft.key
}

const getTitle = (draft) => {
  return draft.content?.section?.attributes?.find(attr => attr.name === 'Title')?.value || draft.content?.attributes?.find(attr => attr.name === 'Title')?.value
}

const editDraft = (accno) => {
  router.push(`/edit/${accno}`)
}

const deleteDraft = async (accno) => {
  if (!await utils.confirm("Delete draft",
    `⚠️The draft with accession number ${accno} has not been submitted yet. If you proceed, it will be permanently deleted.`,
    "Delete")) return;
  isLoading.value = true;
  const response = await axios.delete(
    `/api/submissions/drafts/${accno}`,
  );
  if (response.status === 200) {
    location.reload();
  }
}

</script>
