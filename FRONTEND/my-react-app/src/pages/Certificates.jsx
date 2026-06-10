import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

import '../styles/Certificates.css';

export default function Certificates() {
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = (localStorage.getItem('token') || '').trim().replace(/^"|"$/g, '');
    if (!token) return setLoading(false);

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const fetchApplications = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/applications/', {
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });

        setApplication(res.data?.[0] || null);
      } catch (error) {
        console.error('Certificate page fetch error', error?.response || error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const isPaid = application?.payment_status === 'paid';

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Topbar />

        <main className="certificate-content">
          <div className="certificate-success-shell">
            {/* <div className="certificate-page-header">
              <span className="certificate-page-tag">Certificate Application</span>
              <h1>Certificate status overview</h1>
              <p>Review the latest update for your certificate application and keep track of approval progress.</p>
            </div> */}

            {loading ? (
              <div className="certificate-loading">Loading application details…</div>
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
