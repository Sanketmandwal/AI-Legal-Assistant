import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, Users, MessageSquare, FileText, Scale, Calendar,
  ArrowRight, CheckCircle, Lock, Star, Zap, TrendingUp,
  Award, Target, Sparkles, ChevronRight, Play, Quote
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Landing = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(0);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // TEMP LOGIN FUNCTIONS
  const tempLoginAsCitizen = () => {
    login({ name: 'Rahul Sharma', email: 'rahul@example.com', role: 'citizen', id: '123' });
    navigate('/dashboard');
  };
  const tempLoginAsPolice = () => {
    login({ name: 'Inspector Verma', email: 'verma@police.gov.in', role: 'police', stationName: 'Mumbai Central', id: '456' });
    navigate('/police/dashboard');
  };
  const tempLoginAsLawyer = () => {
    login({ name: 'Adv. Priya Mehta', email: 'priya@lawyer.com', role: 'lawyer', barCouncilId: 'MH/12345/2020', id: '789' });
    navigate('/lawyer/dashboard');
  };

  const features = [
    { 
      Icon: Shield, 
      title: 'Smart FIR Filing', 
      desc: 'AI-powered incident reporting with automatic jurisdiction detection and legal section suggestions',
      color: 'from-brand-700 to-brand-900',
      stats: '2K+ FIRs Filed'
    },
    { 
      Icon: Users, 
      title: 'Verified Lawyers', 
      desc: 'Connect with Bar Council verified legal professionals based on specialization and ratings',
      color: 'from-accent to-cyan-600',
      stats: '500+ Lawyers'
    },
    { 
      Icon: MessageSquare, 
      title: 'AI Legal Assistant', 
      desc: 'Get instant answers to legal queries powered by advanced AI trained on Indian law',
      color: 'from-success to-emerald-600',
      stats: '10K+ Queries Solved'
    },
    { 
      Icon: FileText, 
      title: 'Smart Documents', 
      desc: 'Generate legal notices, agreements, and affidavits with AI-powered templates',
      color: 'from-warning to-orange-600',
      stats: '5K+ Docs Generated'
    },
    { 
      Icon: Scale, 
      title: 'Evidence Vault', 
      desc: 'Blockchain-secured evidence storage with time-stamped chain of custody',
      color: 'from-purple-600 to-pink-600',
      stats: '100% Secure'
    },
    { 
      Icon: Calendar, 
      title: 'Court Tracker', 
      desc: 'Never miss a hearing with smart reminders and calendar integration',
      color: 'from-red-600 to-rose-600',
      stats: '98% On-Time'
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Users', icon: Users },
    { value: '500+', label: 'Lawyers', icon: Award },
    { value: '2K+', label: 'FIRs Filed', icon: Shield },
    { value: '98%', label: 'Satisfaction', icon: Star },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Citizen, Mumbai',
      image: '👩‍💼',
      rating: 5,
      text: 'LexiAI made filing my FIR incredibly easy. The AI suggested the right sections and routed it to the correct police station automatically. Truly revolutionary!'
    },
    {
      name: 'Adv. Rajesh Kumar',
      role: 'Lawyer, Delhi',
      image: '👨‍⚖️',
      rating: 5,
      text: 'As a lawyer, this platform helps me connect with clients efficiently. The evidence management and document generation features are game-changers.'
    },
    {
      name: 'Inspector Anil Verma',
      role: 'Police Officer, Pune',
      image: '👮',
      rating: 5,
      text: 'The FIR dashboard has transformed how our station manages cases. Real-time notifications and the map view make our work so much more efficient.'
    },
  ];

  return (
    <div className="bg-primary overflow-hidden">
      {/* TEMP LOGIN BUTTONS */}
      <div className="fixed bottom-6 right-6 z-50 bg-surface/95 backdrop-blur-xl rounded-xl shadow-2xl p-4 border border-brand-700/20">
        <p className="text-xs font-bold text-brand-700 mb-3 text-center flex items-center gap-2">
          <Zap className="w-3 h-3" />
          TEMP LOGIN
        </p>
        <div className="space-y-2">
          <button onClick={tempLoginAsCitizen} className="btn-primary w-full text-xs py-2">
            Citizen
          </button>
          <button onClick={tempLoginAsPolice} className="bg-success text-white px-4 py-2 rounded-lg text-xs w-full hover:bg-success/90 transition-all">
            Police
          </button>
          <button onClick={tempLoginAsLawyer} className="bg-accent text-white px-4 py-2 rounded-lg text-xs w-full hover:bg-accent/90 transition-all">
            Lawyer
          </button>
        </div>
      </div>

      {/* HERO SECTION - ULTRA PREMIUM */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0">
          <div 
            className="absolute top-0 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-brand-700/30 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
          ></div>
          <div 
            className="absolute bottom-0 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-accent/30 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`, animationDelay: '1s' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/50 to-primary"></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-brand-700/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* LEFT - Hero Content */}
            <div className="text-center lg:text-left space-y-8">
              {/* Badge */}
              <div 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-700/10 to-accent/10 backdrop-blur-sm border border-brand-700/20 rounded-full text-sm font-semibold animate-in slide-in-from-bottom duration-700"
              >
                <Sparkles className="w-4 h-4 text-brand-700" />
                <span className="bg-gradient-to-r from-brand-700 to-accent bg-clip-text text-transparent">
                  India's #1 AI Legal Platform
                </span>
                <div className="flex -space-x-2">
                  {['👤','👤','👤'].map((e, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-brand-100 border-2 border-surface flex items-center justify-center text-xs">
                      {e}
                    </div>
                  ))}
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight animate-in slide-in-from-bottom duration-700 delay-100">
                <span className="text-brand-900">Legal Help</span>
                <br />
                <span className="bg-gradient-to-r from-brand-700 via-accent to-brand-900 bg-clip-text text-transparent inline-block">
                  Powered by AI
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl lg:text-2xl text-muted leading-relaxed max-w-2xl animate-in slide-in-from-bottom duration-700 delay-200">
                File FIRs instantly, connect with top lawyers, get AI-powered legal guidance, and manage your cases seamlessly - all in one platform.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-in slide-in-from-bottom duration-700 delay-300">
                <Button 
                  onClick={() => navigate('/signup')} 
                  className="group px-8 py-4 text-lg bg-gradient-to-r from-brand-700 to-brand-900 hover:shadow-2xl hover:shadow-brand-700/50 hover:scale-105 transition-all duration-300"
                >
                  Start Free Today
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  className="group px-8 py-4 text-lg border-2 hover:bg-brand-700 hover:text-white hover:border-brand-700 transition-all duration-300"
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 text-sm justify-center lg:justify-start animate-in slide-in-from-bottom duration-700 delay-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-muted">Free Forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-success" />
                  <span className="text-muted">Bank-Level Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-warning" />
                  <span className="text-muted">Instant Setup</span>
                </div>
              </div>
            </div>

            {/* RIGHT - 3D Floating Cards */}
            <div className="relative h-[600px] hidden lg:block">
              {/* Main Dashboard Card */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] animate-in zoom-in duration-1000"
                style={{ 
                  transform: `translate(calc(-50% + ${mousePosition.x * 0.5}px), calc(-50% + ${mousePosition.y * 0.5}px)) rotateY(${mousePosition.x * 0.5}deg) rotateX(${-mousePosition.y * 0.5}deg)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-700 to-accent rounded-2xl blur-3xl opacity-40 animate-pulse"></div>
                  
                  {/* Card */}
                  <div className="relative bg-surface/90 backdrop-blur-xl border-2 border-brand-700/20 rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-700 to-brand-900 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                          L
                        </div>
                        <div>
                          <p className="font-bold text-brand-900">LexiAI Dashboard</p>
                          <p className="text-xs text-muted">Your Legal Hub</p>
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-brand-100 rounded-full"></div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {[
                        { label: 'Active FIRs', value: '5', color: 'brand-700' },
                        { label: 'Consultations', value: '3', color: 'accent' },
                        { label: 'Documents', value: '12', color: 'success' },
                        { label: 'Hearings', value: '2', color: 'warning' },
                      ].map((stat, i) => (
                        <div key={i} className={`bg-gradient-to-br from-${stat.color}/10 to-transparent p-4 rounded-xl border border-${stat.color}/20`}>
                          <div className="text-2xl font-bold text-brand-900">{stat.value}</div>
                          <div className="text-xs text-muted">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Activity */}
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-primary rounded-lg">
                          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                            <Shield className="w-4 h-4 text-brand-700" />
                          </div>
                          <div className="flex-1">
                            <div className="h-2 bg-neutral-border rounded" style={{ width: `${100 - i * 15}%` }}></div>
                            <div className="h-1.5 bg-neutral-border/50 rounded mt-1" style={{ width: `${70 - i * 10}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Feature Cards */}
              {[
                { Icon: Shield, text: 'Smart FIR', pos: 'top-10 -left-10', delay: 0 },
                { Icon: Users, text: 'Find Lawyers', pos: 'top-10 -right-10', delay: 0.2 },
                { Icon: MessageSquare, text: 'AI Chat', pos: 'bottom-10 -left-10', delay: 0.4 },
                { Icon: FileText, text: 'Documents', pos: 'bottom-10 -right-10', delay: 0.6 },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`absolute ${item.pos} animate-in zoom-in duration-1000`}
                  style={{ 
                    animationDelay: `${item.delay}s`,
                    transform: `translate(${mousePosition.x * (i % 2 ? 1 : -1)}px, ${mousePosition.y * (i % 2 ? -1 : 1)}px)`
                  }}
                >
                  <div className="bg-surface/90 backdrop-blur-xl border border-brand-700/20 rounded-xl p-4 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer">
                    <item.Icon className="w-8 h-8 text-brand-700 mb-2" />
                    <p className="text-xs font-semibold text-brand-900">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-brand-700 rounded-full p-1">
            <div className="w-1.5 h-3 bg-brand-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* STATS SECTION - GLASSMORPHISM */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary via-surface to-primary"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div 
                key={i}
                className="group text-center animate-in zoom-in duration-700"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="relative">
                  {/* Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-700/20 to-accent/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Card */}
                  <div className="relative bg-surface/50 backdrop-blur-xl border border-brand-700/20 rounded-2xl p-8 hover:border-brand-700/50 transition-all duration-300">
                    <stat.icon className="w-12 h-12 mx-auto mb-4 text-brand-700 group-hover:scale-110 transition-transform" />
                    <div className="text-5xl font-bold bg-gradient-to-r from-brand-700 to-accent bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-muted font-medium">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION - INTERACTIVE */}
      <section id="features" className="py-32 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, var(--color-brand-700) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20 animate-in slide-in-from-bottom duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-700 rounded-full font-semibold mb-6">
              <Target className="w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-brand-900 mb-6">
              Everything You Need,
              <br />
              <span className="bg-gradient-to-r from-brand-700 to-accent bg-clip-text text-transparent">
                All in One Place
              </span>
            </h2>
            <p className="text-xl text-muted max-w-3xl mx-auto">
              Comprehensive legal assistance platform designed for citizens, police officers, and lawyers
            </p>
          </div>

          {/* Features Grid - PREMIUM CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative animate-in zoom-in duration-700"
                style={{ animationDelay: `${i * 0.1}s` }}
                onMouseEnter={() => setActiveFeature(i)}
              >
                {/* Animated border */}
                <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur"
                     style={{ backgroundImage: `linear-gradient(to right, var(--color-brand-700), var(--color-accent))` }}
                ></div>

                {/* Card */}
                <div className="relative h-full bg-surface border border-neutral-border rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                  {/* Icon with gradient */}
                  <div className="relative mb-6">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                    <div className={`relative w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <feature.Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-brand-900 mb-3 group-hover:text-brand-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted leading-relaxed mb-6">
                    {feature.desc}
                  </p>

                  {/* Stats badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-brand-700">{feature.stats}</span>
                    <ChevronRight className="w-5 h-5 text-brand-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 h-1 bg-neutral-border rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${feature.color} transition-all duration-1000 ${activeFeature === i ? 'w-full' : 'w-0'}`}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - CAROUSEL STYLE */}
      <section id="testimonials" className="py-32 bg-gradient-to-b from-surface to-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-700 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-brand-900 mb-6">
              Loved by <span className="bg-gradient-to-r from-brand-700 to-accent bg-clip-text text-transparent">Thousands</span>
            </h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              See what our users have to say about their experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="group relative animate-in zoom-in duration-700"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-700/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Card */}
                <div className="relative bg-surface border border-neutral-border rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
                  {/* Quote icon */}
                  <Quote className="w-10 h-10 text-brand-700/20 mb-4" />

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-warning text-warning" />
                    ))}
                  </div>

                  {/* Testimonial text */}
                  <p className="text-muted italic mb-6 flex-grow leading-relaxed">
                    "{testimonial.text}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-4 border-t border-neutral-border">
                    <div className="text-4xl">{testimonial.image}</div>
                    <div>
                      <p className="font-bold text-brand-900">{testimonial.name}</p>
                      <p className="text-sm text-muted">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION - MEGA PREMIUM */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-700 to-accent"></div>
        
        {/* Animated mesh gradient */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center text-white">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full font-semibold mb-8">
              <Sparkles className="w-4 h-4" />
              Start Your Legal Journey Today
            </div>

            {/* Headline */}
            <h2 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Ready to Transform
              <br />
              Your Legal Experience?
            </h2>

            <p className="text-2xl text-brand-100 mb-12 leading-relaxed">
              Join 10,000+ users who trust LexiAI for their legal needs.
              <br />
              Get started for free, no credit card required.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Button
                onClick={() => navigate('/signup')}
                className="group bg-white text-brand-700 hover:bg-brand-100 px-10 py-5 text-xl rounded-2xl shadow-2xl hover:shadow-white/50 hover:scale-105 transition-all duration-300"
              >
                Create Free Account
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                className="px-10 py-5 text-xl border-2 border-white text-white hover:bg-white hover:text-brand-700 rounded-2xl transition-all duration-300"
              >
                <Play className="w-6 h-6" />
                Watch How It Works
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-brand-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                <span>Free Forever Plan</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-6 h-6" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6" />
                <span>Setup in 2 Minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add floating animation to index.css */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Landing;
