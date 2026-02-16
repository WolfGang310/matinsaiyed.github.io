import { Linkedin, Mail, Phone, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full py-12 bg-neutral-950 border-t border-neutral-800">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
              Matin <span className="text-red-600">Saiyed</span>
            </h3>
            <p className="text-neutral-500 text-sm mt-1">Financial Services Professional</p>
          </div>

          <div className="flex items-center gap-4">
            <a href="mailto:matinsaiyed3100@gmail.com" className="w-10 h-10 flex items-center justify-center bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-red-600 hover:bg-red-600/10 transition-all duration-300">
              <Mail className="w-4 h-4" />
            </a>
            <a href="tel:+14162707531" className="w-10 h-10 flex items-center justify-center bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-red-600 hover:bg-red-600/10 transition-all duration-300">
              <Phone className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com/in/matinsaiyed/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-red-600 hover:bg-red-600/10 transition-all duration-300">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>

          <button onClick={scrollToTop} className="group flex items-center gap-2 text-neutral-500 hover:text-red-500 transition-colors duration-300">
            <span className="text-xs uppercase tracking-wider">Back to Top</span>
            <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform duration-300" />
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-800">
          <nav className="flex flex-wrap justify-center gap-6 mb-6" aria-label="Footer navigation">
            {[
              { label: 'About', id: 'about' },
              { label: 'Skills', id: 'competencies' },
              { label: 'Experience', id: 'experience' },
              { label: 'Education', id: 'education' },
              { label: 'Contact', id: 'contact' },
            ].map(({ label, id }) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-xs text-neutral-500 hover:text-red-500 uppercase tracking-wider transition-colors duration-300"
              >
                {label}
              </a>
            ))}
          </nav>
          <p className="text-neutral-600 text-xs uppercase tracking-wider text-center">
            &copy; {new Date().getFullYear()} Matin Saiyed. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
