import {createRouter, createWebHistory} from 'vue-router';
import AuthService from "./services/AuthService";

const routes = [
  // ⚠ Any path added here must also be added to Proxy::redirect
  {
    path: '/',
    name: 'Submissions',
    component: () => import('./Submissions.vue'),
    meta: {requiresAuth: true}
  },
  {
    path: '/drafts',
    name: 'Drafts',
    component: () => import('./Drafts.vue'),
    meta: {requiresAuth: true}
  },
  {
    path: '/signin',
    name: 'Sign In',
    component: () => import('./Login.vue'),
  },
  {
    path: '/signup',
    name: 'Sign Up',
    component: () => import('./Register.vue'),
  },
  {
    path: '/password_reset_request',
    name: 'Reset Password Request',
    component: () => import('./ResetPasswordRequest.vue'),
  },
  {
    path: '/activation',
    name: 'Send Activation Email',
    component: () => import('./ResendActivationRequest.vue'),
  },
  {
    path: '/activate/:activationCode',
    name: 'Activate Account',
    component: () => import('./ActivateAccount.vue'),
  },
  {
    path: '/activate',
    name: 'Resend Activation Request',
    component: () => import('./ResendActivationRequest.vue'),
  },
  {
    path: '/password_reset/:activationCode',
    name: 'Reset Password',
    component: () => import('./ResetPassword.vue'),
  },
  {
    path: '/edit/:accession',
    name: 'Edit',
    component: () => import('./Edit.vue'),
    props: true,
    meta: {requiresAuth: true}
  },
  {
    path: '/edit',
    name: 'New',
    component: () => import('./Edit.vue'),
    props: true,
    meta: {requiresAuth: true}
  },  {
    path: '/help',
    name: 'Help',
    component: () => import('./Help.vue'),
    props: true,
  },
  {
    path: '/files/',
    name: 'Files',
    component: () => import('./Files.vue'),
    props: true,
    meta: {requiresAuth: true}
  },
  {
    path: '/files/:paths*',
    name: 'Files',
    component: () => import('./Files.vue'),
    props: true,
    meta: {requiresAuth: true}
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('./Profile.vue'),
    props: true,
    meta: {requiresAuth: true}
  }
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((route) => route.meta.requiresAuth)) {
    if (!AuthService.isAuthenticated()) {
      next('/signin');
    } else {
      next();
    }
  } else if (AuthService.isAuthenticated() && to.path==='/signin') {
    next('/')
  } else {
    next();
  }
});


export default router;
