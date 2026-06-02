import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import DashboardCard from "../components/DashboardCard";

import "../styles/dashboard.css";

export default function Dashboard() {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  return (

    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-main">

        <Topbar user={user} />

        <div className="dashboard-content">

          <div className="cards-container">

            <DashboardCard
              title="Applications"
              value="0"
            />

            <DashboardCard
              title="Documents"
              value="0"
            />

            <DashboardCard
              title="Payments"
              value="0"
            />

          </div>

          <div className="institution-card">

            <h2>
              Institution Information
            </h2>

            <p>
              Username:
              {user?.username}
            </p>

            <p>
              Role:
              {user?.role}
            </p>

          </div>

        </div>

      </div>

    </div>

  );

}