import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const rawToken = localStorage.getItem('token');
  const token = rawToken && rawToken.trim().replace(/^"|"$/g, '');

  const rawUser = localStorage.getItem('user');
  let user = null;
  if (rawUser) {
    try {
      user = JSON.parse(rawUser);
    } catch (error) {
      try {
        user = JSON.parse(rawUser.replace(/^"|"$/g, ''));
      } catch {
        user = null;
      }
    }
  }

  return token && user ? children : <Navigate to="/" replace />;
}
