import React, { useState } from 'react';
import { ArrowLeft, FileText, AlignLeft, Tag, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import api from '../services/api';

const RaiseComplaintPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: '',
    isPublic: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await api.post('/complaints', { 
        ...formData, 
        visibility: formData.isPublic ? 'Public' : 'Private' 
      });
      alert('Complaint submitted successfully!');
      navigate('/dashboard/my-complaints');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userName={user.fullName || "Student"}>
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-white/70 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 max-w-3xl shadow-lg">
        <h1 data-testid="raise-complaint-title" className="text-3xl font-bold text-white tracking-tight mb-2">Raise a Complaint</h1>
        <p className="text-white/60 mb-8">Submit your issue and we'll work to resolve it as soon as possible</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Subject</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40 group-focus-within:text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief description of your complaint"
                className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl leading-5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all duration-300"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Description</label>
            <div className="relative group">
              <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none text-white/40 group-focus-within:text-blue-400">
                <AlignLeft className="h-5 w-5" />
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed information about your complaint..."
                rows="5"
                className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl leading-5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all duration-300 resize-none"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Category</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40 group-focus-within:text-blue-400">
                <Tag className="h-5 w-5" />
              </div>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl leading-5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-slate-800 transition-all duration-300 appearance-none"
                required
              >
                <option value="" disabled className="text-gray-500">Select a category</option>
                <option value="Academic" className="text-gray-900">Academic</option>
                <option value="Hostel" className="text-gray-900">Hostel</option>
                <option value="Mess" className="text-gray-900">Mess / Food</option>
                <option value="Infrastructure" className="text-gray-900">Infrastructure / Maintenance</option>
                <option value="WiFi" className="text-gray-900">WiFi / IT Services</option>
                <option value="Other" className="text-gray-900">Other</option>
              </select>
            </div>
          </div>

          {/* Visibility Toggle */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Visibility</label>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium text-sm">Public</h4>
                <p className="text-white/50 text-xs mt-0.5">Other students can view this complaint</p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 px-4 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-4 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:from-blue-500 hover:to-indigo-500 transform transition-all hover:scale-[1.02] flex justify-center items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Complaint</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default RaiseComplaintPage;