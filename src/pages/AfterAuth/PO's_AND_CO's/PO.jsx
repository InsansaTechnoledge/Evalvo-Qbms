import React, { useMemo, useState, useCallback } from "react";
import { Edit2, Trash2, Save, X, Search, AlertCircle, Pause, Play, Square, Volume2 } from "lucide-react";
import { useTTS } from "../../../hooks/useTTS";
import { PageHeader } from "../../../components/ui/PageHeader";
import { StatsCard } from "../../../components/ui/StatsCard";
import { Toast } from "../../../components/ui/Toast";
import { DeleteModal } from "../../../components/ui/DeleteModal";
import { ProgramData, ProgramOutcomeData } from "../../../utils/Constants";

const DESCRIPTION_TEXT = `
Program Outcomes (POs) describe what students are expected to know, understand, and be able to do by the time they complete a program. They are usually aligned with accreditation bodies and institutional goals.

In Evalvo QBMS, POs help you link question banks, course outcomes, and exams back to program-level objectives. This makes it easier to generate CO–PO matrices, show outcome coverage, and report evidence during audits or accreditation visits.
`.trim();

const validateOutcome = (data) => {
  const errors = {};

  if (!data.code?.trim()) {
    errors.code = "PO code is required (e.g., PO1, PO2)";
  } else if (data.code.trim().length < 2) {
    errors.code = "PO code must be at least 2 characters.";
  }

  if (!data.statement?.trim()) {
    errors.statement = "Outcome statement is required.";
  } else if (data.statement.trim().length < 10) {
    errors.statement = "Statement should be at least 10 characters.";
  }

  return errors;
};

