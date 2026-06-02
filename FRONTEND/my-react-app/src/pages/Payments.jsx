import { useState, useEffect } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import Swal from "sweetalert2";

import "../styles/Payments.css";



export default function Payments() {



  /* =========================
     STATES
  ========================= */

  const [applications, setApplications]
    = useState([]);

  const [payments, setPayments]
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

      application: "",

      amount: "",

      payment_method: ""

    });





  /* =========================
     USE EFFECT
  ========================= */

  useEffect(() => {

    fetchApplications();

    fetchPayments();

  }, []);







  /* =========================
     FETCH APPLICATIONS
  ========================= */

  const fetchApplications =
    async () => {

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
          "APPLICATION ERROR:",
          error
        );

      }

    };








  /* =========================
     FETCH PAYMENTS
  ========================= */

  const fetchPayments =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );



        const response =
          await axios.get(

            "http://127.0.0.1:8000/api/payments/",

            {

              headers: {

                Authorization:
                  `Bearer ${token}`

              }

            }

          );



        setPayments(
          response.data
        );

      }

      catch (error) {

        console.log(
          "PAYMENT ERROR:",
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
     EDIT PAYMENT
  ========================= */

  const editPayment =
    (payment) => {

      setEditingId(
        payment.id
      );



      setFormData({

        application:
          payment.application,

        amount:
          payment.amount,

        payment_method:
          payment.payment_method

      });



      window.scrollTo({

        top: 0,

        behavior: "smooth"

      });

    };








  /* =========================
     HANDLE SUBMIT
  ========================= */

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setLoading(true);

      const token =
        localStorage.getItem(
          "token"
        );



      try {



        /* =========================
           UPDATE
        ========================= */

        if (editingId) {

          await axios.put(

            `http://127.0.0.1:8000/api/payments/${editingId}/`,

            formData,

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

            "http://127.0.0.1:8000/api/payments/",

            formData,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`

              }

            }

          );

        }







        await Swal.fire({

          icon: "success",

          title:

            editingId

              ?

              "Payment Updated"

              :

              "Payment Added",

          timer: 1500,

          showConfirmButton: false,

          customClass: {

            popup:
              "round-popup",

            title:
              "round-title"

          }

        });







        setFormData({

          application: "",

          amount: "",

          payment_method: ""

        });



        setEditingId(
          null
        );



        fetchPayments();

      }

      catch (error) {

        console.log(error);



        Swal.fire({

          icon: "error",

          title: "Failed",

          text:

            JSON.stringify(

              error.response?.data

            ),

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
     DELETE PAYMENT
  ========================= */

  const deletePayment =
    async (id) => {

      const result =
        await Swal.fire({

          title:
            "Delete payment?",

          icon:
            "warning",

          showCancelButton: true,

          customClass: {

            popup:
              "round-popup",

            title:
              "round-title"

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

          `http://127.0.0.1:8000/api/payments/${id}/`,

          {

            headers: {

              Authorization:
                `Bearer ${token}`

            }

          }

        );



        fetchPayments();

      }

      catch (error) {

        console.log(error);

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



        <div className="payments-container">




          <div className="payments-header">

            <h1>

              Payments

            </h1>



            <p>

              Manage institution payments

            </p>

          </div>



          <form

            className="payments-form"

            onSubmit={handleSubmit}

          >




            <div className="form-group">

              <label>

                Application

              </label>



              <select

                name="application"

                value={formData.application}

                onChange={handleChange}

                required

              >

                <option value="">

                  Select Application

                </option>



                {

                  applications.map(
                    (app) => (

                      <option

                        key={app.id}

                        value={app.id}

                      >

                        {app.reference_number}

                      </option>

                    ))

                }

              </select>

            </div>




            <div className="form-group">

              <label>

                Amount

              </label>



              <input

                type="number"

                name="amount"

                value={formData.amount}

                onChange={handleChange}

                required

              />

            </div>



            <div className="form-group">

              <label>

                Payment Method

              </label>



              <select

                name="payment_method"

                value={formData.payment_method}

                onChange={handleChange}

                required

              >

                <option value="">

                  Select Method

                </option>

                <option value="Bank">

                  Bank

                </option>

                <option value="Mobile Money">

                  Mobile Money

                </option>

              </select>

            </div>








            <button

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

                    "Update Payment"

                    :

                    "Add Payment"

              }

            </button>

          </form>









          <div className="payments-list">

            <h2>

              Payment Records

            </h2>



            {

              payments.map(
                (payment) => (

                  <div

                    className="payment-card"

                    key={payment.id}

                  >

                    <div>

                      <h4>

                        {payment.control_number}

                      </h4>



                      <p>

                        TZS {payment.amount}

                      </p>



                      <small>

                        {payment.status}

                      </small>

                    </div>



                    <div className="payment-actions">

                      <button

                        type="button"

                        className="edit-btn"

                        onClick={() =>
                          editPayment(payment)
                        }

                      >

                        Edit

                      </button>



                      <button

                        type="button"

                        className="delete-btn"

                        onClick={() =>
                          deletePayment(payment.id)
                        }

                      >

                        Delete

                      </button>

                    </div>

                  </div>

                ))

            }

          </div>

        </div>

      </div>

    </div>

  );

}