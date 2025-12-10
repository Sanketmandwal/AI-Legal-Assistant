import { Link } from 'react-router-dom';
import { 
  FileText, Scale, MessageSquare, TrendingUp, 
  Clock, CheckCircle, AlertCircle, Users,
  ArrowRight, Plus, Search, Calendar,
  Shield, Sparkles, Activity, Bell
} from 'lucide-react';
import { useSelector } from 'react-redux';

const CitizenDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  // Mock data - Replace with real data from backend
  const stats = [
    {
      title: 'Total FIRs',
      value: '12',
      change: '+2 this month',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      title: 'Active Cases',
      value: '3',
      change: 'In progress',
      icon: Activity,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
    },
    {
      title: 'Completed',
      value: '8',
      change: 'Resolved',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      title: 'AI Queries',
      value: '24',
      change: '+5 today',
      icon: MessageSquare,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
  ];

  const quickActions = [
    {
      title: 'File New FIR',
      description: 'Create a new complaint with AI assistance',
      icon: Plus,
      path: '/fir/new',
      color: 'from-brand-700 to-brand-500',
      highlight: true,
    },
    {
      title: 'AI Legal Assistant',
      description: 'Get instant answers to legal questions',
      icon: MessageSquare,
      path: '/chatbot',
      color: 'from-accent to-cyan-500',
    },
    {
      title: 'Find Lawyer',
      description: 'Connect with expert lawyers near you',
      icon: Users,
      path: '/lawyers',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Track Court Dates',
      description: 'Manage your hearing schedules',
      icon: Calendar,
      path: '/court-tracker',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const recentFirs = [
    {
      id: 'FIR001',
      title: 'Vehicle Theft Complaint',
      status: 'Under Review',
      date: '2 days ago',
      station: 'Mumbai Central Police Station',
      statusColor: 'warning',
    },
    {
      id: 'FIR002',
      title: 'Lost Documents Report',
      status: 'Accepted',
      date: '5 days ago',
      station: 'Andheri Police Station',
      statusColor: 'success',
    },
    {
      id: 'FIR003',
      title: 'Cyber Fraud Complaint',
      status: 'In Progress',
      date: '1 week ago',
      station: 'Cyber Crime Cell',
      statusColor: 'accent',
    },
  ];

  const recentActivity = [
    {
      action: 'FIR Status Updated',
      description: 'Your complaint #FIR001 is now under review',
      time: '2 hours ago',
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      action: 'AI Query Answered',
      description: 'Legal chatbot answered your question about bail',
      time: '5 hours ago',
      icon: MessageSquare,
      color: 'text-purple-600',
    },
    {
      action: 'Document Uploaded',
      description: 'Evidence document added to case #FIR002',
      time: '1 day ago',
      icon: Shield,
      color: 'text-green-600',
    },
    {
      action: 'New Message',
      description: 'Lawyer responded to your consultation request',
      time: '2 days ago',
      icon: Users,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-primary py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Welcome Header */}
        <div className="mb-8 animate-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-brand-900 mb-2">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-muted">Here's what's happening with your legal matters today</p>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <span className="hidden sm:inline">3 Notifications</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="card-hover animate-in group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.bgColor} ${stat.textColor}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-brand-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-muted">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8 animate-in delay-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-brand-900">Quick Actions</h2>
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className={`card-hover group relative overflow-hidden ${action.highlight ? 'ring-2 ring-accent' : ''}`}
              >
                {action.highlight && (
                  <div className="absolute top-3 right-3">
                    <span className="badge badge-accent text-xs">Popular</span>
                  </div>
                )}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <action.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-brand-900 mb-2 group-hover:text-brand-700 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-muted mb-4">{action.description}</p>
                <div className="flex items-center gap-2 text-sm text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Get started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Recent FIRs - Takes 2 columns */}
          <div className="lg:col-span-2 animate-in delay-300">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-brand-900">Recent FIRs</h2>
                <Link to="/fir/list" className="text-sm text-brand-700 hover:text-accent font-medium flex items-center gap-1">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {recentFirs.map((fir, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-neutral-border hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-200 transition-colors">
                          <FileText className="w-5 h-5 text-brand-700" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-text mb-1 group-hover:text-brand-700 transition-colors">
                            {fir.title}
                          </h3>
                          <p className="text-xs text-muted flex items-center gap-2">
                            <Scale className="w-3 h-3" />
                            {fir.station}
                          </p>
                        </div>
                      </div>
                      <span className={`badge badge-${fir.statusColor}`}>
                        {fir.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {fir.date}
                      </span>
                      <span className="text-brand-700 font-medium">#{fir.id}</span>
                    </div>
                  </div>
                ))}
              </div>

              {recentFirs.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-brand-700" />
                  </div>
                  <h3 className="text-neutral-text mb-2">No FIRs Yet</h3>
                  <p className="text-sm text-muted mb-4">Get started by filing your first complaint</p>
                  <Link to="/fir/new">
                    <button className="btn-primary">
                      <Plus className="w-4 h-4" />
                      File New FIR
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity - Takes 1 column */}
          <div className="animate-in delay-400">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-brand-900">Recent Activity</h2>
                <Activity className="w-5 h-5 text-muted" />
              </div>

              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex gap-3 group">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-neutral-bg to-white flex items-center justify-center flex-shrink-0 border border-neutral-border group-hover:scale-110 transition-transform`}>
                      <activity.icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-text mb-1">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted mb-1 line-clamp-2">
                        {activity.description}
                      </p>
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 py-2 text-sm text-brand-700 hover:text-accent font-medium flex items-center justify-center gap-2 hover:bg-brand-50 rounded-lg transition-colors">
                View All Activity
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 animate-in delay-500">
          <div className="card bg-gradient-to-r from-accent/10 to-brand-100/50 border-accent/20">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-cyan-500 flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-text mb-1">Need Help Getting Started?</h3>
                  <p className="text-sm text-muted">Watch our tutorial or read the documentation</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="btn-outline text-sm">
                  View Tutorial
                </button>
                <Link to="/about">
                  <button className="btn-secondary text-sm">
                    Learn More
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
