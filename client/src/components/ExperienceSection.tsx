import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Calendar, ChevronRight, TrendingUp, Users, Award, Target, Briefcase, ArrowUpRight } from 'lucide-react';
import SpotlightCard from './reactbits/SpotlightCard';
import ShinyText from './reactbits/ShinyText';
import ScrollFloat from './reactbits/ScrollFloat';

/* ─── Data ────────────────────────────────────────────────────────── */

interface Experience {
  company: string;
  role: string;
  location: string;
  period: string;
  current: boolean;
  highlights: string[];
  tags: string[];
  metrics: { label: string; value: string; icon: typeof TrendingUp }[];
}

const experiences: Experience[] = [
  {
    company: 'Golden Quasar Inc',
    role: 'Client Success Associate',
    location: 'Mississauga, ON',
    period: 'Jan 2024 — Present',
    current: true,
    highlights: [
      'Manage client onboarding processes and customer relationship activities, ensuring seamless experience through proactive communication',
      'Meet and exceed sales targets by 25% while maintaining 96% client satisfaction',
      'Execute needs assessment and provide recommendations using holistic approach',
      'Build strong customer relationships through active listening and solution development',
      'Quickly adapted to new CRM platforms and digital tools',
    ],
    tags: ['Client Success', 'Sales', 'CRM', 'Financial Planning'],
    metrics: [
      { label: 'Sales Target', value: '+25%', icon: TrendingUp },
      { label: 'Client Satisfaction', value: '96%', icon: Award },
    ],
  },
  {
    company: 'Prometric Center / Yukon Consultants',
    role: 'Operations Consultant / Training Coordinator',
    location: 'Toronto, ON; Montreal, QC; Halifax, NS; Sacramento, CA',
    period: 'May 2023 — May 2024',
    current: false,
    highlights: [
      'Applied customer-centric approach, raising satisfaction from 68% to 94%',
      'Exceeded capacity targets from 30% to 80% through strategic customer relationship management',
      'Maintained regulatory compliance and conducted proactive follow-ups',
      'Coached diverse teams of 15+ individuals, earning Regional Best Test Centre recognition',
    ],
    tags: ['Operations', 'Training', 'Compliance', 'Team Leadership'],
    metrics: [
      { label: 'Satisfaction Lift', value: '68→94%', icon: TrendingUp },
      { label: 'Capacity Growth', value: '30→80%', icon: Target },
      { label: 'Team Size', value: '15+', icon: Users },
    ],
  },
  {
    company: 'Prometric Center / Yukon Consultants',
    role: 'Test Center Administrator',
    location: 'Toronto, ON',
    period: 'Jan 2023 — Apr 2023',
    current: false,
    highlights: [
      'Delivered excellent customer service to hundreds of clients weekly in fast-paced environment',
      'Conducted proactive outbound communications ensuring positive customer experience',
      'Maintained regulatory compliance while upholding customer data privacy standards',
    ],
    tags: ['Customer Service', 'Administration', 'Compliance'],
    metrics: [
      { label: 'Clients / Week', value: '100+', icon: Users },
    ],
  },
  {
    company: 'Web Summit / Collision Conference',
    role: 'Volunteer Team Lead',
    location: 'Toronto, ON',
    period: 'Jun 2022 — Jun 2023',
    current: false,
    highlights: [
      'Led 20-person teams at 35,000+ attendee event in a friendly, team-oriented environment',
      'Supported business development activities contributing to customer relationship building',
    ],
    tags: ['Leadership', 'Event Management', 'Business Development'],
    metrics: [
      { label: 'Team Led', value: '20', icon: Users },
      { label: 'Attendees', value: '35K+', icon: Target },
    ],
  },
  {
    company: 'Investor Quotient IQ Canada',
    role: 'Intern, Financial Research & Client Support',
    location: 'Toronto, ON',
    period: 'Jul 2021 — Dec 2021',
    current: false,
    highlights: [
      'Built comprehensive client presentations using Excel and Power BI',
      'Maintained CRM systems, strengthening customer relationships',
      'Conducted market research identifying opportunities for tailored financial solutions',
    ],
    tags: ['Financial Research', 'CRM', 'Market Analysis'],
    metrics: [
      { label: 'Tools', value: 'Excel & BI', icon: Target },
    ],
  },
];

/* ─── Animated Counter ─────────────────────────────────────────────── */

