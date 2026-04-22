// src/components/common/DashboardNavbar.jsx
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '@/features/auth/slices/authSlice'
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
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Users,
  MessageSquare,
  User,
  Inbox,
  History,
  Star,
  ShieldCheck,
  LogOut,
  Menu,
  Scale,
} from 'lucide-react'

const NAV_ITEMS = {
  citizen: [
    { label: 'Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard },
    { label: 'File FIR', path: '/citizen/file-fir', icon: FilePlus },
    { label: 'My FIRs', path: '/citizen/my-firs', icon: FileText },
    { label: 'Consultations', path: '/citizen/consultations', icon: Users },
    { label: 'Chat', path: '/citizen/chat', icon: MessageSquare },
  ],
  lawyer: [
    { label: 'Dashboard', path: '/lawyer/dashboard', icon: LayoutDashboard },
    { label: 'Requests', path: '/lawyer/requests', icon: Inbox },
    { label: 'History', path: '/lawyer/history', icon: History },
    { label: 'Chat', path: '/lawyer/chat', icon: MessageSquare },
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

const ROLE_COLORS = {
  citizen: 'bg-blue-100 text-blue-800',
  lawyer: 'bg-emerald-100 text-emerald-800',
  police: 'bg-rose-100 text-rose-800',
  admin: 'bg-purple-100 text-purple-800',
}

const ROLE_ACTIVE = {
  citizen: 'text-blue-700 border-blue-600',
  lawyer: 'text-emerald-700 border-emerald-600',
  police: 'text-rose-700 border-rose-600',
  admin: 'text-purple-700 border-purple-600',
}

export default function DashboardNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const role = user?.role || 'citizen'
  const navItems = NAV_ITEMS[role] || []
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const profilePath = `/${role}/profile`

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent hidden sm:inline">
              Legal Assistant
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 border-b-2 ${
                    isActive
                      ? `${ROLE_ACTIVE[role]} bg-slate-50 border-b-2`
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side: Role badge + User menu */}
          <div className="flex items-center gap-3">
            <Badge className={`${ROLE_COLORS[role]} border-0 text-xs font-medium capitalize hidden sm:inline-flex`}>
              {role}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{user?.name}</span>
                    <span className="text-xs text-slate-500">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(profilePath)}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 pt-10">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 px-3 py-3 mb-4 border-b border-slate-100">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold">{user?.name}</div>
                      <Badge className={`${ROLE_COLORS[role]} border-0 text-xs mt-0.5 capitalize`}>
                        {role}
                      </Badge>
                    </div>
                  </div>

                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? `${ROLE_ACTIVE[role]} bg-slate-50`
                            : 'text-slate-600 hover:bg-slate-50'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </NavLink>
                  ))}

                  <NavLink
                    to={profilePath}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? `${ROLE_ACTIVE[role]} bg-slate-50`
                          : 'text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    <User className="h-5 w-5" />
                    Profile
                  </NavLink>

                  <div className="border-t border-slate-100 mt-4 pt-4">
                    <button
                      onClick={() => {
                        setMobileOpen(false)
                        handleLogout()
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      Log out
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
