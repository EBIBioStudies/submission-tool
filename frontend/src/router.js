import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Index',
    component: () => import('./Index.vue'),
  },
  {
    path: '/edit/:accession',
    name: 'Edit',
    component: () => import('./Edit.vue'),
    props: true,
  },
  {
    path: '/new',
    name: 'New',
    component: () => import('./New.vue'),
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
