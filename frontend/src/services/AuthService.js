import {reactive, ref} from "vue";

const USER_KEY = 'BioStudiesUser';

const existingUser = localStorage.getItem(USER_KEY)
const user = ref({...JSON.parse(existingUser||'{}')})

const login = (credentials) => {
  return new Promise((resolve, reject) => {
    fetch(`${window.config.backendUrl}/api/auth/login`, {method: 'post', body: JSON.stringify(credentials)})
      .then(async (response) => {
        if (response.status === 200) {
          const json = await response.json()
          localStorage.setItem(USER_KEY, JSON.stringify(json));
          user.value = json
          resolve(json);
        }
        resolve(null)
      })
  });
}
const logout = () => {
  localStorage.removeItem(USER_KEY);
  user.value= {}
}

const isAuthenticated = () => {
  return !!user.value?.sessid;
}

export default { user, login, logout, isAuthenticated }
