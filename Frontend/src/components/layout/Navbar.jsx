import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { Menu, X, Scale, User, LogOut, Settings } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsProfileDropdownOpen(false);
  };

  // Close mobile menu when route changes
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Navigation links based on user role
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
      ];
    }

    switch (user?.role) {
      case 'citizen':
        return [
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'File FIR', path: '/fir/new', highlight: true },
          { name: 'My FIRs', path: '/fir/list' },
          { name: 'Find Lawyer', path: '/lawyers' },
          { name: 'AI Assistant', path: '/chatbot' },
        ];
      
      case 'lawyer':
        return [
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'My Cases', path: '/cases' },
          { name: 'Clients', path: '/clients' },
          { name: 'Availability', path: '/availability' },
        ];
      
      case 'police':
        return [
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Pending FIRs', path: '/fir/pending', badge: 5 },
          { name: 'All FIRs', path: '/fir/all' },
          { name: 'Reports', path: '/reports' },
        ];
      
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'backdrop-blur-lg bg-white/80 shadow-md'
          : 'bg-white/70 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-700 to-brand-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-brand-900 font-serif">
              LexiAI
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    link.highlight
                      ? 'text-white bg-accent hover:bg-accent/90 hover:shadow-lg hover:scale-105'
                      : isActive
                      ? 'text-brand-700'
                      : 'text-neutral-text hover:text-brand-700 hover:bg-brand-100/50'
                  } ${isActive && !link.highlight ? 'nav-link-active' : ''}`
                }
              >
                <span className="relative z-10 flex items-center gap-2">
                  {link.name}
                  {link.badge && (
                    <span className="badge badge-danger">{link.badge}</span>
                  )}
                </span>
              </NavLink>
            ))}
          </div>

          {/* Right side: Auth buttons or Profile */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <button className="btn-secondary">Login</button>
                </Link>
                <Link to="/register">
                  <button className="btn-primary">Get Started</button>
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brand-100/50 transition-all"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-accent rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-neutral-text hidden lg:block">
                    {user?.name}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 card animate-in origin-top-right">
                    <div className="p-3 border-b border-neutral-border">
                      <p className="text-sm font-semibold text-neutral-text">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted">{user?.email}</p>
                      <span className="badge badge-accent mt-2 inline-block">
                        {user?.role}
                      </span>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-text hover:bg-brand-100/50 transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-text hover:bg-brand-100/50 transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-brand-100/50 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-neutral-text" />
            ) : (
              <Menu className="w-6 h-6 text-neutral-text" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 animate-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                      link.highlight
                        ? 'text-white bg-accent'
                        : isActive
                        ? 'text-brand-700 bg-brand-100'
                        : 'text-neutral-text hover:bg-brand-100/50'
                    }`
                  }
                >
                  <span className="flex items-center gap-2">
                    {link.name}
                    {link.badge && (
                      <span className="badge badge-danger">{link.badge}</span>
                    )}
                  </span>
                </NavLink>
              ))}

              {!isAuthenticated ? (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-neutral-border">
                  <Link to="/login" onClick={closeMobileMenu}>
                    <button className="btn-secondary w-full">Login</button>
                  </Link>
                  <Link to="/register" onClick={closeMobileMenu}>
                    <button className="btn-primary w-full">Get Started</button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-neutral-border">
                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-text hover:bg-brand-100/50 rounded-lg"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-text hover:bg-brand-100/50 rounded-lg"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-danger hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
