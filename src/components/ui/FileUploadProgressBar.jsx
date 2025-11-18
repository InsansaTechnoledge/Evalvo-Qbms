// src/components/application/file-upload/FileUploadProgressBar.jsx
import React, { useState } from "react";
import { FileUpload } from "./file-upload-base";

const uploadFile = (file, onProgress) => {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 5;
    if (progress > 100) progress = 100;
    onProgress(progress);
    if (progress === 100) {
      clearInterval(interval);
    }
  }, 120);
};

// const placeholderFiles = [
//   {
//     id: "file-01",
//     name: "Example dashboard screenshot.jpg",
//     type: "image/jpeg",
//     size: 720 * 1024,
//     progress: 50,
//   },
//   {
//     id: "file-02",
//     name: "Tech design requirements_2.pdf",
//     type: "application/pdf",
//     size: 720 * 1024,
//     progress: 100,
//   },
//   {
//     id: "file-03",
//     name: "Tech design requirements.pdf",
//     type: "application/pdf",
//     size: 1024 * 1024 * 1,
//     progress: 0,
//     failed: true,
//   },
// ];

export const FileUploadProgressBar = ({ isDisabled }) => {
//   const [uploadedFiles, setUploadedFiles] = useState(placeholderFiles);
  const [uploadedFiles, setUploadedFiles] = useState([]);


  const handleDropFiles = (files) => {
    const newFilesArray = Array.from(files);

    const newFilesWithIds = newFilesArray.map((file) => ({
      id: Math.random().toString(36).slice(2),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      fileObject: file,
    }));

    // show in UI
    setUploadedFiles((prev) => [
      ...newFilesWithIds.map(({ fileObject, ...rest }) => rest),
      ...prev,
    ]);

    // start uploads
    newFilesWithIds.forEach(({ id, fileObject }) => {
      uploadFile(fileObject, (progress) => {
        setUploadedFiles((prev) =>
          prev.map((uploadedFile) =>
            uploadedFile.id === id
              ? { ...uploadedFile, progress, failed: false }
              : uploadedFile
          )
        );
      });
    });
  };

  const handleDeleteFile = (id) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleRetryFile = (id) => {
    const file = uploadedFiles.find((f) => f.id === id);
    if (!file) return;

    // In a real app, you’d keep the original File; here we simulate
    const dummyFile = new File([], file.name, { type: file.type });

    uploadFile(dummyFile, (progress) => {
      setUploadedFiles((prev) =>
        prev.map((uploadedFile) =>
          uploadedFile.id === id
            ? { ...uploadedFile, progress, failed: false }
            : uploadedFile
        )
      );
    });
  };

  return (
    <FileUpload.Root>
      <FileUpload.DropZone
        isDisabled={isDisabled}
        onDropFiles={handleDropFiles}
      />

      <FileUpload.List>
        {uploadedFiles.map((file) => (
          <FileUpload.ListItemProgressBar
            key={file.id}
            {...file}
            size={file.size}
            onDelete={() => handleDeleteFile(file.id)}
            onRetry={() => handleRetryFile(file.id)}
          />
        ))}
      </FileUpload.List>
    </FileUpload.Root>
  );
};
