import { useEffect, useState } from 'react';
import { Search, Award } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';

const statusStyle = {
  active: 'bg-emerald-100 text-emerald-900',
  expired: 'bg-amber-100 text-amber-900',
  revoked: 'bg-rose-100 text-rose-900',
};

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCertificates() {
      setLoading(true);
      try {
        const { data } = await api.get('/management/certificates/', { params: { search } });
        setCertificates(data);
      } finally {
        setLoading(false);
      }
    }
    fetchCertificates();
  }, [search]);

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="min-h-screen w-full overflow-x-hidden bg-transparent p-6 lg:p-8">
        <Topbar />
        <section className="mt-8 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Certificate registry</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Enterprise certification</h1>
            </div>
            <label className="flex h-14 items-center gap-3 rounded-3xl border border-brand-100 bg-white px-4 text-slate-700">
              <Search size={18} className="text-brand-600" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search certificate number"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
          </div>

          <div className="rounded-[36px] border border-brand-100 bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center gap-3 text-slate-500">
              <Award size={18} className="text-brand-600" />
              <span className="text-sm font-semibold uppercase tracking-[0.24em]">Certificate details</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead>
                  <tr className="text-slate-500">
                    <th className="px-4 py-3">Certificate</th>
                    <th className="px-4 py-3">Application</th>
                    <th className="px-4 py-3">Institution</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-10 text-center text-slate-500">Loading certificates…</td>
                    </tr>
                  ) : certificates.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-10 text-center text-slate-500">No certificates available.</td>
                    </tr>
                  ) : (
                    certificates.map((certificate) => (
                      <tr key={certificate.id} className="hover:bg-brand-50/80">
                        <td className="px-4 py-4 font-semibold text-slate-950">{certificate.certificate_number}</td>
                        <td className="px-4 py-4 text-slate-600">{certificate.application_reference}</td>
                        <td className="px-4 py-4 text-slate-600">{certificate.institution_name}</td>
                        <td className="px-4 py-4"><span className={`status-chip ${statusStyle[certificate.status] || 'bg-slate-100 text-slate-900'}`}>{certificate.status}</span></td>
                        <td className="px-4 py-4 text-slate-600">{certificate.expiry_date || 'N/A'}</td>
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
