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
        <div v-if="success" class="card-body">
          <h4 class="card-title">Thank you for registering</h4>
          <h6 class="card-subtitle mb-2 text-muted">An email has been sent with a link to activate your new account.</h6>
        </div>
        <div v-if="!success" class="card-body">
          <h4 class="card-title">Registration</h4>
          <p class="card-subtitle mb-2 text-muted"> Please provide the information below to create a new account.
            <br> <mark>Note that <strong>ORCID</strong> field is optional.</mark>
          </p>
          <form @submit.prevent="submit" name="signUpForm" data-testid="signUpForm">
            <div class="form-group mb-2">
              <label for="name">Name</label>
              <input type="text" id="name" v-model="form.name" required class="form-control" :class="{'is-invalid': form.name && !validName}">
              <div v-if="form.name && !validName" class="invalid-feedback">Please enter a valid name</div>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" v-model="form.email" required class="form-control" :class="{'is-invalid': form.email && !validEmail}">
              <div v-if="form.email && !validEmail" class="invalid-feedback">Please enter a valid email</div>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" v-model="form.password" minlength="6" required class="form-control" :class="{'is-invalid': form.password && !validPassword}">
              <div v-if="form.password && !validPassword" class="invalid-feedback">Password minimum length is 6 characters</div>
            </div>
            <div class="form-group">
              <label for="orcid">ORCID</label>
              <span class="text-muted float-end"><i>Optional</i></span>
              <input type="text" id="orcid" placeholder="1111-2222-3333-4444" v-model="form.orcid" pattern="\d{4}-\d{4}-\d{4}-\d{3}[0-9X]" class="form-control" :class="{'is-invalid': !validOrcid}">
              <div v-if="!validOrcid" class="invalid-feedback">Please enter a valid orcid in a 4*4 format, e.g., 0000-0001-2345-6789</div>
            </div>
            <div class="form-check">
              <input type="checkbox" id="terms" v-model="form.terms" required class="form-check-input">
              <label for="terms"> I have read and agree to the <a target="_blank" href="https://www.ebi.ac.uk/data-protection/privacy-notice/embl-ebi-public-website/">Privacy Notice</a> and <a target="_blank" href="https://www.ebi.ac.uk/about/terms-of-use">Terms of Use</a>, including the limited processing of personal data.</label>
            </div>
            <button type="submit" :class="{disabled: !formValid}" class="btn btn-primary"> Register </button>
            <vue-recaptcha v-if="!isCaptchaVerified" required="" class="captcha-root" :sitekey="captchaPublicKey" @verify="onCaptchaVerified"></vue-recaptcha>
          </form>
        </div>
        <div class="card-footer text-muted"><router-link to="/signin"><font-awesome-icon :icon="['fas', 'chevron-circle-left']" /> Back to Log in </router-link></div>
      </div>
    </div>
    <div class="col"></div>
  </div>
</template>


<script>

import { ref, computed } from "vue";
import {VueRecaptcha} from 'vue-recaptcha';
import axios from "axios";
import utils from '@/utils';


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
    const captchaPublicKey = window.config.recaptchaKey;

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
      return form.value.name!=='';
    });
    const validOrcid = computed(() => {
      if (form.value.orcid === '') {
        return true;
      }
      return  utils.isOrcidValid(form.value.orcid);
    });
    const validTerms = computed(() => {
      return form.value.terms
    });

    const validPassword = computed(() => {
      return form.value.password && form.value.password.length>5
    });

    const formValid = computed(() => {
      return validName && validEmail && validPassword && validTerms && isCaptchaVerified.value;
    });

    const submit = async () => {
      hasError.value = false;
      success.value = false
      form.value['path'] = '/biostudies/submissions/activate';
      form.value['notificationsEnabled'] = true;
      form.value['instanceKey'] = import.meta.env.VITE_INSTANCE_KEY;
      if (formValid.value) {
        try{
          await axios.post(`/api/auth/register`, form.value);
          success.value = true;
        }catch (error){
          hasError.value = true;
          errorMessage.value = error?.response?.data?.log?.message || 'Unknown Error';

        }
      } else {
        hasError.value = true;
        errorMessage.value = 'Please fill all required fields and verify the captcha';
      }
    };

    return { isCaptchaVerified, form, hasError, captchaPublicKey, errorMessage, validName, formValid, submit, onCaptchaVerified, validEmail, validOrcid, validTerms, validPassword, success };
  }
};
</script>

<style class="scoped">
.btn{
  margin-bottom: 10px;
}
</style>
