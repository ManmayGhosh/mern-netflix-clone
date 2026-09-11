import axios from "axios";

// In local dev this stays "/api" and Vite's proxy (see vite.config.js) forwards
// it to the backend container. In production there's no dev-server proxy, so
// set VITE_API_URL at build time to your deployed backend's full URL,
// e.g. https://streamly-api.onrender.com/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
