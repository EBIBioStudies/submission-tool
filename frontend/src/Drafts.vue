<template>
  <div class="container">
    <div class="text-end">
      <button class="btn btn-success  mb-4" data-bs-toggle="modal" data-bs-target="#newSubmissionModal">
        <font-awesome-icon :icon="['fas', 'circle-plus']"></font-awesome-icon>
        New Submission
      </button>
    </div>
    <table v-if="drafts?.length" class="table table-responsive table-striped table-hover">
      <thead>
      <th style="width: 180px">Draft Key</th>
      <th>Title</th>
      <th style="width: 75px">Actions</th>
      </thead>
      <tbody>
      <tr v-for="draft in drafts">
        <td>{{ draft.key }}</td>
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
          <button v-if="offset>0" class="btn btn-outline-primary btn-sm m-2" @click="offset -= pageLength">
            <font-awesome-icon icon="fa-chevron-left"></font-awesome-icon>
            Previous
          </button>
          <button v-if="drafts.length % pageLength === 0" class="btn btn-outline-primary btn-sm m-2"
                  @click="offset += pageLength">
            <font-awesome-icon icon="fa-chevron-right"></font-awesome-icon>
            Next
          </button>
        </td>
      </tr>
      </tfoot>
    </table>
    <div v-else class="text-center">Welcome! You can click the <b>New Submissions</b> button to start a new study draft.
    </div>


    <!--    <div class="input-group w-25">-->
    <!--      <input type="text" class="form-control" v-model="accession" placeholder="Enter accession"-->
    <!--             aria-label="Enter accession" autofocus/>-->
    <!--      <router-link :to="`/edit/${accession}`" class="btn btn-primary" role="button">Edit</router-link>-->
    <!--    </div>-->
  </div>

  <NewSubmissionModal @select="(e)=>console.log(e)"></NewSubmissionModal>
</template>

<script setup>
import {ref, watchEffect} from 'vue';
import AuthService from "./services/AuthService";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import router from "./router";
import axios from "axios";
import NewSubmissionModal from "@/components/NewSubmissionModal.vue";
import utils from "@/utils";

const accession = ref('S-BIAD796');
const drafts = ref([])
const offset = ref(0)
const pageLength = ref(15)


watchEffect(async () => {
  if (!AuthService.isAuthenticated()) return
  await axios(`${window.config.backendUrl}/api/submissions/drafts?offset=${offset.value}&limit=15`)
    .then(response => drafts.value = response.data);
})

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
  const response = await axios.delete(
    `${window.config.backendUrl}/api/submissions/drafts/${accno}`,
  );
  if (response.status === 200) {
    location.href = location.href;
  }
}

</script>
