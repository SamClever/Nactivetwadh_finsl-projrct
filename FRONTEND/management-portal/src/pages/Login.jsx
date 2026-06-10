import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submitForm = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login/', { email, password });
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      const message = err?.response?.data?.error || 'Unable to log in. Check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6 py-12 text-white"
      style={{
        background: 'radial-gradient(circle at top, rgba(31, 139, 79, 0.18), transparent 32%), linear-gradient(180deg, #11211a 0%, #1e3226 30%, #283b2d 100%)',
      }}
    >
      <div className="w-full max-w-xl rounded-[36px] border border-slate-800 bg-slate-950/95 p-10 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-accent-200">Management access</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">NACTVET Admin Portal</h1>
          <p className="mt-3 text-slate-300">Use your management account to access approval workflows, executive analytics, and operational controls.</p>
        </div>

        <form className="space-y-5" onSubmit={submitForm}>
          <label className="block text-sm font-semibold text-slate-200">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="admin@example.com"
            className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />

          <label className="block text-sm font-semibold text-slate-200">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            placeholder="••••••••"
            className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />

          {error && <div className="rounded-3xl bg-rose-950/80 px-4 py-3 text-sm text-rose-100">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-3xl bg-gradient-to-r from-accent-600 to-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:from-accent-700 hover:to-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