const ManageProgramOutcomes = () => {
  const [programOutcomes, setProgramOutcomes] = useState(
    ProgramOutcomeData || []
  );

  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [draftRow, setDraftRow] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [newOutcome, setNewOutcome] = useState({ code: "", statement: "" });

  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ==== TTS hook (same style as AddPrograms) ====
  const { voices, speak, cancel, pause, resume, speaking, paused } = useTTS();
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(1);

  const selectedVoice = useMemo(() => {
    return  voices?.[1] || null;
  }, [voices, selectedVoiceIndex, voices]);
  // =============================================

  const selectedProgram = useMemo(() => {
    if (!selectedProgramId) return null;
    return (
      ProgramData.find(
        (p) =>
          p.id === selectedProgramId ||
          p._id === selectedProgramId ||
          p.code === selectedProgramId
      ) || null
    );
  }, [selectedProgramId]);

  // Filter outcomes by selected program + search
  const filteredOutcomes = useMemo(() => {
    let list = programOutcomes;

    if (selectedProgramId) {
      list = list.filter(
        (po) =>
          po.programId === selectedProgramId ||
          po.program_id === selectedProgramId
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (po) =>
          po.code?.toLowerCase().includes(q) ||
          po.statement?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [programOutcomes, selectedProgramId, searchQuery]);

  // Stats for selected program
  const stats = useMemo(() => {
    const totalForProgram = filteredOutcomes.length;
    const totalAll = programOutcomes.length;
    const distinctPrograms = new Set(
      programOutcomes.map((po) => po.programId || po.program_id)
    ).size;

    return { totalForProgram, totalAll, distinctPrograms };
  }, [filteredOutcomes, programOutcomes]);

  // ----- Handlers -----

  const handleNewOutcomeChange = (field, value) => {
    setNewOutcome((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleAddOutcome = () => {
    if (!selectedProgramId) {
      showToast("Please select a program first.", "error");
      return;
    }

    const candidate = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()),
      programId: selectedProgramId,
      code: newOutcome.code.trim(),
      statement: newOutcome.statement.trim(),
    };

    const errors = validateOutcome(candidate);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showToast("Please fix validation errors before adding.", "error");
      return;
    }

    // unique (programId, code)
    const duplicate = programOutcomes.some(
      (po) =>
        (po.programId === candidate.programId ||
          po.program_id === candidate.programId) &&
        po.code.toLowerCase() === candidate.code.toLowerCase()
    );
    if (duplicate) {
      setValidationErrors({
        ...errors,
        code: "This PO code already exists for this program.",
      });
      showToast("PO code must be unique within a program.", "error");
      return;
    }

    setProgramOutcomes((prev) => [...prev, candidate]);
    setNewOutcome({ code: "", statement: "" });
    setValidationErrors({});
    showToast("Program Outcome added successfully.", "success");
  };

  const handleEdit = useCallback((row) => {
    setEditingId(row.id);
    setDraftRow({ ...row });
    setValidationErrors({});
  }, []);

  const handleDraftChange = useCallback(
    (field, value) => {
      setDraftRow((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (validationErrors[field]) {
        setValidationErrors((prev) => {
          const copy = { ...prev };
          delete copy[field];
          return copy;
        });
      }
    },
    [validationErrors]
  );

  const handleSave = useCallback(() => {
    if (!draftRow) return;

    const errors = validateOutcome(draftRow);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showToast("Please fix validation errors", "error");
      return;
    }

    // unique (programId, code) check on edit
    const programId = draftRow.programId || draftRow.program_id;
    const duplicate = programOutcomes.some(
      (po) =>
        po.id !== editingId &&
        (po.programId === programId || po.program_id === programId) &&
        po.code.toLowerCase() === draftRow.code.toLowerCase()
    );

    if (duplicate) {
      setValidationErrors({
        ...errors,
        code: "This PO code already exists for this program.",
      });
      showToast("PO code must be unique within a program.", "error");
      return;
    }

    setProgramOutcomes((prev) =>
      prev.map((po) => (po.id === editingId ? draftRow : po))
    );

    setEditingId(null);
    setDraftRow(null);
    setValidationErrors({});
    showToast("Program Outcome updated successfully.", "success");
  }, [draftRow, editingId, programOutcomes, showToast]);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setDraftRow(null);
    setValidationErrors({});
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;

    setProgramOutcomes((prev) => prev.filter((po) => po.id !== deleteTarget.id));
    showToast(`PO "${deleteTarget.code}" deleted successfully`, "success");
    setDeleteTarget(null);

    if (editingId === deleteTarget.id) {
      setEditingId(null);
      setDraftRow(null);
      setValidationErrors({});
    }
  }, [deleteTarget, editingId, showToast]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  // ===== TTS handler: reads description or POs of selected program =====
  const handleTTSToggle = () => {
    // If already speaking, toggle pause/resume
    if (speaking) {
      if (paused) {
        resume();
      } else {
        pause();
      }
      return;
    }

    // Construct text to speak
    let textToSpeak = DESCRIPTION_TEXT;

    if (selectedProgram && filteredOutcomes.length > 0) {
      const header = `Program Outcomes for ${selectedProgram.name}. `;
      const body = filteredOutcomes
        .map((po) => `${po.code}. ${po.statement}`)
        .join(" ");
      textToSpeak = header + body;
    }

    if (!textToSpeak.trim()) return;

    speak({
      text: textToSpeak,
      voice: selectedVoice,
      rate: 1.0,
    });
  };

  return (
    <section className="">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Program Outcomes (POs)"
          subtitle="Define and manage outcome statements for each program"
          align="center"
        />

        {/* Info + TTS Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-start gap-3 mb-3">
              <Volume2 className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  What are Program Outcomes?
                </h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {DESCRIPTION_TEXT}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-200">
              <button
                onClick={handleTTSToggle}
                className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium"
                title={
                  speaking ? (paused ? "Resume reading" : "Pause reading") : "Listen to POs"
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
                {speaking ? (paused ? "Resume" : "Pause") : "Listen"}
              </button>

              {speaking && (
                <button
                  onClick={cancel}
                  className="px-4 py-2 rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition flex items-center gap-2 text-sm font-medium"
                  title="Stop"
                >
                  <Square className="w-4 h-4" />
                  Stop
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
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 mb-8">
          <StatsCard
            title="Total POs (All Programs)"
            value={stats.totalAll}
            color="blue"
          />
          <StatsCard
            title="POs for Selected Program"
            value={stats.totalForProgram}
            color="blue"
          />
          <StatsCard
            title="Programs with POs"
            value={stats.distinctPrograms}
            color="blue"
          />
        </div>

        {/* Program Select + Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Program Selector */}
            <div className="lg:w-1/2 space-y-2">
              <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                Select Program
              </label>
              <select
                value={selectedProgramId}
                onChange={(e) => {
                  setSelectedProgramId(e.target.value);
                  setEditingId(null);
                  setDraftRow(null);
                  setValidationErrors({});
                }}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">— Choose Program —</option>
                {ProgramData.map((p, idx) => (
                  <option
                    key={p.id || p._id || p.code || idx}
                    value={p.id || p._id || p.code}
                  >
                    {p.name} {p.code ? `(${p.code})` : ""}
                  </option>
                ))}
              </select>
              {selectedProgram && (
                <p className="text-xs text-gray-500">
                  Program selected:{" "}
                  <span className="font-medium">{selectedProgram.name}</span>
                </p>
              )}
            </div>

            {/* Search within POs */}
            <div className="flex-1 space-y-2">
              <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                Search Outcomes
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by PO code or statement..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {(searchQuery || selectedProgramId) && (
                <div className="text-xs text-gray-600 mt-1">
                  Showing {filteredOutcomes.length} POs
                  {selectedProgram ? ` for "${selectedProgram.name}"` : ""} out
                  of {programOutcomes.length} total.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add New PO Row */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              Add New Program Outcome
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Each PO is uniquely identified by{" "}
              <span className="font-semibold">Program + Code</span> (e.g., PO1,
              PO2).
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Code */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  PO Code *
                </label>
                <input
                  type="text"
                  value={newOutcome.code}
                  onChange={(e) =>
                    handleNewOutcomeChange("code", e.target.value)
                  }
                  placeholder="e.g., PO1"
                  className={`w-full px-3 py-2 rounded-lg border-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.code
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {validationErrors.code && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.code}
                  </p>
                )}
              </div>

              {/* Statement */}
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Outcome Statement *
                </label>
                <textarea
                  value={newOutcome.statement}
                  onChange={(e) =>
                    handleNewOutcomeChange("statement", e.target.value)
                  }
                  rows={2}
                  placeholder="Describe what students should be able to do or demonstrate after completing this program..."
                  className={`w-full px-3 py-2 rounded-lg border-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.statement
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {validationErrors.statement && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.statement}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAddOutcome}
                disabled={!selectedProgramId}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition flex items-center gap-2 ${
                  selectedProgramId
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Add PO
              </button>
            </div>
          </div>
        </div>

        {/* POs Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              Program Outcomes List
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Edit codes and statements inline. POs are stored as{" "}
              <code className="bg-gray-100 px-1 rounded text-xs">
                (program_id, code)
              </code>{" "}
              pairs in your database.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Code</th>
                  <th className="px-6 py-4 font-semibold">Statement</th>
                  <th className="px-6 py-4 font-semibold">Program</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOutcomes.map((row) => {
                  const isEditing = row.id === editingId;
                  const current = isEditing ? draftRow : row;

                  const program =
                    ProgramData.find(
                      (p) =>
                        p.id === (row.programId || row.program_id) ||
                        p._id === (row.programId || row.program_id) ||
                        p.code === (row.programId || row.program_id)
                    ) || null;

                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors ${
                        isEditing ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      {/* PO Code */}
                      <td className="px-6 py-4 align-top">
                        {isEditing ? (
                          <div>
                            <input
                              type="text"
                              value={current.code || ""}
                              onChange={(e) =>
                                handleDraftChange("code", e.target.value)
                              }
                              className={`w-24 rounded-lg border-2 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                validationErrors.code
                                  ? "border-red-400 bg-red-50"
                                  : "border-gray-300"
                              }`}
                              placeholder="PO1"
                            />
                            {validationErrors.code && (
                              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {validationErrors.code}
                              </p>
                            )}
                          </div>
                        ) : (
                          <code className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-mono">
                            {row.code}
                          </code>
                        )}
                      </td>

                      {/* Statement */}
                      <td className="px-6 py-4 align-top w-full">
                        {isEditing ? (
                          <div>
                            <textarea
                              rows={3}
                              value={current.statement || ""}
                              onChange={(e) =>
                                handleDraftChange("statement", e.target.value)
                              }
                              className={`w-full rounded-lg border-2 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                validationErrors.statement
                                  ? "border-red-400 bg-red-50"
                                  : "border-gray-300"
                              }`}
                            />
                            {validationErrors.statement && (
                              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {validationErrors.statement}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-800 leading-relaxed">
                            {row.statement}
                          </p>
                        )}
                      </td>

                      {/* Program Name */}
                      <td className="px-6 py-4 align-top">
                        <span className="text-gray-700 text-sm">
                          {program?.name || "—"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={handleSave}
                                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 transition"
                              >
                                <Save className="w-3.5 h-3.5" />
                                Save
                              </button>
                              <button
                                onClick={handleCancel}
                                className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-300 transition"
                              >
                                <X className="w-3.5 h-3.5" />
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(row)}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteTarget(row)}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredOutcomes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <AlertCircle className="w-12 h-12" />
                        <p className="text-lg font-medium">
                          No Program Outcomes found
                        </p>
                        <p className="text-sm">
                          {selectedProgramId
                            ? "Try adding a new PO for this program."
                            : "Select a program and start adding POs."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteModal
          school={deleteTarget} // reusing prop name
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
};

export default ManageProgramOutcomes;
