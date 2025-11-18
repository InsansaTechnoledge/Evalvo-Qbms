import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Pause, Play, Square, Volume2 } from "lucide-react";
import { useTTS } from "../../../hooks/useTTS";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Toast } from "../../../components/ui/Toast";
import axios from "axios";



const fieldHasValue = (v) => String(v ?? "").trim().length > 0;

const validateField = (name, value) => {
  switch (name) {
    case "name":
      if (!fieldHasValue(value)) return "School name is required.";
      if (value.length < 3) return "School name must be at least 3 characters.";
      if (value.length > 100) return "School name must be less than 100 characters.";
      return null;
    
    case "level":
      if (!fieldHasValue(value)) return "Please choose UG or PG.";
      return null;
    
    case "code":
      if (!fieldHasValue(value)) return "School code is required.";
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

const AddSchool = () => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    level: "",
    duration_semesters: "",
    organization_id : ''
  });
  
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [globalError, setGlobalError] = useState(null);

  // TTS state
  const { voices, speak, cancel, pause, resume, speaking, paused } = useTTS();
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(1);

  const DESCRIPTION_TEXT = 
    "A School represents an academic division or institution within your organization — for example, School of Engineering, School of Management, or School of Arts. Each school contains its own set of programs, batches, and question banks, helping you manage departments and courses independently while keeping your data structured and scalable. Adding schools to your organization allows the system to structure and manage your data more efficiently. Each school acts as a separate entity within your organization, ensuring clear segregation of programs, batches, and question banks for seamless administration and reporting.";

  
  const selectedVoice = useMemo(() => {
    return voices?.[selectedVoiceIndex] || voices?.[0] || null;
  }, [voices, selectedVoiceIndex]);

  const showPreview = useMemo(() => {
    return Object.values(formData).some(v => fieldHasValue(v));
  }, [formData]);

  const errors = useMemo(() => {
    const errs = {};
    Object.keys(formData).forEach(key => {
      if (touched[key]) {
        const error = validateField(key, formData[key]);
        if (error) errs[key] = error;
      }
    });
    return errs;
  }, [formData, touched]);

  const isFormValid = useMemo(() => {
    return Object.keys(formData).every(key => !validateField(key, formData[key]));
  }, [formData]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setGlobalError(null);
  };

  const handleFieldBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleReset = () => {
    setFormData({
      name: "",
      code: "",
      level: "",
      duration_semesters: "",
      organization_id : '686f8fce6e7a08ef775c4672'
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

    try {
      
      console.log("check", formData);

      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // const data = await axios.post("http://localhost:8000/api/v1/programs/program" , formData);
      
      // Success
      setToast("School added successfully!");
      setTimeout(() => setToast(null), 3000);
      console.log("sdf", data);
      
      handleReset();
    } catch (err) {
      // setGlobalError("Something went wrong. Please try again.");
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
    <section className="">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Add School to Organization"
          subtitle="Structure your academic institution efficiently"
          align="center"
        />

        {/* Info/Preview Section */}
        <div className={`
          bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden
          transition-all duration-500 ease-out mb-8
          ${showPreview ? 'border-blue-300' : ''}
        `}>
          <div className={`transition-all duration-500 ${showPreview ? 'bg-blue-50' : 'bg-gray-50'}`}>
            {showPreview ? (
              <div className="p-6 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-1 bg-blue-600 rounded"></div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Review Your Information
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">School Name</span>
                    <p className="text-lg font-medium mt-1">{formData.name || "—"}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">Level</span>
                    <p className="text-lg font-medium mt-1">{formData.level || "—"}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">School Code</span>
                    <p className="text-lg font-medium mt-1">{formData.code || "—"}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">Duration (Semesters)</span>
                    <p className="text-lg font-medium mt-1">{formData.duration_semesters || "—"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 animate-in fade-in">
                <div className="flex items-start gap-3 mb-4">
                  <Volume2 className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">
                      What is a School?
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
                    {speaking ? (paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />) : <Play className="w-4 h-4" />}
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
                      onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
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

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">School Details</h2>
          
          <div className="space-y-6">
            {/* Row 1 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                  School Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  onBlur={() => handleFieldBlur("name")}
                  placeholder="e.g., School of Engineering"
                  className={`w-full px-4 py-2.5 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-400 bg-red-50" : "border-gray-300"
                  }`}
                  autoFocus
                />
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠</span> {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                  Level (UG / PG) *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => handleFieldChange("level", e.target.value)}
                  onBlur={() => handleFieldBlur("level")}
                  className={`w-full px-4 py-2.5 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.level ? "border-red-400 bg-red-50" : "border-gray-300"
                  }`}
                >
                  <option value="">— Select Level —</option>
                  <option value="UG">Undergraduate (UG)</option>
                  <option value="PG">Postgraduate (PG)</option>
                </select>
                {errors.level && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠</span> {errors.level}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                  School Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleFieldChange("code", e.target.value)}
                  onBlur={() => handleFieldBlur("code")}
                  placeholder="e.g., SOE-2024"
                  className={`w-full px-4 py-2.5 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.code ? "border-red-400 bg-red-50" : "border-gray-300"
                  }`}
                />
                {errors.code && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠</span> {errors.code}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                  Duration (Semesters) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={formData.duration_semesters}
                  onChange={(e) => handleFieldChange("duration_semesters", e.target.value)}
                  onBlur={() => handleFieldBlur("duration_semesters")}
                  placeholder="e.g., 8"
                  className={`w-full px-4 py-2.5 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.duration_semesters ? "border-red-400 bg-red-50" : "border-gray-300"
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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Adding School...
                </>
              ) : (
                "Add School"
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

export default AddSchool;