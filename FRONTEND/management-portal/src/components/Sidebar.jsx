import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Building2,
  CreditCard,
  ShieldCheck,
  CheckSquare,
  Award,
  BarChart3,
  Users,
  ClipboardList,
} from 'lucide-react';

const navigation = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'registry_officer', 'zonal_manager', 'inspector'],
  },
  {
    to: '/applications',
    label: 'Applications',
    icon: FileText,
    roles: ['admin', 'registry_officer', 'zonal_manager'],
  },
  {
    to: '/institutions',
    label: 'Institutions',
    icon: Building2,
    roles: ['admin', 'registry_officer', 'zonal_manager'],
  },
  {
    to: '/payments',
    label: 'Payments',
    icon: CreditCard,
    roles: ['admin', 'registry_officer', 'zonal_manager'],
  },
  {
    to: '/inspections',
    label: 'Inspections',
    icon: ShieldCheck,
    roles: ['admin', 'inspector', 'zonal_manager'],
  },
  {
    to: '/inspection-forms',
    label: 'Inspection Forms',
    icon: ClipboardList,
    roles: ['admin', 'inspector', 'zonal_manager'],
  },
  {
    to: '/inspection-teams',
    label: 'Inspection Teams',
    icon: Users,
    roles: ['admin', 'inspector', 'zonal_manager'],
  },
  {
    to: '/reviews',
    label: 'Review Queue',
    icon: CheckSquare,
    roles: ['admin', 'registry_officer'],
  },
  {
    to: '/certificates',
    label: 'Certificates',
    icon: Award,
    roles: ['admin', 'registry_officer', 'zonal_manager'],
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: BarChart3,
    roles: ['admin', 'registry_officer', 'zonal_manager'],
  },
  {
    to: '/users',
    label: 'Users',
    icon: Users,
    roles: ['admin'],
  },
];

export default function Sidebar() {
  const rawUser = localStorage.getItem('user');
  let user = null;

  if (rawUser) {
    try {
      user = JSON.parse(rawUser);
    } catch {
      user = null;
    }
  }

  const role = user?.role || 'institution';

  return (
    <aside className="hidden lg:flex h-full w-72 flex-col border-r border-slate-800 bg-slate-950 px-6 py-8 text-slate-100 shadow-xl">
      <div className="mb-10 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-accent-600 to-brand-500 text-white shadow-[0_18px_40px_rgba(37,99,235,0.25)]">
          N
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">NACTVET</p>
          <h1 className="text-lg font-semibold text-white">Management Portal</h1>
        </div>
      </div>

      <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/95 p-4 text-sm text-slate-300 shadow-sm">
        <p className="font-semibold text-white">Signed in as</p>
        <p className="mt-2 text-base font-medium text-white">{user?.username || 'Management'} </p>
        <span className="text-xs uppercase tracking-[0.24em] text-slate-400">{role.replace('_', ' ')}</span>
      </div>

      <nav className="space-y-1">
        {navigation
          .filter((item) => item.roles.includes(role))
          .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-gradient-to-r from-accent-600 to-brand-500 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
