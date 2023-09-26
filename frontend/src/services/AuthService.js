import {reactive, ref} from "vue";
import axios from "axios";

const USER_KEY = 'BioStudiesUser';

const existingUser = localStorage.getItem(USER_KEY)
const user = ref({...JSON.parse(existingUser||'{}')})

const login = (credentials) => {
  return new Promise((resolve, reject) => {
    axios.post (`${window.config.backendUrl}/api/auth/login`, credentials)
      .then(async (response) => {
        if (response.status === 200) {
          const json = response.data
          user.value = json
          axios.defaults.headers.common['x-session-token'] =  json?.sessid; //axios config isn't reactive
          localStorage.setItem(USER_KEY, JSON.stringify(json));
          resolve(json);
        }
        resolve(null)
      })
  });
}
const logout = () => {
  axios.defaults.headers.common['x-session-token'] =  null; //axios config isn't reactive
  localStorage.removeItem(USER_KEY);
  user.value= {}
}

const isAuthenticated = () => {
  return !!user.value?.sessid;
}

export default { user, login, logout, isAuthenticated }
