import React, { useState, useEffect } from "react";
import { jobAPI } from "../services/api";
import { Clock, User, FileText, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

const JobHistory = ({ jobId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // AbortController prevents state update on unmounted component
    // (also handles React StrictMode double-invoke in development)
    const controller = new AbortController();

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await jobAPI.getJobHistory(jobId);
        if (!controller.signal.aborted) {
          setHistory(response.data.data || []);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          const msg = err.response?.data?.message || "Failed to load history";
          setError(msg);
          toast.error("Failed to load job history");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (jobId) fetchHistory();

    // Cleanup: abort in-flight request when component unmounts or jobId changes
    return () => controller.abort();
  }, [jobId]);

  const getActionBadgeColor = (action) => {
    const colorMap = {
      created: "bg-blue-100 text-blue-800",
      assigned: "bg-green-100 text-green-800",
      reassigned: "bg-purple-100 text-purple-800",
      status_changed: "bg-yellow-100 text-yellow-800",
      note_added: "bg-cyan-100 text-cyan-800",
      completed: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colorMap[action] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const formatAction = (action) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading history...</div>;
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

  if (history.length === 0) {
    return <div className="text-center py-8 text-gray-500">No history available</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Job History (Audit Trail)</h3>
      </div>

      <div className="space-y-3">
        {history.map((entry, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionBadgeColor(
                    entry.action
                  )}`}
                >
                  {formatAction(entry.action)}
                </span>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{entry.performedBy?.name || "Unknown"}</span>
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                    {entry.performedRole}
                  </span>
                </div>
              </div>
              <time className="text-sm text-gray-500">{formatDate(entry.timestamp)}</time>
            </div>

            {/* Details */}
            {entry.details && (
              <p className="text-sm text-gray-700 mb-2 ml-1">{entry.details}</p>
            )}

            {/* Changes */}
            {entry.changes && (
              <div className="bg-gray-50 rounded p-2 text-xs text-gray-600 ml-1 mb-2 font-mono">
                {entry.changes.field ? (
                  <>
                    <div className="font-semibold mb-1">Changed: {entry.changes.field}</div>
                    <div className="line-through text-red-600">
                      Old: {JSON.stringify(entry.changes.oldValue)}
                    </div>
                    <div className="text-green-600">
                      New: {JSON.stringify(entry.changes.newValue)}
                    </div>
                  </>
                ) : (
                  <div>{JSON.stringify(entry.changes, null, 2)}</div>
                )}
              </div>
            )}

            {/* Metadata */}
            {entry.metadata && (
              <div className="text-xs text-gray-600 ml-1">
                {entry.metadata.reason && (
                  <p>
                    <span className="font-semibold">Reason:</span> {entry.metadata.reason}
                  </p>
                )}
                {entry.metadata.reassignmentType && (
                  <p>
                    <span className="font-semibold">Type:</span>{" "}
                    {entry.metadata.reassignmentType}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Showing {history.length} event{history.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
};

export default JobHistory;
