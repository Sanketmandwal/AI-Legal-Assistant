import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "../apis/api";
import { getDashboardRoute } from "../utils/helper";
import {
  Scale, Award, Briefcase, MapPin, FileText,
  CheckCircle, AlertCircle, ArrowRight, Shield
} from "lucide-react";
import {updateUserProfile} from "../store/slices/authSlice";

const CompleteLawyer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get user from Redux
  const { user,token } = useSelector((state) => state.auth);
  
  const [form, setForm] = useState({
    barId: "",
    specialization: "",
    experience: 0,
    city: "",
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
    if (!form.barId.trim()) newErrors.barId = "Bar Council ID is required";
    if (!form.specialization.trim()) newErrors.specialization = "Specialization is required";
    if (!form.experience || form.experience < 0) newErrors.experience = "Valid experience required";
    if (!form.city.trim()) newErrors.city = "City is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    
    try {
      console.log("Submitting Complete Profile with token:", token);
      const response = await api.post("/auth/complete-profile",{ ...form });
      console.log("Complete Profile Response:", response.data);
      
      if (response.data.success) {
        // Update user in localStorage with new profile info
        const updatedUser = {
          ...user,
          lawyerInfo: {
            barId: form.barId,
            specialization: form.specialization,
            experience: form.experience,
            city: form.city,
            verified: false, // Will be verified by admin
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
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float delay-1000"></div>
      </div>

      <div className="relative max-w-lg w-full">
        
        {/* Header */}
        <div className="text-center mb-8 animate-in">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-100 to-accent/10 border border-brand-200 mb-4">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-brand-700">Lawyer Verification</span>
          </div>
          
          <h1 className="text-brand-900 mb-2">Complete Your Lawyer Profile</h1>
          <p className="text-muted">Verify your credentials to start accepting clients</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-in">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Profile Completed Successfully!</p>
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
            
            {/* Bar Council ID */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Bar Council ID <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="barId"
                  value={form.barId}
                  onChange={handleChange}
                  placeholder="e.g., BAR/2020/12345"
                  className={`input pl-11 ${errors.barId ? 'border-danger' : ''}`}
                />
              </div>
              {errors.barId && (
                <p className="text-xs text-danger mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.barId}
                </p>
              )}
              <p className="text-xs text-muted mt-1">Enter your registered Bar Council identification number</p>
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Area of Specialization <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  placeholder="e.g., Criminal Law, Civil Law, Corporate Law"
                  className={`input pl-11 ${errors.specialization ? 'border-danger' : ''}`}
                />
              </div>
              {errors.specialization && (
                <p className="text-xs text-danger mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.specialization}
                </p>
              )}
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Years of Experience <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  max="70"
                  className={`input pl-11 ${errors.experience ? 'border-danger' : ''}`}
                />
              </div>
              {errors.experience && (
                <p className="text-xs text-danger mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.experience}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Practice City <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                  className={`input pl-11 ${errors.city ? 'border-danger' : ''}`}
                />
              </div>
              {errors.city && (
                <p className="text-xs text-danger mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.city}
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex gap-3">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Verification Process</p>
                  <p className="text-xs text-blue-700">
                    Your profile will be verified by our team within 24-48 hours. You'll receive a notification once approved.
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
                  Saving Profile...
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
          <p className="text-xs text-muted">
            By completing this profile, you agree to our{" "}
            <Link to="/terms" className="text-brand-700 hover:text-accent">Lawyer Terms</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompleteLawyer;
