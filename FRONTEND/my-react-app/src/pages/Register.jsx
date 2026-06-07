import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = "Confirm password is required";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("REGISTER RESPONSE:", data);

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Registration successful",
          text: "You can now sign in using your email and password.",
          timer: 1500,
          showConfirmButton: false,
          width: "320px",
          customClass: {
            popup: "small-round-alert",
            title: "alert-title",
            htmlContainer: "alert-text",
          },
        });

        navigate("/");
      } else {
        const errorMessage =
          data.email ||
          data.password ||
          data.confirm_password ||
          data.detail ||
          data.error ||
          "Registration failed";

        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: errorMessage,
          width: "320px",
          customClass: {
            popup: "small-round-alert",
          },
        });
      }
    } catch (error) {
      console.log("REGISTER ERROR:", error);
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
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <img src="/src/assets/logo.png" alt="logo" />
          <h2>Create account</h2>
          <p>
            Register with your email and password. After sign in, complete
            institution registration from the protected Institution page.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
            {errors.confirm_password && (
              <span className="error-message">{errors.confirm_password}</span>
            )}
          </div>

          <button type="submit" className="register-btn">
            Register
          </button>
        </form>

        <p className="register-text">
          Already have an account? <Link to="/" className="register-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
