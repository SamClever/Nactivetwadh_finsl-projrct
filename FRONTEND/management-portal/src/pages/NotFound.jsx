import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-2xl rounded-[36px] border border-slate-800 bg-slate-900/95 p-12 shadow-2xl shadow-black/20">
        <p className="text-sm uppercase tracking-[0.32em] text-accent-200">Page not found</p>
        <h1 className="mt-4 text-5xl font-semibold text-brand-500">404</h1>
        <p className="mt-4 max-w-xl text-slate-300">The resource you are looking for is not available in this management environment. Return to the dashboard to continue.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-8 inline-flex rounded-3xl bg-gradient-to-r from-accent-600 to-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:from-accent-700 hover:to-brand-600"
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
}
