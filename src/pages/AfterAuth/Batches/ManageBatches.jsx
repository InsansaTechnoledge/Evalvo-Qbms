import React, { useMemo, useState, useCallback, useRef } from "react";
import { Edit2, Trash2, Save, X, Search, AlertCircle } from "lucide-react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { StatsCard } from "../../../components/ui/StatsCard";
import { DeleteModal } from "../../../components/ui/DeleteModal";
import { Toast } from "../../../components/ui/Toast";
import { useBatchData } from "../../../components/AfterAuth/useBatchData";
import { createBatch, updateBatch } from "../../../services/batchService";


const validateBatchData = (data) => {
  const errors = {};

  if (!data.name?.trim()) {
    errors.name = "Batch name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Batch name must be at least 2 characters";
  } else if (data.name.trim().length > 100) {
    errors.name = "Batch name must be less than 100 characters";
  }

  if (!data.year && data.year !== 0) {
    errors.year = "Batch year is required";
  } else if (Number.isNaN(Number(data.year))) {
    errors.year = "Batch year must be a number";
  } else if (data.year < 1990 || data.year > 2100) {
    errors.year = "Year must be between 1990 and 2100";
  }

  return errors;
};

const ManageBatches = () => {
  const { batchData, loading, setBatches, setLoading } = useBatchData();

  const [editingId, setEditingId] = useState(null);
  const [draftRow, setDraftRow] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [filterSchool, setFilterSchool] = useState("ALL");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const timeRef = useRef(null)

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Unique schools for filter
  const schoolOptions = useMemo(() => {
    const names = new Set();
    batchData.forEach((b) => {
      if (b.schoolName) names.add(b.schoolName);
    });
    return Array.from(names);
  }, [batchData]);

  // Filter + search
  const filteredData = useMemo(() => {
    return batchData.filter((batch) => {
      const q = searchQuery.toLowerCase();

      const matchesSearch =
        !q ||
        batch.name?.toLowerCase().includes(q) ||
        batch.schoolName?.toLowerCase().includes(q) ||
        batch.programName?.toLowerCase().includes(q) ||
        String(batch.year || "").includes(q);

      const matchesSchool =
        filterSchool === "ALL" || batch.schoolName === filterSchool;

      return matchesSearch && matchesSchool;
    });
  }, [batchData, searchQuery, filterSchool]);

  // Stats
  const stats = useMemo(() => {
    const total = batchData.length;
    const uniqueYears = new Set(batchData.map((b) => b.year).filter(Boolean));
    const uniquePrograms = new Set(
      batchData.map((b) => b.programName).filter(Boolean)
    );

    return {
      total,
      uniqueYears: uniqueYears.size,
      uniquePrograms: uniquePrograms.size,
    };
  }, [batchData]);

  // Handlers
  const handleEdit = useCallback((row) => {
    setEditingId(row.id);
    setDraftRow({ ...row });
    setValidationErrors({});
  }, []);

  const handleDraftChange = useCallback(
    (field, value) => {
      setDraftRow((prev) => ({
        ...prev,
        [field]: field === "year" ? (value === "" ? "" : Number(value)) : value,
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

  const handleSave = useCallback(async () => {
    if (!draftRow) return;

    const errors = validateBatchData(draftRow);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showToast("Please fix validation errors", "error");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: draftRow.name.trim(),
        year: draftRow.year,
        program_id: draftRow.program_id,
        course_id: draftRow.course_id,
      }

      const response = await updateBatch(editingId, payload);
      setBatches(prev =>
        prev.map(row =>
          row.id === editingId ? { ...response.data } : { ...row }
        )
      );

      setEditingId(null);
      setDraftRow(null);
      setValidationErrors({});
      showToast("Batch updated successfully", "success");
    } catch (e) {
      console.error("Error updating batch:", e);
      showToast("Failed to update batch. Please try again.", "error");
    } finally {
      setLoading(false);
    }


  }, [draftRow, editingId, showToast]);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setDraftRow(null);
    setValidationErrors({});
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;

    setBatchData((prev) => prev.filter((row) => row.id !== deleteTarget.id));
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



  const handleSearchDebouncing = (e) => {
    const value = e.target.value

    setSearchInput(value);

    if (timeRef.current) clearTimeout(timeRef.current);

    timeRef.current = setTimeout(() => {
      setSearchQuery(value.trim())
    }, 500)

  }

  return (
    <section className="">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Manage Batches"
          subtitle="Edit and organize batches under your programs"
          align="center"
        />

        {/* Stats */}
        <div className="flex flex-wrap gap-4 mb-8">
          <StatsCard title="Total Batches" value={stats.total} color="blue" />
          <StatsCard
            title="Distinct Intake Years"
            value={stats.uniqueYears}
            color="blue"
          />
          <StatsCard
            title="Programs Covered"
            value={stats.uniquePrograms}
            color="blue"
          />
        </div>

        {/* Search + Filter */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by batch, school, program or year..."
                value={searchInput}
                onChange={(e) => handleSearchDebouncing(e)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="sm:w-56">
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

          {(searchQuery || filterSchool !== "ALL") && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <span>
                Showing {filteredData.length} of {batchData.length} batches
              </span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterSchool("ALL");
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {loading ? (<><div>loading...</div></>) :
          (
            <>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Batches Directory
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Click{" "}
                    <span className="font-semibold text-blue-600">Edit</span> to
                    modify inline
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-600 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 font-semibold">ID</th>
                        <th className="px-6 py-4 font-semibold">Batch Name</th>
                        <th className="px-6 py-4 font-semibold">Year</th>
                        <th className="px-6 py-4 font-semibold">School</th>
                        <th className="px-6 py-4 font-semibold">Program</th>
                        <th className="px-6 py-4 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredData.map((row) => {
                        const isEditing = row.id === editingId;
                        const current = isEditing ? draftRow : row;

                        return (
                          <tr
                            key={row.id}
                            className={`transition-colors ${isEditing ? "bg-blue-50" : "hover:bg-gray-50"
                              }`}
                          >
                            <td className="px-6 py-4 text-gray-700 font-medium">
                              #{row.id}
                            </td>

                            {/* Batch Name */}
                            <td className="px-6 py-4">
                              {isEditing ? (
                                <div>
                                  <input
                                    type="text"
                                    value={current.name || ""}
                                    onChange={(e) =>
                                      handleDraftChange("name", e.target.value)
                                    }
                                    className={`w-full rounded-lg border-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.name
                                        ? "border-red-400 bg-red-50"
                                        : "border-gray-300"
                                      }`}
                                    placeholder="Batch name"
                                  />
                                  {validationErrors.name && (
                                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" />
                                      {validationErrors.name}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-900 font-medium">
                                  {row.name}
                                </span>
                              )}
                            </td>

                            {/* Year */}
                            <td className="px-6 py-4">
                              {isEditing ? (
                                <div>
                                  <input
                                    type="number"
                                    value={current.year ?? ""}
                                    onChange={(e) =>
                                      handleDraftChange("year", e.target.value)
                                    }
                                    className={`w-28 rounded-lg border-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.year
                                        ? "border-red-400 bg-red-50"
                                        : "border-gray-300"
                                      }`}
                                    placeholder="2024"
                                  />
                                  {validationErrors.year && (
                                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" />
                                      {validationErrors.year}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-700">{row.year}</span>
                              )}
                            </td>

                            {/* School (read-only) */}
                            <td className="px-6 py-4">
                              <span className="text-gray-800">
                                {row.schoolName || "—"}
                              </span>
                            </td>

                            {/* Program (read-only) */}
                            <td className="px-6 py-4">
                              <span className="text-gray-800">
                                {row.programName || "—"}
                              </span>
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
                                      title="Edit batch"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => setDeleteTarget(row)}
                                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition"
                                      title="Delete batch"
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
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                              <AlertCircle className="w-12 h-12" />
                              <p className="text-lg font-medium">No batches found</p>
                              <p className="text-sm">
                                {searchQuery || filterSchool !== "ALL"
                                  ? "Try adjusting your filters"
                                  : "Create a batch first using Add Batches page"}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
      </div>


      {/* Delete Modal – reusing same DeleteModal API as ManageSchool */}
      {deleteTarget && (
        <DeleteModal
          school={deleteTarget}        // keep prop name same as existing component
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

export default ManageBatches;
