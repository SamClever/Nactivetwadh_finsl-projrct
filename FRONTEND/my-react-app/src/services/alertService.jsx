/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Check, X, AlertTriangle, Info } from "lucide-react";
import "../styles/alerts.css";

// ----------------------------------------------------
// MODERN MODAL COMPONENT
// ----------------------------------------------------
const ModernModal = ({
  type,
  title,
  text,
  onClose,
  onConfirm,
  onCancel,
  timer,
  confirmButtonText = "Okay",
  cancelButtonText = "Cancel",
  showCancelButton = false,
}) => {
  const [closing, setClosing] = useState(false);

  // Define handleClose above useEffect to avoid initialization reference error
  const handleClose = (callback) => {
    setClosing(true);
    setTimeout(() => {
      if (callback) callback();
    }, 250); // Matches CSS transition duration
  };

  useEffect(() => {
    if (timer) {
      const autoClose = setTimeout(() => {
        handleClose(onClose);
      }, timer);
      return () => clearTimeout(autoClose);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  const IconComponent = () => {
    switch (type) {
      case "error":
        return (
          <div className="modern-alert-icon-ring error">
            <X size={44} strokeWidth={2.5} className="modern-alert-icon-item" />
          </div>
        );
      case "warning":
        return (
          <div className="modern-alert-icon-ring warning">
            <AlertTriangle size={42} strokeWidth={2.5} className="modern-alert-icon-item" />
          </div>
        );
      case "success":
      default:
        return (
          <div className="modern-alert-icon-ring success">
            <Check size={46} strokeWidth={3} className="modern-alert-icon-item" />
          </div>
        );
    }
  };

  return (
    <div 
      className={`modern-alert-overlay ${closing ? "closing" : ""}`} 
      onClick={() => handleClose(showCancelButton ? onCancel : onClose)}
    >
      <div 
        className={`modern-alert-card ${closing ? "closing" : ""}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <IconComponent />
        <h3 className="modern-alert-card-title">{title}</h3>
        {text && <p className="modern-alert-card-text">{text}</p>}

        <div className="modern-alert-actions">
          {showCancelButton && (
            <button 
              type="button" 
              className="modern-alert-btn cancel" 
              onClick={() => handleClose(onCancel)}
            >
              {cancelButtonText}
            </button>
          )}
          <button
            type="button"
            className={`modern-alert-btn confirm ${type}`}
            onClick={() => handleClose(onConfirm || onClose)}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// MODERN TOAST COMPONENT & CONTAINER
// ----------------------------------------------------
const ModernToastItem = ({ id, title, type, timer, onClose }) => {
  const [closing, setClosing] = useState(false);

  // Define handleClose above useEffect to avoid initialization reference error
  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Matches CSS transition duration
  };

  useEffect(() => {
    const autoClose = setTimeout(() => {
      handleClose();
    }, timer);

    return () => clearTimeout(autoClose);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  const IconComponent = () => {
    switch (type) {
      case "error":
        return <X className="text-red-500" size={16} strokeWidth={2.5} />;
      case "warning":
        return <AlertTriangle className="text-amber-500" size={16} strokeWidth={2.5} />;
      case "info":
        return <Info className="text-blue-500" size={16} strokeWidth={2.5} />;
      case "success":
      default:
        return <Check className="text-emerald-500" size={16} strokeWidth={3} />;
    }
  };

  return (
    <div 
      className={`modern-toast-item ${type} ${closing ? "closing" : ""}`} 
      onClick={handleClose}
    >
      <div className="modern-toast-icon-wrapper">
        <IconComponent />
      </div>
      <div className="modern-toast-title">{title}</div>
      <div className="modern-toast-close">
        <X size={14} strokeWidth={2.5} />
      </div>
      <div 
        className="modern-toast-progress" 
        style={{ animationDuration: `${timer}ms` }}
      />
    </div>
  );
};

let addToastFn = null;

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToastFn = (title, type, timer) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, type, timer }]);
    };
    return () => {
      addToastFn = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="modern-toast-container-root">
      {toasts.map((toast) => (
        <ModernToastItem
          key={toast.id}
          id={toast.id}
          title={toast.title}
          type={toast.type}
          timer={toast.timer}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

// Helper to ensure toast container is mounted
let toastRoot = null;
const ensureToastRoot = () => {
  if (!addToastFn) {
    let div = document.getElementById("modern-toast-root-element");
    if (!div) {
      div = document.createElement("div");
      div.id = "modern-toast-root-element";
      document.body.appendChild(div);
    }
    if (!toastRoot) {
      toastRoot = ReactDOM.createRoot(div);
      toastRoot.render(<ToastContainer />);
    }
  }
};

// ----------------------------------------------------
// EXPORTED SERVICES
// ----------------------------------------------------

export const showSuccess = (title, text = "", timer = 1500) => {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);

    const cleanup = () => {
      root.unmount();
      container.remove();
      resolve();
    };

    root.render(
      <ModernModal
        type="success"
        title={title}
        text={text}
        onClose={cleanup}
        timer={timer}
      />
    );
  });
};

export const showError = (title, text = "Something went wrong") => {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);

    const cleanup = () => {
      root.unmount();
      container.remove();
      resolve();
    };

    root.render(
      <ModernModal
        type="error"
        title={title}
        text={text}
        onClose={cleanup}
        confirmButtonText="Okay"
      />
    );
  });
};

export const showWarning = (
  title,
  text,
  confirmButtonText = "Continue",
  cancelButtonText = "Cancel"
) => {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);

    const handleConfirm = () => {
      root.unmount();
      container.remove();
      resolve({ isConfirmed: true });
    };

    const handleCancel = () => {
      root.unmount();
      container.remove();
      resolve({ isConfirmed: false });
    };

    root.render(
      <ModernModal
        type="warning"
        title={title}
        text={text}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmButtonText={confirmButtonText}
        cancelButtonText={cancelButtonText}
        showCancelButton={true}
      />
    );
  });
};

export const showToast = async (title, icon = "success", timer = 1500) => {
  ensureToastRoot();
  
  // Wait a small frame to allow the ToastContainer to register addToastFn on mount
  if (!addToastFn) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  if (addToastFn) {
    addToastFn(title, icon, timer);
  }
};
