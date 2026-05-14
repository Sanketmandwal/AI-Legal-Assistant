import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { logout } from '@/features/auth/slices/authSlice'
import { useMyChatRooms } from '@/features/chat/api/chatApi'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import {
  LayoutDashboard, FilePlus, FileText, Users, MessageSquare, User, Inbox,
  History, Star, ShieldCheck, LogOut, Menu, Scale, ChevronDown,
  Sparkles, Search,
} from 'lucide-react'

const NAV_ITEMS = {
  citizen: [
    { label: 'Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard },
    { label: 'File FIR', path: '/citizen/file-fir', icon: FilePlus },
    { label: 'My FIRs', path: '/citizen/my-firs', icon: FileText },
    { label: 'Consultations', path: '/citizen/consultations', icon: Users },
    { label: 'Chat', path: '/citizen/chat', icon: MessageSquare, showBadge: true },
    { label: 'AI Advisor', path: '/citizen/ai-advisor', icon: Sparkles },
    { label: 'Research', path: '/citizen/legal-research', icon: Search },
  ],
  lawyer: [
    { label: 'Dashboard', path: '/lawyer/dashboard', icon: LayoutDashboard },
    { label: 'Requests', path: '/lawyer/requests', icon: Inbox },
    { label: 'History', path: '/lawyer/history', icon: History },
    { label: 'Chat', path: '/lawyer/chat', icon: MessageSquare, showBadge: true },
    { label: 'Reviews', path: '/lawyer/reviews', icon: Star },
    { label: 'Analyzer', path: '/lawyer/case-analyzer', icon: Sparkles },
    { label: 'Research', path: '/lawyer/legal-research', icon: Search },
  ],
  police: [
    { label: 'Dashboard', path: '/police/dashboard', icon: LayoutDashboard },
    { label: 'Assigned FIRs', path: '/police/firs', icon: FileText },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Verifications', path: '/admin/verifications', icon: ShieldCheck },
  ],
}

export default function DashboardNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const role = user?.role || 'citizen'
  const navItems = NAV_ITEMS[role] || []
  const { data: chatRoomsData } = useMyChatRooms({ enabled: ['citizen', 'lawyer'].includes(role) })
  const totalUnread = (chatRoomsData?.rooms || []).reduce((sum, room) => sum + (room.unreadCount || 0), 0)
  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?'
  const profilePath = `/${role}/profile`

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/70">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-300/60 to-transparent" />
        <div className="absolute -top-10 left-10 h-28 w-28 rounded-full bg-teal-100/40 blur-3xl" />
        <div className="absolute -top-8 right-20 h-24 w-24 rounded-full bg-sky-100/40 blur-3xl" />
      </div>
      <div className="relative w-full px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="flex h-[72px] items-center justify-between gap-4">
          <Link to="/dashboard" className="flex items-center gap-3 shrink-0 group">
            <div className="relative flex size-10 items-center justify-center rounded-2xl text-white shadow-[0_10px_30px_rgba(15,118,110,0.28)] transition-transform duration-200 group-hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 55%, #1e3a5f 100%)' }}>
              <Scale className="h-[18px] w-[18px]" />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
            </div>
            <div className="hidden sm:block">
              <span className="text-[15px] font-bold tracking-tight text-slate-900">Legal Assistant</span>
              <span className="block -mt-0.5 text-[11px] leading-none text-slate-400">AI powered legal ops</span>
            </div>
          </Link>
          <nav className="hidden xl:flex items-center gap-1 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-1.5 py-1.5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => `relative flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-150 ${isActive ? 'text-white shadow-[0_8px_18px_rgba(15,118,110,0.25)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`} style={({ isActive }) => isActive ? { background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 55%, #1e3a5f 100%)' } : undefined}>
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.showBadge && totalUnread > 0 && <Badge className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[9px] border-2 border-white shadow-sm">{totalUnread}</Badge>}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block"><LanguageSwitcher /></div>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-2 py-1.5 outline-none transition-all hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-teal-100 shadow-sm">
                <Avatar className="h-9 w-9 ring-1 ring-slate-200"><AvatarFallback className="text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 55%, #1e3a5f 100%)' }}>{initials}</AvatarFallback></Avatar>
                <div className="hidden lg:block text-left max-w-[120px]"><div className="text-sm font-semibold leading-tight text-slate-900 truncate">{user?.name?.split(' ')[0] || user?.name}</div><div className="text-[11px] leading-tight text-slate-400 truncate">{user?.email?.split('@')[0]}</div></div>
                <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 lg:block" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-2xl border border-slate-200 p-2 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="pb-2"><div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5"><Avatar className="h-10 w-10"><AvatarFallback className="font-bold text-white" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 55%, #1e3a5f 100%)' }}>{initials}</AvatarFallback></Avatar><div className="min-w-0"><div className="text-sm font-semibold text-slate-900 truncate">{user?.name}</div><div className="text-xs text-slate-400 truncate">{user?.email}</div></div></div></DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(profilePath)} className="cursor-pointer rounded-xl py-2.5"><User className="mr-2.5 h-4 w-4 text-slate-400" /><span className="font-medium">{t('dashboard.myProfile')}</span></DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer rounded-xl py-2.5"><LayoutDashboard className="mr-2.5 h-4 w-4 text-slate-400" /><span className="font-medium">{t('nav.dashboard')}</span></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-xl py-2.5 text-red-600 focus:bg-red-50 focus:text-red-600"><LogOut className="mr-2.5 h-4 w-4" /><span className="font-medium">{t('nav.logout')}</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="xl:hidden h-10 w-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-sm"><Menu className="h-5 w-5 text-slate-600" /></Button></SheetTrigger>
              <SheetContent side="right" className="w-80 pt-8 border-slate-200 bg-white">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col gap-2">
                  <div className="mb-2 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center gap-3"><Avatar className="h-11 w-11"><AvatarFallback className="font-bold text-white" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 55%, #1e3a5f 100%)' }}>{initials}</AvatarFallback></Avatar><div className="min-w-0"><div className="text-sm font-semibold text-slate-900 truncate">{user?.name}</div><div className="text-xs text-slate-400 truncate">{user?.email}</div><Badge variant="outline" className="mt-1 text-[10px] capitalize rounded-full border-slate-200 bg-white text-slate-500">{role}</Badge></div></div></div>
                  <div className="mb-2"><LanguageSwitcher /></div>
                  {navItems.map((item) => <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)} className={({ isActive }) => `flex items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all ${isActive ? 'text-white shadow-[0_8px_18px_rgba(15,118,110,0.25)]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`} style={({ isActive }) => isActive ? { background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 55%, #1e3a5f 100%)' } : undefined}><span className="flex items-center gap-3"><item.icon className="h-5 w-5" />{item.label}</span>{item.showBadge && totalUnread > 0 && <Badge className="h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] border-0">{totalUnread}</Badge>}</NavLink>)}
                  <NavLink to={profilePath} onClick={() => setMobileOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><User className="h-5 w-5" />{t('dashboard.myProfile')}</NavLink>
                  <div className="mt-3 border-t border-slate-200 pt-3"><button onClick={() => { setMobileOpen(false); handleLogout() }} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"><LogOut className="h-5 w-5" />{t('nav.logout')}</button></div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}