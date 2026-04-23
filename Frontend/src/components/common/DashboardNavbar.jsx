// src/components/common/DashboardNavbar.jsx
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '@/features/auth/slices/authSlice'
import { useMyChatRooms } from '@/features/chat/api/chatApi'
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
  History, Star, ShieldCheck, LogOut, Menu, Scale, ChevronDown, Settings
} from 'lucide-react'

const NAV_ITEMS = {
  citizen: [
    { label: 'Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard },
    { label: 'File FIR', path: '/citizen/file-fir', icon: FilePlus },
    { label: 'My FIRs', path: '/citizen/my-firs', icon: FileText },
    { label: 'Consultations', path: '/citizen/consultations', icon: Users },
    { label: 'Chat', path: '/citizen/chat', icon: MessageSquare, showBadge: true },
  ],
  lawyer: [
    { label: 'Dashboard', path: '/lawyer/dashboard', icon: LayoutDashboard },
    { label: 'Requests', path: '/lawyer/requests', icon: Inbox },
    { label: 'History', path: '/lawyer/history', icon: History },
    { label: 'Chat', path: '/lawyer/chat', icon: MessageSquare, showBadge: true },
    { label: 'Reviews', path: '/lawyer/reviews', icon: Star },
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

  const { data: chatRoomsData } = useMyChatRooms()
  const totalUnread = (chatRoomsData?.rooms || []).reduce((sum, room) => sum + (room.unreadCount || 0), 0)

  const role = user?.role || 'citizen'
  const navItems = NAV_ITEMS[role] || []
  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?'

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const profilePath = `/${role}/profile`

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <Scale className="h-[18px] w-[18px] text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-semibold tracking-tight text-foreground">Legal Assistant</span>
              <span className="block -mt-0.5 text-[11px] leading-none text-muted-foreground">AI powered legal ops</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm shadow-slate-950/5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.showBadge && totalUnread > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] border-2 border-white shadow-sm">
                    {totalUnread}
                  </Badge>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right side: Role badge + Avatar Dropdown */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden px-2.5 py-0.5 text-[11px] font-semibold capitalize sm:inline-flex">
              {role}
            </Badge>

            {/* Avatar Dropdown — Profile & Logout live HERE */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/20">
                <Avatar className="h-9 w-9 ring-1 ring-border">
                  <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold leading-tight text-foreground">{user?.name?.split(' ')[0] || user?.name}</div>
                  <div className="text-[11px] leading-tight text-muted-foreground">{user?.email?.split('@')[0]}</div>
                </div>
                <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-60 rounded-xl border border-border p-2 shadow-lg">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="pb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary font-bold text-primary-foreground">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{user?.name}</div>
                        <div className="text-xs text-muted-foreground">{user?.email}</div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(profilePath)} className="cursor-pointer rounded-lg py-2.5">
                  <User className="mr-2.5 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer rounded-lg py-2.5">
                  <LayoutDashboard className="mr-2.5 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-lg py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2.5 h-4 w-4" />
                  <span className="font-medium">Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-10 w-10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 pt-10">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col gap-1">
                  {/* Mobile user card */}
                  <div className="mb-2 flex items-center gap-3 rounded-xl bg-muted px-3 py-4">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-primary font-bold text-primary-foreground">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{user?.name}</div>
                      <div className="text-xs text-muted-foreground">{user?.email}</div>
                      <Badge variant="outline" className="mt-1 text-[10px] capitalize">{role}</Badge>
                    </div>
                  </div>

                  {navItems.map((item) => (
                    <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                      className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </NavLink>
                  ))}

                  <NavLink to={profilePath} onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                  >
                    <User className="h-5 w-5" />
                    My Profile
                  </NavLink>

                  <div className="mt-3 border-t border-border pt-3">
                    <button onClick={() => { setMobileOpen(false); handleLogout() }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="h-5 w-5" />
                      Log Out
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
