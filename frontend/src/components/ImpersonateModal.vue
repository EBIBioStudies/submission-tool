<template>
  <div id="impersonateModal" aria-hidden="true" aria-labelledby="transferHelpModal" class="modal modal-sm fade">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Log in as</h5>
        </div>
        <div class="modal-body">
          <div :class="{'alert-danger': error!='', 'd-none': error===''}" class="alert">
            <div class="message">{{ error }}</div>
          </div>
          <div class="form-group">
            <div class="form-group">
              <label for="email">Email address</label> <input id="email" v-model="email" autofocus class="form-control"
                                                              name="email" required type="email">
              <div v-if="false" class="invalid-feedback">Please enter a valid email</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" type="button"  data-bs-dismiss="modal"  @click="doLogin">Log in</button>
          <button aria-label="Close" class="btn btn-default" data-bs-dismiss="modal" type="button">Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import AuthService, { LoginCredentials } from '@/services/AuthService';
import router from '@/router';

const error = ref('');
const email = ref('');

document.addEventListener('shown.bs.modal', () => {
  (document.querySelector('#email') as HTMLInputElement)?.focus();
});

const doLogin = async () => {
  try {
    const credentials : LoginCredentials = {
      login: email.value,
      password: AuthService.user.value?.sessid!,
    };
    const user = await AuthService.login(credentials);
    if (user) {
      await router.push('/');
    } else {
      error.value = 'Could not impersonate user';
    }
  } catch (error: any) {
    error.value = error?.response?.status === 401 ? 'Invalid username or password' : error?.response?.data?.log?.message || 'Unknown error';
  }
};

</script>

<style scoped>

</style>
