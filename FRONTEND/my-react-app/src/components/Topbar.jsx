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
    <header className="topbar">
      <div className="topbar-info">
        <span className="topbar-tag">Welcome to the portal</span>
        <h2 className="topbar-title">{currentTitle}</h2>
      </div>

      <div className="topbar-actions">
        <div className="user-info">
          <span className="user-name">{displayName}</span>
          <span className="user-status">Signed in</span>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </header>
  );
}