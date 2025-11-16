import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Mail, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import apiFetch from '@/lib/api'

const SendMailCSV = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [emailConfigValid, setEmailConfigValid] = useState(null);

  // Test email configuration on component mount
  React.useEffect(() => {
    testEmailConfig();
  }, []);

  const testEmailConfig = async () => {
    try {
      const token = localStorage.getItem("prograde_token");
      const res = await apiFetch(`/api/mail/test-config`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setEmailConfigValid(true);
        toast.success("Email configuration is valid");
      } else {
        setEmailConfigValid(false);
        const data = await res.json();
        toast.error(data.message || "Email configuration is invalid");
      }
    } catch (err) {
      setEmailConfigValid(false);
      console.error("Error testing email config:", err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error("Please select a CSV file");
        return;
      }
      setFile(selectedFile);
      setResult(null);
      toast.success(`File selected: ${selectedFile.name}`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file first");
      return;
    }

    if (emailConfigValid === false) {
      toast.error("Email configuration is not valid. Please configure EMAIL_USER and EMAIL_PASS in .env");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("csvFile", file);

      const token = localStorage.getItem("prograde_token");
      const res = await apiFetch(`/api/mail/send-bulk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        toast.success(`Successfully sent ${data.successful} emails!`);
        setFile(null);
        document.getElementById("csv-file-input").value = "";
      } else {
        toast.error(data.message || "Failed to send emails");
      }
    } catch (err) {
      console.error("Error uploading CSV:", err);
      toast.error("Error uploading CSV file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Mail className="w-6 h-6" />
              Bulk Email - Send Student Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Email Configuration Status */}
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              emailConfigValid === true 
                ? "bg-green-50 border border-green-200" 
                : emailConfigValid === false 
                ? "bg-red-50 border border-red-200" 
                : "bg-gray-50 border border-gray-200"
            }`}>
              {emailConfigValid === true ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">Email configuration is valid</span>
                </>
              ) : emailConfigValid === false ? (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700 font-medium">Email configuration is invalid. Please configure EMAIL_USER and EMAIL_PASS in backend .env</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700 font-medium">Checking email configuration...</span>
                </>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                CSV Format Instructions
              </h3>
              <p className="text-sm text-blue-800 mb-2">
                Your CSV file must contain the following columns (in order):
              </p>
              <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                <li><strong>id</strong> - Student ID</li>
                <li><strong>name</strong> - Student Name</li>
                <li><strong>email</strong> - Student Email Address</li>
                <li><strong>password</strong> - Temporary Password</li>
              </ul>
              <p className="text-sm text-blue-800 mt-2">
                Example: <code className="bg-blue-100 px-2 py-1 rounded">id,name,email,password</code>
              </p>
            </div>

            {/* File Upload Section */}
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <label
                  htmlFor="csv-file-input"
                  className="cursor-pointer text-center"
                >
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    Click to upload
                  </span>
                  <span className="text-gray-600"> or drag and drop</span>
                  <p className="text-sm text-gray-500 mt-1">CSV files only (max 5MB)</p>
                </label>
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {file && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setFile(null);
                      document.getElementById("csv-file-input").value = "";
                      toast.success("File removed");
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </motion.div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!file || loading || emailConfigValid === false}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-6 text-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending Emails...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Send Bulk Emails
                  </>
                )}
              </Button>
            </div>

            {/* Results Section */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">
                    Email Sending Results
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900">{result.total}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-600">Successful</p>
                      <p className="text-2xl font-bold text-green-600">{result.successful}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-600">Failed</p>
                      <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                    </div>
                  </div>

                  {/* Success List */}
                  {result.results.success.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Successfully Sent ({result.results.success.length})
                      </h4>
                      <div className="bg-white rounded-lg p-3 max-h-40 overflow-y-auto">
                        {result.results.success.map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-700 py-1 border-b last:border-b-0">
                            <span className="font-medium">{item.name}</span> - {item.email}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Failed List */}
                  {result.results.failed.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Failed to Send ({result.results.failed.length})
                      </h4>
                      <div className="bg-white rounded-lg p-3 max-h-40 overflow-y-auto">
                        {result.results.failed.map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-700 py-1 border-b last:border-b-0">
                            <span className="font-medium">{item.name}</span> - {item.email}
                            <p className="text-xs text-red-600 mt-1">{item.error}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SendMailCSV;
