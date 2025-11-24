import React, { useEffect, useMemo, useState } from "react";
import { Pause, Play, Square, Volume2 } from "lucide-react";
import { useTTS } from "../../../hooks/useTTS";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Toast } from "../../../components/ui/Toast";
// import { Schools } from "../../../utils/Constants";
import axios from "axios";
import { useUser } from "../../../contexts/UserContext";

const fieldHasValue = (v) => String(v ?? "").trim().length > 0;

const validateField = (name, value) => {
  switch (name) {
    
    case "name":
      if (!fieldHasValue(value)) return "Program name is required.";
      if (value.length < 3) return "Program name must be at least 3 characters.";
      if (value.length > 100) return "Program name must be less than 100 characters.";
      return null;

    case "code":
      if (!fieldHasValue(value)) return "Program code is required.";
      if (!/^[A-Za-z0-9\-_.]{2,12}$/.test(value)) {
        return "Code: 2–12 chars (A–Z, 0–9, -, _, .)";
      }
      return null;

    case "duration_semesters":
      const num = +value;
      if (!fieldHasValue(value)) return "Duration is required.";
      if (isNaN(num) || num < 1 || num > 12) {
        return "Duration: 1–12 semesters.";
      }
      return null;

    default:
      return null;
  }
};

const AddPrograms = () => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    duration_semesters: "",
    program_id : '' // school id in this case ( program_id because of naming convention in db , it is school_id)
  });

  console.log("program", formData);
  

  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [globalError, setGlobalError] = useState(null);

  const { voices, speak, cancel, pause, resume, speaking, paused } = useTTS();
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(1);

  const [Schools, setSchools] = useState([])
  const {user} = useUser();

  useEffect(() => {
      const fetchSchoolData = async () => {
        const { data } = await axios.get(
          "http://localhost:8000/api/v1/programs/program",
          {
            withCredentials: true,
            params: { organization_id: user._id },
          }
        );
        console.log("data1", data.data);
  
        setSchools(data.data);
  
        console.log("data2", Schools);
      };
      fetchSchoolData();
    },[])

  const DESCRIPTION_TEXT = `
A Program represents a specific academic offering under a School — for example, B.Tech Computer Science, MBA (Finance), BBA, or M.Sc. Physics. Each program defines its own curriculum, regulations, duration, and eligibility, and is always linked to a particular school within your organization.

In Evalvo QBMS, programs act as the bridge between schools and batches. Question banks, exams, and assessments are organized at the program level, so that you can clearly separate UG vs PG offerings, manage different regulations or schemes, and report outcomes program-wise. Creating programs helps you keep your question bank structured, search-friendly, and aligned with how your university actually runs its courses.
  `.trim();

  const selectedVoice = useMemo(() => {
    return voices?.[selectedVoiceIndex] || voices?.[0] || null;
  }, [voices, selectedVoiceIndex, voices]);

  const showPreview = useMemo(() => {
    return Object.values(formData).some((v) => fieldHasValue(v));
  }, [formData]);

  const errors = useMemo(() => {
    const errs = {};
    Object.keys(formData).forEach((key) => {
      if (touched[key]) {
        const err = validateField(key, formData[key]);
        if (err) errs[key] = err;
      }
    });
    return errs;
  }, [formData, touched]);

  const isFormValid = useMemo(() => {
    return Object.keys(formData).every((key) => !validateField(key, formData[key]));
  }, [formData]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setGlobalError(null);
  };

  const handleFieldBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleReset = () => {
    setFormData({
      name: "",
      code: "",
      duration_semesters: "",
      program_id : ''
    });
    setTouched({});
    setGlobalError(null);
    cancel();
  };

  const handleSubmit = async () => {
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    if (!isFormValid) {
      setGlobalError("Please fix all errors before submitting.");
      return;
    }

    setGlobalError(null);
    setLoading(true);

    console.log("ttt", formData);
    

    try {
      
      // await new Promise((resolve) => setTimeout(resolve, 1500));

      const data = await axios.post("http://localhost:8000/api/v1/course/course", 
        formData ,
        {
          withCredentials: true        
        }
       )

       console.log("eew", data);
       
      // console.log("check", data)

      setToast("Program added successfully!");
      setTimeout(() => setToast(null), 3000);
      handleReset();
    } catch (err) {
      setGlobalError(err.response?.data?.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false);
    }
  };

  const handleTTSToggle = () => {
    if (speaking) {
      if (paused) {
        resume();
      } else {
        pause();
      }
    } else {
      speak({ text: DESCRIPTION_TEXT, voice: selectedVoice, rate: 1.0 });
    }
  };

  
  return (
    <section>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Add Programs to your School"
          subtitle="Create and manage academic programs offered by your institute"
          align="center"
        />

        {/* Info / Preview Section */}
        <div
          className={`
            bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden
            transition-all duration-500 ease-out mb-8
            ${showPreview ? "border-blue-300" : ""}
          `}
        >
          <div
            className={`transition-all duration-500 ${
              showPreview ? "bg-blue-50" : "bg-gray-50"
            }`}
          >
            {showPreview ? (
              <div className="p-6 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-1 bg-blue-600 rounded" />
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Review Program Information
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">
                      Program Name
                    </span>
                    <p className="text-lg font-medium mt-1">
                      {formData.name || "—"}
                    </p>
                  </div>
                  {/* <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">
                      Level
                    </span>
                    <p className="text-lg font-medium mt-1">
                      {formData.programLevel || "—"}
                    </p>
                  </div> */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">
                      Program Code
                    </span>
                    <p className="text-lg font-medium mt-1">
                      {formData.code || "—"}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">
                      Duration (Semesters)
                    </span>
                    <p className="text-lg font-medium mt-1">
                      {formData.duration_semesters || "—"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 animate-in fade-in">
                <div className="flex items-start gap-3 mb-4">
                  <Volume2 className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">
                      What is a Program?
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {DESCRIPTION_TEXT}
                    </p>
                  </div>
                </div>

                {/* TTS Controls */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleTTSToggle}
                    disabled={!DESCRIPTION_TEXT.trim()}
                    className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 transition flex items-center gap-2"
                    title={speaking ? (paused ? "Resume" : "Pause") : "Listen"}
                  >
                    {speaking ? (
                      paused ? (
                        <Play className="w-4 h-4" />
                      ) : (
                        <Pause className="w-4 h-4" />
                      )
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {speaking ? (paused ? "Resume" : "Pause") : "Listen"}
                    </span>
                  </button>

                  {speaking && (
                    <button
                      onClick={cancel}
                      className="px-4 py-2 rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition flex items-center gap-2"
                      title="Stop"
                    >
                      <Square className="w-4 h-4" />
                      <span className="text-sm font-medium">Stop</span>
                    </button>
                  )}

                  {voices.length > 0 && (
                    <select
                      value={selectedVoiceIndex}
                      onChange={(e) =>
                        setSelectedVoiceIndex(Number(e.target.value))
                      }
                      className="ml-auto px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white"
                    >
                      {voices.map((v, i) => (
                        <option key={i} value={i}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

       {/* Choose School Section */}
        <div className="flex flex-col max-w-4xl mx-auto gap-3 mb-8">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Choose school for your program
            </h2>
            <p className="text-sm text-gray-500">
              Every program must belong to a school (e.g., School of Engineering, School of Management).
            </p>
          </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide mb-2">
            School *
          </label>
          <select
            value={formData.program_id}
            onChange={(e) => handleFieldChange("program_id", e.target.value)}
            onBlur={() => handleFieldBlur("program_id")}
            className={`w-full px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.program_id ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
          >
            <option value="">— Select School —</option>
            {Schools?.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>

          {errors.program_id && (
            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.program_id}
            </p>
          )}


          {errors.program_id && (
            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.program_id}
            </p>
          )}
        </div>
      </div>


        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Program Details
          </h2>

          <div className="space-y-6">
            {/* Row 1 */}
            <div className="grid md:grid-cols-1 gap-6">
              {/* Program Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                  Program Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    handleFieldChange("name", e.target.value)
                  }
                  onBlur={() => handleFieldBlur("name")}
                  placeholder="e.g., B.Tech Computer Science"
                  className={`w-full px-4 py-2.5 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                  autoFocus
                />
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠</span> {errors.name}
                  </p>
                )}
              </div>

            </div>

            {/* Row 2 */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Program Code */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                  Program Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    handleFieldChange("code", e.target.value)
                  }
                  onBlur={() => handleFieldBlur("code")}
                  placeholder="e.g., BTECH-CSE-01"
                  className={`w-full px-4 py-2.5 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.code
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.code && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠</span> {errors.code}
                  </p>
                )}
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                  Duration (Semesters) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={formData.duration_semesters}
                  onChange={(e) =>
                    handleFieldChange("duration_semesters", e.target.value)
                  }
                  onBlur={() => handleFieldBlur("duration_semesters")}
                  placeholder="e.g., 8"
                  className={`w-full px-4 py-2.5 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.duration_semesters
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.duration_semesters && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠</span> {errors.duration_semesters}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Global Error */}
          {globalError && (
            <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <span className="text-lg">⚠</span>
                {globalError}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-end">
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-6 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition"
            >
              Reset Form
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !isFormValid}
              className="px-8 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Adding Program...
                </>
              ) : (
                "Add Program"
              )}
            </button>
          </div>
        </div>

        <Toast
          message={toast}
          type="success"
          onClose={() => setToast(null)}
        />
      </div>
    </section>
  );
};

export default AddPrograms;
