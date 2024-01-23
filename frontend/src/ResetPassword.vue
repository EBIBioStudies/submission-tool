<template>
  <div class="container row mb-5"></div>
  <div v-if="!success && message" class="row">
    <div class="col"></div>
    <div class="col-6 alert alert-danger">{{ message }}</div>
    <div class="col"></div>
  </div>
  <div class="row">
    <div class="col"></div>
    <div class="col-6 gy-6">
      <div class="card">
        <div class="card-body">
          <div v-if="success">
            <h4 class="card-title">Your password has been changed.</h4>
            <h6 class="card-subtitle mb-2 text-muted">You will now be redirected to <a href='{{frontendURL}}'>BioStudies</a>.</h6>
          </div>
          <div v-else>
            <h4 class="card-title">Change your password</h4>
            <h6 class="card-subtitle mb-2 text-muted">Please provide a new password. All fields are required.</h6>
            <form  id="pwdForm" name="pwdForm"  @submit.prevent="resetPass">
              <div class="form-group">
                <label for="password1">Password</label>
                <input type="password" id="password1" v-model="form.password" minlength="6" required class="form-control" :class="{'is-invalid': form.password && !validPassword1}">
                <div v-if="form.password && !validPassword1" class="invalid-feedback">Password minimum length is 6 characters</div>
              </div>
              <div class="form-group">
                <label for="password2">Re-enter password</label>
                <input type="password" id="password2" v-model="password2" minlength="6" required class="form-control" :class="{'is-invalid':  !samePassword}">
                <div v-if="password2 && !validPassword2" class="invalid-feedback">Password minimum length is 6 characters</div>
                <div v-if="!samePassword" class="invalid-feedback">Please enter the same password as above</div>
              </div>
              <vue-recaptcha v-if="!validCaptcha" :class="{'is-invalid': !validCaptcha}" :sitekey="captchaPublicKey" class="captcha-root"
                             required @verify="onCaptchaVerified"/>
              <button class="btn btn-primary my-2" type="submit">Reset   <font-awesome-icon v-if="isLoading" icon="cog" spin />
              </button>
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
import { ref, computed, onMounted } from "vue";
import { useRoute } from 'vue-router';
import axios from 'axios';
import {VueRecaptcha} from "vue-recaptcha";
import router from "./router";

const route = useRoute();
const activationCode = ref('');
const success = ref(false);
const isLoading = ref(false);
const message = ref('');
const recaptchaToken = ref('');
const captchaPublicKey = window.config.recaptchaKey;
const frontendURL = window.config.frontendURL;
const password2 = ref('');


const form = ref({
  password: '',
  activationKey: '',
});
const validPassword1 = computed(() => {
  return form.value.password && form.value.password.length>5
});

const samePassword = computed(() => {
  return form.value.password === password2.value
});

const validPassword2 = computed(() => {
  return password2 && password2.value.length>5
});
const canSubmit = computed(() => {
  return validPassword1.value && validPassword2.value && samePassword.value && recaptchaToken.value.length > 5;
});


const validCaptcha = computed(() => {
  return recaptchaToken.value !== '';
});

const onCaptchaVerified = (response) => {
  recaptchaToken.value = response;
};

const redirectToExternalURL = () => {
  setTimeout(() => {
    // window.location.href = `${frontendURL}/studies`;
    router.push({path:"/signin"});
  }, 5000);
};

const resetPass = async () => {
  if(!canSubmit.value)
    return;
  message.value='';
  success.value=false;
  isLoading.value=true;
  form.value.activationKey = route.params.activationCode;
  try {
    const response = await axios.post(`${window.config.backendUrl}/api/auth/password/change`, form.value);
    success.value=true;
    redirectToExternalURL();
  } catch (error) {
    success.value=false;
    message.value = error?.response?.data?.log?.message || 'Unknown Error';
  }
  isLoading.value=false;
};

onMounted(() => {
  if (activationCode.value === null) {
    form.value.activationKey = route.params.activationCode;
    success.value = false;
    message.value = 'Invalid path';
  }
});

</script>


