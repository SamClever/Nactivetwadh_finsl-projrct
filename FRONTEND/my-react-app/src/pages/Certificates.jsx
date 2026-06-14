import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Award, Download, Printer, ShieldCheck, Calendar, FileText } from 'lucide-react';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

import '../styles/Certificates.css';

export default function Certificates() {
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = (localStorage.getItem('token') || '').trim().replace(/^"|"$/g, '');
    if (!token) return setLoading(false);

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const fetchData = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/applications/', {
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });

        const appData = res.data?.[0] || null;
        setApplication(appData);

        if (appData) {
          try {
            const instRes = await axios.get('http://127.0.0.1:8000/api/institutions/', {
              headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
              }
            });
            setInstitution(instRes.data);
          } catch (instError) {
            console.error('Error fetching institution details', instError);
          }
        }
      } catch (error) {
        console.error('Certificate page fetch error', error?.response || error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const isPaid = application?.payment_status === 'paid';
  const isApproved = application?.status === 'approved';

  // Format dates elegantly
  const getFormattedDate = (dateString, addYears = 0) => {
    const date = dateString ? new Date(dateString) : new Date();
    if (addYears) {
      date.setFullYear(date.getFullYear() + addYears);
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-slate-50 text-slate-900">
      <Sidebar className="no-print" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar className="no-print" />

        <main className="certificate-content">
          <div className="certificate-success-shell">
            {loading ? (
              <div className="certificate-loading">Loading application details…</div>
            ) : isApproved ? (
              <div className="certificate-approved-view">
                {/* Header message card (hidden during print) */}
                <div className="certificate-notice-card no-print">
                  <div className="notice-icon-badge">
                    <Award className="notice-badge-icon" size={32} />
                  </div>
                  <div className="notice-text">
                    <span className="status-pill-approved">Certificate Approved</span>
                    <h2>Congratulations! Your Registration is Approved</h2>
                    {/* <p>
                      Your technical institution registration has been successfully approved by NACTVET. Below is a preview of your official registration certificate.
                    </p> */}
                  </div>
                  <div className="notice-actions">
                    <button className="download-button" onClick={handlePrint}>
                      <Download size={18} />
                      Download Certificate (PDF)
                    </button>
                  </div>
                </div>

                {/* A4 Landscape Document Preview */}
                <div className="certificate-document-container">
                  <div className="certificate-document">
                    {/* Corner Ornaments */}
                    <div className="cert-corner top-left"></div>
                    <div className="cert-corner top-right"></div>
                    <div className="cert-corner bottom-left"></div>
                    <div className="cert-corner bottom-right"></div>

                    {/* Double Borders */}
                    <div className="cert-outer-border">
                      <div className="cert-inner-border">
                        {/* Seal Watermark (Subtle Background) */}
                        <div className="cert-watermark"></div>
                         {/* Certificate Header */}
                         <div className="cert-header">
                           <div className="cert-logo-wrapper">
                             <svg width="60" height="60" viewBox="0 0 100 100" className="cert-logo">
                               <circle cx="50" cy="50" r="46" fill="none" stroke="#c5a059" strokeWidth="3" />
                               <circle cx="50" cy="50" r="40" fill="#0f172a" />
                               <path d="M50 20 L60 40 L82 43 L65 58 L70 80 L50 68 L30 80 L35 58 L18 43 L40 40 Z" fill="#c5a059" />
                             </svg>
                           </div>
                           <h4 className="cert-council">NATIONAL COUNCIL FOR TECHNICAL AND VOCATIONAL EDUCATION AND TRAINING</h4>
                           <span className="cert-accreditation-tag">NACTVET</span>
                           <div className="cert-divider"></div>
                         </div>
 
                         {/* Certificate Body */}
                         <div className="cert-body">
                           <h1 className="cert-title">Certificate of Registration</h1>
                           <p className="cert-intro">This is to certify that</p>
                           <h2 className="cert-recipient-name">
                             {institution?.institution_name || "THE TECHNICAL INSTITUTION"}
                           </h2>
                           <p className="cert-milestones-text">
                             has successfully complied with the provisions of the NACTVET Act, completed all registration requirements, and passed physical facility inspection.
                           </p>
                           <p className="cert-declaration">
                             Is hereby registered as a recognized training institution.
                           </p>
                         </div>
 
                         {/* Unified Metadata & Signature Footer Row */}
                         <div className="cert-footer-row">
                           <div className="footer-col-meta">
                             <div className="meta-item">
                               <span className="meta-label">Certificate ID</span>
                               <span className="meta-value">
                                 NACTVET/REG/{application?.id ? String(application.id).padStart(4, '0') : '0027'}
                               </span>
                             </div>
                             <div className="meta-item mt-2">
                               <span className="meta-label">Date of Issue</span>
                               <span className="meta-value-date">{getFormattedDate(application?.submission_date)}</span>
                             </div>
                             <div className="meta-item mt-2">
                               <span className="meta-label">Date of Expiry</span>
                               <span className="meta-value-date">{getFormattedDate(application?.submission_date, 3)}</span>
                             </div>
                           </div>
 
                           <div className="footer-col-seal">
                             <div className="gold-foil-seal">
                               <div className="seal-star">★</div>
                               <div className="seal-text">NACTVET</div>
                             </div>
                             <span className="seal-label-under">Official Seal</span>
                           </div>
 
                           <div className="footer-col-sign">
                             <div className="signature-line">
                               <svg width="140" height="32" viewBox="0 0 150 40" className="signature-svg">
                                 <path d="M10 25 Q30 5, 50 25 T90 25 T130 15" fill="none" stroke="#0f172a" strokeWidth="2.5" />
                               </svg>
                             </div>
                             <span className="signature-title">EXECUTIVE SECRETARY</span>
                             <span className="signature-name">Dr. Adolf B. Rutayuga</span>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Return button at bottom (hidden during print) */}
                <div className="certificate-bottom-actions no-print">
                  <button className="secondary-button" onClick={() => navigate('/dashboard')}>
                    Return to Dashboard
                  </button>
                </div>
              </div>
            ) : isPaid ? (
              <section className="certificate-success-card" role="status" aria-live="polite">
                <div className="success-icon-wrapper">
                  <CheckCircle className="success-icon" size={56} />
                </div>

                <div className="certificate-copy">
                  <span className="status-pill success">Waiting for Approval</span>
                  <h2>Application Submitted Successfully</h2>
                  <p className="certificate-lead">
                    Thank you for completing your application and payment. Your application has been successfully submitted and is currently under review by our administration team.
                  </p>
                </div>

                <div className="certificate-details-grid">
                  <div className="certificate-detail-card">
                    <span>Current Status</span>
                    <strong>Waiting for Approval</strong>
                  </div>
                  <div className="certificate-detail-card">
                    <span>Estimated Review</span>
                    <strong>Review process may take 1–3 business days.</strong>
                  </div>
                </div>

                <div className="certificate-message-card">
                  <p>
                    We will carefully verify your submitted information and supporting documents. Once the review process is completed, you will receive a notification regarding the approval status of your certificate application.
                  </p>
                  <p className="certificate-message-emphasis">
                    Your application has been submitted successfully and is awaiting approval. No further action is required at this time.
                  </p>
                </div>

                <div className="certificate-actions">
                  <button className="primary-button" onClick={() => navigate('/applications')}>
                    View Application Details
                  </button>
                  <button className="secondary-button" onClick={() => navigate('/dashboard')}>
                    Return to Dashboard
                  </button>
                </div>

                <footer className="certificate-footer-note">
                  Please keep your application reference number for future tracking. You can monitor the status of your application from your dashboard at any time.
                </footer>
              </section>
            ) : (
              <section className="certificate-empty-state">
                <h2>No paid certificate application found</h2>
                <p>
                  Your certificate application will appear here after payment is completed. If you have already paid, refresh the page or return to your dashboard.
                </p>
                <div className="certificate-actions">
                  <button className="primary-button" onClick={() => navigate('/dashboard')}>
                    Return to Dashboard
                  </button>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
