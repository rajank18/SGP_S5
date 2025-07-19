import React, { useState } from 'react';
import Dashboard from '../faculty/Dashboard';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const Login = () => {
    // State for form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // State for loading and error messages
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Initialize the navigate function
    const navigate = useNavigate();

    // --- Form Submission Handler ---
    const handleLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Login was successful
                console.log('Login successful:', data);

                // Store token and user info
                localStorage.setItem('prograde_token', data.token);
                localStorage.setItem('prograde_user', JSON.stringify(data.user));

                // --- NEW: Conditional Redirection ---
                if (data.user.role === 'faculty') {
                    // If user is a faculty, redirect to faculty dashboard
                    alert(`Welcome, ${data.user.name}! Redirecting to your dashboard...`);
                    navigate('/faculty/dashboard'); // URL for the faculty dashboard
                } else {
                    // If user is a student, redirect to student dashboard
                    alert(`Welcome, ${data.user.name}! Redirecting to your dashboard...`);
                    navigate('/student/dashboard'); // Example URL for the student dashboard
                }
                
            } else {
                // Login failed
                setError(data.message || 'An unknown error occurred.');
            }

        } catch (err) {
            // Handle network errors
            console.error('Network or server error:', err);
            if (err instanceof TypeError && err.message === 'Failed to fetch') {
                setError('Connection Error: Could not connect to the server.');
            } else {
                setError('An unexpected client-side error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='bg-black min-h-screen flex items-center justify-center px-4'>
            <Card className="w-full max-w-md text-white bg-gray-900 p-8 rounded-2xl shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-3xl">Welcome Back</CardTitle>
                    <CardDescription className="text-gray-400">
                        Login to your account to continue
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                required
                                className="bg-gray-800 text-white"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                className="bg-gray-800 text-white"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="remember" />
                                <Label htmlFor="remember" className="text-sm">Remember me</Label>
                            </div>
                            <a
                                href="#"
                                className="text-sm text-blue-400 hover:underline"
                            >
                                Forgot password?
                            </a>
                        </div>
                        
                        {error && (
                            <div className="text-center text-red-500 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full py-6 text-lg" disabled={loading}>
                            {loading ? 'Logging In...' : 'Login'}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col items-center mt-4 gap-2">
                    <span className="text-gray-400 text-sm">Don't have an account?</span>
                    <Button variant="link" className="text-blue-400 text-sm">Sign Up</Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default Login;
