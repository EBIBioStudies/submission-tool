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
window.config = {backendUrl: location.host === 'localhost:5173' ? 'http://localhost:8080' : ''};
axios.interceptors.request.use(config => {
    if(config.url.startsWith(window.config.backendUrl)) { // pass token only to backend
      config.headers['x-session-token'] = AuthService.user?.value?.sessid;
    }
    return config;
  }
);
axios.get(`${window.config.backendUrl}/config`)
  .then(async (response) => {
    if (response.status === 200) {
      window.config = {...window.config, ...response.data}
    }
    app.mount('#app');
  });


