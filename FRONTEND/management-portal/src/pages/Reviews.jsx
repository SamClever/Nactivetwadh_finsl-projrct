import { useEffect, useState } from 'react';
import { CheckCircle2, FileCheck2, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';

const decisionStyle = {
  approved: 'bg-emerald-100 text-emerald-900',
  rejected: 'bg-rose-100 text-rose-900',
  conditional: 'bg-amber-100 text-amber-900',
  pending: 'bg-slate-100 text-slate-900',
};

const emptyReview = {
  application: '',
  decision: 'approved',
  comments: '',
};

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviewForm, setReviewForm] = useState(emptyReview);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function fetchData() {
    setLoading(true);
    try {
      const [reviewsResponse, applicationsResponse] = await Promise.all([
        api.get('/management/reviews/', { params: { search } }),
        api.get('/management/applications/'),
      ]);

      setReviews(reviewsResponse.data);
      setApplications(applicationsResponse.data);
      setReviewForm((current) => ({
        ...current,
        application: current.application || String(applicationsResponse.data[0]?.id || ''),
      }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [search]);

  function updateReviewField(field, value) {
    setReviewForm((current) => ({ ...current, [field]: value }));
    setMessage('');
    setError('');
  }

  async function submitReview(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await api.post('/management/reviews/', reviewForm);
      setMessage('Application review saved.');
      setReviewForm((current) => ({ ...emptyReview, application: current.application }));
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to save review.');
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
              <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Review monitoring</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Review and verify</h1>
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

          <form onSubmit={submitReview} className="rounded-[36px] border border-brand-100 bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center gap-3 text-slate-500">
              <FileCheck2 size={18} className="text-brand-600" />
              <span className="text-sm font-semibold uppercase tracking-[0.24em]">Verify application</span>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_1.2fr_auto] lg:items-end">
              <label className="block text-sm font-semibold text-slate-700">
                Application
                <select
                  required
                  value={reviewForm.application}
                  onChange={(event) => updateReviewField('application', event.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-brand-100 px-4 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">Select application</option>
                  {applications.map((application) => (
                    <option key={application.id} value={application.id}>
                      {application.reference_number} - {application.institution_name} ({application.status}, {application.payment_status})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Decision
                <select
                  value={reviewForm.decision}
                  onChange={(event) => updateReviewField('decision', event.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-brand-100 px-4 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="approved">Approve</option>
                  <option value="conditional">Conditional</option>
                  <option value="rejected">Reject</option>
                  <option value="pending">Keep pending</option>
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Comments
                <input
                  value={reviewForm.comments}
                  onChange={(event) => updateReviewField('comments', event.target.value)}
                  placeholder="Verification notes"
                  className="mt-2 h-12 w-full rounded-2xl border border-brand-100 px-4 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </label>
              <button
                type="submit"
                disabled={saving || applications.length === 0}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-accent-600 to-brand-500 px-5 text-sm font-semibold text-white transition hover:from-accent-700 hover:to-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save review
              </button>
            </div>
          </form>

          <div className="rounded-[36px] border border-brand-100 bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center gap-3 text-slate-500">
              <CheckCircle2 size={18} className="text-brand-600" />
              <span className="text-sm font-semibold uppercase tracking-[0.24em]">Review decisions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead>
                  <tr className="text-slate-500">
                    <th className="px-4 py-3">Ref</th>
                    <th className="px-4 py-3">Officer</th>
                    <th className="px-4 py-3">Decision</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Comments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-10 text-center text-slate-500">Loading review history...</td>
                    </tr>
                  ) : reviews.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-10 text-center text-slate-500">No review activity found.</td>
                    </tr>
                  ) : (
                    reviews.map((review) => (
                      <tr key={review.id} className="hover:bg-brand-50/80">
                        <td className="px-4 py-4 font-semibold text-slate-950">{review.application_reference}</td>
                        <td className="px-4 py-4 text-slate-600">{review.officer}</td>
                        <td className="px-4 py-4"><span className={`status-chip ${decisionStyle[review.decision] ?? 'bg-slate-100 text-slate-900'}`}>{review.decision}</span></td>
                        <td className="px-4 py-4 text-slate-600">{review.review_date}</td>
                        <td className="px-4 py-4 text-slate-600">{review.comments || 'No comments'}</td>
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
