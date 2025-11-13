import React, { useRef, useState } from "react";
import { X, UploadCloud } from "lucide-react";

const UploadGroupsModal = ({
  open,
  onClose,
  onUpload,
  uploading,
  uploadError,
  uploadSuccess,
}) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  if (!open) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "text/csv") {
      setFile(f);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.type === "text/csv") {
      setFile(f);
    }
  };

  const handleSubmit = (e) => {
    if (file) onUpload(file);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">

        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Upload Project Groups CSV
        </h2>

        <p className="text-sm text-gray-700 mb-4">
          Ensure your CSV contains the following columns:
        </p>

        <ul className="list-disc pl-5 text-sm text-gray-600 mb-4 space-y-1">
          <li><b>GroupNo</b>, <b>GroupName</b>, <b>ProjectTitle</b>, <b>ProjectDescription</b></li>
          <li><b>FileUrl</b>, <b>InternalGuideEmail</b>, <b>ExternalGuideName</b>, <b>StudentEmail</b></li>
          <li>Accepted file: <b>.csv</b> (max ~10MB)</li>
        </ul>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-blue-300"
            }`}
          >
            <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
            <div className="mt-2">
              <span className="text-blue-600 font-medium">Upload a file</span>
              <div className="text-xs text-gray-500">CSV up to 10MB</div>
            </div>

            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* File Selected */}
          {file && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-green-800 text-sm font-medium">
                  {file.name} ({Math.round(file.size / 1024)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Errors */}
          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <span className="text-red-800 text-sm">{uploadError}</span>
            </div>
          )}

          {/* Success */}
          {uploadSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <span className="text-green-800 text-sm">{uploadSuccess}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {uploading ? "Uploading..." : "Upload CSV"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadGroupsModal;
