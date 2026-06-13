import { useEffect, useState } from 'react';
import { ClipboardList, FilePlus2, HelpCircle, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';

const hardcopyTemplate = {
  form_name: 'Inspection Form for Technical Training Institutions',
  version: 'Revised April 2012',
  questions: [
    {
      question_text: 'Particulars of the Training Institution and 1.1 Infrastructure verification',
      expected_answer:
        'Capture institution name, location, district/municipal, plot number or village, address, phone, fax, email, webpage, and infrastructure verification for Offices, Classrooms, Laboratories, Workshops, Dormitories, Assembly halls, Libraries, Cafeterias (students), Canteen (staff), Staff quarters, Bookshops, Equipment and Tools (Computers), Equipment / Tools (Other specific), Furniture, Audio Visual Aids, Library books, and Library journals. Record number provided, number verified, number functioning, quality (G/A/P), and remarks.',
    },
    {
      question_text: '1.2 Building documents',
      expected_answer:
        'Record Yes/No for Building permit, Land-use plan, Certificate of Occupancy, Health certificate, and Certificate of Conformity with fire regulation.',
    },
    {
      question_text: '1.3 Suitability of infrastructure for the purpose of intended training',
      expected_answer:
        '7: Available, conveniently located, adequate and in excellent condition | 6: Available, conveniently located, adequate and in good condition | 5: Available, conveniently located, in good condition but not adequate | 4: Available, adequate, in good condition but not conveniently located | 3: Available, in good condition but not adequate, and not conveniently located | 2: Available, inadequate and in poor condition | 1: Available, inadequate and in pathetic condition | 0: Not available',
    },
    {
      question_text: '2.1 Adequacy of equipment for the purpose of training',
      expected_answer:
        '6: Available, sufficient and in excellent working condition | 5: Available, sufficient and in good working condition | 4: Available, insufficient but in good working condition | 3: Available, sufficient but in poor working condition | 2: Available, insufficient and in poor working condition | 1: Available, insufficient and in pathetic working condition | 0: Not available',
    },
    {
      question_text: '3.1 Adequacy of qualified teaching staff for training',
      expected_answer:
        '7: Adequate staff with at least 75% having relevant qualifications above programme level | 6: Adequate staff with at least 50% having relevant qualifications above programme level | 5: Inadequate staff but at least 50% have relevant qualifications above programme level | 4: Adequate staff but at least 33% have relevant qualifications above programme level | 3: Adequate staff but at least 33% have relevant qualifications at the same programme level | 2: Inadequate staff and at least 50% have irrelevant qualifications above programme level | 1: Inadequate staff and at least 50% have irrelevant qualifications at the same programme level | 0: Inadequate staff and less than 33% have relevant qualifications either below or at the same programme level',
    },
    {
      question_text: '4.1 Adequacy of curricula for the purpose of training',
      expected_answer:
        '7: Curricula follow NTA system, validated by NACTE within 5 years, implemented for at least one year | 6: Curricula follow NTA system, validated within 5 years, not yet implemented | 5: Curricula do not follow NTA system but have standard up-to-date formats and programmes implemented for at least 1 year | 4: Curricula follow NTA system and validated by NACTE but outdated, programmes implemented for at least 1 year | 3: Curricula do not follow NTA system but have standard up-to-date formats, implementation not started | 2: Curricula do not follow NTA system and have sub-standard formats but are up-to-date and implemented for at least 1 year | 1: Curricula do not follow NTA system and have sub-standard up-to-date formats, implementation not started | 0: Curricula do not follow NTA system and are outdated or not available',
    },
    {
      question_text: '5.1 Adequacy of the level of funding for the purpose of training',
      expected_answer:
        '6: Sources of funds other than student fees and financial trend of at least 3 years increasing | 5: No sources of funds other than student fees and financial trend of at least 3 years increasing | 4: Constant financial trend for at least 3 years | 3: Funds enough for at least one academic year | 2: Financial trend cannot be determined but potential for raising funds can be identified | 1: Funding level for at least 3 years declines significantly | 0: No evidence of availability of funds for training purposes',
    },
    {
      question_text: '6.1 Appropriateness of institutional governance for training',
      expected_answer:
        '3: Has Board/Council/Advisory Board and organisation structure supported by CEO with appropriate qualifications | 2: No Board/Council/Advisory Board but organisation structure supported by CEO with appropriate qualifications | 1: Has Board/Council/Advisory Board but CEO lacks appropriate qualifications | 1: No Board/Council/Advisory Board and no organisation structure but has CEO with appropriate qualifications | 0: No Board/Council/Advisory Board, no organisation structure, and CEO lacks appropriate qualifications',
    },
    {
      question_text: '7.1 Adequacy of the structure and duration of training',
      expected_answer:
        '4: Appropriate practical facilities, acceptable proportions of time for knowledge, and environment for required attitude | 3: Appropriate practical facilities and acceptable knowledge time, but no adequate attitude-building environment | 2: Appropriate practical facilities but no acceptable knowledge time allocation | 1: No appropriate practical facilities but acceptable knowledge time allocation',
    },
    {
      question_text: '8.1 Appropriateness of assessment and examination procedures',
      expected_answer:
        '4: Nationally recognized and/or externally examined by recognized institutions | 3: Nationally recognized but not externally examined | 2: Not nationally recognized but externally examined by recognized institutions | 1: Neither nationally recognized nor externally examined | 0: Procedure does not exist',
    },
    {
      question_text: '9.1 Adequacy of support services for training',
      expected_answer:
        '3: Basic support services are available, adequate and up to standard | 2: Available and up to standard but inadequate | 1: Available and adequate but not up to standard | 0: Not available / not indicated',
    },
    {
      question_text: '10.1 Adequacy of long-term / strategic plans for training projections',
      expected_answer:
        '3: Long term / strategic plans in support of training exist and are documented | 2: Long term plans exist but are not documented | 1: Long term plans exist and are documented but partially address training function | 0: Long term plans on training functions do not exist',
    },
    {
      question_text: 'Physical Verification Team Leader',
      expected_answer: 'Capture total score, average score, team leader full name, signature, and date.',
    },
  ],
};

const emptyForm = { form_name: hardcopyTemplate.form_name, version: hardcopyTemplate.version };
const emptyQuestion = { form: '', question_text: '', expected_answer: '' };

export default function InspectionForms() {
  const [forms, setForms] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [questionData, setQuestionData] = useState(emptyQuestion);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [creatingTemplate, setCreatingTemplate] = useState(false);

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
    setError('');
    try {
      await api.post('/management/inspection-forms/', formData);
      setFormData(emptyForm);
      setMessage('Inspection form created.');
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to create inspection form.');
    }
  }

  async function createQuestion(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.post('/management/form-questions/', questionData);
      setQuestionData((current) => ({ ...emptyQuestion, form: current.form }));
      setMessage('Question added to form.');
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to add question.');
    }
  }

  async function deleteForm(id) {
    if (!window.confirm('Are you sure you want to delete this form template? All its questions will be deleted as well.')) return;
    setMessage('');
    setError('');
    try {
      await api.delete('/management/inspection-forms/', { data: { id } });
      setMessage('Form template deleted successfully.');
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to delete form template.');
    }
  }

  async function deleteQuestion(id) {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    setMessage('');
    setError('');
    try {
      await api.delete('/management/form-questions/', { data: { id } });
      setMessage('Question deleted successfully.');
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to delete question.');
    }
  }

  async function createHardcopyTemplate() {
    const exists = forms.some(
      (f) =>
        f.form_name === hardcopyTemplate.form_name &&
        f.version === hardcopyTemplate.version
    );
    if (exists) {
      setError('The standard NACTVET hardcopy template has already been created.');
      return;
    }

    setCreatingTemplate(true);
    setMessage('');
    setError('');

    try {
      const formResponse = await api.post('/management/inspection-forms/', {
        form_name: hardcopyTemplate.form_name,
        version: hardcopyTemplate.version,
      });

      const formId = formResponse.data.id;
      await Promise.all(
        hardcopyTemplate.questions.map((question) =>
          api.post('/management/form-questions/', {
            form: formId,
            question_text: question.question_text,
            expected_answer: question.expected_answer,
          })
        )
      );

      setQuestionData((current) => ({ ...current, form: String(formId) }));
      setMessage(`Hardcopy inspection template created with ${hardcopyTemplate.questions.length} questions.`);
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to create the hardcopy inspection template.');
    } finally {
      setCreatingTemplate(false);
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
              <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Inspection setup</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Forms and questions</h1>
            </div>
            <label className="flex h-14 items-center gap-3 rounded-3xl border border-brand-100 bg-white px-4 text-slate-700">
              <Search size={18} className="text-brand-600" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search forms or questions" className="w-full bg-transparent text-sm outline-none" />
            </label>
          </div>

          {(message || error) && (
            <div className={`rounded-2xl px-4 py-3 text-sm font-semibold ${error ? 'bg-rose-100 text-rose-900' : 'bg-emerald-100 text-emerald-900'}`}>
              {error || message}
            </div>
          )}

          <div className="rounded-[32px] border border-brand-100 bg-white p-5 shadow-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Hardcopy template</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">NACTVET Standard Inspection Form (Revised April 2012)</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Creates the revised April 2012 form with sections 1 to 10, infrastructure checks, building documents, score choices, comments, total score and team leader details.
                </p>
              </div>
              <button
                type="button"
                disabled={creatingTemplate}
                onClick={createHardcopyTemplate}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent-600 to-brand-500 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FilePlus2 size={18} />
                {creatingTemplate ? 'Creating...' : 'Create hardcopy template'}
              </button>
            </div>
          </div>

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
                  <thead><tr className="text-slate-500"><th className="px-4 py-3">Form</th><th className="px-4 py-3">Version</th><th className="px-4 py-3">Questions</th><th className="px-4 py-3">Actions</th></tr></thead>
                  <tbody className="divide-y divide-slate-200">
                    {loading ? <tr><td colSpan="4" className="px-4 py-10 text-center text-slate-500">Loading forms...</td></tr> : forms.map((form) => (
                      <tr key={form.id} className="hover:bg-brand-50/80">
                        <td className="px-4 py-4 font-semibold text-slate-950">{form.form_name}</td>
                        <td className="px-4 py-4 text-slate-600">{form.version}</td>
                        <td className="px-4 py-4 text-slate-600">{form.questions_count}</td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => deleteForm(form.id)}
                            className="text-rose-600 hover:text-rose-900 font-semibold cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="rounded-[36px] border border-brand-100 bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-950">Questions</h2>
              <div className="mt-4 max-h-[420px] overflow-y-auto">
                {questions.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">No questions found.</p> : questions.map((question) => (
                  <div key={question.id} className="mb-3 rounded-3xl border border-brand-100 bg-brand-50 p-4 relative group">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">{question.form_name}</p>
                    <p className="mt-2 font-semibold text-slate-950">{question.question_text}</p>
                    <p className="mt-2 text-sm text-slate-600">{question.expected_answer}</p>
                    <button
                      type="button"
                      onClick={() => deleteQuestion(question.id)}
                      className="absolute top-4 right-4 text-xs text-rose-600 hover:text-rose-900 font-semibold cursor-pointer opacity-0 group-hover:opacity-100 transition"
                    >
                      Delete
                    </button>
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
