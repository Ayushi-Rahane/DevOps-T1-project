import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, CheckCircle2, AlertCircle,
  Eye, Tag, User, Calendar, Shield, Save, Activity
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import api from '../services/api';

const StatusBadge = ({ status }) => {
  const map = {
    'Pending':     { color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',   Icon: Clock },
    'In Progress': { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',      Icon: AlertCircle },
    'Resolved':    { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', Icon: CheckCircle2 },
  };
  const cfg = map[status] || map['Pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <cfg.Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};

const TimelineItem = ({ icon: Icon, title, subtitle, time, color }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="w-px flex-1 bg-white/10 mt-2" />
    </div>
    <div className="pb-6">
      <p className="text-white font-medium text-sm">{title}</p>
      <p className="text-white/50 text-xs mt-0.5">{subtitle}</p>
      <p className="text-white/30 text-xs mt-1">{time}</p>
    </div>
  </div>
);

const AdminComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const { data } = await api.get('/complaints/admin');
        const found = data.find(c => c._id === id);
        if (found) {
          setComplaint(found);
          setNewStatus(found.status);
        }
      } catch (err) {
        console.error('Failed to fetch complaint:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === complaint.status) return;
    setUpdating(true);
    setUpdateMsg('');
    try {
      const { data } = await api.put(`/complaints/${id}`, { status: newStatus });
      setComplaint(data);
      setUpdateMsg('✅ Status updated successfully!');
    } catch (err) {
      setUpdateMsg('❌ Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userName={user.fullName || 'Admin'} role="admin" avatarColor="from-pink-500 to-rose-500">
        <div className="flex items-center justify-center h-64 text-white/50">Loading complaint details…</div>
      </DashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <DashboardLayout userName={user.fullName || 'Admin'} role="admin" avatarColor="from-pink-500 to-rose-500">
        <div className="text-center py-20 text-white/50">Complaint not found.</div>
      </DashboardLayout>
    );
  }

  const createdAt = new Date(complaint.createdAt).toLocaleString();

  return (
    <DashboardLayout userName={user.fullName || 'Admin'} role="admin" avatarColor="from-pink-500 to-rose-500">
      {/* Back button */}
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="flex items-center text-white/60 hover:text-white transition-colors mb-6 group text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to All Complaints
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Detail Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <StatusBadge status={complaint.status} />
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Eye className="w-3.5 h-3.5" />
                {complaint.visibility}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-pink-500/20 text-pink-300 border-pink-500/30">
                <Tag className="w-3.5 h-3.5" />
                {complaint.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white mb-5">{complaint.subject}</h1>

            {/* Meta row */}
            <div className="flex flex-wrap gap-4 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Submitted by: <span className="text-white font-medium">{complaint.userId?.fullName || 'Unknown'}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Created: <span className="text-white font-medium">{createdAt}</span></span>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-white font-semibold mb-2">Description</h3>
              <p className="text-white/70 text-sm leading-relaxed">{complaint.description}</p>
            </div>
          </div>

          {/* Update Status Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Update Status
            </h3>
            <p className="text-white/50 text-sm mb-4">Change Status</p>
            {updateMsg && (
              <p className="mb-3 text-sm text-blue-300">{updateMsg}</p>
            )}
            <div className="flex gap-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="flex-1 bg-slate-800 border border-white/10 rounded-xl text-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === complaint.status}
                className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Save className="w-4 h-4" />
                {updating ? 'Saving…' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Activity Timeline
          </h3>
          <div>
            {/* Render each entry from statusHistory */}
            {(complaint.statusHistory && complaint.statusHistory.length > 0
              ? complaint.statusHistory
              : [{ status: 'Pending', changedAt: complaint.createdAt }]
            ).map((entry, idx) => {
              const isLast = idx === (complaint.statusHistory?.length ?? 1) - 1;
              const entryDate = new Date(entry.changedAt).toLocaleString();
              const Icon =
                entry.status === 'Pending'     ? Clock :
                entry.status === 'In Progress' ? AlertCircle :
                CheckCircle2;
              const color =
                entry.status === 'Pending'     ? 'bg-amber-500' :
                entry.status === 'In Progress' ? 'bg-blue-500'  :
                'bg-emerald-500';
              const subtitle =
                entry.status === 'Pending'     ? 'Complaint submitted by student' :
                entry.status === 'In Progress' ? 'Admin started reviewing' :
                'Issue resolved by admin';

              return (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${color}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    {!isLast && <div className="w-px flex-1 bg-white/10 mt-2" />}
                  </div>
                  <div className={`${!isLast ? 'pb-6' : ''}`}>
                    <p className="text-white font-medium text-sm">{entry.status === 'Pending' ? 'Complaint Submitted' : entry.status}</p>
                    <p className="text-white/50 text-xs mt-0.5">{subtitle}</p>
                    <p className="text-white/30 text-xs mt-1">{entryDate}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminComplaintDetailPage;
