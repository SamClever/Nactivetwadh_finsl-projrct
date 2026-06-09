
import { useState, useEffect } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import { showSuccess, showError, showWarning } from "../services/alertService";

import "../styles/Documents.css";



export default function Documents() {



  /* =========================
     STATES
  ========================= */

  const [applications, setApplications]
    = useState([]);

  const [documents, setDocuments]
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
      document_name: "",
      document_type: "",
      file: null

    });






  /* =========================
     USE EFFECT
  ========================= */

  useEffect(() => {

    fetchApplications();

    fetchDocuments();

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
     FETCH DOCUMENTS
  ========================= */

  const fetchDocuments =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );



        const response =
          await axios.get(

            "http://127.0.0.1:8000/api/documents/",

            {

              headers: {

                Authorization:
                  `Bearer ${token}`

              }

            }

          );



        setDocuments(
          response.data
        );

      }

      catch (error) {

        console.log(
          "DOCUMENT ERROR:",
          error
        );

      }

    };


  /* =========================
     HANDLE CHANGE
  ========================= */

  const handleChange = (e) => {



    if (
      e.target.name === "file"
    ) {

      setFormData({

        ...formData,

        file:
          e.target.files[0]

      });

    }



    else {

      setFormData({

        ...formData,

        [e.target.name]:
          e.target.value

      });

    }

  };



  /* =========================
     EDIT DOCUMENT
  ========================= */

  const editDocument =
    (doc) => {

      setEditingId(
        doc.id
      );



      setFormData({

        application:
          doc.application,

        document_name:
          doc.document_name,

        document_type:
          doc.document_type,

        file: null

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

      application: "",
      document_name: "",
      document_type: "",
      file: null

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

      setLoading(true);



      try {

        const token =
          localStorage.getItem(
            "token"
          );



        const data =
          new FormData();




        data.append(

          "application",

          formData.application

        );



        data.append(

          "document_name",

          formData.document_name

        );



        data.append(

          "document_type",

          formData.document_type

        );




        if (formData.file) {

          data.append(

            "file",

            formData.file

          );

        }



        /* =========================
           UPDATE
        ========================= */

        if (editingId) {

          await axios.put(

            `http://127.0.0.1:8000/api/documents/${editingId}/`,

            data,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "multipart/form-data"

              }

            }

          );

        }




        /* =========================
           CREATE
        ========================= */

        else {

          await axios.post(

            "http://127.0.0.1:8000/api/documents/",

            data,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "multipart/form-data"

              }

            }

          );

        }


        /* =========================
           SUCCESS ALERT
        ========================= */

        await showSuccess(
          editingId ? "Document Updated" : "Document Uploaded",
          "",
          1500
        );




        resetForm();

        await fetchDocuments();

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
     DELETE DOCUMENT
  ========================= */

  const deleteDocument =
    async (id) => {



      const result = await showWarning(
        "Delete document?",
        "This action cannot be undone",
        "Delete",
        "Cancel"
      );




      if (!result.isConfirmed) {

        return;

      }




      try {

        const token =
          localStorage.getItem(
            "token"
          );



        await axios.delete(

          `http://127.0.0.1:8000/api/documents/${id}/`,

          {

            headers: {

              Authorization:
                `Bearer ${token}`

            }

          }

        );







        await showSuccess("Deleted", "", 1200);




        await fetchDocuments();

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



        <div className="documents-container">





          {/* HEADER */}

          <div className="documents-header">

            <h1>

              {

                editingId

                  ?

                  "Edit Document"

                  :

                  "Upload Documents"

              }

            </h1>



            <p>

              Upload required institution documents

            </p>

          </div>










          {/* FORM */}

          <form

            className="documents-form compact-form"

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

                  Select application

                </option>




                {

                  applications.map(
                    (item) => (

                      <option

                        key={item.id}

                        value={item.id}

                      >

                        {item.reference_number}

                      </option>

                    ))

                }

              </select>

            </div>

            <div className="form-group">

              <label>

                Document Name

              </label>



              <input

                type="text"

                name="document_name"

                value={formData.document_name}

                onChange={handleChange}

                required

              />

            </div>

            <div className="form-group">

              <label>

                Document Type

              </label>



              <input

                type="text"

                name="document_type"

                value={formData.document_type}

                onChange={handleChange}

                required

              />

            </div>



            <div className="form-group">

              <label>

                Select File

              </label>



              <input

                type="file"

                name="file"

                onChange={handleChange}

                required={!editingId}

              />

            </div>



            <button

              type="submit"

              className="upload-btn"

              disabled={loading}

            >

              {

                loading

                  ?

                  "Processing..."

                  :

                  editingId

                    ?

                    "Update Document"

                    :

                    "Upload Document"

              }

            </button>

          </form>



          {/* DOCUMENTS LIST */}

          <div className="documents-list">

            <h2>

              Uploaded Documents

            </h2>





            {

              documents.length === 0

                ?

                (

                  <p>

                    No documents uploaded yet

                  </p>

                )

                :

                (

                  documents.map(
                    (doc) => (

                      <div

                        className="document-card"

                        key={doc.id}

                      >




                        <div>

                          <h4>

                            {doc.document_name}

                          </h4>



                          <p>

                            {doc.document_type}

                          </p>



                          <small>

                            Status:
                            {doc.status}

                          </small>

                        </div>








                        <div className="doc-actions">





                          <button

                            type="button"

                            className="edit-btn"

                            onClick={() =>

                              editDocument(doc)

                            }

                          >

                            Edit

                          </button>








                          <button

                            type="button"

                            className="delete-btn"

                            onClick={() =>

                              deleteDocument(
                                doc.id
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