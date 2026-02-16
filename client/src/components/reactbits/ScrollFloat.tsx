import React, { useRef, useEffect, useState, type ReactNode } from 'react';
import { gsap } from 'gsap';

export interface ScrollFloatProps {
  children: ReactNode;
  className?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
  containerTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  animationDuration?: number;
  ease?: string;
  splitByWord?: boolean;
  threshold?: number;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  style?: React.CSSProperties;
}

export default function ScrollFloat({
  children,
  className = '',
  stagger = 0.04,
  containerTag: Tag = 'div',
  animationDuration = 1,
  ease = 'back.out(1.5)',
  splitByWord = true,
  threshold = 0.1,
  from = { opacity: 0, y: 30, rotateX: -40 },
  to = { opacity: 1, y: 0, rotateX: 0 },
  style,
}: ScrollFloatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementsRef = useRef<(HTMLSpanElement | null)[]>([]);

  const text = typeof children === 'string' ? children : '';

  useEffect(() => {
    if (hasAnimated || !text) return;
    const el = containerRef.current;
    if (!el) return;

    // Set initial state
    const targets = elementsRef.current.filter(Boolean);
    gsap.set(targets, from);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          gsap.to(targets, {
            ...to,
            duration: animationDuration,
            ease,
            stagger,
          });
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated, text, from, to, animationDuration, ease, stagger, threshold]);

  if (!text) {
    return <Tag className={className} style={style}>{children}</Tag>;
  }

  const items = splitByWord
    ? text.split(' ').map((word, i, arr) => ({
        key: i,
        content: word + (i < arr.length - 1 ? '\u00A0' : ''),
      }))
    : text.split('').map((char, i) => ({
        key: i,
        content: char === ' ' ? '\u00A0' : char,
      }));

  return (
    <Tag
      ref={containerRef as any}
      className={`inline-flex flex-wrap ${className}`}
      style={{ perspective: '600px', ...style }}
    >
      {items.map((item) => (
        <span
          key={item.key}
          ref={(el) => { elementsRef.current[item.key] = el; }}
          className="inline-block will-change-transform"
        >
          {item.content}
        </span>
      ))}
    </Tag>
  );
}
