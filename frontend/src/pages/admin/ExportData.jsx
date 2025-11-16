import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import apiFetch from '@/lib/api';
import { motion } from 'framer-motion';
import BreadcrumbNavigation from '@/components/ui/BreadcrumNavigation';

const ExportData = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleExportMasterData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('prograde_token');
      
      const response = await apiFetch('/api/admin/export-master-data', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `master_data_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Master data exported successfully!');
    } catch (error) {
      console.error('Error exporting master data:', error);
      toast.error('Failed to export master data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <BreadcrumbNavigation />

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Export Data</h1>
          <p className="text-sm text-slate-600 mt-2">Export all course, project, and evaluation data to an Excel file.</p>
        </div>

        {/* Export Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-md border-blue-200">
            <CardHeader className="bg-blue-50 border-b border-blue-200">
              <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
                <Download className="h-5 w-5" />
                Master Data Export
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">What's included in this export?</h3>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Course Code, Name, Semester, and Year</li>
                    <li>Group Number and Name</li>
                    <li>Project Title and Description</li>
                    <li>Internal and External Guide Names</li>
                    <li>Student Names and Emails (comma-separated)</li>
                    <li>GitHub, Final Report, and Presentation Links</li>
                    <li>All Evaluation Scores by Rubric</li>
                    <li>Evaluator Names and Evaluation Dates</li>
                  </ul>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> This will export all data from the system. The file will be formatted as an Excel spreadsheet (.xlsx) with proper styling and headers.
                  </p>
                </div>

                <button
                  onClick={handleExportMasterData}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Generating Excel File...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      <span>Export Master Data</span>
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-900">Excel Format</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-2">
              <p>✓ Professional formatting with color-coded headers</p>
              <p>✓ Properly sized columns for readability</p>
              <p>✓ All data in a single worksheet</p>
              <p>✓ Ready for further analysis or reporting</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-900">Data Structure</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-2">
              <p>✓ One row per evaluation per project</p>
              <p>✓ Project data repeated for multiple evaluations</p>
              <p>✓ All student info aggregated by project</p>
              <p>✓ Complete evaluation history included</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExportData;
