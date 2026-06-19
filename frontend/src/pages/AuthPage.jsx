import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';
import ForgotPasswordForm from '../components/ForgotPasswordForm';

const AuthPage = () => {
  const [view, setView] = useState('login'); // 'login' | 'signup' | 'forgot'

  return (
    <div className="flex min-h-screen bg-beige-50 overflow-hidden relative">
      {/* Background ambient blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-brown-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-beige-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-brown-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob animation-delay-4000"></div>

      {/* Left Column - Visuals & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative p-12 flex-col justify-between overflow-hidden">
        {/* Dynamic Abstract Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-beige-100/90 to-beige-200/50 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-multiply z-0"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-brown-100 p-2.5 rounded-xl border border-brown-200/50 backdrop-blur-md shadow-sm">
            <ShoppingBag className="w-8 h-8 text-brown-600" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-brown-900">Electronic<span className="text-brown-500">Store</span></span>
        </div>

        <div className="relative z-10 max-w-lg mt-auto pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight text-brown-900">
              Power your world <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brown-600 to-brown-400">
                with cutting-edge electronics.
              </span>
            </h1>
            <p className="text-brown-700 text-lg leading-relaxed mb-8 font-medium">
              Discover the latest gadgets, premium accessories, and smart devices designed to elevate your everyday life.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Column - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="bg-brown-100 p-2 rounded-xl border border-brown-200/50 backdrop-blur-md shadow-sm">
              <ShoppingBag className="w-6 h-6 text-brown-600" />
            </div>
            <span className="text-xl font-bold tracking-tight text-brown-900">Electronic<span className="text-brown-500">Store</span></span>
          </div>

          <motion.div 
            layout
            className="glass rounded-[2rem] p-6 sm:p-10 relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {view === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <LoginForm onToggle={(v) => setView(v)} />
                </motion.div>
              )}
              {view === 'signup' && (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SignUpForm onToggle={(v) => setView(v)} />
                </motion.div>
              )}
              {view === 'forgot' && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ForgotPasswordForm onToggle={(v) => setView(v)} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
