import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle2, ShieldCheck, Search, Loader2, Download, Printer } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/Payments.css";

const API_BASE = "http://127.0.0.1:8000/api";

const formatTZS = (value) =>
  value !== undefined && value !== null
    ? `${new Intl.NumberFormat("en-US").format(value)} TZS`
    : "0 TZS";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

const sanitizeError = (error) => {
  if (!error) return "Unknown error.";
  if (error.response?.data?.error) return error.response.data.error;
  if (error.response?.data) return JSON.stringify(error.response.data);
  if (error.message) return error.message;
  return "An unexpected network error occurred.";
};

const statusClass = (status) => {
  if (status === "paid") return "status-pill paid";
  if (status === "failed") return "status-pill failed";
  return "status-pill pending";
};

const statusLabel = (status) => {
  if (status === "paid") return "Completed";
  if (status === "failed") return "Failed";
  return "Pending";
};

const printReceipt = (content) => {
  const receiptWindow = window.open("", "_blank", "width=900,height=700");
  if (!receiptWindow) return;
  receiptWindow.document.write(`<!DOCTYPE html><html><head><title>Payment Receipt</title><style>
    body{font-family:Inter,system-ui,sans-serif;color:#0f172a;padding:24px;background:#f8fafc;}
    .receipt-shell{max-width:760px;margin:0 auto;background:#fff;border-radius:24px;padding:32px;box-shadow:0 28px 90px rgba(15,23,42,.12);}
    .receipt-title{font-size:24px;font-weight:700;margin-bottom:24px;color:#0f172a;}
    .receipt-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;}
    .receipt-label{font-size:0.9rem;text-transform:uppercase;color:#64748b;letter-spacing:.08em;}
    .receipt-value{font-size:1rem;color:#0f172a;}
    .receipt-footer{margin-top:28px;font-size:0.92rem;color:#475569;text-align:center;}
  </style></head><body><div class="receipt-shell">${content}</div></body></html>`);
  receiptWindow.document.close();
  receiptWindow.focus();
  receiptWindow.print();
};

