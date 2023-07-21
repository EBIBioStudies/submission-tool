<template>
  <div class="container row">
    <div class="col"></div>
    <div class="col-3 gy-3">
      <h4>Login</h4>
      <form @submit.prevent="doLogin">
        <div class="p-1">
          <input class="form-control" v-model="username" type="text" placeholder="Username" autofocus/>
        </div>
        <div class="p-1">
          <input class="form-control" v-model="password" type="password" placeholder="Password"/>
        </div>
        <div class="p-1 text-center">
          <button class="btn btn-primary" type="submit">Login</button>
        </div>
      </form>
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

const doLogin = async () => {
  try {
    const creds = {
      login: username.value,
      password: password.value,
    };
    const userCreds = await AuthService.login(creds);
    if (userCreds) {
      await router.push('/');
    } else {
      console.log("Login error")
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
}
</script>
