import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ComplaintCard from '../components/dashboard/ComplaintCard';
import { Activity, Clock, CheckCircle2, Inbox, Filter } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

const StatCard = ({ title, count, colorClass, icon: Icon }) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:bg-white/10 transition-colors">
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

const AdminDashboardPage = () => {
  const location = useLocation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchAdminComplaints = async () => {
      try {
        const { data } = await api.get('/complaints/admin');
        const formatted = data.map(c => ({
          id: c._id,
          title: c.subject,
          description: c.description,
          status: c.status,
          visibility: c.visibility,
          category: c.category,
          date: new Date(c.createdAt).toLocaleString(),
          author: c.userId?.fullName || 'Unknown User'
        }));
        setComplaints(formatted);
      } catch (err) {
        console.error('Failed to fetch admin complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminComplaints();
  }, []);

  // Determine filter based on URL path
  let pathStatus = 'All';
  let pageTitle = 'All Complaints';
  if (location.pathname.includes('/pending')) { pathStatus = 'Pending'; pageTitle = 'Pending Complaints'; }
  else if (location.pathname.includes('/in-progress')) { pathStatus = 'In Progress'; pageTitle = 'In Progress Complaints'; }
  else if (location.pathname.includes('/resolved')) { pathStatus = 'Resolved'; pageTitle = 'Resolved Complaints'; }

  const filteredComplaints = complaints
    .filter(c => pathStatus === 'All' || c.status === pathStatus)
    .filter(c => categoryFilter === 'All' || c.category === categoryFilter);

  const total      = complaints.length;
  const pending    = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved   = complaints.filter(c => c.status === 'Resolved').length;

  // Notification list: pending + in-progress complaints (max 10)
  const notifications = complaints
    .filter(c => c.status === 'Pending' || c.status === 'In Progress')
    .slice(0, 10)
    .map(c => ({ id: c.id, title: c.title, status: c.status, time: c.date }));

  return (
    <DashboardLayout
      userName={user.fullName || 'Admin'}
      role="admin"
      avatarColor="from-pink-500 to-rose-500"
      pendingCount={pending}
      inProgressCount={inProgress}
      notifications={notifications}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">{pageTitle}</h1>
        <p className="text-white/60 mt-1">Manage and track all student complaints</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total"       count={total}      colorClass="bg-white"       icon={Inbox} />
        <StatCard title="Pending"     count={pending}    colorClass="bg-amber-500"   icon={Clock} />
        <StatCard title="In Progress" count={inProgress} colorClass="bg-blue-500"    icon={Activity} />
        <StatCard title="Resolved"    count={resolved}   colorClass="bg-emerald-500" icon={CheckCircle2} />
      </div>

      {/* Category Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center text-white/50 text-sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter by category:
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg text-white text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
        >
          <option value="All"           className="text-gray-900">All Categories</option>
          <option value="Academic"      className="text-gray-900">Academic</option>
          <option value="WiFi"          className="text-gray-900">WiFi / IT Services</option>
          <option value="Hostel"        className="text-gray-900">Hostel</option>
          <option value="Mess"          className="text-gray-900">Mess / Food</option>
          <option value="Infrastructure" className="text-gray-900">Infrastructure</option>
          <option value="Other"         className="text-gray-900">Other</option>
        </select>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-white animate-pulse">Loading complaints…</div>
        ) : filteredComplaints.length > 0 ? (
          filteredComplaints.map(c => (
            <ComplaintCard key={c.id} complaint={c} isAdminView={true} />
          ))
        ) : (
          <div className="text-center py-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
            <Inbox className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 font-medium">No complaints found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;