import React from 'react';
import { ShieldAlert } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8 transform transition-all duration-500 hover:scale-105">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl">
              <ShieldAlert className="w-12 h-12 text-blue-400" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white tracking-tight">
            {title}
          </h2>
          <p className="mt-2 text-sm text-blue-200/80 font-medium tracking-wide">
            {subtitle}
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.3)] border border-white/20 p-8 transform transition-all hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.5)]">
          {children}
        </div>
        
        <p className="mt-8 text-center text-xs text-white/50">
          &copy; {new Date().getFullYear()} CampusConnect. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;