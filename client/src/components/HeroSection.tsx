import { useEffect, useRef, useState } from 'react';
import { MapPin, Phone, Mail, Linkedin, ChevronDown, Download } from 'lucide-react';
import DotGrid from './DotGrid';
import SplitText from './reactbits/SplitText';
import DecryptedText from './reactbits/DecryptedText';

const RESUME_PDF_URL = '/Matin_Saiyed_Resume.pdf';

const PORTRAIT_URL = '/images/portrait.jpg';
const PARALLAX_DIVISOR = 25;

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);

    // Skip parallax on touch devices — saves CPU and avoids awkward tilt
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / PARALLAX_DIVISOR;
        const y = (e.clientY - rect.top - rect.height / 2) / PARALLAX_DIVISOR;
        imageRef.current.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg) scale(1.02)`;
      }
    };

    const handleMouseLeave = () => {
      if (imageRef.current) {
        imageRef.current.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)';
      }
    };

    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove);
      heroElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (heroElement) {
        heroElement.removeEventListener('mousemove', handleMouseMove);
        heroElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-neutral-900" />

      {/* Interactive dot grid background */}
      <div className="absolute inset-0">
        <DotGrid
          dotSize={10}
          gap={14}
          baseColor="#232323"
          activeColor="#7a7a7a"
          proximity={150}
          speedTrigger={200}
          shockRadius={330}
          shockStrength={5.5}
          maxSpeed={5000}
          resistance={900}
          returnDuration={3.5}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Content */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <div className={`overflow-hidden mb-4 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
              {isVisible && (
                <SplitText
                  text="Matin"
                  tag="h1"
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-white uppercase"
                  delay={80}
                  duration={1.2}
                  ease="power4.out"
                  from={{ opacity: 0, y: 120, rotateX: -90, scale: 0.8 }}
                  to={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                  textAlign="left"
                />
              )}
            </div>
            <div className={`overflow-hidden mb-6 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
              {isVisible && (
                <SplitText
                  text="Saiyed"
                  tag="h1"
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-red-600 uppercase"
                  delay={80}
                  duration={1.2}
                  ease="power4.out"
                  from={{ opacity: 0, y: 120, rotateX: -90, scale: 0.8 }}
                  to={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                  textAlign="left"
                />
              )}
            </div>

            <div className={`overflow-hidden mb-8 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-neutral-400 tracking-wide uppercase" style={{ fontFamily: 'var(--font-display)' }}>
                {isVisible && (
                  <DecryptedText
                    text="Client Success Associate"
                    speed={60}
                    maxIterations={25}
                    className="tracking-wide"
                    characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*"
                    animateOn="view"
                    revealDirection="start"
                  />
                )}
              </h2>
              <p className="text-sm text-neutral-500 mt-2 uppercase tracking-widest">
                CIFC Licensed &bull; CFA Level I Candidate
              </p>
            </div>

            <div className={`mb-10 max-w-xl mx-auto lg:mx-0 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
              <p className="text-neutral-300 text-base lg:text-lg leading-relaxed">
                Certified Mutual Fund Representative (CIFC, Ontario) and CFA Level I Candidate with proven ability to build strong customer relationships, meet and exceed sales targets, and deliver excellent customer service in fast-paced environments.
              </p>
            </div>

            {/* Contact Info */}
            <div className={`flex flex-wrap justify-center lg:justify-start gap-4 mb-10 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
              <a href="mailto:matinsaiyed3100@gmail.com" className="flex items-center gap-2 text-neutral-400 hover:text-red-500 transition-colors duration-300 text-sm">
                <Mail className="w-4 h-4" />
                <span>matinsaiyed3100@gmail.com</span>
              </a>
              <a href="tel:+14162707531" className="flex items-center gap-2 text-neutral-400 hover:text-red-500 transition-colors duration-300 text-sm">
                <Phone className="w-4 h-4" />
                <span>+1 (416) 270-7531</span>
              </a>
              <span className="flex items-center gap-2 text-neutral-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Mississauga, ON</span>
              </span>
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row sm:flex-wrap justify-center lg:justify-start gap-4 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.7s' }}>
              <a
                href="#experience"
                className="group relative px-6 py-3 sm:px-8 sm:py-4 bg-red-600 text-white font-medium uppercase tracking-wider text-xs sm:text-sm overflow-hidden transition-all duration-300 hover:shadow-glow"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <span className="relative z-10">View Experience</span>
                <div className="absolute inset-0 bg-red-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
              <a
                href={RESUME_PDF_URL}
                download="Matin_Saiyed_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-white text-black font-medium uppercase tracking-wider text-xs sm:text-sm overflow-hidden transition-all duration-300 hover:bg-neutral-200"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <Download className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                <span className="relative z-10">Download CV</span>
              </a>
              <a
                href="https://linkedin.com/in/matinsaiyed/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 border border-neutral-700 text-white font-medium uppercase tracking-wider text-xs sm:text-sm hover:border-red-600 hover:text-red-500 transition-all duration-300"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            </div>
          </div>

          {/* Right Content - Portrait */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div
              ref={imageRef}
              className={`relative transition-transform duration-300 ease-out ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}
              style={{ animationDelay: '0.3s', transformStyle: 'preserve-3d' }}
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-red-600/20 to-transparent blur-3xl rounded-full" />

              <div className="relative w-56 h-72 sm:w-72 sm:h-96 md:w-80 md:h-[28rem] lg:w-96 lg:h-[32rem] overflow-hidden">
                <picture>
                  <source
                    type="image/webp"
                    srcSet="/images/portrait-480w.webp 480w, /images/portrait-768w.webp 768w, /images/portrait-1074w.webp 1074w"
                    sizes="(max-width: 640px) 288px, (max-width: 1024px) 320px, 384px"
                  />
                  <img
                    src={PORTRAIT_URL}
                    srcSet="/images/portrait-480w.jpg 480w, /images/portrait-768w.jpg 768w, /images/portrait.jpg 1074w"
                    sizes="(max-width: 640px) 288px, (max-width: 1024px) 320px, 384px"
                    alt="Matin Saiyed — Client Success Associate"
                    width={384}
                    height={512}
                    className="w-full h-full object-cover lg:grayscale-[30%] lg:hover:grayscale-0 transition-all duration-700"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </picture>
                <div className="absolute inset-0 border border-neutral-800" />
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-600" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-600" />
              </div>

              <div className={`absolute -bottom-4 -left-4 bg-neutral-900 border border-neutral-700 px-4 py-3 ${isVisible ? 'animate-float' : 'opacity-0'}`} style={{ animationDelay: '1s' }}>
                <p className="text-xs text-neutral-400 uppercase tracking-wider">Certification</p>
                <p className="text-sm font-medium text-white" style={{ fontFamily: 'var(--font-display)' }}>CIFC Licensed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToAbout}
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-500 hover:text-red-500 transition-colors duration-300 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
        style={{ animationDelay: '1s' }}
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </button>
    </section>
  );
}
