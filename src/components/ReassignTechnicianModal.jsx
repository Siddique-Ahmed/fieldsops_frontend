import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { jobAPI, userAPI } from "../services/api";

const ReassignTechnicianModal = ({ 
  isOpen, 
  onClose, 
  jobId, 
  onReassignSuccess,
  currentTechnicianId,
  currentTechnicianName,
}) => {
  const [loading, setLoading] = useState(false);
  const [newTechnicianId, setNewTechnicianId] = useState("");
  const [reason, setReason] = useState("");
  const [reassignmentType, setReassignmentType] = useState("graceful");
  const [technicians, setTechnicians] = useState([]);

  React.useEffect(() => {
    if (isOpen) {
      fetchTechnicians();
    }
  }, [isOpen]);

  const fetchTechnicians = async () => {
    try {
      const response = await userAPI.getTechnicians();
      console.log("Technicians fetched:", response.data.data);
      setTechnicians(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch technicians:", err);
      toast.error("Failed to load technicians");
    }
  };

  const handleReassign = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!newTechnicianId) {
        toast.warn("Please select a technician");
        setLoading(false);
        return;
      }

      if (!reason.trim()) {
        toast.warn("Please provide a reason for reassignment");
        setLoading(false);
        return;
      }

      await jobAPI.reassignTechnician(
        jobId,
        newTechnicianId,
        reason,
        reassignmentType
      );

      toast.success("Technician reassigned successfully!");
      resetForm();
      onClose();
      onReassignSuccess(); // ✅ parent calls refreshJob() — no need to pass data
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reassign technician");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewTechnicianId("");
    setReason("");
    setReassignmentType("graceful");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Reassign Technician</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleReassign} className="p-6 space-y-4">
          {/* Current Technician Info */}
          {currentTechnicianName && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Currently Assigned:</span> {currentTechnicianName}
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              The current technician will be notified about this reassignment.
            </p>
          </div>

          {/* New Technician Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select New Technician * ({technicians.filter((tech) => tech._id !== currentTechnicianId).length} available)
            </label>
            <select
              value={newTechnicianId}
              onChange={(e) => setNewTechnicianId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Choose a technician --</option>
              {technicians.filter((tech) => tech._id !== currentTechnicianId).length === 0 ? (
                <option disabled>No other technicians available</option>
              ) : (
                technicians
                  .filter((tech) => tech._id !== currentTechnicianId)
                  .map((tech) => (
                    <option key={tech._id} value={tech._id}>
                      {tech.userId?.name} {tech.skillSet && `(${tech.skillSet.join(", ")})`}
                    </option>
                  ))
              )}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Reassignment *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you reassigning this job?"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Reassignment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reassignment Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="reassignmentType"
                  value="graceful"
                  checked={reassignmentType === "graceful"}
                  onChange={(e) => setReassignmentType(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-medium">Graceful</span> - Old technician can complete work
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="reassignmentType"
                  value="immediate"
                  checked={reassignmentType === "immediate"}
                  onChange={(e) => setReassignmentType(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-medium">Immediate</span> - Replace immediately
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="reassignmentType"
                  value="emergency"
                  checked={reassignmentType === "emergency"}
                  onChange={(e) => setReassignmentType(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-medium">Emergency</span> - Critical reassignment
                </span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Reassigning..." : "Reassign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReassignTechnicianModal;
