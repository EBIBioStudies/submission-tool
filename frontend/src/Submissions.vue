<template>
  <div class="container">
    <NewSubmission @select="(e)=>console.log(e)" ></NewSubmission>
    <div class="d-flex justify-content-center">
      <span class="ps-1" :class="{invisible: !isLoading}" ><font-awesome-icon class="fa-spin" icon="fa-solid fa-spinner" /></span>
    </div>
    <table class="table table-responsive table-striped table-hover">
      <thead>
      <tr>
        <th style="min-width: 120px">Accession</th>
        <th>Title
          <font-awesome-icon style="margin-left: 1em" role="button" @click="searchTitle" icon="fa-solid fa-filter" size="xs"></font-awesome-icon>
          <span v-if="keywords" role="button" @click="keywords=''" class="badge text-bg-secondary filter">{{keywords}} <font-awesome-icon icon="fa-solid fa-xmark" size="xs" /> </span>
        </th>
        <th style="min-width: 120px">Release Date</th>
        <th style="min-width: 120px">Last Modified</th>
        <th style="min-width: 140px">Actions</th>
      </tr>
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
          <button v-if="showNext" class="btn btn-outline-primary btn-sm m-2"
                  @click="offset += pageLength">
            <font-awesome-icon icon="fa-chevron-right"></font-awesome-icon>
            Next
          </button>
        </td>
      </tr>
      </tfoot>
    </table>
    <div v-if="!submissions.length" class="alert alert-secondary text-center">No submissions. You can click the <b>New Submissions</b> button to start a new study draft.
    </div>
  </div>
  <a href="https://www.ebi.ac.uk/biostudies/studies/" target="_blank"> Search published submissions
    <font-awesome-icon icon="fa-solid fa-external-link-square"></font-awesome-icon>
  </a>
</template>

<script setup>
import {ref, watchEffect} from 'vue';
import AuthService from "./services/AuthService";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import moment from "moment";
import router from "./router";
import axios from "axios";
import NewSubmission from "@/components/NewSubmission.vue";
import utils from '@/utils';

const accession = ref('');
const submissions = ref([])
const offset = ref(0)
const pageLength = ref(15)
const showNext = ref(false)
const isLoading = ref(true)
const keywords = ref('');

const canDelete = (submission)=> {
  return (['S-', 'TMP_'].some((prefix) => submission.accno.indexOf(prefix) >= 0)
    && new Date(submission?.rtime).getTime() > Date.now()
    && submission.status==='PROCESSED')
    || AuthService.user?.value?.superuser
}

watchEffect(async () => {
  if (!AuthService.isAuthenticated()) return
  isLoading.value = true;
  const keywordsParameter = keywords.value==='' ? '' : `&keywords=${keywords.value}`
  await axios(`/api/submissions?offset=${offset.value}&limit=${pageLength.value+1}${keywordsParameter}`)
    .then(response =>  {
      submissions.value = response.data.slice(0,pageLength.value);
      showNext.value = response.data.length === pageLength.value+1;
      isLoading.value = false;
    });
})

const edit = (accno) => {
  router.push(`/edit/${accno}`)
}

const open = (accno) => {
  window.open(`${window.config.frontendUrl}/studies/${accno}`)
}

const searchTitle = async () => {
  keywords.value = await utils.prompt("Search title",`Please enter part of the title to search`, "Search")
}
</script>

<style scoped>
.filter {
  font-weight: normal;
  font-size: 10pt;
  margin-left: 1em;
}
</style>
