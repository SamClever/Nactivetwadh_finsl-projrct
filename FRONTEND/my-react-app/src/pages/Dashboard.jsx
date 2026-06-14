import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Upload, CreditCard, CheckCircle, Circle,
  Tag, BookOpen, Users, CalendarDays, AlignLeft,
  Hash, Clock, Layers, ArrowRight, X, Printer,
  ShieldCheck, BadgeCheck, ClipboardList,
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

/* ─────────────────────────────────────────
   Status color maps
───────────────────────────────────────── */
const STATUS_COLORS = {
  submitted:    { bg: '#dbeafe', color: '#1d4ed8', label: 'Submitted',    dot: true },
  under_review: { bg: '#ede9fe', color: '#7c3aed', label: 'Under Review', dot: true },
  inspection:   { bg: '#fef9c3', color: '#a16207', label: 'Inspection',   dot: true },
  approved:     { bg: '#dcfce7', color: '#15803d', label: 'Approved',     dot: true },
  conditional:  { bg: '#ffedd5', color: '#c2410c', label: 'Conditional',  dot: true },
  rejected:     { bg: '#fee2e2', color: '#dc2626', label: 'Rejected',     dot: true },
};
const PAYMENT_COLORS = {
  paid:    { bg: '#dcfce7', color: '#15803d', label: 'Paid',    dot: true },
  pending: { bg: '#fef9c3', color: '#a16207', label: 'Pending', dot: true },
  failed:  { bg: '#fee2e2', color: '#dc2626', label: 'Failed',  dot: true },
};
const INSPECT_COLORS = {
  completed: { bg: '#dcfce7', color: '#15803d', label: 'Completed', dot: true },
  pending:   { bg: '#fef9c3', color: '#a16207', label: 'Pending',   dot: true },
  scheduled: { bg: '#dbeafe', color: '#1d4ed8', label: 'Scheduled', dot: true },
};

/* ─────────────────────────────────────────
   Badge
───────────────────────────────────────── */
function Badge({ value, colorMap, large }) {
  const v   = (value || 'pending').toLowerCase();
  const cfg = colorMap?.[v] || { bg: '#f1f5f9', color: '#64748b', label: v };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: large ? '5px 16px' : '3px 12px',
      borderRadius: 20,
      fontSize: large ? 13 : 12,
      fontWeight: 700,
      textTransform: 'capitalize',
      letterSpacing: '0.03em',
      background: cfg.bg,
      color: cfg.color,
    }}>
      {cfg.dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />}
      {cfg.label || v}
    </span>
  );
}

/* ─────────────────────────────────────────
   StatusStep
───────────────────────────────────────── */
function StatusStep({ complete, children }) {
  return (
    <div
      style={{
        marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12,
        borderRadius: 12,
        border: complete ? '1px solid rgba(5,150,105,0.25)' : '1px solid rgba(217,119,6,0.25)',
        padding: '12px 18px', fontSize: 13, fontWeight: 600,
        background: complete
          ? 'linear-gradient(135deg,#ecfdf5,#d1fae5)'
          : 'linear-gradient(135deg,#fffbeb,#fef3c7)',
        color: complete ? '#065f46' : '#92400e',
        transition: 'transform 0.18s', cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; }}
    >
      {complete ? <CheckCircle size={17} /> : <Circle size={17} />}
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   SummaryCard
───────────────────────────────────────── */
function SummaryCard({ icon: Icon, tone, label, value, detail, onClick }) {
  const iconGradient = {
    green:  'linear-gradient(135deg,#059669,#10b981)',
    orange: 'linear-gradient(135deg,#d97706,#f59e0b)',
    blue:   'linear-gradient(135deg,#0369a1,#0ea5e9)',
  }[tone];
  return (
    <button type="button" onClick={onClick}
      style={{
        display: 'grid', gridTemplateColumns: '68px 1fr', alignItems: 'center',
        gap: 16, minHeight: 110, borderRadius: 16,
        border: '1px solid rgba(15,23,42,0.08)', background: '#fff',
        padding: '18px 20px', textAlign: 'left', cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(15,23,42,0.06)',
        transition: 'transform 0.22s, box-shadow 0.22s', outline: 'none', width: '100%',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(15,23,42,0.13)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,23,42,0.06)';
      }}
    >
      <span style={{
        width: 52, height: 52, borderRadius: 14, display: 'grid',
        placeItems: 'center', background: iconGradient, color: '#fff', flexShrink: 0,
      }}>
        <Icon size={24} />
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: '#94a3b8', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{value}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>{detail}</span>
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────
   DetailRow (dashboard card)
───────────────────────────────────────── */
function DetailRow({ icon: Icon, label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{
        width: 34, height: 34, borderRadius: 9,
        background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)',
        display: 'grid', placeItems: 'center', flexShrink: 0, color: '#4f46e5',
      }}>
        <Icon size={15} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', wordBreak: 'break-word' }}>{value}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Modal Field (inside full-screen modal)
───────────────────────────────────────── */
function ModalField({ icon: Icon, label, value, accent, full }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{
      gridColumn: full ? '1 / -1' : undefined,
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 14,
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
    }}>
      <span style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: accent || 'linear-gradient(135deg,#eef2ff,#e0e7ff)',
        display: 'grid', placeItems: 'center', color: '#4f46e5',
      }}>
        <Icon size={17} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
          {label}
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', wordBreak: 'break-word', lineHeight: 1.55 }}>
          {value}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   StatusPill (modal timeline)
───────────────────────────────────────── */
function StatusPill({ done, label, sublabel }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 20px', borderRadius: 14,
      border: done ? '1.5px solid rgba(5,150,105,0.3)' : '1.5px solid rgba(226,232,240,1)',
      background: done ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : '#f8fafc',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        display: 'grid', placeItems: 'center',
        background: done ? 'linear-gradient(135deg,#059669,#10b981)' : '#e2e8f0',
        color: done ? '#fff' : '#94a3b8',
      }}>
        {done ? <CheckCircle size={18} /> : <Circle size={18} />}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: done ? '#065f46' : '#475569' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: done ? '#059669' : '#94a3b8', marginTop: 1 }}>{sublabel}</div>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Full-Screen Application Detail Modal
