export const logout = () => {
  localStorage.removeItem("auth");
  window.location.href = "/";
};
