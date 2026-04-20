import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, LogOut, Home, Briefcase, Users } from "lucide-react";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-linear-to-r from-slate-900 to-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 group relative cursor-help">
          <Briefcase className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-bold">FO</h1>
          <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap">
            FieldOps
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:text-blue-400 transition"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>

          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/jobs")}
              className="flex items-center gap-2 hover:text-blue-400 transition"
            >
              <Briefcase className="w-5 h-5" />
              Jobs
            </button>
          )}

          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/users")}
              className="flex items-center gap-2 hover:text-blue-400 transition"
            >
              <Users className="w-5 h-5" />
              Users
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
