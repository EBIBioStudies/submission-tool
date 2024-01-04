<template>
  <div class="container row mb-5"></div>
  <div v-if="hasError" class="row">
    <div class="col"></div>
    <div class="col-6 alert alert-danger">{{errorMessage}}</div>
    <div class="col"></div>
  </div>
  <div class="row ">
    <div class="col"></div>
    <div class="card col-6 gy-6">
      <!---->
      <div class="card-body">
        <h4 v-if="!succeed" class="card-title">{{title}}</h4>
        <h4 v-if="succeed" class="card-title">{{successTitle}}</h4>
        <h6 v-if="!succeed" class="card-subtitle mb-2 text-muted"> {{message}} </h6>
        <h6 v-if="succeed" class="card-subtitle mb-2 text-muted"> {{successMessage}} </h6>
        <form v-if="!succeed" @submit.prevent="submitData" name="pwdReqForm" data-testid="resetReqForm" class="">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" email="true" autofocus="" required="" v-model="email" placeholder="Email" @input="updateEmail" class="form-control"><!---->
            <div v-if="!validateEmail" class="invalid-inp">Please enter a valid email</div>
          </div>
          <button type="submit" :disabled="isValidEmail" class="btn btn-primary my-2"> {{btnTxt}} <!----></button>
          <vue-recaptcha class="captcha-root" required="" :sitekey="captchaPublicKey" @verify="onCaptchaVerified" />

        </form></div><!---->
      <div class="card-footer text-muted">
        <a href="/signin">
          <i aria-hidden="true" class="fa fa-chevron-circle-left"></i> Back to Log in
        </a>
      </div>
    </div>
  <div class="col"/>
  </div>
</template>

<script>
import AuthService from "../../services/AuthService";
import {ref} from "vue";
import { VueRecaptcha } from 'vue-recaptcha';

export default {
  methods: {
    process() {
      return process
    }
  },
  components:{
    VueRecaptcha,
  },
  setup(props, { emit }){
    const email = ref('');
    const errorMessage = ref('');
    const isValidEmail = ref(false);
    const hasError = ref(false);
    const succeed = ref(false);
    const recaptchaToken = ref('');
    const captchaPublicKey = ref(import.meta.env.VITE_CAPTCHA_PUBLIC_KEY);

    const updateEmail = (newEmail) => {
      emit('email-updated', newEmail.target.value);
    };
    const validateEmail = () => {
      if (email.value === '') {
        isValidEmail.value = false;
        return false;
      }
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      isValidEmail.value = regex.test(email.value);
      return isValidEmail.value;
    };

    const onCaptchaVerified = (response) => {
      recaptchaToken.value = response;
    };

    // const onCaptchaExpired = () => {
    //   isCaptchaVerified.value = false;
    // };

    const submitData = async () => {
      hasError.value = false;
      succeed.value = false;
      const parameters = {
        'email': email.value,
        'instanceKey': import.meta.env.VITE_INSTANCE_KEY,
        'path' :'/biostudies/submissions/activate',
        'recaptcha2-response' : recaptchaToken.value
      }
      try {
        const response = await AuthService.generalPost(props.url, parameters);
          succeed.value = true;
          console.log(response.data)
      } catch (error) {
        hasError.value = true;
        succeed.value = false;
        if(error.message)
          errorMessage.value = error.message;
      }
    }

    return{ email, errorMessage, isValidEmail, hasError, validateEmail, submitData, onCaptchaVerified, succeed, captchaPublicKey, updateEmail}
  },
  props:{
    title:{
      type: String,
      default: ''
    },
    successTitle:{
      type: String,
      default: ''
    },
    message:{
      type: String,
      default: ''
    },
    successMessage:{
      type: String,
      default: ''
    },
    btnTxt:{
      type: String,
      default: ''
    },
    url:{
      type: String,
      default: ''
    },
    siteKey:{
      type: String,
      default: '6Lc8JN0UAAAAAN4yxc0Ms6qIZ3fml-EYuuD_cTKi'
    }

  },
};

</script>

<style scoped>

</style>
