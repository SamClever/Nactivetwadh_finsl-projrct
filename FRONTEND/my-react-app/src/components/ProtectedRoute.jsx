import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {

  // Read and normalise token
  const rawToken = localStorage.getItem("token");
  const token = typeof rawToken === 'string' && rawToken.trim()
    ? rawToken.trim().replace(/^\"|\"$/g, '')
    : null;

  // Read and parse user safely
  let user = null;
  const rawUser = localStorage.getItem("user");
  if (rawUser) {
    try {
      user = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser;
    } catch (e) {
      try {
        // strip accidental surrounding quotes and retry
        user = JSON.parse(rawUser.replace(/^\"|\"$/g, ''));
      } catch (e2) {
        user = null;
      }
    }
  }

  // Debug logs to help trace why redirection might fail
  try {
    console.debug('ProtectedRoute check: token=', token ? token.substring(0,20)+'...' : token, 'user=', user);
  } catch (_) {}

  return (token && user) ? children : <Navigate to="/" replace />;

}