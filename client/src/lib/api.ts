import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // We can add global error toast logic here if needed
    // 401 Unauthorized is primarily handled by the auth state (Zustand checkAuth)
    return Promise.reject(error);
  }
);
