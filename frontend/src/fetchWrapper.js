import AuthService from "services/AuthService";

const originalFetch = window.fetch;

async function fetchWithToken(url, options) {
  const token = AuthService.getToken();

  if (token) {
    if (!options.headers) {
      options.headers = {};
    }
    options.headers['X-Session'] = token;
  }

  return originalFetch(url, options);
}

window.fetch = fetchWithToken;