export default function Payments() {
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState("");
  const [controlNumber, setControlNumber] = useState("");
  const [generatedPayment, setGeneratedPayment] = useState(null);
  const [verifiedPayment, setVerifiedPayment] = useState(null);
  const [successPayment, setSuccessPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE}/applications/`, {
        headers: authHeaders(),
      });
      setApplications(response.data || []);
    } catch (error) {
      setErrorMessage("Unable to load applications.");
    }
  };

  const handleGenerateControlNumber = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setNotification("");
    setVerifiedPayment(null);
    setSuccessPayment(null);

    if (!selectedApplication) {
      setErrorMessage("Please select an application to generate a Control Number.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/payments/`,
        { application: selectedApplication, payment_method: "mobile_money" },
        { headers: authHeaders() }
      );
      setGeneratedPayment(response.data);
      setControlNumber(response.data.control_number);
      setNotification("Control Number generated successfully.");
    } catch (error) {
      setErrorMessage(sanitizeError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPayment = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setNotification("");
    setVerifiedPayment(null);
    setSuccessPayment(null);

    if (!controlNumber.trim()) {
      setErrorMessage("Enter a Control Number to look up payment details.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/payments/`, {
        headers: authHeaders(),
        params: { control_number: controlNumber.trim() },
      });
      setVerifiedPayment(response.data);
      setNotification("Payment found. Review details below.");
    } catch (error) {
      if (error.response?.status === 404) {
        setErrorMessage("Control Number not found.");
      } else {
        setErrorMessage(sanitizeError(error));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!verifiedPayment?.id) return;
    setErrorMessage("");
    setActionLoading(true);

    try {
      const response = await axios.put(
        `${API_BASE}/payments/${verifiedPayment.id}/`,
        { status: "paid" },
        { headers: authHeaders() }
      );
      setSuccessPayment(response.data);
      setVerifiedPayment(response.data);
      setNotification("Payment successfully verified.");
    } catch (error) {
      setErrorMessage(sanitizeError(error));
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    const content = `
      <div>
        <h1 class="receipt-title">Payment Receipt</h1>
        <div class="receipt-row"><div class="receipt-label">Applicant</div><div class="receipt-value">${successPayment.payer_name}</div></div>
        <div class="receipt-row"><div class="receipt-label">Control Number</div><div class="receipt-value">${successPayment.control_number}</div></div>
        <div class="receipt-row"><div class="receipt-label">Transaction Ref</div><div class="receipt-value">${successPayment.transaction_reference}</div></div>
        <div class="receipt-row"><div class="receipt-label">Receipt No</div><div class="receipt-value">${successPayment.receipt_number}</div></div>
        <div class="receipt-row"><div class="receipt-label">Amount Paid</div><div class="receipt-value">${formatTZS(successPayment.amount)}</div></div>
        <div class="receipt-row"><div class="receipt-label">Paid On</div><div class="receipt-value">${formatDate(successPayment.paid_at)}</div></div>
      </div>
    `;
    printReceipt(content);
  };

  const handleReturnToDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-slate-50 text-slate-900">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="payments-simple-page">
        

          <section className="card-grid-simple">
            <article className="panel-card">
              <h3>Generate Control Number</h3>
              <p>Select the application and let the system assign the payment reference and amount.</p>

              <form className="form-stack compact-form" onSubmit={handleGenerateControlNumber}>
                <label>
                  Application reference
                  <select value={selectedApplication} onChange={(e) => setSelectedApplication(e.target.value)}>
                    <option value="">Select application</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.reference_number || `APP-${app.id}`}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="system-field">
                  <label>Registration fee</label>
                  <div className="system-value">100,000 TZS</div>
                </div>

                <button type="submit" className="primary-button" disabled={loading}>
                  {loading ? <Loader2 className="icon-spin" size={16} /> : "Generate Control Number"}
                </button>
              </form>

              {generatedPayment && (
                <div className="detail-card">
                  <div className="detail-row">
                    <span>Applicant</span>
                    <strong>{generatedPayment.payer_name}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Application No</span>
                    <strong>{generatedPayment.application_reference}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Generated</span>
                    <strong>{formatDate(generatedPayment.created_at)}</strong>
                  </div>
                </div>
              )}
            </article>

            <article className="panel-card panel-card-secondary">
              <h3>Lookup payment</h3>
              <p>Search a generated Control Number to load automatic payment details.</p>

              <form className="form-stack compact-form" onSubmit={handleSearchPayment}>
                <label>
                  Control Number
                  <input
                    type="text"
                    value={controlNumber}
                    onChange={(e) => setControlNumber(e.target.value)}
                    placeholder="CTRL-123456"
                  />
                </label>

                <button type="submit" className="secondary-button" disabled={loading}>
                  {loading ? <Loader2 className="icon-spin" size={16} /> : <><Search size={16} /> Search Payment</>}
                </button>
              </form>

              {verifiedPayment && (
                <div className="detail-card">
                  <div className="detail-row">
                    <span>Applicant</span>
                    <strong>{verifiedPayment.payer_name}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Control Number</span>
                    <strong>{verifiedPayment.control_number}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Amount</span>
                    <strong>{formatTZS(verifiedPayment.amount)}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Status</span>
                    <strong className={statusClass(verifiedPayment.status)}>
                      {statusLabel(verifiedPayment.status)}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Generated</span>
                    <strong>{formatDate(verifiedPayment.created_at)}</strong>
                  </div>
                  {verifiedPayment.status === "paid" && (
                    <div className="detail-row">
                      <span>Paid on</span>
                      <strong>{formatDate(verifiedPayment.paid_at)}</strong>
                    </div>
                  )}

                  <div className="button-row">
                    <button
                      type="button"
                      className="primary-button"
                      disabled={verifiedPayment.status === "paid" || actionLoading}
                      onClick={handleVerifyPayment}
                    >
                      {actionLoading ? <Loader2 className="icon-spin" size={16} /> : "Verify Payment"}
                    </button>
                  </div>
                </div>
              )}
            </article>
          </section>

          {errorMessage && <div className="notification error">{errorMessage}</div>}
          {notification && <div className="notification success">{notification}</div>}

          {successPayment && (
            <section className="success-panel">
              <div className="success-hero">
                <div className="success-icon">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h2>Payment Successful</h2>
                  <p>Your payment has been verified and recorded automatically.</p>
                </div>
              </div>

              <div className="success-grid-simple">
                <div className="detail-row">
                  <span>Applicant</span>
                  <strong>{successPayment.payer_name}</strong>
                </div>
                <div className="detail-row">
                  <span>Control Number</span>
                  <strong>{successPayment.control_number}</strong>
                </div>
                <div className="detail-row">
                  <span>Transaction Reference</span>
                  <strong>{successPayment.transaction_reference}</strong>
                </div>
                <div className="detail-row">
                  <span>Receipt Number</span>
                  <strong>{successPayment.receipt_number}</strong>
                </div>
                <div className="detail-row">
                  <span>Amount Paid</span>
                  <strong>{formatTZS(successPayment.amount)}</strong>
                </div>
                <div className="detail-row">
                  <span>Payment Date</span>
                  <strong>{formatDate(successPayment.paid_at)}</strong>
                </div>
              </div>

              <div className="success-actions">
                <button className="primary-button" onClick={handlePrint}>
                  <Download size={16} /> Download Receipt
                </button>
                <button className="secondary-button" onClick={handlePrint}>
                  <Printer size={16} /> Print Receipt
                </button>
                <button className="secondary-button" onClick={handleReturnToDashboard}>
                  Return to Dashboard
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
