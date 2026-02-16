import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

/*
 * Visual breather between major sections.
 * Provides a gradient line, optional text, and parallax-like depth.
 */

interface SectionTransitionProps {
  text?: string;
  variant?: 'line' | 'text' | 'counter';
  number?: string;
}

export default function SectionTransition({ text, variant = 'line', number }: SectionTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (variant === 'line') {
    return (
      <div ref={ref} className="relative py-8 overflow-hidden">
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-red-600/40 to-transparent"
          initial={{ scaleX: 0 }}
          animate={isVisible ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    );
  }

  if (variant === 'counter') {
    return (
      <div ref={ref} className="relative py-16 lg:py-24 flex items-center justify-center overflow-hidden">
        {/* Large background number */}
        <motion.span
          className="text-[12rem] lg:text-[18rem] font-bold text-neutral-950 leading-none select-none absolute"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {number}
        </motion.span>

        {/* Foreground text */}
        {text && (
          <motion.p
            className="relative z-10 text-xs text-neutral-600 uppercase tracking-[8px]"
            style={{ fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  // variant === 'text'
  return (
    <div ref={ref} className="relative py-12 lg:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center gap-6">
        <motion.div
          className="flex-1 h-px bg-gradient-to-r from-neutral-800 to-transparent"
          initial={{ scaleX: 0 }}
          animate={isVisible ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'left' }}
        />
        {text && (
          <motion.span
            className="text-[10px] text-neutral-600 uppercase tracking-[5px] shrink-0"
            style={{ fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {text}
          </motion.span>
        )}
        <motion.div
          className="flex-1 h-px bg-gradient-to-l from-neutral-800 to-transparent"
          initial={{ scaleX: 0 }}
          animate={isVisible ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'right' }}
        />
      </div>
    </div>
  );
}
