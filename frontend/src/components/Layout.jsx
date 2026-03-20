import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

const pageTitles = {
  "/app": { title: "Dashboard", subtitle: "Overview of your inventory" },
  "/app/products": { title: "Products", subtitle: "Manage your product catalog" },
  "/app/categories": { title: "Categories", subtitle: "Organize product categories" },
  "/app/movements": { title: "Stock Movements", subtitle: "Full history of all stock changes — Goods Receipt, Issue & Adjustments" },
  "/app/audit": { title: "Audit Log", subtitle: "Complete trail of all system changes by user" },
};

export default function Layout() {
  const location = useLocation();
  const page = pageTitles[location.pathname] || { title: "Inventory", subtitle: "" };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <header className="topbar">
          <div>
            <div className="topbar-title">{page.title}</div>
            <div className="topbar-subtitle">{page.subtitle}</div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
