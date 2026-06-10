import { useEffect, useState } from 'react';
import { Search, Building2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';

export default function Institutions() {
  const [institutions, setInstitutions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInstitutions() {
      setLoading(true);
      try {
        const { data } = await api.get('/management/institutions/', { params: { search } });
        setInstitutions(data);
      } finally {
        setLoading(false);
      }
    }
    fetchInstitutions();
  }, [search]);

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="min-h-screen w-full overflow-x-hidden bg-transparent p-6 lg:p-8">
        <Topbar />
        <section className="mt-8 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Institution registry</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Enterprise institutions</h1>
            </div>
            <label className="flex h-14 items-center gap-3 rounded-3xl border border-brand-100 bg-white px-4 text-slate-700">
              <Search size={18} className="text-brand-600" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search institutions or owner"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
          </div>

          <div className="rounded-[36px] border border-brand-100 bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center gap-3 text-slate-500">
              <Building2 size={18} className="text-brand-600" />
              <span className="text-sm font-semibold uppercase tracking-[0.24em]">Institution directory</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead>
                  <tr className="text-slate-500">
                    <th className="px-4 py-3">Institution</th>
                    <th className="px-4 py-3">Registration</th>
                    <th className="px-4 py-3">Accreditation</th>
                    <th className="px-4 py-3">Facility status</th>
                    <th className="px-4 py-3">Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-10 text-center text-slate-500">Loading institutions…</td>
                    </tr>
                  ) : institutions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-10 text-center text-slate-500">No institutions found.</td>
                    </tr>
                  ) : (
                    institutions.map((institution) => (
                      <tr key={institution.id} className="hover:bg-brand-50/80">
                        <td className="px-4 py-4 font-semibold text-slate-950">{institution.institution_name}</td>
                        <td className="px-4 py-4 text-slate-600">{institution.registration_number || 'N/A'}</td>
                        <td className="px-4 py-4 text-slate-600">{institution.accreditation_status || 'Pending'}</td>
                        <td className="px-4 py-4 text-slate-600">{institution.facility_status || 'Unknown'}</td>
                        <td className="px-4 py-4 text-slate-600">{institution.owner}</td>
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
