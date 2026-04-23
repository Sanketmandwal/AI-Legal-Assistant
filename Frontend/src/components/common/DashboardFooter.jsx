import { Github, Linkedin, Mail, MapPin, Phone, Scale, Twitter } from 'lucide-react'

export default function DashboardFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
                <Scale className="h-[18px] w-[18px]" />
              </div>
              <div>
                <span className="text-base font-semibold text-foreground">Legal Assistant</span>
                <span className="block -mt-0.5 text-[10px] leading-none text-muted-foreground">AI Powered Platform</span>
              </div>
            </div>
            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              An AI-powered legal assistant platform designed to bridge the gap between citizens, lawyers, and law enforcement.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">Platform</h4>
            <ul className="space-y-2">
              {['File FIR Online', 'Find Lawyers', 'Track Case Status', 'Legal Chat'].map((item) => (
                <li key={item}><span className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground">{item}</span></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">Legal</h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Disclaimer'].map((item) => (
                <li key={item}><span className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground">{item}</span></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">Contact</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-xs text-muted-foreground"><Mail className="h-3.5 w-3.5" />support@legalassistant.ai</li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="h-3.5 w-3.5" />+91 1800-XXX-XXXX</li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />New Delhi, India</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-[11px] text-muted-foreground">© {new Date().getFullYear()} AI Legal Assistant. All rights reserved. Built as a Final Year Project.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><Github className="h-3.5 w-3.5" /></a>
            <a href="#" className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><Linkedin className="h-3.5 w-3.5" /></a>
            <a href="#" className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><Twitter className="h-3.5 w-3.5" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
