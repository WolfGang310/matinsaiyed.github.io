import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Prevent scrolling during preloader
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = '';
      setTimeout(onComplete, 700);
    }, 2200);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Monogram */}
          <div className="relative">
            <motion.div
              className="flex items-baseline gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.span
                className="text-7xl sm:text-8xl lg:text-9xl font-bold text-white uppercase"
                style={{ fontFamily: 'var(--font-display)', lineHeight: 1 }}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                M
              </motion.span>
              <motion.span
                className="text-7xl sm:text-8xl lg:text-9xl font-bold text-red-600 uppercase"
                style={{ fontFamily: 'var(--font-display)', lineHeight: 1 }}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                S
              </motion.span>
            </motion.div>

            {/* Loading bar */}
            <div className="mt-6 w-full h-px bg-neutral-900 overflow-hidden">
              <motion.div
                className="h-full bg-red-600"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </div>
          </div>

          {/* Subtitle */}
          <motion.p
            className="mt-8 text-[9px] text-neutral-600 uppercase tracking-[6px]"
            style={{ fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Portfolio
          </motion.p>

          {/* Corner marks */}
          <motion.div
            className="absolute top-8 left-8 w-6 h-6 border-t border-l border-neutral-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          />
          <motion.div
            className="absolute top-8 right-8 w-6 h-6 border-t border-r border-neutral-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          />
          <motion.div
            className="absolute bottom-8 left-8 w-6 h-6 border-b border-l border-neutral-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          />
          <motion.div
            className="absolute bottom-8 right-8 w-6 h-6 border-b border-r border-neutral-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
