import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ComplaintCard from '../components/dashboard/ComplaintCard';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const { data } = await api.get('/complaints');
        // Transform the payload to match what ComplaintCard expects (handling populated userId)
        const formatted = data.map(c => ({
           id: c._id,
           title: c.subject,
           description: c.description,
           status: c.status,
           visibility: c.visibility,
           category: c.category,
           date: new Date(c.createdAt).toLocaleString(),
           author: c.userId?.fullName || 'Unknown'
        }));
        setComplaints(formatted);
      } catch (err) {
        console.error('Failed to fetch complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  return (
    <DashboardLayout userName={user.fullName || "Student"}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 data-testid="dashboard-title" className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-white/60 mt-1">View all public complaints and track your issues</p>
        </div>
        
        <button 
          data-testid="btn-raise-complaint"
          onClick={() => navigate('/dashboard/raise')}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:from-blue-500 hover:to-indigo-500 transform transition-all hover:-translate-y-0.5"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="font-semibold">Raise Complaint</span>
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
           <div className="text-white">Loading...</div>
        ) : complaints.map((complaint) => (
          <ComplaintCard key={complaint.id} complaint={complaint} />
        ))}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;