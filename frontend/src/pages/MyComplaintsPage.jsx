import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ComplaintCard from '../components/dashboard/ComplaintCard';
import { Activity, Clock, CheckCircle2, Inbox } from 'lucide-react';
import api from '../services/api';

const StatCard = ({ title, count, colorClass, icon: Icon }) => (
  <div className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:bg-white/10 transition-colors`}>
    <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorClass}`}></div>
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform origin-left">{count}</h3>
        <p className="text-white/60 text-sm font-medium">{title}</p>
      </div>
      <div className={`p-2 rounded-xl ${colorClass.replace('bg-', 'bg-opacity-20 bg-')}`}>
        <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </div>
);

const MyComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchMyComplaints = async () => {
      try {
        const { data } = await api.get('/complaints/user');
        const formatted = data.map(c => ({
           id: c._id,
           title: c.subject,
           description: c.description,
           status: c.status,
           visibility: c.visibility,
           category: c.category,
           date: new Date(c.createdAt).toLocaleString(),
           author: c.userId?.fullName || user.fullName
        }));
        setComplaints(formatted);
      } catch (err) {
        console.error('Failed to fetch personal complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchMyComplaints();
  }, [user.fullName]);

  // Aggregate stats
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <DashboardLayout userName={user.fullName || "Student"}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">My Complaints</h1>
        <p className="text-white/60 mt-1">Manage and track your submitted complaints</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Complaints" count={total} colorClass="bg-white" icon={Inbox} />
        <StatCard title="Pending" count={pending} colorClass="bg-amber-500" icon={Clock} />
        <StatCard title="In Progress" count={inProgress} colorClass="bg-blue-500" icon={Activity} />
        <StatCard title="Resolved" count={resolved} colorClass="bg-emerald-500" icon={CheckCircle2} />
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {loading ? (
             <div className="text-white">Loading...</div>
        ) : complaints.length > 0 ? (
          complaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))
        ) : (
          <div className="text-center py-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
            <Inbox className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 font-medium">No complaints found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyComplaintsPage;
