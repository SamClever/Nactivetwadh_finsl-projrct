

import { useState } from "react";
import { Link } from "react-router-dom";

import "../styles/Register.css";



export default function Register() {



  /* =========================
     STATES
  ========================= */

  const [formData, setFormData]
    = useState({

      first_name: "",
      last_name: "",
      username: "",
      password: "",
      email: "",
      institution_name: "",
      institution_owner: "",
      location: ""

    });


  /* =========================
     HANDLE INPUT CHANGE
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




      try {

        const response =
          await fetch(

            "http://127.0.0.1:8000/api/register/",

            {

              method: "POST",



              headers: {

                "Content-Type":
                  "application/json",

              },



              body:
                JSON.stringify(formData),

            }

          );




        const data =
          await response.json();



        console.log(
          "REGISTER RESPONSE:",
          data
        );


        /* =========================
           SUCCESS
        ========================= */

        if (response.ok) {

          alert(
            "Registration successful"
          );



          /* RESET FORM */

          setFormData({

            first_name: "",
            last_name: "",
            username: "",
            password: "",
            email: "",
            institution_name: "",
            institution_owner: "",
            location: ""

          });

        }


        /* =========================
           FAILED
        ========================= */

        else {

          alert(
            "Registration failed"
          );



          console.log(
            "REGISTER ERROR:",
            data
          );

        }

      }


      /* =========================
         SERVER ERROR
      ========================= */

      catch (error) {

        console.error(
          "SERVER ERROR:",
          error
        );



        alert(
          "Server error"
        );

      }

    };



  /* =========================
     RETURN
  ========================= */

  return (

    <div className="register-container">




      <div className="register-card">




        {/* HEADER */}

        <div className="register-header">

          <img

            src="/src/assets/logo.png"

            alt="logo"

          />



          <h2>

            Create account

          </h2>



          <p>

            NACTVET Institutions
            Registration and
            Accreditation System

          </p>

        </div>



        {/* FORM */}

        <form onSubmit={handleSubmit}>




          <div className="form-grid">




            {/* FIRST NAME */}

            <div className="form-group">

              <label>

                First Name

              </label>



              <input

                type="text"

                name="first_name"

                value={formData.first_name}

                onChange={handleChange}

                required

              />

            </div>


            {/* LAST NAME */}

            <div className="form-group">

              <label>

                Last Name

              </label>



              <input

                type="text"

                name="last_name"

                value={formData.last_name}

                onChange={handleChange}

                required

              />

            </div>


            {/* USERNAME */}

            <div className="form-group">

              <label>

                Username

              </label>



              <input

                type="text"

                name="username"

                value={formData.username}

                onChange={handleChange}

                required

              />

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <label>

                Password

              </label>



              <input

                type="password"

                name="password"

                value={formData.password}

                onChange={handleChange}

                required

              />

            </div>


            {/* EMAIL */}

            <div className="form-group">

              <label>

                Email

              </label>



              <input

                type="email"

                name="email"

                value={formData.email}

                onChange={handleChange}

                required

              />

            </div>

            {/* INSTITUTION NAME */}

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


            {/* INSTITUTION OWNER */}

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


            {/* LOCATION */}

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

          </div>


          {/* BUTTON */}

          <button

            type="submit"

            className="register-btn"

          >

            Register

          </button>

        </form>


        {/* FOOTER */}

        <p className="register-footer">

          Already registered?

          {" "}

          <Link to="/">

            Sign in

          </Link>

        </p>

      </div>

    </div>

  );

}