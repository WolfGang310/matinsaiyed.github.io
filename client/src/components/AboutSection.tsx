import { useEffect, useRef, useState } from 'react';
import { Languages, Award, BookOpen, TrendingUp, Users, Target, ArrowUpRight } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'motion/react';
import ShinyText from './reactbits/ShinyText';
import ScrollFloat from './reactbits/ScrollFloat';

/*
 * Design: Corporate Modernism – Dark/Red
 * About section with interactive performance dashboard
 */

const languages = [
  { name: 'English', level: 'Fluent' },
  { name: 'Hindi', level: 'Fluent' },
  { name: 'Gujarati', level: 'Fluent' },
  { name: 'French', level: 'Basic' },
];

interface MetricBreakdown {
  label: string;
  value: number;
}

interface PerformanceMetric {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: number;
  suffix: string;
  sublabel: string;
  color: string;
  description: string;
  breakdown: MetricBreakdown[];
  trend: number[];
  highlight: string;
}

const performanceMetrics: PerformanceMetric[] = [
  {
    icon: TrendingUp,
    label: 'Sales Target',
    value: 25,
    suffix: '%',
    sublabel: 'Above Target',
    color: '#dc2626',
    description: 'Consistently exceeded quarterly sales targets through strategic client engagement, proactive financial planning, and personalized product recommendations.',
    breakdown: [
      { label: 'Q1 2024', value: 18 },
      { label: 'Q2 2024', value: 22 },
      { label: 'Q3 2024', value: 28 },
      { label: 'Q4 2024', value: 25 },
    ],
    trend: [12, 15, 18, 16, 22, 20, 28, 25, 27, 25],
    highlight: '+7% improvement over last year',
  },
  {
    icon: Users,
    label: 'Client Satisfaction',
    value: 96,
    suffix: '%',
    sublabel: 'Satisfaction Rate',
    color: '#22c55e',
    description: 'Achieved top-tier client satisfaction through personalized service, proactive communication, and holistic financial solutions tailored to individual goals.',
    breakdown: [
      { label: 'Service Quality', value: 98 },
      { label: 'Response Time', value: 94 },
      { label: 'Knowledge', value: 97 },
      { label: 'Follow-up', value: 95 },
    ],
    trend: [88, 90, 91, 93, 92, 95, 94, 96, 95, 96],
    highlight: 'Top 5% across all branches',
  },
  {
    icon: Target,
    label: 'Capacity Growth',
    value: 80,
    suffix: '%',
    sublabel: 'From 30% Baseline',
    color: '#3b82f6',
    description: 'Dramatically increased operational capacity from a 30% baseline through process optimization, strategic initiative development, and team collaboration.',
    breakdown: [
      { label: 'Operations', value: 85 },
      { label: 'Client Base', value: 78 },
      { label: 'Revenue', value: 82 },
      { label: 'Efficiency', value: 75 },
    ],
    trend: [30, 35, 42, 48, 55, 60, 68, 72, 76, 80],
    highlight: '2.7x capacity increase in 18 months',
  },
];

/* ── Motion-powered animated counter ── */
function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    const controls = animate(count, target, { duration: 2, ease: [0.25, 0.46, 0.45, 0.94] });
    const unsub = rounded.on('change', (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [hasStarted, target, count, rounded]);

  return <span ref={ref}>{prefix}{display}{suffix}</span>;
}

