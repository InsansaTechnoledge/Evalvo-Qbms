// src/pages/admin/programs/COPOmapping.jsx

import React, { useMemo, useState } from "react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { StatsCard } from "../../../components/ui/StatsCard";
import { Toast } from "../../../components/ui/Toast";
import { Pause, Play, Square, Volume2 } from "lucide-react";
import { useTTS } from "../../../hooks/useTTS";
import {
  ProgramData,
  CourseSubjects,
  CourseSubjectCO as CourseSubjectCOData,
  ProgramOutcomeData,
  CourseCoProgramPoMap as InitialCoPoMap,
} from "../../../utils/Constants";

const DESCRIPTION_TEXT = `
The CO–PO Mapping Matrix connects Course Outcomes for a specific subject to Program Outcomes for a program. Each cell in the matrix captures how strongly a Course Outcome supports a Program Outcome, using correlation levels: one for low, two for medium, and three for high.

In Evalvo QBMS, this matrix is used for accreditation, reporting, and blueprint enforcement. You can quickly see whether every Program Outcome is supported by at least one Course Outcome, and whether any Course Outcome is under-mapped or over-mapped.
`.trim();

const COPOmapping = () => {
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [coPoMap, setCoPoMap] = useState(InitialCoPoMap || []);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  // ====== TTS hook ======
  const { voices, speak, cancel, pause, resume, speaking, paused } = useTTS();
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(1);

  const selectedVoice = useMemo(() => {
    return  voices?.[1] || null;
  }, [voices, selectedVoiceIndex, voices]);
  // =======================

  const selectedProgram = useMemo(
    () =>
      ProgramData.find(
        (p) =>
          p.id === selectedProgramId ||
          p._id === selectedProgramId ||
          p.code === selectedProgramId
      ) || null,
    [selectedProgramId]
  );

  const subjectsForProgram = useMemo(() => {
    if (!selectedProgramId) return [];
    return CourseSubjects.filter(
      (s) =>
        s.programId === selectedProgramId ||
        s.program_id === selectedProgramId
    );
  }, [selectedProgramId]);

  const cosForSubject = useMemo(() => {
    if (!selectedSubjectId) return [];
    return CourseSubjectCOData.filter(
      (co) =>
        co.course_subject_id === selectedSubjectId ||
        co.courseSubjectId === selectedSubjectId
    );
  }, [selectedSubjectId]);

  const posForProgram = useMemo(() => {
    if (!selectedProgramId) return [];
    return ProgramOutcomeData.filter(
      (po) =>
        po.programId === selectedProgramId ||
        po.program_id === selectedProgramId
    );
  }, [selectedProgramId]);

  const getCorrelation = (coId, poId) => {
    const found = coPoMap.find(
      (m) => m.co_id === coId && m.po_id === poId
    );
    return found?.correlation ?? 0; // 0 = no mapping
  };

  const handleCellClick = (coId, poId) => {
    setCoPoMap((prev) => {
      const existing = prev.find(
        (m) => m.co_id === coId && m.po_id === poId
      );

      // cycle: 0 → 1 → 2 → 3 → 0 (remove)
      if (!existing) {
        const id =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `map-${Date.now()}-${coId}-${poId}`;

        showToast("Mapping set to Low (1)", "success");

        return [
          ...prev,
          {
            id,
            co_id: coId,
            po_id: poId,
            correlation: 1,
          },
        ];
      }

      const next = (existing.correlation + 1) % 4;

      if (next === 0) {
        // remove mapping
        showToast("Mapping cleared", "success");
        return prev.filter((m) => m.id !== existing.id);
      }

      showToast(
        `Mapping updated to ${
          next === 1 ? "Low (1)" : next === 2 ? "Medium (2)" : "High (3)"
        }`,
        "success"
      );

      return prev.map((m) =>
        m.id === existing.id ? { ...m, correlation: next } : m
      );
    });
  };

  const stats = useMemo(() => {
    let total = 0;
    let low = 0;
    let medium = 0;
    let high = 0;

    cosForSubject.forEach((co) => {
      posForProgram.forEach((po) => {
        const corr = getCorrelation(co.id, po.id);
        if (corr > 0) {
          total += 1;
          if (corr === 1) low += 1;
          if (corr === 2) medium += 1;
          if (corr === 3) high += 1;
        }
      });
    });

    return { total, low, medium, high };
  }, [cosForSubject, posForProgram, coPoMap]);

  const correlationStyle = (value) => {
    switch (value) {
      case 1:
        return {
          label: "1",
          title: "Low correlation",
          className:
            "bg-emerald-50 text-emerald-700 border border-emerald-200",
        };
      case 2:
        return {
          label: "2",
          title: "Medium correlation",
          className: "bg-blue-50 text-blue-700 border border-blue-200",
        };
      case 3:
        return {
          label: "3",
          title: "High correlation",
          className: "bg-indigo-50 text-indigo-700 border border-indigo-200",
        };
      default:
        return {
          label: "—",
          title: "No correlation (click to set)",
          className:
            "bg-gray-50 text-gray-400 border border-dashed border-gray-300",
        };
    }
  };

  // ====== TTS toggle: describe matrix + current mapping summary ======
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

    if (
      selectedProgram &&
      selectedSubjectId &&
      cosForSubject.length > 0 &&
      posForProgram.length > 0 &&
      stats.total > 0
    ) {
      const subject =
        CourseSubjects.find((s) => s.id === selectedSubjectId) || null;

      const header = `
CO–PO mapping summary for program ${selectedProgram.name}${
        selectedProgram.code ? `, code ${selectedProgram.code}` : ""
      } and subject ${
        subject?.name || "selected subject"
      }. There are ${cosForSubject.length} Course Outcomes and ${
        posForProgram.length
      } Program Outcomes. Total active mappings ${stats.total}, with ${
        stats.high
      } high, ${stats.medium} medium, and ${stats.low} low correlations.
      `;

      const body = cosForSubject
        .map((co) => {
          const highPOs = [];
          const medPOs = [];
          const lowPOs = [];

          posForProgram.forEach((po) => {
            const c = getCorrelation(co.id, po.id);
            if (c === 3) highPOs.push(po.code);
            if (c === 2) medPOs.push(po.code);
            if (c === 1) lowPOs.push(po.code);
          });

          let line = `Course Outcome ${co.code}: `;

          const parts = [];
          if (highPOs.length)
            parts.push(
              `high correlation with ${highPOs.join(", ")}`
            );
          if (medPOs.length)
            parts.push(
              `medium correlation with ${medPOs.join(", ")}`
            );
          if (lowPOs.length)
            parts.push(`low correlation with ${lowPOs.join(", ")}`);

          if (!parts.length) {
            line += "no mapped Program Outcomes yet.";
          } else {
            line += parts.join("; ") + ".";
          }

          return line;
        })
        .join(" ");

      textToSpeak = (header + " " + body).trim();
    }

    if (!textToSpeak.trim()) return;

    speak({
      text: textToSpeak,
      voice: selectedVoice,
      rate: 1.0,
    });
  };
  // ================================================================

  return (
    <section>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="CO–PO Mapping Matrix"
          subtitle="Visualise and maintain correlation between Course Outcomes (CO) and Program Outcomes (PO)"
          align="center"
        />

        {/* Info + TTS Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-start gap-3 mb-3">
              <Volume2 className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  How to read the CO–PO Matrix
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">
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
                    : "Listen to CO–PO explanation or summary"
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
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 mb-8">
          <StatsCard
            title="Total Active Mappings"
            value={stats.total}
            color="blue"
          />
          <StatsCard title="High (3)" value={stats.high} color="blue" />
          <StatsCard title="Medium (2)" value={stats.medium} color="blue" />
          <StatsCard title="Low (1)" value={stats.low} color="blue" />
        </div>

        {/* Program + Subject selection */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Program select */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                Select Program
              </label>
              <select
                value={selectedProgramId}
                onChange={(e) => {
                  setSelectedProgramId(e.target.value);
                  setSelectedSubjectId("");
                }}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Subject pills */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                Select Subject (Course)
              </label>
              {!selectedProgramId ? (
                <p className="text-xs text-gray-500">
                  Choose a program first to view its subjects.
                </p>
              ) : subjectsForProgram.length === 0 ? (
                <p className="text-xs text-gray-500">
                  No subjects found for this program.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {subjectsForProgram.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSubjectId(s.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium border transition ${
                        selectedSubjectId === s.id
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {s.name}{" "}
                      {s.code ? (
                        <span className="text-[10px] opacity-80">
                          ({s.code})
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-gray-600">
            <span className="font-semibold mr-1">Legend:</span>
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-gray-200 border border-gray-300" />
              No Mapping
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-emerald-100 border border-emerald-300" />
              Low (1)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-blue-100 border border-blue-300" />
              Medium (2)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-indigo-100 border border-indigo-300" />
              High (3)
            </span>
            <span className="ml-auto text-[11px] text-gray-400">
              Tip: Click on a cell to cycle mapping 0 → 1 → 2 → 3 → 0
            </span>
          </div>
        </div>

        {/* Matrix */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              CO–PO Correlation Matrix
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Rows represent{" "}
              <span className="font-semibold">Course Outcomes (CO)</span> of the
              selected Subject, and columns represent{" "}
              <span className="font-semibold">Program Outcomes (PO)</span> of
              the selected Program.
            </p>
          </div>

          {!selectedProgramId || !selectedSubjectId ? (
            <div className="px-6 py-12 text-center text-gray-500 text-sm">
              Please select a program and subject to view the CO–PO mapping.
            </div>
          ) : posForProgram.length === 0 || cosForSubject.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 text-sm">
              {posForProgram.length === 0
                ? "No Program Outcomes defined for this program."
                : "No Course Outcomes defined for this subject."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-t border-gray-100">
                <thead>
                  <tr>
                    <th className="bg-white sticky left-0 z-10 px-4 py-3 border-r border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                      CO \ PO
                    </th>
                    {posForProgram.map((po) => (
                      <th
                        key={po.id}
                        className="px-4 py-3 text-xs font-semibold text-gray-700 border-b border-gray-200 bg-gray-50 text-center"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-gray-200 text-gray-800 text-[11px] font-semibold">
                            {po.code}
                          </span>
                          <span className="text-[10px] text-gray-500 max-w-[160px] line-clamp-2">
                            {po.statement}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cosForSubject.map((co) => (
                    <tr key={co.id} className="border-t border-gray-100">
                      {/* CO label column */}
                      <td className="sticky left-0 z-10 bg-white border-r border-gray-200 px-4 py-3 align-top">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-semibold">
                            {co.code}
                          </span>
                          <span className="text-[11px] text-gray-600 max-w-[200px] line-clamp-3">
                            {co.statement}
                          </span>
                        </div>
                      </td>

                      {/* Cells */}
                      {posForProgram.map((po) => {
                        const corr = getCorrelation(co.id, po.id);
                        const { label, title, className } =
                          correlationStyle(corr);

                        return (
                          <td
                            key={po.id}
                            className="px-4 py-3 text-center align-middle cursor-pointer"
                            onClick={() => handleCellClick(co.id, po.id)}
                          >
                            <div
                              className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-xs font-semibold select-none transition ${className}`}
                              title={title}
                            >
                              {label}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

export default COPOmapping;
