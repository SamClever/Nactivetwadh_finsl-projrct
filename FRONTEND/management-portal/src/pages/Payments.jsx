import { useEffect, useState } from 'react';
import { Search, CreditCard } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        const { data } = await api.get('/management/payments/', { params });
        setPayments(data);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, [search, statusFilter]);

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="min-h-screen w-full overflow-x-hidden bg-transparent p-6 lg:p-8">
        <Topbar />
        <section className="mt-8 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Payments ledger</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Financial operations</h1>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="flex h-14 items-center gap-3 rounded-3xl border border-brand-100 bg-white px-4 text-slate-700">
                <Search size={18} className="text-brand-600" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search payment reference"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-14 rounded-3xl border border-brand-100 bg-white px-4 text-sm text-slate-700 outline-none transition"
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="rounded-[36px] border border-brand-100 bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center gap-3 text-slate-500">
              <CreditCard size={18} className="text-brand-600" />
              <span className="text-sm font-semibold uppercase tracking-[0.24em]">Payment activity</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead>
                  <tr className="text-slate-500">
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Institution</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Paid at</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-10 text-center text-slate-500">Loading payments…</td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-10 text-center text-slate-500">No payments found.</td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-brand-50/80">
                        <td className="px-4 py-4 font-semibold text-slate-950">{payment.application_reference}</td>
                        <td className="px-4 py-4 text-slate-600">{payment.institution_name}</td>
                        <td className="px-4 py-4 text-slate-600">TSh {payment.amount.toLocaleString()}</td>
                        <td className="px-4 py-4 text-slate-600">{payment.status}</td>
                        <td className="px-4 py-4 text-slate-600">{payment.payment_method}</td>
                        <td className="px-4 py-4 text-slate-600">{payment.paid_at || '-'}</td>
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
