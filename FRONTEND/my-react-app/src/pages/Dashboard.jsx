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
    fetchApplications();
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const res = await axios.get('http://127.0.0.1:8000/api/applications/', {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });

      setApplications(res.data || []);
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.clear();
        navigate('/');
      }
      console.error('Applications error', err?.response || err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://127.0.0.1:8000/api/documents/', {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });

      setDocuments(res.data || []);
    } catch (err) {
      console.error('Documents error', err?.response || err);
    }
  };

  const latestApplication = applications.length > 0 ? applications[0] : null;

  const steps = [
    latestApplication?.status === 'submitted',
    latestApplication?.payment_status === 'paid',
    latestApplication?.inspection_status === 'completed',
    latestApplication?.status === 'approved'
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
                <p>{latestApplication?.status || 'No application'}</p>
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
                <h4>{latestApplication?.status || 'Not Started'}</h4>
              </div>
            </div>

            <div className="institution-section">
              <h3>Application Progress</h3>

              <div className={latestApplication?.status === 'submitted' ? 'progress-item complete' : 'progress-item pending'}>
                {latestApplication?.status === 'submitted' ? <CheckCircle size={18} /> : <Circle size={18} />}
                Registration Submitted
              </div>

              <div className={latestApplication?.payment_status === 'paid' ? 'progress-item complete' : 'progress-item pending'}>
                {latestApplication?.payment_status === 'paid' ? <CheckCircle size={18} /> : <Circle size={18} />}
                Payment Completed
              </div>

              <div className={latestApplication?.inspection_status === 'completed' ? 'progress-item complete' : 'progress-item pending'}>
                {latestApplication?.inspection_status === 'completed' ? <CheckCircle size={18} /> : <Circle size={18} />}
                Inspection Completed
              </div>

              <div className={latestApplication?.status === 'approved' ? 'progress-item complete' : 'progress-item pending'}>
                {latestApplication?.status === 'approved' ? <CheckCircle size={18} /> : <Circle size={18} />}
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
