import { useEffect, useState } from 'react';
import { ClipboardList, HelpCircle, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';

const emptyForm = { form_name: '', version: '' };
const emptyQuestion = { form: '', question_text: '', expected_answer: '' };

export default function InspectionForms() {
  const [forms, setForms] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [questionData, setQuestionData] = useState(emptyQuestion);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const [formsResponse, questionsResponse] = await Promise.all([
        api.get('/management/inspection-forms/', { params: { search } }),
        api.get('/management/form-questions/', { params: { search } }),
      ]);
      setForms(formsResponse.data);
      setQuestions(questionsResponse.data);
      if (!questionData.form && formsResponse.data.length > 0) {
        setQuestionData((current) => ({ ...current, form: String(formsResponse.data[0].id) }));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [search]);

  async function createForm(event) {
    event.preventDefault();
    setMessage('');
    await api.post('/management/inspection-forms/', formData);
    setFormData(emptyForm);
    setMessage('Inspection form created.');
    await fetchData();
  }

  async function createQuestion(event) {
    event.preventDefault();
    setMessage('');
    await api.post('/management/form-questions/', questionData);
    setQuestionData((current) => ({ ...emptyQuestion, form: current.form }));
    setMessage('Question added to form.');
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
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Forms and questions</h1>
            </div>
            <label className="flex h-14 items-center gap-3 rounded-3xl border border-brand-100 bg-white px-4 text-slate-700">
              <Search size={18} className="text-brand-600" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search forms or questions" className="w-full bg-transparent text-sm outline-none" />
            </label>
          </div>

          {message && <div className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-900">{message}</div>}

          <div className="grid gap-6 xl:grid-cols-2">
            <form onSubmit={createForm} className="rounded-[36px] border border-brand-100 bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center gap-3 text-slate-500">
                <ClipboardList size={18} className="text-brand-600" />
                <span className="text-sm font-semibold uppercase tracking-[0.24em]">Create form</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Form name
                  <input required value={formData.form_name} onChange={(event) => setFormData((current) => ({ ...current, form_name: event.target.value }))} className="mt-2 h-12 w-full rounded-2xl border border-brand-100 px-4 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Version
                  <input required value={formData.version} onChange={(event) => setFormData((current) => ({ ...current, version: event.target.value }))} className="mt-2 h-12 w-full rounded-2xl border border-brand-100 px-4 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                </label>
              </div>
              <button type="submit" className="mt-6 inline-flex w-full justify-center rounded-2xl bg-gradient-to-r from-accent-600 to-brand-500 px-5 py-3 text-sm font-semibold text-white">Create form</button>
            </form>

            <form onSubmit={createQuestion} className="rounded-[36px] border border-brand-100 bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center gap-3 text-slate-500">
                <HelpCircle size={18} className="text-brand-600" />
                <span className="text-sm font-semibold uppercase tracking-[0.24em]">Add question</span>
              </div>
              <div className="space-y-4">
                <select required value={questionData.form} onChange={(event) => setQuestionData((current) => ({ ...current, form: event.target.value }))} className="h-12 w-full rounded-2xl border border-brand-100 px-4 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20">
                  <option value="">Select form</option>
                  {forms.map((form) => <option key={form.id} value={form.id}>{form.form_name} ({form.version})</option>)}
                </select>
                <textarea required value={questionData.question_text} onChange={(event) => setQuestionData((current) => ({ ...current, question_text: event.target.value }))} placeholder="Question text" className="min-h-24 w-full rounded-2xl border border-brand-100 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                <textarea required value={questionData.expected_answer} onChange={(event) => setQuestionData((current) => ({ ...current, expected_answer: event.target.value }))} placeholder="Expected answer" className="min-h-24 w-full rounded-2xl border border-brand-100 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
              </div>
              <button type="submit" className="mt-6 inline-flex w-full justify-center rounded-2xl bg-gradient-to-r from-accent-600 to-brand-500 px-5 py-3 text-sm font-semibold text-white">Add question</button>
            </form>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-[36px] border border-brand-100 bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-950">Inspection forms</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead><tr className="text-slate-500"><th className="px-4 py-3">Form</th><th className="px-4 py-3">Version</th><th className="px-4 py-3">Questions</th></tr></thead>
                  <tbody className="divide-y divide-slate-200">
                    {loading ? <tr><td colSpan="3" className="px-4 py-10 text-center text-slate-500">Loading forms...</td></tr> : forms.map((form) => (
                      <tr key={form.id} className="hover:bg-brand-50/80"><td className="px-4 py-4 font-semibold text-slate-950">{form.form_name}</td><td className="px-4 py-4 text-slate-600">{form.version}</td><td className="px-4 py-4 text-slate-600">{form.questions_count}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="rounded-[36px] border border-brand-100 bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-950">Questions</h2>
              <div className="mt-4 max-h-[420px] overflow-y-auto">
                {questions.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">No questions found.</p> : questions.map((question) => (
                  <div key={question.id} className="mb-3 rounded-3xl border border-brand-100 bg-brand-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">{question.form_name}</p>
                    <p className="mt-2 font-semibold text-slate-950">{question.question_text}</p>
                    <p className="mt-2 text-sm text-slate-600">{question.expected_answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
