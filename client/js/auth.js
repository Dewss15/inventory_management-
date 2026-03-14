const TOKEN_KEY = 'flux_token';
const USER_KEY  = 'flux_user';

export const auth = {
  setToken(t)  { localStorage.setItem(TOKEN_KEY, t); },
  getToken()   { return localStorage.getItem(TOKEN_KEY); },
  setUser(u)   { localStorage.setItem(USER_KEY, JSON.stringify(u)); },
  getUser()    { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } },
  clear()      { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); },
  isLoggedIn() { return !!localStorage.getItem(TOKEN_KEY); },
};
