<template>
  <div class="container">
    <div class="text-end">
      <button class="btn btn-success  mb-4" data-bs-toggle="modal" data-bs-target="#newSubmissionModal">
        <font-awesome-icon :icon="['fas', 'circle-plus']"></font-awesome-icon>
        New Submission
      </button>
    </div>
    <table v-if="submissions?.length" class="table table-responsive table-striped table-hover">
      <thead>
      <th style="min-width: 120px">Accession</th>
      <th>Title</th>
      <th style="min-width: 120px">Release Date</th>
      <th style="min-width: 120px">Last Modified</th>
      <th style="min-width: 140px">Actions</th>
      </thead>
      <tbody>
      <tr v-for="submission in submissions">
        <td>{{ submission.accno }}</td>
        <td>{{ submission.title }}</td>
        <td>{{ moment(submission.rtime).format("DD MMM YYYY") }}</td>
        <td>{{ moment(submission.mtime).format("DD MMM YYYY") }}</td>
        <td>
          <button v-if="submission.status==='PROCESSED'" class="btn btn-link text-primary" @click.stop="open(submission.accno)">
            <font-awesome-icon icon="fa-solid fa-arrow-up-right-from-square"></font-awesome-icon>
          </button>
          <button v-if="submission.status==='PROCESSED'" class="btn btn-link text-primary" @click.stop="edit(submission.accno)">
            <font-awesome-icon icon="fa-edit"></font-awesome-icon>
          </button>
          <button v-if="canDelete(submission)" class="btn btn-link text-primary" @click.stop="delete(submission.accno)">
            <font-awesome-icon icon="fa-regular fa-trash-alt"></font-awesome-icon>
          </button>
        </td>
      </tr>
      </tbody>
      <tfoot>
      <tr class="border-white">
        <td colspan="5" class="text-end">
          <button v-if="offset>0" class="btn btn-outline-primary btn-sm m-2" @click="offset -= pageLength">
            <font-awesome-icon icon="fa-chevron-left"></font-awesome-icon>
            Previous
          </button>
          <button v-if="submissions.length % pageLength === 0" class="btn btn-outline-primary btn-sm m-2"
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

  <NewSubmissionModal @select="(e)=>console.log(e)" ></NewSubmissionModal>
</template>

<script setup>
import {ref, watchEffect} from 'vue';
import AuthService from "./services/AuthService";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import moment from "moment";
import router from "./router";
import axios from "axios";
import NewSubmissionModal from "@/components/NewSubmissionModal.vue";

const accession = ref('S-BIAD796');
const submissions = ref([])
const offset = ref(0)
const pageLength = ref(15)

const canDelete = (submission)=> {
  return (['S-', 'TMP_'].some((prefix) => submission.accno.indexOf(prefix) >= 0)
    && new Date(submission?.rtime).getTime() > Date.now()
    && submission.status==='PROCESSED')
    || AuthService.user?.value?.superuser
}

watchEffect(async () => {
  if (!AuthService.isAuthenticated()) return
  await axios(`${window.config.backendUrl}/api/submissions?offset=${offset.value}&limit=15`)
    .then(response => submissions.value = response.data);
})

const edit = (accno) => {
  router.push(`/edit/${accno}`)
}

const open = (accno) => {
  window.open(`${window.config.frontendUrl}/studies/${accno}`)
}

</script>
