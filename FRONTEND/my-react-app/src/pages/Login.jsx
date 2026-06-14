import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { showToast, showError } from "../services/alertService";
import logo from "../assets/logo.png";
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
        
        // Store token and user (trim and strip accidental quotes)
        const cleanToken = String(data.access).trim().replace(/^"|"$/g, "");
        localStorage.setItem("token", cleanToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        // Set axios default Authorization header for subsequent requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${cleanToken}`;
        
        console.log("✓ Token stored:", data.access.substring(0, 20) + "...");
        console.log("✓ User stored:", data.user);
        console.log("✓ Preparing redirect with debug modal...");

        try {
          await showToast('Login successful', 'success', 1200);
        } catch (e) {
          console.error('Toast show failed:', e);
        }

        try {
          window.location.href = '/dashboard';
        } catch (e) {
          console.error('Forced redirect failed, attempting router navigate:', e);
          try { navigate('/dashboard', { replace: true }); } catch (_) {}
        }

        return;
      } else {
        console.error("Login failed:", data);
        setLoading(false);
        await showError("Login Failed", data.error || "Invalid credentials");
      }
    } catch (error) {
      setLoading(false);
      console.error("LOGIN ERROR:", error);
      await showError("Server Error", "Something went wrong");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="logo" />
          <h2>Sign in</h2>
          <p>NACTVET Institutions Registration and Accreditation System</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
          <input type="text" name="fakeusernameremembered" style={{ display: 'none' }} />
          <input type="password" name="fakepasswordremembered" style={{ display: 'none' }} />
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
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
