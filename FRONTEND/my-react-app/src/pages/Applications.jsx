import { useState, useEffect } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import Swal from "sweetalert2";

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



  /* =========================
     FORM DATA
  ========================= */

  const [formData, setFormData]
    = useState({

      application_type: "",
      category: ""

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
          application.category

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
      category: ""

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
                formData.category

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






        /* =========================
           SUCCESS ALERT
        ========================= */

        await Swal.fire({

          icon: "success",

          title:

            editingId

              ?

              "Application Updated"

              :

              "Application Submitted",

          timer: 1500,

          showConfirmButton: false,

          customClass: {

            popup: "round-popup",

            title: "round-title"

          }

        });




        resetForm();

        fetchApplications();

      }

      catch (error) {

        console.log(
          "SUBMIT ERROR:",
          error
        );



        Swal.fire({

          icon: "error",

          title: "Failed",

          text:

            error.response?.data?.error

            ||

            "Operation failed",

          customClass: {

            popup: "round-popup",

            title: "round-title",

            confirmButton:
              "round-confirm"

          }

        });

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



      const result =
        await Swal.fire({

          title:
            "Delete application?",

          text:
            "This action cannot be undone",

          icon:
            "warning",

          showCancelButton: true,

          confirmButtonText:
            "Delete",

          cancelButtonText:
            "Cancel",

          confirmButtonColor:
            "#dc2626",

          customClass: {

            popup:
              "round-popup",

            title:
              "round-title",

            confirmButton:
              "round-confirm",

            cancelButton:
              "round-cancel"

          }

        });




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





        await Swal.fire({

          icon: "success",

          title: "Deleted",

          timer: 1200,

          showConfirmButton: false,

          customClass: {

            popup:
              "round-popup",

            title:
              "round-title"

          }

        });




        fetchApplications();

      }

      catch (error) {

        console.log(
          "DELETE ERROR:",
          error
        );



        Swal.fire({

          icon: "error",

          title: "Delete Failed",

          text:
            "Something went wrong",

          customClass: {

            popup:
              "round-popup",

            title:
              "round-title",

            confirmButton:
              "round-confirm"

          }

        });

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

          <div className="application-header">

            <h1>

              {

                editingId

                  ?

                  "Edit Application"

                  :

                  "Create Application"

              }

            </h1>



            <p>

              Submit registration,
              accreditation or renewal
              application.

            </p>

          </div>


          {/* FORM */}

          <form

            className="application-form"

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