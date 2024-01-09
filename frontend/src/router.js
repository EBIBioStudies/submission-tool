import {createRouter, createWebHistory} from 'vue-router';
import AuthService from "./services/AuthService";

const routes = [
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
    path: '/reset',
    name: 'Reset Password',
    component: () => import('./ResetPassword.vue'),
  },
  {
    path: '/activation',
    name: 'Send Activation Email',
    component: () => import('./EmailActivation.vue'),
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
