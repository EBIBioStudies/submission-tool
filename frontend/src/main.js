import './assets/main.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import router from './router';
import {library} from '@fortawesome/fontawesome-svg-core';
import {fas} from '@fortawesome/free-solid-svg-icons';
import {far} from '@fortawesome/free-regular-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

import {createApp, reactive, ref} from 'vue';
import App from './App.vue';
import AuthService from "./services/AuthService";
import axios from "axios";

library.add(fas);
library.add(far);
const app = createApp(App);
app.use(router);
app.component('font-awesome-icon', FontAwesomeIcon);
axios.interceptors.request.use(config => {
    if(config.url.startsWith('/')) { // pass token only to backend
      config.headers['x-session-token'] = AuthService.user?.value?.sessid;
    }
    return config; //TODO: fix url if app is not deployed on root context path
  }
);
axios.get(`/config`)
  .then(async (response) => {
    if (response.status === 200) {
      window.config = {...window.config, ...response.data}
    }
    app.mount('#app');
  });


