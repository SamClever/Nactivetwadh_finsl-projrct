import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

import { FileText, Upload, CreditCard, CheckCircle, Circle } from 'lucide-react';

import '../styles/dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch (e) {
      return null;
    }
  }, []);

  useEffect(() => {
      const token = (localStorage.getItem('token') || "").trim().replace(/^\"|\"$/g, "");
      if (token) {
        // ensure axios default header is set
        try { axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; } catch (e) {}
        fetchApplications();
        fetchDocuments();
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchApplications = async () => {
    try {
      const token = (localStorage.getItem('token') || "").trim().replace(/^\"|\"$/g, "");
        console.debug('fetchApplications using token:', token ? token.substring(0,20)+'...' : token);
      
      const res = await axios.get('http://127.0.0.1:8000/api/applications/', {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });

      setApplications(res.data || []);
    } catch (err) {
        console.error('Applications error', err?.response || err);
        try {
          console.debug('Applications error response data/status:', err?.response?.data, err?.response?.status);
        } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = (localStorage.getItem('token') || "").trim().replace(/^\"|\"$/g, "");
      console.debug('fetchDocuments using token:', token ? token.substring(0,20)+'...' : token);
      const res = await axios.get('http://127.0.0.1:8000/api/documents/', {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });

      setDocuments(res.data || []);
    } catch (err) {
      console.error('Documents error', err?.response || err);
      try { console.debug('Documents error response data/status:', err?.response?.data, err?.response?.status); } catch (e) {}
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
    isCertificateApproved
  ];

  const completed = steps.filter(Boolean).length;
  const progress = Math.round((completed / 4) * 100);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Topbar />

        <div className="dashboard-content">
          {/* <div className="welcome-widget" role="region" aria-label="Welcome">
            <div className="user-avatar">{(user?.institution || user?.username || 'N')[0]}</div>
            <div className="welcome-info">
              <span>Institution Registration & Accreditation</span>
              <h3>{user?.institution || user?.username || 'Institution'}</h3>
              <p>Welcome back — here's a quick summary of your application and documents.</p>
            </div>
            <div className="user-status">
              <div className="status-badge">{latestApplication ? latestApplication.status : 'No Application'}</div>
              <small>Account: {user?.email || 'N/A'}</small>
            </div>
          </div> */}

          <div className="cards-grid">
            <div
              className="workspace-card"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/applications')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigate('/applications');
              }}
              aria-label="View applications"
            >
              <div className="card-icon green">
                <FileText size={25} />
              </div>
              <div className="card-content">
                <span>APPLICATIONS</span>
                <h3>{loading ? '...' : applications.length}</h3>
                <p>{displayStatus === 'Not Started' ? 'No application' : displayStatus}</p>
              </div>
            </div>

            <div
              className="workspace-card"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/documents')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigate('/documents');
              }}
              aria-label="View documents"
            >
              <div className="card-icon orange">
                <Upload size={25} />
              </div>
              <div className="card-content">
                <span>DOCUMENTS</span>
                <h3>{loading ? '...' : documents.length}</h3>
                <p>{documents.length > 0 ? documents.length + ' Uploaded' : 'Upload pending'}</p>
              </div>
            </div>

            <div
              className="workspace-card"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/payments')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigate('/payments');
              }}
              aria-label="View payments"
            >
              <div className="card-icon blue">
                <CreditCard size={25} />
              </div>
              <div className="card-content">
                <span>PAYMENT</span>
                <h3>{latestApplication?.payment_status || 'Pending'}</h3>
                <p>{latestApplication?.payment_status === 'paid' ? 'Payment completed' : 'Awaiting verification'}</p>
              </div>
            </div>
          </div>

          <div className="info-grid">
            <div className="institution-section">
              <h2>Recent Activity</h2>
              <div className="info-box">
                <span>Latest Application</span>
                <h4>{latestApplication?.application_type || 'No application'}</h4>
              </div>
              <div className="info-box">
                <span>Current Status</span>
                <h4>{displayStatus}</h4>
              </div>
            </div>

            <div className="institution-section">
              <h3>Application Progress</h3>

              <div className={isRegistrationSubmitted ? 'progress-item complete' : 'progress-item pending'}>
                {isRegistrationSubmitted ? <CheckCircle size={18} /> : <Circle size={18} />}
                Registration Submitted
              </div>

              <div className={isPaymentCompleted ? 'progress-item complete' : 'progress-item pending'}>
                {isPaymentCompleted ? <CheckCircle size={18} /> : <Circle size={18} />}
                Payment Completed
              </div>

              <div className={isInspectionCompleted ? 'progress-item complete' : 'progress-item pending'}>
                {isInspectionCompleted ? <CheckCircle size={18} /> : <Circle size={18} />}
                Inspection Completed
              </div>

              <div className={isCertificateApproved ? 'progress-item complete' : 'progress-item pending'}>
                {isCertificateApproved ? <CheckCircle size={18} /> : <Circle size={18} />}
                Certificate Approved
              </div>

              <div className="mini-progress">
                <div className="progress-title">Application Completion</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: progress + '%' }} />
                </div>
                <small>{progress}% Completed</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
