import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import MyComplaintsPage from './pages/MyComplaintsPage';
import RaiseComplaintPage from './pages/RaiseComplaintPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminComplaintDetailPage from './pages/AdminComplaintDetailPage';

// ── Helper: read stored user ──────────────────────────────────
const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); }
  catch { return null; }
};

// ── Guard: must be logged in ──────────────────────────────────
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user  = getUser();
  if (!token || !user) return <Navigate to="/auth" replace />;
  return children;
};

// ── Guard: must be admin ──────────────────────────────────────
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user  = getUser();
  if (!token || !user) return <Navigate to="/auth" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

// ── Guard: redirect already-logged-in users away from /auth ──
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user  = getUser();
  if (token && user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public – redirect to dashboard if already logged in */}
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />

        {/* Student routes */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/dashboard/my-complaints" element={<PrivateRoute><MyComplaintsPage /></PrivateRoute>} />
        <Route path="/dashboard/raise" element={<PrivateRoute><RaiseComplaintPage /></PrivateRoute>} />

        {/* Admin routes */}
        <Route path="/admin/dashboard"            element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/dashboard/pending"    element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/dashboard/in-progress" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/dashboard/resolved"   element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/complaint/:id"        element={<AdminRoute><AdminComplaintDetailPage /></AdminRoute>} />

        {/* Default: redirect to auth */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}

export default App;