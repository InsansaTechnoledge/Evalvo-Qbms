import React from "react";
import { AlertCircle } from "lucide-react";

export function DeleteModal({
  title = "Delete item?",
  description,
  warning = "This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertCircle className="w-6 h-6" />
          <h3 className="text-xl font-bold">{title}</h3>
        </div>

        {description && <p className="text-gray-700 mb-2">{description}</p>}

        <p className="text-sm text-gray-500 mb-6">{warning}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition"
          >
            {!loading ? confirmLabel : 'Loading...'}
          </button>
        </div>
      </div>
    </div>
  );
}
