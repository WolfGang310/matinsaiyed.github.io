import { useEffect, useRef, useState } from 'react';
import { GraduationCap, Award, BookOpen } from 'lucide-react';
import ShinyText from './reactbits/ShinyText';
import ScrollFloat from './reactbits/ScrollFloat';

const education = [
  {
    icon: GraduationCap,
    title: 'Bachelor of Commerce in Management Studies',
    institution: 'Humber College',
    location: 'Toronto, ON',
    year: '',
    type: 'Degree',
    description: 'Comprehensive business education covering management principles, financial analysis, marketing strategies, and organizational behavior.',
  },
  {
    icon: Award,
    title: 'Canadian Investment Funds Course (CIFC)',
    institution: 'Mutual Funds License, Ontario',
    location: 'Ontario, Canada',
    year: '2025',
    type: 'Licensed',
    description: 'Licensed Mutual Funds Representative qualified to sell mutual funds in Ontario. Comprehensive training in investment fund products, regulations, and client suitability.',
  },
  {
    icon: BookOpen,
    title: 'CFA Level I Candidate',
    institution: 'Working towards CFA Charter',
    location: '',
    year: '2026',
    type: 'In Progress',
    description: 'Pursuing the globally recognized Chartered Financial Analyst designation, demonstrating commitment to the highest standards of ethical and professional excellence.',
  },
];

const marqueeItems = [
  'CIFC Licensed',
  'CFA Level I',
  'B.Com Management',
  'CFA Charter',
  'Mutual Funds',
  'Financial Planning',
  'RRSP/TFSA Expert',
  'Data Analytics',
];

export default function EducationSection() {
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
    <section ref={sectionRef} id="education" className="relative w-full py-24 lg:py-32 bg-neutral-950">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12">
        <div className={`mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <ShinyText className="text-red-600 text-sm uppercase tracking-widest mb-4 block" speed={3} shimmerWidth={150} style={{ fontFamily: 'var(--font-display)' }}>Credentials</ShinyText>
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
            Education & Certifications
          </ScrollFloat>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {education.map((item, index) => (
            <div
              key={item.title}
              className={`group relative bg-black border border-neutral-800 hover:border-red-600 transition-all duration-500 overflow-hidden ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: `${0.2 + index * 0.15}s` }}
            >
              <div className="h-1 bg-gradient-to-r from-red-600 to-red-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

              <div className="p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 flex items-center justify-center bg-neutral-900 border border-neutral-800 group-hover:border-red-600 group-hover:bg-red-600/10 transition-all duration-300">
                    <item.icon className="w-7 h-7 text-red-600" />
                  </div>
                  <span className={`px-3 py-1 text-xs uppercase tracking-wider flex-shrink-0 ${
                    item.type === 'Degree' ? 'bg-red-600 text-white' :
                    item.type === 'Licensed' ? 'bg-red-600/20 text-red-500 border border-red-600/30' :
                    'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}>
                    {item.type}
                  </span>
                </div>

                {item.year && (
                  <div className="mb-3">
                    <span className="text-xs text-red-500 uppercase tracking-widest block" style={{ fontFamily: 'var(--font-display)' }}>{item.year}</span>
                  </div>
                )}

                <h3 className="text-base lg:text-lg font-medium text-white mb-3 uppercase tracking-wide leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
                  {item.title}
                </h3>

                <p className="text-red-500 text-sm font-medium mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  {item.institution}
                </p>

                {item.location && (
                  <p className="text-neutral-500 text-xs mb-4">{item.location}</p>
                )}

                <p className="text-neutral-400 text-sm leading-relaxed mt-4">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Marquee banner - fixed overlapping text */}
        <div className={`group/marquee mt-16 overflow-hidden border-y border-neutral-800 py-5 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
          <div className="relative flex overflow-hidden">
            <div className="flex shrink-0 animate-marquee items-center">
              {marqueeItems.map((text, i) => (
                <span
                  key={`a-${i}`}
                  className="inline-flex items-center mx-6 text-sm text-neutral-500 uppercase tracking-widest whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {text}
                  <span className="inline-block mx-6 text-red-600">&bull;</span>
                </span>
              ))}
            </div>
            <div className="flex shrink-0 animate-marquee items-center" aria-hidden="true">
              {marqueeItems.map((text, i) => (
                <span
                  key={`b-${i}`}
                  className="inline-flex items-center mx-6 text-sm text-neutral-500 uppercase tracking-widest whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {text}
                  <span className="inline-block mx-6 text-red-600">&bull;</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
