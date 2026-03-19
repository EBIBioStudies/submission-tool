import { ref } from 'vue';
import type { Ref } from 'vue';
import axios from 'axios';

export interface User {
  sessid: string;
  uploadType: 'ftp' | 'nfs';
  fullname: string;
  email: string;
  allow: string[];
  deny: string[];
  superuser: boolean;
  secret: string;

  orcid?: string;
  username?: string;
  lastName?: string;
}

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface JWTPayload {
  sub?: string;
  exp?: number;
  [key: string]: any;
}

const TOKEN_COOKIE = 'BioStudiesToken';

let initialized = false;

// Helper to get cookie value by name
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Decode JWT payload (client-side, no verification)
const decodeJwt = (token: string): JWTPayload | null => {
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
const setCookie = (name: string, token: string, days = 30): void => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${token}; expires=${expires}; path=/;`;
};

// Helper to delete cookie
const deleteCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
};

const user: Ref<Partial<User>> = ref({});

// Initialize auth state from cookie
const initializeAuth = async (): Promise<void> => {
  if (initialized) return;

  const token = getCookie(TOKEN_COOKIE);

  if (!token) return;

  // Start with decoded minimal data
  const decoded = decodeJwt(token);

  let tempUser: Partial<User> = { sessid: token };

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
    const response = await axios.get<User>(`api/auth/profile`);

    // Merge profile data with existing (keep sessid from tempUser)
    user.value = { ...user.value, ...response.data };
  } catch (error) {
    console.warn('Profile fetch failed, using decoded:', error);
    // user.value already set to tempUser above, so no action needed
  }
};

initializeAuth().catch(console.error);

const login = (credentials: LoginCredentials): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    axios
      .post<User>(`/api/auth/login`, credentials)
      .then(async (response) => {
        if (response.status === 200) {
          const json = response.data;
          user.value = json; // Full fresh data
          axios.defaults.headers.common['x-session-token'] = json.sessid;

          // Set RAW token cookie only (first app contract)
          setCookie(TOKEN_COOKIE, json.sessid!);
          resolve(json);
        } else {
          resolve(null);
        }
      })
      .catch(reject);
  });
};

const logout = (): void => {
  axios.defaults.headers.common['x-session-token'] = null;
  deleteCookie(TOKEN_COOKIE);
  user.value = {};
};

const isAuthenticated = (): boolean => !!user.value?.sessid;

export default { user, initializeAuth, login, logout, isAuthenticated };
