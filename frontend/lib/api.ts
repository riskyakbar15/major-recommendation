import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import {
  Admin,
  ApiItemResponse,
  ApiListResponse,
  ApiMessageResponse,
  ConsultationListResponse,
  ConsultationResponse,
  CreateJurusanRequest,
  CreatePertanyaanRequest,
  CreateRuleRequest,
  Jawaban,
  Jurusan,
  Konsultasi,
  LoginResponse,
  Pertanyaan,
  RefreshTokenResponse,
  Rule,
  Statistics,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Create axios instance.
// withCredentials ensures the browser sends the HttpOnly auth cookies on every
// request; tokens are never read or written by JavaScript.
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to transparently refresh an expired access token.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retrying, attempt a cookie-based token refresh.
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // The refresh token travels in an HttpOnly cookie sent automatically.
        await axios.post<RefreshTokenResponse>(
          `${API_URL}/admin/refresh`,
          {},
          { withCredentials: true },
        );

        // New access token is set as an HttpOnly cookie by the server.
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed; only redirect when inside the admin area.
        if (
          typeof window !== "undefined" &&
          window.location.pathname.startsWith("/admin")
        ) {
          window.location.href = "/admin/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// API functions for public endpoints
export const publicApi = {
  getQuestions: (): Promise<AxiosResponse<ApiListResponse<Pertanyaan>>> =>
    api.get("/questions"),
  submitConsultation: (
    jawaban: Jawaban[],
  ): Promise<AxiosResponse<ConsultationResponse>> =>
    api.post("/consultation", { jawaban }),
  getConsultationResult: (
    sessionId: string,
  ): Promise<AxiosResponse<ApiItemResponse<Konsultasi>>> =>
    api.get(`/consultation/${sessionId}`),
};

// API functions for admin endpoints
export const adminApi = {
  login: (
    username: string,
    password: string,
  ): Promise<AxiosResponse<LoginResponse>> =>
    api.post("/admin/login", { username, password }),
  logout: (): Promise<AxiosResponse<ApiMessageResponse>> =>
    api.post("/admin/logout"),
  getCurrentAdmin: (): Promise<AxiosResponse<Admin>> => api.get("/admin/me"),
  refreshToken: (): Promise<AxiosResponse<RefreshTokenResponse>> =>
    api.post("/admin/refresh"),

  // Jurusan
  getJurusan: (): Promise<AxiosResponse<ApiListResponse<Jurusan>>> =>
    api.get("/admin/jurusan"),
  getJurusanById: (
    id: number,
  ): Promise<AxiosResponse<ApiItemResponse<Jurusan>>> =>
    api.get(`/admin/jurusan/${id}`),
  createJurusan: (
    data: CreateJurusanRequest,
  ): Promise<AxiosResponse<ApiItemResponse<Jurusan>>> =>
    api.post("/admin/jurusan", data),
  updateJurusan: (
    id: number,
    data: CreateJurusanRequest,
  ): Promise<AxiosResponse<ApiItemResponse<Jurusan>>> =>
    api.put(`/admin/jurusan/${id}`, data),
  deleteJurusan: (id: number): Promise<AxiosResponse<ApiMessageResponse>> =>
    api.delete(`/admin/jurusan/${id}`),

  // Pertanyaan
  getPertanyaan: (): Promise<AxiosResponse<ApiListResponse<Pertanyaan>>> =>
    api.get("/admin/pertanyaan"),
  getPertanyaanById: (
    id: number,
  ): Promise<AxiosResponse<ApiItemResponse<Pertanyaan>>> =>
    api.get(`/admin/pertanyaan/${id}`),
  createPertanyaan: (
    data: CreatePertanyaanRequest,
  ): Promise<AxiosResponse<ApiItemResponse<Pertanyaan>>> =>
    api.post("/admin/pertanyaan", data),
  updatePertanyaan: (
    id: number,
    data: CreatePertanyaanRequest,
  ): Promise<AxiosResponse<ApiItemResponse<Pertanyaan>>> =>
    api.put(`/admin/pertanyaan/${id}`, data),
  deletePertanyaan: (id: number): Promise<AxiosResponse<ApiMessageResponse>> =>
    api.delete(`/admin/pertanyaan/${id}`),

  // Rules
  getRules: (): Promise<AxiosResponse<ApiListResponse<Rule>>> =>
    api.get("/admin/rules"),
  getRuleById: (id: number): Promise<AxiosResponse<ApiItemResponse<Rule>>> =>
    api.get(`/admin/rules/${id}`),
  createRule: (
    data: CreateRuleRequest,
  ): Promise<AxiosResponse<ApiItemResponse<Rule>>> =>
    api.post("/admin/rules", data),
  updateRule: (
    id: number,
    data: CreateRuleRequest,
  ): Promise<AxiosResponse<ApiItemResponse<Rule>>> =>
    api.put(`/admin/rules/${id}`, data),
  deleteRule: (id: number): Promise<AxiosResponse<ApiMessageResponse>> =>
    api.delete(`/admin/rules/${id}`),

  // Consultations
  getConsultations: (
    page: number = 1,
    limit: number = 10,
  ): Promise<AxiosResponse<ConsultationListResponse>> =>
    api.get(`/admin/consultations?page=${page}&limit=${limit}`),
  getConsultationDetail: (
    id: number,
  ): Promise<AxiosResponse<ApiItemResponse<Konsultasi>>> =>
    api.get(`/admin/consultations/${id}`),

  // Statistics
  getStatistics: (): Promise<AxiosResponse<ApiItemResponse<Statistics>>> =>
    api.get("/admin/statistics"),
};
