import { useState, useEffect } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import { showSuccess, showError, showWarning } from "../services/alertService";

import "../styles/Applications.css";



export default function Applications() {

  /* =========================
     STATES
  ========================= */

  const [applications, setApplications]
    = useState([]);

  const [loading, setLoading]
    = useState(false);

  const [editingId, setEditingId]
    = useState(null);

  const [calendarOpen, setCalendarOpen]
    = useState(false);

  const [calendarMonth, setCalendarMonth]
    = useState(new Date().getMonth());

  const [calendarYear, setCalendarYear]
    = useState(new Date().getFullYear());



  /* =========================
     FORM DATA
  ========================= */

  const [formData, setFormData]
    = useState({

      application_type: "",
      category: "",
      programs_requested: "",
      application_description: "",
      expected_students: "",
      preferred_inspection_date: ""

    });





  /* =========================
     USE EFFECT
  ========================= */

  useEffect(() => {

    fetchApplications();

  }, []);



  /* =========================
     FETCH APPLICATIONS
  ========================= */

  const fetchApplications = async () => {

    try {

      const token =
        localStorage.getItem(
          "token"
        );



      const response =
        await axios.get(

          "http://127.0.0.1:8000/api/applications/",

          {

            headers: {

              Authorization:
                `Bearer ${token}`

            }

          }

        );



      setApplications(
        response.data
      );

    }

    catch (error) {

      console.log(
        "FETCH ERROR:",
        error
      );

    }

  };



  /* =========================
     HANDLE CHANGE
  ========================= */

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value

    });

  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const formatDateDisplay = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const buildCalendarDays = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = getDaysInMonth(year, month);
    const days = Array(firstDay).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const handleSelectDate = (day) => {
    const date = new Date(calendarYear, calendarMonth, day);
    const iso = date.toISOString().slice(0, 10);
    setFormData({
      ...formData,
      preferred_inspection_date: iso
    });
    setCalendarOpen(false);
  };

  const handleMonthChange = (direction) => {
    setCalendarMonth((current) => {
      const next = current + direction;
      if (next < 0) {
        setCalendarYear((year) => year - 1);
        return 11;
      }
      if (next > 11) {
        setCalendarYear((year) => year + 1);
        return 0;
      }
      return next;
    });
  };



  /* =========================
     EDIT APPLICATION
  ========================= */

  const editApplication =
    (application) => {

      setEditingId(
        application.id
      );



      setFormData({

        application_type:
          application.application_type,

        category:
          application.category,

        programs_requested:
          application.programs_requested || "",

        application_description:
          application.application_description || "",

        expected_students:
          application.expected_students || "",

        preferred_inspection_date:
          application.preferred_inspection_date || ""

      });




      window.scrollTo({

        top: 0,

        behavior: "smooth"

      });

    };



  /* =========================
     RESET FORM
  ========================= */

  const resetForm = () => {

    setFormData({

      application_type: "",
      category: "",
      programs_requested: "",
      application_description: "",
      expected_students: "",
      preferred_inspection_date: ""

    });



    setEditingId(
      null
    );

  };




  /* =========================
     HANDLE SUBMIT
  ========================= */

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      const token =
        localStorage.getItem(
          "token"
        );

      setLoading(true);



      try {




        /* =========================
           UPDATE
        ========================= */

        if (editingId) {

          await axios.put(

            `http://127.0.0.1:8000/api/applications/${editingId}/`,

            {

              application_type:
                formData.application_type,

              category:
                formData.category,

              programs_requested:
                formData.programs_requested,

              application_description:
                formData.application_description,

              expected_students:
                formData.expected_students,

              preferred_inspection_date:
                formData.preferred_inspection_date

            },

            {

              headers: {

                Authorization:
                  `Bearer ${token}`

              }

            }

          );

        }




        /* =========================
           CREATE
        ========================= */

        else {

          await axios.post(

            "http://127.0.0.1:8000/api/applications/",

            {

              application_type:
                formData.application_type,

              category:
                formData.category,

              programs_requested:
                formData.programs_requested,

              application_description:
                formData.application_description,

              expected_students:
                formData.expected_students,

              preferred_inspection_date:
                formData.preferred_inspection_date,

              status:
                "submitted",

              payment_status:
                "pending",

              inspection_status:
                "pending",

              review_status:
                "pending"

            },

            {

              headers: {

                Authorization:
                  `Bearer ${token}`

              }

            }

          );

        }






        await showSuccess(
          editingId ? "Application Updated" : "Application Submitted",
          "",
          1500
        );




        resetForm();

        fetchApplications();

      }

      catch (error) {

        console.log(
          "SUBMIT ERROR:",
          error
        );



        await showError(
          "Failed",
          error.response?.data?.error || "Operation failed"
        );

      }

      finally {

        setLoading(false);

      }

    };



  /* =========================
     DELETE APPLICATION
  ========================= */

  const deleteApplication =
    async (id) => {



      const result = await showWarning(
        "Delete application?",
        "This action cannot be undone",
        "Delete",
        "Cancel"
      );




      if (!result.isConfirmed) {

        return;

      }




      const token =
        localStorage.getItem(
          "token"
        );



      try {

        await axios.delete(

          `http://127.0.0.1:8000/api/applications/${id}/`,

          {

            headers: {

              Authorization:
                `Bearer ${token}`

            }

          }

        );





        await showSuccess("Deleted", "", 1200);




        fetchApplications();

      }

      catch (error) {

        console.log(
          "DELETE ERROR:",
          error
        );



        await showError("Delete Failed", "Something went wrong");

      }

    };



  /* =========================
     RETURN
  ========================= */

  return (

    <div className="dashboard-layout">

      <Sidebar />



      <div className="dashboard-main">

        <Topbar />



        <div className="application-container">




          {/* HEADER */}

          {/* <div className="application-header">

           



            {/* <p>

              Submit registration,
              accreditation or renewal
              application.

            </p> */}
{/* 
          </div> */}


          {/* FORM */}

          <form

            className="application-form compact-form"

            onSubmit={handleSubmit}

          >




            <div className="form-group">

              <label>

                Application Type

              </label>



              <select

                name="application_type"

                value={
                  formData.application_type
                }

                onChange={handleChange}

                required

              >

                <option value="">

                  Select Type

                </option>



                <option value="registration">

                  Registration

                </option>



                <option value="accreditation">

                  Accreditation

                </option>



                <option value="renewal">

                  Renewal

                </option>

              </select>

            </div>







            <div className="form-group">

              <label>

                Category

              </label>



              <input

                type="text"

                name="category"

                placeholder="Health, ICT, Engineering"

                value={formData.category}

                onChange={handleChange}

                required

              />

            </div>



            <div className="form-group">

              <label>

                Programs / Courses Requested

              </label>



              <input

                type="text"

                name="programs_requested"

                placeholder="e.g. Electrical Engineering, Hospitality"

                value={formData.programs_requested}

                onChange={handleChange}

              />

            </div>



            <div className="form-group">

              <label>

                Expected Number of Students

              </label>



              <input

                type="number"

                name="expected_students"

                placeholder="e.g. 200"

                value={formData.expected_students}

                onChange={handleChange}

              />

            </div>



            <div className="form-group date-picker-group">

              <label>

                Preferred Inspection Date

              </label>



              <div className="date-picker-field" onClick={() => setCalendarOpen(!calendarOpen)}>
                <input
                  type="text"
                  name="preferred_inspection_date"
                  value={formatDateDisplay(formData.preferred_inspection_date)}
                  placeholder="Select date"
                  readOnly
                />
                <span className="calendar-icon">📅</span>
              </div>

              {calendarOpen && (
                <div className="calendar-popup">
                  <div className="calendar-header">
                    <button type="button" onClick={() => handleMonthChange(-1)}>
                      ‹
                    </button>
                    <div>
                      <strong>
                        {monthNames[calendarMonth]} {calendarYear}
                      </strong>
                      <div className="calendar-subtitle">
                        Select month, day & year
                      </div>
                    </div>
                    <button type="button" onClick={() => handleMonthChange(1)}>
                      ›
                    </button>
                  </div>
                  <div className="calendar-grid">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((label) => (
                      <div key={label} className="calendar-day-label">
                        {label}
                      </div>
                    ))}
                    {buildCalendarDays(calendarYear, calendarMonth).map((day, index) =>
                      day ? (
                        <button
                          type="button"
                          key={`${calendarYear}-${calendarMonth}-${day}`}
                          className={
                            formData.preferred_inspection_date ===
                            new Date(calendarYear, calendarMonth, day)
                              .toISOString()
                              .slice(0, 10)
                              ? 'calendar-day selected'
                              : 'calendar-day'
                          }
                          onClick={() => handleSelectDate(day)}
                        >
                          {day}
                        </button>
                      ) : (
                        <div key={`empty-${index}`} className="calendar-day-empty" />
                      )
                    )}
                  </div>
                </div>
              )}

            </div>


            <div className="form-group full-width">

              <label>

                Application Details

              </label>



              <textarea

                name="application_description"

                placeholder="Provide any details about this application"

                value={formData.application_description}

                onChange={handleChange}

                rows={5}

              />

            </div>







            <button

              type="submit"

              className="submit-btn"

              disabled={loading}

            >

              {

                loading

                  ?

                  "Processing..."

                  :

                  editingId

                    ?

                    "Update Application"

                    :

                    "Submit Application"

              }

            </button>

          </form>










          {/* APPLICATION LIST */}

          <div className="applications-list">

            <h2>

              Applications List

            </h2>





            {

              applications.length === 0

                ?

                (

                  <p>

                    No applications found

                  </p>

                )

                :

                (

                  applications.map(
                    (item) => (

                      <div

                        className="application-card"

                        key={item.id}

                      >




                        <div>

                          <h4>

                            {item.reference_number}

                          </h4>



                          <p>

                            {item.application_type}

                          </p>



                          <small>

                            Status:
                            {item.status}

                          </small>

                        </div>






                        <div className="app-actions">




                          <button

                            type="button"

                            className="edit-btn"

                            onClick={() =>

                              editApplication(item)

                            }

                          >

                            Edit

                          </button>






                          <button

                            type="button"

                            className="delete-btn"

                            onClick={() =>

                              deleteApplication(
                                item.id
                              )

                            }

                          >

                            Delete

                          </button>

                        </div>

                      </div>

                    ))

                )

            }

          </div>

        </div>

      </div>

    </div>

  );

}