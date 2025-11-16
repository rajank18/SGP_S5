import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import apiFetch from '@/lib/api'
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      setSuccess(true);
      setEmail('');

      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-gradient-to-br from-[#abd2ff] via-[#639bdb] to-[#2b7fff] min-h-screen flex items-center justify-center p-4 text-white font-sans'>
      <div className="w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/20 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/10 p-8 md:p-12"
        >
          {/* Back Button */}
          <button
            onClick={() => navigate('/auth/login')}
            className="flex items-center gap-2 text-gray-200 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Login</span>
          </button>

          <div className="flex justify-center mb-4">
            <div className="bg-blue-500/20 p-3 rounded-full">
              <Mail className="h-6 w-6 text-blue-300" />
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-2 text-center text-white">Forgot Password?</h2>
          <p className="text-gray-200 text-center mb-8 text-sm">
            Enter your email address and we'll send you a link to reset your password
          </p>

          <form onSubmit={handleForgotPassword} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">Email Address</Label>
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

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-100 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-100 text-sm space-y-2"
                >
                  <p className="font-semibold">✓ Email Sent!</p>
                  <p>Check your inbox for the password reset link. The link will expire in 15 minutes.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Button
                type="submit"
                className="w-full py-3 text-md font-bold text-white cursor-pointer transition-all duration-300 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                disabled={loading || success}
              >
                {success ? '✓ Email Sent!' : loading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </Button>
            </motion.div>

            {/* Divider */}
            <div className="relative flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="text-sm text-gray-400">or</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            {/* Back to Login */}
            <Button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="w-full py-3 text-md font-bold text-blue-600 cursor-pointer transition-all duration-300 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20"
            >
              Return to Login
            </Button>
          </form>

          {/* Info Box */}
          <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-100">
            <p className="font-semibold mb-2">💡 Tip:</p>
            <p>Don't receive the email? Check your spam folder or contact your administrator if you continue to experience issues.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
