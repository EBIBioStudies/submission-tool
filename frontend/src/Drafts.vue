<template>
  <div class="container">
    <div class="text-end">
      <router-link :to="`/edit`" class="btn btn-success" role="button">
        <font-awesome-icon icon="fa-circle-plus"/>
        New Submission
      </router-link>
    </div>
    <table v-if="drafts?.length" class="table table-responsive table-striped table-hover">
      <thead>
      <th>Draft Key</th>
      <th>Title</th>
      <th>Actions</th>
      </thead>
      <tbody>
      <tr v-for="draft in drafts">
        <td>{{ draft.key }}</td>
        <td>{{ getTitle(draft) }}</td>
        <td>
          <button class="btn btn-link text-primary" @click.stop="edit(draft.key)">
            <font-awesome-icon icon="fa-edit"></font-awesome-icon>
          </button>
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
</template>

<script setup>
import {ref, watchEffect} from 'vue';
import AuthService from "./services/AuthService";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import moment from "moment";
import router from "./router";
import axios from "axios";

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
  return draft.content?.section?.attributes?.find( attr=> attr.name==='Title')?.value || draft.content?.attributes?.find( attr=> attr.name==='Title')?.value
}

const edit = (accno) => {
  router.push(`/edit/${accno}`)
}

</script>
