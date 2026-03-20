import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", gap: 12, color: "#6b7280", fontSize: 15
      }}>
        <div className="spinner" />
        Loading...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}
