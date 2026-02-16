import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

/*
 * Narrative bridge between About and Competencies.
 * A bold, typographic statement section that establishes approach/methodology.
 */
export default function PhilosophySection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const words = 'Understand first. Advise second.'.split(' ');

  return (
    <section
      ref={ref}
      className="relative w-full py-32 lg:py-44 bg-black overflow-hidden"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950/50 to-black" />

      {/* Large decorative number */}
      <motion.div
        className="absolute right-6 lg:right-20 top-1/2 -translate-y-1/2 text-[20rem] lg:text-[28rem] font-bold text-neutral-900/20 leading-none select-none pointer-events-none"
        style={{ fontFamily: 'var(--font-display)' }}
        initial={{ opacity: 0, x: 50 }}
        animate={isVisible ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        &ldquo;
      </motion.div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section label */}
        <motion.p
          className="text-red-600 text-xs uppercase tracking-[6px] mb-10"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          My Philosophy
        </motion.p>

        {/* Main statement - word by word animation */}
        <h2 className="max-w-4xl">
          {words.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.35em] text-4xl sm:text-5xl lg:text-7xl font-bold uppercase leading-[1.1]"
              style={{
                fontFamily: 'var(--font-display)',
                color: word === 'Advise' || word === 'second.' ? '#dc2626' : 'white',
              }}
              initial={{ opacity: 0, y: 40 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
            </motion.span>
          ))}
        </h2>

        {/* Supporting text */}
        <motion.p
          className="mt-10 max-w-2xl text-lg text-neutral-400 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          Every client has a unique financial story. My role is to listen deeply, understand
          their goals, and craft solutions that align with where they want to be — not just
          where they are today.
        </motion.p>

        {/* Approach pillars */}
        <div className="mt-16 grid sm:grid-cols-3 gap-8 lg:gap-16">
          {[
            { num: '01', title: 'Listen', desc: 'Active discovery of needs through genuine conversation and empathy.' },
            { num: '02', title: 'Analyze', desc: 'Data-driven assessment using financial expertise and market knowledge.' },
            { num: '03', title: 'Deliver', desc: 'Tailored solutions that exceed expectations and build lasting trust.' },
          ].map((pillar, i) => (
            <motion.div
              key={pillar.num}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1 + i * 0.15 }}
            >
              <span
                className="text-5xl lg:text-6xl font-bold text-neutral-900 group-hover:text-red-600/30 transition-colors duration-500"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {pillar.num}
              </span>
              <h3
                className="mt-2 text-xl font-medium text-white uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {pillar.title}
              </h3>
              <div className="w-8 h-px bg-red-600 mt-3 mb-4 group-hover:w-16 transition-all duration-500" />
              <p className="text-sm text-neutral-500 leading-relaxed">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
