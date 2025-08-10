import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// --- No changes to the API hook ---
const useAuthApi = () => {
    const [loading, setLoading] = useState(false);
    const loginUser = async (email, password) => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'An unknown error occurred.');
            }
            return data;
        } finally {
            setLoading(false);
        }
    };
    return { loginUser, loading };
};

const Login = () => {
    // --- No changes to the component logic ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    
    const { loginUser, loading } = useAuthApi();
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        setError(null);
        setIsSuccess(false);
        try {
            const data = await loginUser(email, password);
            setIsSuccess(true);
            localStorage.setItem('prograde_token', data.token);
            localStorage.setItem('prograde_user', JSON.stringify(data.user));
            setTimeout(() => {
                if (data.user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else if (data.user.role === 'faculty') {
                    navigate('/faculty/dashboard');
                } else {
                    navigate('/student/dashboard');
                }
            }, 1500);
        } catch (err) {
            setError(err.message);
        }
    };
    
    // --- Animation variants remain the same ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.3, delayChildren: 0.2 }
        }
    };
    
    const textVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    // --- UPDATED JSX FOR A CLEANER, TRANSPARENT DESIGN ---
    return (
        <div className='bg-gradient-to-br from-[#abd2ff] via-[#639bdb] to-[#2b7fff] min-h-screen flex items-center justify-center p-4 text-white font-sans'>
            <div className="w-full max-w-4xl mx-auto">
                {/* Main container with a more subtle blur and border */}
                <div className="grid grid-cols-1 lg:grid-cols-2 bg-black/20 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/10">
                    
                    {/* Left Column: Login Form */}
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                        <h2 className="text-3xl font-bold mb-2 text-center text-white">Login</h2>
                        <p className="text-gray-200 text-center mb-8">Welcome back to ProGrade</p>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-200">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 transition-shadow"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-200">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 transition-shadow"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-center text-gray-700 text-sm font-medium"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                                <Button 
                                    type="submit" 
                                    className={`w-full py-3 text-md font-bold text-white cursor-pointer transition-all duration-300 rounded-lg ${isSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`} 
                                    disabled={loading || isSuccess}
                                >
                                    {isSuccess ? 'Success!' : loading ? 'Logging In...' : 'Login'}
                                </Button>
                            </motion.div>
                        </form>
                    </div>

                    {/* Right Column: Animated Text */}
                    <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-black/10">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="text-center space-y-4"
                        >
                            <motion.h1 
                                variants={textVariants} 
                                className="text-5xl font-extrabold tracking-tight text-white"
                            >
                                Welcome to 
                                <span className="text-blue-300"> ProGrade</span>
                            </motion.h1>
                            <motion.p 
                                variants={textVariants}
                                className="text-lg text-gray-200 max-w-sm"
                            >
                                A Rubrics-based Project Evaluation System designed for clarity and fairness.
                            </motion.p>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;
