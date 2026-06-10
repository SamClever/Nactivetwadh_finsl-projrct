import { useEffect, useState } from 'react';
import { Search, ShieldPlus, Users as UsersIcon } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'registry_officer', label: 'Registry Officer' },
  { value: 'zonal_manager', label: 'Zonal Manager' },
  { value: 'inspector', label: 'Inspector' },
];

const rolePermissions = [
  {
    role: 'Registry Officer',
    details: 'Reviews applications, checks submitted records, works on review queue, certificates, payments, institutions, and reports.',
  },
  {
    role: 'Zonal Manager',
    details: 'Monitors institutions, applications, payments, inspections, certificates, reports, teams, and inspection setup for the zone.',
  },
  {
    role: 'Inspector',
    details: 'Works on inspection assignments, inspection forms, inspection questions, inspection teams, and inspection responses.',
  },
  {
    role: 'Admin',
    details: 'Manages all portal areas, creates management accounts, configures forms, and oversees system records.',
  },
];

const emptyForm = {
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  phone: '',
  role: 'registry_officer',
  password: '',
};

function formatRole(role) {
  return role.replace('_', ' ');
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function fetchUsers() {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      const { data } = await api.get('/management/users/', { params });
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [search]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
    setSuccess('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/management/users/', form);
      setForm(emptyForm);
      setSuccess('Account created successfully.');
      await fetchUsers();
    } catch (err) {
      const data = err?.response?.data;
      if (typeof data === 'string') {
        setError(data);
      } else if (data?.error) {
        setError(data.error);
      } else if (data) {
        setError(Object.entries(data).map(([key, value]) => `${key}: ${value}`).join(' '));
      } else {
        setError('Unable to create account.');
      }
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
              <p className="text-sm uppercase tracking-[0.24em] text-brand-600">User administration</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Management accounts</h1>
            </div>
            <label className="flex h-14 items-center gap-3 rounded-3xl border border-brand-100 bg-white px-4 text-slate-700">
              <Search size={18} className="text-brand-600" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <form onSubmit={handleSubmit} className="rounded-[36px] border border-brand-100 bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center gap-3 text-slate-500">
                <ShieldPlus size={18} className="text-brand-600" />
                <span className="text-sm font-semibold uppercase tracking-[0.24em]">Create account</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  First name
                  <input
                    value={form.first_name}
                    onChange={(event) => updateField('first_name', event.target.value)}
                    required
                    className="mt-2 h-12 w-full rounded-2xl border border-brand-100 px-4 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Last name
                  <input
                    value={form.last_name}
                    onChange={(event) => updateField('last_name', event.target.value)}
                    required
                    className="mt-2 h-12 w-full rounded-2xl border border-brand-100 px-4 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Username
                  <input
                    value={form.username}
                    onChange={(event) => updateField('username', event.target.value)}
                    required
                    className="mt-2 h-12 w-full rounded-2xl border border-brand-100 px-4 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Email
                  <input
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    required
                    type="email"
                    className="mt-2 h-12 w-full rounded-2xl border border-brand-100 px-4 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Phone
                  <input
                    value={form.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-brand-100 px-4 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Role
                  <select
                    value={form.role}
                    onChange={(event) => updateField('role', event.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-brand-100 px-4 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  >
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                  Password
                  <input
                    value={form.password}
                    onChange={(event) => updateField('password', event.target.value)}
                    required
                    type="password"
                    minLength={6}
                    className="mt-2 h-12 w-full rounded-2xl border border-brand-100 px-4 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </label>
              </div>

              {error && <div className="mt-5 rounded-2xl bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-900">{error}</div>}
              {success && <div className="mt-5 rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-900">{success}</div>}

              <button
                type="submit"
                disabled={saving}
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-accent-600 to-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:from-accent-700 hover:to-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="rounded-[36px] border border-brand-100 bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center gap-3 text-slate-500">
                <UsersIcon size={18} className="text-brand-600" />
                <span className="text-sm font-semibold uppercase tracking-[0.24em]">Account list</span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead>
                    <tr className="text-slate-500">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-10 text-center text-slate-500">Loading users...</td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-10 text-center text-slate-500">No users found.</td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-brand-50/80">
                          <td className="px-4 py-4 font-semibold text-slate-950">
                            {[user.first_name, user.last_name].filter(Boolean).join(' ') || '-'}
                          </td>
                          <td className="px-4 py-4 text-slate-600">{user.username}</td>
                          <td className="px-4 py-4 text-slate-600">{user.email}</td>
                          <td className="px-4 py-4">
                            <span className="status-chip bg-brand-100 text-brand-800">{formatRole(user.role)}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="rounded-[36px] border border-brand-100 bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-950">Role permissions</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {rolePermissions.map((item) => (
                <div key={item.role} className="rounded-3xl border border-brand-100 bg-brand-50 p-4">
                  <p className="font-semibold text-slate-950">{item.role}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.details}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
