// src/pages/admin/programs/CO.jsx

import React, { useMemo, useState } from "react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Toast } from "../../../components/ui/Toast";
import { Edit2, Trash2, Save, X, Pause, Play, Square, Volume2 } from "lucide-react";
import { useTTS } from "../../../hooks/useTTS";
import {
  ProgramData,
  CourseSubjects as InitialCourseSubjects,
  CourseSubjectCO as InitialCourseSubjectCO,
} from "../../../utils/Constants";

const DESCRIPTION_TEXT = `
Course Outcomes, or COs, describe what a student should be able to do at the end of a specific subject or course. They are more granular than Program Outcomes and are usually linked to units, topics, and Bloom's taxonomy levels.

In Evalvo QBMS, you first attach subjects to a program, and then define Course Outcomes for each subject. Later, questions are mapped to these COs and can then be linked to Program Outcomes, allowing you to build CO–PO matrices and demonstrate coverage during accreditation or audits.
`.trim();

const CO = () => {
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [subjects, setSubjects] = useState(InitialCourseSubjects || []);
  const [coList, setCoList] = useState(InitialCourseSubjectCO || []);

  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const [newSubject, setNewSubject] = useState({ name: "", code: "" });
  const [newCO, setNewCO] = useState({
    code: "",
    statement: "",
    bloom_level: "",
    target_pct: "",
  });

  const [editingCoId, setEditingCoId] = useState(null);
  const [coDraft, setCoDraft] = useState(null);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  // ===== TTS hook (similar to AddPrograms / PO page) =====
  const { voices, speak, cancel, pause, resume, speaking, paused } = useTTS();
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(1);

  const selectedVoice = useMemo(() => {
    return voices?.[1] || null;
  }, [voices, selectedVoiceIndex, voices]);
  // =======================================================

  const filteredSubjects = useMemo(() => {
    if (!selectedProgramId) return [];
    return subjects.filter((s) => s.programId === selectedProgramId);
  }, [subjects, selectedProgramId]);

  // COs belonging to selected subject
  const subjectCOs = useMemo(() => {
    if (!selectedSubjectId) return [];
    return coList.filter(
      (co) =>
        co.course_subject_id === selectedSubjectId ||
        co.courseSubjectId === selectedSubjectId
    );
  }, [coList, selectedSubjectId]);

  const selectedProgram = useMemo(
    () => ProgramData.find((p) => p.id === selectedProgramId) || null,
    [selectedProgramId]
  );

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId) || null,
    [subjects, selectedSubjectId]
  );

  // ===== TTS toggle: explain COs or read COs of selected subject =====
  const handleTTSToggle = () => {
    if (speaking) {
      if (paused) {
        resume();
      } else {
        pause();
      }
      return;
    }

    let textToSpeak = DESCRIPTION_TEXT;

    if (selectedSubject && subjectCOs.length > 0) {
      const header = `Course Outcomes for subject ${selectedSubject.name}. `;
      const body = subjectCOs
        .map((co) => {
          const bloom = co.bloom_level ? ` Bloom level ${co.bloom_level}.` : "";
          const target =
            co.target_pct != null
              ? ` Target attainment ${co.target_pct} percent.`
              : "";
          return `${co.code}. ${co.statement}.${bloom}${target}`;
        })
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

  const handleAddSubject = () => {
    if (!selectedProgramId) {
      showToast("Please select a program first", "error");
      return;
    }

    const name = newSubject.name.trim();
    const code = newSubject.code.trim();

    if (!name || !code) {
      showToast("Subject name and code are required", "error");
      return;
    }

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `sub-${Date.now()}`;

    const subject = {
      id,
      programId: selectedProgramId,
      name,
      code,
    };

    setSubjects((prev) => [...prev, subject]);
    setNewSubject({ name: "", code: "" });
    setSelectedSubjectId(id);
    showToast("Subject added successfully");
  };

  /* --------- CO handlers --------- */

  const handleAddCO = () => {
    if (!selectedSubjectId) {
      showToast("Select a subject first", "error");
      return;
    }

    const code = newCO.code.trim();
    const statement = newCO.statement.trim();
    const bloom = newCO.bloom_level.trim();
    const targetNum = Number(newCO.target_pct);

    if (!code || !statement) {
      showToast("CO code and statement are required", "error");
      return;
    }

    // unique (course_subject_id, code)
    const duplicate = coList.some(
      (co) =>
        (co.course_subject_id === selectedSubjectId ||
          co.courseSubjectId === selectedSubjectId) &&
        co.code.toLowerCase() === code.toLowerCase()
    );
    if (duplicate) {
      showToast("This CO code already exists for this subject", "error");
      return;
    }

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `co-${Date.now()}`;

    const newEntry = {
      id,
      course_subject_id: selectedSubjectId,
      code,
      statement,
      bloom_level: bloom || null,
      target_pct: isNaN(targetNum) ? null : targetNum,
    };

    setCoList((prev) => [...prev, newEntry]);
    setNewCO({ code: "", statement: "", bloom_level: "", target_pct: "" });
    showToast("Course Outcome added");
  };

  const startEditCO = (row) => {
    setEditingCoId(row.id);
    setCoDraft({ ...row });
  };

  const cancelEditCO = () => {
    setEditingCoId(null);
    setCoDraft(null);
  };

  const saveEditCO = () => {
    if (!coDraft) return;

    const code = coDraft.code?.trim();
    const statement = coDraft.statement?.trim();
    const subjectId = coDraft.course_subject_id || coDraft.courseSubjectId;

    if (!code || !statement) {
      showToast("CO code and statement are required", "error");
      return;
    }

    // duplicate check on edit
    const duplicate = coList.some(
      (co) =>
        co.id !== coDraft.id &&
        (co.course_subject_id === subjectId ||
          co.courseSubjectId === subjectId) &&
        co.code.toLowerCase() === code.toLowerCase()
    );
    if (duplicate) {
      showToast("This CO code already exists for this subject", "error");
      return;
    }

    setCoList((prev) =>
      prev.map((co) =>
        co.id === coDraft.id ? { ...coDraft, code, statement } : co
      )
    );
    cancelEditCO();
    showToast("Course Outcome updated");
  };

  const deleteCO = (id) => {
    setCoList((prev) => prev.filter((co) => co.id !== id));
    showToast("Course Outcome deleted");
  };

  return (
    <section>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Course Outcomes (CO)"
          subtitle="Add subjects to programs and maintain COs per subject"
          align="center"
        />

        {/* Info + TTS Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-start gap-3 mb-3">
              <Volume2 className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  How Course Outcomes work
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
                  speaking
                    ? paused
                      ? "Resume reading"
                      : "Pause reading"
                    : "Listen to CO explanation"
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

        {/* Step 1: Select Program */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            1. Choose Program
          </h2>
          <select
            value={selectedProgramId}
            onChange={(e) => {
              setSelectedProgramId(e.target.value);
              setSelectedSubjectId("");
              setEditingCoId(null);
              setCoDraft(null);
            }}
            className="w-full md:w-1/2 px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Select Program —</option>
            {ProgramData.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.code ? `(${p.code})` : ""}
              </option>
            ))}
          </select>
          {selectedProgram && (
            <p className="mt-2 text-sm text-gray-500">
              Selected:{" "}
              <span className="font-medium">{selectedProgram.name}</span>
            </p>
          )}
        </div>

        {/* Step 2: Add / choose Subjects */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            2. Subjects under Program
          </h2>

          {!selectedProgramId ? (
            <p className="text-sm text-gray-500">
              Select a program above to manage its subjects.
            </p>
          ) : (
            <>
              {/* Add subject row */}
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={newSubject.name}
                    onChange={(e) =>
                      setNewSubject((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="e.g., Data Structures & Algorithms"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    value={newSubject.code}
                    onChange={(e) =>
                      setNewSubject((prev) => ({
                        ...prev,
                        code: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="e.g., CSE-201"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAddSubject}
                    className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    Add Subject
                  </button>
                </div>
              </div>

              {/* Subject pills */}
              {filteredSubjects.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No subjects yet. Add one above.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {filteredSubjects.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSubjectId(s.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium border ${
                        selectedSubjectId === s.id
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {s.name} ({s.code})
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Step 3: Manage COs for selected subject */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              3. Course Outcomes
            </h2>
            {selectedSubject && (
              <p className="text-sm text-gray-500">
                Subject:{" "}
                <span className="font-medium">{selectedSubject.name}</span>
              </p>
            )}
          </div>

          {!selectedSubjectId ? (
            <p className="text-sm text-gray-500">
              Select a subject above to view / add its COs.
            </p>
          ) : (
            <>
              {/* Add CO form */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    CO Code *
                  </label>
                  <input
                    type="text"
                    value={newCO.code}
                    onChange={(e) =>
                      setNewCO((prev) => ({ ...prev, code: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="e.g., CO1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Bloom Level
                  </label>
                  <select
                    value={newCO.bloom_level}
                    onChange={(e) =>
                      setNewCO((prev) => ({
                        ...prev,
                        bloom_level: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">— Optional —</option>
                    <option value="Remember">Remember</option>
                    <option value="Understand">Understand</option>
                    <option value="Apply">Apply</option>
                    <option value="Analyze">Analyze</option>
                    <option value="Evaluate">Evaluate</option>
                    <option value="Create">Create</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Target %
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newCO.target_pct}
                    onChange={(e) =>
                      setNewCO((prev) => ({
                        ...prev,
                        target_pct: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="e.g., 70"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Statement *
                  </label>
                  <textarea
                    rows={2}
                    value={newCO.statement}
                    onChange={(e) =>
                      setNewCO((prev) => ({
                        ...prev,
                        statement: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                    placeholder="What should student be able to do?"
                  />
                </div>
              </div>

              <div className="flex justify-end mb-4">
                <button
                  onClick={handleAddCO}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                >
                  Add CO
                </button>
              </div>

              {/* CO Table */}
              {subjectCOs.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No course outcomes added yet for this subject.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-600 border-b">
                      <tr>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Statement</th>
                        <th className="px-4 py-3">Bloom</th>
                        <th className="px-4 py-3">Target</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {subjectCOs.map((co) => {
                        const isEditing = co.id === editingCoId;
                        const current = isEditing ? coDraft : co;

                        return (
                          <tr
                            key={co.id}
                            className={isEditing ? "bg-blue-50" : "hover:bg-gray-50"}
                          >
                            {/* Code */}
                            <td className="px-4 py-3 align-top">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={current.code}
                                  onChange={(e) =>
                                    setCoDraft((prev) => ({
                                      ...prev,
                                      code: e.target.value,
                                    }))
                                  }
                                  className="w-20 px-2 py-1 border-2 border-gray-300 rounded-lg text-xs font-mono"
                                />
                              ) : (
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                  {co.code}
                                </code>
                              )}
                            </td>

                            {/* Statement */}
                            <td className="px-4 py-3 align-top w-full">
                              {isEditing ? (
                                <textarea
                                  rows={3}
                                  value={current.statement}
                                  onChange={(e) =>
                                    setCoDraft((prev) => ({
                                      ...prev,
                                      statement: e.target.value,
                                    }))
                                  }
                                  className="w-full px-2 py-1 border-2 border-gray-300 rounded-lg text-xs"
                                />
                              ) : (
                                <p className="text-gray-800">
                                  {co.statement}
                                </p>
                              )}
                            </td>

                            {/* Bloom */}
                            <td className="px-4 py-3 align-top">
                              {isEditing ? (
                                <select
                                  value={current.bloom_level || ""}
                                  onChange={(e) =>
                                    setCoDraft((prev) => ({
                                      ...prev,
                                      bloom_level: e.target.value,
                                    }))
                                  }
                                  className="w-full px-2 py-1 border-2 border-gray-300 rounded-lg text-xs"
                                >
                                  <option value="">—</option>
                                  <option value="Remember">Remember</option>
                                  <option value="Understand">Understand</option>
                                  <option value="Apply">Apply</option>
                                  <option value="Analyze">Analyze</option>
                                  <option value="Evaluate">Evaluate</option>
                                  <option value="Create">Create</option>
                                </select>
                              ) : (
                                <span className="text-xs text-gray-700">
                                  {co.bloom_level || "—"}
                                </span>
                              )}
                            </td>

                            {/* Target */}
                            <td className="px-4 py-3 align-top">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={current.target_pct ?? ""}
                                  onChange={(e) =>
                                    setCoDraft((prev) => ({
                                      ...prev,
                                      target_pct:
                                        e.target.value === ""
                                          ? null
                                          : Number(e.target.value),
                                    }))
                                  }
                                  className="w-20 px-2 py-1 border-2 border-gray-300 rounded-lg text-xs"
                                />
                              ) : (
                                <span className="text-xs text-gray-700">
                                  {co.target_pct != null
                                    ? `${co.target_pct}%`
                                    : "—"}
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3 align-top">
                              <div className="flex justify-end gap-2">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={saveEditCO}
                                      className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs flex items-center gap-1"
                                    >
                                      <Save className="w-3.5 h-3.5" />
                                      Save
                                    </button>
                                    <button
                                      onClick={cancelEditCO}
                                      className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-800 text-xs flex items-center gap-1"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => startEditCO(co)}
                                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs flex items-center gap-1"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => deleteCO(co.id)}
                                      className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs flex items-center gap-1"
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
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </section>
  );
};

export default CO;
