import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "../apis/api";
import { getDashboardRoute } from "../utils/helper";
import {
  Shield, MapPin, Building, FileText, Hash,
  CheckCircle, AlertCircle, ArrowRight, Scale
} from "lucide-react";
import {updateUserProfile} from "../store/slices/authSlice";

const CompletePolice = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get user from Redux
  const { user } = useSelector((state) => state.auth);
  
  const [form, setForm] = useState({
    stationName: "",
    stationAddress: "",
    district: "",
    badgeId: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.stationName.trim()) newErrors.stationName = "Station name is required";
    if (!form.stationAddress.trim()) newErrors.stationAddress = "Station address is required";
    if (!form.district.trim()) newErrors.district = "District is required";
    if (!form.badgeId.trim()) newErrors.badgeId = "Badge ID is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    
    try {
      const response = await api.post("/auth/complete-profile", form);
      
      if (response.data.success) {
        // Update user in localStorage with new profile info
        const updatedUser = {
          ...user,
          policeInfo: {
            stationName: form.stationName,
            stationAddress: form.stationAddress,
            district: form.district,
            badgeId: form.badgeId,
          },
          profileCompleted: true,
        };
        
        dispatch(updateUserProfile(updatedUser));
        
        setSuccess(true);
        setTimeout(() => {
          const dashboardPath = getDashboardRoute(user.role);
          navigate(dashboardPath);
        }, 1500);
      }
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Failed to complete profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-float delay-1000"></div>
      </div>

      <div className="relative max-w-lg w-full">
        
        {/* Header */}
        <div className="text-center mb-8 animate-in">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-700 to-brand-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-brand-900 font-serif">LexiAI</span>
          </Link>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-100 to-orange-100 border border-red-200 mb-4">
            <Shield className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">Police Station Setup</span>
          </div>
          
          <h1 className="text-brand-900 mb-2">Complete Station Profile</h1>
          <p className="text-muted">Setup your station details for FIR management</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-in">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Station Profile Setup Complete!</p>
              <p className="text-xs text-green-600">Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{errors.general}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="card animate-in delay-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Station Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Police Station Name <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  name="stationName"
                  value={form.stationName}
                  onChange={handleChange}
                  placeholder="e.g., Andheri Police Station"
                  className={`input pl-11 ${errors.stationName ? 'border-danger' : ''}`}
                />
              </div>
              {errors.stationName && (
                <p className="text-xs text-danger mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.stationName}
                </p>
              )}
            </div>

            {/* Station Address */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Station Address <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted" />
                <textarea
                  name="stationAddress"
                  value={form.stationAddress}
                  onChange={handleChange}
                  placeholder="Enter complete station address with landmark"
                  rows="3"
                  className={`input pl-11 resize-none ${errors.stationAddress ? 'border-danger' : ''}`}
                />
              </div>
              {errors.stationAddress && (
                <p className="text-xs text-danger mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.stationAddress}
                </p>
              )}
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                District <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="e.g., Mumbai Suburban"
                  className={`input pl-11 ${errors.district ? 'border-danger' : ''}`}
                />
              </div>
              {errors.district && (
                <p className="text-xs text-danger mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.district}
                </p>
              )}
            </div>

            {/* Badge ID */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Officer Badge ID <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  name="badgeId"
                  value={form.badgeId}
                  onChange={handleChange}
                  placeholder="e.g., MH-POL-2024-12345"
                  className={`input pl-11 ${errors.badgeId ? 'border-danger' : ''}`}
                />
              </div>
              {errors.badgeId && (
                <p className="text-xs text-danger mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.badgeId}
                </p>
              )}
              <p className="text-xs text-muted mt-1">Official badge number for verification</p>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="flex gap-3">
                <FileText className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-900 mb-1">FIR Jurisdiction</p>
                  <p className="text-xs text-orange-700">
                    FIRs will be automatically routed to your station based on the district and location provided.
                  </p>
                </div>
              </div>
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
                  Setting Up Station...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Save & Continue
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center animate-in delay-200">
          <p className="text-xs text-muted flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            Secure and encrypted data storage
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompletePolice;
