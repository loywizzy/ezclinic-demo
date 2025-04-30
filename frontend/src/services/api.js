import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});

export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const getDashboard = () =>
  api.get("/dashboard", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

export default api;
