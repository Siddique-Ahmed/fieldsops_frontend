import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateJob from "./pages/CreateJob";
import JobDetails from "./pages/JobDetails";
import Users from "./pages/Users";
import AdminSignup from "./pages/AdminSignup";
import CreateCompany from "./pages/CreateCompany";
import UpdateProfile from "./pages/UpdateProfile";
import ClientSignup from "./pages/ClientSignup";
import InviteTechnician from "./pages/InviteTechnician";
import InviteClient from "./pages/InviteClient";
import Settings from "./pages/Settings";
import EditProfile from "./pages/EditProfile";
import RoleManagement from "./pages/RoleManagement";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/signup" element={<AdminSignup />} />
          <Route path="/auth/signup-client" element={<ClientSignup />} />
          <Route path="/auth/update-profile" element={<UpdateProfile />} />

          {/* Protected Routes - Company Setup */}
          <Route
            path="/auth/create-company"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CreateCompany />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-job"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CreateJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/jobs/:jobId"
            element={
              <ProtectedRoute>
                <JobDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Users />
              </ProtectedRoute>
            }
          />

          <Route
            path="/auth/invite-technician"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <InviteTechnician />
              </ProtectedRoute>
            }
          />

          <Route
            path="/auth/invite-client"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <InviteClient />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/role-management"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <RoleManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-jobs"
            element={
              <ProtectedRoute allowedRoles={["technician", "client"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
