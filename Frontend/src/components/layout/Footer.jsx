import { Link } from 'react-router-dom';
import { 
  Scale, Mail, Phone, MapPin, Heart,
  Facebook, Twitter, Instagram, Linkedin, Youtube, Github
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
  ];

  return (
    <footer className="relative bg-brand-900 text-white overflow-hidden">
      
      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl animate-float delay-1000"></div>
        
        {/* Small Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="md:col-span-2 animate-in">
            <div className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold font-serif">LexiAI</span>
            </div>
            <p className="text-white/70 text-sm mb-6 max-w-sm leading-relaxed">
              AI-powered legal assistant making justice accessible for everyone in India. Fast, secure, and intelligent.
            </p>

            {/* Social Links */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-white/90">Follow Us</h4>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1 group backdrop-blur-sm"
                  >
                    <social.icon className="w-5 h-5 text-white/80 group-hover:text-accent transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="animate-in delay-100">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-accent rounded-full"></div>
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-white/70 hover:text-accent transition-colors hover:translate-x-1 inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-white/70 hover:text-accent transition-colors hover:translate-x-1 inline-block">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/lawyers" className="text-white/70 hover:text-accent transition-colors hover:translate-x-1 inline-block">
                  Find Lawyers
                </Link>
              </li>
              <li>
                <Link to="/chatbot" className="text-white/70 hover:text-accent transition-colors hover:translate-x-1 inline-block">
                  AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/70 hover:text-accent transition-colors hover:translate-x-1 inline-block">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="animate-in delay-200">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-accent rounded-full"></div>
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-white/70 group">
                <Mail className="w-4 h-4 text-accent mt-0.5 group-hover:scale-110 transition-transform" />
                <a href="mailto:support@lexiai.com" className="hover:text-accent transition-colors">
                  support@lexiai.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-white/70 group">
                <Phone className="w-4 h-4 text-accent mt-0.5 group-hover:scale-110 transition-transform" />
                <a href="tel:+911800XXXXXX" className="hover:text-accent transition-colors">
                  +91 1800-XXX-XXXX
                </a>
              </li>
              <li className="flex items-start gap-2 text-white/70 group">
                <MapPin className="w-4 h-4 text-accent mt-0.5 group-hover:scale-110 transition-transform" />
                <span>Mumbai, Maharashtra, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/70 animate-in delay-300">
          <p className="flex items-center gap-2">
            © {currentYear} LexiAI. Made with 
            <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" /> 
            in India
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-accent transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="hover:text-accent transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
    </footer>
  );
};

export default Footer;
