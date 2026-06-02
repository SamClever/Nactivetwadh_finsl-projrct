import { useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/applications": "Applications",
    "/institution": "Institution",
    "/documents": "Documents",
    "/payments": "Payments",
    "/certificates": "Certificates",
  };

  const currentTitle = pageTitles[location.pathname] || "NACTVET Dashboard";

  const displayName = user?.institution || user?.username || "User";

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Welcome to the portal</p>
        <h2 className="text-2xl font-black text-slate-950">{currentTitle}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end justify-center gap-0">
          <span className="text-sm font-semibold text-slate-900 leading-5 whitespace-nowrap">{displayName}</span>
          <span className="text-[11px] text-slate-500 leading-4 whitespace-nowrap">Signed in</span>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 hover:-translate-y-0.5"
          onClick={handleLogout}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </header>
  );
}