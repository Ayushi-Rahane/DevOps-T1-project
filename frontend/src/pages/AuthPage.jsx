import React, { useState } from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import StudentLoginForm from '../components/auth/StudentLoginForm';
import StudentRegisterForm from '../components/auth/StudentRegisterForm';

const AuthPage = () => {
  const [role, setRole] = useState('student'); // 'student' or 'admin'
  const [isLogin, setIsLogin] = useState(true); // default to Login

  return (
    <AuthLayout 
      title={role === 'admin' ? "System Admin" : "IssueSphere"} 
      subtitle={role === 'admin' ? "Manage Campus Connect" : (isLogin ? "Welcome back, student" : "Join the smart campus network")}
    >
      {/* Role Tabs */}
      <div className="flex justify-center mb-6 border-b border-white/10 pb-4">
        <div className="flex space-x-2 bg-white/5 p-1 rounded-xl backdrop-blur-sm">
          <button
            onClick={() => { setRole('student'); setIsLogin(true); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              role === 'student'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-blue-200 hover:text-white hover:bg-white/10'
            }`}
          >
            Student
          </button>
          <button
            onClick={() => { setRole('admin'); setIsLogin(true); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              role === 'admin'
                ? 'bg-purple-500 text-white shadow-md'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            Administrator
          </button>
        </div>
      </div>

      {/* Forms */}
      <div className="min-h-[300px]">
        {role === 'admin' ? (
          isLogin ? (
            <AdminLoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <AdminRegisterForm onToggleMode={() => setIsLogin(true)} />
          )
        ) : (
          isLogin ? (
            <StudentLoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <StudentRegisterForm onToggleMode={() => setIsLogin(true)} />
          )
        )}
      </div>
    </AuthLayout>
  );
};

export default AuthPage;