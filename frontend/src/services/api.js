// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});

// 1) Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2) Handle 401 responses: clear storage + redirect to /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      window.location.replace("/login");
    }
    return Promise.reject(error);
  }
);

// 3) API functions
export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const getDashboard = () => api.get("/dashboard");
 

// 4) Default export
export default api;
