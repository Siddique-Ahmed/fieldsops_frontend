import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jobAPI, userAPI } from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import JobHistory from "../components/JobHistory";
import AssignmentHistory from "../components/AssignmentHistory";
import ReassignTechnicianModal from "../components/ReassignTechnicianModal";
import {
  ArrowLeft,
  Save,
  Send,
  Trash2,
  Users,
  History,
} from "lucide-react";
import { toast } from "react-toastify";

const JobDetails = () => {
  const { user } = useAuth();
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [activeTab, setActiveTab] = useState("info"); // info, history, assignments

  // ✅ FIX: Always re-fetch the latest job from DB after any mutation
  const refreshJob = async () => {
    try {
      const jobResponse = await jobAPI.getJobById(jobId);
      const latest = jobResponse.data.data;
      setJob(latest);
      setNewStatus(latest.status);
    } catch (err) {
      console.error("Failed to refresh job:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const jobResponse = await jobAPI.getJobById(jobId);
        const latestJob = jobResponse.data.data;
        setJob(latestJob);
        setNewStatus(latestJob.status);

        if (user?.role === "admin") {
          const techResponse = await userAPI.getTechnicians();
          setTechnicians(techResponse.data.data || []);
        }
      } catch (err) {
        setError("Failed to load job details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, user?.role]);

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      toast.warn("Please enter a note before submitting");
      return;
    }
    try {
      await jobAPI.addNote(jobId, noteText, user?.role);
      setNoteText("");
      toast.success("Note added!");
      await refreshJob(); // ✅ re-sync with DB
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add note");
    }
  };

  const handleStatusChange = async () => {
    try {
      await jobAPI.updateJobStatus(jobId, newStatus);
      toast.success(`Status updated to "${newStatus}"`);
      await refreshJob(); // ✅ re-sync with DB
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleAssignTechnician = async (technicianId) => {
    try {
      await jobAPI.assignTechnician(jobId, technicianId);
      toast.success("Technician assigned successfully!");
      await refreshJob(); // ✅ re-sync with DB — shows Reassign panel immediately
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign technician");
    }
  };

  const handleReassignSuccess = async () => {
    await refreshJob(); // ✅ re-sync with DB after reassign
  };

  const handleDeleteJob = async () => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await jobAPI.deleteJob(jobId);
        toast.success("Job deleted");
        navigate("/dashboard");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete job");
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading job details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg font-medium">Job not found</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 text-blue-600 hover:underline text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const statusOptions = [
    "pending",
    "assigned",
    "in-progress",
    "completed",
    "cancelled",
  ];
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    assigned: "bg-blue-100 text-blue-800",
    "in-progress": "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
            <p
              className={`text-sm font-medium mt-2 inline-block px-3 py-1 rounded-full ${statusColors[job.status]}`}
            >
              {job.status}
            </p>
          </div>
          {user?.role === "admin" && (
            <button
              onClick={handleDeleteJob}
              className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6 border-b border-gray-200">
          <div className="flex gap-1 p-1">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex-1 py-3 px-4 text-center font-medium transition rounded-t-lg ${
                activeTab === "info"
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Job Information
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-3 px-4 text-center font-medium transition rounded-t-lg flex items-center justify-center gap-2 ${
                activeTab === "history"
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`flex-1 py-3 px-4 text-center font-medium transition rounded-t-lg flex items-center justify-center gap-2 ${
                activeTab === "assignments"
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Users className="w-4 h-4" />
              Assignments
            </button>
          </div>
        </div>

        {/* Info Tab */}
        {activeTab === "info" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Job Info Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Job Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Description
                    </p>
                    <p className="text-gray-900 mt-1">{job.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">
                        Client
                      </p>
                      <p className="text-gray-900 mt-1">
                        {job.clientId?.companyName ||
                          job.clientId?.userId?.name ||
                          "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm font-medium">
                        Priority
                      </p>
                      <p className="text-gray-900 mt-1 capitalize">
                        {job.priority}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm font-medium">
                        Scheduled Date
                      </p>
                      <p className="text-gray-900 mt-1">
                        {new Date(job.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm font-medium">
                        Assigned Technician
                      </p>
                      <p className="text-gray-900 mt-1">
                        {job.technicianId?.userId?.name || "Not assigned"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              {(user?.role === "admin" || user?.role === "technician") && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Update Status
                  </h2>
                  <div className="flex gap-2">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleStatusChange}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Update
                    </button>
                  </div>
                </div>
              )}

              {/* Assign Initial Technician */}
              {user?.role === "admin" && !job.technicianId && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Assign Technician
                  </h2>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {technicians.map((tech) => (
                      <button
                        key={tech._id}
                        onClick={() => handleAssignTechnician(tech._id)}
                        className="w-full p-3 text-left border border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-lg transition"
                      >
                        <p className="font-medium">{tech.userId?.name}</p>
                        <p className="text-sm text-gray-600">
                          Skills: {tech.skillSet?.join(", ") || "General"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reassign Technician */}
              {user?.role === "admin" && job.technicianId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-blue-900">
                        Currently Assigned: {job.technicianId?.userId?.name}
                      </h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Need to reassign? Use the button to find a replacement.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowReassignModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Reassign
                    </button>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Notes</h2>
                <div className="mb-6 flex gap-2">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note..."
                    rows="3"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 h-fit"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {job.notes?.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">
                      No notes yet
                    </p>
                  ) : (
                    job.notes?.map((note) => (
                      <div
                        key={note._id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <p className="text-gray-900">{note.text}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          By: {note.addedBy?.name || note.userName || "Unknown"}
                          {note.role && ` (${note.role})`} at{" "}
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="bg-white rounded-lg shadow p-6 h-fit">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Summary</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">Status</p>
                  <p
                    className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[job.status]}`}
                  >
                    {job.status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Priority</p>
                  <p className="mt-1 text-gray-900 capitalize">
                    {job.priority}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Client Contact</p>
                  <p className="mt-1 text-gray-900 text-xs">
                    {job.clientId?.phone ||
                      job.clientId?.userId?.email ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Total Notes</p>
                  <p className="mt-1 text-gray-900">{job.notes?.length || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Created</p>
                  <p className="mt-1 text-gray-900 text-xs">
                    {new Date(job.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="bg-white rounded-lg shadow p-6">
            <JobHistory jobId={jobId} />
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div className="bg-white rounded-lg shadow p-6">
            <AssignmentHistory jobId={jobId} />
          </div>
        )}

        {/* Reassign Modal */}
        <ReassignTechnicianModal
          isOpen={showReassignModal}
          onClose={() => setShowReassignModal(false)}
          jobId={jobId}
          currentTechnicianId={job.technicianId?._id}
          currentTechnicianName={job.technicianId?.userId?.name}
          onReassignSuccess={handleReassignSuccess}
        />
      </div>
    </DashboardLayout>
  );
};

export default JobDetails;
