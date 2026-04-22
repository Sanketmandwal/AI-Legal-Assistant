import { Button } from "../ui/button"
import { Link } from "react-router-dom"


export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LA</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">
                Legal Assistant
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 text-sm text-slate-600">
            <div className="space-y-4">
              <div className="font-bold text-slate-900">Legal Assistant</div>
              <p>AI-powered platform for smart FIR filing and legal consultations.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Citizens</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-primary">File FIR</a></li>
                <li><a href="#" className="hover:text-primary">Track Status</a></li>
                <li><a href="#" className="hover:text-primary">Consult Lawyers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Lawyers</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-primary">Manage Cases</a></li>
                <li><a href="#" className="hover:text-primary">Client Chat</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p>Pune, Maharashtra</p>
              <p>support@legalassistant.in</p>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-12 pt-8 text-center text-xs text-slate-500">
            © 2026 AI Legal Assistant. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
