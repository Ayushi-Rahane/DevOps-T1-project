import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

const AdminLoginForm = ({ onToggleMode }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '', adminKey: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.adminKey !== 'admin123') {
       setErrorMsg('Invalid Security Key');
       return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const { data } = await api.post('/auth/login', formData);
      if (data.user.role !== 'admin') {
         setErrorMsg('Not authorized as admin');
         return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/admin/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Login failed');
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
          <h3 className="text-xl font-bold text-white">Admin Portal</h3>
          <p className="text-xs text-purple-200/70">Secure Access Only</p>
        </div>
      </div>
      
      {errorMsg && <div className="mb-4 text-red-400 text-sm">{errorMsg}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField 
          icon={Mail} type="email" name="email" 
          placeholder="admin@campus.edu" value={formData.email} onChange={handleChange} required 
        />
        
        <InputField 
          icon={Lock} type="password" name="password" 
          placeholder="Admin Password" value={formData.password} onChange={handleChange} required 
        />

        <InputField 
          icon={ShieldCheck} type="password" name="adminKey" 
          placeholder="Secret Security Key" value={formData.adminKey} onChange={handleChange} required 
        />

        <div className="pt-2">
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.2)] text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transform transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Authenticate
          </button>
        </div>
      </form>

      {onToggleMode && (
        <div className="mt-6 text-center">
          <button 
            onClick={onToggleMode}
            className="text-sm text-purple-200 hover:text-white transition-colors duration-200"
          >
            Don't have an admin account? <span className="font-semibold underline decoration-purple-400/50 underline-offset-4">Register here</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminLoginForm;
