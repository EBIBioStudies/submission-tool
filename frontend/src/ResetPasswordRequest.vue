<template>
  <div class="container row mb-5"></div>
  <div v-if="hasError" class="row">
    <div class="col"></div>
    <div class="col-6 alert alert-danger">{{ errorMessage }}</div>
    <div class="col"></div>
  </div>
  <div class="row">
    <div class="col"></div>
    <div class="col-6 gy-6">
      <div class="card">
        <div class="card-body">
          <div v-if="success">
            <h4 class="card-title">Password reset accepted</h4>
            <h6 class="card-subtitle mb-2 text-muted">The link to reset your password has been sent to <b>{{ email }}</b>. Please check your email, including the spam/trash folder.</h6>
          </div>
          <div v-else>
            <h4 class="card-title">Set new password</h4>
            <h6 class="card-subtitle mb-2 text-muted">Please enter your email and we will send you a link to set your new password.</h6>
            <form @submit.prevent="submitData" name="pwdReqForm" data-testid="resetReqForm" class="">
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" autofocus required v-model="email" placeholder="Email" class="form-control" :class="{'is-invalid': email && !validEmail}">
                <div v-if="email && !validEmail" class="invalid-feedback">Please enter a valid email</div>
              </div>
              <button type="submit" :class="{disabled: !validEmail}" class="btn btn-primary my-2">Get reset link</button>
              <vue-recaptcha v-if="!validCaptcha" class="captcha-root" required :sitekey="captchaPublicKey" @verify="onCaptchaVerified" :class="{'is-invalid': !validCaptcha}"/>
              <div v-if="validEmail && !validCaptcha" class="invalid-feedback">Please select captcha</div>
            </form>
          </div>
        </div>
        <div class="card-footer text-muted">
          <router-link to="/signin">
            <font-awesome-icon :icon="['fas', 'chevron-circle-left']" /> Back to Log in
          </router-link>
        </div>
      </div>
    </div>
    <div class="col"/>
  </div>
</template>

<script setup>
import {VueRecaptcha} from "vue-recaptcha";
import {computed, ref} from 'vue';
import axios from "axios";

const email = ref('');
const errorMessage = ref('');
const hasError = ref(false);
const success = ref(false);
const recaptchaToken = ref('');
const captchaPublicKey = window.config.recaptchaKey;
const instanceKey = import.meta.env.VITE_INSTANCE_KEY;

const validEmail = computed(() => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.value);
});
const validCaptcha = computed(() => {
  return recaptchaToken.value !== '';
});

const onCaptchaVerified = (response) => {
  recaptchaToken.value = response;
};

const submitData = async () => {
  hasError.value = false;
  success.value = false;
  if (validEmail.value && validCaptcha.value) {
    const parameters = {
      email: email.value,
      path: '/biostudies/submissions/password_reset',
      'recaptcha2-response': recaptchaToken.value,
      'instanceKey':instanceKey
    };
    try {
      const response = await axios.post(`/api/auth/password/reset`, parameters);
      success.value = true;
    } catch (error) {
      hasError.value = true;
      errorMessage.value = error?.response?.data?.log?.message || 'Unknown Error';
    }
  }
};
</script>
