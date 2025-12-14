// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api/", // points to server route; change if your API is hosted elsewhere
});

// Request interceptor to attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
