import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);
      console.log("Response OK:", response.ok);
      console.log("Has access:", !!data.access);
      console.log("Has user:", !!data.user);

      if (response.ok && data.access && data.user) {
        console.log("✓ Login successful, storing data...");
        
        // Store token and user
        localStorage.setItem("token", data.access);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        console.log("✓ Token stored:", data.access.substring(0, 20) + "...");
        console.log("✓ User stored:", data.user);
        console.log("✓ Navigating to dashboard...");

        // Redirect immediately
        navigate("/dashboard", { replace: true });
        
        return;
      } else {
        console.error("Login failed:", data);
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.error || "Invalid credentials",
          width: "320px",
          customClass: {
            popup: "small-round-alert",
          },
        });
      }
    } catch (error) {
      setLoading(false);
      console.error("LOGIN ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Something went wrong",
        width: "320px",
        customClass: {
          popup: "small-round-alert",
        },
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/src/assets/logo.png" alt="logo" />
          <h2>Sign in</h2>
          <p>NACTVET Institutions Registration and Accreditation System</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>

        <p className="register-text">
          Don&apos;t have an account? <Link to="/register" className="register-link">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
