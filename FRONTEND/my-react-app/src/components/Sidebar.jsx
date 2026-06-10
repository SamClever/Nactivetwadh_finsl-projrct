import {
  LayoutDashboard,
  Building2,
  FileText,
  Upload,
  CreditCard,
  Award,
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
    <aside className="sticky top-0 hidden min-h-screen w-64 shrink-0 flex-col border-r border-blue-600/10 bg-gradient-to-b from-white to-blue-50 shadow-[2px_0_24px_rgba(37,99,235,0.09)] lg:flex">
      <div className="border-b border-slate-900/5 p-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="NACTVET Logo" className="h-11 w-11 rounded-lg object-contain" />
          <div>
            <h2 className="m-0 text-base font-bold text-slate-950">NACTVET</h2>
            <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
              Institution Registration & Accreditation
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5 px-3 py-4">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-lg border-l-4 px-3.5 py-3 text-sm font-medium transition",
                isActive
                  ? "border-white bg-gradient-to-r from-teal-700 to-blue-600 text-white"
                  : "border-transparent text-slate-600 hover:border-teal-700 hover:bg-blue-600/10 hover:text-slate-950",
              ].join(" ")
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
