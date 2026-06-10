import { useEffect, useState } from 'react';
import { CalendarPlus, Search, ShieldCheck } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';

const statusStyle = {
  scheduled: 'bg-brand-100 text-brand-800',
  ongoing: 'bg-accent-100 text-accent-900',
  completed: 'bg-emerald-100 text-emerald-900',
};

const emptyScheduleForm = {
  application: '',
  team: '',
  scheduled_date: '',
};

export default function Inspections() {
  const [inspections, setInspections] = useState([]);
  const [applications, setApplications] = useState([]);
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [scheduleForm, setScheduleForm] = useState(emptyScheduleForm);
  const [updates, setUpdates] = useState({});

  async function fetchData() {
    setLoading(true);
    try {
      const [inspectionsResponse, applicationsResponse, teamsResponse] = await Promise.all([
        api.get('/management/inspections/', { params: { search } }),
        api.get('/management/applications/'),
        api.get('/management/inspection-teams/'),
      ]);

      setInspections(inspectionsResponse.data);
      setApplications(applicationsResponse.data);
      setTeams(teamsResponse.data);
      setScheduleForm((current) => ({
        ...current,
        application: current.application || String(applicationsResponse.data[0]?.id || ''),
        team: current.team || String(teamsResponse.data[0]?.id || ''),
      }));

      const nextUpdates = {};
      inspectionsResponse.data.forEach((inspection) => {
        nextUpdates[inspection.id] = {
          status: inspection.status || 'scheduled',
          result: inspection.result || '',
          remarks: inspection.remarks || '',
        };
      });
      setUpdates(nextUpdates);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [search]);

  function updateScheduleField(field, value) {
    setScheduleForm((current) => ({ ...current, [field]: value }));
    setError('');
    setMessage('');
  }

  function updateInspectionField(id, field, value) {
    setUpdates((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
    setError('');
    setMessage('');
  }

  async function scheduleInspection(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await api.post('/management/inspections/', scheduleForm);
      setMessage('Inspection scheduled successfully.');
      setScheduleForm((current) => ({ ...current, scheduled_date: '' }));
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to schedule inspection.');
    } finally {
      setSaving(false);
    }
  }

  async function saveInspection(id) {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await api.put('/management/inspections/', { id, ...updates[id] });
      setMessage('Inspection updated successfully.');
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to update inspection.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="min-h-screen w-full overflow-x-hidden bg-transparent p-6 lg:p-8">
        <Topbar />
        <section className="mt-8 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Inspection operations</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Field assignments</h1>
            </div>
            <label className="flex h-14 items-center gap-3 rounded-3xl border border-brand-100 bg-white px-4 text-slate-700">
              <Search size={18} className="text-brand-600" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by application reference"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
          </div>

          {(message || error) && (
            <div className={`rounded-2xl px-4 py-3 text-sm font-semibold ${error ? 'bg-rose-100 text-rose-900' : 'bg-emerald-100 text-emerald-900'}`}>
              {error || message}
            </div>
          )}

          <form onSubmit={scheduleInspection} className="rounded-[36px] border border-brand-100 bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center gap-3 text-slate-500">
              <CalendarPlus size={18} className="text-brand-600" />
              <span className="text-sm font-semibold uppercase tracking-[0.24em]">Schedule inspection</span>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_0.8fr_auto] lg:items-end">
              <label className="block text-sm font-semibold text-slate-700">
                Application
                <select
                  required
                  value={scheduleForm.application}
                  onChange={(event) => updateScheduleField('application', event.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-brand-100 px-4 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">Select application</option>
                  {applications.map((application) => (
                    <option key={application.id} value={application.id}>
                      {application.reference_number} - {application.institution_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Team
                <select
                  required
                  value={scheduleForm.team}
                  onChange={(event) => updateScheduleField('team', event.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-brand-100 px-4 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">Select team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      Team {team.id} - {team.inspection_date}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Date
                <input
                  required
                  type="date"
                  value={scheduleForm.scheduled_date}
                  onChange={(event) => updateScheduleField('scheduled_date', event.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-brand-100 px-4 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </label>
              <button
                type="submit"
                disabled={saving || applications.length === 0 || teams.length === 0}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-accent-600 to-brand-500 px-5 text-sm font-semibold text-white transition hover:from-accent-700 hover:to-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Schedule
              </button>
            </div>
          </form>

          <div className="rounded-[36px] border border-brand-100 bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center gap-3 text-slate-500">
              <ShieldCheck size={18} className="text-brand-600" />
              <span className="text-sm font-semibold uppercase tracking-[0.24em]">Inspection timeline</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead>
                  <tr className="text-slate-500">
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Scheduled</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Result</th>
                    <th className="px-4 py-3">Remarks</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-10 text-center text-slate-500">Loading inspection assignments...</td>
                    </tr>
                  ) : inspections.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-10 text-center text-slate-500">No inspections found.</td>
                    </tr>
                  ) : (
                    inspections.map((inspection) => (
                      <tr key={inspection.id} className="hover:bg-brand-50/80">
                        <td className="px-4 py-4 font-semibold text-slate-950">{inspection.application_reference}</td>
                        <td className="px-4 py-4 text-slate-600">{inspection.scheduled_date}</td>
                        <td className="px-4 py-4">
                          <select
                            value={updates[inspection.id]?.status || inspection.status}
                            onChange={(event) => updateInspectionField(inspection.id, 'status', event.target.value)}
                            className={`status-chip border-0 outline-none ${statusStyle[updates[inspection.id]?.status || inspection.status] || 'bg-slate-100 text-slate-900'}`}
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={updates[inspection.id]?.result || ''}
                            onChange={(event) => updateInspectionField(inspection.id, 'result', event.target.value)}
                            className="h-10 rounded-2xl border border-brand-100 px-3 text-sm text-slate-700 outline-none"
                          >
                            <option value="">Pending</option>
                            <option value="pass">Pass</option>
                            <option value="fail">Fail</option>
                            <option value="conditional">Conditional</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <input
                            value={updates[inspection.id]?.remarks || ''}
                            onChange={(event) => updateInspectionField(inspection.id, 'remarks', event.target.value)}
                            placeholder="Remarks"
                            className="h-10 min-w-48 rounded-2xl border border-brand-100 px-3 text-sm text-slate-700 outline-none"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => saveInspection(inspection.id)}
                            className="rounded-2xl bg-gradient-to-r from-accent-600 to-brand-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                          >
                            Save
                          </button>
                        </td>
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
