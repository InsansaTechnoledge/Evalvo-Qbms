// src/components/application/file-upload/file-upload-base.jsx
import React, { useRef } from "react";
import { X, RotateCcw, Trash, Trash2 } from "lucide-react";

// ==== Helpers ====
export const getReadableFileSize = (size) => {
  if (size === undefined || size === null) return "-";
  const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  const units = ["B", "KB", "MB", "GB", "TB"];
  const value = size / Math.pow(1024, i);
  return `${value.toFixed(1)} ${units[i]}`;
};

// ==== Root ====
const Root = ({ children }) => {
  return <div className="space-y-4">{children}</div>;
};

// ==== DropZone ====
const DropZone = ({ isDisabled, onDropFiles }) => {
  const inputRef = useRef(null);

  const handleClick = () => {
    if (isDisabled) return;
    inputRef.current?.click();
  };

  const handleChange = (e) => {
    if (!e.target.files || isDisabled) return;
    onDropFiles && onDropFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDisabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDropFiles && onDropFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className={`border-2 border-gray-400/40 rounded-xl p-6 flex flex-col items-center justify-center text-sm cursor-pointer transition
        ${
          isDisabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-blue-500 hover:bg-blue-50/40"
        }`}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <p className="font-medium"> <span className="text-blue-600 hover:underline">Click to upload</span> or drag and drop</p>
      {/* <p className="text-xs text-gray-500 mt-1">
        Supports multiple files. Max size depends on your backend.
      </p> */}
    </div>
  );
};

// ==== List ====
const List = ({ children }) => {
  return <div className="space-y-2 max-h-80  p-6 overflow-y-auto ">{children}</div>;
};

// ==== ListItemProgressBar ====
const ListItemProgressBar = ({
  name,
  size,
  progress,
  failed,
  onDelete,
  onRetry,
}) => {
  const isComplete = progress >= 100 && !failed;

  return (
    <div className="flex items-center gap-3 rounded-lg  border-2 border-gray-400/40 px-3 py-2 bg-white">
      {/* Left: file info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs mt-1 text-gray-500">{getReadableFileSize(size)}</p>

        {/* Progress bar */}
        <div className="mt-1 h-2 rounded-full  bg-gray-200 overflow-hidden">
          <div
            className={`h-full transition-all ${
              failed
                ? "bg-red-500"
                : isComplete
                ? "bg-blue-500"
                : "bg-blue-500"
            }`}
            style={{ width: `${Math.min(progress || 0, 100)}%` }}
          />
        </div>

        <p
          className={`mt-2.5 text-xs font-bold ${
            failed
              ? "text-red-600"
              : isComplete
              ? "text-green-600"
              : "text-gray-500"
          }`}
        >
          {failed
            ? "Upload failed"
            : isComplete
            ? "Completed"
            : `Uploading… ${progress || 0}%`}
        </p>
      </div>

      {/* Right: actions */}
      <div className="flex mt-1 items-center gap-2 ml-2">
        {failed && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center rounded-full border px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Retry
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center justify-center rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// ==== Namespace-style export ====
export const FileUpload = {
  Root,
  DropZone,
  List,
  ListItemProgressBar,
};
