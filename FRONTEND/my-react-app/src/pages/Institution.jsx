import { useState, useEffect } from "react";
import axiosInstance from "axios";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LocationAutocomplete from "../components/LocationAutocomplete";
import { showSuccess, showError } from "../services/alertService";

import {
  Building2,
  GraduationCap,
  ClipboardCheck,
  Users,
  Home,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle,
  FileText,
  Upload,
  Lock
} from "lucide-react";

import "../styles/Institution.css";

// Use standard axios directly
import axiosDefault from "axios";
const axiosObj = axiosInstance.defaults ? axiosInstance : axiosDefault;

// 8 Wizard steps config
const wizardSteps = [
  { id: 1, name: "Particulars", icon: Building2, label: "Particulars of Institution" },
  { id: 2, name: "Outputs", icon: GraduationCap, label: "Training Outputs" },
  { id: 3, name: "Process", icon: ClipboardCheck, label: "Training Process" },
  { id: 4, name: "HR & Land", icon: Users, label: "Human Resources & Land" },
  { id: 5, name: "Physical", icon: Home, label: "Physical & Info Resources" },
  { id: 6, name: "Funding", icon: DollarSign, label: "Funding & Finance" },
  { id: 7, name: "Projections", icon: TrendingUp, label: "Long-term Projections" },
  { id: 8, name: "Declaration", icon: ShieldCheck, label: "Declaration & Witness" }
];

