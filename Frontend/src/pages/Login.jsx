import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/actions/authActions';
import { 
  Mail, Lock, Eye, EyeOff, 
  CheckCircle, AlertCircle, Scale, LogIn 
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare credentials for API
    const credentials = {
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
    };

    const result = await dispatch(loginUser(credentials));

    if (result.success) {
      setSuccess(true);
      
      // Role-based redirect
      const redirectPath = '/dashboard';
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate(redirectPath);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float delay-1000"></div>
      </div>

      <div className="relative max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-8 animate-in">
          <h1 className="text-brand-900 mb-2">Welcome Back!</h1>
          <p className="text-muted">Sign in to continue to your account</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-in">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Login Successful!</p>
              <p className="text-xs text-green-600">Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <div className="card animate-in delay-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Email Address <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className={`input pl-11 ${errors.email ? 'border-danger' : ''}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-danger mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Password <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`input pl-11 pr-11 ${errors.password ? 'border-danger' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-brand-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-danger mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-brand-700 border-neutral-border rounded focus:ring-2 focus:ring-brand-700"
                />
                <span className="text-sm text-neutral-text">Remember me</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-brand-700 hover:text-accent font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Sign In
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-surface text-muted">Or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons (Optional) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="btn-outline py-3 text-sm"
              onClick={() => alert('Google login coming soon!')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="btn-outline py-3 text-sm"
              onClick={() => alert('Microsoft login coming soon!')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#F25022" d="M11.4 11.4H2V2h9.4z"/>
                <path fill="#00A4EF" d="M22 11.4h-9.4V2H22z"/>
                <path fill="#7FBA00" d="M11.4 22H2v-9.4h9.4z"/>
                <path fill="#FFB900" d="M22 22h-9.4v-9.4H22z"/>
              </svg>
              Microsoft
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-700 hover:text-accent font-medium">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center animate-in delay-200">
          <p className="text-xs text-muted flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-accent" />
            Your data is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
