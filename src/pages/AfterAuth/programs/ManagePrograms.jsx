import React, { useMemo, useState, useCallback } from "react";
import { Edit2, Trash2, Save, X, Search, AlertCircle } from "lucide-react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { StatsCard } from "../../../components/ui/StatsCard";
import { Toast } from "../../../components/ui/Toast";
import { ProgramData, Schools } from "../../../utils/Constants";
import { DeleteModal } from "../../../components/ui/DeleteModal";

/* ========= Helpers ========= */

const validateProgramData = (data) => {
  const errors = {};

  if (!data.name?.trim()) {
    errors.name = "Program name is required";
  } else if (data.name.trim().length < 3) {
    errors.name = "Name must be at least 3 characters";
  }

  if (!data.code?.trim()) {
    errors.code = "Code is required";
  } else if (!/^[A-Za-z0-9\-_.]{2,12}$/.test(data.code)) {
    errors.code = "Invalid code format";
  }

  if (!data.level || !["UG", "PG"].includes(data.level)) {
    errors.level = "Level must be UG or PG";
  }

  if (!data.duration_semsters || data.duration_semsters < 1 || data.duration_semsters > 12) {
    errors.duration_semsters = "Duration must be 1–12 semesters";
  }

  if (!data.schoolName?.trim()) {
    errors.schoolName = "School is required";
  }

  return errors;
};



