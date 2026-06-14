import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Save } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import "../styles/HardcopyInspectionForm.css";

const infrastructureRows = [
  "Offices",
  "Classrooms",
  "Laboratories",
  "Workshops",
  "Dormitories",
  "Assembly halls",
  "Libraries",
  "Cafeterias (students)",
  "Canteen (staff)",
  "Staff quarters",
  "Bookshops",
  "Equipment and Tools (Computers)",
  "Equipment / Tools (Other specific)",
  "Furniture",
  "Audio Visual Aids",
  "Library books",
  "Library journals",
];

const buildingDocuments = [
  "Building permit",
  "Land-use plan",
  "Certificate of Occupancy",
  "Health certificate",
  "Certificate of Conformity with fire regulation",
];

const rubricSections = [
  {
    id: "infrastructure",
    title: "Section 1: Infrastructures / Buildings",
    question: "1.3 Suitability of infrastructure listed for the purpose of intended training",
    maxScore: 7,
    options: [
      [7, "Available, conveniently located, adequate and in excellent condition"],
      [6, "Available, conveniently located, adequate and in good condition"],
      [5, "Available, conveniently located, in good condition but not adequate"],
      [4, "Available, adequate, in good condition but not conveniently located"],
      [3, "Available, in good condition but not adequate, and not conveniently located"],
      [2, "Available, inadequate and in poor condition"],
      [1, "Available, inadequate and in pathetic condition"],
      [0, "Not available"],
    ],
  },
  {
    id: "equipment",
    title: "Section 2: Equipment",
    question: "2.1 Adequacy of equipment for the purpose of training",
    maxScore: 6,
    options: [
      [6, "Available, sufficient and in excellent working condition"],
      [5, "Available, sufficient and in good working condition"],
      [4, "Available, insufficient but in good working condition"],
      [3, "Available, sufficient but in poor working condition"],
      [2, "Available, insufficient and in poor working condition"],
      [1, "Available, insufficient and in pathetic working condition"],
      [0, "Not available"],
    ],
  },
  {
    id: "teachingStaff",
    title: "Section 3: Qualified Teaching Staff",
    question: "3.1 Adequacy of qualified teaching staff for training as evidenced from CVs, certificates and terms of employment",
    maxScore: 7,
    options: [
      [7, "Number of staff is adequate with at least 75% having relevant qualifications that are above the level of the intended programme"],
      [6, "Number of staff is adequate with at least 50% having relevant qualifications that are above the level of the intended programme"],
      [5, "Number of staff is inadequate but at least 50% have relevant qualifications that are above the level of the intended programme"],
      [4, "Number of staff is adequate but at least 33% have relevant qualifications and above the level of the intended programme"],
      [3, "Number of staff is adequate but at least 33% have relevant qualifications and at the same level of the intended programme"],
      [2, "Number of staff is inadequate and at least 50% have irrelevant qualifications that are above the level of the intended programme"],
      [1, "Number of staff is inadequate and at least 50% have irrelevant qualifications that are at the same level of the intended programme"],
      [0, "Number of staff is inadequate and less than 33% have relevant qualifications that are either below or at the same level of the intended programme"],
    ],
  },
  {
    id: "curricula",
    title: "Section 4: Curricula",
    question: "4.1 Adequacy of curricula for the purpose of training",
    maxScore: 7,
    options: [
      [7, "Curricula follow NTA system, have been validated by NACTE within 5 years and the institution has implemented them for at least one year"],
      [6, "Curricula follow NTA system, have been validated by NACTE within 5 years but the institution has not started implementing them"],
      [5, "Curricula do not follow NTA system but have standard formats, are up-to-date within 5 years and training programmes implemented for at least 1 year"],
      [4, "Curricula follow NTA system, have been validated by NACTE but are outdated and training programmes implemented for at least 1 year"],
      [3, "Curricula do not follow NTA system but have standard formats and are up-to-date, but implementation has not started"],
      [2, "Curricula do not follow NTA system and have sub-standard formats but are up-to-date and implemented for at least 1 year"],
      [1, "Curricula do not follow NTA system and have sub-standard formats but are up-to-date, and implementation has not started"],
      [0, "Curricula do not follow NTA system and are outdated or curricula are not available"],
    ],
  },
  {
    id: "funding",
    title: "Section 5: Level of Funding",
    question: "5.1 Adequacy of the level of funding for the purpose of training",
    maxScore: 6,
    options: [
      [6, "Institution has sources of funds other than student fees and its financial trend of at least 3 years increasing"],
      [5, "Institution does not have sources of funds other than student fees and its financial trend of at least 3 years increasing"],
      [4, "Institution has a constant financial trend for at least 3 years"],
      [3, "Institution has funds enough for at least one academic year"],
      [2, "Financial trend cannot be determined but its potentiality for raising funds can be identified"],
      [1, "Institutional level of funding for at least 3 years declines significantly"],
      [0, "No evidence of availability of funds for training purposes"],
    ],
  },
  {
    id: "governance",
    title: "Section 6: Institutional Governance",
    question: "6.1 Appropriateness of institutional governance for the purpose of training",
    maxScore: 3,
    options: [
      [3, "The institution has a Board of Governors or Council or Advisory Board and the organisation structure is supported by CEO with appropriate qualifications"],
      [2, "The institution does not have a Board of Governors or Council or Advisory Board but has the organisation structure supported by CEO with appropriate qualifications"],
      [1, "The institution has a Board of Governors or Council or Advisory Board but its organisation structure is supported by CEO without appropriate qualifications"],
      [1, "The institution has neither a Board of Governors nor Council nor Advisory Board nor organisation structure but has a CEO with appropriate qualifications"],
      [0, "The institution has neither a Board of Governors nor Council nor Advisory Board nor organisation structure and has a CEO without appropriate qualifications"],
    ],
  },
  {
    id: "structureDuration",
    title: "Section 7: Structure and Duration of Training",
    question: "7.1 Adequacy of the structure and duration of training",
    maxScore: 4,
    options: [
      [4, "The structure includes appropriate facilities for practical training and allocates acceptable proportions of time for knowledge and provides an environment for building the required attitude"],
      [3, "The structure includes appropriate facilities for practical training and allocates acceptable proportions of time for knowledge but does not provide adequate environment for building the required attitude"],
      [2, "The structure includes appropriate facilities for practical training but does not allocate acceptable proportions of time for knowledge"],
      [1, "The structure does not include appropriate facilities for practical training but allocates acceptable proportions of time for knowledge"],
    ],
  },
  {
    id: "assessment",
    title: "Section 8: Assessment and Examination Procedures",
    question: "8.1 Appropriateness of assessment and examination procedures for the type of training",
    maxScore: 4,
    options: [
      [4, "Assessment and examinations are nationally recognized and/or externally examined by recognized institution(s)"],
      [3, "Assessment and examinations are nationally recognized but not externally examined by recognized institution(s)"],
      [2, "Assessment and examinations are not recognized nationally but are externally examined by recognized institution(s)"],
      [1, "Assessment and examinations are neither nationally recognized nor externally examined by recognized institution(s)"],
      [0, "Assessment and examinations procedure does not exist"],
    ],
  },
  {
    id: "supportServices",
    title: "Section 9: Support Services",
    question: "9.1 Adequacy of the support services for training",
    maxScore: 3,
    options: [
      [3, "Basic support services are available, adequate and up to standard"],
      [2, "Basic support services are available, up to standard but inadequate"],
      [1, "Basic support services are available, adequate but not up to standard"],
      [0, "Basic support services not available / not indicated"],
    ],
  },
  {
    id: "longTermPlans",
    title: "Section 10: Long Term Plans",
    question: "10.1 Adequacy of the long-term / strategic plans for training projections",
    maxScore: 3,
    options: [
      [3, "Long term / strategic plans in support of training exist and are documented"],
      [2, "Long term plans in support of training exist but not documented"],
      [1, "Long term plans exist, documented but partially address the training function"],
      [0, "Long term plans on training functions do not exist"],
    ],
  },
];

