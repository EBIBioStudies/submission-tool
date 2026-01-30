<template>
  <div class="col-lg-8 mx-auto p-3 py-md-5">
    <div v-if="isLoading" class="d-flex justify-content-center">
      <span v-if="isLoading" class="ps-1"><font-awesome-icon class="fa-spin" icon="fa-solid fa-spinner" /></span>
    </div>
    <div v-if="!isLoading">
      <div class="row p-4 bg-light rounded rounded-3 card">
        <div class="card-body">
          <h4 class="card-title" v-if="AuthService?.user?.value?.fullname">{{ AuthService.user.value.fullname }}</h4>
          <dl>
            <dt v-if="AuthService?.user?.value?.email">Email</dt>
            <dd v-if="AuthService?.user?.value?.email">{{ AuthService.user.value.email }}</dd>
            <dt v-if="AuthService?.user?.value?.orcid">ORCID</dt>
            <dd v-if="AuthService?.user?.value?.orcid">{{ AuthService.user.value.orcid }}</dd>
          </dl>
        </div>
        <div class="col-md-10" v-if="collections.length">
          <h5 class="card-subtitle mb-2">Collections</h5>
          <ul>
            <li v-for="collection in collections">{{ collection.title }}</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="alert alert-light mt-5 justify-content-center d-flex" role="alert">
      For any changes, please contact us at&nbsp;<a href="mailto:biostudies@ebi.ac.uk">biostudies@ebi.ac.uk</a></div>
  </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import AuthService from './services/AuthService';
import { ref, watchEffect } from 'vue';
import axios from 'axios';

export interface Collection {
  title: string,
  accno: string,
}

const isLoading = ref(true);
const collections = ref<Collection[]>([]);

watchEffect(async () => {
  if (!AuthService.isAuthenticated()) return;
  await axios(`/api/collections`)
    .then(response => {
        collections.value = response.data;
        isLoading.value = false;
      },
    );
});

</script>

<style scoped>

</style>
