import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get("refresh_token");
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/admin/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          Cookies.set("access_token", access_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");
          if (typeof window !== "undefined") {
            window.location.href = "/admin/login";
          }
        }
      } else {
        // No refresh token, redirect to login
        if (
          typeof window !== "undefined" &&
          window.location.pathname.startsWith("/admin")
        ) {
          window.location.href = "/admin/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// API functions for public endpoints
export const publicApi = {
  getQuestions: () => api.get("/questions"),
  submitConsultation: (jawaban: { pertanyaan_id: number; nilai: number }[]) =>
    api.post("/consultation", { jawaban }),
  getConsultationResult: (sessionId: string) =>
    api.get(`/consultation/${sessionId}`),
};

// API functions for admin endpoints
export const adminApi = {
  login: (username: string, password: string) =>
    api.post("/admin/login", { username, password }),
  logout: () => api.post("/admin/logout"),
  getCurrentAdmin: () => api.get("/admin/me"),
  refreshToken: (refreshToken: string) =>
    api.post("/admin/refresh", { refresh_token: refreshToken }),

  // Jurusan
  getJurusan: () => api.get("/admin/jurusan"),
  getJurusanById: (id: number) => api.get(`/admin/jurusan/${id}`),
  createJurusan: (data: any) => api.post("/admin/jurusan", data),
  updateJurusan: (id: number, data: any) =>
    api.put(`/admin/jurusan/${id}`, data),
  deleteJurusan: (id: number) => api.delete(`/admin/jurusan/${id}`),

  // Pertanyaan
  getPertanyaan: () => api.get("/admin/pertanyaan"),
  getPertanyaanById: (id: number) => api.get(`/admin/pertanyaan/${id}`),
  createPertanyaan: (data: any) => api.post("/admin/pertanyaan", data),
  updatePertanyaan: (id: number, data: any) =>
    api.put(`/admin/pertanyaan/${id}`, data),
  deletePertanyaan: (id: number) => api.delete(`/admin/pertanyaan/${id}`),

  // Rules
  getRules: () => api.get("/admin/rules"),
  getRuleById: (id: number) => api.get(`/admin/rules/${id}`),
  createRule: (data: any) => api.post("/admin/rules", data),
  updateRule: (id: number, data: any) => api.put(`/admin/rules/${id}`, data),
  deleteRule: (id: number) => api.delete(`/admin/rules/${id}`),

  // Consultations
  getConsultations: (page: number = 1, limit: number = 10) =>
    api.get(`/admin/consultations?page=${page}&limit=${limit}`),
  getConsultationDetail: (id: number) => api.get(`/admin/consultations/${id}`),

  // Statistics
  getStatistics: () => api.get("/admin/statistics"),
};