/* ── Sparkline trend chart ── */
function Sparkline({ data, color, width = 140, height = 36 }: { data: number[]; color: string; width?: number; height?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 4;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - pad - ((v - min) / range) * (height - pad * 2),
  }));

  const lineStr = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaStr = `0,${height} ${lineStr} ${width},${height}`;
  const last = points[points.length - 1];
  const gradId = `spark-${color.replace('#', '')}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaStr} fill={`url(#${gradId})`} />
      <polyline points={lineStr} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r={3} fill={color}>
        <animate attributeName="r" values="3;4.5;3" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/* ── Animated breakdown bar ── */
function BreakdownBar({ label, value, color, delay = 0 }: {
  label: string; value: number; color: string; delay?: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-neutral-400 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>{label}</span>
        <span className="text-[10px] text-neutral-500 tabular-nums font-medium">{value}%</span>
      </div>
      <div className="h-1 bg-neutral-800/60 overflow-hidden">
        <motion.div
          className="h-full"
          style={{ backgroundColor: color }}
          initial={{ width: '0%' }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
    </div>
  );
}

/* ── Clean circular progress ring ── */
function ProgressRing({ value, color, size = 120, strokeWidth = 5, delay = 0 }: {
  value: number; color: string; size?: number; strokeWidth?: number; delay?: number;
}) {
  const [animValue, setAnimValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<SVGSVGElement>(null);
  const motionVal = useMotionValue(0);

  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    const timeout = setTimeout(() => {
      const controls = animate(motionVal, value, {
        duration: 2,
        ease: [0.16, 1, 0.3, 1],
      });
      const unsub = motionVal.on('change', (v) => setAnimValue(v));
      return () => { controls.stop(); unsub(); };
    }, delay);
    return () => clearTimeout(timeout);
  }, [hasStarted, value, delay, motionVal]);

  const offset = circumference - (animValue / 100) * circumference;
  const center = size / 2;

  return (
    <svg ref={ref} viewBox={`0 0 ${size} ${size}`} className="block w-full h-auto">
      {/* Background ring */}
      <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
      {/* Progress arc */}
      <circle
        cx={center} cy={center} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: 'stroke-dashoffset 0.05s linear' }}
      />
      {/* Subtle glow */}
      <circle
        cx={center} cy={center} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth + 4} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        transform={`rotate(-90 ${center} ${center})`}
        opacity={0.12}
        style={{ filter: 'blur(6px)', transition: 'stroke-dashoffset 0.05s linear' }}
      />
    </svg>
  );
}

