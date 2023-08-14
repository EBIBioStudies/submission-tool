<template>
  <nav class="navbar pb-0 align-items-end justify-content-start " style="background-color:#75C8EC !important;">
    <a class="navbar-brand p-2" href="#"><img src="/src/assets/logo.svg" style="width: 300px"/></a>
    <div>
      <ul class="nav nav-tabs pe-2">
        <li class="nav-item">
          <router-link :to="`/`" class="nav-link"
                       :class="{ active:router.currentRoute.value.name==='Submissions' || router.currentRoute.value.name==='Sign In' }">
            Submissions
          </router-link>
        </li>
        <li v-if="AuthService.isAuthenticated()" class="nav-item">
          <router-link :to="`/drafts`" class="nav-link"
                       :class="{ active:router.currentRoute.value.name==='Drafts' }">
            Drafts
          </router-link>
        </li>
        <li v-if="AuthService.isAuthenticated()" class="nav-item">
          <router-link :to="`/files`" class="nav-link"
                       :class="{ active:router.currentRoute.value.name==='Files'  }">Files
          </router-link>
        </li>
        <li class="nav-item">
          <router-link :to="`/help`" class="nav-link"
                       :class="{ active:router.currentRoute.value.name==='Help'  }">Help
          </router-link>
        </li>
        <li v-if="AuthService.isAuthenticated()" class="nav-item dropdown" data-bs-toggle="tooltip"
            :data-bs-title="AuthService.user.value.fullname" icon="fa-user-circle">
          <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">
            <font-awesome-icon icon="fa-user-circle" class="fa-lg"></font-awesome-icon>
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
const logout = async () => {
  AuthService.logout()
  await router.push('/signin')
}

onMounted(() => {
  new Tooltip(document.body, {
    selector: "[data-bs-toggle='tooltip']",
  })
});

</script>

<style scoped>
.nav-tabs {
  border-bottom: 0 !important;
}

.nav-link {
  color: white
}
</style>
