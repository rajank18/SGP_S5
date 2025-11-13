import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { resetToken } = useParams();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!resetToken) {
    return (
      <div className='bg-gradient-to-br from-[#abd2ff] via-[#639bdb] to-[#2b7fff] min-h-screen flex items-center justify-center p-4 text-white font-sans'>
        <div className="w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/20 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/10 p-8 md:p-12 text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h2>
            <p className="text-gray-200 mb-6">
              The password reset link is invalid or has expired. Please request a new one.
            </p>
            <Button
              onClick={() => navigate('/auth/forgot-password')}
              className="w-full py-3 text-md font-bold text-white cursor-pointer transition-all duration-300 rounded-lg bg-blue-600 hover:bg-blue-700"
            >
              Request New Reset Link
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetToken,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
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
          <div className="flex justify-center mb-4">
            <div className="bg-blue-500/20 p-3 rounded-full">
              <Lock className="h-6 w-6 text-blue-300" />
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-2 text-center text-white">Reset Password</h2>
          <p className="text-gray-200 text-center mb-8 text-sm">
            Enter your new password below
          </p>

          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-200">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 transition-shadow"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-200">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 transition-shadow"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-100 space-y-1">
              <p className="font-semibold mb-2">Password Requirements:</p>
              <p>• Minimum 6 characters</p>
              <p>• Passwords must match</p>
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
                  className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-100 text-sm"
                >
                  ✓ Password reset successfully! Redirecting to login...
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
                {success ? '✓ Password Reset!' : loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