───────────────────────────────────────── */
function ApplicationModal({ app, onClose, documents, formatDate }) {
  if (!app) return null;

  const isPaymentDone    = app.payment_status    === 'paid';
  const isInspectionDone = app.inspection_status === 'completed';
  const isApproved       = app.status            === 'approved';
  const isSubmitted      = ['submitted','under_review','inspection','approved','conditional','rejected'].includes(app.status);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)', zIndex: 1000,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Modal panel */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(860px, 96vw)', maxHeight: '92vh',
        overflowY: 'auto', zIndex: 1001,
        borderRadius: 22,
        background: '#f8fafc',
        boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
        animation: 'slideUp 0.25s ease',
      }}>

        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 60%,#3b82f6 100%)',
          borderRadius: '22px 22px 0 0',
          padding: '28px 32px 24px',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'grid', placeItems: 'center',
                }}>
                  <ClipboardList size={20} color="#fff" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
                    Application Details
                  </h2>
                  <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                    Complete summary of your submitted application
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36, borderRadius: 10, border: 'none',
                background: 'rgba(255,255,255,0.2)', color: '#fff',
                display: 'grid', placeItems: 'center', cursor: 'pointer',
                transition: 'background 0.15s', flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Reference & main status strip */}
          <div style={{
            marginTop: 18,
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 12, padding: '12px 18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Hash size={14} color="rgba(255,255,255,0.7)" />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Reference</span>
              <span style={{ fontSize: 14, color: '#fff', fontWeight: 800, fontFamily: 'monospace' }}>
                {app.reference_number || '—'}
              </span>
            </div>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.3)' }} />
            <Badge value={app.status} colorMap={STATUS_COLORS} large />
            <Badge value={app.payment_status} colorMap={PAYMENT_COLORS} large />
            {app.inspection_status && <Badge value={app.inspection_status} colorMap={INSPECT_COLORS} large />}
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px 32px 32px' }}>

          {/* ── Section 1: Application Info ── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg,#1e40af,#3b82f6)',
                display: 'grid', placeItems: 'center',
              }}>
                <FileText size={14} color="#fff" />
              </div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Application Information
              </h3>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0', marginLeft: 8 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <ModalField
                icon={Tag}
                label="Application Type"
                value={app.application_type
                  ? app.application_type.charAt(0).toUpperCase() + app.application_type.slice(1)
                  : null}
                accent="linear-gradient(135deg,#eff6ff,#dbeafe)"
              />
              <ModalField
                icon={Layers}
                label="Category"
                value={app.category}
                accent="linear-gradient(135deg,#f0fdf4,#dcfce7)"
              />
              <ModalField
                icon={BookOpen}
                label="Programs / Courses Requested"
                value={app.programs_requested}
                accent="linear-gradient(135deg,#fdf4ff,#fae8ff)"
              />
              <ModalField
                icon={Users}
                label="Expected Number of Students"
                value={app.expected_students}
                accent="linear-gradient(135deg,#fff7ed,#ffedd5)"
              />
              <ModalField
                icon={CalendarDays}
                label="Preferred Inspection Date"
                value={formatDate(app.preferred_inspection_date)}
                accent="linear-gradient(135deg,#ecfdf5,#d1fae5)"
              />
              <ModalField
                icon={Clock}
                label="Submitted On"
                value={formatDate(app.created_at || app.submitted_at)}
                accent="linear-gradient(135deg,#f8fafc,#f1f5f9)"
              />
              {app.application_description && (
                <ModalField
                  icon={AlignLeft}
                  label="Application Description / Details"
                  value={app.application_description}
                  accent="linear-gradient(135deg,#fefce8,#fef9c3)"
                  full
                />
              )}
            </div>
          </div>

          {/* ── Section 2: Status Timeline ── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg,#0f766e,#14b8a6)',
                display: 'grid', placeItems: 'center',
              }}>
                <ShieldCheck size={14} color="#fff" />
              </div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Application Progress
              </h3>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0', marginLeft: 8 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <StatusPill done={isSubmitted}      label="Registration Submitted"  sublabel={isSubmitted ? 'Application received' : 'Not yet submitted'} />
              <StatusPill done={isPaymentDone}    label="Payment Completed"       sublabel={isPaymentDone ? 'Payment verified' : 'Awaiting payment'} />
              <StatusPill done={isInspectionDone} label="Inspection Completed"    sublabel={isInspectionDone ? 'Site inspection done' : 'Pending inspection'} />
              <StatusPill done={isApproved}       label="Certificate Approved"    sublabel={isApproved ? 'Registration granted' : 'Awaiting approval'} />
            </div>

            {/* Progress bar */}
            <div style={{
              marginTop: 16, padding: '14px 20px', borderRadius: 14,
              background: '#fff', border: '1px solid #e2e8f0',
            }}>
              {(() => {
                const steps   = [isSubmitted, isPaymentDone, isInspectionDone, isApproved];
                const done    = steps.filter(Boolean).length;
                const pct     = Math.round((done / 4) * 100);
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Overall Progress</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0f766e' }}>{pct}% Complete</span>
                    </div>
                    <div style={{ height: 10, borderRadius: 20, background: '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`, borderRadius: 20,
                        background: 'linear-gradient(90deg,#1e40af,#3b82f6,#14b8a6)',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                      {['Submitted','Paid','Inspected','Approved'].map((l, i) => (
                        <span key={l} style={{ fontSize: 11, fontWeight: 600, color: steps[i] ? '#0f766e' : '#94a3b8' }}>{l}</span>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* ── Section 3: Documents Uploaded ── */}
          {documents.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'linear-gradient(135deg,#d97706,#f59e0b)',
                  display: 'grid', placeItems: 'center',
                }}>
                  <Upload size={14} color="#fff" />
                </div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Uploaded Documents
                </h3>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0', marginLeft: 8 }} />
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  background: '#fef9c3', color: '#a16207',
                  borderRadius: 20, padding: '2px 10px',
                }}>
                  {documents.length} file{documents.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {documents.map((doc) => (
                  <div key={doc.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 12,
                    border: '1px solid #e2e8f0', background: '#fff',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      background: 'linear-gradient(135deg,#fff7ed,#ffedd5)',
                      display: 'grid', placeItems: 'center',
                    }}>
                      <FileText size={16} color="#d97706" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doc.document_type || doc.name || `Document #${doc.id}`}
                      </div>
                      {doc.uploaded_at && (
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                          Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <BadgeCheck size={16} color="#15803d" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Footer actions ── */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 10,
            paddingTop: 20, borderTop: '1px solid #e2e8f0',
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 24px', borderRadius: 10, border: '1px solid #e2e8f0',
                background: '#fff', color: '#475569', fontWeight: 700,
                fontSize: 13, cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 }        to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, calc(-50% + 24px)) }
                             to   { opacity: 1; transform: translate(-50%, -50%) } }
      `}</style>
    </>
  );
}

/* ─────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [documents, setDocuments]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [modalApp, setModalApp]         = useState(null);   // which app to show in modal

  useEffect(() => {
    const token = (localStorage.getItem('token') || '').trim().replace(/^"|"$/g, '');
    if (token) {
      try { axios.defaults.headers.common.Authorization = `Bearer ${token}`; } catch (_) {}
      fetchApplications();
      fetchDocuments();
    }
  }, []);

  const fetchApplications = async () => {
    try {
      const token = (localStorage.getItem('token') || '').trim().replace(/^"|"$/g, '');
      const res = await axios.get('http://127.0.0.1:8000/api/applications/', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setDocuments(res.data || []);
    } catch (err) {
      console.error('Documents error', err?.response || err);
    }
  };

  const latestApp = applications.length > 0 ? applications[0] : null;

  const submittedStatuses = ['submitted','under_review','inspection','approved','conditional','rejected'];
  const isRegistrationSubmitted = submittedStatuses.includes(latestApp?.status);
  const isPaymentCompleted      = latestApp?.payment_status   === 'paid';
  const isInspectionCompleted   = latestApp?.inspection_status === 'completed';
  const isCertificateApproved   = latestApp?.status           === 'approved';

  const displayStatus = latestApp
    ? isCertificateApproved
      ? 'Approved'
      : isInspectionCompleted
        ? 'Inspection Completed'
        : (latestApp.status || '').replace(/_/g, ' ')
    : 'Not Started';

  const steps    = [isRegistrationSubmitted, isPaymentCompleted, isInspectionCompleted, isCertificateApproved];
  const completed = steps.filter(Boolean).length;
  const progress  = Math.round((completed / 4) * 100);

  const formatDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d)) return val;
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  /* ── ESC key closes modal ── */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setModalApp(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* ── render ── */
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg,#f0f4ff 0%,#f8fafc 100%)', color: '#0f172a' }}>
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <Topbar />

        <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1400, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>

          {/* ── Top summary cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 28 }}>
            <SummaryCard
              icon={FileText} tone="green" label="Applications"
              value={loading ? '…' : applications.length}
              detail={displayStatus === 'Not Started' ? 'No application yet' : displayStatus}
              onClick={() => latestApp ? setModalApp(latestApp) : navigate('/applications')}
            />
            <SummaryCard
              icon={Upload} tone="orange" label="Documents"
              value={loading ? '…' : documents.length}
              detail={documents.length > 0 ? `${documents.length} Uploaded` : 'Upload pending'}
              onClick={() => navigate('/documents')}
            />
            <SummaryCard
              icon={CreditCard} tone="blue" label="Payment"
              value={latestApp?.payment_status || 'Pending'}
              detail={isPaymentCompleted ? 'Payment completed' : 'Awaiting verification'}
              onClick={() => navigate('/payments')}
            />
          </div>

          {/* ── Middle row ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* Application Details card */}
            <div style={{
              borderRadius: 18, border: '1px solid rgba(15,23,42,0.08)',
              background: '#fff', boxShadow: '0 4px 16px rgba(15,23,42,0.06)', overflow: 'hidden',
            }}>
              {/* header */}
              <div style={{
                background: 'linear-gradient(135deg,#1e40af 0%,#3b82f6 100%)',
                padding: '18px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}>
                    <FileText size={18} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Application Details</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>Your submitted application info</div>
                  </div>
                </div>
                {latestApp && (
                  <button
                    onClick={() => setModalApp(latestApp)}   /* ← opens modal, no redirect */
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: 12, fontWeight: 700, color: '#fff',
                      background: 'rgba(255,255,255,0.2)', border: 'none',
                      borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                      transition: 'background 0.18s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.32)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                  >
                    View All <ArrowRight size={13} />
                  </button>
                )}
              </div>

              {/* body */}
              <div style={{ padding: '4px 24px 20px' }}>
                {loading ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Loading…</div>
                ) : !latestApp ? (
                  <div style={{ padding: '40px 0', textAlign: 'center' }}>
                    <FileText size={40} color="#cbd5e1" style={{ margin: '0 auto 12px', display: 'block' }} />
                    <p style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500 }}>No application submitted yet</p>
                    <button
                      onClick={() => navigate('/applications')}
                      style={{
                        marginTop: 14, padding: '9px 22px', borderRadius: 10, border: 'none',
                        background: 'linear-gradient(135deg,#1e40af,#3b82f6)',
                        color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      }}
                    >
                      Submit Application
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Reference strip */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 0 10px', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 8,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ref No.</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', fontFamily: 'monospace' }}>
                          {latestApp.reference_number || '—'}
                        </span>
                      </div>
                      <Badge value={latestApp.status} colorMap={STATUS_COLORS} />
                    </div>

                    <DetailRow icon={Tag}          label="Application Type"       value={latestApp.application_type ? latestApp.application_type.charAt(0).toUpperCase() + latestApp.application_type.slice(1) : null} />
                    <DetailRow icon={Layers}       label="Category"               value={latestApp.category} />
                    <DetailRow icon={BookOpen}     label="Programs / Courses"     value={latestApp.programs_requested} />
                    <DetailRow icon={Users}        label="Expected Students"      value={latestApp.expected_students} />
                    <DetailRow icon={CalendarDays} label="Preferred Inspection"   value={formatDate(latestApp.preferred_inspection_date)} />
                    <DetailRow icon={AlignLeft}    label="Description"            value={latestApp.application_description} />
                    <DetailRow icon={Clock}        label="Submitted On"           value={formatDate(latestApp.created_at || latestApp.submitted_at)} />

                    {/* Status badges */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Payment</span>
                        <Badge value={latestApp.payment_status} colorMap={PAYMENT_COLORS} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Inspection</span>
                        <Badge value={latestApp.inspection_status} colorMap={INSPECT_COLORS} />
                      </div>
                      {latestApp.review_status && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Review</span>
                          <Badge value={latestApp.review_status} colorMap={STATUS_COLORS} />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Progress card */}
            <div style={{
              borderRadius: 18, border: '1px solid rgba(15,23,42,0.08)',
              background: '#fff', boxShadow: '0 4px 16px rgba(15,23,42,0.06)', overflow: 'hidden',
            }}>
              <div style={{
                background: 'linear-gradient(135deg,#0f766e 0%,#14b8a6 100%)',
                padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}>
                  <CheckCircle size={18} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Application Progress</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>Track your registration stages</div>
                </div>
              </div>

              <div style={{ padding: '20px 24px' }}>
                <StatusStep complete={isRegistrationSubmitted}>Registration Submitted</StatusStep>
                <StatusStep complete={isPaymentCompleted}>Payment Completed</StatusStep>
                <StatusStep complete={isInspectionCompleted}>Inspection Completed</StatusStep>
                <StatusStep complete={isCertificateApproved}>Certificate Approved</StatusStep>

                <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Overall Completion</span>
                    <span style={{ fontSize: 13, fontWeight: 800, background: 'linear-gradient(135deg,#0f766e,#14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {progress}%
                    </span>
                  </div>
                  <div style={{ height: 10, borderRadius: 20, background: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, borderRadius: 20, background: 'linear-gradient(90deg,#0f766e,#14b8a6)', transition: 'width 0.6s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    {['Submitted','Paid','Inspected','Approved'].map((lbl, i) => (
                      <span key={lbl} style={{ fontSize: 10, fontWeight: 600, color: steps[i] ? '#0f766e' : '#94a3b8' }}>{lbl}</span>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Steps Done', value: `${completed} / 4` },
                    { label: 'Documents',  value: documents.length },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      borderRadius: 12, background: 'linear-gradient(135deg,#f0fdfa,#ccfbf1)',
                      border: '1px solid rgba(15,118,110,0.15)',
                      padding: '12px 16px', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#0f766e' }}>{value}</div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── All Applications list (when more than 1) ── */}
          {applications.length > 1 && (
            <div style={{
              borderRadius: 18, border: '1px solid rgba(15,23,42,0.08)',
              background: '#fff', boxShadow: '0 4px 16px rgba(15,23,42,0.06)',
              padding: '20px 24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>All Applications</h2>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {applications.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setModalApp(app)}   /* ← click any row → modal */
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr auto',
                      alignItems: 'center', gap: 12,
                      padding: '12px 16px', borderRadius: 12,
                      border: '1px solid #f1f5f9', background: '#fafafa',
                      cursor: 'pointer', transition: 'background 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background   = '#f0f4ff';
                      e.currentTarget.style.boxShadow    = '0 2px 10px rgba(30,64,175,0.08)';
                      e.currentTarget.style.borderColor  = '#bfdbfe';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background   = '#fafafa';
                      e.currentTarget.style.boxShadow    = 'none';
                      e.currentTarget.style.borderColor  = '#f1f5f9';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <span style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <Hash size={14} color="#1e40af" />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {app.reference_number || `Application #${app.id}`}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>
                          {app.application_type} · {app.category}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Badge value={app.status} colorMap={STATUS_COLORS} />
                      <ArrowRight size={14} color="#94a3b8" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Modal ── */}
      {modalApp && (
        <ApplicationModal
          app={modalApp}
          documents={documents}
          onClose={() => setModalApp(null)}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}
