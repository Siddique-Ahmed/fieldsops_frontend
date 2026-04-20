import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Clock, CheckCircle, AlertCircle, User } from "lucide-react";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  "in-progress": "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusIcons = {
  pending: <Clock className="w-4 h-4" />,
  assigned: <AlertCircle className="w-4 h-4" />,
  "in-progress": <AlertCircle className="w-4 h-4" />,
  completed: <CheckCircle className="w-4 h-4" />,
  cancelled: <AlertCircle className="w-4 h-4" />,
};

export const JobCard = ({ job, onClick }) => {
  const scheduledDate = new Date(job.scheduledAt);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg cursor-pointer transition transform hover:scale-105"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {job.description}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
            statusColors[job.status]
          }`}
        >
          {statusIcons[job.status]}
          {job.status}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-gray-600">
          <span>Client:</span>
          <span className="font-medium">
            {job.clientId?.companyName || "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between text-gray-600">
          <span>Technician:</span>
          <span className="font-medium">
            {job.technicianId?.userId?.name || "Unassigned"}
          </span>
        </div>
        <div className="flex items-center justify-between text-gray-600">
          <span>Scheduled:</span>
          <span className="font-medium">
            {formatDistanceToNow(scheduledDate, { addSuffix: true })}
          </span>
        </div>
        {job.notes?.length > 0 && (
          <div className="flex items-center justify-between text-gray-600">
            <span>Notes:</span>
            <span className="font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {job.notes.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
