import React from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPasswordForm = ({ onToggle }) => {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-brown-900 mb-2">Reset Password</h2>
        <p className="text-brown-600 font-medium">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-brown-800 ml-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-brown-400" />
            </div>
            <input 
              type="email" 
              className="input-glass w-full pl-11 pr-4 py-3.5 rounded-xl text-sm" 
              placeholder="Enter your email"
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full flex items-center justify-center gap-2 bg-brown-600 hover:bg-brown-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-[0_4px_14px_rgba(140,91,69,0.3)] hover:shadow-[0_6px_20px_rgba(140,91,69,0.4)] transition-all duration-300 group"
        >
          Send Reset Link
          <Send className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-brown-200/60">
        <button 
          onClick={() => onToggle('login')}
          className="flex items-center justify-center gap-2 w-full text-brown-600 hover:text-brown-900 font-semibold transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Sign In
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
