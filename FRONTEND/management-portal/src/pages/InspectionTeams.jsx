import { useEffect, useState } from 'react';
import { ClipboardCheck, Search, Users } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';

export default function InspectionTeams() {
  const [teams, setTeams] = useState([]);
  const [responses, setResponses] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [memberIds, setMemberIds] = useState([]);
  const [message, setMessage] = useState('');

  async function fetchData() {
    const [teamsResponse, responsesResponse, usersResponse] = await Promise.all([
      api.get('/management/inspection-teams/'),
      api.get('/management/inspection-responses/', { params: { search } }),
      api.get('/management/users/'),
    ]);
    setTeams(teamsResponse.data);
    setResponses(responsesResponse.data);
    setUsers(usersResponse.data.filter((user) => ['admin', 'inspector', 'zonal_manager'].includes(user.role)));
  }

  useEffect(() => {
    fetchData();
  }, [search]);

  function toggleMember(id) {
    setMemberIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function createTeam(event) {
    event.preventDefault();
    await api.post('/management/inspection-teams/', { inspection_date: inspectionDate, member_ids: memberIds });
    setInspectionDate('');
    setMemberIds([]);
    setMessage('Inspection team created.');
    await fetchData();
  }

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="min-h-screen w-full overflow-x-hidden bg-transparent p-6 lg:p-8">
        <Topbar />
        <section className="mt-8 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Inspection setup</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Teams and responses</h1>
            </div>
            <label className="flex h-14 items-center gap-3 rounded-3xl border border-brand-100 bg-white px-4 text-slate-700">
              <Search size={18} className="text-brand-600" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search responses by application reference" className="w-full bg-transparent text-sm outline-none" />
            </label>
          </div>

          {message && <div className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-900">{message}</div>}

          <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
            <form onSubmit={createTeam} className="rounded-[36px] border border-brand-100 bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center gap-3 text-slate-500">
                <Users size={18} className="text-brand-600" />
                <span className="text-sm font-semibold uppercase tracking-[0.24em]">Create team</span>
              </div>
              <label className="block text-sm font-semibold text-slate-700">
                Inspection date
                <input required type="date" value={inspectionDate} onChange={(event) => setInspectionDate(event.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-brand-100 px-4 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
              </label>
              <div className="mt-5 space-y-2">
                {users.map((user) => (
                  <label key={user.id} className="flex items-center justify-between rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-slate-700">
                    <span>{user.username} <span className="text-slate-500">({user.role.replace('_', ' ')})</span></span>
                    <input type="checkbox" checked={memberIds.includes(user.id)} onChange={() => toggleMember(user.id)} />
                  </label>
                ))}
              </div>
              <button type="submit" className="mt-6 inline-flex w-full justify-center rounded-2xl bg-gradient-to-r from-accent-600 to-brand-500 px-5 py-3 text-sm font-semibold text-white">Create team</button>
            </form>

            <div className="rounded-[36px] border border-brand-100 bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center gap-3 text-slate-500">
                <ClipboardCheck size={18} className="text-brand-600" />
                <span className="text-sm font-semibold uppercase tracking-[0.24em]">Inspection teams</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {teams.length === 0 ? <p className="text-sm text-slate-500">No teams created.</p> : teams.map((team) => (
                  <div key={team.id} className="rounded-3xl border border-brand-100 bg-brand-50 p-4">
                    <p className="font-semibold text-slate-950">Team {team.id}</p>
                    <p className="mt-1 text-sm text-slate-600">{team.inspection_date}</p>
                    <p className="mt-3 text-sm text-slate-600">{team.members.map((member) => member.username).join(', ') || 'No members'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[36px] border border-brand-100 bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-950">Inspection responses</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead><tr className="text-slate-500"><th className="px-4 py-3">Application</th><th className="px-4 py-3">Form</th><th className="px-4 py-3">Question</th><th className="px-4 py-3">Score</th></tr></thead>
                <tbody className="divide-y divide-slate-200">
                  {responses.length === 0 ? <tr><td colSpan="4" className="px-4 py-10 text-center text-slate-500">No responses found.</td></tr> : responses.map((response) => (
                    <tr key={response.id} className="hover:bg-brand-50/80">
                      <td className="px-4 py-4 font-semibold text-slate-950">{response.application_reference}</td>
                      <td className="px-4 py-4 text-slate-600">{response.form_name}</td>
                      <td className="px-4 py-4 text-slate-600">{response.question_text}</td>
                      <td className="px-4 py-4 text-slate-600">{response.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
