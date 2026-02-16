import { useEffect, useState, useCallback, useRef } from 'react';
import { Home, User, Briefcase, GraduationCap, Mail, Menu, X, Award, FolderOpen, MessageSquareQuote, Heart } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'about', label: 'About', icon: User },
  { id: 'competencies', label: 'Skills', icon: Award },
  { id: 'projects', label: 'Impact', icon: FolderOpen },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'personal', label: 'Personal', icon: Heart },
  { id: 'contact', label: 'Contact', icon: Mail },
];

export default function Navigation() {
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    setIsScrolled(scrollY > 100);
    setIsVisible(scrollY > 300);
    setScrollProgress(docHeight > 0 ? (scrollY / docHeight) * 100 : 0);

    const sections = navItems.map(item => document.getElementById(item.id));
    const scrollPosition = scrollY + window.innerHeight / 3;

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section && section.offsetTop <= scrollPosition) {
        setActiveSection(navItems[i].id);
        break;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Close mobile menu on Escape key and outside click
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        toggleRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Desktop Navigation - Floating Rail */}
      <nav
        className={`fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-end gap-2 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}
        aria-label="Section navigation"
      >
        <div className="p-3 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-full">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`group relative p-3 rounded-full transition-all duration-300 ${
                  activeSection === item.id
                    ? 'bg-red-600 text-white'
                    : 'bg-transparent text-neutral-500 hover:text-white hover:bg-neutral-800'
                }`}
                aria-label={`Navigate to ${item.label}`}
                aria-current={activeSection === item.id ? 'true' : undefined}
              >
                <item.icon className="w-4 h-4" />
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-neutral-800 text-white text-xs uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  {item.label}
                </span>
                {activeSection === item.id && (
                  <span className="absolute -right-1 -top-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 px-4 py-2 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-full">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-neutral-400 uppercase tracking-wider">Available</span>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div
        ref={menuRef}
        className={`fixed top-0 left-0 right-0 z-50 md:hidden transition-all duration-300 ${isScrolled ? 'bg-black/90 backdrop-blur-md' : 'bg-transparent'}`}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-lg font-bold text-white uppercase" style={{ fontFamily: 'var(--font-display)' }}>
            Matin <span className="text-red-600">Saiyed</span>
          </span>
          <button
            ref={toggleRef}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-neutral-900 border border-neutral-800 text-white"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav
          className={`absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-b border-neutral-800 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
          aria-label="Mobile navigation"
        >
          <div className="px-6 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                tabIndex={isMobileMenuOpen ? 0 : -1}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-300 ${
                  activeSection === item.id
                    ? 'bg-red-600/20 text-red-500 border-l-2 border-red-600'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="uppercase tracking-wider text-sm" style={{ fontFamily: 'var(--font-display)' }}>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Progress Bar */}
      <div
        className={`fixed top-0 left-0 right-0 h-1 z-50 transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}
        role="progressbar"
        aria-label="Page scroll progress"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-red-600 transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </>
  );
}
