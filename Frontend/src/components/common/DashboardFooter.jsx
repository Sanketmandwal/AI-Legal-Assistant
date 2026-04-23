// src/components/common/DashboardFooter.jsx
import { Scale, Mail, Phone, MapPin, Github, Linkedin, Twitter } from 'lucide-react'

export default function DashboardFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <Scale className="h-[18px] w-[18px] text-white" />
              </div>
              <div>
                <span className="font-bold text-base text-slate-900">Legal Assistant</span>
                <span className="text-[10px] text-slate-400 block -mt-0.5 leading-none">AI Powered Platform</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              An AI-powered legal assistant platform designed to bridge the gap between citizens, lawyers, and law enforcement.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2">
              {['File FIR Online', 'Find Lawyers', 'Track Case Status', 'Legal Chat'].map((item) => (
                <li key={item}><span className="text-xs text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">{item}</span></li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Legal</h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Disclaimer'].map((item) => (
                <li key={item}><span className="text-xs text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">{item}</span></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Contact</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-xs text-slate-500"><Mail className="h-3.5 w-3.5 text-slate-400" />support@legalassistant.ai</li>
              <li className="flex items-center gap-2 text-xs text-slate-500"><Phone className="h-3.5 w-3.5 text-slate-400" />+91 1800-XXX-XXXX</li>
              <li className="flex items-center gap-2 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5 text-slate-400" />New Delhi, India</li>
            </ul>
          </div>
        </div>

        {/* Separator & Bottom */}
        <div className="border-t border-slate-200 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400">© {new Date().getFullYear()} AI Legal Assistant. All rights reserved. Built as a Final Year Project.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"><Github className="h-3.5 w-3.5 text-slate-500" /></a>
            <a href="#" className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"><Linkedin className="h-3.5 w-3.5 text-slate-500" /></a>
            <a href="#" className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"><Twitter className="h-3.5 w-3.5 text-slate-500" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
