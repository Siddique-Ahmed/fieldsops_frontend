import React, { useState, useEffect } from "react";
import { jobAPI } from "../services/api";
import { Users, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

const AssignmentHistory = ({ jobId }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const response = await jobAPI.getAssignmentHistory(jobId);
        setAssignments(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load assignment history");
        toast.error("Failed to load assignment history");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) fetchAssignments();
  }, [jobId]);

  const formatDate = (date) => {
    if (!date) return "Not assigned";
    return new Date(date).toLocaleString();
  };

  const getStatusBadge = (status) => {
    if (status === "active") {
      return "bg-green-100 text-green-800";
    } else if (status === "replaced") {
      return "bg-gray-100 text-gray-800";
    }
    return "bg-blue-100 text-blue-800";
  };

  const getStatusIcon = (status) => {
    if (status === "active") {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-gray-400" />;
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading assignments...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-red-900">Error</p>
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
        No assignment history available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Assignment History</h3>
      </div>

      <div className="space-y-3">
        {assignments.map((assignment, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 transition ${
              assignment.status === "active"
                ? "border-green-300 bg-green-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(assignment.status)}
                <div>
                  <h4 className="font-medium text-gray-900">
                    {assignment.technicianId?.userId?.name || "Unknown Technician"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {assignment.technicianId?.skillSet?.join(", ") || "No skills listed"}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                  assignment.status
                )}`}
              >
                {assignment.status === "active" ? "Current" : "Replaced"}
              </span>
            </div>

            {/* Timeline */}
            <div className="space-y-2 ml-7 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Assigned:</span>
                <span>{formatDate(assignment.assignedAt)}</span>
              </div>

              {assignment.unassignedAt && (
                <>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Unassigned:</span>
                    <span>{formatDate(assignment.unassignedAt)}</span>
                  </div>

                  {assignment.reason && (
                    <div className="bg-gray-100 rounded p-2 mt-2">
                      <p className="text-xs text-gray-700">
                        <span className="font-semibold">Reason:</span> {assignment.reason}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Assigned By */}
            {assignment.assignedBy && (
              <div className="mt-2 text-xs text-gray-500 ml-7">
                Assigned by: <span className="font-medium">{assignment.assignedBy?.name}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
        <p className="font-semibold mb-1">📝 Legend</p>
        <p>
          <span className="font-semibold text-green-700">Current:</span> Currently assigned
          technician
        </p>
        <p>
          <span className="font-semibold text-gray-700">Replaced:</span> Previously assigned
          technician
        </p>
      </div>
    </div>
  );
};

export default AssignmentHistory;
