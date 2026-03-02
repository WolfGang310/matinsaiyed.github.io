import { useEffect, useRef, useState, useCallback } from 'react';

export interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: 'view' | 'hover';
  revealDirection?: 'start' | 'end' | 'center';
  onAnimationComplete?: () => void;
}

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'view',
  revealDirection = 'start',
  onAnimationComplete,
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const getRandomChar = useCallback(() => {
    return characters[Math.floor(Math.random() * characters.length)];
  }, [characters]);

  const animate = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    let iteration = 0;
    const textLength = text.length;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText((prev) => {
        const revealedCount = Math.floor((iteration / maxIterations) * textLength);

        return text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';

            let isRevealed = false;
            if (revealDirection === 'start') {
              isRevealed = index < revealedCount;
            } else if (revealDirection === 'end') {
              isRevealed = index >= textLength - revealedCount;
            } else {
              const center = Math.floor(textLength / 2);
              const half = Math.floor(revealedCount / 2);
              isRevealed = index >= center - half && index < center + half + (revealedCount % 2);
            }

            return isRevealed ? char : getRandomChar();
          })
          .join('');
      });

      iteration++;

      if (iteration > maxIterations) {
        clearInterval(intervalRef.current);
        setDisplayText(text);
        setIsAnimating(false);
        setHasAnimated(true);
        onAnimationComplete?.();
      }
    }, speed);
  }, [text, speed, maxIterations, getRandomChar, isAnimating, revealDirection, onAnimationComplete]);

  useEffect(() => {
    if (animateOn !== 'view' || hasAnimated) return;
    const el = containerRef.current;
    if (!el) return;

    // Start with scrambled text
    setDisplayText(
      text
        .split('')
        .map((c) => (c === ' ' ? ' ' : getRandomChar()))
        .join('')
    );

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    // If element is already in the viewport when mounted, trigger immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      animate();
    } else {
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, [animateOn, hasAnimated, animate, text, getRandomChar]);

  useEffect(() => {
    if (animateOn === 'hover') {
      setDisplayText(text);
    }
  }, [animateOn, text]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (animateOn === 'hover') {
      animate();
    }
  };

  return (
    <span
      ref={containerRef}
      className={`inline-block ${parentClassName}`}
      onMouseEnter={handleMouseEnter}
    >
      {displayText.split('').map((char, i) => {
        const isRevealed = char === text[i];
        return (
          <span
            key={i}
            className={isRevealed ? className : `${className} ${encryptedClassName}`}
            style={
              !isRevealed
                ? { opacity: 0.7, filter: 'blur(0.3px)' }
                : undefined
            }
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}
