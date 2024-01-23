<template>
  <div class="row">
    <div class="col"></div>
    <div class="col-7 gy-7">
      <div class="card">
        <div class="card-body">
          <div v-if="!message">
            <h5 class="card-subtitle mb-2 text-muted">Activating <font-awesome-icon :icon="['fas', 'cog']" spin /></h5>
          </div>
          <div v-else>
            <h5 class="card-subtitle mb-2 text-muted"><font-awesome-icon :icon="['fa-solid', 'fa-triangle-exclamation']" /> {{message}} </h5>
          </div>
        </div>
        <div class="card-footer text-muted">
          <a href="/signin">
            <font-awesome-icon :icon="['fas', 'chevron-circle-left']" /> Back to Log in
          </a>
        </div>
      </div>
    </div>
    <div class="col"/>
  </div>
</template>
<script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import axios from 'axios';
  const route = useRoute();
  const activationCode = ref('');
  const success = ref(false);
  const message = ref('');

  // Function to activate account
  const activateAccount = async () => {
    try {
      const response = await axios.post(`${window.config.backendUrl}/api/auth/activate/${activationCode.value}`);
      success.value=true;
      message.value = 'The activation was successful';
    } catch (error) {
      success.value=false;
      message.value = error?.response?.data?.log?.message || 'Unknown Error';
    }
  };

  // Lifecycle hook
  onMounted(() => {
    activationCode.value = route.params.activationCode;
    if (activationCode.value === null) {
      success.value = false;
      message.value = 'Invalid path';
    } else {
      activateAccount();
    }
  });
</script>




