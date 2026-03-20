import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import toast from "react-hot-toast";
import { Package, ArrowLeft, Eye, EyeOff } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Welcome!");
      navigate("/app");
    } catch (err) {
      toast.error(err.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(user, { displayName: form.name });
        toast.success("Account created! Welcome aboard.");
      } else {
        await signInWithEmailAndPassword(auth, form.email, form.password);
        toast.success("Welcome back!");
      }
      navigate("/app");
    } catch (err) {
      const msg = {
        "auth/email-already-in-use": "Email is already registered.",
        "auth/wrong-password": "Incorrect password.",
        "auth/user-not-found": "No account found with this email.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-email": "Please enter a valid email.",
        "auth/invalid-credential": "Invalid email or password.",
      }[err.code] || "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <Link to="/" className="auth-back">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="auth-left-content">
          <div className="auth-brand">
            <div className="landing-brand-icon">
              <Package size={22} color="#fff" />
            </div>
            <span>InvenTrack</span>
          </div>
          <h2 className="auth-left-title">Take control of your stock</h2>
          <p className="auth-left-sub">
            Track products, manage categories, and monitor inventory levels — all in one place.
          </p>
          <ul className="auth-perks">
            {[
              "Real-time stock monitoring",
              "Low stock alerts",
              "Powerful dashboard analytics",
              "Category-based organization",
            ].map((p) => (
              <li key={p}>
                <span className="perk-check">✓</span> {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="auth-left-decoration" />
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          {/* Tab toggle */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => setMode("login")}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
          </div>

          <h1 className="auth-title">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Sign in to access your inventory dashboard."
              : "Get started for free — no credit card required."}
          </p>

          {/* Google */}
          <button className="btn-google" onClick={handleGoogle} disabled={googleLoading}>
            <GoogleIcon />
            {googleLoading ? "Signing in..." : `Continue with Google`}
          </button>

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="John Smith"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#9ca3af",
                    display: "flex", alignItems: "center"
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
              {loading
                ? mode === "login" ? "Signing in..." : "Creating account..."
                : mode === "login" ? "Sign In" : "Create Account"
              }
            </button>
          </form>

          <p className="auth-switch">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")}>
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
