<template>
  <div class="container row">
    <div class="col"></div>
    <div class="col-6 gy-6">
      <div class="alert-container">
        <div v-if="errorMessage" role="alert" class="alert alert-danger">
          <div v-html="errorMessage"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <h4 class="card-title">Welcome</h4>
          <h6 class="card-subtitle mb-4 text-muted">Please sign in to access to your studies.</h6>
          <form @submit.prevent="doLogin" name="signInForm" data-testid="signInForm">
            <div class="form-group mb-2">
              <label for="email">Email address</label>
              <input  id="email" name="email" autofocus required class="form-control" :class="{'is-invalid': invalidUsername}" v-model="username" @change="validateUsername" placeholder="Username" >
              <div v-if="invalidUsername" class="invalid-feedback">Please enter a valid email</div>
            </div>
            <div class="form-group mb-2">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required class="form-control" :class="{'is-invalid': invalidPassword}" v-model="password" @change="validatePassword" placeholder="Password">
              <div class="invalid-feedback" v-if="invalidPassword">Please enter a valid password</div>
            </div>
            <button type="submit" class="btn btn-primary" :class="{disabled: (!username || !password)}">Log In</button>
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
const invalidUsername = ref(false);
const invalidPassword = ref(false);
const errorMessage = ref(null);

const defaultErrorMessage = 'Unexpected Error - Please try again and if the problem persists, drop an email to <a href="mailto:biostudies@ebi.ac.uk">biostudies@ebi.ac.uk</a>';

const validateUsername = () => invalidUsername.value = !username.value;
const validatePassword = () => invalidPassword.value = !password.value;

const doLogin = async () => {
  if (invalidUsername.value || !invalidPassword) return;
  try {
    const credentials = {
      login: username.value,
      password: password.value,
    };
    const user = await AuthService.login(credentials);
    if (user) {
      await router.push('/');
    } else {
      errorMessage.value = defaultErrorMessage
    }
  } catch (error) {
    errorMessage.value = error?.response?.status === 401 ? 'Invalid username or password' : error?.response?.data?.log?.message || defaultErrorMessage;
  }
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