function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '' }: {
  end: number; duration?: number; suffix?: string; prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

/* ─── Radial Progress Ring ───────────────────────────────────────── */

function ProgressRing({ percent, size = 80, stroke = 5, label, color = '#dc2626' }: {
  percent: number; size?: number; stroke?: number; label: string; color?: string;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#262626" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={visible ? offset : circumference}
            style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {visible ? <AnimatedCounter end={percent} suffix="%" /> : '0%'}
          </span>
        </div>
      </div>
      <span className="text-neutral-500 text-[10px] uppercase tracking-widest text-center leading-tight" style={{ fontFamily: 'var(--font-display)' }}>{label}</span>
    </div>
  );
}

/* ─── Animated Metric Bar ────────────────────────────────────────── */

function MetricBar({ label, from, to, color = '#dc2626' }: {
  label: string; from: number; to: number; color?: string;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-neutral-400 text-xs uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-neutral-600 text-xs">{from}%</span>
          <ArrowUpRight className="w-3 h-3 text-red-500" />
          <span className="text-white text-xs font-semibold">{to}%</span>
        </div>
      </div>
      <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden relative">
        {/* "Before" ghost bar */}
        <div
          className="absolute inset-y-0 left-0 bg-neutral-700 rounded-full"
          style={{
            width: visible ? `${from}%` : '0%',
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        {/* "After" main bar */}
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: visible ? `${to}%` : '0%',
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            transition: 'width 1.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
          }}
        />
      </div>
    </div>
  );
}

/* ─── Skill Orbit (floating skill tags) ─────────────────────────── */

const allSkills = [
  'Client Relations', 'Sales Strategy', 'CRM Systems', 'Financial Planning',
  'Team Leadership', 'Operations', 'Compliance', 'Data Analysis',
  'Market Research', 'Power BI', 'Event Management', 'Onboarding',
];

function SkillOrbit() {
  return (
    <div className="relative w-full h-48 overflow-hidden">
      <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-2 p-4">
        {allSkills.map((skill, i) => (
          <span
            key={skill}
            className="px-3 py-1.5 text-[10px] uppercase tracking-wider border border-neutral-800 text-neutral-500 hover:border-red-600/50 hover:text-red-500 transition-all duration-500 cursor-default"
            style={{
              fontFamily: 'var(--font-display)',
              animationName: 'float-skill',
              animationDuration: `${3 + (i % 4) * 0.5}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Section ───────────────────────────────────────────────── */

export default function ExperienceSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const toggleExpand = useCallback((index: number) => {
    setExpandedIndex(prev => prev === index ? null : index);
  }, []);

  return (
    <section ref={sectionRef} id="experience" className="relative w-full py-24 lg:py-32 bg-black">
      <div className="absolute left-0 top-0 w-1/4 h-full bg-gradient-to-r from-red-900/5 to-transparent" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className={`mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <ShinyText className="text-red-600 text-sm uppercase tracking-widest mb-4 block" speed={3} shimmerWidth={150} style={{ fontFamily: 'var(--font-display)' }}>Career</ShinyText>
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
            Professional Journey
          </ScrollFloat>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-10">
          {/* Main timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[18px] top-4 bottom-4 w-px bg-gradient-to-b from-red-600 via-neutral-800 to-neutral-900 hidden md:block" />

            <div className="space-y-4">
              {experiences.map((exp, index) => {
                const isExpanded = expandedIndex === index;
                return (
                  <div
                    key={`${exp.company}-${exp.role}`}
                    className={`relative md:pl-14 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  >
                    {/* Timeline node */}
                    <div className="absolute left-0 top-7 hidden md:flex items-center justify-center">
                      <div className={`w-[38px] h-[38px] rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                        exp.current
                          ? 'border-red-600 bg-red-600/20'
                          : isExpanded
                            ? 'border-red-600/60 bg-red-600/10'
                            : 'border-neutral-700 bg-neutral-900'
                      }`}>
                        <Briefcase className={`w-4 h-4 transition-colors duration-300 ${
                          exp.current || isExpanded ? 'text-red-500' : 'text-neutral-600'
                        }`} />
                      </div>
                      {exp.current && (
                        <div className="absolute inset-0 rounded-full border-2 border-red-600/40 animate-ping" />
                      )}
                    </div>

                    <div
                      onClick={() => toggleExpand(index)}
                      className="cursor-pointer"
                    >
                      <SpotlightCard
                        className={`group border transition-all duration-500 ${
                          isExpanded
                            ? 'bg-neutral-900/80 border-red-600/40'
                            : 'bg-neutral-900/30 border-neutral-800 hover:border-neutral-700'
                        }`}
                        spotlightColor="rgba(220, 38, 38, 0.15)"
                        spotlightSize={500}
                      >
                        <div className="p-5 lg:p-7">
                          {/* Card header — always visible */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-lg lg:text-xl font-medium text-white uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                                {exp.role}
                              </h3>
                              {exp.current && (
                                <span className="px-2.5 py-0.5 text-[10px] bg-red-600 text-white uppercase tracking-wider font-semibold">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-neutral-500 shrink-0">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {exp.period}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mb-4">
                            <p className="text-red-500 text-sm font-medium" style={{ fontFamily: 'var(--font-display)' }}>{exp.company}</p>
                            <span className="text-neutral-700">•</span>
                            <span className="flex items-center gap-1 text-xs text-neutral-600">
                              <MapPin className="w-3 h-3" />
                              {exp.location}
                            </span>
                          </div>

                          {/* Inline metric badges — always visible */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            {exp.metrics.map((m) => (
                              <div
                                key={m.label}
                                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/80 border border-neutral-700/50 group-hover:border-red-600/20 transition-colors"
                              >
                                <m.icon className="w-3.5 h-3.5 text-red-500" />
                                <span className="text-white text-xs font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{m.value}</span>
                                <span className="text-neutral-500 text-[10px] uppercase tracking-wider">{m.label}</span>
                              </div>
                            ))}
                          </div>

                          {/* Expandable content */}
                          <div
                            className="overflow-hidden transition-all duration-500 ease-in-out"
                            style={{
                              maxHeight: isExpanded ? '600px' : '0',
                              opacity: isExpanded ? 1 : 0,
                            }}
                          >
                            <div className="pt-4 border-t border-neutral-800/50 mt-3">
                              <ul className="space-y-2.5 mb-5">
                                {exp.highlights.map((highlight, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-3 text-neutral-300 text-sm leading-relaxed"
                                    style={{
                                      opacity: isExpanded ? 1 : 0,
                                      transform: isExpanded ? 'translateX(0)' : 'translateX(-12px)',
                                      transition: `all 0.4s ease ${i * 0.08}s`,
                                    }}
                                  >
                                    <ChevronRight className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                                    <span>{highlight}</span>
                                  </li>
                                ))}
                              </ul>

                              <div className="flex flex-wrap gap-2">
                                {exp.tags.map((tag) => (
                                  <span key={tag} className="px-3 py-1 text-[10px] bg-neutral-800 border border-neutral-700 text-neutral-400 uppercase tracking-wider">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Expand hint */}
                          <div className="flex items-center justify-end mt-2">
                            <span className={`text-[10px] uppercase tracking-widest transition-colors duration-300 ${isExpanded ? 'text-red-500' : 'text-neutral-600'}`} style={{ fontFamily: 'var(--font-display)' }}>
                              {isExpanded ? 'Collapse' : 'Expand'}
                            </span>
                            <ChevronRight className={`w-3 h-3 ml-1 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-red-500' : 'text-neutral-600'}`} />
                          </div>
                        </div>
                      </SpotlightCard>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar — Dynamic Infographics */}
          <div className={`hidden lg:flex flex-col gap-5 sticky top-24 self-start ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>

            {/* Career Overview Card */}
            <div className="border border-neutral-800 bg-neutral-900/50 p-6">
              <h4 className="text-[10px] text-red-500 uppercase tracking-[0.2em] mb-5" style={{ fontFamily: 'var(--font-display)' }}>Career Overview</h4>

              <div className="grid grid-cols-2 gap-5 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                    <AnimatedCounter end={4} suffix="+" />
                  </div>
                  <span className="text-neutral-500 text-[10px] uppercase tracking-wider">Years Exp</span>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                    <AnimatedCounter end={5} />
                  </div>
                  <span className="text-neutral-500 text-[10px] uppercase tracking-wider">Roles</span>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                    <AnimatedCounter end={4} />
                  </div>
                  <span className="text-neutral-500 text-[10px] uppercase tracking-wider">Cities</span>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                    <AnimatedCounter end={3} />
                  </div>
                  <span className="text-neutral-500 text-[10px] uppercase tracking-wider">Industries</span>
                </div>
              </div>

              <div className="h-px bg-neutral-800 mb-5" />

              {/* Radial progress rings */}
              <div className="flex justify-around">
                <ProgressRing percent={96} size={72} stroke={4} label="Client Satisfaction" />
                <ProgressRing percent={80} size={72} stroke={4} label="Capacity Target" color="#f87171" />
              </div>
            </div>

            {/* Impact Metrics Card */}
            <div className="border border-neutral-800 bg-neutral-900/50 p-6">
              <h4 className="text-[10px] text-red-500 uppercase tracking-[0.2em] mb-5" style={{ fontFamily: 'var(--font-display)' }}>Key Impact</h4>
              <div className="space-y-4">
                <MetricBar label="Client Satisfaction" from={68} to={94} />
                <MetricBar label="Capacity Utilization" from={30} to={80} color="#f87171" />
                <MetricBar label="Sales Performance" from={100} to={125} color="#ef4444" />
              </div>
            </div>

            {/* Skill Constellation */}
            <div className="border border-neutral-800 bg-neutral-900/50 p-6">
              <h4 className="text-[10px] text-red-500 uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'var(--font-display)' }}>Skill DNA</h4>
              <SkillOrbit />
            </div>
          </div>
        </div>
      </div>

      {/* Float keyframes injected via style tag */}
      <style>{`
        @keyframes float-skill {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </section>
  );
}
