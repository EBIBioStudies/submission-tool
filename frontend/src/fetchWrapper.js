import AuthService from "./services/AuthService";

const originalFetch = window.fetch;

async function fetchWithToken(url, options) {
  const token = AuthService.user?.value?.sessid;
  if (token) {
    if (!options) options={}
    if (!options.headers) options.headers = {};
    options.headers['x-session-token'] = token;
  }

  return originalFetch(url, options);
}

window.fetch = fetchWithToken;
