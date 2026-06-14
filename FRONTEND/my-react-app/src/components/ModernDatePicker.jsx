import React, { useState, useEffect, useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

export default function ModernDatePicker({
  name,
  value,
  onChange,
  className = "",
  error = "",
  placeholder = "Select Date"
}) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // Date object
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  
  const containerRef = useRef(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Years from 1950 to currentYear + 20
  const startYear = 1950;
  const endYear = new Date().getFullYear() + 20;
  const years = [];
  for (let y = endYear; y >= startYear; y--) {
    years.push(y);
  }

  // Parse initial value
  useEffect(() => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        setSelectedDate(parsed);
        setViewMonth(parsed.getMonth());
        setViewYear(parsed.getFullYear());
        return;
      }
    }
    setSelectedDate(null);
  }, [value]);

  // Click outside to close calendar
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay(); // 0 = Sunday, 6 = Saturday
  };

  const handleDaySelect = (day) => {
    const date = new Date(viewYear, viewMonth, day);
    // Format to YYYY-MM-DD locally to avoid timezone shifts
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const formatted = `${yyyy}-${mm}-${dd}`;
    
    onChange({
      target: {
        name,
        value: formatted
      }
    });
    setShowCalendar(false);
  };

  const handleMonthChange = (e) => {
    setViewMonth(parseInt(e.target.value, 10));
  };

  const handleYearChange = (e) => {
    setViewYear(parseInt(e.target.value, 10));
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const clearDate = (e) => {
    e.stopPropagation();
    onChange({
      target: {
        name,
        value: ""
      }
    });
  };

  // Helper to format date for display in input (dd/mm/yyyy)
  const getDisplayValue = () => {
    if (!selectedDate) return "";
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const year = selectedDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Calendar rendering math
  const daysInMonth = getDaysInMonth(viewMonth, viewYear);
  const firstDay = getFirstDayOfMonth(viewMonth, viewYear);
  
  const cells = [];
  // Empty offset cells for start of month
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="calendar-day empty" />);
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday =
      day === new Date().getDate() &&
      viewMonth === new Date().getMonth() &&
      viewYear === new Date().getFullYear();
      
    const isSelected =
      selectedDate &&
      day === selectedDate.getDate() &&
      viewMonth === selectedDate.getMonth() &&
      viewYear === selectedDate.getFullYear();

    cells.push(
      <button
        key={`day-${day}`}
        type="button"
        onClick={() => handleDaySelect(day)}
        className={`calendar-day-btn ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="modern-datepicker-container" ref={containerRef}>
      <div 
        className={`modern-datepicker-input-wrapper ${error ? "error" : ""}`}
        onClick={() => setShowCalendar(!showCalendar)}
      >
        <input
          type="text"
          readOnly
          value={getDisplayValue()}
          placeholder={placeholder}
          className={`modern-datepicker-input ${className}`}
        />
        <div className="input-actions-wrapper">
          {value && (
            <button type="button" className="clear-date-btn" onClick={clearDate}>
              <X size={14} />
            </button>
          )}
          <Calendar size={18} className="calendar-input-icon" />
        </div>
      </div>

      {showCalendar && (
        <div className="modern-datepicker-popover">
          <div className="calendar-header">
            <button type="button" className="nav-arrow" onClick={prevMonth}>
              <ChevronLeft size={16} />
            </button>

            <div className="header-selects">
              <select value={viewMonth} onChange={handleMonthChange} className="header-select">
                {months.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>

              <select value={viewYear} onChange={handleYearChange} className="header-select">
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button type="button" className="nav-arrow" onClick={nextMonth}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="calendar-weekdays">
            <div>Su</div>
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
          </div>

          <div className="calendar-days-grid">
            {cells}
          </div>
        </div>
      )}
    </div>
  );
}
