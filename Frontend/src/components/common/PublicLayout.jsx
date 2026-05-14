import { Scale, LogOut, LayoutDashboard } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { useTranslation } from "react-i18next"
import { logout } from "@/features/auth/slices/authSlice"
import { Button } from "../ui/button"
import LanguageSwitcher from "./LanguageSwitcher"

export default function PublicLayout({ children }) {
  const { user, token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isLoggedIn = !!(token && user)

  const handleLogout = () => { dispatch(logout()); navigate('/') }

  return (
    <div className="min-h-screen bg-background">

      {/* ══════════════════════════
          NAVBAR — glass on teal hero
      ══════════════════════════ */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[oklch(0.44_0.10_185)]/80 backdrop-blur-xl">
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              {/* SVG scale icon — inline, no bg circle */}
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="Legal Assistant" className="shrink-0">
                <rect width="28" height="28" rx="8" fill="white" fillOpacity="0.15"/>
                <rect width="28" height="28" rx="8" stroke="white" strokeOpacity="0.25" strokeWidth="1"/>
                {/* balance scale */}
                <line x1="14" y1="7" x2="14" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="8" y1="10" x2="20" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M8 10 L6 14 Q8 16 10 14 L8 10Z" fill="white" fillOpacity="0.7"/>
                <path d="M20 10 L18 14 Q20 16 22 14 L20 10Z" fill="white" fillOpacity="0.7"/>
                <line x1="11" y1="20" x2="17" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="text-[0.9375rem] font-semibold tracking-tight text-white">Legal Assistant</span>
            </Link>

            {/* Nav actions */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />

              {isLoggedIn ? (
                <>
                  <Button variant="ghost" size="sm" asChild
                    className="text-[0.8125rem] h-8 text-white/80 hover:text-white hover:bg-white/12 border-0">
                    <Link to="/dashboard">
                      <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" />
                      {t('nav.dashboard')}
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout}
                    className="text-[0.8125rem] h-8 text-white/60 hover:text-white hover:bg-white/12">
                    <LogOut className="mr-1.5 h-3.5 w-3.5" />
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild
                    className="text-[0.8125rem] h-8 text-white/75 hover:text-white hover:bg-white/12">
                    <Link to="/login">{t('nav.login')}</Link>
                  </Button>
                  <Button size="sm" asChild
                    className="text-[0.8125rem] h-8 bg-white text-primary hover:bg-white/90 font-semibold shadow-sm shadow-black/15 border-0">
                    <Link to="/signup">{t('nav.getStarted')}</Link>
                  </Button>
                </>
              )}
            </div>

          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* ══════════════════════════
          FOOTER
      ══════════════════════════ */}
      <footer className="border-t border-border bg-slate-50">
        <div className="w-full px-4 pt-14 pb-8 sm:px-6 lg:px-12">

          <div className="grid gap-10 text-sm md:grid-cols-[1.4fr_1fr_1fr_1fr] mb-12">

            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Scale className="size-4" />
                </div>
                <span className="font-semibold text-foreground text-[0.9375rem]">Legal Assistant</span>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-[22ch] text-[0.8125rem]">
                AI-powered platform for smart FIR filing and legal consultations across India.
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-foreground text-xs uppercase tracking-widest">For Citizens</h4>
              <ul className="space-y-2.5 text-muted-foreground text-[0.8125rem]">
                <li><a href="#" className="hover:text-primary transition-colors">File FIR</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Track Status</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Consult Lawyers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-foreground text-xs uppercase tracking-widest">For Lawyers</h4>
              <ul className="space-y-2.5 text-muted-foreground text-[0.8125rem]">
                <li><a href="#" className="hover:text-primary transition-colors">Manage Cases</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Client Chat</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Get Verified</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-foreground text-xs uppercase tracking-widest">Contact</h4>
              <p className="text-muted-foreground text-[0.8125rem]">Pune, Maharashtra</p>
              <a href="mailto:support@legalassistant.in"
                className="text-muted-foreground hover:text-primary transition-colors mt-1.5 block text-[0.8125rem]">
                support@legalassistant.in
              </a>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">© 2026 AI Legal Assistant. All rights reserved.</p>
            <div className="flex gap-5 text-xs text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  )
}