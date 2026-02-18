<template>
  <div class="row">
    <div class="col"></div>
    <div class="col-7 gy-7">
      <div class="card">
        <div class="card-body">
          <div v-if="!message">
            <h5 class="card-subtitle mb-2 text-muted">Activating
              <font-awesome-icon :icon="['fas', 'cog']" spin />
            </h5>
          </div>
          <div v-else>
            <h5 class="card-subtitle mb-2 text-muted">
              <font-awesome-icon :icon="['fa-solid', 'fa-triangle-exclamation']" class="me-2" />
              <span v-html="message"></span>
            </h5>
          </div>
        </div>
        <div class="card-footer text-muted">
          <router-link to="/signin">
            <font-awesome-icon :icon="['fas', 'chevron-circle-left']" />
            Back to Log in
          </router-link>
        </div>
      </div>
    </div>
    <div class="col" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const activationCode = ref('');
const success = ref(false);
const message = ref('');

// Function to activate account
const activateAccount = async () => {
  try {
    await axios.post(`/api/auth/activate/${activationCode.value}`);
    success.value = true;
    message.value = 'The activation was successful';
  } catch (error: any) {
    success.value = false;
    message.value = error?.response?.data?.log?.message || 'Your activation request was sent but is taking more time ' +
      'than usual. Please try to log in after a minute or two. In case of any issues, please drop us an email ' +
      'at <a href="mailto:biostudies@ebi.ac.uk">biostudies@ebi.ac.uk</a>.';
  }
};

// Lifecycle hook
onMounted(() => {
  activationCode.value = route.params.activationCode as string;
  if (activationCode.value === null) {
    success.value = false;
    message.value = 'Invalid path';
  } else {
    activateAccount();
  }
});
</script>




