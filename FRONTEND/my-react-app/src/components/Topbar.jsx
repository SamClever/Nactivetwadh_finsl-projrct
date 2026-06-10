import { useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user")) || {};

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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="flex flex-col gap-4 bg-gradient-to-r from-teal-700 to-blue-600 px-6 py-5 text-white shadow-[0_12px_30px_rgba(15,23,42,0.12)] sm:flex-row sm:items-center sm:justify-between lg:px-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
          Welcome to the portal
        </span>
        <h2 className="mt-1 text-2xl font-black text-white">{currentTitle}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <span className="block text-sm font-bold text-slate-50">{displayName}</span>
          <span className="text-xs text-slate-50/80">Signed in</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/30"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </header>
  );
}