export default function Institution() {
  /* =========================
     STATES
  ========================= */
  const [currentStage, setCurrentStage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [maxVisitedStage, setMaxVisitedStage] = useState(1);

  // Form State matching the official schema
  const [formData, setFormData] = useState({
    // --- STEP 1: Basic & Owner Particulars ---
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

    plot_number: "",
    fax: "",
    email: "",
    webpage: "",
    establishment_date: "",
    ownership_type: "", // Public, Religious, NGO, Private
    ownership_public_type: "", // Central Government, Local Government
    ownership_private_type: "", // Personal, Semi-private, Company, Other
    owner_name: "",
    owner_age: "",
    owner_sex: "",
    owner_nationality: "",
    governance_type: "", // Council, Board of Trustees, Board of Directors, Other
    previous_registration_desc: "",
    previous_registration_file: null,

    // --- STEP 2: Particulars of Outputs ---
    purpose_type: "", // Government Requirement, Business Venture, Religious, Service Based on Needs Assessment, Others
    feasibility_study_file: null,
    needs_assessment_file: null,
    vision: "",
    mission: "",
    objectives: ["", "", "", ""], // dynamic a, b, c, d
    subject_sectors: [], // Business, Tourism and Planning; Health and Allied Sciences; Science and Allied Technologies
    existing_programs: [
      { type: "Technician", min_qual: "", title_award: "", entry_req: "", duration: "", intake: "" }
    ],
    planned_programs: [
      { type: "Technician", min_qual: "", title_award: "", entry_req: "", duration: "", intake: "" }
    ],
    service_extension: "",
    service_consultancy: "",
    service_research: "",
    service_short_courses: "",
    service_others: "",

    // --- STEP 3: Training Process ---
    curriculum_preparer: "",
    curriculum_reviewer: "",
    curriculum_review_frequency: "",
    curriculum_last_review_date: "",
    curriculum_last_review_file: null,
    curriculum_approval_desc: "",
    recognition_status: [], // Professional bodies, Government, Other, None
    recognition_evidence_desc: "",
    recognition_evidence_file: null,
    training_structure: {
      coursework: { checked: false, duration: "" },
      practical: { checked: false, duration: "" },
      fieldwork: { checked: false, duration: "" }
    },
    training_mode: {
      full_time: { checked: false, duration: "" },
      distance_learning: { checked: false, duration: "" },
      part_time: { checked: false, duration: "" },
      block_studies: { checked: false, duration: "" }
    },
    exam_authority: "",
    exam_setting_procedure: "",
    exam_administering_procedure: "",
    exam_marking_procedure: "",
    exam_external_procedures: "",
    existing_awards: [
      { type: "", entry_qual: "", title_award: "", awarding_body: "", avg_awardees: "" }
    ],
    planned_awards: [
      { type: "", entry_qual: "", title_award: "", awarding_body: "", avg_awardees: "" }
    ],

    // --- STEP 4: Human Resources & Land ---
    ceo_name: "",
    ceo_qualifications: "",
    ceo_cv_file: null,
    org_structure_file: null,
    employees_full_time: [
      { sn: 1, name: "", age: "", qualifications: "", expertise: "", experience: "", origin: "Local", other_posts: "" }
    ],
    employees_part_time: [
      { sn: 1, name: "", age: "", qualifications: "", expertise: "", experience: "", origin: "Local", other_posts: "" }
    ],
    employees_support: [
      { name: "", age: "", qualifications: "", service: "", experience: "" }
    ],
    land_status: "Owned", // Owned / Leased
    land_title_deed_file: null,
    land_size: "",
    land_owned_period: "",
    land_lease_agreement_file: null,

    // --- STEP 5: Physical Infrastructure & Info ---
    infrastructure_buildings: [
      { type: "Offices", count: "", area: "", ownership: { owned: false, leased: false, hired: false } },
      { type: "Classrooms", count: "", area: "", ownership: { owned: false, leased: false, hired: false } },
      { type: "Laboratories", count: "", area: "", ownership: { owned: false, leased: false, hired: false } },
      { type: "Workshops", count: "", area: "", ownership: { owned: false, leased: false, hired: false } },
      { type: "Dormitories", count: "", area: "", ownership: { owned: false, leased: false, hired: false } },
      { type: "Assembly Halls", count: "", area: "", ownership: { owned: false, leased: false, hired: false } },
      { type: "Libraries", count: "", area: "", ownership: { owned: false, leased: false, hired: false } }
    ],
    equipment_desc: "",
    equipment_list_file: null,
    info_books_count: "",
    info_journals_list: "",
    info_has_internet: false,
    info_has_cdroms: false,
    services_matrix: {
      piped_water: { internal: false, external: false, provider: "" },
      waste_disposal: { internal: false, external: false, provider: "" },
      electricity: { internal: false, external: false, provider: "" },
      telephone: { internal: false, external: false, provider: "" },
      health: { internal: false, external: false, provider: "" },
      safety: { internal: false, external: false, provider: "" },
      security: { internal: false, external: false, provider: "" },
      transport: { internal: false, external: false, provider: "" }
    },

    // --- STEP 6: Funding ---
    past_expenditures: [
      { year: "", recurrent: "", capital: "", total: "" },
      { year: "", recurrent: "", capital: "", total: "" },
      { year: "", recurrent: "", capital: "", total: "" }
    ],
    budgetary_requirements: [
      { year: "Current Year", recurrent: "", capital: "", total: "" },
      { year: "Year +1", recurrent: "", capital: "", total: "" },
      { year: "Year +2", recurrent: "", capital: "", total: "" },
      { year: "Year +3", recurrent: "", capital: "", total: "" }
    ],
    funds_sources: {
      own: { checked: false, detail: "", file: null },
      loan: { checked: false, detail: "", file: null },
      grant: { checked: false, detail: "", file: null },
      fees: { checked: false, detail: "", file: null },
      government: { checked: false, detail: "", file: null }
    },
    fee_structure: [
      { type: "Application Fee", year1: "", subsequent: "" },
      { type: "Tuition Fee", year1: "", subsequent: "" },
      { type: "Registration Fee", year1: "", subsequent: "" },
      { type: "Examination Fee", year1: "", subsequent: "" },
      { type: "Medical Fee", year1: "", subsequent: "" },
      { type: "Caution Money", year1: "", subsequent: "" },
      { type: "Student Union Fee", year1: "", subsequent: "" },
      { type: "Graduation Fee", year1: "", subsequent: "" }
    ],

    // --- STEP 7: Long-term Projections ---
    student_intake_projections: [
      { award_type: "Pre-technician Certificate", prev_year: "", current_year: "", after_5: "", after_10: "" },
      { award_type: "Technician Certificate", prev_year: "", current_year: "", after_5: "", after_10: "" },
      { award_type: "Technician Diploma", prev_year: "", current_year: "", after_5: "", after_10: "" }
    ],
    projected_ratios: {
      support_staff_student: "",
      expert_staff_student: ""
    },
    facilities_area_projections: [
      { type: "Offices", current: "", target: "" },
      { type: "Classrooms", current: "", target: "" },
      { type: "Labs/Workshops", current: "", target: "" },
      { type: "Libraries", current: "", target: "" }
    ],
    strategic_plan_file: null,
    master_plan_file: null,

    // --- STEP 8: Declaration & Witness ---
    applicant_signature: null,
    applicant_date: "",
    applicant_name: "",
    applicant_designation: "",
    official_stamp_file: null,
    witness_applicant_name: "",
    witness_date_day: "",
    witness_date_month: "",
    witness_date_year: "",
    witness_name: "",
    witness_commissioner_details: "",
    witness_address: "",
    witness_date_signed: "",
    username: "",
    email: ""
  });

  /* =========================
     USE EFFECT
  ========================= */
  useEffect(() => {
    fetchInstitution();
  }, []);

  useEffect(() => {
    if (currentStage > maxVisitedStage) {
      setMaxVisitedStage(currentStage);
    }
  }, [currentStage]);

  /* =========================
     API INTERACTIONS
  ========================= */
  const fetchInstitution = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosObj.get("http://127.0.0.1:8000/api/institutions/", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        let loadedData = {};
        if (response.data.registration_data) {
          try {
            loadedData = JSON.parse(response.data.registration_data);
          } catch (e) {
            console.error("Failed to parse registration_data JSON", e);
          }
        }

        setFormData((prev) => ({
          ...prev,
          ...loadedData,
          // Sync default fields
          institution_name: response.data.institution_name || loadedData.institution_name || "",
          institution_type: response.data.institution_type || loadedData.institution_type || "",
          registration_number: response.data.registration_number || loadedData.registration_number || "",
          certificate_number: response.data.certificate_number || loadedData.certificate_number || "",
          institution_owner: response.data.institution_owner || loadedData.institution_owner || "",
          owner_title: response.data.owner_title || loadedData.owner_title || "",
          principal_name: response.data.principal_name || loadedData.principal_name || "",
          principal_email: response.data.principal_email || loadedData.principal_email || "",
          principal_phone: response.data.principal_phone || loadedData.principal_phone || "",
          street_address: response.data.street_address || loadedData.street_address || "",
          region: response.data.region || loadedData.region || "",
          city: response.data.city || loadedData.city || "",
          district: response.data.district || loadedData.district || "",
          ward: response.data.ward || loadedData.ward || "",
          street: response.data.street || loadedData.street || "",
          programs_offered: response.data.programs_offered || loadedData.programs_offered || "",
          total_students: response.data.total_students || loadedData.total_students || "",
          total_staff: response.data.total_staff || loadedData.total_staff || "",
          facility_status: response.data.facility_status || loadedData.facility_status || "",
          has_library: response.data.has_library || loadedData.has_library || false,
          has_laboratory: response.data.has_laboratory || loadedData.has_laboratory || false,
          has_workshop: response.data.has_workshop || loadedData.has_workshop || false,
          accreditation_status: response.data.accreditation_status || loadedData.accreditation_status || "",
          previous_accreditation: response.data.previous_accreditation || loadedData.previous_accreditation || "",
          years_operation: response.data.years_operation || loadedData.years_operation || "",
          
          // Re-populate autocomplete objects
          region_obj: response.data.region_obj || loadedData.region_obj || null,
          city_obj: response.data.city_obj || loadedData.city_obj || null,
          district_obj: response.data.district_obj || loadedData.district_obj || null,
          ward_obj: response.data.ward_obj || loadedData.ward_obj || null,
          street_obj: response.data.street_obj || loadedData.street_obj || null,
          username: response.data.username || "",
          email: response.data.email || ""
        }));
      }
    } catch (error) {
      console.log("FETCH ERROR:", error);
    }
  };

  const saveForm = async (isDraft = true) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      const payload = {
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
        region: formData.region_obj?.name || formData.region || "",
        city: formData.city_obj?.name || formData.city || "",
        district: formData.district_obj?.name || formData.district || "",
        ward: formData.ward_obj?.name || formData.ward || "",
        street: formData.street_obj?.name || formData.street || "",
        programs_offered: formData.programs_offered || "",
        total_students: formData.total_students ? parseInt(formData.total_students) : null,
        total_staff: formData.total_staff ? parseInt(formData.total_staff) : null,
        facility_status: formData.facility_status || "good",
        has_library: formData.has_library || false,
        has_laboratory: formData.has_laboratory || false,
        has_workshop: formData.has_workshop || false,
        accreditation_status: formData.accreditation_status || "seeking",
        previous_accreditation: formData.previous_accreditation || "none",
        years_operation: formData.years_operation ? parseInt(formData.years_operation) : null,
        // Entire nested wizard data serialized in database JSON field
        registration_data: JSON.stringify(formData)
      };

      await axiosObj.post(
        "http://127.0.0.1:8000/api/institutions/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (isDraft) {
        await showSuccess("Draft Saved", "Your progress has been saved as a draft successfully.", 1500);
      } else {
        await showSuccess("Form Submitted", "Your NACTVET REG-01 Application has been fully registered.", 1800);
        setCurrentStage(1);
      }
      fetchInstitution();
    } catch (error) {
      console.log("SAVE ERROR:", error);
      const responseData = error.response?.data;
      const errorMessage = responseData
        ? typeof responseData === 'string'
          ? responseData
          : JSON.stringify(responseData)
        : error.message || 'Something went wrong';
      await showError("Failed to Save", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     EVENT HANDLERS & HELPERS
  ========================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleNestedChange = (e, section, key) => {
    const { value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: type === "checkbox" ? checked : value
      }
    }));
  };

  const handleNestedDoubleChange = (e, section, key1, key2) => {
    const { value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key1]: {
          ...prev[section][key1],
          [key2]: type === "checkbox" ? checked : value
        }
      }
    }));
  };

  const handleFileUpload = (e, path) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const fileObj = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result // Base64
      };

      setFormData((prev) => {
        const updated = { ...prev };
        const parts = path.split(".");
        let temp = updated;
        for (let i = 0; i < parts.length - 1; i++) {
          temp = temp[parts[i]];
        }
        temp[parts[parts.length - 1]] = fileObj;
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  const removeFileObj = (path) => {
    setFormData((prev) => {
      const updated = { ...prev };
      const parts = path.split(".");
      let temp = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        temp = temp[parts[i]];
      }
      temp[parts[parts.length - 1]] = null;
      return updated;
    });
  };

  const renderFileInput = (label, path, fileObj) => (
    <div className="form-group file-uploader-group">
      <label>{label}</label>
      {!fileObj ? (
        <div className="file-dropzone">
          <Upload size={18} className="text-slate-400" />
          <span className="text-xs text-slate-500 mt-1">Upload PDF / DOCX</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) => handleFileUpload(e, path)}
            className="hidden-file-input"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-teal-500/20 bg-teal-50/50 p-3 mt-1 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700 min-w-0">
            <FileText size={18} className="text-teal-600 shrink-0" />
            <span className="text-xs font-semibold truncate" title={fileObj.name}>
              {fileObj.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={fileObj.data}
              download={fileObj.name}
              className="text-xs text-blue-600 hover:underline font-bold px-2 py-1"
            >
              Download
            </a>
            <button
              type="button"
              onClick={() => removeFileObj(path)}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Dynamic lists and grids handlers
  const updateObjectives = (index, value) => {
    const list = [...formData.objectives];
    list[index] = value;
    setFormData({ ...formData, objectives: list });
  };

  const addObjective = () => {
    setFormData({ ...formData, objectives: [...formData.objectives, ""] });
  };

  const removeObjective = (index) => {
    const list = formData.objectives.filter((_, i) => i !== index);
    setFormData({ ...formData, objectives: list });
  };

  const handleCheckboxListChange = (name, value, isChecked) => {
    const currentList = formData[name] || [];
    if (isChecked) {
      setFormData({ ...formData, [name]: [...currentList, value] });
    } else {
      setFormData({ ...formData, [name]: currentList.filter((x) => x !== value) });
    }
  };

  const handleTableInputChange = (e, index, tableKey, colKey) => {
    const rows = [...formData[tableKey]];
    rows[index][colKey] = e.target.value;
    setFormData({ ...formData, [tableKey]: rows });
  };

  const handleBuildingCheckboxChange = (index, typeKey) => {
    const rows = [...formData.infrastructure_buildings];
    rows[index].ownership[typeKey] = !rows[index].ownership[typeKey];
    setFormData({ ...formData, infrastructure_buildings: rows });
  };

  const addTableRow = (tableKey, emptyRow) => {
    setFormData({ ...formData, [tableKey]: [...formData[tableKey], emptyRow] });
  };

  const removeTableRow = (index, tableKey) => {
    if (formData[tableKey].length <= 1) return;
    const rows = formData[tableKey].filter((_, i) => i !== index);
    setFormData({ ...formData, [tableKey]: rows });
  };

  /* =========================
     VALIDATION SYSTEM
  ========================= */
  const validateStage = () => {
    const newErrors = {};

    if (currentStage === 1) {
      if (!formData.institution_name) newErrors.institution_name = "Institution name is required";
      if (!formData.institution_type) newErrors.institution_type = "Institution type is required";
      if (!formData.district) newErrors.district = "District is required";
      if (!formData.region) newErrors.region = "Region is required";
      if (!formData.principal_name) newErrors.principal_name = "Principal name is required";
      if (!formData.principal_email) {
        newErrors.principal_email = "Principal email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.principal_email)) {
        newErrors.principal_email = "Invalid email format";
      }
      if (!formData.ownership_type) newErrors.ownership_type = "Ownership type selection is required";
      if (!formData.owner_name) newErrors.owner_name = "Owner name is required";
    }

    if (currentStage === 2) {
      if (!formData.vision) newErrors.vision = "Vision statement is required";
      if (!formData.mission) newErrors.mission = "Mission statement is required";
      if (formData.subject_sectors.length === 0) newErrors.subject_sectors = "Select at least one subject sector";
    }

    if (currentStage === 4) {
      if (!formData.ceo_name) newErrors.ceo_name = "CEO name is required";
    }

    if (currentStage === 8) {
      if (!formData.applicant_name) newErrors.applicant_name = "Applicant full name is required";
      if (!formData.applicant_designation) newErrors.applicant_designation = "Applicant designation is required";
      if (!formData.applicant_date) newErrors.applicant_date = "Declaration date is required";
      if (!formData.witness_name) newErrors.witness_name = "Witness name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStage()) {
      setCurrentStage((prev) => Math.min(prev + 1, 8));
    } else {
      showError("Validation Failed", "Please fill out all required fields marked with an asterisk (*)");
    }
  };

  const handleBack = () => {
    setCurrentStage((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (stepId) => {
    // Only allow navigating to steps that have already been unlocked/visited to protect form integrity
    if (stepId <= maxVisitedStage) {
      setCurrentStage(stepId);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStage()) {
      saveForm(false);
    } else {
      showError("Validation Failed", "Check missing declarations or signatures on the final page.");
    }
  };

  /* =========================
     UI RENDER PIPELINE
  ========================= */
  const progressPercent = (currentStage / 8) * 100;

  return (
    <div className="flex min-h-screen bg-slate-50/50 text-slate-900 font-sans">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        
        <div className="institution-container lg:px-8 py-8 max-w-[1400px] mx-auto w-full">
          {/* Header Portal Info */}
          <div className="wizard-page-header bg-white border border-slate-200/60 rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
            <div>
              {/* <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">
                Institution Profile Registration
              </h1> */}
              <p className="text-sm font-medium text-slate-500 mt-1">
                NACTVET FORM REG-01: Application Form for Registration of Technical Institutions
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
                onClick={() => saveForm(true)}
                disabled={loading}
              >
                <Save size={14} />
                Save Draft
              </button>
              <span className="px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700">
                Progress: {Math.round(progressPercent)}%
              </span>
            </div>
          </div>

          {/* Stepper Navigation Tracker */}
          <div className="visual-stepper-container bg-white border border-slate-200/60 rounded-2xl p-6 mb-8 shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between min-w-[800px] px-4">
              {wizardSteps.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = step.id < currentStage;
                const isActive = step.id === currentStage;
                const isLocked = step.id > maxVisitedStage;

                return (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    <button
                      type="button"
                      onClick={() => handleStepClick(step.id)}
                      disabled={isLocked}
                      className={`flex flex-col items-center group relative outline-none focus:ring-0 ${
                        isLocked ? "cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isCompleted
                            ? "bg-teal-500 border-teal-500 text-white shadow-md shadow-teal-500/20"
                            : isActive
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-4 ring-indigo-500/10"
                            : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}
                      >
                        {isCompleted ? <CheckCircle size={20} /> : <Icon size={18} />}
                      </div>
                      <span
                        className={`text-[11px] font-bold mt-2 whitespace-nowrap transition-colors ${
                          isActive ? "text-indigo-600 font-extrabold" : "text-slate-500"
                        }`}
                      >
                        {step.name}
                      </span>
                      {isLocked && (
                        <span className="absolute -top-1.5 -right-1 bg-slate-200 text-slate-500 rounded-full p-0.5 border border-white">
                          <Lock size={8} />
                        </span>
                      )}
                    </button>
                    {idx < wizardSteps.length - 1 && (
                      <div className="flex-1 mx-4 h-[2px] bg-slate-100 relative">
                        <div
                          className="absolute left-0 top-0 h-full bg-teal-500 transition-all duration-500"
                          style={{ width: step.id < currentStage ? "100%" : "0%" }}
                        ></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-8 items-start">
            {/* Sidebar Minimap */}
            <aside className="sticky top-28 hidden xl:flex flex-col bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">
                Sections Map
              </h3>
              <nav className="flex flex-col gap-1.5">
                {wizardSteps.map((step) => {
                  const isActive = step.id === currentStage;
                  const isCompleted = step.id < currentStage;
                  const isLocked = step.id > maxVisitedStage;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => handleStepClick(step.id)}
                      disabled={isLocked}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                        isActive
                          ? "bg-indigo-50/70 border border-indigo-100 text-indigo-700 font-bold"
                          : isCompleted
                          ? "text-teal-700 hover:bg-slate-50"
                          : "text-slate-400"
                      } ${isLocked ? "opacity-55" : ""}`}
                    >
                      <span className="truncate">{step.id}. {step.label}</span>
                      {isCompleted && <CheckCircle size={14} className="text-teal-500 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Form Wizard Container */}
            <form className="institution-form compact-form bg-white border border-slate-200/60 rounded-3xl p-6 lg:p-10 shadow-sm min-h-[500px]" onSubmit={handleSubmit}>
              
              {/* STAGE 1: PARTICULAR OF TRAINING INSTITUTION */}
              {currentStage === 1 && (
                <div className="form-stage">
                  <h3>Part A - Section 1: Particulars of the Training Institution</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name of the Institution *</label>
                      <input
                        type="text"
                        name="institution_name"
                        value={formData.institution_name}
                        onChange={handleChange}
                        className={errors.institution_name ? "error" : ""}
                        placeholder="Enter official name"
                      />
                      {errors.institution_name && <span className="error-message">{errors.institution_name}</span>}
                    </div>

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

                  <div className="form-row">
                    <div className="form-group">
                      <label>Location (Region) *</label>
                      <LocationAutocomplete
                        level="regions"
                        parentId={null}
                        value={formData.region_obj}
                        onChange={(item) =>
                          setFormData({
                            ...formData,
                            region_obj: item,
                            region: item?.name ?? "",
                            city_obj: null,
                            city: "",
                            district_obj: null,
                            district: "",
                            ward_obj: null,
                            ward: "",
                            street_obj: null,
                            street: ""
                          })
                        }
                        placeholder="Search Region"
                      />
                      {errors.region && <span className="error-message">{errors.region}</span>}
                    </div>

                    <div className="form-group">
                      <label>City *</label>
                      <LocationAutocomplete
                        level="cities"
                        parentId={formData.region_obj?.id}
                        value={formData.city_obj}
                        onChange={(item) =>
                          setFormData({
                            ...formData,
                            city_obj: item,
                            city: item?.name ?? "",
                            district_obj: null,
                            district: "",
                            ward_obj: null,
                            ward: "",
                            street_obj: null,
                            street: ""
                          })
                        }
                        placeholder={formData.region_obj ? "Search City" : "Select Region First"}
                        disabled={!formData.region_obj}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>District / Municipal *</label>
                      <LocationAutocomplete
                        level="districts"
                        parentId={formData.city_obj?.id}
                        value={formData.district_obj}
                        onChange={(item) =>
                          setFormData({
                            ...formData,
                            district_obj: item,
                            district: item?.name ?? "",
                            ward_obj: null,
                            ward: "",
                            street_obj: null,
                            street: ""
                          })
                        }
                        placeholder={formData.city_obj ? "Search District" : "Select City First"}
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
                        onChange={(item) =>
                          setFormData({
                            ...formData,
                            ward_obj: item,
                            ward: item?.name ?? "",
                            street_obj: null,
                            street: ""
                          })
                        }
                        placeholder={formData.district_obj ? "Search Ward" : "Select District First"}
                        disabled={!formData.district_obj}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Plot Number / Village</label>
                      <input
                        type="text"
                        name="plot_number"
                        value={formData.plot_number}
                        onChange={handleChange}
                        placeholder="Plot No. / Village"
                      />
                    </div>

                    <div className="form-group">
                      <label>Physical Address (Street) *</label>
                      <LocationAutocomplete
                        level="streets"
                        parentId={formData.ward_obj?.id}
                        value={formData.street_obj}
                        onChange={(item) =>
                          setFormData({
                            ...formData,
                            street_obj: item,
                            street: item?.name ?? "",
                            street_address: item?.name ?? ""
                          })
                        }
                        placeholder={formData.ward_obj ? "Search Street" : "Select Ward First"}
                        disabled={!formData.ward_obj}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="principal_phone"
                        value={formData.principal_phone}
                        onChange={handleChange}
                        placeholder="e.g. +255..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Fax</label>
                      <input
                        type="text"
                        name="fax"
                        value={formData.fax}
                        onChange={handleChange}
                        placeholder="Fax Number"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Webpage</label>
                      <input
                        type="url"
                        name="webpage"
                        value={formData.webpage}
                        onChange={handleChange}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Date of Establishment</label>
                      <input
                        type="date"
                        name="establishment_date"
                        value={formData.establishment_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Ownership Block */}
                  <div className="section-divider mt-6 mb-4">Ownership Particulars</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Ownership Type *</label>
                      <select
                        name="ownership_type"
                        value={formData.ownership_type}
                        onChange={handleChange}
                        className={errors.ownership_type ? "error" : ""}
                      >
                        <option value="">Select Ownership Type</option>
                        <option value="Public">Public</option>
                        <option value="Religious">Religious</option>
                        <option value="NGO">NGO</option>
                        <option value="Private">Private</option>
                      </select>
                      {errors.ownership_type && <span className="error-message">{errors.ownership_type}</span>}
                    </div>

                    {formData.ownership_type === "Public" && (
                      <div className="form-group">
                        <label>Public Sub-Type</label>
                        <select
                          name="ownership_public_type"
                          value={formData.ownership_public_type}
                          onChange={handleChange}
                        >
                          <option value="">Select Sub-Type</option>
                          <option value="Central Government">Central Government</option>
                          <option value="Local Government">Local Government</option>
                        </select>
                      </div>
                    )}

                    {formData.ownership_type === "Private" && (
                      <div className="form-group">
                        <label>Private Sub-Type</label>
                        <select
                          name="ownership_private_type"
                          value={formData.ownership_private_type}
                          onChange={handleChange}
                        >
                          <option value="">Select Sub-Type</option>
                          <option value="Personal">Personal</option>
                          <option value="Semi-private">Semi-private</option>
                          <option value="Company">Company</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Name of Owner *</label>
                      <input
                        type="text"
                        name="owner_name"
                        value={formData.owner_name}
                        onChange={handleChange}
                        className={errors.owner_name ? "error" : ""}
                        placeholder="Owner full name"
                      />
                      {errors.owner_name && <span className="error-message">{errors.owner_name}</span>}
                    </div>

                    <div className="form-group">
                      <label>Owner Age</label>
                      <input
                        type="number"
                        name="owner_age"
                        value={formData.owner_age}
                        onChange={handleChange}
                        placeholder="Owner Age"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Owner Sex</label>
                      <select name="owner_sex" value={formData.owner_sex} onChange={handleChange}>
                        <option value="">Select Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Owner Nationality</label>
                      <input
                        type="text"
                        name="owner_nationality"
                        value={formData.owner_nationality}
                        onChange={handleChange}
                        placeholder="e.g. Tanzanian"
                      />
                    </div>
                  </div>

                  {/* Governance & Legals */}
                  <div className="section-divider mt-6 mb-4">Governance & Legal Registration</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Institutional Governance</label>
                      <select
                        name="governance_type"
                        value={formData.governance_type}
                        onChange={handleChange}
                      >
                        <option value="">Select Governance structure</option>
                        <option value="Council">Council</option>
                        <option value="Board of Trustees">Board of Trustees</option>
                        <option value="Board of Directors">Board of Directors</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Principal / Director Name *</label>
                      <input
                        type="text"
                        name="principal_name"
                        value={formData.principal_name}
                        onChange={handleChange}
                        className={errors.principal_name ? "error" : ""}
                        placeholder="Principal name"
                      />
                      {errors.principal_name && <span className="error-message">{errors.principal_name}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Principal Email *</label>
                      <input
                        type="email"
                        name="principal_email"
                        value={formData.principal_email}
                        onChange={handleChange}
                        className={errors.principal_email ? "error" : ""}
                        placeholder="principal@example.com"
                      />
                      {errors.principal_email && <span className="error-message">{errors.principal_email}</span>}
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>Previous Legal Registration/Licensing Details</label>
                    <textarea
                      name="previous_registration_desc"
                      value={formData.previous_registration_desc}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Detail previous legal constitution, charter or articles of association..."
                    />
                  </div>

                  <div className="full-width">
                    {renderFileInput(
                      "Attach Legal documents (Articles of Association, Constitution, Charter)",
                      "previous_registration_file",
                      formData.previous_registration_file
                    )}
                  </div>
                </div>
              )}

              {/* STAGE 2: OUTPUTS */}
              {currentStage === 2 && (
                <div className="form-stage">
                  <h3>Section 2: Particulars of the Training Institution Outputs</h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Purpose of Establishing</label>
                      <select name="purpose_type" value={formData.purpose_type} onChange={handleChange}>
                        <option value="">Select Purpose</option>
                        <option value="Government Requirement">Government Requirement</option>
                        <option value="Business Venture">Business Venture</option>
                        <option value="Religious">Religious</option>
                        <option value="Service Based on Needs Assessment">
                          Service Based on Needs Assessment
                        </option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    {formData.purpose_type === "Business Venture" &&
                      renderFileInput(
                        "Attach Feasibility Study file *",
                        "feasibility_study_file",
                        formData.feasibility_study_file
                      )}

                    {formData.purpose_type === "Service Based on Needs Assessment" &&
                      renderFileInput(
                        "Attach Needs Assessment file *",
                        "needs_assessment_file",
                        formData.needs_assessment_file
                      )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Vision Statement *</label>
                      <textarea
                        name="vision"
                        value={formData.vision}
                        onChange={handleChange}
                        rows={2}
                        className={errors.vision ? "error" : ""}
                      />
                      {errors.vision && <span className="error-message">{errors.vision}</span>}
                    </div>

                    <div className="form-group">
                      <label>Mission Statement *</label>
                      <textarea
                        name="mission"
                        value={formData.mission}
                        onChange={handleChange}
                        rows={2}
                        className={errors.mission ? "error" : ""}
                      />
                      {errors.mission && <span className="error-message">{errors.mission}</span>}
                    </div>
                  </div>

                  {/* Objectives List */}
                  <div className="form-group full-width">
                    <div className="flex justify-between items-center mb-2">
                      <label className="m-0">Institutional Objectives (a, b, c, d...)</label>
                      <button
                        type="button"
                        onClick={addObjective}
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold border border-indigo-200 rounded-lg px-3 py-1.5"
                      >
                        <Plus size={14} /> Add Objective
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {formData.objectives.map((obj, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <span className="text-xs font-bold text-slate-400 w-6">
                            {String.fromCharCode(97 + index)})
                          </span>
                          <input
                            type="text"
                            value={obj}
                            onChange={(e) => updateObjectives(index, e.target.value)}
                            placeholder="Enter objective description"
                            className="flex-1"
                          />
                          {formData.objectives.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeObjective(index)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subject Sector Checklist */}
                  <div className="form-group full-width">
                    <label>Subject Sector Checklist *</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                      {[
                        "Business, Tourism and Planning",
                        "Health and Allied Sciences",
                        "Science and Allied Technologies"
                      ].map((sector) => (
                        <label key={sector} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.subject_sectors.includes(sector)}
                            onChange={(e) =>
                              handleCheckboxListChange("subject_sectors", sector, e.target.checked)
                            }
                            className="h-4 w-4 accent-indigo-600"
                          />
                          {sector}
                        </label>
                      ))}
                    </div>
                    {errors.subject_sectors && <span className="error-message">{errors.subject_sectors}</span>}
                  </div>

                  {/* Existing Programs CRUD Table */}
                  <div className="form-group full-width mt-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-bold text-slate-900 m-0">
                        Type and Level of Training Offered (Existing)
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          addTableRow("existing_programs", {
                            type: "Technician",
                            min_qual: "",
                            title_award: "",
                            entry_req: "",
                            duration: "",
                            intake: ""
                          })
                        }
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold border border-indigo-200 rounded-lg px-3 py-1.5"
                      >
                        <Plus size={14} /> Add Program
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                      <table className="wizard-data-table w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <th className="p-3">Type</th>
                            <th className="p-3">Minimum Entry Qualification</th>
                            <th className="p-3">Title of Award Sought</th>
                            <th className="p-3">Inst. Entry Requirements</th>
                            <th className="p-3">Duration (months)</th>
                            <th className="p-3">Intake (p.a.)</th>
                            <th className="p-3 w-12 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.existing_programs.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/40">
                              <td className="p-2">
                                <select
                                  value={row.type}
                                  onChange={(e) => handleTableInputChange(e, idx, "existing_programs", "type")}
                                >
                                  <option value="Technician">Technician</option>
                                  <option value="Semi-Professional">Semi-Professional</option>
                                </select>
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.min_qual}
                                  onChange={(e) => handleTableInputChange(e, idx, "existing_programs", "min_qual")}
                                  placeholder="Qualifications"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.title_award}
                                  onChange={(e) => handleTableInputChange(e, idx, "existing_programs", "title_award")}
                                  placeholder="Pre-technician Certificate, Degree etc"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.entry_req}
                                  onChange={(e) => handleTableInputChange(e, idx, "existing_programs", "entry_req")}
                                  placeholder="Entry requirements"
                                />
                              </td>
                              <td className="p-2 w-24">
                                <input
                                  type="number"
                                  value={row.duration}
                                  onChange={(e) => handleTableInputChange(e, idx, "existing_programs", "duration")}
                                  placeholder="Months"
                                />
                              </td>
                              <td className="p-2 w-24">
                                <input
                                  type="number"
                                  value={row.intake}
                                  onChange={(e) => handleTableInputChange(e, idx, "existing_programs", "intake")}
                                  placeholder="Students"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeTableRow(idx, "existing_programs")}
                                  className="text-rose-500 hover:text-rose-700 p-1"
                                  disabled={formData.existing_programs.length <= 1}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Planned Programs CRUD Table */}
                  <div className="form-group full-width mt-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-bold text-slate-900 m-0">
                        Type and Level of Training Planned (New)
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          addTableRow("planned_programs", {
                            type: "Technician",
                            min_qual: "",
                            title_award: "",
                            entry_req: "",
                            duration: "",
                            intake: ""
                          })
                        }
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold border border-indigo-200 rounded-lg px-3 py-1.5"
                      >
                        <Plus size={14} /> Add Program
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                      <table className="wizard-data-table w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <th className="p-3">Type</th>
                            <th className="p-3">Minimum Entry Qualification</th>
                            <th className="p-3">Title of Award Planned</th>
                            <th className="p-3">Inst. Entry Requirements</th>
                            <th className="p-3">Duration (months)</th>
                            <th className="p-3">Intake (p.a.)</th>
                            <th className="p-3 w-12 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.planned_programs.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/40">
                              <td className="p-2">
                                <select
                                  value={row.type}
                                  onChange={(e) => handleTableInputChange(e, idx, "planned_programs", "type")}
                                >
                                  <option value="Technician">Technician</option>
                                  <option value="Semi-Professional">Semi-Professional</option>
                                </select>
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.min_qual}
                                  onChange={(e) => handleTableInputChange(e, idx, "planned_programs", "min_qual")}
                                  placeholder="Qualifications"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.title_award}
                                  onChange={(e) => handleTableInputChange(e, idx, "planned_programs", "title_award")}
                                  placeholder="Pre-technician Certificate, Degree etc"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.min_qual}
                                  onChange={(e) => handleTableInputChange(e, idx, "planned_programs", "entry_req")}
                                  placeholder="Entry requirements"
                                />
                              </td>
                              <td className="p-2 w-24">
                                <input
                                  type="number"
                                  value={row.duration}
                                  onChange={(e) => handleTableInputChange(e, idx, "planned_programs", "duration")}
                                  placeholder="Months"
                                />
                              </td>
                              <td className="p-2 w-24">
                                <input
                                  type="number"
                                  value={row.intake}
                                  onChange={(e) => handleTableInputChange(e, idx, "planned_programs", "intake")}
                                  placeholder="Students"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeTableRow(idx, "planned_programs")}
                                  className="text-rose-500 hover:text-rose-700 p-1"
                                  disabled={formData.planned_programs.length <= 1}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Other Services */}
                  <div className="section-divider mt-6 mb-4">Other Services Provided</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Extension Services</label>
                      <input
                        type="text"
                        name="service_extension"
                        value={formData.service_extension}
                        onChange={handleChange}
                        placeholder="Detail extension services offered"
                      />
                    </div>
                    <div className="form-group">
                      <label>Consultancy Services</label>
                      <input
                        type="text"
                        name="service_consultancy"
                        value={formData.service_consultancy}
                        onChange={handleChange}
                        placeholder="Detail consultancy offerings"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Research Services</label>
                      <input
                        type="text"
                        name="service_research"
                        value={formData.service_research}
                        onChange={handleChange}
                        placeholder="Detail institutional research"
                      />
                    </div>
                    <div className="form-group">
                      <label>Short Courses</label>
                      <input
                        type="text"
                        name="service_short_courses"
                        value={formData.service_short_courses}
                        onChange={handleChange}
                        placeholder="Detail short courses offered"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Others</label>
                      <input
                        type="text"
                        name="service_others"
                        value={formData.service_others}
                        onChange={handleChange}
                        placeholder="Other specialized services"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 3: TRAINING PROCESS */}
              {currentStage === 3 && (
                <div className="form-stage">
                  <h3>Section 3: Training Process</h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Who Prepares Curriculum?</label>
                      <input
                        type="text"
                        name="curriculum_preparer"
                        value={formData.curriculum_preparer}
                        onChange={handleChange}
                        placeholder="Preparer Name or Unit"
                      />
                    </div>

                    <div className="form-group">
                      <label>Reviewer / Moderator</label>
                      <input
                        type="text"
                        name="curriculum_reviewer"
                        value={formData.curriculum_reviewer}
                        onChange={handleChange}
                        placeholder="Reviewer Name / External Board"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Frequency of Review</label>
                      <input
                        type="text"
                        name="curriculum_review_frequency"
                        value={formData.curriculum_review_frequency}
                        onChange={handleChange}
                        placeholder="e.g. Annually, Every 2 years"
                      />
                    </div>

                    <div className="form-group">
                      <label>Date of Last Review</label>
                      <input
                        type="date"
                        name="curriculum_last_review_date"
                        value={formData.curriculum_last_review_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="full-width">
                      {renderFileInput(
                        "Attach Evidence of Last Curriculum Review (Report / Certificate)",
                        "curriculum_last_review_file",
                        formData.curriculum_last_review_file
                      )}
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>Curriculum Approval Process Description</label>
                    <textarea
                      name="curriculum_approval_desc"
                      value={formData.curriculum_approval_desc}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Detail how the curriculum is vetted and approved..."
                    />
                  </div>

                  {/* Recognition Checklist */}
                  <div className="form-group full-width mt-4">
                    <label>Recognition / Accreditation Status</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border border-slate-100 bg-slate-50/50 p-4 rounded-xl mb-4">
                      {["Professional bodies", "Government", "Other", "None"].map((rec) => (
                        <label key={rec} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.recognition_status.includes(rec)}
                            onChange={(e) =>
                              handleCheckboxListChange("recognition_status", rec, e.target.checked)
                            }
                            className="h-4 w-4 accent-indigo-600"
                          />
                          {rec}
                        </label>
                      ))}
                    </div>

                    <div className="form-group">
                      <label>Detail Recognition / Attach Evidence</label>
                      <input
                        type="text"
                        name="recognition_evidence_desc"
                        value={formData.recognition_evidence_desc}
                        onChange={handleChange}
                        placeholder="Evidence references..."
                      />
                    </div>

                    <div className="mt-2">
                      {renderFileInput(
                        "Upload Recognition Letters / Proofs",
                        "recognition_evidence_file",
                        formData.recognition_evidence_file
                      )}
                    </div>
                  </div>

                  {/* Training Structure & Mode Checklists */}
                  <div className="section-divider mt-6 mb-4">Training Structure & Mode</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/30">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                        Structure of Training
                      </h4>
                      <div className="flex flex-col gap-3">
                        {["coursework", "practical", "fieldwork"].map((key) => (
                          <div key={key} className="flex items-center justify-between gap-4">
                            <label className="flex items-center gap-2 text-xs font-semibold m-0 cursor-pointer capitalize">
                              <input
                                type="checkbox"
                                checked={formData.training_structure[key].checked}
                                onChange={(e) =>
                                  handleNestedDoubleChange(e, "training_structure", key, "checked")
                                }
                                className="h-4 w-4 accent-indigo-600"
                              />
                              {key}
                            </label>
                            <input
                              type="text"
                              value={formData.training_structure[key].duration}
                              onChange={(e) =>
                                handleNestedDoubleChange(e, "training_structure", key, "duration")
                              }
                              placeholder="Duration / Weeks"
                              className="w-40 text-xs py-1.5 px-2.5"
                              disabled={!formData.training_structure[key].checked}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/30">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                        Mode of Training
                      </h4>
                      <div className="flex flex-col gap-3">
                        {["full_time", "distance_learning", "part_time", "block_studies"].map((key) => (
                          <div key={key} className="flex items-center justify-between gap-4">
                            <label className="flex items-center gap-2 text-xs font-semibold m-0 cursor-pointer capitalize">
                              <input
                                type="checkbox"
                                checked={formData.training_mode[key].checked}
                                onChange={(e) =>
                                  handleNestedDoubleChange(e, "training_mode", key, "checked")
                                }
                                className="h-4 w-4 accent-indigo-600"
                              />
                              {key.replace("_", " ")}
                            </label>
                            <input
                              type="text"
                              value={formData.training_mode[key].duration}
                              onChange={(e) =>
                                handleNestedDoubleChange(e, "training_mode", key, "duration")
                              }
                              placeholder="Duration details"
                              className="w-40 text-xs py-1.5 px-2.5"
                              disabled={!formData.training_mode[key].checked}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Examinations Textareas */}
                  <div className="section-divider mt-6 mb-4">Examinations Vetting Procedures</div>
                  
                  <div className="form-group full-width">
                    <label>Examining Authority</label>
                    <textarea
                      name="exam_authority"
                      value={formData.exam_authority}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Specify the body / board conducting examinations..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Setting Procedure</label>
                      <textarea
                        name="exam_setting_procedure"
                        value={formData.exam_setting_procedure}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Setting and vetting procedures..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Administering Procedure</label>
                      <textarea
                        name="exam_administering_procedure"
                        value={formData.exam_administering_procedure}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Administering & supervision guidelines..."
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Marking Procedure</label>
                      <textarea
                        name="exam_marking_procedure"
                        value={formData.exam_marking_procedure}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Marking and moderation arrangements..."
                      />
                    </div>
                    <div className="form-group">
                      <label>External Exam Procedures</label>
                      <textarea
                        name="exam_external_procedures"
                        value={formData.exam_external_procedures}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Details of external moderation..."
                      />
                    </div>
                  </div>

                  {/* Existing Awards Table */}
                  <div className="form-group full-width mt-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-bold text-slate-900 m-0">Existing Awards</h4>
                      <button
                        type="button"
                        onClick={() =>
                          addTableRow("existing_awards", {
                            type: "",
                            entry_qual: "",
                            title_award: "",
                            awarding_body: "",
                            avg_awardees: ""
                          })
                        }
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold border border-indigo-200 rounded-lg px-3 py-1.5"
                      >
                        <Plus size={14} /> Add Award
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                      <table className="wizard-data-table w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <th className="p-3">Type</th>
                            <th className="p-3">Entry Qualification</th>
                            <th className="p-3">Title of Award</th>
                            <th className="p-3">Awarding Body</th>
                            <th className="p-3">Avg. Awardees / Year</th>
                            <th className="p-3 w-12 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.existing_awards.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/40">
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.type}
                                  onChange={(e) => handleTableInputChange(e, idx, "existing_awards", "type")}
                                  placeholder="e.g. NTA Level 4"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.entry_qual}
                                  onChange={(e) => handleTableInputChange(e, idx, "existing_awards", "entry_qual")}
                                  placeholder="Entry requirements"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.title_award}
                                  onChange={(e) => handleTableInputChange(e, idx, "existing_awards", "title_award")}
                                  placeholder="Award title"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.awarding_body}
                                  onChange={(e) => handleTableInputChange(e, idx, "existing_awards", "awarding_body")}
                                  placeholder="e.g. NACTVET"
                                />
                              </td>
                              <td className="p-2 w-28">
                                <input
                                  type="number"
                                  value={row.avg_awardees}
                                  onChange={(e) => handleTableInputChange(e, idx, "existing_awards", "avg_awardees")}
                                  placeholder="Number"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeTableRow(idx, "existing_awards")}
                                  className="text-rose-500 hover:text-rose-700 p-1"
                                  disabled={formData.existing_awards.length <= 1}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Planned Awards Table */}
                  <div className="form-group full-width mt-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-bold text-slate-900 m-0">Planned Awards</h4>
                      <button
                        type="button"
                        onClick={() =>
                          addTableRow("planned_awards", {
                            type: "",
                            entry_qual: "",
                            title_award: "",
                            awarding_body: "",
                            avg_awardees: ""
                          })
                        }
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold border border-indigo-200 rounded-lg px-3 py-1.5"
                      >
                        <Plus size={14} /> Add Award
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                      <table className="wizard-data-table w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <th className="p-3">Type</th>
                            <th className="p-3">Entry Qualification</th>
                            <th className="p-3">Title of Award</th>
                            <th className="p-3">Awarding Body</th>
                            <th className="p-3">Avg. Awardees / Year</th>
                            <th className="p-3 w-12 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.planned_awards.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/40">
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.type}
                                  onChange={(e) => handleTableInputChange(e, idx, "planned_awards", "type")}
                                  placeholder="e.g. NTA Level 6"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.entry_qual}
                                  onChange={(e) => handleTableInputChange(e, idx, "planned_awards", "entry_qual")}
                                  placeholder="Entry requirements"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.title_award}
                                  onChange={(e) => handleTableInputChange(e, idx, "planned_awards", "title_award")}
                                  placeholder="Award title"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.awarding_body}
                                  onChange={(e) => handleTableInputChange(e, idx, "planned_awards", "awarding_body")}
                                  placeholder="e.g. NACTVET"
                                />
                              </td>
                              <td className="p-2 w-28">
                                <input
                                  type="number"
                                  value={row.avg_awardees}
                                  onChange={(e) => handleTableInputChange(e, idx, "planned_awards", "avg_awardees")}
                                  placeholder="Number"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeTableRow(idx, "planned_awards")}
                                  className="text-rose-500 hover:text-rose-700 p-1"
                                  disabled={formData.planned_awards.length <= 1}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 4: HR & LAND STATUS */}
              {currentStage === 4 && (
                <div className="form-stage">
                  <h3>Section 4: Key Inputs - HR & Land Status</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>CEO / Principal Full Name *</label>
                      <input
                        type="text"
                        name="ceo_name"
                        value={formData.ceo_name}
                        onChange={handleChange}
                        className={errors.ceo_name ? "error" : ""}
                        placeholder="CEO / Principal Name"
                      />
                      {errors.ceo_name && <span className="error-message">{errors.ceo_name}</span>}
                    </div>

                    <div className="form-group">
                      <label>CEO / Principal Qualifications</label>
                      <input
                        type="text"
                        name="ceo_qualifications"
                        value={formData.ceo_qualifications}
                        onChange={handleChange}
                        placeholder="e.g. PhD in Engineering"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      {renderFileInput("Attach CEO CV *", "ceo_cv_file", formData.ceo_cv_file)}
                    </div>
                    <div className="form-group">
                      {renderFileInput("Attach Organizational Structure *", "org_structure_file", formData.org_structure_file)}
                    </div>
                  </div>

                  {/* Employees full-time Table */}
                  <div className="form-group full-width mt-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-bold text-slate-900 m-0">Full-time experts</h4>
                      <button
                        type="button"
                        onClick={() =>
                          addTableRow("employees_full_time", {
                            sn: formData.employees_full_time.length + 1,
                            name: "",
                            age: "",
                            qualifications: "",
                            expertise: "",
                            experience: "",
                            origin: "Local",
                            other_posts: ""
                          })
                        }
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold border border-indigo-200 rounded-lg px-3 py-1.5"
                      >
                        <Plus size={14} /> Add Expert
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                      <table className="wizard-data-table w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <th className="p-3 w-12 text-center">S/N</th>
                            <th className="p-3">Name</th>
                            <th className="p-3 w-16">Age</th>
                            <th className="p-3">Qualifications</th>
                            <th className="p-3">Area of Expertise</th>
                            <th className="p-3 w-20">Exp (yrs)</th>
                            <th className="p-3 w-24">Origin</th>
                            <th className="p-3">Other Posts</th>
                            <th className="p-3 w-12 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.employees_full_time.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/40">
                              <td className="p-2 text-center text-slate-500 font-bold">{idx + 1}</td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.name}
                                  onChange={(e) => handleTableInputChange(e, idx, "employees_full_time", "name")}
                                  placeholder="Full Name"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.age}
                                  onChange={(e) => handleTableInputChange(e, idx, "employees_full_time", "age")}
                                  placeholder="Age"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.qualifications}
                                  onChange={(e) => handleTableInputChange(e, idx, "employees_full_time", "qualifications")}
                                  placeholder="Degree/Diploma"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.expertise}
                                  onChange={(e) => handleTableInputChange(e, idx, "employees_full_time", "expertise")}
                                  placeholder="e.g. IT, Nursing"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.experience}
                                  onChange={(e) => handleTableInputChange(e, idx, "employees_full_time", "experience")}
                                  placeholder="Years"
                                />
                              </td>
                              <td className="p-2">
                                <select
                                  value={row.origin}
                                  onChange={(e) => handleTableInputChange(e, idx, "employees_full_time", "origin")}
                                >
                                  <option value="Local">Local</option>
                                  <option value="Foreign">Foreign</option>
                                </select>
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.other_posts}
                                  onChange={(e) => handleTableInputChange(e, idx, "employees_full_time", "other_posts")}
                                  placeholder="Other duties"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeTableRow(idx, "employees_full_time")}
                                  className="text-rose-500 hover:text-rose-700 p-1"
                                  disabled={formData.employees_full_time.length <= 1}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Employees part-time Table */}
                  <div className="form-group full-width mt-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-bold text-slate-900 m-0">Part-time experts</h4>
                      <button
                        type="button"
                        onClick={() =>
                          addTableRow("employees_part_time", {
                            sn: formData.employees_part_time.length + 1,
                            name: "",
                            age: "",
                            qualifications: "",
                            expertise: "",
                            experience: "",
                            origin: "Local",
                            other_posts: ""
                          })
                        }
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold border border-indigo-200 rounded-lg px-3 py-1.5"
                      >
                        <Plus size={14} /> Add Expert
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                      <table className="wizard-data-table w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <th className="p-3 w-12 text-center">S/N</th>
                            <th className="p-3">Name</th>
                            <th className="p-3 w-16">Age</th>
                            <th className="p-3">Qualifications</th>
                            <th className="p-3">Area of Expertise</th>
                            <th className="p-3 w-20">Exp (yrs)</th>
                            <th className="p-3 w-24">Origin</th>
                            <th className="p-3">Other Posts</th>
                            <th className="p-3 w-12 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.employees_part_time.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/40">
                              <td className="p-2 text-center text-slate-500 font-bold">{idx + 1}</td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.name}
                                  onChange={(e) => handleTableInputChange(e, idx, "employees_part_time", "name")}
                                  placeholder="Full Name"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.age}
                                  onChange={(e) => handleTableInputChange(e, idx, "employees_part_time", "age")}
                                  placeholder="Age"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.qualifications}
                                  onChange={(e) => handleTableInputChange(e, idx, "employees_part_time", "qualifications")}
                                  placeholder="Qualifications"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.expertise}
                                  onChange={(e) => handleTableInputChange(e, idx, "employees_part_time", "expertise")}
                                  placeholder="Expertise"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.experience}
                                  onChange={(e) => handleTableInputChange(e, idx, "employees_part_time", "experience")}
                                  placeholder="Years"
                                />
                              </td>
                              <td className="p-2">
                                <select
                                  value={row.origin}
                                  onChange={(e) => handleTableInputChange(e, idx, "employees_part_time", "origin")}
                                >
                                  <option value="Local">Local</option>
                                  <option value="Foreign">Foreign</option>
                                </select>
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.other_posts}
                                  onChange={(e) => handleTableInputChange(e, idx, "employees_part_time", "other_posts")}
                                  placeholder="Other duties"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeTableRow(idx, "employees_part_time")}
                                  className="text-rose-500 hover:text-rose-700 p-1"
                                  disabled={formData.employees_part_time.length <= 1}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Supporting Staff Table */}
                  <div className="form-group full-width mt-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-bold text-slate-900 m-0">Supporting staff</h4>
                      <button
                        type="button"
                        onClick={() =>
                          addTableRow("employees_support", {
                            name: "",
                            age: "",
                            qualifications: "",
                            service: "",
                            experience: ""
                          })
                        }
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold border border-indigo-200 rounded-lg px-3 py-1.5"
                      >
                        <Plus size={14} /> Add Staff
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                      <table className="wizard-data-table w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <th className="p-3">Name</th>
                            <th className="p-3 w-20">Age</th>
                            <th className="p-3">Qualifications</th>
                            <th className="p-3">Support Service Offered</th>
                            <th className="p-3 w-28">Experience (yrs)</th>
                            <th className="p-3 w-12 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.employees_support.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/40">
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.name}
                                  onChange={(e) => handleTableInputChange(e, idx, "employees_support", "name")}
                                  placeholder="Full Name"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.age}
                                  onChange={(e) => handleTableInputChange(e, idx, "employees_support", "age")}
                                  placeholder="Age"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.qualifications}
                                  onChange={(e) => handleTableInputChange(e, idx, "employees_support", "qualifications")}
                                  placeholder="e.g. Form IV, VETA"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.service}
                                  onChange={(e) => handleTableInputChange(e, idx, "employees_support", "service")}
                                  placeholder="e.g. Secretary, Driver, Cleaner"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.experience}
                                  onChange={(e) => handleTableInputChange(e, idx, "employees_support", "experience")}
                                  placeholder="Years"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeTableRow(idx, "employees_support")}
                                  className="text-rose-500 hover:text-rose-700 p-1"
                                  disabled={formData.employees_support.length <= 1}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Physical Resources - Land Status */}
                  <div className="section-divider mt-6 mb-4">Physical Resources: Land Status</div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Land Status</label>
                      <select name="land_status" value={formData.land_status} onChange={handleChange}>
                        <option value="Owned">Owned</option>
                        <option value="Leased">Leased</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Land Size (sq meters)</label>
                      <input
                        type="text"
                        name="land_size"
                        value={formData.land_size}
                        onChange={handleChange}
                        placeholder="Land Size in m2"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    {formData.land_status === "Owned" ? (
                      <>
                        <div className="form-group">
                          <label>Owned Period (Years)</label>
                          <input
                            type="text"
                            name="land_owned_period"
                            value={formData.land_owned_period}
                            onChange={handleChange}
                            placeholder="Period owned"
                          />
                        </div>
                        {renderFileInput(
                          "Attach Land Title Deed",
                          "land_title_deed_file",
                          formData.land_title_deed_file
                        )}
                      </>
                    ) : (
                      renderFileInput(
                        "Attach Lease Agreement File",
                        "land_lease_agreement_file",
                        formData.land_lease_agreement_file
                      )
                    )}
                  </div>
                </div>
              )}

              {/* STAGE 5: INFRASTRUCTURE, EQUIPMENT & SERVICES */}
              {currentStage === 5 && (
                <div className="form-stage">
                  <h3>Section 4: Key Inputs - Infrastructure & CD-ROMs</h3>

                  {/* Infrastructure/Buildings Table */}
                  <div className="form-group full-width mt-4">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">Infrastructure & Buildings</h4>
                    <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                      <table className="wizard-data-table w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <th className="p-3">Building Type</th>
                            <th className="p-3 w-24">Number</th>
                            <th className="p-3 w-32">Total Floor Area (m2)</th>
                            <th className="p-3 w-60 text-center">Ownership (Select Checkboxes)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.infrastructure_buildings.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/40">
                              <td className="p-3 text-slate-800 font-semibold">{row.type}</td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.count}
                                  onChange={(e) => handleTableInputChange(e, idx, "infrastructure_buildings", "count")}
                                  placeholder="Count"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.area}
                                  onChange={(e) => handleTableInputChange(e, idx, "infrastructure_buildings", "area")}
                                  placeholder="Area in m2"
                                />
                              </td>
                              <td className="p-2">
                                <div className="flex justify-center gap-4">
                                  <label className="flex items-center gap-1.5 text-xs m-0 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={row.ownership.owned}
                                      onChange={() => handleBuildingCheckboxChange(idx, "owned")}
                                      className="accent-indigo-600 h-3.5 w-3.5"
                                    />
                                    Owned
                                  </label>
                                  <label className="flex items-center gap-1.5 text-xs m-0 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={row.ownership.leased}
                                      onChange={() => handleBuildingCheckboxChange(idx, "leased")}
                                      className="accent-indigo-600 h-3.5 w-3.5"
                                    />
                                    Leased
                                  </label>
                                  <label className="flex items-center gap-1.5 text-xs m-0 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={row.ownership.hired}
                                      onChange={() => handleBuildingCheckboxChange(idx, "hired")}
                                      className="accent-indigo-600 h-3.5 w-3.5"
                                    />
                                    Hired
                                  </label>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Equipment, Furniture & Tools */}
                  <div className="section-divider mt-6 mb-4">Equipment, Furniture, Tools, & Audio-visual Aids</div>
                  <div className="form-group full-width">
                    <label>Briefly List/Describe Key Equipment & Tools</label>
                    <textarea
                      name="equipment_desc"
                      value={formData.equipment_desc}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Summary list of training tools, AV aids, computers..."
                    />
                  </div>
                  <div className="full-width">
                    {renderFileInput(
                      "Upload detailed inventory files (CSV / PDF lists of equipment)",
                      "equipment_list_file",
                      formData.equipment_list_file
                    )}
                  </div>

                  {/* Information Resources */}
                  <div className="section-divider mt-6 mb-4">Information Resources (Library)</div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Total Book Count</label>
                      <input
                        type="number"
                        name="info_books_count"
                        value={formData.info_books_count}
                        onChange={handleChange}
                        placeholder="Number of volumes"
                      />
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>Subscribed Journals List</label>
                    <textarea
                      name="info_journals_list"
                      value={formData.info_journals_list}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Detail printed or electronic journal subscriptions..."
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Available Library Services</label>
                    <div className="grid grid-cols-2 gap-4 border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          name="info_has_internet"
                          checked={formData.info_has_internet}
                          onChange={handleChange}
                          className="h-4 w-4 accent-indigo-600"
                        />
                        High-Speed Internet Access available in Library
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          name="info_has_cdroms"
                          checked={formData.info_has_cdroms}
                          onChange={handleChange}
                          className="h-4 w-4 accent-indigo-600"
                        />
                        CD ROMS & Electronic Databanks available
                      </label>
                    </div>
                  </div>

                  {/* Services Matrix Table */}
                  <div className="form-group full-width mt-6">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">Utilities & Services Matrix</h4>
                    <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                      <table className="wizard-data-table w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <th className="p-3">Service Type</th>
                            <th className="p-3 w-32 text-center">Internal</th>
                            <th className="p-3 w-32 text-center">External</th>
                            <th className="p-3">Service Provider details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(formData.services_matrix).map((key) => (
                            <tr key={key} className="border-b border-slate-100 hover:bg-slate-50/40">
                              <td className="p-3 text-slate-800 font-semibold capitalize">
                                {key.replace("_", " ")}
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={formData.services_matrix[key].internal}
                                  onChange={(e) =>
                                    handleNestedDoubleChange(e, "services_matrix", key, "internal")
                                  }
                                  className="accent-indigo-600 h-4 w-4"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={formData.services_matrix[key].external}
                                  onChange={(e) =>
                                    handleNestedDoubleChange(e, "services_matrix", key, "external")
                                  }
                                  className="accent-indigo-600 h-4 w-4"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={formData.services_matrix[key].provider}
                                  onChange={(e) =>
                                    handleNestedDoubleChange(e, "services_matrix", key, "provider")
                                  }
                                  placeholder="e.g. TANESCO, DAWASA, Secure Ltd"
                                  className="w-full"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 6: FUNDING */}
              {currentStage === 6 && (
                <div className="form-stage">
                  <h3>Section 5: Funding & Finances</h3>

                  {/* Expenditure Grid */}
                  <div className="form-group full-width mt-4">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">
                      Annual Expenditure (Past 3 Years)
                    </h4>
                    <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                      <table className="wizard-data-table w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <th className="p-3 w-36">Year</th>
                            <th className="p-3">Recurrent Expenditure (TZS)</th>
                            <th className="p-3">Capital / Development (TZS)</th>
                            <th className="p-3">Total Expenditure (TZS)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.past_expenditures.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/40">
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.year}
                                  onChange={(e) => handleTableInputChange(e, idx, "past_expenditures", "year")}
                                  placeholder="e.g. 2024"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.recurrent}
                                  onChange={(e) => handleTableInputChange(e, idx, "past_expenditures", "recurrent")}
                                  placeholder="TZS"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.capital}
                                  onChange={(e) => handleTableInputChange(e, idx, "past_expenditures", "capital")}
                                  placeholder="TZS"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.total}
                                  onChange={(e) => handleTableInputChange(e, idx, "past_expenditures", "total")}
                                  placeholder="TZS"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Budgetary Grid */}
                  <div className="form-group full-width mt-6">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">
                      Annual Budgetary Requirements (Current + Next 3 Years)
                    </h4>
                    <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                      <table className="wizard-data-table w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <th className="p-3 w-48">Year</th>
                            <th className="p-3">Recurrent (TZS)</th>
                            <th className="p-3">Capital / Development (TZS)</th>
                            <th className="p-3">Total Required (TZS)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.budgetary_requirements.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/40">
                              <td className="p-3 text-slate-800 font-semibold">{row.year}</td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.recurrent}
                                  onChange={(e) => handleTableInputChange(e, idx, "budgetary_requirements", "recurrent")}
                                  placeholder="TZS"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.capital}
                                  onChange={(e) => handleTableInputChange(e, idx, "budgetary_requirements", "capital")}
                                  placeholder="TZS"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.total}
                                  onChange={(e) => handleTableInputChange(e, idx, "budgetary_requirements", "total")}
                                  placeholder="TZS"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Sources of Funds */}
                  <div className="form-group full-width mt-6">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">Sources of Funds & Proofs</h4>
                    <div className="flex flex-col gap-4 border border-slate-200 rounded-xl p-4 bg-slate-50/20">
                      {Object.keys(formData.funds_sources).map((key) => (
                        <div key={key} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            <label className="flex items-center gap-2 text-xs font-bold capitalize m-0 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.funds_sources[key].checked}
                                onChange={(e) =>
                                  handleNestedDoubleChange(e, "funds_sources", key, "checked")
                                }
                                className="h-4 w-4 accent-indigo-600"
                              />
                              {key} Source
                            </label>
                            <input
                              type="text"
                              value={formData.funds_sources[key].detail}
                              onChange={(e) =>
                                handleNestedDoubleChange(e, "funds_sources", key, "detail")
                              }
                              placeholder={`Detail support of ${key} financing...`}
                              className="flex-1 text-xs py-1.5 px-2.5 max-w-lg"
                              disabled={!formData.funds_sources[key].checked}
                            />
                            <div className="w-64">
                              {renderFileInput(
                                "Proof Document",
                                `funds_sources.${key}.file`,
                                formData.funds_sources[key].file
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fee Structure Grid */}
                  <div className="form-group full-width mt-6">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">Complete Fee Structure</h4>
                    <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                      <table className="wizard-data-table w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <th className="p-3">Fee Type</th>
                            <th className="p-3">Year 1 Fee (TZS)</th>
                            <th className="p-3">Subsequent Years Fee (TZS)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.fee_structure.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/40">
                              <td className="p-3 text-slate-800 font-semibold">{row.type}</td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.year1}
                                  onChange={(e) => handleTableInputChange(e, idx, "fee_structure", "year1")}
                                  placeholder="TZS"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.subsequent}
                                  onChange={(e) => handleTableInputChange(e, idx, "fee_structure", "subsequent")}
                                  placeholder="TZS"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 7: LONG TERM PLANS */}
              {currentStage === 7 && (
                <div className="form-stage">
                  <h3>Section 6: Long-term Plans</h3>

                  {/* Student Intake Projections */}
                  <div className="form-group full-width mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-bold text-slate-900 m-0">Student Intake Projections</h4>
                      <button
                        type="button"
                        onClick={() =>
                          addTableRow("student_intake_projections", {
                            award_type: "",
                            prev_year: "",
                            current_year: "",
                            after_5: "",
                            after_10: ""
                          })
                        }
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold border border-indigo-200 rounded-lg px-3 py-1.5"
                      >
                        <Plus size={14} /> Add Projections
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                      <table className="wizard-data-table w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <th className="p-3">Award Group Type</th>
                            <th className="p-3 w-32">Previous Year</th>
                            <th className="p-3 w-32">Current Year</th>
                            <th className="p-3 w-32">After 5 Years</th>
                            <th className="p-3 w-32">After 10 Years</th>
                            <th className="p-3 w-12 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.student_intake_projections.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/40">
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.award_type}
                                  onChange={(e) => handleTableInputChange(e, idx, "student_intake_projections", "award_type")}
                                  placeholder="Award level group"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.prev_year}
                                  onChange={(e) => handleTableInputChange(e, idx, "student_intake_projections", "prev_year")}
                                  placeholder="Intake"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.current_year}
                                  onChange={(e) => handleTableInputChange(e, idx, "student_intake_projections", "current_year")}
                                  placeholder="Intake"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.after_5}
                                  onChange={(e) => handleTableInputChange(e, idx, "student_intake_projections", "after_5")}
                                  placeholder="Intake"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.after_10}
                                  onChange={(e) => handleTableInputChange(e, idx, "student_intake_projections", "after_10")}
                                  placeholder="Intake"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeTableRow(idx, "student_intake_projections")}
                                  className="text-rose-500 hover:text-rose-700 p-1"
                                  disabled={formData.student_intake_projections.length <= 1}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Projected Ratios Grid */}
                  <div className="section-divider mt-6 mb-4">Projected Resource Ratios</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Target Support Staff to Student Ratio</label>
                      <input
                        type="text"
                        value={formData.projected_ratios.support_staff_student}
                        onChange={(e) => handleNestedChange(e, "projected_ratios", "support_staff_student")}
                        placeholder="e.g. 1:40"
                      />
                    </div>
                    <div className="form-group">
                      <label>Target Expert Staff to Student Ratio</label>
                      <input
                        type="text"
                        value={formData.projected_ratios.expert_staff_student}
                        onChange={(e) => handleNestedChange(e, "projected_ratios", "expert_staff_student")}
                        placeholder="e.g. 1:15"
                      />
                    </div>
                  </div>

                  {/* Physical Area Projections Grid */}
                  <div className="form-group full-width mt-6">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">
                      Physical Facilities Area Projections
                    </h4>
                    <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                      <table className="wizard-data-table w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <th className="p-3">Building Type</th>
                            <th className="p-3">Current Area (m2)</th>
                            <th className="p-3">Target projected Area (m2)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.facilities_area_projections.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/40">
                              <td className="p-3 text-slate-800 font-semibold">{row.type}</td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.current}
                                  onChange={(e) => handleTableInputChange(e, idx, "facilities_area_projections", "current")}
                                  placeholder="Area in m2"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.target}
                                  onChange={(e) => handleTableInputChange(e, idx, "facilities_area_projections", "target")}
                                  placeholder="Area in m2"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Document uploads */}
                  <div className="section-divider mt-6 mb-4">Strategic & Master Plan Documents</div>
                  <div className="form-row">
                    <div className="form-group">
                      {renderFileInput("Strategic Plan File", "strategic_plan_file", formData.strategic_plan_file)}
                    </div>
                    <div className="form-group">
                      {renderFileInput("Physical Master Plan File", "master_plan_file", formData.master_plan_file)}
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 8: DECLARATIONS & WITNESS CONFIRMATION */}
              {currentStage === 8 && (
                <div className="form-stage">
                  <h3>Section 7 & 8: Declaration and Witness Confirmation</h3>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 mb-6 text-xs text-slate-600 leading-relaxed">
                    <p className="font-bold text-slate-900 text-sm mb-2">Applicant Declaration</p>
                    I hereby declare that the particulars given in this application form are true and accurate to the best of my knowledge. I understand that any false or misleading declaration will lead to immediate rejection of the registration application or revocation of any licenses issued.
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Applicant Full Name *</label>
                      <input
                        type="text"
                        name="applicant_name"
                        value={formData.applicant_name}
                        onChange={handleChange}
                        className={errors.applicant_name ? "error" : ""}
                        placeholder="Authorized Signee Full Name"
                      />
                      {errors.applicant_name && <span className="error-message">{errors.applicant_name}</span>}
                    </div>

                    <div className="form-group">
                      <label>Applicant Designation *</label>
                      <input
                        type="text"
                        name="applicant_designation"
                        value={formData.applicant_designation}
                        onChange={handleChange}
                        className={errors.applicant_designation ? "error" : ""}
                        placeholder="e.g. Director, Executive Secretary"
                      />
                      {errors.applicant_designation && <span className="error-message">{errors.applicant_designation}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Date of Signature *</label>
                      <input
                        type="date"
                        name="applicant_date"
                        value={formData.applicant_date}
                        onChange={handleChange}
                        className={errors.applicant_date ? "error" : ""}
                      />
                      {errors.applicant_date && <span className="error-message">{errors.applicant_date}</span>}
                    </div>
                  </div>

                  <div className="form-row mt-4">
                    <div className="form-group">
                      {renderFileInput(
                        "Upload Signature Image / E-Signature *",
                        "applicant_signature",
                        formData.applicant_signature
                      )}
                    </div>
                    <div className="form-group">
                      {renderFileInput(
                        "Attach Official Institution Stamp / Seal",
                        "official_stamp_file",
                        formData.official_stamp_file
                      )}
                    </div>
                  </div>

                  {/* Witness block */}
                  <div className="section-divider mt-8 mb-4">Section 8: Witness Confirmation</div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 mb-6 text-xs text-slate-600 leading-relaxed">
                    <p className="font-bold text-slate-900 text-sm mb-2">Witness Confirmation</p>
                    Confirmation under Oath before a Commissioner of Oaths / Magistrate / Advocate.
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Applicant Name (Under Witness)</label>
                      <input
                        type="text"
                        name="witness_applicant_name"
                        value={formData.witness_applicant_name}
                        onChange={handleChange}
                        placeholder="Applicant Name"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Witness Confirmation Day</label>
                      <input
                        type="number"
                        name="witness_date_day"
                        value={formData.witness_date_day}
                        onChange={handleChange}
                        placeholder="Day of Month (e.g. 13)"
                      />
                    </div>
                    <div className="form-group">
                      <label>Witness Confirmation Month</label>
                      <input
                        type="text"
                        name="witness_date_month"
                        value={formData.witness_date_month}
                        onChange={handleChange}
                        placeholder="Month (e.g. June)"
                      />
                    </div>
                    <div className="form-group">
                      <label>Witness Confirmation Year</label>
                      <input
                        type="number"
                        name="witness_date_year"
                        value={formData.witness_date_year}
                        onChange={handleChange}
                        placeholder="Year (e.g. 2026)"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Witness Full Name *</label>
                      <input
                        type="text"
                        name="witness_name"
                        value={formData.witness_name}
                        onChange={handleChange}
                        className={errors.witness_name ? "error" : ""}
                        placeholder="Advocate / Magistrate / Commissioner of Oaths"
                      />
                      {errors.witness_name && <span className="error-message">{errors.witness_name}</span>}
                    </div>

                    <div className="form-group">
                      <label>Commissioner of Oath details</label>
                      <input
                        type="text"
                        name="witness_commissioner_details"
                        value={formData.witness_commissioner_details}
                        onChange={handleChange}
                        placeholder="Judicial title / designation details"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Witness Office Address</label>
                      <input
                        type="text"
                        name="witness_address"
                        value={formData.witness_address}
                        onChange={handleChange}
                        placeholder="Witness Full address"
                      />
                    </div>
                    <div className="form-group">
                      <label>Witness Signed Date</label>
                      <input
                        type="date"
                        name="witness_date_signed"
                        value={formData.witness_date_signed}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STICKY BOTTOM ACTION NAVIGATION BAR */}
              <div className="form-navigation-sticky bg-white border-t border-slate-200 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-xs font-bold text-slate-500">
                  Step {currentStage} of 8 ({Math.round(progressPercent)}% Done)
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  {currentStage > 1 && (
                    <button
                      type="button"
                      className="btn-back flex-1 md:flex-none flex items-center justify-center gap-2"
                      onClick={handleBack}
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn-save-draft flex-1 md:flex-none flex items-center justify-center gap-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-wider"
                    onClick={() => saveForm(true)}
                    disabled={loading}
                  >
                    Save Draft
                  </button>

                  {currentStage < 8 ? (
                    <button
                      type="button"
                      className="btn-next flex-1 md:flex-none flex items-center justify-center gap-2"
                      onClick={handleNext}
                    >
                      Next <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn-submit flex-1 md:flex-none flex items-center justify-center gap-2"
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit Registration Form"}
                    </button>
                  )}
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
