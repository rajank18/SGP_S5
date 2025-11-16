import React, { useState } from "react";
import toast from "react-hot-toast";
import apiFetch from '@/lib/api'
import { Download, Loader, X } from "lucide-react";
import { generateExcelExport, generateCSVExport } from "@/utils/exportToExcel";

const ExportCourseData = ({ courseId, courseName }) => {
    const [loading, setLoading] = useState(false);
    const [exportFormat, setExportFormat] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const token = localStorage.getItem("prograde_token");

    const handleFormatClick = (format) => {
        setExportFormat(format);
        setOpenModal(true);
    };

    const handleExport = async () => {
        if (!courseId) {
            toast.error("Course ID is required");
            return;
        }

        setLoading(true);
        try {
            const response = await apiFetch(`/api/faculty/courses/${courseId}/export`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Export failed");
            }

            const data = await response.json();

            if (!data.success || !data.data || data.data.length === 0) {
                toast.error("No data found to export");
                return;
            }

            if (exportFormat === "excel") {
                await generateExcelExport(
                    data.data,
                    courseName || "Course_Export",
                    new Date(data.exportDate)
                );
            } else {
                generateCSVExport(data.data, courseName || "Course_Export");
            }

            toast.success(`Exported as ${exportFormat.toUpperCase()}`);
            setOpenModal(false);

        } catch (err) {
            toast.error(err.message || "Failed to export");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Buttons inline */}
            <div className="flex gap-3">
                <button
                    onClick={() => handleFormatClick("excel")}
                    className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-sm transition"
                >
                    Excel (.xlsx)
                </button>

                <button
                    onClick={() => handleFormatClick("csv")}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition"
                >
                    CSV (.csv)
                </button>
            </div>

            {/* MODAL */}
            {openModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative animate-fadeIn">

                        {/* Close Button */}
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                            onClick={() => setOpenModal(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-semibold text-gray-800 mb-3">
                            Export as {exportFormat?.toUpperCase()}
                        </h2>

                        <p className="text-sm text-gray-600 mb-4">
                            The following details will be included in your export:
                        </p>

                        <ul className="text-sm text-gray-700 space-y-1 mb-6">
                            <li>• Group Names & Project Titles</li>
                            <li>• Student Names</li>
                            <li>• Final Report, PPT & GitHub Link</li>
                            <li>• Rubric-wise Evaluation Scores</li>
                            <li>• Weekly Submission Status</li>
                            <li>• Summary Sheet (for Excel)</li>
                        </ul>

                        {/* Export Button */}
                        <button
                            onClick={handleExport}
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 shadow disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader className="h-4 w-4 animate-spin" />
                                    Generating Export...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4" />
                                    Download {exportFormat?.toUpperCase()}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ExportCourseData;
