<template>
  <div class="container row">
    <div class="col"></div>
    <div class="col-6 gy-6">
      <div class="alert-container">
        <div v-if="serverError" role="alert" class="alert alert-danger">
          <div v-if="!errorMessage">Please check the fields below and try again, if the problem persists, drop an email to <a href="mailto:biostudies@ebi.ac.uk">biostudies@ebi.ac.uk</a></div>
          <div v-else>{{errorMessage}}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <h4 class="card-title">Welcome</h4>
          <h6 class="card-subtitle mb-2 text-muted">Please sign in to access to your studies.</h6>
          <form @submit.prevent="doLogin" name="signInForm" data-testid="signInForm">
            <div class="form-group mb-2">
              <label for="email">Email address</label>
              <input  id="email" name="email" autofocus required class="form-control" :class="{'is-invalid': invalidUsername}" v-model="username" placeholder="Username" >
              <div v-if="invalidUsername" class="invalid-feedback">Please enter a valid email with more than 6 characters</div>
            </div>
            <div class="form-group mb-2">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required class="form-control" :class="{'is-invalid': invalidPassword}" v-model="password" placeholder="Password">
              <div class="invalid-feedback" v-if="invalidPassword">Please enter a password with more than 6 characters</div>
            </div>
            <button type="submit"  class="btn btn-primary"> Log In </button>
            <div class="text-right">
              <a  href="/reset">Forgot your password?</a>
            </div>
            <div class="text-right"><a href="/activation">Resend activation email</a></div>
          </form>
        </div>
        <div class="card-footer text-muted"> Don't have an account? <a href="/signup"> Register <font-awesome-icon :icon="['fas', 'chevron-circle-right']" /> </a>
        </div>
      </div>
    </div>
    <div class="col"></div>
  </div>
</template>

<script setup>
import {ref} from "vue";
import AuthService from "./services/AuthService";
import {useRouter} from "vue-router";

const router = useRouter();
const username = ref('');
const password = ref('');
const serverError = ref(false);
const invalidUsername = ref(false);
const invalidPassword = ref(false);
const errorMessage = ref('');

const doLogin = async () => {
  if(!isValidPassword() | !isValidUsername())
    return;
  try {
    const creds = {
      login: username.value,
      password: password.value,
    };
    serverError.value = false;
    const userCreds = await AuthService.login(creds);
    if (userCreds) {
      await router.push('/');
    } else {
      serverError.value = true;
    }
  } catch (error) {
    serverError.value = true;
    if(error?.response?.data?.log?.message)
      errorMessage.value = error.response.data.log.message;
  }
}

let minLength = 4
function isValidUsername(){
  if(!username.value || username.value.length<minLength)
    invalidUsername.value = true
  else
    invalidUsername.value = false;
  return !invalidUsername.value;
}
function isValidPassword(){
  if(!password.value || password.value.length<minLength)
    invalidPassword.value = true
  else
    invalidPassword.value = false;
  return !invalidPassword.value
}

</script>

<style>
.alert-container {
  height: 90px;
}

.text-right{
  text-align: right!important;
}
</style>
