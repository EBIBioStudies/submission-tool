<template>
  <div class="container row mb-5"></div>
  <div v-if="hasError" class="row">
    <div class="col"></div>
    <div class="col-6 alert alert-danger">{{ errorMessage }}</div>
    <div class="col"></div>
  </div>
  <div class="row">
    <div class="col"></div>
    <div class="card col-6 gy-6">
      <div v-if="success" class="card-body">
        <h4 class="card-title">Thank you for registering</h4>
        <h6 class="card-subtitle mb-2 text-muted">An email has been sent with a link to activate your new account.</h6>
      </div>
      <div v-if="!success" class="card-body">
        <h4 class="card-title">Registration</h4>
        <p class="card-subtitle mb-2 text-muted"> Please provide the information below to create a new account.
          <br> <mark>Note that <strong>ORCID</strong> field is optional.</mark>
        </p>
        <form @submit.prevent="handleSubmit" name="signUpForm" data-testid="signUpForm">
          <div class="form-group mb-2">
            <label for="name">Name</label>
            <input type="text" id="name" v-model="form.name" required class="form-control">
            <div v-if="form.name && !validName" class="invalid-inp">Please enter a valid name</div>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="form.email" required class="form-control">
            <div v-if="form.email && !validEmail" class="invalid-inp">Please enter a valid email</div>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="form.password" minlength="6" required class="form-control">
            <div v-if="form.password && !validPassword" class="invalid-inp">Password minimum length is 6 characters</div>
          </div>
          <div class="form-group">
            <label for="orcid">ORCID</label>
            <span class="text-muted float-right"><i>Optional</i></span>
            <input type="text" id="orcid" v-model="form.orcid" pattern="\d{4}-\d{4}-\d{4}-\d{3}[0-9X]" class="form-control">
            <div v-if="!validOrcid" class="invalid-inp">Please enter a valid orcid</div>
          </div>
          <div class="form-check">
            <input type="checkbox" id="terms" v-model="form.terms" required class="form-check-input">
            <label for="terms"> I have read and agree to the <a target="_blank" href="https://www.ebi.ac.uk/data-protection/privacy-notice/biostudies-database">Privacy Notice</a> and <a target="_blank" href="https://www.ebi.ac.uk/about/terms-of-use">Terms of Use</a>, including the limited processing of personal data.</label>
            <div v-if="!validTerms" class="invalid-inp">Please accept terms and conditions</div>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="!isFormValid"> Register </button>
          <vue-recaptcha required="" class="captcha-root" :sitekey="captchaPublicKey" @verify="onCaptchaVerified"></vue-recaptcha>
        </form>
      </div>
      <div class="card-footer text-muted"><a href="/signin"><font-awesome-icon :icon="['fas', 'chevron-circle-left']" /> Back to Log in </a></div>
    </div>
    <div class="col"></div>
  </div>
</template>


<script>

import { ref, computed } from "vue";
import {VueRecaptcha} from 'vue-recaptcha';
import AuthService from "../../services/AuthService";

export default {
  components: { VueRecaptcha },
  setup() {
    const form = ref({
      name: '',
      email: '',
      password: '',
      orcid: '', // Optional field
      terms: false,
    });
    const hasError = ref(false);
    const errorMessage = ref('');
    const isCaptchaVerified = ref(false);
    const success = ref(false);
    const captchaPublicKey = ref(import.meta.env.VITE_CAPTCHA_PUBLIC_KEY);

    const onCaptchaVerified = (response) => {
      form.value['recaptcha2-response']=response;
      isCaptchaVerified.value = true;
    };

    const validEmail = computed(() => {
      if (form.value.email === '') {
        return false;
      }
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return  regex.test(form.value.email);
    });
    const validName = computed(() => {
      return form.value.name;
    });
    const validOrcid = computed(() => {
      if (form.value.orcid === '') {
        return true;
      }
      const regex = /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/;
      return  regex.test(form.value.orcid);
    });
    const validTerms = computed(() => {
      return form.value.terms
    });

    const validPassword = computed(() => {
      return form.value.password && form.value.password.length>5
    });

    const isFormValid = computed(() => {
      return validName && validEmail && validPassword && validTerms && isCaptchaVerified.value;
    });

    const handleSubmit = async () => {
      hasError.value = false;
      success.value = false
      form.value['path'] = '/biostudies/submissions/activate';
      form.value['notificationsEnabled'] = true;
      form.value['instanceKey'] = import.meta.env.VITE_INSTANCE_KEY;
      if (isFormValid) {
        try{
          const response = await AuthService.generalPost('/api/auth/register', form.value);
          success.value = true;
          console.log(response);
        }catch (error){
          hasError.value = true;
          if(error.message)
            errorMessage.value = error.message
          else
            errorMessage.value = 'Unknown Error';
        }
      } else {
        hasError.value = true;
        errorMessage.value = 'Please fill all required fields and verify the captcha';
      }
    };

    return { form, hasError, captchaPublicKey, errorMessage, isFormValid, handleSubmit, onCaptchaVerified, validEmail, validName, validOrcid, validTerms, validPassword, success };
  }
};
</script>
