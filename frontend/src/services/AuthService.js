import { ref } from 'vue';
import axios from 'axios';

const TOKEN_COOKIE = 'BioStudiesToken';

let initialized = false;

// Helper to get cookie value by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Decode JWT payload (client-side, no verification)
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(base64Url.length + ((4 - (base64Url.length % 4)) % 4), '=');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

// Helper to set cookie (RAW TOKEN only)
const setCookie = (name, token, days = 30) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const domain = window.location.hostname;
  document.cookie = `${name}=${token}; expires=${expires}; path=/;`;
};

// Helper to delete cookie
const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
};

const user = ref({});

// Initialize auth state from cookie
const initializeAuth = async () => {
  if (initialized) return;

  const token = getCookie(TOKEN_COOKIE);

  if (!token) return;

  // Start with decoded minimal data
  const decoded = decodeJwt(token);
  
  let tempUser = { sessid: token };

  // Parse nested sub JSON
  if (decoded?.sub) {
    try {
      const subData = JSON.parse(decoded.sub);
      tempUser = { ...tempUser, ...subData };
    } catch {}
  }

  // Set user.value IMMEDIATELY so isAuthenticated() works
  user.value = tempUser;

  axios.defaults.headers.common['x-session-token'] = token;
  initialized = true;

  // Fetch full profile from /auth/profile and merge
  try {
    
    const response = await axios.get(`api/auth/profile`);

    // Merge profile data with existing (keep sessid from tempUser)
    user.value = { ...user.value, ...response.data };
  } catch (error) {
    console.warn('Profile fetch failed, using decoded:', error);
    // user.value already set to tempUser above, so no action needed
  }
};

initializeAuth().catch(console.error);

const login = (credentials) => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/api/auth/login`, credentials)
      .then(async (response) => {
        if (response.status === 200) {
          const json = response.data;
          user.value = json; // Full fresh data
          axios.defaults.headers.common['x-session-token'] = json.sessid;

          // Set RAW token cookie only (first app contract)
          setCookie(TOKEN_COOKIE, json.sessid);
          resolve(json);
        } else {
          resolve(null);
        }
      })
      .catch(reject);
  });
};

const logout = () => {
  axios.defaults.headers.common['x-session-token'] = null;
  deleteCookie(TOKEN_COOKIE);
  user.value = {};
};

const isAuthenticated = () => !!user.value?.sessid;

export default { user, initializeAuth, login, logout, isAuthenticated };
