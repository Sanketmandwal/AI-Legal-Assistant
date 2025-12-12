import { Link } from 'react-router-dom';
import { 
  Users, Briefcase, MessageSquare, TrendingUp, 
  Clock, CheckCircle, DollarSign, Calendar,
  ArrowRight, Star, Phone, Mail,
  Activity, Award, FileText, Video, Settings
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useState } from 'react';

const LawyerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [isAvailable, setIsAvailable] = useState(true);

  // Mock data - Replace with real data from backend
  const stats = [
    {
      title: 'Total Clients',
      value: '48',
      change: '+12 this month',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      title: 'Active Cases',
      value: '15',
      change: 'In progress',
      icon: Briefcase,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
    },
    {
      title: 'This Month',
      value: '₹45,000',
      change: '+18% from last month',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      title: 'Consultations',
      value: '32',
      change: '+8 this week',
      icon: MessageSquare,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
  ];

  const pendingRequests = [
    {
      clientName: 'Rahul Sharma',
      caseType: 'Property Dispute',
      priority: 'High',
      time: '2 hours ago',
      avatar: 'RS',
      urgency: 'danger',
    },
    {
      clientName: 'Priya Patel',
      caseType: 'Divorce Consultation',
      priority: 'Medium',
      time: '5 hours ago',
      avatar: 'PP',
      urgency: 'warning',
    },
    {
      clientName: 'Amit Kumar',
      caseType: 'Criminal Defense',
      priority: 'High',
      time: '1 day ago',
      avatar: 'AK',
      urgency: 'danger',
    },
  ];

  const activeConsultations = [
    {
      id: 'CONS001',
      clientName: 'Sneha Reddy',
      caseType: 'Consumer Rights',
      status: 'Ongoing',
      nextHearing: 'Dec 15, 2025',
      progress: 65,
      avatar: 'SR',
    },
    {
      id: 'CONS002',
      clientName: 'Vikram Singh',
      caseType: 'Employment Law',
      status: 'Document Review',
      nextHearing: 'Dec 18, 2025',
      progress: 45,
      avatar: 'VS',
    },
    {
      id: 'CONS003',
      clientName: 'Anjali Mehta',
      caseType: 'Family Law',
      status: 'Final Stage',
      nextHearing: 'Dec 20, 2025',
      progress: 85,
      avatar: 'AM',
    },
  ];

  const upcomingSchedule = [
    {
      title: 'Client Meeting - Rahul Sharma',
      time: 'Today, 3:00 PM',
      type: 'Meeting',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Court Hearing - Property Case',
      time: 'Tomorrow, 10:30 AM',
      type: 'Court',
      icon: Briefcase,
      color: 'text-orange-600',
    },
    {
      title: 'Video Consultation - Priya Patel',
      time: 'Dec 13, 2:00 PM',
      type: 'Video Call',
      icon: Video,
      color: 'text-purple-600',
    },
    {
      title: 'Document Submission Deadline',
      time: 'Dec 15, 5:00 PM',
      type: 'Deadline',
      icon: FileText,
      color: 'text-red-600',
    },
  ];

  const recentActivity = [
    {
      action: 'New Client Request',
      description: 'Rahul Sharma requested consultation for property dispute',
      time: '2 hours ago',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      action: 'Case Updated',
      description: 'CONS002 status changed to Document Review',
      time: '5 hours ago',
      icon: Briefcase,
      color: 'text-orange-600',
    },
    {
      action: 'Payment Received',
      description: '₹5,000 received from Sneha Reddy',
      time: '1 day ago',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      action: 'Document Uploaded',
      description: 'Client submitted evidence for case #CONS001',
      time: '2 days ago',
      icon: FileText,
      color: 'text-purple-600',
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
                Welcome back, Adv. {user?.name?.split(' ')[0]}! 👨‍⚖️
              </h1>
              <p className="text-muted">Manage your cases and clients efficiently</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Availability Toggle */}
              <div className="card py-2 px-4 flex items-center gap-3">
                <span className="text-sm font-medium text-neutral-text">
                  {isAvailable ? 'Available' : 'Unavailable'}
                </span>
                <button
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isAvailable ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                      isAvailable ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <Link to="/settings">
                <button className="btn-outline flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  <span className="hidden sm:inline">Settings</span>
                </button>
              </Link>
            </div>
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

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          
          {/* Pending Client Requests */}
          <div className="lg:col-span-2 animate-in delay-200">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-brand-900 flex items-center gap-2">
                  Pending Requests
                  <span className="badge badge-danger">{pendingRequests.length}</span>
                </h2>
                <Link to="/clients/requests" className="text-sm text-brand-700 hover:text-accent font-medium flex items-center gap-1">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {pendingRequests.map((request, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-neutral-border hover:border-brand-300 hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-accent flex items-center justify-center text-white font-semibold shadow-lg">
                          {request.avatar}
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-text mb-1 group-hover:text-brand-700 transition-colors">
                            {request.clientName}
                          </h3>
                          <p className="text-xs text-muted">{request.caseType}</p>
                        </div>
                      </div>
                      <span className={`badge badge-${request.urgency}`}>
                        {request.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {request.time}
                      </span>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium">
                          Accept
                        </button>
                        <button className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium">
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="animate-in delay-300">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-brand-900">Today's Schedule</h2>
                <Calendar className="w-5 h-5 text-muted" />
              </div>

              <div className="space-y-4">
                {upcomingSchedule.map((event, index) => (
                  <div key={index} className="flex gap-3 group cursor-pointer">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-neutral-bg to-white flex items-center justify-center flex-shrink-0 border border-neutral-border group-hover:scale-110 transition-transform`}>
                      <event.icon className={`w-5 h-5 ${event.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-text mb-1">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/calendar">
                <button className="w-full mt-6 py-2 text-sm text-brand-700 hover:text-accent font-medium flex items-center justify-center gap-2 hover:bg-brand-50 rounded-lg transition-colors">
                  View Full Calendar
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Active Consultations */}
        <div className="animate-in delay-400 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-brand-900">Active Consultations</h2>
              <Link to="/cases" className="text-sm text-brand-700 hover:text-accent font-medium flex items-center gap-1">
                View All Cases
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {activeConsultations.map((consultation, index) => (
                <div
                  key={index}
                  className="card-hover group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold shadow-lg group-hover:scale-110 transition-transform">
                        {consultation.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-text mb-1">
                          {consultation.clientName}
                        </h3>
                        <p className="text-xs text-brand-700">#{consultation.id}</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted mb-3">{consultation.caseType}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-muted">Progress</span>
                      <span className="font-medium text-brand-700">{consultation.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-accent to-brand-500 transition-all duration-500"
                        style={{ width: `${consultation.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-border">
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {consultation.nextHearing}
                    </span>
                    <span className="badge badge-success text-xs">
                      {consultation.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Recent Activity */}
          <div className="lg:col-span-2 animate-in delay-500">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-brand-900">Recent Activity</h2>
                <Activity className="w-5 h-5 text-muted" />
              </div>

              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex gap-3 group">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-neutral-bg to-white flex items-center justify-center flex-shrink-0 border border-neutral-border group-hover:scale-110 transition-transform`}>
                      <activity.icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-text mb-1">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted mb-1">
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
            </div>
          </div>

          {/* Performance & Profile Widget */}
          <div className="animate-in delay-600">
            {/* Rating Widget */}
            <div className="card mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-text mb-1">Your Rating</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-neutral-text">4.9</span>
                  </div>
                </div>
                <Award className="w-12 h-12 text-yellow-500" />
              </div>
              <p className="text-sm text-muted mb-3">Based on 48 client reviews</p>
              <Link to="/profile">
                <button className="w-full btn-secondary text-sm">
                  View Profile
                </button>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="card bg-gradient-to-br from-brand-700 to-brand-500 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full py-3 px-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-all flex items-center gap-3 text-left">
                    <Users className="w-5 h-5" />
                    Find New Clients
                  </button>
                  <button className="w-full py-3 px-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-all flex items-center gap-3 text-left">
                    <Calendar className="w-5 h-5" />
                    Manage Availability
                  </button>
                  <button className="w-full py-3 px-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-all flex items-center gap-3 text-left">
                    <DollarSign className="w-5 h-5" />
                    View Earnings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerDashboard;
