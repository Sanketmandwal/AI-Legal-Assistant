import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, Scale,
  Shield, ArrowRight
} from "lucide-react";
import { registerUser } from "../store/actions/authActions";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get Redux state
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    // Clear field error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErr = {};
    if (!formData.name.trim() || formData.name.trim().length < 3)
      newErr.name = "Name must be at least 3 characters";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email))
      newErr.email = "Please enter a valid email";
    if (!/^[6-9]\d{9}$/.test(formData.phone))
      newErr.phone = "Please enter a valid 10-digit phone number";
    if (formData.password.length < 6)
      newErr.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErr.confirmPassword = "Passwords do not match";
    if (!formData.acceptTerms)
      newErr.acceptTerms = "You must accept the terms and conditions";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const userData = {
      name: formData.name.trim(),
      email: formData.email.toLowerCase().trim(),
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
    };

    const result = await dispatch(registerUser(userData));


    if (result.success) {

      setSuccess(true);

      setTimeout(() => {
        if (formData.role === "lawyer") {
          console.log("🔀 Navigating to /complete-lawyer");
          navigate("/complete-lawyer");
        } else if (formData.role === "police") {
          console.log("🔀 Navigating to /complete-police");
          navigate("/complete-police");
        } else {
          console.log("🔀 Navigating to /dashboard/citizen");
          navigate("/dashboard/citizen");
        }
      }, 1500);
    } else {
      console.error("❌ Registration failed:", result.error);
    }
  };


  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl animate-float delay-700"></div>
      </div>

      <div className="relative max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-8 animate-in">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-700 to-brand-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-brand-900 font-serif">LexiAI</span>
          </Link>

          <h1 className="text-brand-900 mb-2">Create Your Account</h1>
          <p className="text-muted">Join thousands using AI-powered legal assistance</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-in">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Registration Successful!</p>
              <p className="text-xs text-green-600">Redirecting to your dashboard...</p>
            </div>
          </div>
        )}

        {/* Error Message from Redux */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Registration Form */}
        <div className="card animate-in delay-100">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Full Name <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`input pl-11 ${errors.name ? 'border-danger' : ''}`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-danger mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

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
                />
              </div>
              {errors.email && (
                <p className="text-xs text-danger mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Phone Number <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  className={`input pl-11 ${errors.phone ? 'border-danger' : ''}`}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-danger mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone}
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
                  placeholder="Create a strong password"
                  className={`input pl-11 pr-11 ${errors.password ? 'border-danger' : ''}`}
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

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Confirm Password <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={`input pl-11 pr-11 ${errors.confirmPassword ? 'border-danger' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-brand-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-danger mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-3">
                I am a <span className="text-danger">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.role === 'user'
                    ? 'border-brand-700 bg-brand-50'
                    : 'border-neutral-border hover:border-brand-300'
                  }`}>
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={formData.role === 'user'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <User className={`w-6 h-6 mb-2 ${formData.role === 'user' ? 'text-brand-700' : 'text-muted'}`} />
                  <span className={`text-sm font-medium ${formData.role === 'user' ? 'text-brand-700' : 'text-neutral-text'}`}>
                    Citizen
                  </span>
                </label>

                <label className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.role === 'lawyer'
                    ? 'border-brand-700 bg-brand-50'
                    : 'border-neutral-border hover:border-brand-300'
                  }`}>
                  <input
                    type="radio"
                    name="role"
                    value="lawyer"
                    checked={formData.role === 'lawyer'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <Scale className={`w-6 h-6 mb-2 ${formData.role === 'lawyer' ? 'text-brand-700' : 'text-muted'}`} />
                  <span className={`text-sm font-medium ${formData.role === 'lawyer' ? 'text-brand-700' : 'text-neutral-text'}`}>
                    Lawyer
                  </span>
                </label>

                <label className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.role === 'police'
                    ? 'border-brand-700 bg-brand-50'
                    : 'border-neutral-border hover:border-brand-300'
                  }`}>
                  <input
                    type="radio"
                    name="role"
                    value="police"
                    checked={formData.role === 'police'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <Shield className={`w-6 h-6 mb-2 ${formData.role === 'police' ? 'text-brand-700' : 'text-muted'}`} />
                  <span className={`text-sm font-medium ${formData.role === 'police' ? 'text-brand-700' : 'text-neutral-text'}`}>
                    Police
                  </span>
                </label>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-brand-700 border-neutral-border rounded focus:ring-2 focus:ring-brand-700"
                />
                <span className="text-sm text-neutral-text">
                  I accept the{' '}
                  <Link to="/terms" className="text-brand-700 hover:text-accent font-medium">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-brand-700 hover:text-accent font-medium">
                    Privacy Policy
                  </Link>
                  <span className="text-danger"> *</span>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-xs text-danger mt-2 flex items-center gap-1 ml-7">
                  <AlertCircle className="w-3 h-3" />
                  {errors.acceptTerms}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-700 hover:text-accent font-medium">
                Sign In
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

export default Register;
