<template>
  <div v-if="authLoading" class="d-flex justify-content-center align-items-center vh-100">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <template v-else>
    <nav class="navbar pb-0 align-items-end justify-content-start" style="background-color:#75C8EC !important;">
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
          <li v-if="isAuthenticated" class="nav-item">
            <router-link :class="{ active:router.currentRoute.value.name==='Drafts' }" :to="`/drafts`" class="nav-link">
              <font-awesome-icon icon="fa-tags" />
              Drafts
            </router-link>
          </li>
          <li v-if="isAuthenticated" class="nav-item">
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
          <li v-if="isAuthenticated" class="dropdown" icon="fa-user-circle">
            <a aria-expanded="false" class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button">
              <font-awesome-icon class="fa-lg" icon="fa-user-circle"></font-awesome-icon>
            </a>
            <ul class="dropdown-menu">
              <li class="dropdown-header">{{ user.fullname || 'User' }}</li>
              <li>
                <router-link :to="`/profile`" class="dropdown-item">Profile</router-link>
              </li>
              <li><a class="dropdown-item" href="#" @click="logout">Log out</a></li>
              <li v-if="user.superuser"><hr class="dropdown-divider"></li>
              <li v-if="user.superuser"><a role="button" class="dropdown-item" data-bs-target="#impersonateModal" data-bs-toggle="modal">Log in as</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
    <div class="container p-4">
      <router-view />
    </div>
    <ImpersonateModal />
  </template>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import AuthService from './services/AuthService';
import ImpersonateModal from './components/ImpersonateModal.vue';
import * as bootstrap from 'bootstrap';

const router = useRouter();
const basePath = import.meta.env.VITE_BASE_URL || '/';

// Reactive auth state
const user = AuthService.user;
const authLoading = ref(true);
const isAuthenticated = computed(() => !!user.value?.sessid);

const logout = async () => {
  AuthService.logout();
  await router.push(`${basePath}/`);
};

onMounted(async () => {
  try {
    await AuthService.initializeAuth();
  } finally {
    authLoading.value = false;  // Always unblock (even on error)
  }

  // UI init after auth
  await nextTick();
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
  [...popoverTriggerList].forEach(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));

  if ((window as any).ebiFrameworkRunDataProtectionBanner !== undefined) {
    (window as any).ebiFrameworkRunDataProtectionBanner('other');
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

