import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, CreditCard, CheckCircle, Circle } from 'lucide-react';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

function StatusStep({ complete, children }) {
  return (
    <div
      className={[
        'mb-3 flex items-center gap-4 rounded-xl border px-5 py-4 text-sm font-medium transition hover:translate-x-1',
        complete
          ? 'border-emerald-600/20 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-800'
          : 'border-amber-700/20 bg-gradient-to-br from-amber-100 to-yellow-200 text-amber-800',
      ].join(' ')}
    >
      {complete ? <CheckCircle size={18} /> : <Circle size={18} />}
      {children}
    </div>
  );
}

function SummaryCard({ icon: Icon, tone, label, value, detail, onClick }) {
  const iconClass = {
    green: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    orange: 'bg-gradient-to-br from-amber-500 to-orange-600',
    blue: 'bg-gradient-to-br from-sky-700 to-sky-500',
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className="grid min-h-30 grid-cols-[72px_1fr] items-center gap-4 rounded-[14px] border border-slate-900/10 bg-white p-5 text-left shadow-[0_6px_16px_rgba(30,41,59,0.05)] transition hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(30,41,59,0.12)] focus:outline-none focus:ring-4 focus:ring-sky-700/10"
    >
      <span className={`grid h-14 w-14 place-items-center rounded-xl text-white ${iconClass}`}>
        <Icon size={25} />
      </span>
      <span className="flex flex-col">
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">{label}</span>
        <span className="mt-1 text-2xl font-extrabold text-slate-950">{value}</span>
        <span className="mt-1 text-sm font-semibold text-slate-500">{detail}</span>
      </span>
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = (localStorage.getItem('token') || '').trim().replace(/^"|"$/g, '');
    if (token) {
      try {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      } catch (e) {
        // Ignore storage/header issues during first render.
      }
      fetchApplications();
      fetchDocuments();
    }
  }, []);

  const fetchApplications = async () => {
    try {
      const token = (localStorage.getItem('token') || '').trim().replace(/^"|"$/g, '');
      const res = await axios.get('http://127.0.0.1:8000/api/applications/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setApplications(res.data || []);
    } catch (err) {
      console.error('Applications error', err?.response || err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = (localStorage.getItem('token') || '').trim().replace(/^"|"$/g, '');
      const res = await axios.get('http://127.0.0.1:8000/api/documents/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setDocuments(res.data || []);
    } catch (err) {
      console.error('Documents error', err?.response || err);
    }
  };

  const latestApplication = applications.length > 0 ? applications[0] : null;

  const submittedStatuses = ['submitted', 'under_review', 'inspection', 'approved', 'conditional', 'rejected'];
  const isRegistrationSubmitted = submittedStatuses.includes(latestApplication?.status);
  const isPaymentCompleted = latestApplication?.payment_status === 'paid';
  const isInspectionCompleted = latestApplication?.inspection_status === 'completed';
  const isCertificateApproved = latestApplication?.status === 'approved';

  const displayStatus = latestApplication
    ? isCertificateApproved
      ? 'Approved'
      : isInspectionCompleted
        ? 'Inspection completed'
        : latestApplication.status?.replace('_', ' ')
    : 'Not Started';

  const steps = [
    isRegistrationSubmitted,
    isPaymentCompleted,
    isInspectionCompleted,
    isCertificateApproved,
  ];
  const completed = steps.filter(Boolean).length;
  const progress = Math.round((completed / 4) * 100);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-slate-50 text-slate-900">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-7 sm:px-6 lg:px-10">
          <section className="grid gap-5 lg:grid-cols-3">
            <SummaryCard
              icon={FileText}
              tone="green"
              label="Applications"
              value={loading ? '...' : applications.length}
              detail={displayStatus === 'Not Started' ? 'No application' : displayStatus}
              onClick={() => navigate('/applications')}
            />
            <SummaryCard
              icon={Upload}
              tone="orange"
              label="Documents"
              value={loading ? '...' : documents.length}
              detail={documents.length > 0 ? `${documents.length} Uploaded` : 'Upload pending'}
              onClick={() => navigate('/documents')}
            />
            <SummaryCard
              icon={CreditCard}
              tone="blue"
              label="Payment"
              value={latestApplication?.payment_status || 'Pending'}
              detail={isPaymentCompleted ? 'Payment completed' : 'Awaiting verification'}
              onClick={() => navigate('/payments')}
            />
          </section>

          <section className="mt-7 grid gap-5 xl:grid-cols-2">
            <div className="rounded-[14px] border border-slate-900/10 bg-white p-6 shadow-[0_4px_12px_rgba(30,41,59,0.05)]">
              <h2 className="mb-4 text-lg font-bold text-slate-950">Recent Activity</h2>
              <div className="mb-3 rounded-[10px] border border-slate-900/5 bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                <span className="text-xs font-medium uppercase tracking-[0.05em] text-slate-500">
                  Latest Application
                </span>
                <h4 className="mt-2 text-base font-bold text-slate-950">
                  {latestApplication?.application_type || 'No application'}
                </h4>
              </div>
              <div className="rounded-[10px] border border-slate-900/5 bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                <span className="text-xs font-medium uppercase tracking-[0.05em] text-slate-500">
                  Current Status
                </span>
                <h4 className="mt-2 text-base font-bold text-slate-950">{displayStatus}</h4>
              </div>
            </div>

            <div className="rounded-[14px] border border-slate-900/10 bg-white p-6 shadow-[0_4px_12px_rgba(30,41,59,0.05)]">
              <h3 className="mb-4 text-lg font-semibold text-slate-950">Application Progress</h3>
              <StatusStep complete={isRegistrationSubmitted}>Registration Submitted</StatusStep>
              <StatusStep complete={isPaymentCompleted}>Payment Completed</StatusStep>
              <StatusStep complete={isInspectionCompleted}>Inspection Completed</StatusStep>
              <StatusStep complete={isCertificateApproved}>Certificate Approved</StatusStep>

              <div className="mt-6 border-t border-slate-900/10 pt-6">
                <div className="mb-4 text-sm font-bold text-slate-950">Application Completion</div>
                <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-slate-200 shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-700 to-cyan-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <small className="text-xs font-medium text-slate-500">{progress}% Completed</small>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
