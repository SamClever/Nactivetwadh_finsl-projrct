import { useState, useEffect } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import Swal from "sweetalert2";

import "../styles/Institution.css";
import LocationAutocomplete from "../components/LocationAutocomplete";

export default function Institution() {
  /* =========================
     STATES
  ========================= */
  const [currentStage, setCurrentStage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /* =========================
     FORM DATA
  ========================= */
  const [formData, setFormData] = useState({
    institution_name: "",
    institution_type: "",
    registration_number: "",
    certificate_number: "",
    institution_owner: "",
    owner_title: "",
    principal_name: "",
    principal_email: "",
    principal_phone: "",
    street_address: "",
    location: "",
    location_obj: null,
    region: "",
    region_obj: null,
    city: "",
    city_obj: null,
    district: "",
    district_obj: null,
    ward: "",
    ward_obj: null,
    street: "",
    street_obj: null,
    programs_offered: "",
    total_students: "",
    total_staff: "",
    facility_status: "",
    has_library: false,
    has_laboratory: false,
    has_workshop: false,
    accreditation_status: "",
    previous_accreditation: "",
    years_operation: "",
    username: "",
    email: ""
  });

  /* =========================
     USE EFFECT
  ========================= */
  useEffect(() => {
    fetchInstitution();
  }, []);

  const fetchInstitution = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8000/api/institutions/", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setFormData({
        institution_name: response.data.institution_name || "",
        institution_type: response.data.institution_type || "",
        registration_number: response.data.registration_number || "",
        certificate_number: response.data.certificate_number || "",
        institution_owner: response.data.institution_owner || "",
        owner_title: response.data.owner_title || "",
        principal_name: response.data.principal_name || "",
        principal_email: response.data.principal_email || "",
        principal_phone: response.data.principal_phone || "",
        street_address: response.data.street_address || "",
        location: response.data.location || "",
        region: response.data.region || "",
        region_obj: response.data.region_obj || (response.data.region ? { id: response.data.region, name: response.data.region } : null),
        city: response.data.city || "",
        city_obj: response.data.city_obj || (response.data.city ? { id: response.data.city, name: response.data.city } : null),
        district: response.data.district || "",
        district_obj: response.data.district_obj || (response.data.district ? { id: response.data.district, name: response.data.district } : null),
        ward: response.data.ward || "",
        ward_obj: response.data.ward_obj || (response.data.ward ? { id: response.data.ward, name: response.data.ward } : null),
        street: response.data.street || "",
        street_obj: response.data.street_obj || (response.data.street ? { id: response.data.street, name: response.data.street } : null),
        programs_offered: response.data.programs_offered || "",
        total_students: response.data.total_students || "",
        total_staff: response.data.total_staff || "",
        facility_status: response.data.facility_status || "",
        has_library: response.data.has_library || false,
        has_laboratory: response.data.has_laboratory || false,
        has_workshop: response.data.has_workshop || false,
        accreditation_status: response.data.accreditation_status || "",
        previous_accreditation: response.data.previous_accreditation || "",
        years_operation: response.data.years_operation || "",
        username: response.data.username || "",
        email: response.data.email || ""
      });
    } catch (error) {
      console.log("FETCH ERROR:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const validateStage = () => {
    const newErrors = {};

    if (currentStage === 1) {
      if (!formData.institution_name) newErrors.institution_name = "Required";
      if (!formData.institution_type) newErrors.institution_type = "Required";
    }

    if (currentStage === 2) {
      if (!formData.institution_owner) newErrors.institution_owner = "Required";
      if (!formData.principal_name) newErrors.principal_name = "Required";
      if (!formData.principal_email) newErrors.principal_email = "Required";
      if (!formData.street_address) newErrors.street_address = "Required";
      if (!formData.region) newErrors.region = "Required";
      if (!formData.city) newErrors.city = "Required";
      if (!formData.district) newErrors.district = "Required";
      if (!formData.ward) newErrors.ward = "Required";
      if (!formData.street) newErrors.street = "Required";
    }

    if (currentStage === 3) {
      if (!formData.programs_offered) newErrors.programs_offered = "Required";
      if (!formData.total_students) newErrors.total_students = "Required";
      if (!formData.facility_status) newErrors.facility_status = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStage()) {
      setCurrentStage(currentStage + 1);
    }
  };

  const handleBack = () => {
    setCurrentStage(currentStage - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://127.0.0.1:8000/api/institutions/",
        {
          institution_name: formData.institution_name,
          institution_type: formData.institution_type,
          registration_number: formData.registration_number,
          certificate_number: formData.certificate_number,
          institution_owner: formData.institution_owner,
          owner_title: formData.owner_title,
          principal_name: formData.principal_name,
          principal_email: formData.principal_email,
          principal_phone: formData.principal_phone,
          street_address: formData.street_address,
          location: formData.city_obj?.name || "",
          region: formData.region_obj?.name || formData.region || "",
          city: formData.city_obj?.name || formData.city || "",
          district: formData.district_obj?.name || formData.district || "",
          ward: formData.ward_obj?.name || formData.ward || "",
          street: formData.street_obj?.name || formData.street || "",
          programs_offered: formData.programs_offered,
          total_students: formData.total_students,
          total_staff: formData.total_staff,
          facility_status: formData.facility_status,
          has_library: formData.has_library,
          has_laboratory: formData.has_laboratory,
          has_workshop: formData.has_workshop,
          accreditation_status: formData.accreditation_status,
          previous_accreditation: formData.previous_accreditation,
          years_operation: formData.years_operation
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      await Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Institution updated successfully",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: "round-popup",
          title: "round-title"
        }
      });

      setCurrentStage(1);
      fetchInstitution();
    } catch (error) {
      console.log("UPDATE ERROR:", error);
      const responseData = error.response?.data;
      const errorMessage = responseData
        ? typeof responseData === 'string'
          ? responseData
          : JSON.stringify(responseData)
        : error.message || 'Something went wrong';
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: errorMessage,
        customClass: {
          popup: "round-popup",
          title: "round-title",
          confirmButton: "round-confirm"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const totalStages = 4;
  const progress = (currentStage / totalStages) * 100;
  const locationSummary = [
    formData.street_obj?.name,
    formData.ward_obj?.name,
    formData.district_obj?.name,
    formData.city_obj?.name,
    formData.region_obj?.name
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Topbar />
        <div className="institution-container">
          {/* <div className="institution-header">
            <h1>Institution Profile</h1>
            <p>Manage institution account and profile information</p>
          </div> */}

          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>

          <div className="stage-indicator">
            <span>Stage {currentStage} of {totalStages}</span>
          </div>

          <form className="institution-form compact-form" onSubmit={handleSubmit}>
            {currentStage === 1 && (
              <div className="form-stage active">
                <h3>Basic Information</h3>
                <div className="form-group">
                  <label>Institution Name *</label>
                  <input
                    type="text"
                    name="institution_name"
                    value={formData.institution_name}
                    onChange={handleChange}
                    placeholder="Enter institution name"
                    className={errors.institution_name ? "error" : ""}
                  />
                  {errors.institution_name && <span className="error-message">{errors.institution_name}</span>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Institution Type *</label>
                    <select
                      name="institution_type"
                      value={formData.institution_type}
                      onChange={handleChange}
                      className={errors.institution_type ? "error" : ""}
                    >
                      <option value="">Select Type</option>
                      <option value="technical">Technical School</option>
                      <option value="vocational">Vocational Training Centre</option>
                      <option value="institute">Technical Institute</option>
                      <option value="university">Technical University</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.institution_type && <span className="error-message">{errors.institution_type}</span>}
                  </div>
                </div>
              </div>
            )}
            {currentStage === 2 && (
              <div className="form-stage active">
                <h3>Management & Location</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Institution Owner *</label>
                    <input
                      type="text"
                      name="institution_owner"
                      value={formData.institution_owner}
                      onChange={handleChange}
                      placeholder="Owner name"
                      className={errors.institution_owner ? "error" : ""}
                    />
                    {errors.institution_owner && <span className="error-message">{errors.institution_owner}</span>}
                  </div>
                  <div className="form-group">
                    <label>Owner Title / Position</label>
                    <input
                      type="text"
                      name="owner_title"
                      value={formData.owner_title}
                      onChange={handleChange}
                      placeholder="e.g., Director, Manager"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Principal / Director Name *</label>
                    <input
                      type="text"
                      name="principal_name"
                      value={formData.principal_name}
                      onChange={handleChange}
                      placeholder="Principal name"
                      className={errors.principal_name ? "error" : ""}
                    />
                    {errors.principal_name && <span className="error-message">{errors.principal_name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Principal Email *</label>
                    <input
                      type="email"
                      name="principal_email"
                      value={formData.principal_email}
                      onChange={handleChange}
                      placeholder="principal@example.com"
                      className={errors.principal_email ? "error" : ""}
                    />
                    {errors.principal_email && <span className="error-message">{errors.principal_email}</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label>Principal Phone</label>
                  <input
                    type="tel"
                    name="principal_phone"
                    value={formData.principal_phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Region *</label>
                    <LocationAutocomplete
                      level="regions"
                      parentId={null}
                      value={formData.region_obj}
                      onChange={(item) => setFormData({
                        ...formData,
                        region_obj: item,
                        region: item?.id ?? "",
                        city_obj: null,
                        city: "",
                        district_obj: null,
                        district: "",
                        ward_obj: null,
                        ward: "",
                        street_obj: null,
                        street: ""
                      })}
                      placeholder="Search region"
                      selectOnly={true}
                    />
                    {errors.region && <span className="error-message">{errors.region}</span>}
                  </div>
                  <div className="form-group">
                    <label>City *</label>
                    <LocationAutocomplete
                      level="cities"
                      parentId={formData.region_obj?.id}
                      value={formData.city_obj}
                      onChange={(item) => setFormData({
                        ...formData,
                        city_obj: item,
                        city: item?.id ?? "",
                        district_obj: null,
                        district: "",
                        ward_obj: null,
                        ward: "",
                        street_obj: null,
                        street: ""
                      })}
                      placeholder={formData.region_obj ? "Search city" : "Select region first"}
                      selectOnly={true}
                      disabled={!formData.region_obj}
                    />
                    {errors.city && <span className="error-message">{errors.city}</span>}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>District *</label>
                    <LocationAutocomplete
                      level="districts"
                      parentId={formData.city_obj?.id}
                      value={formData.district_obj}
                      onChange={(item) => setFormData({
                        ...formData,
                        district_obj: item,
                        district: item?.id ?? "",
                        ward_obj: null,
                        ward: "",
                        street_obj: null,
                        street: ""
                      })}
                      placeholder={formData.city_obj ? "Search district" : "Select city first"}
                      selectOnly={true}
                      disabled={!formData.city_obj}
                    />
                    {errors.district && <span className="error-message">{errors.district}</span>}
                  </div>
                  <div className="form-group">
                    <label>Ward *</label>
                    <LocationAutocomplete
                      level="wards"
                      parentId={formData.district_obj?.id}
                      value={formData.ward_obj}
                      onChange={(item) => setFormData({
                        ...formData,
                        ward_obj: item,
                        ward: item?.id ?? "",
                        street_obj: null,
                        street: ""
                      })}
                      placeholder={formData.district_obj ? "Search ward" : "Select district first"}
                      selectOnly={true}
                      disabled={!formData.district_obj}
                    />
                    {errors.ward && <span className="error-message">{errors.ward}</span>}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Street *</label>
                    <LocationAutocomplete
                      level="streets"
                      parentId={formData.ward_obj?.id}
                      value={formData.street_obj}
                      onChange={(item) => setFormData({
                        ...formData,
                        street_obj: item,
                        street: item?.id ?? "",
                        street_address: item?.name ?? ""
                      })}
                      placeholder={formData.ward_obj ? "Search street" : "Select ward first"}
                      selectOnly={true}
                      disabled={!formData.ward_obj}
                    />
                    {errors.street && <span className="error-message">{errors.street}</span>}
                  </div>
                </div>
              </div>
            )}
            {currentStage === 3 && (
              <div className="form-stage active">
                <h3>Programs & Facilities</h3>
                <div className="form-group full-width">
                  <label>Programs Offered *</label>
                  <textarea
                    name="programs_offered"
                    value={formData.programs_offered}
                    onChange={handleChange}
                    rows={4}
                    placeholder="List the main programs offered"
                    className={errors.programs_offered ? "error" : ""}
                  />
                  {errors.programs_offered && <span className="error-message">{errors.programs_offered}</span>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Total Students *</label>
                    <input
                      type="number"
                      name="total_students"
                      value={formData.total_students}
                      onChange={handleChange}
                      placeholder="0"
                      className={errors.total_students ? "error" : ""}
                    />
                    {errors.total_students && <span className="error-message">{errors.total_students}</span>}
                  </div>
                  <div className="form-group">
                    <label>Total Staff</label>
                    <input
                      type="number"
                      name="total_staff"
                      value={formData.total_staff}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Facility Status *</label>
                  <select
                    name="facility_status"
                    value={formData.facility_status}
                    onChange={handleChange}
                    className={errors.facility_status ? "error" : ""}
                  >
                    <option value="">Select Facility Status</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="under_development">Under Development</option>
                  </select>
                  {errors.facility_status && <span className="error-message">{errors.facility_status}</span>}
                </div>
                <div className="form-group">
                  <label>Available Facilities</label>
                  <div className="facility-checkboxes">
                    <label>
                      <input
                        type="checkbox"
                        name="has_library"
                        checked={formData.has_library}
                        onChange={handleChange}
                      />
                      Library
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="has_laboratory"
                        checked={formData.has_laboratory}
                        onChange={handleChange}
                      />
                      Laboratory
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="has_workshop"
                        checked={formData.has_workshop}
                        onChange={handleChange}
                      />
                      Workshop
                    </label>
                  </div>
                </div>
              </div>
            )}
            {currentStage === 4 && (
              <div className="form-stage active">
                <h3>Final Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Registration Number</label>
                    <input
                      type="text"
                      name="registration_number"
                      value={formData.registration_number}
                      onChange={handleChange}
                      placeholder="Enter registration number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Certificate Number</label>
                    <input
                      type="text"
                      name="certificate_number"
                      value={formData.certificate_number}
                      onChange={handleChange}
                      placeholder="Enter certificate number"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Accreditation Status</label>
                    <select
                      name="accreditation_status"
                      value={formData.accreditation_status}
                      onChange={handleChange}
                    >
                      <option value="">Select Accreditation Status</option>
                      <option value="seeking">Seeking Accreditation</option>
                      <option value="accredited">Fully Accredited</option>
                      <option value="provisional">Provisionally Accredited</option>
                      <option value="renewal">Accreditation Renewal</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Previous Accreditation Status</label>
                    <select
                      name="previous_accreditation"
                      value={formData.previous_accreditation}
                      onChange={handleChange}
                    >
                      <option value="">Select Previous Status</option>
                      <option value="none">Never Accredited</option>
                      <option value="approved">Previously Approved</option>
                      <option value="accredited">Previously Accredited</option>
                      <option value="revoked">Accreditation Revoked</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Years of Operation</label>
                    <input
                      type="number"
                      name="years_operation"
                      value={formData.years_operation}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter username"
                    />
                  </div>
                </div>
                <div className="form-summary">
                  <h4>Profile Summary</h4>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="label">Institution:</span>
                      <span className="value">{formData.institution_name}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Type:</span>
                      <span className="value">{formData.institution_type}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Location:</span>
                      <span className="value">{locationSummary || formData.location}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Principal:</span>
                      <span className="value">{formData.principal_name}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Students:</span>
                      <span className="value">{formData.total_students || 0}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Staff:</span>
                      <span className="value">{formData.total_staff || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="form-navigation">
              {currentStage > 1 && (
                <button type="button" className="btn-back" onClick={handleBack}>
                  ← BACK
                </button>
              )}
              {currentStage < totalStages && (
                <button type="button" className="btn-next" onClick={handleNext}>
                  NEXT →
                </button>
              )}
              {currentStage === totalStages && (
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? "Saving..." : "Finish"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
