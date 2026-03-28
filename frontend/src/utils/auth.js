const TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const setAuth = (email) => {
  const payload = { email, lastActive: Date.now() };
  localStorage.setItem("auth", JSON.stringify(payload));
};

export const getAuth = () => {
  try {
    const raw = localStorage.getItem("auth");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const touch = () => {
  const cur = getAuth();
  if (!cur) return;
  cur.lastActive = Date.now();
  localStorage.setItem("auth", JSON.stringify(cur));
};

export const isAuthenticated = () => {
  const cur = getAuth();
  if (!cur) return false;
  if (Date.now() - (cur.lastActive || 0) > TIMEOUT) {
    // expired
    localStorage.removeItem("auth");
    return false;
  }
  return true;
};

export const logout = () => {
  localStorage.removeItem("auth");
  window.location.href = "/";
};

export default { setAuth, getAuth, touch, isAuthenticated, logout };
