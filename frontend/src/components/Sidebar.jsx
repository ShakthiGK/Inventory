import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, Tag, LogOut, ArrowLeftRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Sidebar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Package size={20} color="#fff" />
        </div>
        <div>
          <h1>InvenTrack</h1>
          <span>Inventory Manager</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Menu</div>
        <NavLink to="/app" end className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>
        <NavLink to="/app/products" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <Package size={18} />
          Products
        </NavLink>
        <NavLink to="/app/categories" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <Tag size={18} />
          Categories
        </NavLink>

        <div className="nav-section-title" style={{ marginTop: 12 }}>Enterprise</div>
        <NavLink to="/app/movements" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <ArrowLeftRight size={18} />
          Stock Movements
        </NavLink>
        <NavLink to="/app/audit" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <ShieldCheck size={18} />
          Audit Log
        </NavLink>
      </nav>

      {user && (
        <div className="sidebar-user">
          <img
            src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "U")}&background=4f46e5&color=fff`}
            alt={user.displayName}
            className="user-avatar"
          />
          <div className="user-info">
            <div className="user-name">{user.displayName || "User"}</div>
            <div className="user-email">{user.email}</div>
          </div>
          <button className="btn-icon logout-btn" title="Logout" onClick={handleLogout}>
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}
