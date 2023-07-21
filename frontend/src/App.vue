<template>
  <nav class="navbar pb-0 align-items-end" style="background-color:#75C8EC !important;">
    <a class="navbar-brand p-2" href="#"><img src="/src/assets/logo.svg" style="width: 300px"/></a>
    <div>
      <ul class="nav nav-tabs pe-2">
        <li class="nav-item">
          <router-link :to="`/`" class="nav-link"
                       :class="{ active:router.currentRoute.value.name==='Submissions'  }">Submissions
          </router-link>
        </li>
        <li class="nav-item">
          <router-link :to="`/files`" class="nav-link"
                       :class="{ active:router.currentRoute.value.name==='Files'  }">Files
          </router-link>
        </li>
        <li class="nav-item">
          <router-link :to="`/help`" class="nav-link"
                       :class="{ active:router.currentRoute.value.name==='Help'  }">Help
          </router-link>
        </li>
        <li v-if="AuthService.isAuthenticated()" class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">
            <font-awesome-icon data-bs-toggle="tooltip"
                               :data-bs-title="AuthService.user.value.fullname" icon="fa-user-circle"
                               class="fa-lg"></font-awesome-icon>
          </a>
          <ul class="dropdown-menu dropdown-menu-end ">
            <li><a class="dropdown-item" href="#" @click="logout">Logout</a></li>
          </ul>
        </li>
      </ul>
    </div>
  </nav>
  <div class="container p-4">
    <router-view></router-view>
  </div>
</template>
<script setup>
import AuthService from "./services/AuthService";
import {useRouter} from "vue-router";
import {onMounted} from "vue";
import {Tooltip} from "bootstrap";

const router = useRouter();
const logout = () => {
  AuthService.logout()
  router.push('/')
}

onMounted(() => {
  new Tooltip(document.body, {
    selector: "[data-bs-toggle='tooltip']",
  })
});

</script>
