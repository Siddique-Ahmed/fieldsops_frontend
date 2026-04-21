import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jobAPI, userAPI } from "../services/api";
import JobCard from "../components/JobCard";
import DashboardLayout from "../components/DashboardLayout";
import {
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  TrendingUp,
} from "lucide-react";

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        let jobsData = [];

        // Fetch jobs based on role
        if (user?.role === "admin") {
          const response = await jobAPI.getAllJobs();
          jobsData = response.data.data;
        } else if (user?.role === "client") {
          // ✅ FIX: Get the Client profile ID from profileRef
          const response = await userAPI.getCurrentUser();
          const clientProfileId = response.data.data.profileRef?.client;
          if (clientProfileId) {
            const jobsResponse = await jobAPI.getClientJobs(clientProfileId);
            jobsData = jobsResponse.data.data;
          }
        } else if (user?.role === "technician") {
          // ✅ FIX: Get the Technician profile ID from profileRef
          const response = await userAPI.getCurrentUser();
          const technicianProfileId = response.data.data.profileRef?.technician;
          if (technicianProfileId) {
            const jobsResponse = await jobAPI.getTechnicianJobs(technicianProfileId);
            jobsData = jobsResponse.data.data;
          }
        }

        setJobs(jobsData);

        // Calculate stats
        const stats = {
          total: jobsData.length,
          pending: jobsData.filter((j) => j.status === "pending").length,
          inProgress: jobsData.filter((j) => j.status === "in-progress").length,
          completed: jobsData.filter((j) => j.status === "completed").length,
        };
        setStats(stats);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.role, user?.id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="border-b pb-6">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back,{" "}
            <span className="font-semibold text-blue-600">{user?.name}</span>!
            <span className="ml-2 capitalize text-gray-500">
              ({user?.role})
            </span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Jobs"
            value={stats.total}
            icon={<Briefcase className="w-8 h-8" />}
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={<AlertCircle className="w-8 h-8" />}
            bgColor="bg-yellow-50"
            iconColor="text-yellow-600"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<Clock className="w-8 h-8" />}
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle className="w-8 h-8" />}
            bgColor="bg-green-50"
            iconColor="text-green-600"
          />
        </div>

        {/* Quick Stats */}
        {stats.total > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Performance Overview
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.total > 0
                    ? Math.round((stats.completed / stats.total) * 100)
                    : 0}
                  %
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.inProgress}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Awaiting Action</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Jobs Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {user?.role === "admin" ? "All Jobs" : "Your Jobs"}
            </h2>
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/create-job")}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium"
              >
                <Plus className="w-5 h-5" />
                Create Job
              </button>
            )}
          </div>

          <div className="p-6">
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  No jobs found
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {user?.role === "admin"
                    ? "Create a new job to get started"
                    : "No jobs assigned yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onClick={() => navigate(`/jobs/${job._id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Stat Card Component
function StatCard({ title, value, icon, bgColor, iconColor }) {
  return (
    <div className={`${bgColor} rounded-lg p-6 border border-gray-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${iconColor}`}>{icon}</div>
      </div>
    </div>
  );
}

export default Dashboard;
