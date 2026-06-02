import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
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
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);

      if (response.ok) {
        localStorage.setItem("token", data.access);
        localStorage.setItem("user", JSON.stringify(data.user));

        await Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: "Redirecting to dashboard...",
          timer: 1500,
          showConfirmButton: false,
          width: "320px",
          customClass: {
            popup: "small-round-alert",
            title: "alert-title",
            htmlContainer: "alert-text",
          },
        });

        navigate("/dashboard");
      } else {
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
      console.log("LOGIN ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Something went wrong",
        width: "320px",
        customClass: {
          popup: "small-round-alert",
        },
      });
    } finally {
      setLoading(false);
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
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>

        <p className="register-text">
          Don&apos;t have account? <Link to="/register" className="register-link">Register institution</Link>
        </p>
      </div>
    </div>
  );
}
