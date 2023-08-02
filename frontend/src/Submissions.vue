<template>
  <div class="container">
    <table v-if="submissions?.length" class="table table-responsive table-striped table-hover">
      <thead>
      <th>Accession</th>
      <th>Title</th>
      <th>Release Date</th>
      <th>Last Modified</th>
      <th>Actions</th>
      </thead>
      <tbody>
      <tr v-for="submission in submissions">
        <td>{{ submission.accno }}</td>
        <td>{{ submission.title }}</td>
        <td>{{ moment(submission.rtime).format("DD MMM YYYY") }}</td>
        <td>{{ moment(submission.mtime).format("DD MMM YYYY") }}</td>
        <td>
          <button class="btn btn-link text-primary" @click.stop="edit(submission.accno)">
            <font-awesome-icon icon="fa-edit"></font-awesome-icon>
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    <div class="input-group w-25">
      <input
        type="text"
        class="form-control"
        v-model="accession"
        placeholder="Enter accession"
        aria-label="Enter accession"
        autofocus
      />
      <router-link
        :to="`/edit/${accession}`"
        class="btn btn-primary"
        role="button"
      >Edit
      </router-link
      >
      <router-link :to="`/edit`" class="btn btn-primary" role="button"
      >New
      </router-link
      >
    </div>
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
const submissions = ref([])


watchEffect(async () => {
  if (!AuthService.isAuthenticated()) return
  await axios(`${window.config.backendUrl}/api/submissions?offset=0&limit=15`)
    .then(response => submissions.value = response.data);
})

const edit = (accno)=> {
  router.push(`/edit/${accno}`)
}

</script>
