import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ───
export const authAPI = {
  signup: (data: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    mobile?: string;
    country?: string;
    state?: string;
    city?: string;
  }) => api.post("/auth/signup", data),

  verifySignupOTP: (data: { email: string; otp: string }) =>
    api.post("/auth/verify-signup-otp", data),

  login: (data: { email: string }) =>
    api.post("/auth/login", data),

  verifyOTP: (data: { email: string; otp: string }) =>
    api.post("/auth/verify-otp", data),

  getProfile: () =>
    api.get("/auth/profile"),
};

// ─── Question API ───
export const questionAPI = {
  getByTestType: (testType: "COGNITIVE" | "APTITUDE") =>
    api.get(`/questions/${testType}`),

  getByTestTypeAdmin: (testType: "COGNITIVE" | "APTITUDE") =>
    api.get(`/questions/admin/${testType}`),
};

// ─── Test API (student) ───
export const testAPI = {
  start: () => api.post("/test/start"),

  getAttempt: (id: string) => api.get(`/test/attempt/${id}`),

  submitSection: (
    id: string,
    data: {
      testType: "COGNITIVE" | "APTITUDE";
      answers: Record<string, string>;
      timeSpent: number;
    }
  ) => api.put(`/test/${id}/submit-section`, data),

  completeTest: (id: string) => api.put(`/test/${id}/complete`),

  getMyResults: () => api.get("/test/my-results"),

  getResult: (id: string) => api.get(`/test/results/${id}`),
};

// ─── Admin Test API ───
export const adminTestAPI = {
  getAllResults: () => api.get("/test/admin/results"),
  getResult: (id: string) => api.get(`/test/results/${id}`),
};

export default api;
