import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 8000  // 8 second timeout — fast & safe for all connections
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("soulmate_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("soulmate_user");
      window.dispatchEvent(new Event("soulmate:logout"));
    }
    return Promise.reject(error);
  }
);
