import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Link } from "react-router-dom"
import PublicLayout from "../components/common/PublicLayout"
import { FileText, Users, MessageSquare, Shield, Clock, CheckCircle, ArrowRight } from "lucide-react"


const features = [
  {
    icon: FileText,
    title: "File FIR Instantly",
    description: "Smart AI-assisted forms, evidence upload, automatic nearest station assignment.",
    color: "bg-blue-600",
    gradient: "from-blue-50 to-indigo-50"
  },
  {
    icon: Users,
    title: "Verified Lawyers",
    description: "AI-matched by specialization, distance, rating, and fee. Consult in minutes.",
    color: "bg-emerald-600",
    gradient: "from-emerald-50 to-green-50"
  },
  {
    icon: MessageSquare,
    title: "Real-Time Chat",
    description: "Secure encrypted chat between citizens and lawyers with file sharing.",
    color: "bg-purple-600",
    gradient: "from-purple-50 to-pink-50"
  },
  {
    icon: Shield,
    title: "Police Dashboard",
    description: "Dedicated portal for police to manage, update, and resolve FIR cases.",
    color: "bg-rose-600",
    gradient: "from-rose-50 to-orange-50"
  },
  {
    icon: Clock,
    title: "Live Case Tracking",
    description: "Real-time FIR status updates with full timeline history.",
    color: "bg-amber-600",
    gradient: "from-amber-50 to-yellow-50"
  },
  {
    icon: CheckCircle,
    title: "Secure Evidence",
    description: "Encrypted document storage with time-limited secure access links.",
    color: "bg-teal-600",
    gradient: "from-teal-50 to-cyan-50"
  }
]

const roles = [
  {
    role: "Citizens",
    badge: "bg-blue-100 text-blue-800",
    steps: [
      "Register and verify your identity via OTP",
      "File a detailed FIR with evidence upload",
      "Get matched with the best lawyers nearby",
      "Track your case status in real-time"
    ]
  },
  {
    role: "Lawyers",
    badge: "bg-emerald-100 text-emerald-800",
    steps: [
      "Complete your professional profile & verification",
      "Receive consultation requests from citizens",
      "Accept cases and chat securely with clients",
      "Manage your case history and reviews"
    ]
  },
  {
    role: "Police",
    badge: "bg-rose-100 text-rose-800",
    steps: [
      "Access your assigned FIR dashboard",
      "Review and update FIR status",
      "Add investigation updates & evidence",
      "Coordinate with station hierarchy"
    ]
  }
]

const stats = [
  { value: "500+", label: "FIRs Filed" },
  { value: "200+", label: "Verified Lawyers" },
  { value: "50+", label: "Police Stations" },
  { value: "98%", label: "Satisfaction Rate" }
]

export default function Home() {
  return (
    <PublicLayout>

      {/* Hero Section */}
      <section className="py-24 md:py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 -z-10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse -z-10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse -z-10" />

        <div className="container mx-auto px-4 max-w-5xl">
          <Badge className="mb-6 px-4 py-2 bg-blue-100 text-blue-800 border-0 text-sm font-medium rounded-full">
            🏛️ India's AI-Powered Legal Platform
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Smart Legal Help{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              For Everyone
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            File FIRs instantly, connect with verified lawyers, and track your case — 
            all in one secure platform built for Indian citizens.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button size="lg" asChild className="text-lg px-10 h-14 shadow-lg hover:shadow-xl transition-shadow">
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-lg px-10 h-14">
              <Link to="/login">Login to Dashboard</Link>
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-slate-100 text-slate-700 border-0">Features</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything You Need</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A complete legal ecosystem for citizens, lawyers, and police
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card 
                key={feature.title} 
                className={`group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br ${feature.gradient} cursor-pointer`}
              >
                <CardHeader>
                  <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base text-slate-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-slate-100 text-slate-700 border-0">How It Works</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple for Every Role</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((item) => (
              <Card key={item.role} className="border-0 shadow-md hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <Badge className={`w-fit mb-4 ${item.badge}`}>{item.role}</Badge>
                  <CardTitle className="text-2xl">{item.role}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {item.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-slate-600">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Legal Help?
          </h2>
          <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of citizens, lawyers, and officers already using AI Legal Assistant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg px-10 h-14">
              <Link to="/signup">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-10 h-14 border-white text-white hover:bg-white hover:text-primary">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </section>

    </PublicLayout>
  )
}
