import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Menu,
  X,
  Home,
  Plus,
  Users,
  LogOut,
  UserCheck,
  Building2,
  FileText,
  Settings as SettingsIcon,
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: Home,
      path: "/dashboard",
      roles: ["admin", "technician", "client"],
    },
    {
      label: "Settings",
      icon: SettingsIcon,
      path: "/settings",
      roles: ["admin", "technician", "client"],
    },
  ];

  if (user?.role === "admin") {
    menuItems.push(
      {
        label: "Create Job",
        icon: Plus,
        path: "/create-job",
        roles: ["admin"],
      },
      {
        label: "Invite Technician",
        icon: UserCheck,
        path: "/auth/invite-technician",
        roles: ["admin"],
      },
      {
        label: "Invite Client",
        icon: Building2,
        path: "/auth/invite-client",
        roles: ["admin"],
      },
      {
        label: "Users",
        icon: Users,
        path: "/users",
        roles: ["admin"],
      },
    );
  }

  if (user?.role === "technician") {
    menuItems.push({
      label: "My Jobs",
      icon: FileText,
      path: "/my-jobs",
      roles: ["technician"],
    });
  }

  if (user?.role === "client") {
    menuItems.push({
      label: "My Jobs",
      icon: FileText,
      path: "/my-jobs",
      roles: ["client"],
    });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-blue-600 text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 z-40 ${
          isOpen ? (isCollapsed ? "w-20" : "w-64") : "w-0 overflow-hidden"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between gap-2">
          {!isCollapsed ? (
            <>
              <h1 className="text-2xl font-bold text-blue-400">FieldOps</h1>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 hover:bg-slate-700 rounded-lg transition hidden lg:flex items-center justify-center shrink-0"
                title={isCollapsed ? "Expand" : "Collapse"}
              >
                <Menu size={20} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full p-1 hover:bg-slate-700 rounded-lg transition hidden lg:flex items-center justify-center"
              title="Expand"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* User Info Section */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm shrink-0 relative group">
              {user?.name?.charAt(0).toUpperCase()}
              {isCollapsed && (
                <div className="absolute hidden group-hover:block left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap">
                  {user?.name}
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize">
                  {user?.role}
                </p>
                {user?.status === "pending" && (
                  <p className="text-xs text-yellow-400 font-semibold">
                    ⚠️ Profile Pending
                  </p>
                )}
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.path} className="relative group">
                <button
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive(item.path)
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-700"
                  }`}
                  title={isCollapsed ? item.label : ""}
                >
                  <Icon size={20} className="shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
                {isCollapsed && (
                  <div className="absolute hidden group-hover:block left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700">
          <div className="relative group">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900 hover:text-red-200 transition font-medium"
              title={isCollapsed ? "Logout" : ""}
            >
              <LogOut size={20} className="shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
            {isCollapsed && (
              <div className="absolute hidden group-hover:block left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap">
                Logout
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Offset */}
      <div
        className={`transition-all duration-300 ${
          isOpen ? (isCollapsed ? "lg:ml-20" : "lg:ml-64") : "lg:ml-64"
        }`}
      >
        {/* Spacer for mobile */}
        <div className="h-16 lg:h-0"></div>
      </div>
    </>
  );
}
