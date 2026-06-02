import {
  LayoutDashboard,
  Building2,
  FileText,
  Upload,
  CreditCard,
  Award
} from "lucide-react";

import { NavLink } from "react-router-dom";

import logo from "../assets/logo.png";

const navigation = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/institution", label: "Institution", icon: Building2 },
  { to: "/applications", label: "Applications", icon: FileText },
  { to: "/documents", label: "Documents", icon: Upload },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/certificates", label: "Certificates", icon: Award },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <img src={logo} alt="NACTVET Logo" className="logo-image" />
          <div className="logo-content">
            <h2>NACTVET</h2>
            <p>Institution Registration & Accreditation</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-menu">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}