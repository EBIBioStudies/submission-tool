import './assets/main.css';
import config from './assets/config.json'
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
axios.defaults.headers.common['x-session-token'] =  AuthService.user?.value?.sessid
window.config = config

app.mount('#app')

