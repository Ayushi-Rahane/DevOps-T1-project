import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const InputField = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40 group-focus-within:text-blue-400 transition-colors">
      <Icon className="h-5 w-5" />
    </div>
    <input
      className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl leading-5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/10 sm:text-sm transition-all duration-300"
      {...props}
    />
  </div>
);

const StudentLoginForm = ({ onToggleMode }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const { data } = await api.post('/auth/login', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-xl font-semibold text-white mb-6">Welcome Back</h3>
      {errorMsg && <div className="mb-4 text-red-400 text-sm">{errorMsg}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        <InputField 
          icon={Mail} type="email" name="email" 
          placeholder="your.email@campus.edu" value={formData.email} onChange={handleChange} required 
        />
        
        <InputField 
          icon={Lock} type="password" name="password" 
          placeholder="Enter your password" value={formData.password} onChange={handleChange} required 
        />

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 bg-white/10 border-white/20"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-blue-200/80">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
              Forgot password?
            </a>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.2)] text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 transform transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Sign In
        </button>
      </form>

      <div className="mt-8 text-center bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
        <p className="text-sm text-blue-200">
          New to IssueSphere?
        </p>
        <button 
          onClick={onToggleMode}
          className="mt-2 text-sm font-semibold text-white hover:text-blue-200 transition-colors duration-200 flex items-center justify-center w-full"
        >
          Create an account &rarr;
        </button>
      </div>
    </div>
  );
};

export default StudentLoginForm;