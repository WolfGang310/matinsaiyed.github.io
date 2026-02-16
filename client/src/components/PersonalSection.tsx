import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Compass, Coffee, Globe } from 'lucide-react';
import ShinyText from './reactbits/ShinyText';
import ScrollFloat from './reactbits/ScrollFloat';

interface Interest {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  accent: string;
}

const interests: Interest[] = [
  {
    icon: BookOpen,
    title: 'Currently Reading',
    items: [
      'CFA Level I Curriculum — Ethics & Quant',
      'The Psychology of Money — Morgan Housel',
      'Thinking, Fast and Slow — Kahneman',
    ],
    accent: '#3b82f6',
  },
  {
    icon: Compass,
    title: 'Exploring',
    items: [
      'Behavioral finance & investor psychology',
      'Portfolio risk management frameworks',
      'AI applications in financial advisory',
    ],
    accent: '#22c55e',
  },
  {
    icon: Coffee,
    title: 'Outside Work',
    items: [
      'Volunteering at community events',
      'Following global markets & macro trends',
      'Cricket, hiking, and fitness',
    ],
    accent: '#f59e0b',
  },
  {
    icon: Globe,
    title: 'Values',
    items: [
      'Client-first mentality in every interaction',
      'Continuous learning & professional growth',
      'Integrity over short-term gains',
    ],
    accent: '#dc2626',
  },
];

export default function PersonalSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="personal" className="relative w-full py-24 lg:py-32 bg-neutral-950">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12">
        <div className={`mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <ShinyText
            className="text-red-600 text-sm uppercase tracking-widest mb-4 block"
            speed={3} shimmerWidth={150}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Beyond the Resume
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
            The Person
          </ScrollFloat>
        </div>

        {/* Intro text */}
        <motion.p
          className="max-w-2xl text-neutral-400 text-lg leading-relaxed mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Numbers and credentials tell part of the story. Here's what drives me when the
          spreadsheets close and the meetings end.
        </motion.p>

        {/* Interest cards - 4 column grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {interests.map((interest, i) => {
            const Icon = interest.icon;
            return (
              <motion.div
                key={interest.title}
                className="group relative bg-black border border-neutral-800/60 hover:border-neutral-700 transition-all duration-500 overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
              >
                {/* Hover accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-px transition-transform duration-500 origin-left scale-x-0 group-hover:scale-x-100"
                  style={{ backgroundColor: interest.accent }}
                />

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-9 h-9 flex items-center justify-center transition-colors duration-300"
                      style={{ backgroundColor: `${interest.accent}10`, color: interest.accent }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3
                      className="text-xs font-medium text-white uppercase tracking-wider"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {interest.title}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {interest.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-2.5">
                        <div
                          className="w-1 h-1 mt-2 shrink-0"
                          style={{ backgroundColor: interest.accent }}
                        />
                        <p className="text-sm text-neutral-500 leading-relaxed group-hover:text-neutral-400 transition-colors duration-300">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Fun fact strip */}
        <motion.div
          className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-3"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
        >
          {[
            { label: 'Cups of coffee this year', value: '300+' },
            { label: 'Countries visited', value: '5' },
            { label: 'Books read in 2024', value: '12' },
          ].map((fact) => (
            <div key={fact.label} className="flex items-center gap-3">
              <span
                className="text-lg font-bold text-red-600"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {fact.value}
              </span>
              <span className="text-[10px] text-neutral-600 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                {fact.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
