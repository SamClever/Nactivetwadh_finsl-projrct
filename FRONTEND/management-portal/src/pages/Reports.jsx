import { useEffect, useState } from 'react';
import { BarChart3, LineChart, PieChart } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';

function DataPill({ label, value, description }) {
  return (
    <div className="rounded-3xl border border-brand-100 bg-brand-50 p-5">
      <p className="text-sm uppercase tracking-[0.24em] text-brand-600">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}

function SparkBar({ value }) {
  return <div className="h-2 rounded-full bg-brand-500" style={{ width: `${Math.min(value * 8, 100)}%` }} />;
}

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSummary() {
      try {
        const { data } = await api.get('/management/summary/');
        setSummary(data);
      } catch (err) {
        setError(err?.response?.data?.error || 'Unable to retrieve reporting data.');
      }
    }
    fetchSummary();
  }, []);

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="min-h-screen w-full overflow-x-hidden bg-transparent p-6 lg:p-8">
        <Topbar />

        <section className="mt-8 grid gap-6 xl:grid-cols-3">
          <DataPill label="Application volume" value={summary?.totals?.applications ?? '--'} description="Total applications recorded" />
          <DataPill label="Active certificates" value={summary?.certificate_counts?.active ?? '--'} description="Certificates currently in force" />
          <DataPill label="Pending inspections" value={summary?.inspection_counts?.scheduled ?? '--'} description="Upcoming field reviews" />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <article className="panel-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Trend analysis</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">Application lifecycle</h3>
              </div>
              <LineChart className="text-accent-600" size={24} />
            </div>
            <div className="mt-8 space-y-4">
              {(summary?.status_counts ? Object.entries(summary.status_counts) : []).map(([status, value]) => (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>{status.replace('_', ' ')}</span>
                    <span>{value}</span>
                  </div>
                  <SparkBar value={value} />
                </div>
              ))}
            </div>
          </article>

          <article className="panel-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Financial pulse</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">Payments distribution</h3>
              </div>
              <BarChart3 className="text-accent-600" size={24} />
            </div>
            <div className="mt-8 space-y-4">
              {(summary?.payment_counts ? Object.entries(summary.payment_counts) : []).map(([status, value]) => (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>{status}</span>
                    <span>{value}</span>
                  </div>
                  <SparkBar value={value} />
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-8 panel-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Operational leaderboard</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">Recent activity</h3>
            </div>
            <PieChart className="text-accent-600" size={24} />
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {(summary?.recent_payments || []).slice(0, 4).map((item) => (
              <div key={`pay-${item.id}`} className="rounded-3xl border border-brand-100 bg-brand-50 p-5">
                <p className="text-sm font-semibold text-slate-950">Payment {item.application_reference}</p>
                <p className="mt-2 text-sm text-slate-600">{item.status} · TSh {item.amount}</p>
              </div>
            ))}
          </div>
        </section>

        {error && <div className="mt-6 rounded-3xl bg-rose-100 px-6 py-4 text-sm text-rose-900">{error}</div>}
      </main>
    </div>
  );
}
