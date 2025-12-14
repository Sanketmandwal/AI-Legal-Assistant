import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from './components/layout/Layout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/dashboards/CitizenDashboard';
import LawyerDashboard from './pages/dashboards/LawyerDashboard';
import PoliceDashboard from './pages/dashboards/PoliceDashboard';
import CompleteLawyer from './pages/CompleteLawyer';
import CompletePolice from './pages/CompletePolice';
import { getDashboardRoute } from './utils/helper';
import { useEffect } from 'react';
import { getuser } from './store/actions/authActions';


// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  console.log("ProtectedRoute - isAuthenticated:", isAuthenticated, "user:", user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    const appropriateDashboard = getDashboardRoute(user?.role);
    // Redirect to appropriate dashboard based on role
    return <Navigate to={appropriateDashboard} replace />;
  }

  return children;
};



// Dashboard Redirect Component (based on role)
const DashboardRedirect = () => {
  const { user } = useSelector((state) => state.auth);

  // Redirect based on role
  switch (user?.role) {
    case 'user':
    case 'citizen':
      return <Navigate to="/dashboard/citizen" replace />;
    case 'lawyer':
      return <Navigate to="/dashboard/lawyer" replace />;
    case 'police':
      return <Navigate to="/dashboard/police" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

function App() {

  const dispatch = useDispatch();
  useEffect(() => {

  dispatch(getuser());
  }, []);

  return (

    
    <BrowserRouter>
      <Routes>
        {/* Routes with Layout (Navbar + Footer) */}
        <Route element={<Layout />}>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <Login />
            }
          />
          <Route
            path="/register"
            element={
              <Register />
            }
          />


          {/* Role-specific Dashboard Routes */}
          <Route
            path="/dashboard/citizen"
            element={
              <ProtectedRoute allowedRoles={['user', 'citizen']}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/lawyer"
            element={
              <ProtectedRoute allowedRoles={['lawyer']}>
                <LawyerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/police"
            element={
              <ProtectedRoute allowedRoles={['police']}>
                <PoliceDashboard />
              </ProtectedRoute>
            }
          />

        </Route>

        {/* Profile Completion Routes - OUTSIDE Layout, using AuthRequired */}
        <Route
          path="/complete-lawyer"
          element={
            <ProtectedRoute allowedRoles={['lawyer']}>
              <CompleteLawyer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/complete-police"
          element={
            <ProtectedRoute allowedRoles={['police']}>
              <CompletePolice />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
