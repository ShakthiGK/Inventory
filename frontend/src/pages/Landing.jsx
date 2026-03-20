import { Link } from "react-router-dom";
import {
  Package, BarChart3, Tag, AlertTriangle,
  CheckCircle, ArrowRight, Shield, Zap, Globe
} from "lucide-react";

const features = [
  {
    icon: <Package size={24} />,
    title: "Product Management",
    desc: "Add, edit, and organize your entire product catalog with rich details including SKU, pricing, and units.",
    color: "blue",
  },
  {
    icon: <BarChart3 size={24} />,
    title: "Real-time Dashboard",
    desc: "Get an instant overview of your inventory value, stock levels, and key metrics at a glance.",
    color: "green",
  },
  {
    icon: <AlertTriangle size={24} />,
    title: "Low Stock Alerts",
    desc: "Never run out of stock again. Set custom thresholds and get visual alerts when items run low.",
    color: "yellow",
  },
  {
    icon: <Tag size={24} />,
    title: "Category Organization",
    desc: "Structure your inventory with categories to keep everything organized and easy to find.",
    color: "purple",
  },
  {
    icon: <Zap size={24} />,
    title: "Fast & Responsive",
    desc: "Built with modern tech — blazing fast search, filtering, and real-time stock updates.",
    color: "orange",
  },
  {
    icon: <Shield size={24} />,
    title: "Secure Access",
    desc: "Sign in with your Google account for secure, hassle-free authentication.",
    color: "red",
  },
];

const stats = [
  { value: "100%", label: "Real-time Updates" },
  { value: "∞", label: "Products Supported" },
  { value: "Free", label: "To Get Started" },
];

export default function Landing() {
  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <div className="landing-brand-icon">
              <Package size={22} color="#fff" />
            </div>
            <span>InvenTrack</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <Link to="/login" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">
          <CheckCircle size={14} />
          Free to use · No credit card required
        </div>
        <h1 className="hero-title">
          Manage Your Inventory
          <span className="hero-title-accent"> Smarter & Faster</span>
        </h1>
        <p className="hero-subtitle">
          InvenTrack helps small businesses track products, monitor stock levels,
          and stay on top of inventory — all in one beautiful, easy-to-use dashboard.
        </p>
        <div className="hero-cta">
          <Link to="/login" className="btn btn-primary">
            Get Started Free <ArrowRight size={16} />
          </Link>
          <a href="#features" className="btn btn-secondary">
            See Features
          </a>
        </div>

        {/* Stats bar */}
        <div className="hero-stats">
          {stats.map((s) => (
            <div key={s.label} className="hero-stat">
              <div className="hero-stat-value">{s.value}</div>
              <div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* App preview mockup */}
        <div className="hero-preview">
          <div className="preview-browser">
            <div className="preview-browser-bar">
              <div className="preview-dots">
                <span /><span /><span />
              </div>
              <div className="preview-url">localhost:5173/app</div>
            </div>
            <div className="preview-content">
              <div className="preview-sidebar">
                <div className="preview-logo-block" />
                {["Dashboard", "Products", "Categories"].map((item, i) => (
                  <div key={item} className={`preview-nav-item ${i === 0 ? "active" : ""}`}>
                    <div className="preview-nav-dot" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="preview-body">
                <div className="preview-stats-row">
                  {[
                    { label: "Products", color: "#4f46e5" },
                    { label: "Low Stock", color: "#f59e0b" },
                    { label: "Out of Stock", color: "#ef4444" },
                    { label: "Total Value", color: "#10b981" },
                  ].map((c) => (
                    <div key={c.label} className="preview-stat-card">
                      <div className="preview-stat-icon" style={{ background: c.color + "20", color: c.color }} />
                      <div>
                        <div className="preview-stat-num" />
                        <div className="preview-stat-lbl">{c.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="preview-table-card">
                  <div className="preview-table-header" />
                  {[1, 2, 3, 4].map((r) => (
                    <div key={r} className="preview-table-row">
                      <div className="preview-col wide" />
                      <div className="preview-col" />
                      <div className="preview-col" />
                      <div className="preview-badge" style={{
                        background: r === 2 ? "#fef3c7" : r === 4 ? "#fee2e2" : "#d1fae5",
                      }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-header">
          <div className="section-tag">Features</div>
          <h2 className="section-title">Everything you need to manage inventory</h2>
          <p className="section-subtitle">
            A complete set of tools designed to keep your stock under control.
          </p>
        </div>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className={`feature-icon ${f.color}`}>{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="how-section" id="how-it-works">
        <div className="section-header">
          <div className="section-tag">How it works</div>
          <h2 className="section-title">Up and running in minutes</h2>
        </div>
        <div className="steps-grid">
          {[
            { step: "01", title: "Sign in with Google", desc: "No registration form — just click and you're in using your existing Google account." },
            { step: "02", title: "Add your categories", desc: "Organize products by creating categories like Electronics, Clothing, or Raw Materials." },
            { step: "03", title: "Add your products", desc: "Enter product details, set prices, initial stock quantities and low stock thresholds." },
            { step: "04", title: "Track & manage", desc: "Monitor your dashboard, update stock as items come in or go out, and act on alerts." },
          ].map((s) => (
            <div key={s.step} className="step-card">
              <div className="step-number">{s.step}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <Globe size={40} className="cta-icon" />
          <h2 className="cta-title">Ready to take control of your inventory?</h2>
          <p className="cta-subtitle">Join now and start managing your stock in minutes.</p>
          <Link to="/login" className="btn btn-white">
            Get Started Free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <div className="landing-brand-icon" style={{ width: 28, height: 28 }}>
            <Package size={16} color="#fff" />
          </div>
          <span>InvenTrack</span>
        </div>
        <p>© {new Date().getFullYear()} InvenTrack. Built with FastAPI, React & MongoDB.</p>
      </footer>
    </div>
  );
}
