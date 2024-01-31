<template>
  <nav class="navbar pb-0 align-items-end justify-content-start " style="background-color:#75C8EC !important;">
    <a class="navbar-brand p-2" href="#"><img src="/src/assets/logo.svg" style="width: 300px" /></a>
    <div>
      <ul class="nav nav-tabs pe-2">
        <li class="nav-item">
          <router-link :class="{ active:router.currentRoute.value.name==='Submissions' || router.currentRoute.value.name==='Sign In' }" :to="`/`"
                       class="nav-link">
            <font-awesome-icon icon="fa-cloud-arrow-up" />
            Submissions
          </router-link>
        </li>
        <li v-if="AuthService.isAuthenticated()" class="nav-item">
          <router-link :class="{ active:router.currentRoute.value.name==='Drafts' }" :to="`/drafts`" class="nav-link">
            <font-awesome-icon icon="fa-tags" />
            Drafts
          </router-link>
        </li>
        <li v-if="AuthService.isAuthenticated()" class="nav-item">
          <router-link :class="{ active:router.currentRoute.value.name==='Files'  }" :to="`/files`" class="nav-link">
            <font-awesome-icon icon="fa-box-archive" />
            Files
          </router-link>
        </li>
        <li class="nav-item">
          <router-link :class="{ active:router.currentRoute.value.name==='Help'  }" :to="`/help`" class="nav-link">
            <font-awesome-icon icon="fa-circle-question" />
            Help
          </router-link>
        </li>
        <li v-if="AuthService.isAuthenticated()" class="dropdown" icon="fa-user-circle">
          <a aria-expanded="false" class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button">
            <font-awesome-icon class="fa-lg" icon="fa-user-circle"></font-awesome-icon>
          </a>
          <ul class="dropdown-menu">
            <li class="dropdown-header">{{ AuthService.user.value.fullname }}</li>
            <li>
              <router-link :to="`/profile`" class="dropdown-item">Profile</router-link>
            </li>
            <li><a class="dropdown-item" href="#" @click="logout">Log out</a></li>
            <li v-if=" AuthService.user?.value?.superuser" ><hr class="dropdown-divider"></li>
            <li v-if=" AuthService.user?.value?.superuser" ><a role="button" class="dropdown-item" data-bs-target="#impersonateModal" data-bs-toggle="modal">Log in as</a></li>
          </ul>
        </li>
      </ul>
    </div>
  </nav>
  <div class="container p-4">
    <router-view></router-view>
  </div>
  <ImpersonateModal></ImpersonateModal>
</template>
<script setup>
import AuthService from "./services/AuthService";
import {useRouter} from "vue-router";
import {onMounted} from "vue";
import {Tooltip} from "bootstrap";
import ImpersonateModal from './components/ImpersonateModal.vue';

const router = useRouter();
let tooltips = null;

const logout = async () => {
  AuthService.logout();
  await router.push('/');
};

onMounted(() => {
  tooltips = new Tooltip(document.body, {
    selector: '[data-bs-toggle=\'tooltip\']',
    delay: { 'hide': 300 },
    trigger: 'mouseover',
  });
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
  const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
  if (window.ebiFrameworkRunDataProtectionBanner !== undefined) {
    window.ebiFrameworkRunDataProtectionBanner('other');
  }
});
</script>

<style scoped>
.nav-tabs {
  border-bottom: 0 !important;
}

.nav-link {
  color: white
}

.nav-link svg {
  color: white
}

.active svg {
  color: #75C8EC;
}
</style>

