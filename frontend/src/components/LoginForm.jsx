import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const LoginForm = ({ onToggle }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-brown-900 mb-2">Welcome back</h2>
        <p className="text-brown-600">Please enter your details to sign in.</p>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <button className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl border border-brown-200 bg-white/60 hover:bg-white/80 text-brown-800 font-medium transition-all duration-200 focus:ring-2 focus:ring-brown-500 outline-none shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Sign in with Google</span>
        </button>
      </div>

      <div className="relative flex items-center mb-6">
        <div className="flex-grow border-t border-brown-200"></div>
        <span className="flex-shrink-0 mx-4 text-brown-400 text-sm font-medium">or sign in with email</span>
        <div className="flex-grow border-t border-brown-200"></div>
      </div>

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-brown-800 ml-1">Email</label>
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

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-brown-800 ml-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-brown-400" />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              className="input-glass w-full pl-11 pr-12 py-3.5 rounded-xl text-sm" 
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
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center">
            <input 
              id="remember-me" 
              type="checkbox" 
              className="h-4 w-4 rounded border-brown-300 text-brown-600 focus:ring-brown-500 bg-white" 
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-brown-700">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <button type="button" onClick={() => onToggle('forgot')} className="font-semibold text-brown-600 hover:text-brown-800 transition-colors">
              Forgot password?
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full flex items-center justify-center gap-2 bg-brown-600 hover:bg-brown-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-[0_4px_14px_rgba(140,91,69,0.3)] hover:shadow-[0_6px_20px_rgba(140,91,69,0.4)] transition-all duration-300 group mt-4"
        >
          Sign in
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-brown-600 font-medium">
        Don't have an account?{' '}
        <button 
          onClick={() => onToggle('signup')}
          className="font-bold text-brown-700 hover:text-brown-900 transition-colors"
        >
          Sign up
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
