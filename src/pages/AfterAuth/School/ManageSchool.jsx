import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { Edit2, Trash2, Save, X, Search, AlertCircle, CheckCircle } from "lucide-react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { StatsCard } from "../../../components/ui/StatsCard";
import { DeleteModal } from "../../../components/ui/DeleteModal";
import { Toast } from "../../../components/ui/Toast";
import { useUser } from "../../../contexts/UserContext";
import { deleteSchool, getSchool } from "../../../services/schoolService";

const validateSchoolData = (data) => {
  const errors = {};
  
  if (!data.name?.trim()) {
    errors.name = "School name is required";
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
    errors.duration_semsters = "Duration must be 1-12 semesters";
  }
  
  return errors;
};

const ManageSchool = () => {
  const [schoolData, setSchoolData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [draftRow, setDraftRow] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput , setSearchInput] = useState('')
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading , setLoading] = useState(false);

  const timeRef = useRef(null)

  // Show toast helper
  const showToast = useCallback((message, type ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const {user} = useUser();
  console.log("rs", user._id);
  

  useEffect(() => {
    const fetchSchoolData = async () => {
      
       const data = await getSchool({organization_id : user.role === 'organization' ? user._id : user.organization_id._id});

      setSchoolData(data.data);

      console.log("data2", schoolData);
    };
    fetchSchoolData();
  },[])

  // Filtered and searched data
  const filteredData = useMemo(() => {
    return schoolData?.filter((school) => {
      const matchesSearch = 
        school?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school?.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLevel = filterLevel === "ALL" || school.level === filterLevel;
      
      return matchesSearch && matchesLevel;
    });
  }, [schoolData, searchQuery, filterLevel]);

  // Statistics
  const stats = useMemo(() => {
    const uniqueSemesters = [...new Set(schoolData.map((s) => s.duration_semsters))];
    const ugSchools = schoolData.filter((s) => s.level === "UG").length;
    const pgSchools = schoolData.filter((s) => s.level === "PG").length;
    
    return {
      total: schoolData.length,
      uniqueSemesters: uniqueSemesters.length,
      ugSchools,
      pgSchools,
    };
  }, [schoolData]);

  // Handlers
  const handleEdit = useCallback((row) => {
    setEditingId(row.id);
    setDraftRow({ ...row });
    setValidationErrors({});
  }, []);

  const handleDraftChange = useCallback((field, value) => {
    setDraftRow((prev) => ({
      ...prev,
      [field]: field === "duration_semsters" ? (value === "" ? "" : Number(value)) : value,
    }));
    
    // Clear error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [validationErrors]);
  

  const handleSave = useCallback(() => {
    if (!draftRow) return;

    // Validate
    const errors = validateSchoolData(draftRow);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showToast("Please fix validation errors", "error");
      return;
    }

    // Check for duplicate code
    const duplicateCode = schoolData.some(
      (s) => s.id !== editingId && s.code.toLowerCase() === draftRow.code.toLowerCase()
    );
    
    if (duplicateCode) {
      setValidationErrors({ code: "This code already exists" });
      showToast("School code must be unique", "error");
      return;
    }

    // Save changes
    setSchoolData((prev) =>
      prev.map((row) => (row.id === editingId ? draftRow : row))
    );
    
    setEditingId(null);
    setDraftRow(null);
    setValidationErrors({});
    showToast("School updated successfully", "success");
  }, [draftRow, editingId, schoolData, showToast]);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setDraftRow(null);
    setValidationErrors({});
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    console.log("qwe", deleteTarget);
    
    if (!deleteTarget) return;

    
    try {
      setLoading(true)
      await deleteSchool(deleteTarget.id);
  
      showToast(`${deleteTarget.name} deleted successfully`, "success");
      setSchoolData((prev) => prev.filter((row) => row.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      showToast(`${e.message}`, "error");
      setDeleteTarget(null);
    }finally{
      setLoading(false);
    }
  
    // If we were editing this row, cancel editing
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

    if(timeRef.current) clearTimeout(timeRef.current)

    timeRef.current = setTimeout(() => {
      setSearchQuery(value.trim())
    },500)
  }

  return (
    <section className="">
      <div className="max-w-7xl mx-auto">
        
        <PageHeader
          title="Manage Schools"
          subtitle="Edit and organize your academic institutions"
          align="center"
        />

        {/* Stats Cards */}
        <div className="flex flex-wrap gap-4 mb-8">
          <StatsCard title="Total Schools" value={stats.total} color="blue" />
          <StatsCard title="Unique Semesters" value={stats.uniqueSemesters} color="blue" />
          <StatsCard title="UG Schools" value={stats.ugSchools} color="blue" />
          <StatsCard title="PG Schools" value={stats.pgSchools} color="blue" />
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or code..."
                value={searchInput}
                onChange={(e) => handleSearchDebouncing(e)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="sm:w-48">
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
          </div>
          
          {searchQuery || filterLevel !== "ALL" ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <span>Showing {filteredData.length} of {stats.total} schools</span>
              {(searchQuery || filterLevel !== "ALL") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterLevel("ALL");
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : null}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              Schools Directory
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Click <span className="font-semibold text-blue-600">Edit</span> to modify inline
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">School Name</th>
                  <th className="px-6 py-4 font-semibold">Code</th>
                  <th className="px-6 py-4 font-semibold">Level</th>
                  <th className="px-6 py-4 font-semibold">Duration</th>
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
                      className={`
                        transition-colors
                        ${isEditing ? "bg-blue-50" : "hover:bg-gray-50"}
                      `}
                    >
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        #{(row.id).slice(0,8)}
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div>
                            <input
                              type="text"
                              value={current.name}
                              onChange={(e) => handleDraftChange("name", e.target.value)}
                              className={`
                                w-full rounded-lg border-2 px-3 py-2 text-sm
                                focus:outline-none focus:ring-2 focus:ring-blue-500
                                ${validationErrors.name ? "border-red-400 bg-red-50" : "border-gray-300"}
                              `}
                              placeholder="School name"
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
                              className={`
                                w-full rounded-lg border-2 px-3 py-2 text-sm font-mono
                                focus:outline-none focus:ring-2 focus:ring-blue-500
                                ${validationErrors.code ? "border-red-400 bg-red-50" : "border-gray-300"}
                              `}
                              placeholder="e.g., SOE-001"
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
                            className={`
                              w-full rounded-lg border-2 px-3 py-2 text-sm
                              focus:outline-none focus:ring-2 focus:ring-blue-500
                              ${validationErrors.level ? "border-red-400 bg-red-50" : "border-gray-300"}
                            `}
                          >
                            <option value="">Select</option>
                            <option value="UG">UG</option>
                            <option value="PG">PG</option>
                          </select>
                        ) : (
                          <span className={`
                            inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold
                            ${(row.level) === "UG" || "ug" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}
                          `}>
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
                              onChange={(e) => handleDraftChange("duration_semsters", e.target.value)}
                              className={`
                                w-28 rounded-lg border-2 px-3 py-2 text-sm
                                focus:outline-none focus:ring-2 focus:ring-blue-500
                                ${validationErrors.duration_semsters ? "border-red-400 bg-red-50" : "border-gray-300"}
                              `}
                              placeholder="1-12"
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
                            {row.duration_semsters} sem{row.duration_semsters !== 1 ? "s" : ""}
                          </span>
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
                                title="Edit school"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteTarget(row)}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition"
                                title="Delete school"
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
                        <p className="text-lg font-medium">No schools found</p>
                        <p className="text-sm">
                          {searchQuery || filterLevel !== "ALL"
                            ? "Try adjusting your filters"
                            : "Add a new school to get started"}
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
          school={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          loading={loading}
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

export default ManageSchool;