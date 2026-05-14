import { Github, Linkedin, Mail, MapPin, Phone, Scale, Twitter } from 'lucide-react'

export default function DashboardFooter() {
  return (
    <footer className="relative mt-auto border-t border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="absolute inset-0 pointer-events-none"><div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-300/70 to-transparent" /></div>
      <div className="relative w-full px-4 py-10 sm:px-6 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
          <div className="sm:col-span-2 xl:col-span-1">
            <div className="mb-4 flex items-center gap-3"><div className="relative flex size-10 items-center justify-center rounded-2xl text-white shadow-[0_10px_30px_rgba(15,118,110,0.28)]" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 55%, #1e3a5f 100%)' }}><Scale className="h-[18px] w-[18px]" /></div><div><span className="text-base font-bold text-slate-900">Legal Assistant</span><span className="block -mt-0.5 text-[10px] leading-none text-slate-400">AI Powered Platform</span></div></div>
            <p className="max-w-xs text-xs leading-6 text-slate-500">An AI-powered legal assistant platform designed to bridge the gap between citizens, lawyers, and law enforcement.</p>
          </div>
          <div><h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-900">Platform</h4><ul className="space-y-2.5">{['File FIR Online', 'Find Lawyers', 'Track Case Status', 'Legal Chat'].map((item) => <li key={item}><span className="cursor-pointer text-xs text-slate-500 transition-colors hover:text-slate-900">{item}</span></li>)}</ul></div>
          <div><h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-900">Legal</h4><ul className="space-y-2.5">{['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Disclaimer'].map((item) => <li key={item}><span className="cursor-pointer text-xs text-slate-500 transition-colors hover:text-slate-900">{item}</span></li>)}</ul></div>
          <div><h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-900">Contact</h4><ul className="space-y-3"><li className="flex items-center gap-2 text-xs text-slate-500"><Mail className="h-3.5 w-3.5 text-teal-600" />support@legalassistant.ai</li><li className="flex items-center gap-2 text-xs text-slate-500"><Phone className="h-3.5 w-3.5 text-teal-600" />+91 1800-XXX-XXXX</li><li className="flex items-center gap-2 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5 text-teal-600" />New Delhi, India</li></ul></div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="text-[11px] text-slate-400 text-center sm:text-left">© {new Date().getFullYear()} AI Legal Assistant. All rights reserved. Built as a Final Year Project.</p>
          <div className="flex items-center gap-3">{[Github, Linkedin, Twitter].map((Icon, i) => <a key={i} href="#" className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:text-teal-700 hover:shadow-sm"><Icon className="h-3.5 w-3.5" /></a>)}</div>
        </div>
      </div>
    </footer>
  )
}