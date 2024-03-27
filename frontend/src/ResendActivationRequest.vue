<template>
  <div class="container row mb-5"></div>
  <div v-if="errorMessage" class="row">
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
            <h4 class="card-title">Activation email sent</h4>
            <h6 class="card-subtitle mb-2 text-muted">The activation link has been sent to <b>{{ email }}</b>. Please check your
              email, including the spam/trash folder.</h6>
          </div>
          <div v-else>
            <h4 class="card-title">Send activation email</h4>
            <h6 class="card-subtitle mb-2 text-muted">Please enter your email and we will send you a link to activate your
              account.</h6>
            <form class="" data-testid="resetReqForm" name="pwdReqForm" @submit.prevent="submitData">
              <div class="form-group">
                <label for="email">Email</label> <input id="email" v-model="email" :class="{'is-invalid': email && !validEmail}" autofocus class="form-control"
                                                        name="email" placeholder="Email" required
                                                        type="email">
                <div v-if="email && !validEmail" class="invalid-feedback">Please enter a valid email</div>
              </div>
              <button class="btn btn-primary my-2" :class="{'disabled': !validEmail}" type="submit">Send activation link</button>
              <vue-recaptcha v-if="!validCaptcha" :class="{'is-invalid': !validCaptcha}" :sitekey="captchaPublicKey" class="captcha-root"
                             required @verify="onCaptchaVerified"/>
            </form>
          </div>
        </div>
        <div class="card-footer text-muted">
          <a href="/signin"> <font-awesome-icon :icon="['fas', 'chevron-circle-left']" /> Back to Log in </a>
        </div>
      </div>
    </div>
    <div class="col"/>
  </div>
</template>

<script setup>
import {VueRecaptcha} from "vue-recaptcha";
import {computed, ref, watch} from 'vue';
import axios from "axios";

const email = ref('');
const errorMessage = ref(null);
const success = ref(false);
const recaptchaToken = ref('');
const captchaPublicKey = window.config.recaptchaKey;

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
  if (validEmail.value & validCaptcha.value) {
    const parameters = {
      email: email.value,
      path: '/biostudies/submissions/activate',
      'recaptcha2-response': recaptchaToken.value
    };
    try {
      const response = await axios.post(`/api/auth/retryact`, parameters);
      success.value = true;
    } catch (error) {
      errorMessage.value = error?.response?.data?.log?.message || 'Unknown Error';
    }
  }
};
</script>
