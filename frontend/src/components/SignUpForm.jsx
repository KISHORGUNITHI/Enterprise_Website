import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SignUpForm = ({ onToggle }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [strengthScore, setStrengthScore] = useState(0);

  const isMatch = password && confirmPassword && password === confirmPassword;
  const isMismatch = confirmPassword && password !== confirmPassword;

  // Strong password logic
  useEffect(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    setStrengthScore(score);
  }, [password]);

  const getStrengthColor = () => {
    if (strengthScore === 0) return 'bg-brown-200';
    if (strengthScore === 1) return 'bg-red-400';
    if (strengthScore === 2) return 'bg-amber-400';
    if (strengthScore === 3) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const strengthWidth = strengthScore === 0 ? '0%' : `${(strengthScore / 4) * 100}%`;

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-brown-900 mb-2">Create an account</h2>
        <p className="text-brown-600 font-medium">Join us to start shopping for premium goods.</p>
      </div>

      <div className="flex flex-col gap-4 mb-5">
        <button className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl border border-brown-200 bg-white/60 hover:bg-white/80 text-brown-800 font-medium transition-all duration-200 focus:ring-2 focus:ring-brown-500 outline-none shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Sign up with Google</span>
        </button>
      </div>

      <div className="relative flex items-center mb-5">
        <div className="flex-grow border-t border-brown-200"></div>
        <span className="flex-shrink-0 mx-4 text-brown-400 text-sm font-medium">or register with email</span>
        <div className="flex-grow border-t border-brown-200"></div>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-brown-800 ml-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-brown-400" />
            </div>
            <input 
              type="text" 
              className="input-glass w-full pl-11 pr-4 py-3 rounded-xl text-sm" 
              placeholder="John Doe"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-brown-800 ml-1">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-brown-400" />
            </div>
            <input 
              type="email" 
              className="input-glass w-full pl-11 pr-4 py-3 rounded-xl text-sm" 
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-brown-800 ml-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-brown-400" />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-glass w-full pl-11 pr-12 py-3 rounded-xl text-sm" 
              placeholder="••••••••"
            />
            <button 
              type="button"
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-brown-400 hover:text-brown-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Animated Password Strength Indicator */}
          <div className="w-full h-1.5 bg-brown-200 rounded-full mt-2 overflow-hidden relative">
            <motion.div 
              className={`absolute top-0 left-0 h-full rounded-full ${getStrengthColor()}`}
              initial={{ width: 0 }}
              animate={{ width: strengthWidth }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
          </div>
          <p className="text-xs text-brown-500 font-medium ml-1">
            {strengthScore === 0 && 'Enter password'}
            {strengthScore === 1 && 'Weak'}
            {strengthScore === 2 && 'Fair'}
            {strengthScore === 3 && 'Good'}
            {strengthScore === 4 && 'Strong'}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-brown-800 ml-1">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-brown-400" />
            </div>
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`input-glass w-full pl-11 pr-12 py-3 rounded-xl text-sm ${isMismatch ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''} ${isMatch ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''}`} 
              placeholder="••••••••"
            />
            <button 
              type="button"
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-brown-400 hover:text-brown-600 transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {isMismatch && <p className="text-xs text-red-500 font-medium ml-1">Passwords do not match.</p>}
          {isMatch && <p className="text-xs text-green-600 font-medium ml-1">Passwords match.</p>}
        </div>

        <button 
          type="submit" 
          className="w-full flex items-center justify-center gap-2 bg-brown-600 hover:bg-brown-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-[0_4px_14px_rgba(140,91,69,0.3)] hover:shadow-[0_6px_20px_rgba(140,91,69,0.4)] transition-all duration-300 group mt-2"
        >
          Create account
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-brown-600 font-medium">
        Already have an account?{' '}
        <button 
          onClick={() => onToggle('login')}
          className="font-bold text-brown-700 hover:text-brown-900 transition-colors"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};

export default SignUpForm;
