import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, LogOut, LayoutDashboard, PlusCircle, FileText,
  ShieldAlert, CheckCircle2, Clock, Activity, X, AlertCircle,
  BellOff
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const DashboardLayout = ({
  children,
  userName = "Student User",
  role = "student",
  avatarColor = "from-blue-500 to-purple-500",
  // Dynamic badge counts passed from parent (for sidebar)
  pendingCount = 0,
  inProgressCount = 0,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications from backend and poll every 30s
  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {
      // Silently fail — don't break the layout
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) { /* silent */ }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const studentNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard',       path: '/dashboard' },
    { icon: PlusCircle,      label: 'Raise Complaint', path: '/dashboard/raise' },
    { icon: FileText,        label: 'My Complaints',   path: '/dashboard/my-complaints' }
  ];

  const adminNavItems = [
    { icon: LayoutDashboard, label: 'All Complaints', path: '/admin/dashboard' },
    { icon: Clock,           label: 'Pending',        path: '/admin/dashboard/pending',     badge: pendingCount,    badgeColor: 'bg-amber-500' },
    { icon: Activity,        label: 'In Progress',    path: '/admin/dashboard/in-progress', badge: inProgressCount, badgeColor: 'bg-blue-500' },
    { icon: CheckCircle2,    label: 'Resolved',       path: '/admin/dashboard/resolved' }
  ];

  const navItems = role === 'admin' ? adminNavItems : studentNavItems;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col text-white">
      {/* Top Navbar */}
      <header className="h-16 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 z-20 relative">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
            <ShieldAlert className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">
            IssueSphere
          </span>
        </div>

        <div className="flex items-center space-x-6">
          {/* 🔔 Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(v => !v)}
              className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Bell className="w-5 h-5 text-white/70 hover:text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-slate-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <h3 className="text-white font-semibold text-sm">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300">
                        Mark all read
                      </button>
                    )}
                    <button onClick={() => setShowNotifications(false)} className="text-white/40 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <BellOff className="w-8 h-8 text-white/20 mx-auto mb-2" />
                      <p className="text-white/40 text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n._id}
                        onClick={async () => {
                          setShowNotifications(false);
                          await api.put(`/notifications/${n._id}/read`).catch(() => {});
                          setNotifications(prev => prev.map(x => x._id === n._id ? {...x, isRead: true} : x));
                          if (n.complaintId) {
                            navigate(role === 'admin'
                              ? `/admin/complaints/${n.complaintId}`
                              : `/dashboard/my-complaints`);
                          }
                        }}
                        className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.isRead ? 'bg-blue-500/5' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            n.type === 'new_complaint'  ? 'bg-pink-500/20' :
                            n.type === 'status_change'  ? 'bg-blue-500/20' : 'bg-white/10'
                          }`}>
                            {n.type === 'new_complaint'  && <AlertCircle className="w-4 h-4 text-pink-400" />}
                            {n.type === 'status_change'  && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                            {n.type === 'general'        && <Bell className="w-4 h-4 text-white/50" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${n.isRead ? 'text-white/60' : 'text-white'}`}>
                              {n.message}
                            </p>
                            <p className="text-white/30 text-xs mt-0.5">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!n.isRead && <div className="w-2 h-2 bg-blue-400 rounded-full mt-1 shrink-0" />}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="px-4 py-2 border-t border-white/10">
                  <p className="text-white/30 text-xs text-center">{notifications.length} total · {unreadCount} unread</p>
                </div>
              </div>
            )}
          </div>

          {/* User avatar */}
          <div className="flex items-center space-x-3 bg-white/5 border border-white/10 py-1.5 px-3 rounded-full">
            <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${avatarColor} flex items-center justify-center text-xs font-bold shadow-inner`}>
              {userName.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="text-sm font-medium text-white/90 pr-2">{userName}</span>
          </div>

          <button onClick={handleLogout} className="text-white/60 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/5">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white/5 backdrop-blur-sm border-r border-white/10 p-4 flex flex-col space-y-2 z-0 hidden md:flex overflow-hidden">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path === '/admin/dashboard' && location.pathname === '/admin');
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                    : 'text-white/70 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-white/50'}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {/* Only show badge if count > 0 */}
                {item.badge != null && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative" onClick={() => showNotifications && setShowNotifications(false)}>
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-500/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-500/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
