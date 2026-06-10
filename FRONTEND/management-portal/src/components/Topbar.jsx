import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Moon, Sun, Bell } from 'lucide-react';

const pageTitles = {
  '/dashboard': 'Executive Dashboard',
  '/applications': 'Applications',
  '/institutions': 'Institutions',
  '/payments': 'Payments',
  '/inspections': 'Inspections',
  '/inspection-forms': 'Inspection Forms',
  '/inspection-teams': 'Inspection Teams',
  '/reviews': 'Review Queue',
  '/certificates': 'Certificate Registry',
  '/reports': 'Reporting',
  '/users': 'Users',
};

export default function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );

  const user = (() => {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return {};
    try {
      return JSON.parse(rawUser);
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const currentTitle = pageTitles[location.pathname] || 'NACTVET Management';

  return (
    <header className="flex flex-col gap-4 bg-gradient-to-r from-accent-600 to-brand-500 px-6 py-5 text-white shadow-lg shadow-brand-500/20 backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-white/80">Executive view</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{currentTitle}</h2>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/25"
          onClick={() => setDarkMode((prev) => !prev)}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          {darkMode ? 'Light mode' : 'Dark mode'}
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
