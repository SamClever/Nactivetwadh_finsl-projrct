import { useEffect, useState } from 'react';
import { Activity, ArrowUpRight, Bell, CheckCircle2, CreditCard, FileText, ShieldCheck } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';

const statusClasses = {
  submitted: 'bg-amber-100 text-amber-900',
  under_review: 'bg-brand-100 text-brand-800',
  inspection: 'bg-accent-100 text-accent-900',
  approved: 'bg-emerald-100 text-emerald-900',
  rejected: 'bg-rose-100 text-rose-900',
  conditional: 'bg-slate-100 text-slate-900',
};

const metricCards = [
  { label: 'Applications', key: 'applications', icon: FileText },
  { label: 'Institutions', key: 'institutions', icon: ShieldCheck },
  { label: 'Payments', key: 'payments', icon: CreditCard },
  { label: 'Inspections', key: 'inspections', icon: CheckCircle2 },
];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSummary() {
      try {
        const { data } = await api.get('/management/summary/');
        setSummary(data);
      } catch (err) {
        setError(err?.response?.data?.error || 'Unable to load dashboard metrics.');
      }
    }
    fetchSummary();
  }, []);

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="min-h-screen w-full overflow-x-hidden bg-transparent p-6 lg:p-8">
        <Topbar />

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="grid gap-6 lg:grid-cols-2">
            {metricCards.map(({ label, key, icon: Icon }) => (
              <article
                key={key}
                className="rounded-[2rem] border border-brand-200 bg-white p-6 shadow-[0_22px_50px_rgba(31,139,79,0.08)] transition hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(31,139,79,0.12)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-800">{label}</p>
                    <p className="mt-4 text-4xl font-semibold text-slate-950">{summary?.totals?.[key] ?? '--'}</p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-700 text-white shadow-sm shadow-brand-100/50">
                    <Icon size={24} />
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                  <ArrowUpRight size={16} />
                  <span>Updated from live system data</span>
                </div>
              </article>
            ))}
          </div>

          <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-[0_18px_44px_rgba(31,139,79,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Workflow health</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">Approval pipeline</h3>
              </div>
              <Bell className="text-accent-600" size={24} />
            </div>

            <div className="mt-8 space-y-5">
              {summary && Object.entries(summary.status_counts).map(([status, value]) => {
                const totalApps = summary?.totals?.applications || 1;
                const percentage = Math.round((value / totalApps) * 100);
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>{status.replace('_', ' ').toUpperCase()}</span>
                      <span>{value} ({percentage}%)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full bg-brand-700 ${statusClasses[status] ?? 'bg-slate-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <article className="rounded-[2rem] border border-brand-100 bg-white/95 p-6 shadow-[0_24px_56px_rgba(31,139,79,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Approval queue</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">Pending actions</h3>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-600">Submitted applications</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-950">{summary?.workflow_queues?.submitted_applications ?? 0}</p>
                </div>
                <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-600">Pending payments</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-950">{summary?.workflow_queues?.pending_payments ?? 0}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Latest activity</p>
                <div className="mt-4 space-y-3">
                  {(summary?.recent_reviews || []).slice(0, 3).map((item) => (
                    <div key={`review-${item.id}`} className="rounded-3xl border border-brand-100 bg-white p-4 shadow-sm">
                      <p className="text-sm font-semibold text-slate-950">Review {item.decision}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.application_reference} by {item.officer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-brand-100 bg-white/95 p-6 shadow-[0_24px_56px_rgba(31,139,79,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Executive overview</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">Operational pulse</h3>
              </div>
              <Activity size={24} className="text-accent-600" />
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-600">Certificates issued</p>
                <p className="mt-4 text-3xl font-semibold text-slate-950">{summary?.totals?.certificates ?? '--'}</p>
              </div>
              <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-600">Inspections scheduled</p>
                <p className="mt-4 text-3xl font-semibold text-slate-950">{summary?.inspection_counts?.scheduled ?? '--'}</p>
              </div>
              <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-600">Inspections completed</p>
                <p className="mt-4 text-3xl font-semibold text-slate-950">{summary?.inspection_counts?.completed ?? '--'}</p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Technical alerts</p>
              <div className="mt-4 grid gap-3">
                <div className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-4 text-slate-900 shadow-sm">
                  <span>Institution registration trending</span>
                  <span className="text-sm text-accent-700">+12%</span>
                </div>
                <div className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-4 text-slate-900 shadow-sm">
                  <span>Document verification velocity</span>
                  <span className="text-sm text-emerald-700">Stable</span>
                </div>
              </div>
            </div>
          </article>
        </section>

        {error && <div className="mt-8 rounded-3xl bg-rose-100 px-6 py-4 text-sm text-rose-900">{error}</div>}
      </main>
    </div>
  );
}
