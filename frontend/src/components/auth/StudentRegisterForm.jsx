import React, { useState } from 'react';
import { User, Mail, Lock, Phone, BookOpen, GraduationCap, Building, Hash } from 'lucide-react';
import api from '../../services/api';

const InputField = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40 group-focus-within:text-blue-400 transition-colors">
      <Icon className="h-5 w-5" />
    </div>
    <input
      className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl leading-5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/10 sm:text-sm transition-all duration-300"
      {...props}
    />
  </div>
);

const SelectField = ({ icon: Icon, options, ...props }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40 group-focus-within:text-blue-400 transition-colors">
      <Icon className="h-5 w-5" />
    </div>
    <select
      className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl leading-5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-slate-800 sm:text-sm transition-all duration-300 appearance-none"
      {...props}
    >
      <option value="" disabled className="text-gray-500">Select {props.name}</option>
      {options.map((opt) => (
        <option key={opt} value={opt} className="text-gray-900">{opt}</option>
      ))}
    </select>
  </div>
);

const StudentRegisterForm = ({ onToggleMode }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    ucn: '',
    degree: '',
    year: '',
    branch: '',
    phone: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      // Very simple local testing hack: if email has 'admin', make them an admin!
      const userRole = formData.email.toLowerCase().includes('admin') ? 'admin' : 'student';
      
      await api.post('/auth/register', { ...formData, role: userRole });
      alert(`Registration successful! Role: ${userRole}. Please login.`);
      onToggleMode(); // switch to login form
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-6">Create Account</h3>
      {errorMsg && <div className="mb-4 text-red-400 text-sm">{errorMsg}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <InputField 
          icon={User} type="text" name="fullName" 
          placeholder="Enter full name" value={formData.fullName} onChange={handleChange} required 
        />
        
        <div className="grid grid-cols-2 gap-4">
          <InputField 
            icon={Hash} type="text" name="ucn" 
            placeholder="UCN2023001" value={formData.ucn} onChange={handleChange} required 
          />
          <SelectField 
            icon={GraduationCap} name="degree" value={formData.degree} onChange={handleChange} required
            options={['B.Tech', 'M.Tech', 'B.Sc', 'MCA', 'PhD']} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField 
            icon={BookOpen} name="year" value={formData.year} onChange={handleChange} required
            options={['1st Year', '2nd Year', '3rd Year', '4th Year']} 
          />
          <SelectField 
            icon={Building} name="branch" value={formData.branch} onChange={handleChange} required
            options={['Computer Science', 'Information Tech', 'Electronics', 'Mechanical', 'Civil']} 
          />
        </div>

        <InputField 
          icon={Phone} type="tel" name="phone" 
          placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} required 
        />
        
        <InputField 
          icon={Mail} type="email" name="email" 
          placeholder="your.email@campus.edu" value={formData.email} onChange={handleChange} required 
        />
        
        <InputField 
          icon={Lock} type="password" name="password" 
          placeholder="Create a password" value={formData.password} onChange={handleChange} required 
        />

        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 transform transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          Create Account
        </button>
      </form>

      <div className="mt-6 text-center">
        <button 
          onClick={onToggleMode}
          className="text-sm text-blue-200 hover:text-white transition-colors duration-200"
        >
          Already have an account? <span className="font-semibold underline decoration-blue-400/50 underline-offset-4">Login here</span>
        </button>
      </div>
    </div>
  );
};

export default StudentRegisterForm;