/* ── Interactive metric card ── */
function MetricCard({ metric, index, isSelected, onClick }: {
  metric: PerformanceMetric; index: number; isSelected: boolean; onClick: () => void;
}) {
  const Icon = metric.icon;
  const [animValue, setAnimValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const motionVal = useMotionValue(0);
  const ringSize = 120; // viewBox size (SVG scales via CSS)

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    const timeout = setTimeout(() => {
      const controls = animate(motionVal, metric.value, {
        duration: 2,
        ease: [0.16, 1, 0.3, 1],
      });
      const unsub = motionVal.on('change', (v) => setAnimValue(Math.round(v)));
      return () => { controls.stop(); unsub(); };
    }, index * 200);
    return () => clearTimeout(timeout);
  }, [hasStarted, metric.value, index, motionVal]);

  return (
    <motion.div
      ref={ref}
      className="relative flex flex-col items-center cursor-pointer select-none"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
    >
      {/* Selection indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="absolute -inset-2 sm:-inset-3 border z-0"
            style={{ borderColor: `${metric.color}30`, backgroundColor: `${metric.color}06` }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          />
        )}
      </AnimatePresence>

      {/* Ring + center value */}
      <div className="relative z-10 w-[72px] sm:w-[100px] lg:w-[120px]">
        <ProgressRing
          value={metric.value}
          color={metric.color}
          size={ringSize}
          strokeWidth={isSelected ? 6 : 5}
          delay={index * 200}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-lg sm:text-2xl font-bold text-white tabular-nums"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {animValue}{metric.suffix}
          </span>
          <span
            className="text-[6px] sm:text-[8px] text-neutral-500 uppercase tracking-[1px] sm:tracking-[2px] mt-0.5 max-w-[52px] sm:max-w-none text-center leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {metric.sublabel}
          </span>
        </div>
      </div>

      {/* Icon + label */}
      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 mt-2 sm:mt-3 relative z-10">
        <div
          className="p-1 sm:p-1.5 transition-colors duration-300"
          style={{ backgroundColor: isSelected ? `${metric.color}15` : 'transparent' }}
        >
          <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: metric.color }} />
        </div>
        <span
          className="text-[9px] sm:text-xs uppercase tracking-wider font-medium transition-colors duration-300 text-center leading-tight"
          style={{ fontFamily: 'var(--font-display)', color: isSelected ? 'white' : '#737373' }}
        >
          {metric.label}
        </span>
      </div>

      {/* Active dot under label */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="w-1 h-1 mt-1 sm:mt-2 relative z-10"
            style={{ backgroundColor: metric.color }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Expanded detail panel ── */
function MetricDetailPanel({ metric }: { metric: PerformanceMetric }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="overflow-hidden"
    >
      <div className="px-4 sm:px-6 lg:px-8 pb-5 sm:pb-6 pt-2 space-y-4 sm:space-y-5">
        {/* Colored divider */}
        <div
          className="h-px"
          style={{ background: `linear-gradient(to right, transparent, ${metric.color}30, transparent)` }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-6">
          {/* Left: Description + Highlight */}
          <div className="sm:col-span-3 space-y-3">
            <motion.p
              className="text-sm text-neutral-400 leading-relaxed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              {metric.description}
            </motion.p>
            <motion.div
              className="flex items-center gap-2"
              style={{ color: metric.color }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{metric.highlight}</span>
            </motion.div>
          </div>

          {/* Right: Sparkline */}
          <motion.div
            className="sm:col-span-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <span
              className="text-[9px] text-neutral-500 uppercase tracking-wider mb-2 block"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Trend
            </span>
            <Sparkline data={metric.trend} color={metric.color} width={160} height={40} />
          </motion.div>
        </div>

        {/* Breakdown bars */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <span
            className="text-[9px] text-neutral-500 uppercase tracking-wider mb-3 block"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Breakdown
          </span>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {metric.breakdown.map((item, i) => (
              <BreakdownBar
                key={item.label}
                label={item.label}
                value={item.value}
                color={metric.color}
                delay={0.35 + i * 0.08}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Main Section
   ═══════════════════════════════════════════ */
export default function AboutSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMetricClick = (index: number) => {
    setSelectedMetric((prev) => (prev === index ? null : index));
  };

  return (
    <section ref={sectionRef} id="about" className="relative w-full py-24 lg:py-32 bg-black overflow-hidden">
      {/* Section divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
      {/* Subtle background accents */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-900/5 to-transparent" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/3 blur-[100px]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className={`mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <ShinyText className="text-red-600 text-sm uppercase tracking-widest mb-4 block" speed={3} shimmerWidth={150} style={{ fontFamily: 'var(--font-display)' }}>Introduction</ShinyText>
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
            About Me
          </ScrollFloat>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* ── Left column: Bio + Credentials ── */}
          <div className={`space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            <div className="space-y-6">
              <p className="text-lg lg:text-xl text-neutral-300 leading-relaxed">
                I am a <span className="text-white font-medium">customer-centric professional</span> committed to results with expertise in discovering customer needs and providing holistic financial solutions.
              </p>
              <p className="text-neutral-400 leading-relaxed">
                With my Certified Investment Funds Course (CIFC) qualification and as a CFA Level I Candidate working towards my CIFP Diploma, I bring both technical knowledge and practical experience in financial services. My background spans client success, operations management, and financial research.
              </p>
              <p className="text-neutral-400 leading-relaxed">
                I excel at building strong customer relationships, meeting and exceeding sales targets, and delivering exceptional customer service in fast-paced environments. My proactive approach to discovering customer needs through active listening enables me to provide expert advice and comprehensive planning.
              </p>
            </div>

            {/* Certification badges */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="group p-5 bg-neutral-900/50 border border-neutral-800 hover:border-red-600/50 transition-all duration-300 card-hover">
                <Award className="w-6 h-6 text-red-600 mb-3" />
                <h4 className="font-medium text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>CIFC Licensed</h4>
                <p className="text-sm text-neutral-500">Mutual Funds Representative</p>
              </div>
              <div className="group p-5 bg-neutral-900/50 border border-neutral-800 hover:border-red-600/50 transition-all duration-300 card-hover">
                <BookOpen className="w-6 h-6 text-red-600 mb-3" />
                <h4 className="font-medium text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>CFA Level I</h4>
                <p className="text-sm text-neutral-500">Candidate 2025</p>
              </div>
            </div>

            {/* Languages */}
            <div>
              <h3 className="text-lg font-medium text-white uppercase tracking-wider mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <Languages className="w-5 h-5 text-red-600" />
                Languages
              </h3>
              <div className="flex flex-wrap gap-3">
                {languages.map((lang, index) => (
                  <div key={lang.name}
                    className={`group px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-red-600 transition-all duration-300 skill-tag ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}
                    style={{ animationDelay: `${0.7 + index * 0.1}s` }}>
                    <span className="text-sm text-white">{lang.name}</span>
                    <span className="text-xs text-neutral-500 ml-2">({lang.level})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column: Interactive Performance Dashboard ── */}
          <div className="space-y-8">
            <motion.div
              className={`${isVisible ? '' : 'opacity-0'}`}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Dashboard container */}
              <div className="relative bg-neutral-900/30 border border-neutral-800/60 overflow-hidden">
                {/* Dot grid background */}
                <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="dash-dot-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="0.5" fill="white" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dash-dot-grid)" />
                  </svg>
                </div>

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-red-600/30" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-red-600/30" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-red-600/30" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-red-600/30" />

                {/* Dashboard header */}
                <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-3 sm:pb-4 flex items-center justify-between border-b border-neutral-800/30">
                  <h3
                    className="text-xs sm:text-sm font-medium text-white uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Performance Dashboard
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="relative flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                      <div className="absolute w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                    </div>
                    <span
                      className="text-[8px] text-red-600/70 uppercase tracking-[3px]"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      Live
                    </span>
                  </div>
                </div>

                {/* ── Metrics row ── */}
                <div className="relative z-10 px-2 sm:px-4 lg:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                  <div className="grid grid-cols-3 gap-1 sm:gap-2">
                    {performanceMetrics.map((metric, index) => (
                      <MetricCard
                        key={metric.label}
                        metric={metric}
                        index={index}
                        isSelected={selectedMetric === index}
                        onClick={() => handleMetricClick(index)}
                      />
                    ))}
                  </div>

                  {/* Click hint (shown when nothing selected) */}
                  <AnimatePresence>
                    {selectedMetric === null && (
                      <motion.p
                        className="text-center text-[9px] text-neutral-600 uppercase tracking-wider mt-5"
                        style={{ fontFamily: 'var(--font-display)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 2, duration: 0.3 }}
                      >
                        Click a metric to explore details
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Expandable detail panel ── */}
                <AnimatePresence mode="wait">
                  {selectedMetric !== null && (
                    <MetricDetailPanel
                      key={selectedMetric}
                      metric={performanceMetrics[selectedMetric]}
                    />
                  )}
                </AnimatePresence>

                {/* ── Bottom stats ── */}
                <div className="relative z-10 grid grid-cols-3 border-t border-neutral-800/40">
                  {[
                    { value: Math.floor((Date.now() - new Date('2021-07-01').getTime()) / (365.25 * 24 * 60 * 60 * 1000)), suffix: '+', label: 'Years Exp.', red: true },
                    { value: 4, suffix: '', label: 'Languages', red: false },
                    { value: 15, suffix: '+', label: 'Skills', red: true },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className={`text-center py-5 ${i === 1 ? 'border-x border-neutral-800/40' : ''}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={isVisible ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                    >
                      <p
                        className={`text-xl lg:text-2xl font-bold ${stat.red ? 'text-red-600' : 'text-white'}`}
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                      </p>
                      <p className="text-[9px] text-neutral-500 uppercase tracking-wider mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
