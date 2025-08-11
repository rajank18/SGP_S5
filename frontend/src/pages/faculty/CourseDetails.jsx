import React, { useState, useEffect } from 'react';
import BackButton from '@/components/ui/BackButton';
import { useParams } from 'react-router-dom'; // To get the courseId from the URL

const CourseDetailsPage = () => {
    // --- State for Course Details ---
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loadingCourse, setLoadingCourse] = useState(true);
    const [courseError, setCourseError] = useState('');

    // --- State for CSV Upload ---
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');

    // Get the auth token from localStorage
    const token = localStorage.getItem('prograde_token');

    // --- Effect to fetch course details ---
    useEffect(() => {
        // This is where you would call an API like GET /api/faculty/courses/:courseId
        console.log(`Fetching details for course ID: ${courseId}`);
        // Simulating a successful fetch for now
        setCourse({
            id: courseId,
            name: 'Software Engineering',
            courseCode: 'IT501',
        });
        setLoadingCourse(false);
    }, [courseId]);

    // --- Handlers for File Upload ---
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setUploadError('');
        setUploadSuccess('');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setUploadError('Please select a CSV file to upload.');
            return;
        }
        if (!token) {
            setUploadError('Authentication error. Please log in again.');
            return;
        }

        setUploading(true);
        setUploadError('');
        setUploadSuccess('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(
                `http://localhost:3001/api/faculty/courses/${courseId}/projects/upload`,
                {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'File upload failed.');
            }

            setUploadSuccess(data.message);
            setFile(null); // Clear the file input

        } catch (err) {
            setUploadError(err.message);
        } finally {
            setUploading(false);
        }
    };

    // --- Render Logic ---
    if (loadingCourse) {
        return <div className="p-8">Loading course details...</div>;
    }

    if (courseError) {
        return <div className="p-8 text-red-500">Error: {courseError}</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <div className="mb-2">
                        <BackButton />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">{course.name}</h1>
                    <p className="text-lg text-gray-600">{course.courseCode}</p>
                </header>

                <main>
                    {/* --- CSV Upload Component JSX --- */}
                    <div className="mb-12">
                        <div className="bg-white rounded-xl shadow p-6 w-full max-w-2xl">
                            <h3 className="text-xl font-semibold text-gray-800">Upload Student Projects</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Select the CSV file containing student and project information for this course.
                            </p>
                            <form onSubmit={handleUpload} className="mt-4 space-y-4">
                                <div>
                                    <label htmlFor="file-upload" className="sr-only">Choose file</label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <button
                                        type="submit"
                                        disabled={uploading || !file}
                                        className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {uploading ? 'Uploading...' : 'Upload File'}
                                    </button>
                                    {/* Status Messages */}
                                    <div className="text-sm">
                                        {uploadError && <p className="text-red-600 font-medium">{uploadError}</p>}
                                        {uploadSuccess && <p className="text-green-600 font-medium">{uploadSuccess}</p>}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* This is where the list of project group cards will be displayed */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Project Groups</h2>
                        <div className="p-6 bg-white rounded-xl shadow">
                            <p className="text-gray-500">
                                After you upload the CSV file, the project groups assigned to you will appear here.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CourseDetailsPage;