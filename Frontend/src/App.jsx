import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/layout/Layout';

// Import your pages (create these files later)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/dashboards/citizendashboard';
import LawyerDashboard from './pages/dashboards/LawyerDashboard';
import PoliceDashboard from './pages/dashboards/PoliceDashboard';
// import FIRForm from './pages/FIRForm';
// import FIRList from './pages/FIRList';
// import Lawyers from './pages/Lawyers';
// import Chatbot from './pages/Chatbot';
// import Profile from './pages/Profile';
// import Settings from './pages/Settings';
// import About from './pages/About';
// import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes with Layout (Navbar + Footer) */}
        <Route element={<Layout />}>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          {/* <Route path="/about" element={<About />} /> */}

          {/* Auth Routes (redirect to dashboard if logged in) */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard/citizen"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
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



          {/* Protected Routes - All Roles */}
          {/* 
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          /> */}

          {/* Protected Routes - Citizens Only */}
          {/* <Route
            path="/fir/new"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <FIRForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fir/list"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <FIRList />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/lawyers"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <Lawyers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <Chatbot />
              </ProtectedRoute>
            }
          /> */}

          {/* Protected Routes - Police Only */}
          {/* <Route
            path="/fir/pending"
            element={
              <ProtectedRoute allowedRoles={['police']}>
                <FIRList />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/fir/all"
            element={
              <ProtectedRoute allowedRoles={['police']}>
                <FIRList />
              </ProtectedRoute>
            }
          /> */}

          {/* 404 Page */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