const ManagePrograms = () => {
  const [programData, setProgramData] = useState(ProgramData);

  const [editingId, setEditingId] = useState(null);
  const [draftRow, setDraftRow] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [filterSchool, setFilterSchool] = useState("ALL");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  // Toast helper
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Unique schools for filter dropdown
  const schoolOptions = useMemo(() => {
    const names = Array.from(new Set(programData.map((p) => p.schoolName).filter(Boolean)));
    return names;
  }, [programData]);

  // Filtered & searched data
  const filteredData = useMemo(() => {
    return programData.filter((program) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        program.name.toLowerCase().includes(q) ||
        program.code.toLowerCase().includes(q) ||
        (program.schoolName || "").toLowerCase().includes(q);

      const matchesLevel = filterLevel === "ALL" || program.level === filterLevel;
      const matchesSchool = filterSchool === "ALL" || program.schoolName === filterSchool;

      return matchesSearch && matchesLevel && matchesSchool;
    });
  }, [programData, searchQuery, filterLevel, filterSchool]);

  // Stats
  const stats = useMemo(() => {
    const uniqueSemesters = [...new Set(programData.map((p) => p.duration_semsters))];
    const ugPrograms = programData.filter((p) => p.level === "UG").length;
    const pgPrograms = programData.filter((p) => p.level === "PG").length;
    const uniqueSchools = [...new Set(programData.map((p) => p.schoolName))].length;

    return {
      total: programData.length,
      uniqueSemesters: uniqueSemesters.length,
      ugPrograms,
      pgPrograms,
      uniqueSchools,
    };
  }, [programData]);

  /* ===== Handlers ===== */

  const handleEdit = useCallback((row) => {
    setEditingId(row.id);
    setDraftRow({ ...row });
    setValidationErrors({});
  }, []);

  const handleDraftChange = useCallback(
    (field, value) => {
      setDraftRow((prev) => ({
        ...prev,
        [field]:
          field === "duration_semsters"
            ? value === ""
              ? ""
              : Number(value)
            : value,
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

    const errors = validateProgramData(draftRow);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showToast("Please fix validation errors", "error");
      return;
    }

    // Check duplicate code
    const duplicateCode = programData.some(
      (p) => p.id !== editingId && p.code.toLowerCase() === draftRow.code.toLowerCase()
    );

    if (duplicateCode) {
      setValidationErrors((prev) => ({ ...prev, code: "This code already exists" }));
      showToast("Program code must be unique", "error");
      return;
    }

    setProgramData((prev) => prev.map((row) => (row.id === editingId ? draftRow : row)));
    setEditingId(null);
    setDraftRow(null);
    setValidationErrors({});
    showToast("Program updated successfully", "success");
  }, [draftRow, editingId, programData, showToast]);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setDraftRow(null);
    setValidationErrors({});
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;

    setProgramData((prev) => prev.filter((row) => row.id !== deleteTarget.id));
    showToast(`${deleteTarget.name} deleted successfully`, "success");
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


  return (
    <section className="">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Manage Programs"
          subtitle="Edit and organize academic programs under your schools"
          align="center"
        />

        {/* Stats */}
        <div className="flex flex-wrap gap-4 mb-8">
          <StatsCard title="Total Programs" value={stats.total} color="blue" />
          <StatsCard title="UG Programs" value={stats.ugPrograms} color="blue" />
          <StatsCard title="PG Programs" value={stats.pgPrograms} color="blue" />
          <StatsCard title="Unique Semesters" value={stats.uniqueSemesters} color="blue" />
          <StatsCard title="Linked Schools" value={stats.uniqueSchools} color="blue" />
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by program name, code, or school..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Level Filter */}
            <div className="lg:w-48">
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Levels</option>
                <option value="UG">UG Only</option>
                <option value="PG">PG Only</option>
              </select>
            </div>

            {/* School Filter */}
            <div className="lg:w-56">
              <select
                value={filterSchool}
                onChange={(e) => setFilterSchool(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Schools</option>
                {schoolOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(searchQuery || filterLevel !== "ALL" || filterSchool !== "ALL") && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <span>
                Showing {filteredData.length} of {stats.total} programs
              </span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterLevel("ALL");
                  setFilterSchool("ALL");
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Programs Directory</h2>
            <p className="text-sm text-gray-500 mt-1">
              Click <span className="font-semibold text-blue-600">Edit</span> to modify programs inline
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Program Name</th>
                  <th className="px-6 py-4 font-semibold">Code</th>
                  <th className="px-6 py-4 font-semibold">Level</th>
                  <th className="px-6 py-4 font-semibold">Duration</th>
                  <th className="px-6 py-4 font-semibold">School</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((row) => {
                  const isEditing = row.id === editingId;
                  const current = isEditing ? draftRow : row;

                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors ${
                        isEditing ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4 text-gray-700 font-medium">#{row.id}</td>

                      {/* Program Name */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div>
                            <input
                              type="text"
                              value={current.name}
                              onChange={(e) => handleDraftChange("name", e.target.value)}
                              className={`w-full rounded-lg border-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                validationErrors.name
                                  ? "border-red-400 bg-red-50"
                                  : "border-gray-300"
                              }`}
                              placeholder="Program name"
                            />
                            {validationErrors.name && (
                              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {validationErrors.name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-900 font-medium">{row.name}</span>
                        )}
                      </td>

                      {/* Code */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div>
                            <input
                              type="text"
                              value={current.code}
                              onChange={(e) => handleDraftChange("code", e.target.value)}
                              className={`w-full rounded-lg border-2 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                validationErrors.code
                                  ? "border-red-400 bg-red-50"
                                  : "border-gray-300"
                              }`}
                              placeholder="e.g., BTECH-CSE-01"
                            />
                            {validationErrors.code && (
                              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {validationErrors.code}
                              </p>
                            )}
                          </div>
                        ) : (
                          <code className="text-gray-700 bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                            {row.code}
                          </code>
                        )}
                      </td>

                      {/* Level */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select
                            value={current.level}
                            onChange={(e) => handleDraftChange("level", e.target.value)}
                            className={`w-full rounded-lg border-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              validationErrors.level
                                ? "border-red-400 bg-red-50"
                                : "border-gray-300"
                            }`}
                          >
                            <option value="">Select</option>
                            <option value="UG">UG</option>
                            <option value="PG">PG</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              row.level === "UG"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {row.level}
                          </span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div>
                            <input
                              type="number"
                              min={1}
                              max={12}
                              value={current.duration_semsters}
                              onChange={(e) =>
                                handleDraftChange("duration_semsters", e.target.value)
                              }
                              className={`w-28 rounded-lg border-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                validationErrors.duration_semsters
                                  ? "border-red-400 bg-red-50"
                                  : "border-gray-300"
                              }`}
                              placeholder="1–12"
                            />
                            {validationErrors.duration_semsters && (
                              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {validationErrors.duration_semsters}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-700">
                            {row.duration_semsters} sem
                            {row.duration_semsters !== 1 ? "s" : ""}
                          </span>
                        )}
                      </td>

                      {/* School */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select
                            value={current.schoolName || ""}
                            onChange={(e) => handleDraftChange("schoolName", e.target.value)}
                            className={`w-full rounded-lg border-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              validationErrors.schoolName
                                ? "border-red-400 bg-red-50"
                                : "border-gray-300"
                            }`}
                          >
                            <option value="">Select School</option>
                            {Schools.map((s, idx) => (
                              <option key={s.code || s._id || idx} value={s.name}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-800">{row.schoolName}</span>
                        )}
                        {isEditing && validationErrors.schoolName && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {validationErrors.schoolName}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={handleSave}
                                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 transition"
                                title="Save changes"
                              >
                                <Save className="w-3.5 h-3.5" />
                                Save
                              </button>
                              <button
                                onClick={handleCancel}
                                className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-300 transition"
                                title="Cancel editing"
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
                                title="Edit program"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteTarget(row)}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition"
                                title="Delete program"
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

                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <AlertCircle className="w-12 h-12" />
                        <p className="text-lg font-medium">No programs found</p>
                        <p className="text-sm">
                          {searchQuery || filterLevel !== "ALL" || filterSchool !== "ALL"
                            ? "Try adjusting your filters"
                            : "Start by adding a new program"}
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

       
      {deleteTarget && (
        <DeleteModal
          program={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}

      {/* Toast */}
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

export default ManagePrograms;
