import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import ShinyText from './reactbits/ShinyText';
import ScrollFloat from './reactbits/ScrollFloat';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  accentColor: string;
  relationship: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Matin has a rare combination of analytical thinking and genuine empathy for clients. He doesn't just meet targets — he builds relationships that make those targets sustainable. His capacity growth work was nothing short of transformative.",
    name: 'Regional Operations Director',
    role: 'Direct Supervisor',
    company: 'Prometric Center',
    initials: 'RD',
    accentColor: '#3b82f6',
    relationship: 'Supervisor',
  },
  {
    quote:
      "What sets Matin apart is his ability to truly listen. He took the time to understand my financial goals before recommending any products. I felt like a person, not a transaction. That level of care is rare in financial services.",
    name: 'Client Testimonial',
    role: 'Investment Client',
    company: 'Golden Quasar Inc',
    initials: 'CT',
    accentColor: '#22c55e',
    relationship: 'Client',
  },
  {
    quote:
      "During our collaboration at Collision Conference, Matin led a team of 20 volunteers with remarkable composure. He balanced operational demands with team morale in a way that felt effortless, though I know it wasn't.",
    name: 'Event Coordinator',
    role: 'Program Manager',
    company: 'Web Summit / Collision',
    initials: 'EC',
    accentColor: '#dc2626',
    relationship: 'Colleague',
  },
  {
    quote:
      "Matin brought a fresh perspective to our research division. His financial models were thorough, his client presentations were polished, and he consistently went beyond what was asked. A natural self-starter with a strong work ethic.",
    name: 'Research Team Lead',
    role: 'Senior Analyst',
    company: 'Investor Quotient IQ',
    initials: 'RL',
    accentColor: '#f59e0b',
    relationship: 'Mentor',
  },
];

export default function TestimonialsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (!isVisible) return;
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isVisible]);

  const goTo = (index: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const goNext = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goPrev = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[activeIndex];

  /** Keyboard navigation — ArrowLeft / ArrowRight */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <section ref={sectionRef} id="testimonials" className="relative w-full py-24 lg:py-32 bg-black overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/3 blur-[120px]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className={`mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <ShinyText
            className="text-red-600 text-sm uppercase tracking-widest mb-4 block"
            speed={3} shimmerWidth={150}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Social Proof
          </ShinyText>
          <ScrollFloat
            containerTag="h2"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white uppercase"
            stagger={0.04}
            animationDuration={0.9}
            ease="back.out(1.2)"
            from={{ opacity: 0, y: 60, rotateX: -40 }}
            to={{ opacity: 1, y: 0, rotateX: 0 }}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            What Others Say
          </ScrollFloat>
        </div>

        {/* Testimonial display */}
        <div
          className="relative"
          role="region"
          aria-roledescription="carousel"
          aria-label="Testimonials"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div className="grid lg:grid-cols-[1fr_300px] gap-12 lg:gap-16 items-start">
            {/* Quote area */}
            <div className="relative min-h-[280px]" aria-live="polite" aria-atomic="true">
              {/* Large decorative quote */}
              <Quote
                className="absolute -top-2 -left-2 w-16 h-16 text-neutral-900 -scale-x-100"
                strokeWidth={1}
              />

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="relative z-10 pl-6"
                >
                  <blockquote className="text-lg lg:text-xl text-neutral-300 leading-relaxed italic mb-8">
                    &ldquo;{current.quote}&rdquo;
                  </blockquote>

                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className="w-12 h-12 flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: `${current.accentColor}20`, color: current.accentColor, fontFamily: 'var(--font-display)' }}
                    >
                      {current.initials}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm" style={{ fontFamily: 'var(--font-display)' }}>
                        {current.name}
                      </p>
                      <p className="text-neutral-500 text-xs">
                        {current.role} · {current.company}
                      </p>
                    </div>
                    <span
                      className="ml-auto px-3 py-1 text-[9px] uppercase tracking-wider border"
                      style={{
                        borderColor: `${current.accentColor}30`,
                        color: current.accentColor,
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {current.relationship}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation sidebar */}
            <div className="flex flex-col gap-3">
              {testimonials.map((t, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`relative text-left p-4 border transition-all duration-400 ${
                    i === activeIndex
                      ? 'border-neutral-700 bg-neutral-900/50'
                      : 'border-neutral-800/40 bg-transparent hover:border-neutral-700/60'
                  }`}
                >
                  {/* Active indicator line */}
                  {i === activeIndex && (
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-0.5"
                      style={{ backgroundColor: t.accentColor }}
                      layoutId="testimonial-active"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <p
                    className={`text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      i === activeIndex ? 'text-white' : 'text-neutral-600'
                    }`}
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {t.name}
                  </p>
                  <p className={`text-[10px] mt-1 transition-colors duration-300 ${i === activeIndex ? 'text-neutral-400' : 'text-neutral-700'}`}>
                    {t.company}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center gap-3 mt-8">
            <button
              onClick={goPrev}
              className="p-3 border border-neutral-800 text-neutral-500 hover:text-white hover:border-red-600 transition-all duration-300"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goNext}
              className="p-3 border border-neutral-800 text-neutral-500 hover:text-white hover:border-red-600 transition-all duration-300"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="ml-3 text-[10px] text-neutral-600 uppercase tracking-wider tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>
              {String(activeIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
