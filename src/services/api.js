import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth routes that should NEVER trigger the token refresh logic
const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/refresh-token", "/auth/logout"];

const isAuthRoute = (url = "") =>
  AUTH_ROUTES.some((route) => url.includes(route));

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          "/api/auth/refresh-token",
          {},
          { withCredentials: true },
        );

        const newToken = response.data.data.accessToken;
        localStorage.setItem("accessToken", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Only redirect if a valid session existed but expired
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // For auth routes or already-retried requests, just reject with the error
    // so the calling code (e.g. Login.jsx catch block) can handle it
    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (data) => apiClient.post("/auth/register", data),
  createCompany: (data) => apiClient.post("/auth/create-company", data),
  login: (data) => apiClient.post("/auth/login", data),
  logout: () => apiClient.post("/auth/logout"),
};

export const userAPI = {
  getCurrentUser: () => apiClient.get("/users/current"),
  getAllUsers: () => apiClient.get("/users"),
  getTechnicians: () => apiClient.get("/users/technicians"),
  getClients: () => apiClient.get("/users/clients"),
  getUserById: (id) => apiClient.get(`/users/${id}`),
  updateUser: (id, data) => apiClient.put(`/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),
  deactivateAccount: () => apiClient.post("/users/deactivate/self"),
  updateProfile: (data) => apiClient.put("/users/profile/update", data),
  changePassword: (data) => apiClient.post("/users/password/change", data),
  changeUserRole: (userId, newRole) =>
    apiClient.post("/users/role/change", { userId, newRole }),
};

export const jobAPI = {
  // Job CRUD
  createJob: (data) => apiClient.post("/jobs", data),
  getAllJobs: (params) => apiClient.get("/jobs", { params }),
  getJobById: (id) => apiClient.get(`/jobs/${id}`),
  updateJob: (jobId, data) => apiClient.put(`/jobs/${jobId}`, data),
  deleteJob: (jobId) => apiClient.delete(`/jobs/${jobId}`),

  // Job filtering by role
  getClientJobs: (clientId, params) =>
    apiClient.get(`/jobs/client/${clientId}`, { params }),
  getTechnicianJobs: (technicianId, params) =>
    apiClient.get(`/jobs/technician/${technicianId}`, { params }),

  // Job assignment
  assignTechnician: (jobId, technicianId) =>
    apiClient.patch(`/jobs/${jobId}/assign`, { technicianId }),
  reassignTechnician: (jobId, newTechnicianId, reason, reassignmentType) =>
    apiClient.patch(`/jobs/${jobId}/reassign`, {
      newTechnicianId,
      reason,
      reassignmentType,
    }),

  // Job status
  updateJobStatus: (jobId, status) =>
    apiClient.patch(`/jobs/${jobId}/status`, { status }),

  // Job notes
  addNote: (jobId, text, role) =>
    apiClient.post(`/jobs/${jobId}/notes`, { text, role }),

  // Job history & audit trail
  getJobHistory: (jobId) => apiClient.get(`/jobs/${jobId}/history`),
  getAssignmentHistory: (jobId) =>
    apiClient.get(`/jobs/${jobId}/assignment-history`),
};

export default apiClient;
