import { useEffect, useRef, useState } from 'react';
import { BookOpen, ArrowUpRight, Clock, Calendar, Target, CheckCircle2 } from 'lucide-react';
import ShinyText from './reactbits/ShinyText';
import ScrollFloat from './reactbits/ScrollFloat';

const features = [
  { icon: Calendar, label: '21-Day Plan', detail: 'Apr 20 → May 11' },
  { icon: Target, label: '93 Modules', detail: 'Every LOS covered' },
  { icon: Clock, label: 'Mock Exam', detail: '180 Q · 90 sec/Q' },
  { icon: CheckCircle2, label: 'Offline-First', detail: 'Works anywhere' },
];

export default function StudyGuideSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="studyhub"
      className="relative w-full py-24 lg:py-32 bg-neutral-950"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className={`mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <ShinyText
            className="text-red-600 text-sm uppercase tracking-widest mb-4 block"
            speed={3}
            shimmerWidth={150}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Study Hub
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
            CFA Level I · Study Atelier
          </ScrollFloat>
          <p
            className={`max-w-2xl text-neutral-400 text-lg leading-relaxed mt-6 ${
              isVisible ? 'animate-fade-in-up' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.2s' }}
          >
            A self-built, self-contained study guide engineered for the May 11 exam.
            Every LOS, every formula, every pitfall — with spaced repetition, a timed
            mock exam, and a 21-day crash plan. Available anywhere, anytime.
          </p>
        </div>

        {/* Main launch card */}
        <a
          href="/cfa/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className={`group relative block bg-black border border-neutral-800 hover:border-red-600 transition-all duration-500 overflow-hidden ${
            isVisible ? 'animate-fade-in-up' : 'opacity-0'
          }`}
          style={{ animationDelay: '0.3s' }}
          aria-label="Open CFA Level I Study Atelier in a new tab"
        >
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

          {/* Subtle gradient wash on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative grid md:grid-cols-[auto,1fr,auto] gap-6 lg:gap-10 p-8 lg:p-12 items-center">
            {/* Icon */}
            <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center bg-neutral-900 border border-neutral-800 group-hover:border-red-600 group-hover:bg-red-600/10 transition-all duration-300 shrink-0">
              <BookOpen className="w-8 h-8 lg:w-10 lg:h-10 text-red-600" />
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="text-xs text-red-500 uppercase tracking-widest"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Launch Guide
                </span>
                <div className="h-px flex-1 bg-neutral-800" />
              </div>
              <h3
                className="text-2xl lg:text-3xl font-bold text-white uppercase mb-3 leading-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Open the Study Atelier
              </h3>
              <p className="text-neutral-400 text-sm lg:text-base leading-relaxed max-w-2xl">
                Ten topics, ninety-three modules, one hundred and nine formulas — plus
                worked problems, flashcards with spaced repetition, a weakness radar,
                and a proctored mock exam. Your progress syncs locally and the whole
                thing works offline.
              </p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex w-14 h-14 items-center justify-center border border-neutral-800 group-hover:border-red-600 group-hover:bg-red-600 transition-all duration-300 shrink-0">
              <ArrowUpRight className="w-6 h-6 text-neutral-500 group-hover:text-white transition-colors duration-300" />
            </div>
          </div>

          {/* Feature strip */}
          <div className="border-t border-neutral-800 grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-800 md:divide-y-0 [&>*:nth-child(3)]:border-t [&>*:nth-child(4)]:border-t md:[&>*]:border-t-0">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.label}
                  className="flex items-center gap-3 p-5 lg:p-6 border-neutral-800"
                >
                  <div className="w-9 h-9 flex items-center justify-center bg-neutral-900 text-red-600 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className="text-xs text-white uppercase tracking-wider truncate"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {f.label}
                    </div>
                    <div className="text-[11px] text-neutral-500 truncate">{f.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </a>

        {/* Exam countdown strip */}
        <div
          className={`mt-8 flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-widest text-neutral-600 ${
            isVisible ? 'animate-fade-in-up' : 'opacity-0'
          }`}
          style={{ fontFamily: 'var(--font-display)', animationDelay: '0.5s' }}
        >
          <span>Exam window · May 11 · 2026</span>
          <span>Installable · Offline · Private</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
    </section>
  );
}
