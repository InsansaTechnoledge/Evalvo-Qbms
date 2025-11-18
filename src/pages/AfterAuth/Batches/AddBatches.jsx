import React, { useMemo, useState } from "react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Toast } from "../../../components/ui/Toast";
import { Schools, ProgramData } from "../../../utils/Constants";
import { useTTS } from "../../../hooks/useTTS";
import { Pause, Play, Square, Volume2 } from "lucide-react";
import axios from "axios";

const fieldHasValue = (v) => String(v ?? "").trim().length > 0;

const validateField = (name, value) => {
  switch (name) {
    case "name":
      if (!fieldHasValue(value)) return "Batch name is required.";
      if (value.length < 2) return "Batch name must be at least 2 characters.";
      if (value.length > 100)
        return "Batch name must be less than 100 characters.";
      return null;

    case "year": {
      if (!fieldHasValue(value)) return "Batch year is required.";
      const num = +value;
      if (isNaN(num)) return "Batch year must be a number.";
      if (num < 1990 || num > 2100)
        return "Year must be between 1990 and 2100.";
      return null;
    }

    case "schoolId":
      if (!fieldHasValue(value)) return "Please choose a school.";
      return null;

    case "programId":
      if (!fieldHasValue(value)) return "Please choose a program.";
      return null;

    default:
      return null;
  }
};

const AddBatches = () => {
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    schoolId: "",
    programId: "",
  });

  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [globalError, setGlobalError] = useState(null);

  // TTS
  const { voices, speak, cancel, pause, resume, speaking, paused } = useTTS();
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(1);

  const DESCRIPTION_TEXT = `
A Batch represents a specific group of students admitted in a particular year under a Program — for example, B.Tech CSE 2024-28, MBA Finance 2023-25, or BBA 2022-25.

In Evalvo QBMS, batches help you organize exams, results, and question usage for a specific intake. Linking each batch with its School and Program ensures clean reporting, better tracking of outcomes, and smooth mapping with university records and DigiLocker-compatible exports.
  `.trim();

  const selectedVoice = useMemo(() => {
    return voices?.[selectedVoiceIndex] || voices?.[0] || null;
  }, [voices, selectedVoiceIndex]);

  const handleTTSToggle = () => {
    if (!DESCRIPTION_TEXT.trim()) return;

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
    return Object.keys(formData).every(
      (key) => !validateField(key, formData[key])
    );
  }, [formData]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "schoolId" ? { programId: "" } : {}),
    }));
    setGlobalError(null);
  };

  const handleFieldBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleReset = () => {
    setFormData({
      name: "",
      year: "",
      schoolId: "",
      program_id: "",
      course_id: ""
    });
    setTouched({});
    setGlobalError(null);
    cancel(); // stop TTS if playing
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


      await new Promise((resolve) => setTimeout(resolve, 1200));

      // const data = await axios.post("http://localhost:8000/api/v1/batch/create-batch", formData)

      setToast("Batch added successfully!");
      setTimeout(() => setToast(null), 3000);
      handleReset();
    } catch (err) {
      setGlobalError(err.response?.data?.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false);
    }
  };

  // derived labels
  const selectedSchool = Schools.find(
    (s) => s._id === formData.schoolId || s.code === formData.schoolId
  );

  const filteredProgramData = useMemo(() => {
    if (!formData.schoolId) return [];
    return ProgramData.filter(
      (p) =>
        p.schoolId === formData.schoolId ||
        p.school_id === formData.schoolId ||
        p.schoolCode === formData.schoolId
    );
  }, [formData.schoolId]);

  const selectedProgram = ProgramData.find(
    (p) =>
      p._id === formData.programId ||
      p.code === formData.programId ||
      p.id === formData.programId
  );

  return (
    <section>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={"Add Batches to Programs"}
          subtitle={"Add new batches to existing programs in your institute"}
          align="center"
        />

        {/* Info / Preview Card */}
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
                    Review Batch Information
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">
                      Batch Name
                    </span>
                    <p className="text-lg font-medium mt-1">
                      {formData.name || "—"}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">
                      Batch Year
                    </span>
                    <p className="text-lg font-medium mt-1">
                      {formData.year || "—"}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">
                      School
                    </span>
                    <p className="text-lg font-medium mt-1">
                      {selectedSchool?.name || "—"}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">
                      Program
                    </span>
                    <p className="text-lg font-medium mt-1">
                      {selectedProgram?.name || "—"}
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
                      What is a Batch?
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
                    title={
                      speaking ? (paused ? "Resume" : "Pause") : "Listen"
                    }
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

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Batch Details
          </h2>

          <div className="space-y-6">
            {/* Row 1 */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Batch Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                  Batch Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    handleFieldChange("name", e.target.value)
                  }
                  onBlur={() => handleFieldBlur("name")}
                  placeholder="e.g., B.Tech CSE 2024-28"
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

              {/* Batch Year */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                  Batch Year *
                </label>
                <input
                  type="number"
                  min={1990}
                  max={2100}
                  value={formData.year}
                  onChange={(e) =>
                    handleFieldChange("year", e.target.value)
                  }
                  onBlur={() => handleFieldBlur("year")}
                  placeholder="e.g., 2024"
                  className={`w-full px-4 py-2.5 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.year
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.year && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠</span> {errors.year}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* School */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                  School *
                </label>
                <select
                  value={formData.schoolId}
                  onChange={(e) =>
                    handleFieldChange("schoolId", e.target.value)
                  }
                  onBlur={() => handleFieldBlur("schoolId")}
                  className={`w-full px-4 py-2.5 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.schoolId
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">— Select School —</option>
                  {Schools.map((s, index) => (
                    <option
                      key={s._id || s.code || index}
                      value={s._id || s.code}
                    >
                      {s.name}
                    </option>
                  ))}
                </select>
                {errors.schoolId && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠</span> {errors.schoolId}
                  </p>
                )}
              </div>

              {/* Program */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                  Program *
                </label>
                <select
                  value={formData.programId}
                  onChange={(e) =>
                    handleFieldChange("programId", e.target.value)
                  }
                  onBlur={() => handleFieldBlur("programId")}
                  disabled={!formData.schoolId}
                  className={`w-full px-4 py-2.5 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.programId
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  } ${
                    !formData.schoolId
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <option value="">
                    {formData.schoolId
                      ? "— Select Program —"
                      : "Select a school first"}
                  </option>
                  {filteredProgramData.map((p, index) => (
                    <option
                      key={p._id || p.code || p.id || index}
                      value={p._id || p.code || p.id}
                    >
                      {p.name}
                    </option>
                  ))}
                </select>
                {errors.programId && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠</span> {errors.programId}
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

          {/* Actions */}
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
                  Adding Batch...
                </>
              ) : (
                "Add Batch"
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

export default AddBatches;
