import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import DashboardCard from "../components/DashboardCard";

export default function Dashboard() {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  return (

    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-slate-50 text-slate-900">

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">

        <Topbar user={user} />

        <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-7 sm:px-6 lg:px-10">

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
