import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children
}) {

  const token = localStorage.getItem("token");
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  // Require BOTH token and user to be present
  return (token && user)
    ? children
    : <Navigate to="/" replace />;

}