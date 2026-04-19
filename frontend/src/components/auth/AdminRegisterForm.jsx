import React, { useState } from 'react';
import { User, Mail, Lock, ShieldCheck, Key } from 'lucide-react';
import api from '../../services/api';

const InputField = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40 group-focus-within:text-purple-400 transition-colors">
      <Icon className="h-5 w-5" />
    </div>
    <input
      className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl leading-5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-white/10 sm:text-sm transition-all duration-300"
      {...props}
    />
  </div>
);

const AdminRegisterForm = ({ onToggleMode }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', adminKey: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.adminKey !== 'admin123') {
       setErrorMsg('Invalid Security Key. Cannot register as admin.');
       return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      // The API expects 'ucn' as it is marked required in the MongoDB Schema.
      // Since Admins don't have UCNs, we generate a unique dummy UCN to pass validation.
      const payload = { 
          ...formData, 
          role: 'admin',
          ucn: `ADMIN-${Date.now()}`
      };
      
      await api.post('/auth/register', payload);
      alert('Admin Registration successful! Please login.');
      onToggleMode(); // switch to login form
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <ShieldCheck className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Create Admin</h3>
          <p className="text-xs text-purple-200/70">Secure Registration</p>
        </div>
      </div>
      
      {errorMsg && <div className="mb-4 text-red-400 text-sm">{errorMsg}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField 
          icon={User} type="text" name="fullName" 
          placeholder="Admin Full Name" value={formData.fullName} onChange={handleChange} required 
        />
        <InputField 
          icon={Mail} type="email" name="email" 
          placeholder="admin@campus.edu" value={formData.email} onChange={handleChange} required 
        />
        <InputField 
          icon={Lock} type="password" name="password" 
          placeholder="Create admin password" value={formData.password} onChange={handleChange} required 
        />
        <div className="pt-2 border-t border-white/10">
          <p className="text-xs text-white/50 mb-2">Security Verification</p>
          <InputField 
            icon={Key} type="password" name="adminKey" 
            placeholder="Enter Master Security Key" value={formData.adminKey} onChange={handleChange} required 
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transform transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          {loading ? 'Creating...' : 'Register Administrator'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button 
          onClick={onToggleMode}
          className="text-sm text-purple-200 hover:text-white transition-colors duration-200"
        >
          Already an admin? <span className="font-semibold underline decoration-purple-400/50 underline-offset-4">Sign in</span>
        </button>
      </div>
    </div>
  );
};

export default AdminRegisterForm;