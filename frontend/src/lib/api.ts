import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// BUG-019 fix: Check if JWT is expired before making requests
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Add 10-second buffer to avoid edge-case failures
    return payload.exp * 1000 < Date.now() - 10000;
  } catch {
    return true;
  }
}

function clearAuthAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/signup")) {
    window.location.href = "/login";
  }
}

// Attach token to every request (with expiry check)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      if (isTokenExpired(token)) {
        clearAuthAndRedirect();
        return Promise.reject(new axios.Cancel("Token expired"));
      }
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
      if (typeof window !== "undefined") {
        clearAuthAndRedirect();
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
  getByTestType: (testType: string) =>
    api.get(`/questions/${testType}`),

  getByTestTypeAdmin: (testType: string) =>
    api.get(`/questions/admin/${testType}`),

  add: (data: {
    testType: string;
    partNumber: number;
    partName: string;
    questionText: string;
    passage?: string;
    options: { label: string; text: string }[];
    correctAnswer: string;
  }) => api.post("/questions", data),

  update: (
    id: string,
    data: {
      questionText?: string;
      options?: { label: string; text: string }[];
      correctAnswer?: string;
      passage?: string;
    }
  ) => api.put(`/questions/${id}`, data),

  remove: (id: string) => api.delete(`/questions/${id}`),
};

// ─── Test API (student) ───
export const testAPI = {
  start: (serviceCode: string) => api.post("/test/start", { serviceCode }),

  getInProgress: (serviceCode?: string) =>
    api.get("/test/in-progress", { params: serviceCode ? { serviceCode } : {} }),

  getAttempt: (id: string) => api.get(`/test/attempt/${id}`),

  getQuestionsForSection: (attemptId: string, testType: string) =>
    api.get(`/test/attempt/${attemptId}/questions/${testType}`),

  submitSection: (
    id: string,
    data: {
      testType: string;
      answers: Record<string, string>;
      timeSpent: number;
    }
  ) => api.put(`/test/${id}/submit-section`, data),

  completeTest: (id: string) => api.put(`/test/${id}/complete`),

  getMyResults: () => api.get("/test/my-results"),

  getResult: (id: string) => api.get(`/test/results/${id}`),
};

// ─── Service API ───
export const serviceAPI = {
  getAll: () => api.get("/services"),
  enroll: (serviceId: string) => api.post(`/services/${serviceId}/enroll`),
  getMyEnrollments: () => api.get("/services/my-enrollments"),
  toggleServiceLock: (studentId: string, locked: boolean) =>
    api.put(`/services/admin/${studentId}/toggle-lock`, { locked }),
};

// ─── Admin Test API ───
export const adminTestAPI = {
  getAllResults: () => api.get("/test/admin/results"),
  getResult: (id: string) => api.get(`/test/results/${id}`),
  getStudentDetail: (studentId: string) =>
    api.get(`/test/admin/students/${studentId}`),
};

export default api;
