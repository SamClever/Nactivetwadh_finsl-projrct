
import { useState, useEffect } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import Swal from "sweetalert2";

import "../styles/Institution.css";



export default function Institution() {



  /* =========================
     STATES
  ========================= */

  const [loading, setLoading]
    = useState(false);




  /* =========================
     FORM DATA
  ========================= */

  const [formData, setFormData]
    = useState({

      institution_name: "",
      institution_owner: "",
      location: "",
      username: "",
      email: ""

    });





  /* =========================
     USE EFFECT
  ========================= */

  useEffect(() => {

    fetchInstitution();

  }, []);




  /* =========================
     FETCH INSTITUTION
  ========================= */

  const fetchInstitution =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );



        const response =
          await axios.get(

            "http://127.0.0.1:8000/api/institution/",

            {

              headers: {

                Authorization:
                  `Bearer ${token}`

              }

            }

          );




        setFormData({

          institution_name:
            response.data.institution_name || "",

          institution_owner:
            response.data.institution_owner || "",

          location:
            response.data.location || "",

          username:
            response.data.username || "",

          email:
            response.data.email || ""

        });

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

  const handleChange =
    (e) => {

      setFormData({

        ...formData,

        [e.target.name]:
          e.target.value

      });

    };




  /* =========================
     HANDLE SUBMIT
  ========================= */

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setLoading(true);



      try {

        const token =
          localStorage.getItem(
            "token"
          );



        await axios.put(

          "http://127.0.0.1:8000/api/institution/",

          {

            institution_name:
              formData.institution_name,

            institution_owner:
              formData.institution_owner,

            location:
              formData.location

          },

          {

            headers: {

              Authorization:
                `Bearer ${token}`

            }

          }

        );



        /* =========================
           SUCCESS ALERT
        ========================= */

        await Swal.fire({

          icon: "success",

          title: "Profile Updated",

          text:
            "Institution updated successfully",

          timer: 1500,

          showConfirmButton: false,

          customClass: {

            popup:
              "round-popup",

            title:
              "round-title"

          }

        });




        fetchInstitution();

      }

      catch (error) {

        console.log(
          "UPDATE ERROR:",
          error
        );




        /* =========================
           ERROR ALERT
        ========================= */

        Swal.fire({

          icon: "error",

          title: "Update Failed",

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

      finally {

        setLoading(false);

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



        <div className="institution-container">




          {/* HEADER */}

          <div className="institution-header">

            <h1>

              Institution Profile

            </h1>



            <p>

              Manage institution account
              and profile information

            </p>

          </div>


          {/* FORM */}

          <form

            className="institution-form"

            onSubmit={handleSubmit}

          >




            <div className="form-group">

              <label>

                Institution Name

              </label>



              <input

                type="text"

                name="institution_name"

                value={formData.institution_name}

                onChange={handleChange}

                required

              />

            </div>


            <div className="form-group">

              <label>

                Institution Owner

              </label>



              <input

                type="text"

                name="institution_owner"

                value={formData.institution_owner}

                onChange={handleChange}

                required

              />

            </div>


            <div className="form-group">

              <label>

                Location

              </label>



              <input

                type="text"

                name="location"

                value={formData.location}

                onChange={handleChange}

                required

              />

            </div>


            <div className="form-group">

              <label>

                Username

              </label>



              <input

                type="text"

                name="username"

                value={formData.username}

                readOnly

              />

            </div>




            <div className="form-group">

              <label>

                Email Address

              </label>



              <input

                type="email"

                name="email"

                value={formData.email}

                readOnly

              />

            </div>


            <button

              type="submit"

              className="save-btn"

              disabled={loading}

            >

              {

                loading

                  ?

                  "Saving..."

                  :

                  "Update Profile"

              }

            </button>

          </form>

        </div>

      </div>

    </div>

  );

}