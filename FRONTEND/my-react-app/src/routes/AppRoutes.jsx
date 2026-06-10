import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Applications from "../pages/Applications";
import Documents from "../pages/Documents";
import Institution from "../pages/Institution";
import Payments from "../pages/Payments";
import Certificates from "../pages/Certificates";

import ProtectedRoute
from "../components/ProtectedRoute";



export default function AppRoutes() {

  return (

    <BrowserRouter>

      <Routes>

        {/* LOGIN */}

        <Route
          path="/"
          element={<Login />}
        />



        {/* REGISTER */}

        <Route
          path="/register"
          element={<Register />}
        />



        {/* INSTITUTION */}

        <Route

          path="/institution"

          element={

            <ProtectedRoute>

              <Institution />

            </ProtectedRoute>

          }

        />





        {/* APPLICATIONS */}

        <Route

          path="/applications"

          element={

            <ProtectedRoute>

              <Applications />

            </ProtectedRoute>

          }

        />

        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* DOCUMENTS */}

        <Route

          path="/documents"

          element={

            <ProtectedRoute>

              <Documents />

            </ProtectedRoute>

          }

        />



        {/* PAYMENTS */}

        <Route

          path="/payments"

          element={

            <ProtectedRoute>

              <Payments />

            </ProtectedRoute>

          }

        />

        {/* CERTIFICATES */}

        <Route

          path="/certificates"

          element={

            <ProtectedRoute>

              <Certificates />

            </ProtectedRoute>

          }

        />

      </Routes>

    </BrowserRouter>

  );

}