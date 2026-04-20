import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

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

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        const newToken = response.data.data.accessToken;
        localStorage.setItem("accessToken", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

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
  createJob: (data) => apiClient.post("/jobs", data),
  getAllJobs: () => apiClient.get("/jobs"),
  getJobById: (id) => apiClient.get(`/jobs/${id}`),
  getClientJobs: (clientId) => apiClient.get(`/jobs/client/${clientId}`),
  getTechnicianJobs: (technicianId) =>
    apiClient.get(`/jobs/technician/${technicianId}`),
  assignTechnician: (data) => apiClient.post("/jobs/assign", data),
  updateJobStatus: (jobId, status) =>
    apiClient.patch(`/jobs/${jobId}/status`, { status }),
  addNote: (jobId, text) => apiClient.post(`/jobs/${jobId}/notes`, { text }),
  updateJob: (jobId, data) => apiClient.put(`/jobs/${jobId}`, data),
  deleteJob: (jobId) => apiClient.delete(`/jobs/${jobId}`),
};

export default apiClient;
