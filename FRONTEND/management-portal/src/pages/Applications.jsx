import { useEffect, useState } from 'react';
import { Search, Filter, FileText } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';

const statusStyle = {
  submitted: 'bg-amber-100 text-amber-900',
  under_review: 'bg-brand-100 text-brand-800',
  inspection: 'bg-accent-100 text-accent-900',
  approved: 'bg-emerald-100 text-emerald-900',
  rejected: 'bg-rose-100 text-rose-900',
  conditional: 'bg-slate-100 text-slate-900',
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        const { data } = await api.get('/management/applications/', { params });
        setApplications(data);
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, [search, statusFilter]);

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="min-h-screen w-full overflow-x-hidden bg-transparent p-6 lg:p-8">
        <Topbar />
        <section className="mt-8 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Applications registry</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Approval queue</h1>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex h-14 items-center gap-3 rounded-3xl border border-brand-100 bg-white px-4 text-slate-700">
                <Search size={18} className="text-brand-600" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by institution, reference or category"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </label>
              <label className="flex h-14 items-center gap-3 rounded-3xl border border-brand-100 bg-white px-4 text-slate-700">
                <Filter size={18} className="text-brand-600" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                >
                  <option value="">All statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under review</option>
                  <option value="inspection">Inspection</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="conditional">Conditional</option>
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-[36px] border border-brand-100 bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center gap-3 text-slate-500">
              <FileText size={18} className="text-brand-600" />
              <span className="text-sm font-semibold uppercase tracking-[0.24em]">Application overview</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead>
                  <tr className="text-slate-500">
                    <th className="px-4 py-3">Ref</th>
                    <th className="px-4 py-3">Institution</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-10 text-center text-slate-500">Loading applications…</td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-10 text-center text-slate-500">No matching applications found.</td>
                    </tr>
                  ) : (
                    applications.map((application) => (
                      <tr key={application.id} className="hover:bg-brand-50/80">
                        <td className="px-4 py-4 font-semibold text-slate-950">{application.reference_number}</td>
                        <td className="px-4 py-4 text-slate-600">{application.institution_name}</td>
                        <td className="px-4 py-4 text-slate-600">{application.application_type}</td>
                        <td className="px-4 py-4 text-slate-600">{application.category}</td>
                        <td className="px-4 py-4">
                          <span className={`status-chip ${statusStyle[application.status] || 'bg-slate-100 text-slate-900'}`}>
                            {application.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{application.payment_status}</td>
                        <td className="px-4 py-4 text-slate-600">{application.review_status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
