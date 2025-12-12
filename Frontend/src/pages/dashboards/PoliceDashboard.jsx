import { Link } from 'react-router-dom';
import { 
  FileText, AlertCircle, CheckCircle, Clock, 
  Users, MapPin, TrendingUp, Activity,
  ArrowRight, Search, Filter, Download,
  Shield, Bell, Eye, Ban, CheckSquare, XCircle
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useState } from 'react';

const PoliceDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - Replace with real data from backend
  const stats = [
    {
      title: 'Pending FIRs',
      value: '23',
      change: 'Awaiting review',
      icon: Clock,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      urgent: true,
    },
    {
      title: 'Under Investigation',
      value: '47',
      change: 'Active cases',
      icon: Activity,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      title: 'Resolved Today',
      value: '12',
      change: '+3 from yesterday',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      title: 'Total This Month',
      value: '156',
      change: '+24% from last month',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
  ];

  const pendingFirs = [
    {
      id: 'FIR2025001',
      complainant: 'Rahul Sharma',
      type: 'Vehicle Theft',
      priority: 'High',
      location: 'Andheri West, Mumbai',
      submittedTime: '2 hours ago',
      assignedTo: 'Unassigned',
      urgency: 'danger',
    },
    {
      id: 'FIR2025002',
      complainant: 'Priya Patel',
      type: 'Mobile Theft',
      priority: 'Medium',
      location: 'Bandra East, Mumbai',
      submittedTime: '4 hours ago',
      assignedTo: 'Unassigned',
      urgency: 'warning',
    },
    {
      id: 'FIR2025003',
      complainant: 'Amit Kumar',
      type: 'Lost Documents',
      priority: 'Low',
      location: 'Dadar, Mumbai',
      submittedTime: '6 hours ago',
      assignedTo: 'Unassigned',
      urgency: 'accent',
    },
  ];

  const activeFirs = [
    {
      id: 'FIR2025004',
      complainant: 'Sneha Reddy',
      type: 'Cyber Fraud',
      status: 'Under Investigation',
      assignedTo: 'Inspector Verma',
      progress: 65,
      lastUpdate: '1 day ago',
    },
    {
      id: 'FIR2025005',
      complainant: 'Vikram Singh',
      type: 'Property Dispute',
      status: 'Evidence Collection',
      assignedTo: 'Inspector Kapoor',
      progress: 40,
      lastUpdate: '2 days ago',
    },
    {
      id: 'FIR2025006',
      complainant: 'Anjali Mehta',
      type: 'Domestic Violence',
      status: 'Final Stage',
      assignedTo: 'Inspector Sharma',
      progress: 85,
      lastUpdate: '3 hours ago',
    },
  ];

  const recentActions = [
    {
      action: 'FIR Accepted',
      description: 'FIR2025004 assigned to Inspector Verma',
      time: '1 hour ago',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      action: 'Status Updated',
      description: 'FIR2025005 moved to Evidence Collection',
      time: '3 hours ago',
      icon: Activity,
      color: 'text-blue-600',
    },
    {
      action: 'FIR Rejected',
      description: 'FIR2024999 rejected - Incomplete information',
      time: '5 hours ago',
      icon: XCircle,
      color: 'text-red-600',
    },
    {
      action: 'New Submission',
      description: 'FIR2025001 received from Andheri jurisdiction',
      time: '2 hours ago',
      icon: FileText,
      color: 'text-purple-600',
    },
  ];

  const crimeStatistics = [
    { type: 'Theft', count: 45, percentage: 35, color: 'bg-red-500' },
    { type: 'Cyber Crime', count: 32, percentage: 25, color: 'bg-purple-500' },
    { type: 'Fraud', count: 28, percentage: 22, color: 'bg-orange-500' },
    { type: 'Assault', count: 15, percentage: 12, color: 'bg-yellow-500' },
    { type: 'Others', count: 8, percentage: 6, color: 'bg-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-primary py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Welcome Header */}
        <div className="mb-8 animate-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-brand-900 mb-2 flex items-center gap-3">
                <Shield className="w-8 h-8 text-brand-700" />
                {user?.name || 'Police Station'} Dashboard
              </h1>
              <p className="text-muted">Monitor and manage FIRs efficiently</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-outline flex items-center gap-2">
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Export Report</span>
              </button>
              <button className="btn-primary flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <span className="hidden sm:inline">23 Alerts</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`card-hover animate-in group ${stat.urgent ? 'ring-2 ring-red-300' : ''}`}
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
              {stat.urgent && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <Link to="/fir/pending" className="text-xs text-red-600 font-medium flex items-center gap-1 hover:text-red-700">
                    Review Now <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Search and Filter Bar */}
        <div className="card mb-8 animate-in delay-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Search by FIR ID, Complainant, or Type..."
                className="input pl-11 w-full"
              />
            </div>
            <div className="flex gap-3">
              <button className="btn-outline flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Under Investigation</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          
          {/* Pending FIRs - Takes 2 columns */}
          <div className="lg:col-span-2 animate-in delay-300">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-brand-900 flex items-center gap-2">
                  Pending FIRs
                  <span className="badge badge-danger">{pendingFirs.length}</span>
                </h2>
                <Link to="/fir/pending" className="text-sm text-brand-700 hover:text-accent font-medium flex items-center gap-1">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {pendingFirs.map((fir, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border-2 border-neutral-border hover:border-brand-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-brand-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-neutral-text">
                              {fir.complainant}
                            </h3>
                            <span className={`badge badge-${fir.urgency} text-xs`}>
                              {fir.priority}
                            </span>
                          </div>
                          <p className="text-sm text-brand-700 mb-2">#{fir.id}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-muted">
                            <span className="flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {fir.type}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {fir.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {fir.submittedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-border">
                      <span className="text-xs text-muted">
                        Assigned: <span className="font-medium">{fir.assignedTo}</span>
                      </span>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-xs bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition-colors font-medium flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          Review
                        </button>
                        <button className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-1">
                          <CheckSquare className="w-3 h-3" />
                          Accept
                        </button>
                        <button className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-1">
                          <Ban className="w-3 h-3" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Crime Statistics & Recent Actions */}
          <div className="animate-in delay-400">
            {/* Crime Stats */}
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-brand-900">Crime Statistics</h2>
                <span className="text-xs text-muted">This Month</span>
              </div>

              <div className="space-y-4">
                {crimeStatistics.map((crime, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-neutral-text font-medium">{crime.type}</span>
                      <span className="text-muted">{crime.count} cases</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-border rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${crime.color} transition-all duration-500`}
                        style={{ width: `${crime.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Actions */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-brand-900">Recent Actions</h2>
                <Activity className="w-5 h-5 text-muted" />
              </div>

              <div className="space-y-4">
                {recentActions.map((action, index) => (
                  <div key={index} className="flex gap-3 group">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-neutral-bg to-white flex items-center justify-center flex-shrink-0 border border-neutral-border group-hover:scale-110 transition-transform`}>
                      <action.icon className={`w-4 h-4 ${action.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-text mb-1">
                        {action.action}
                      </p>
                      <p className="text-xs text-muted mb-1 line-clamp-2">
                        {action.description}
                      </p>
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {action.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Active Investigations */}
        <div className="animate-in delay-500">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-brand-900">Active Investigations</h2>
              <Link to="/fir/all" className="text-sm text-brand-700 hover:text-accent font-medium flex items-center gap-1">
                View All Cases
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {activeFirs.map((fir, index) => (
                <div
                  key={index}
                  className="card-hover group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-neutral-text mb-1">
                        {fir.complainant}
                      </h3>
                      <p className="text-xs text-brand-700">#{fir.id}</p>
                    </div>
                    <span className="badge badge-accent text-xs">{fir.type}</span>
                  </div>
                  
                  <p className="text-sm text-muted mb-4">{fir.status}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-muted">Progress</span>
                      <span className="font-medium text-brand-700">{fir.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-accent to-brand-500 transition-all duration-500"
                        style={{ width: `${fir.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-border text-xs">
                    <span className="text-muted flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {fir.assignedTo}
                    </span>
                    <span className="text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {fir.lastUpdate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliceDashboard;
