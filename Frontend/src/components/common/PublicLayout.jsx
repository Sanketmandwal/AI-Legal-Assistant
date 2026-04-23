import { Scale } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "../ui/button"

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
                <Scale className="size-4.5" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-foreground">Legal Assistant</span>
            </Link>

            <div className="flex items-center gap-2">
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

      <footer className="mt-24 border-t border-border bg-card">
        <div className="w-full px-4 py-12 sm:px-6 lg:px-12">
          <div className="grid gap-8 text-sm text-muted-foreground md:grid-cols-4">
            <div className="space-y-4">
              <div className="font-semibold text-foreground">Legal Assistant</div>
              <p>AI-powered platform for smart FIR filing and legal consultations.</p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">For Citizens</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-primary">File FIR</a></li>
                <li><a href="#" className="hover:text-primary">Track Status</a></li>
                <li><a href="#" className="hover:text-primary">Consult Lawyers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">For Lawyers</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-primary">Manage Cases</a></li>
                <li><a href="#" className="hover:text-primary">Client Chat</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Contact</h4>
              <p>Pune, Maharashtra</p>
              <p>support@legalassistant.in</p>
            </div>
          </div>
          <div className="mt-12 border-t border-border pt-8 text-center text-xs text-muted-foreground">
            © 2026 AI Legal Assistant. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
