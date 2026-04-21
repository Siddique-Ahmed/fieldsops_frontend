import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Plus,
  Users,
  LogOut,
  UserCheck,
  Building2,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Build nav items based on role
  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      roles: ["admin", "technician", "client"],
    },
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
    {
      label: "My Jobs",
      icon: FileText,
      path: "/my-jobs",
      roles: ["technician", "client"],
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/settings",
      roles: ["admin", "technician", "client"],
    },
  ].filter((item) => item.roles.includes(user?.role));

  const isActive = (path) => location.pathname === path;

  const roleColors = {
    admin: "bg-red-500",
    technician: "bg-blue-500",
    client: "bg-green-500",
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo + Collapse Toggle */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700/60">
        {!collapsed && (
          <span className="text-xl font-extrabold text-white tracking-tight">
            Field<span className="text-blue-400">Ops</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-700 transition text-slate-400 hover:text-white"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* User Info */}
      <div className={`px-4 py-4 border-b border-slate-700/60 ${collapsed ? "items-center" : ""}`}>
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${
              roleColors[user?.role] || "bg-slate-600"
            }`}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${roleColors[user?.role]}`} />
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
              {user?.status === "pending" && (
                <p className="text-xs text-amber-400 font-medium mt-0.5">⚠ Pending</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              title={collapsed ? item.label : ""}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-sm font-medium ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/60"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-slate-700/60">
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : ""}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile Toggle Button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-xl shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ── */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 z-50 shadow-2xl transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 shadow-xl transition-all duration-300 z-30 ${
          collapsed ? "w-[68px]" : "w-64"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* ── Main Content Spacer ── */}
      <div
        className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-64"
        }`}
      />
    </>
  );
}