const createInitialInfrastructure = () =>
  infrastructureRows.reduce((acc, name) => {
    acc[name] = {
      provided: "",
      verified: "",
      functioning: "",
      quality: "",
      remarks: "",
    };
    return acc;
  }, {});

const createInitialDocuments = () =>
  buildingDocuments.reduce((acc, name) => {
    acc[name] = "";
    return acc;
  }, {});

const createInitialRubric = () =>
  rubricSections.reduce((acc, section) => {
    acc[section.id] = {
      score: "",
      answer: "",
      comments: "",
    };
    return acc;
  }, {});

export default function HardcopyInspectionForm() {
  const [inspections, setInspections] = useState([]);
  const [selectedInspection, setSelectedInspection] = useState("");
  const [loadingInspections, setLoadingInspections] = useState(true);
  const [institutionDetails, setInstitutionDetails] = useState({
    name: "",
    location: "",
    district: "",
    plot: "",
    address: "",
    phone: "",
    fax: "",
    email: "",
    webpage: "",
  });
  const [infrastructure, setInfrastructure] = useState(createInitialInfrastructure);
  const [documents, setDocuments] = useState(createInitialDocuments);
  const [rubric, setRubric] = useState(createInitialRubric);
  const [teamLeader, setTeamLeader] = useState("");
  const [signature, setSignature] = useState("");
  const [signatureDate, setSignatureDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    setLoadingInspections(true);
    try {
      const response = await api.get("/management/inspections/");
      setInspections(response.data || []);
    } catch (error) {
      console.error("Inspection fetch error", error);
      setError("Unable to load scheduled inspections. Please ensure you are assigned to an inspection team.");
    } finally {
      setLoadingInspections(false);
    }
  };

  const totalScore = useMemo(
    () =>
      rubricSections.reduce((total, section) => {
        const value = rubric[section.id]?.score;
        return total + (value === "" ? 0 : Number(value));
      }, 0),
    [rubric]
  );

  const answeredCount = useMemo(
    () => rubricSections.filter((section) => rubric[section.id]?.score !== "").length,
    [rubric]
  );

  const averageScore = answeredCount ? (totalScore / answeredCount).toFixed(2) : "0.00";

  useEffect(() => {
    if (selectedInspection) {
      const insp = inspections.find((i) => String(i.id) === String(selectedInspection));
      if (insp && insp.institution) {
        // ── Populate institution particulars ──────────────────────────
        setInstitutionDetails({
          name:     insp.institution.name || "",
          location: insp.institution.location || insp.institution.city || insp.institution.region || "",
          district: insp.institution.district || "",
          plot:     insp.institution.plot || insp.institution.ward || insp.institution.street || "",
          address:  insp.institution.address || insp.institution.street_address || "",
          phone:    insp.institution.phone || insp.institution.principal_phone || "",
          fax:      insp.institution.fax || "",
          email:    insp.institution.email || "",
          webpage:  insp.institution.webpage || "",
        });

        // ── Pre-fill infrastructure table from applicant's REG-01 data ─
        const regData = insp.application_data?.registration_data || {};
        const appBuildings = regData.infrastructure_buildings || [];

        setInfrastructure((current) => {
          const updated = { ...current };
          const normalize = (s) => s?.toLowerCase().replace(/\s+/g, " ").trim();

          // 1. Map infrastructure_buildings (7 types from REG-01 Step 5)
          appBuildings.forEach((b) => {
            const normType = normalize(b.type);
            const matchedKey = Object.keys(updated).find((k) => normalize(k) === normType);
            if (matchedKey) {
              updated[matchedKey] = {
                ...updated[matchedKey],
                provided: b.count !== undefined && b.count !== "" ? String(b.count) : "",
              };
            }
          });

          // 2. Map Library books count from info_books_count
          if (regData.info_books_count !== undefined && regData.info_books_count !== "") {
            updated["Library books"] = {
              ...updated["Library books"],
              provided: String(regData.info_books_count),
            };
          }

          // 3. Map equipment_desc into remarks for Equipment rows
          if (regData.equipment_desc) {
            const short = regData.equipment_desc.slice(0, 60);
            updated["Equipment and Tools (Computers)"] = {
              ...updated["Equipment and Tools (Computers)"],
              remarks: short,
            };
            updated["Equipment / Tools (Other specific)"] = {
              ...updated["Equipment / Tools (Other specific)"],
              remarks: short,
            };
          }

          // 4. Map journals list count hint to Library journals
          if (regData.info_journals_list && regData.info_journals_list !== "") {
            updated["Library journals"] = {
              ...updated["Library journals"],
              remarks: regData.info_journals_list.slice(0, 60),
            };
          }

          return updated;
        });
      } else if (insp && !insp.institution) {
        // Institution data not linked — leave fields editable but warn
        setError("Institution details could not be fetched for this inspection. Please fill them in manually.");
        setInstitutionDetails({
          name: "", location: "", district: "", plot: "",
          address: "", phone: "", fax: "", email: "", webpage: "",
        });
      }
    } else {
      setInstitutionDetails({
        name: "", location: "", district: "", plot: "",
        address: "", phone: "", fax: "", email: "", webpage: "",
      });
      setInfrastructure(createInitialInfrastructure());
    }
  }, [selectedInspection, inspections]);


  const handleInstitutionChange = (event) => {
    const { name, value } = event.target;
    setInstitutionDetails((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleInfrastructureChange = (row, field, value) => {
    setInfrastructure((current) => ({
      ...current,
      [row]: {
        ...current[row],
        [field]: value,
      },
    }));
  };

  const handleDocumentChange = (name, value) => {
    setDocuments((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleRubricSelect = (section, score, answer) => {
    setRubric((current) => ({
      ...current,
      [section.id]: {
        ...current[section.id],
        score,
        answer,
      },
    }));
  };

  const handleCommentChange = (sectionId, value) => {
    setRubric((current) => ({
      ...current,
      [sectionId]: {
        ...current[sectionId],
        comments: value,
      },
    }));
  };

  const buildPayload = () => {
    const infrastructureAnswer = {
      institutionDetails,
      infrastructure,
      documents,
      teamLeader,
      signature,
      signatureDate,
    };

    return {
      inspection: selectedInspection,
      form_name: "Inspection Form for Technical Training Institutions",
      version: "Revised April 2012",
      total_score: totalScore,
      average_score: averageScore,
      overall_remarks: `Total score: ${totalScore}; Average score: ${averageScore}; Team leader: ${teamLeader || "Not indicated"}; Signature: ${signature || "Not indicated"}`,
      responses: [
        {
          question_text: "1.1 Infrastructure verification and particulars of the training institution",
          expected_answer: "Record provided, verified, functioning, quality and remarks for each infrastructure item.",
          actual_answer: JSON.stringify(infrastructureAnswer),
          comments: "Captured from the first page of the hardcopy inspection form.",
          score: 0,
        },
        ...rubricSections.map((section) => ({
          question_text: section.question,
          expected_answer: `Maximum score: ${section.maxScore}`,
          actual_answer: rubric[section.id].answer,
          comments: rubric[section.id].comments,
          score: rubric[section.id].score,
        })),
      ],
    };
  };

  const handleSubmit = async () => {
    setMessage("");
    setError("");

    if (!selectedInspection) {
      setError("Choose the inspection record first.");
      return;
    }

    if (answeredCount !== rubricSections.length) {
      setError("Select one score in every scored section.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/management/inspection-responses/", buildPayload());
      setMessage("Inspection saved. Scores and comments were recorded.");
      fetchInspections();
      setCurrentStep(1);
      setSelectedInspection("");
    } catch (error) {
      console.error("Inspection save error", error);
      const data = error.response?.data;
      const msg =
        data?.error ||
        data?.detail ||
        data?.responses ||
        data?.inspection ||
        (typeof data === "string" ? data.slice(0, 200) : null) ||
        `Save failed (HTTP ${error.response?.status ?? "network error"})`;
      setError(msg);
    } finally {
      setSaving(false);
    }
  };


  const nextStep = () => {
    setError("");
    setMessage("");
    if (currentStep === 1) {
      if (!selectedInspection) {
        setError("Choose the inspection record first.");
        return;
      }
      if (!institutionDetails.name) {
        setError("Institution name is required.");
        return;
      }
    } else if (currentStep === 3) {
      if (answeredCount !== rubricSections.length) {
        setError(`Please score all rubric sections. You have scored ${answeredCount} out of ${rubricSections.length}.`);
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setError("");
    setMessage("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-slate-50 text-slate-900">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="inspection-page">
          {(message || error) && (
            <div className={`mb-4 rounded-2xl px-4 py-3 text-sm font-semibold ${error ? "bg-rose-100 text-rose-900" : "bg-emerald-100 text-emerald-900"}`}>
              {error || message}
            </div>
          )}

          <div className="inspection-panel overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-xl">
            <div className="inspection-document-head">
              <p className="inspection-revised">Revised April 2012</p>
              <h1>THE NATIONAL COUNCIL FOR TECHNICAL EDUCATION<br />(NACTE)</h1>
              <h2>INSPECTION FORM FOR TECHNICAL TRAINING INSTITUTIONS</h2>
              <p>(To be used in conjunction with NACTE FORM REG-01-part B section 2)</p>
            </div>

            {/* Step Progress Bar */}
            <div className="border-b border-slate-100 bg-slate-50/50 p-6">
              <div className="mx-auto flex max-w-3xl items-center justify-between">
                {[
                  { step: 1, label: "Institution" },
                  { step: 2, label: "Infrastructure" },
                  { step: 3, label: "Rubrics" },
                  { step: 4, label: "Submit" },
                ].map(({ step, label }) => {
                  const isActive = currentStep === step;
                  const isCompleted = currentStep > step;
                  return (
                    <button
                      key={step}
                      type="button"
                      onClick={() => {
                        if (
                          step < currentStep ||
                          (step === 2 && selectedInspection && institutionDetails.name) ||
                          (step === 3 && selectedInspection && institutionDetails.name) ||
                          (step === 4 && answeredCount === rubricSections.length)
                        ) {
                          setCurrentStep(step);
                          setError("");
                          setMessage("");
                        }
                      }}
                      className="flex flex-col items-center flex-1 relative group focus:outline-none cursor-pointer"
                    >
                      <div className="flex items-center w-full">
                        {step > 1 && (
                          <div className={`h-[2px] w-full transition-colors duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                        )}
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm border-2 transition-all duration-300 ${
                          isActive 
                            ? 'bg-brand-600 border-brand-600 text-white ring-4 ring-brand-100' 
                            : isCompleted 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'bg-white border-slate-200 text-slate-400'
                        }`}>
                          {step}
                        </div>
                        {step < 4 && (
                          <div className={`h-[2px] w-full transition-colors duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                        )}
                      </div>
                      <span className={`mt-2 text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-brand-600 font-bold' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="inspection-body">
              {currentStep === 1 && (
                <>
                  <div className="inspection-toolbar rounded-3xl border border-brand-50 bg-brand-50/20 p-5 mb-6">
                    <div className="inspection-field">
                      <label>Inspection record</label>
                      <select value={selectedInspection} onChange={(event) => setSelectedInspection(event.target.value)}>
                        <option value="">{loadingInspections ? 'Loading inspections...' : inspections.length === 0 ? 'No inspections assigned to you' : 'Select scheduled inspection'}</option>
                        {inspections.map((inspection) => (
                          <option key={inspection.id} value={inspection.id}>
                            {inspection.application_reference} - {inspection.scheduled_date} - {inspection.status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="inspection-field">
                      <label>Physical verification team leader</label>
                      <input
                        value={teamLeader}
                        onChange={(event) => setTeamLeader(event.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                  </div>

                   {/* Pre-filled info banner */}
                  {selectedInspection && (() => {
                    const insp = inspections.find((i) => String(i.id) === String(selectedInspection));
                    return insp?.institution ? (
                      <div className="mb-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        <span className="mt-0.5 text-lg">✅</span>
                        <div>
                          <p className="font-semibold">Institution details pre-filled from applicant's submission</p>
                          <p className="mt-0.5 text-emerald-700">Fields below are auto-populated from the REG-01 form. You may edit them if the on-site details differ from what was declared.</p>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Application summary card */}
                  {selectedInspection && (() => {
                    const insp = inspections.find((i) => String(i.id) === String(selectedInspection));
                    const appData = insp?.application_data;
                    const reg = appData?.registration_data || {};
                    if (!appData) return null;
                    return (
                      <section className="inspection-section paper-section mb-4">
                        <h2 className="paper-section-title">Application Details</h2>
                        <div className="paper-details-grid">
                          {[
                            ["Reference Number", appData.reference_number],
                            ["Application Type", appData.application_type],
                            ["Category", appData.category],
                            ["Programs Requested", appData.programs_requested || reg.programs_offered || "—"],
                            ["Expected Students", appData.expected_students ?? "—"],
                            ["Preferred Inspection Date", appData.preferred_inspection_date || "—"],
                            ["Ownership Type", reg.ownership_type || "—"],
                            ["Years in Operation", insp?.institution?.years_operation ?? "—"],
                            ["Total Students", insp?.institution?.total_students ?? "—"],
                            ["Total Staff", insp?.institution?.total_staff ?? "—"],
                            ["Principal", insp?.institution?.principal_name || "—"],
                            ["Institution Owner", insp?.institution?.institution_owner || "—"],
                          ].map(([lbl, val]) => (
                            <div className="inspection-field" key={lbl}>
                              <label>{lbl}</label>
                              <input readOnly value={val ?? ""} style={{ background: "#f8fafc", color: "#475569", cursor: "default" }} />
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  })()}

                  <section className="inspection-section paper-section">
                    <h2 className="paper-section-title">Particulars of the Training Institution</h2>
                    <div className="inspection-question">
                      <div className="paper-details-grid">
                        {[
                          ["name", "Name of the institution"],
                          ["location", "Location"],
                          ["district", "District or municipal"],
                          ["plot", "Plot number or village"],
                          ["address", "Address"],
                          ["phone", "Phone"],
                          ["fax", "Fax"],
                          ["email", "E-mail"],
                          ["webpage", "Webpage"],
                        ].map(([name, label]) => (
                          <div className="inspection-field" key={name}>
                            <label>{label}</label>
                            <input name={name} value={institutionDetails[name]} onChange={handleInstitutionChange} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <section className="inspection-section paper-section">
                    <h2 className="paper-section-title">Section 1: Infrastructures / Buildings</h2>
                    <h3 className="paper-question-title">1.1 Infrastructure verification</h3>
                    {selectedInspection && (() => {
                      const insp = inspections.find((i) => String(i.id) === String(selectedInspection));
                      const buildings = insp?.application_data?.registration_data?.infrastructure_buildings || [];
                      return buildings.length > 0 ? (
                        <div className="mb-3 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs text-blue-800">
                          <span>ℹ️</span>
                          <span><strong>Number Provided</strong> column has been pre-filled from the applicant's REG-01 declaration. Fill in <strong>Number Verified</strong> and <strong>Number Functioning</strong> based on your physical inspection.</span>
                        </div>
                      ) : null;
                    })()}
                    <div className="overflow-x-auto">
                      <table className="inspection-table">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Number provided</th>
                            <th>Number verified</th>
                            <th>Number functioning</th>
                            <th colSpan="3">Quality **</th>
                            <th>Remarks</th>
                          </tr>
                          <tr>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th>G</th>
                            <th>A</th>
                            <th>P</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {infrastructureRows.map((row) => {
                            const hasProvided = infrastructure[row].provided !== "";
                            const hasRemarks = infrastructure[row].remarks !== "";
                            // Rows whose count comes from the REG-01 infrastructure_buildings array
                            const reg01Rows = ["Offices","Classrooms","Laboratories","Workshops","Dormitories","Assembly halls","Libraries"];
                            const isFromReg01 = reg01Rows.includes(row);
                            const isLibraryBooks = row === "Library books";
                            const isEquipmentOrJournal = ["Equipment and Tools (Computers)","Equipment / Tools (Other specific)","Library journals"].includes(row);

                            let rowStyle = {};
                            if (hasProvided) {
                              // Fully pre-filled from REG-01
                              rowStyle = { borderLeft: "3px solid #10b981", background: "#f0fdf4" };
                            } else if (hasRemarks) {
                              // Partially pre-filled (remarks only)
                              rowStyle = { borderLeft: "3px solid #3b82f6", background: "#eff6ff" };
                            } else {
                              // Not in applicant form — needs manual entry
                              rowStyle = { borderLeft: "3px solid #f59e0b", background: "#fffbeb" };
                            }

                            return (
                              <tr key={row} style={rowStyle}>
                                <td>
                                  <span>{row}</span>
                                  {!hasProvided && !hasRemarks && (
                                    <span style={{ display: "block", fontSize: "10px", color: "#92400e", fontStyle: "italic", marginTop: "2px" }}>
                                      ✏️ Fill manually
                                    </span>
                                  )}
                                  {hasRemarks && !hasProvided && (
                                    <span style={{ display: "block", fontSize: "10px", color: "#1e40af", fontStyle: "italic", marginTop: "2px" }}>
                                      ℹ️ Remarks pre-filled
                                    </span>
                                  )}
                                  {hasProvided && (
                                    <span style={{ display: "block", fontSize: "10px", color: "#065f46", fontStyle: "italic", marginTop: "2px" }}>
                                      ✅ From application
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    min="0"
                                    value={infrastructure[row].provided}
                                    onChange={(event) => handleInfrastructureChange(row, "provided", event.target.value)}
                                  />
                                </td>

                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  value={infrastructure[row].verified}
                                  onChange={(event) => handleInfrastructureChange(row, "verified", event.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  value={infrastructure[row].functioning}
                                  onChange={(event) => handleInfrastructureChange(row, "functioning", event.target.value)}
                                />
                              </td>
                              <td>
                                <input type="radio" name={`${row}-quality`} checked={infrastructure[row].quality === "G"} onChange={() => handleInfrastructureChange(row, "quality", "G")} />
                              </td>
                              <td>
                                <input type="radio" name={`${row}-quality`} checked={infrastructure[row].quality === "A"} onChange={() => handleInfrastructureChange(row, "quality", "A")} />
                              </td>
                              <td>
                                <input type="radio" name={`${row}-quality`} checked={infrastructure[row].quality === "P"} onChange={() => handleInfrastructureChange(row, "quality", "P")} />
                              </td>
                              <td>
                                <input
                                  value={infrastructure[row].remarks}
                                  onChange={(event) => handleInfrastructureChange(row, "remarks", event.target.value)}
                                />
                              </td>
                             </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {/* Color legend */}
                      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "8px", fontSize: "11px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: 12, height: 12, background: "#10b981", borderRadius: 2, display: "inline-block" }} /> Number provided from application</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: 12, height: 12, background: "#3b82f6", borderRadius: 2, display: "inline-block" }} /> Remarks pre-filled from application</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: 12, height: 12, background: "#f59e0b", borderRadius: 2, display: "inline-block" }} /> Not declared in application – fill manually</span>
                      </div>
                      <p className="paper-note">*G-Good, A-Average, P-Poor (Tick the appropriate)</p>
                      <p className="paper-note">** Assess if they are adequate, relevant and up to date.</p>
                    </div>

                    <h3 className="paper-question-title mt-6">1.2 Do the buildings have</h3>
                    <div className="inspection-question">
                      <div className="building-document-list">
                        {buildingDocuments.map((name) => (
                          <div className="inspection-field" key={name}>
                            <label>{name}</label>
                            <select value={documents[name]} onChange={(event) => handleDocumentChange(name, event.target.value)}>
                              <option value="">Select</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                </>
              )}

              {currentStep === 3 && (
                <>
                  {rubricSections.map((section) => (
                    <section className="inspection-section paper-section" key={section.id}>
                      {section.id !== "infrastructure" && <h2 className="paper-section-title">{section.title}</h2>}
                      <h3 className="paper-question-title">{section.question}</h3>
                      <div className="overflow-x-auto">
                        <table className="rubric-table">
                          <tbody>
                            {section.options.map(([score, answer], index) => {
                            const value = `${score}-${index}`;
                            const selected = rubric[section.id].score === score && rubric[section.id].answer === answer;
                            return (
                              <tr className={selected ? "selected-row" : ""} key={value}>
                                <td>{answer}</td>
                                <td className="score-cell">{score}</td>
                                <td className="tick-cell">
                                  <input
                                    aria-label={`${section.question} score ${score}`}
                                    type="radio"
                                    name={section.id}
                                    checked={selected}
                                    onChange={() => handleRubricSelect(section, score, answer)}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                          </tbody>
                        </table>
                      </div>
                      <div className="inspection-question">
                        <div className="inspection-field mt-3">
                          <label>Comment if any</label>
                          <textarea
                            value={rubric[section.id].comments}
                            onChange={(event) => handleCommentChange(section.id, event.target.value)}
                          />
                        </div>
                      </div>
                    </section>
                  ))}
                </>
              )}

              {currentStep === 4 && (
                <>
                  <section className="inspection-section paper-section">
                    <div className="final-score-row">
                      <div>
                        <label>TOTAL SCORE</label>
                        <strong>{totalScore}</strong>
                      </div>
                      <div>
                        <label>AVERAGE SCORE</label>
                        <strong>{averageScore}</strong>
                      </div>
                    </div>
                    <h2 className="paper-section-title">Physical Verification Team Leader</h2>
                    <div className="inspection-question">
                      <div className="inspection-grid">
                        <div className="inspection-field">
                          <label>Full name</label>
                          <input value={teamLeader} onChange={(event) => setTeamLeader(event.target.value)} />
                        </div>
                        <div className="inspection-field">
                          <label>Signature</label>
                          <input value={signature} onChange={(event) => setSignature(event.target.value)} />
                        </div>
                        <div className="inspection-field">
                          <label>Date</label>
                          <input
                            type="date"
                            value={signatureDate}
                            onChange={(event) => setSignatureDate(event.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              )}

              {!loadingInspections && inspections.length === 0 && (
                <div className="inspection-empty">
                  No scheduled inspections found for your account. Please ensure you have been assigned to an inspection team by an administrator.
                </div>
              )}

              <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
                {currentStep > 1 ? (
                  <button type="button" onClick={prevStep} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer">
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <button type="button" onClick={nextStep} className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition cursor-pointer">
                    Next
                  </button>
                ) : (
                  <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-600 to-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-95 transition cursor-pointer" disabled={saving} onClick={handleSubmit}>
                    <Save size={18} />
                    {saving ? "Saving..." : "Save Inspection"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
