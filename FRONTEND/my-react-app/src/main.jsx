import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import axios from "axios";
import "./index.css";
import "./styles/alerts.css";

// Ensure axios sends Authorization header if token already present
try {
  const token = (localStorage.getItem("token") || "").trim().replace(/^"|"$/g, "");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
} catch (e) {
  // ignore if localStorage not available
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);