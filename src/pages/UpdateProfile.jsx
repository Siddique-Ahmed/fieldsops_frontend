import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearInvitationToken } from "../store/authSlice";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";

export default function UpdateProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Read invitationToken from Redux store (set on login)
  const invitationToken = useSelector((state) => state.auth.invitationToken);
  const { user, getCurrentUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    skillSet: [],
    password: "",
    confirmPassword: "",
  });

  const availableSkills = [
    "Electrical", "Plumbing", "HVAC", "Carpentry",
    "Painting", "General Maintenance", "Welding", "Roofing",
  ];

  // Redirect already-active users away from this page
  useEffect(() => {
    if (user && user.status === "active") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSkillToggle = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skillSet: prev.skillSet.includes(skill)
        ? prev.skillSet.filter((s) => s !== skill)
        : [...prev.skillSet, skill],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.skillSet.length === 0) {
      toast.warn("Please select at least one skill");
      return;
    }
    if (!formData.password) {
      toast.warn("Please set a new password");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      toast.warn("Password must be at least 6 characters");
      return;
    }
    if (!invitationToken) {
      toast.error("Invitation token missing. Please login again.");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/verify-invitation", {
        token: invitationToken,
        skillSet: formData.skillSet,
        password: formData.password,
      });

      if (response.data.success) {
        // ✅ Clear token from Redux — flow complete
        dispatch(clearInvitationToken());
        toast.success("Profile completed! Welcome to FieldOps 🎉");
        await getCurrentUser();
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">FieldOps</h1>
          <p className="text-gray-400 mt-1">Complete your technician profile</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Complete Your Profile
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Select your skills and set a new password to get started
          </p>

          {/* No token warning */}
          {!invitationToken && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Invitation token not found. Please{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="underline font-semibold"
                >
                  login again
                </button>{" "}
                to continue.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Skills */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Your Skills *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableSkills.map((skill) => {
                  const selected = formData.skillSet.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition ${
                        selected
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-gray-200 text-gray-700 hover:border-blue-300"
                      }`}
                    >
                      {selected && <CheckCircle className="w-4 h-4 shrink-0" />}
                      {skill}
                    </button>
                  );
                })}
              </div>
              {formData.skillSet.length > 0 && (
                <p className="mt-2 text-xs text-blue-600 font-medium">
                  ✓ Selected: {formData.skillSet.join(", ")}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="border-t pt-6 space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Set Your Password *
              </label>

              <div>
                <label className="block text-xs text-gray-500 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Repeat password"
                    className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !invitationToken || formData.skillSet.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Complete Profile & Go to Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
