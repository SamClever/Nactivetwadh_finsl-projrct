import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Applications from '../pages/Applications';
import Institutions from '../pages/Institutions';
import Payments from '../pages/Payments';
import Inspections from '../pages/Inspections';
import HardcopyInspectionForm from '../pages/HardcopyInspectionForm';
import InspectionForms from '../pages/InspectionForms';
import InspectionTeams from '../pages/InspectionTeams';
import Reviews from '../pages/Reviews';
import Certificates from '../pages/Certificates';
import Reports from '../pages/Reports';
import Users from '../pages/Users';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <Applications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institutions"
          element={
            <ProtectedRoute>
              <Institutions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspections"
          element={
            <ProtectedRoute>
              <Inspections />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspection-form-entry"
          element={
            <ProtectedRoute>
              <HardcopyInspectionForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspection-forms"
          element={
            <ProtectedRoute>
              <InspectionForms />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspection-teams"
          element={
            <ProtectedRoute>
              <InspectionTeams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <Reviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/certificates"
          element={
            <ProtectedRoute>
              <Certificates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
