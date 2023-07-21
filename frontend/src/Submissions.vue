<template>
  <div class="container">
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
        >Edit</router-link
      >
      <router-link :to="`/edit`" class="btn btn-primary" role="button"
        >New</router-link
      >
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue';

const accession = ref('S-BIAD796');

</script>
