import React from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";

const typeStyles = {
  success: {
    wrapper: "bg-green-600 text-white",
    Icon: CheckCircle,
  },
  error: {
    wrapper: "bg-red-600 text-white",
    Icon: AlertCircle,
  },
  info: {
    wrapper: "bg-blue-600 text-white",
    Icon: AlertCircle,
  },
};

export function Toast({ message, type = "success", onClose }) {
  const config = typeStyles[type] || typeStyles.info;
  const Icon = config.Icon;

  if (!message) return null;

  return (
    <div
      className={`
        fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-2xl
        animate-in slide-in-from-bottom-5 fade-in
        flex items-center gap-3 max-w-md z-50
        ${config.wrapper}
      `}
    >
      <Icon className="w-5 h-5" />
      <p className="font-medium flex-1">{message}</p>
      <button onClick={onClose} className="hover:opacity-75">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
