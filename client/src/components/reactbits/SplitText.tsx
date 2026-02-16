import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines';
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  textAlign?: React.CSSProperties['textAlign'];
  onAnimationComplete?: () => void;
}

export default function SplitText({
  text,
  className = '',
  delay = 50,
  duration = 0.8,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  tag: Tag = 'span',
  textAlign = 'left',
  onAnimationComplete,
}: SplitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementsRef = useRef<(HTMLSpanElement | null)[]>([]);

  const splitContent = useCallback(() => {
    if (splitType === 'words') {
      return text.split(' ').map((word, i, arr) => (
        <span
          key={i}
          ref={(el) => { elementsRef.current[i] = el; }}
          className="inline-block"
          style={{ ...from, willChange: 'transform, opacity' } as React.CSSProperties}
        >
          {word}{i < arr.length - 1 ? '\u00A0' : ''}
        </span>
      ));
    }
    // Default: chars
    const chars = text.split('');
    return chars.map((char, i) => (
      <span
        key={i}
        ref={(el) => { elementsRef.current[i] = el; }}
        className="inline-block"
        style={{ ...from, willChange: 'transform, opacity' } as React.CSSProperties}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  }, [text, splitType, from]);

  useEffect(() => {
    if (hasAnimated) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const targets = elementsRef.current.filter(Boolean);
          gsap.to(targets, {
            ...to,
            duration,
            ease,
            stagger: delay / 1000,
            onComplete: onAnimationComplete,
          });
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated, to, duration, ease, delay, threshold, onAnimationComplete]);

  return (
    <Tag
      ref={containerRef as any}
      className={`inline-block overflow-hidden ${className}`}
      style={{ textAlign, perspective: '800px' }}
    >
      {splitContent()}
    </Tag>
  );
}
