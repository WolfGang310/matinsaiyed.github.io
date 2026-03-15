import { useEffect, useRef, useState, useCallback } from 'react';
import { Users, TrendingUp, Search, Shield, BarChart3, Code, X, Briefcase, Award } from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import ShinyText from './reactbits/ShinyText';
import ScrollFloat from './reactbits/ScrollFloat';

/*
 * Design: Corporate Modernism – Dark/Red
 * Competencies section with Recharts RadarChart + Motion animations
 * Clicking a node reveals that competency's detail — nothing shown upfront
 */

interface ProjectExample {
  title: string;
  role: string;
  company: string;
  period: string;
  description: string;
  impact: string;
  metric: string;
  metricLabel: string;
}

const competencies = [
  {
    icon: Users,
    title: 'Customer Relationship Building',
    shortLabel: 'Client Relations',
    description: 'Customer-centric approach with proven ability to build strong relationships, deliver exceptional customer service, and nurture long-standing client partnerships.',
    skills: [
      { name: 'Client Retention', level: 95 },
      { name: 'Active Listening', level: 92 },
      { name: 'Communication', level: 90 },
      { name: 'Empathy', level: 88 },
    ],
    color: '#3b82f6',
    avgProficiency: 91,
    projects: [
      {
        title: 'Client Onboarding Transformation',
        role: 'Client Success Associate',
        company: 'Golden Quasar Inc',
        period: 'Jan 2024 — Present',
        description: 'Redesigned the client onboarding process from initial contact through first 90 days, implementing proactive communication touchpoints and personalized check-ins that dramatically improved client retention.',
        impact: 'Maintained 96% client satisfaction through active listening and tailored solution development.',
        metric: '96%',
        metricLabel: 'Client Satisfaction',
      },
      {
        title: 'Customer Experience Overhaul',
        role: 'Operations Consultant',
        company: 'Prometric Center / Yukon Consultants',
        period: 'May 2023 — May 2024',
        description: 'Applied a customer-centric approach across multiple test center locations, implementing feedback loops and proactive follow-up systems that transformed the client experience.',
        impact: 'Raised customer satisfaction scores from 68% to 94% across all managed locations.',
        metric: '68→94%',
        metricLabel: 'Satisfaction Lift',
      },
    ] as ProjectExample[],
  },
  {
    icon: TrendingUp,
    title: 'Sales Performance',
    shortLabel: 'Sales',
    description: 'Demonstrated success meeting and exceeding sales targets while maintaining positive customer experience in fast-paced environments.',
    skills: [
      { name: 'Target Achievement', level: 97 },
      { name: 'Upselling', level: 85 },
      { name: 'Cross-selling', level: 82 },
      { name: 'Negotiation', level: 88 },
    ],
    color: '#22c55e',
    avgProficiency: 88,
    projects: [
      {
        title: 'Sales Target Outperformance',
        role: 'Client Success Associate',
        company: 'Golden Quasar Inc',
        period: 'Jan 2024 — Present',
        description: 'Consistently exceeded quarterly sales goals through strategic needs assessment and holistic financial solution recommendations, leveraging deep product knowledge and client trust.',
        impact: 'Exceeded sales targets by 25% while maintaining top-tier client satisfaction scores.',
        metric: '+25%',
        metricLabel: 'Above Target',
      },
      {
        title: 'Capacity Growth Initiative',
        role: 'Operations Consultant',
        company: 'Prometric Center / Yukon Consultants',
        period: 'May 2023 — May 2024',
        description: 'Led strategic customer relationship management initiatives that dramatically expanded center utilization through improved scheduling, outreach, and service quality.',
        impact: 'Grew capacity utilization from 30% to 80% through strategic CRM and outbound campaigns.',
        metric: '30→80%',
        metricLabel: 'Capacity Growth',
      },
    ] as ProjectExample[],
  },
  {
    icon: Search,
    title: 'Needs Discovery & Solutions',
    shortLabel: 'Needs Discovery',
    description: 'Proactive approach to discovering customer needs through active listening; expertise in providing expert advice and comprehensive planning.',
    skills: [
      { name: 'Needs Assessment', level: 93 },
      { name: 'Solution Design', level: 88 },
      { name: 'Strategic Planning', level: 85 },
      { name: 'Consulting', level: 80 },
    ],
    color: '#a855f7',
    avgProficiency: 87,
    projects: [
      {
        title: 'Holistic Financial Planning',
        role: 'Client Success Associate',
        company: 'Golden Quasar Inc',
        period: 'Jan 2024 — Present',
        description: 'Executed comprehensive needs assessments for each client, developing personalized financial recommendations covering mutual funds, RRSP, TFSA, and GIC products aligned with individual goals.',
        impact: 'Delivered tailored solutions that increased client portfolio diversification and long-term retention.',
        metric: '100+',
        metricLabel: 'Clients Assessed',
      },
      {
        title: 'Market Research & Opportunity Identification',
        role: 'Intern, Financial Research',
        company: 'Investor Quotient IQ Canada',
        period: 'Jul 2021 — Dec 2021',
        description: 'Conducted in-depth market research to identify investment opportunities and emerging trends, translating findings into actionable client presentations and strategic recommendations.',
        impact: 'Identified tailored financial solutions through comprehensive market analysis and client profiling.',
        metric: '15+',
        metricLabel: 'Research Reports',
      },
    ] as ProjectExample[],
  },
  {
    icon: Shield,
    title: 'Financial Products & Compliance',
    shortLabel: 'Finance & Compliance',
    description: 'Mutual Funds license (CIFC) working towards CIFP Diploma; knowledge of RRSP, TFSA, GICs; regulatory compliance experience.',
    skills: [
      { name: 'Mutual Funds', level: 95 },
      { name: 'RRSP/TFSA', level: 90 },
      { name: 'GICs', level: 85 },
      { name: 'Regulatory Compliance', level: 88 },
    ],
    color: '#f59e0b',
    avgProficiency: 90,
    projects: [
      {
        title: 'CIFC Certification & Product Advisory',
        role: 'Licensed Mutual Funds Representative',
        company: 'CIFC Ontario',
        period: '2025',
        description: 'Completed the Canadian Investment Funds Course to become a licensed mutual funds representative, enabling direct advisory on investment fund products with full regulatory compliance.',
        impact: 'Licensed to sell mutual funds in Ontario with comprehensive knowledge of fund products and suitability requirements.',
        metric: 'CIFC',
        metricLabel: 'Licensed',
      },
      {
        title: 'Regulatory Compliance Management',
        role: 'Operations Consultant',
        company: 'Prometric Center / Yukon Consultants',
        period: 'May 2023 — May 2024',
        description: 'Maintained strict regulatory compliance across multiple test center locations while conducting proactive follow-ups and ensuring customer data privacy standards were upheld at all times.',
        impact: 'Earned Regional Best Test Centre recognition through compliance excellence and operational standards.',
        metric: '#1',
        metricLabel: 'Regional Ranking',
      },
    ] as ProjectExample[],
  },
  {
    icon: BarChart3,
    title: 'Technical & Analytical Skills',
    shortLabel: 'Technical & Analytics',
    description: 'Proficient in Microsoft Office Suite, Excel, Salesforce, PowerBI, and Tableau for data analysis and client reporting.',
    skills: [
      { name: 'Excel', level: 95 },
      { name: 'PowerBI', level: 85 },
      { name: 'Tableau', level: 80 },
      { name: 'Salesforce', level: 88 },
    ],
    color: '#06b6d4',
    avgProficiency: 87,
    projects: [
      {
        title: 'Client Presentation & Data Analytics',
        role: 'Intern, Financial Research',
        company: 'Investor Quotient IQ Canada',
        period: 'Jul 2021 — Dec 2021',
        description: 'Built comprehensive client presentations using Excel and Power BI, transforming complex financial data into clear, actionable visualizations that supported investment decision-making.',
        impact: 'Delivered data-driven presentations that enhanced client understanding and engagement with portfolio strategies.',
        metric: '50+',
        metricLabel: 'Presentations Built',
      },
      {
        title: 'CRM Platform Adoption',
        role: 'Client Success Associate',
        company: 'Golden Quasar Inc',
        period: 'Jan 2024 — Present',
        description: 'Quickly adapted to new CRM platforms and digital tools, leveraging Salesforce for client tracking, pipeline management, and automated follow-up workflows.',
        impact: 'Streamlined client management processes through effective CRM utilization and digital tool adoption.',
        metric: '5+',
        metricLabel: 'Tools Mastered',
      },
    ] as ProjectExample[],
  },
  {
    icon: Code,
    title: 'Programming & Automation',
    shortLabel: 'Programming',
    description: 'Programming knowledge in Python, Java, and SQL for process optimization with proven ability to quickly learn new programs, tools, and systems.',
    skills: [
      { name: 'Python', level: 78 },
      { name: 'SQL', level: 82 },
      { name: 'Java', level: 72 },
      { name: 'Process Automation', level: 85 },
    ],
    color: '#f43f5e',
    avgProficiency: 79,
    projects: [
      {
        title: 'Process Optimization & Automation',
        role: 'B.Com Management Studies',
        company: 'Humber College',
        period: '2021 — 2025',
        description: 'Applied Python and SQL programming skills to academic and practical projects focused on business process optimization, data analysis automation, and workflow efficiency improvements.',
        impact: 'Developed automated data processing scripts that reduced manual reporting time significantly.',
        metric: '3',
        metricLabel: 'Languages',
      },
      {
        title: 'Digital Tool Rapid Adoption',
        role: 'Multiple Roles',
        company: 'Various Organizations',
        period: '2021 — Present',
        description: 'Demonstrated consistent ability to quickly learn and master new programs, tools, and systems across every role — from CRM platforms to data visualization software to programming environments.',
        impact: 'Proven track record of rapid technology adoption enabling immediate productivity in new environments.',
        metric: '12+',
        metricLabel: 'Tools Learned',
      },
    ] as ProjectExample[],
  }
];

/* ── Recharts data transformer ── */
const radarData = competencies.map((c) => ({
  subject: c.shortLabel,
  value: c.avgProficiency,
  fullMark: 100,
}));

/* ── Custom Recharts angle axis tick ── */
function CustomAngleTick(props: {
  x: number; y: number; payload: { value: string; index: number };
  selectedIndex: number | null; hoveredIndex: number | null;
  onNodeClick: (i: number) => void; onNodeHover: (i: number) => void; onNodeLeave: () => void;
}) {
  const { x, y, payload, selectedIndex, hoveredIndex, onNodeClick, onNodeHover, onNodeLeave } = props;
  const idx = payload.index;
  const comp = competencies[idx];
  const isActive = selectedIndex === idx || hoveredIndex === idx;

  return (
    <g
      style={{ cursor: 'pointer' }}
      onClick={() => onNodeClick(idx)}
      onMouseEnter={() => onNodeHover(idx)}
      onMouseLeave={onNodeLeave}
    >
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={isActive ? comp.color : 'rgba(255,255,255,0.55)'}
        fontSize={isActive ? 13 : 11}
        fontWeight={isActive ? 700 : 500}
        fontFamily="Oswald, sans-serif"
        letterSpacing="0.5"
        style={{ transition: 'fill 0.3s, font-size 0.3s', textTransform: 'uppercase' } as React.CSSProperties}
      >
        {payload.value}
      </text>
    </g>
  );
}

/* ── Custom Recharts tooltip ── */
function CustomRadarTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { subject: string; value: number } }> }) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  const comp = competencies.find(c => c.shortLabel === data.subject);
  if (!comp) return null;

  return (
    <div className="bg-black/95 border px-4 py-3 backdrop-blur-sm" style={{ borderColor: comp.color }}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2" style={{ backgroundColor: comp.color }} />
        <p className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
          {comp.shortLabel}
        </p>
      </div>
      <p className="text-2xl font-bold" style={{ color: comp.color, fontFamily: 'var(--font-display)' }}>
        {data.value}%
      </p>
      <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">Proficiency</p>
    </div>
  );
}

/* ── Custom dot renderer for radar ── */
function CustomRadarDot(props: {
  cx: number; cy: number; index: number;
  selectedIndex: number | null; hoveredIndex: number | null;
  onNodeClick: (i: number) => void; onNodeHover: (i: number) => void; onNodeLeave: () => void;
}) {
  const { cx, cy, index, selectedIndex, hoveredIndex, onNodeClick, onNodeHover, onNodeLeave } = props;
  const comp = competencies[index];
  const isSelected = selectedIndex === index;
  const isHovered = hoveredIndex === index;
  const isActive = isSelected || isHovered;
  const nodeR = isSelected ? 10 : (isHovered ? 9 : 6);

  return (
    <g
      style={{ cursor: 'pointer' }}
      onClick={(e) => { e.stopPropagation(); onNodeClick(index); }}
      onMouseEnter={() => onNodeHover(index)}
      onMouseLeave={onNodeLeave}
      role="button"
      tabIndex={0}
      aria-label={`${comp.title}: ${comp.avgProficiency}% proficiency`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNodeClick(index); } }}
      onFocus={() => onNodeHover(index)}
      onBlur={onNodeLeave}
    >
      {/* Large hit area */}
      <circle cx={cx} cy={cy} r={28} fill="transparent" />

      {/* Outer glow ring */}
      {isSelected && (
        <circle cx={cx} cy={cy} r={22} fill={comp.color} opacity={0.15}>
          <animate attributeName="r" values="18;26;18" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.08;0.2" dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Pulse ring */}
      {isActive && (
        <circle cx={cx} cy={cy} r={16} fill="none" stroke={comp.color} strokeWidth="1.5" opacity={0.4}>
          <animate attributeName="r" values="12;20;12" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Breathing ring (idle) */}
      {!isActive && (
        <circle cx={cx} cy={cy} r={10} fill="none" stroke={comp.color} strokeWidth="0.8" opacity={0.2}>
          <animate attributeName="r" values="8;13;8" dur="3s" begin={`${index * 0.5}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.08;0.3" dur="3s" begin={`${index * 0.5}s`} repeatCount="indefinite" />
        </circle>
      )}

      {/* Data point */}
      <circle
        cx={cx} cy={cy} r={nodeR}
        fill={isActive ? comp.color : '#dc2626'}
        stroke={isActive ? 'white' : 'rgba(255,255,255,0.6)'}
        strokeWidth={isActive ? 2.5 : 1.5}
        style={{ transition: 'all 0.3s ease' }}
      />

      {/* Inner glow */}
      {isActive && (
        <circle cx={cx} cy={cy} r={nodeR - 2} fill="white" opacity={0.25} />
      )}
    </g>
  );
}

/* ── Animated Skill Bar (with motion) ── */
function SkillBar({ name, level, color, delay }: { name: string; level: number; color: string; delay: number }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(level), delay);
    return () => clearTimeout(timer);
  }, [level, delay]);

  return (
    <div ref={ref} className="group/skill">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-neutral-400 group-hover/skill:text-white transition-colors duration-300">{name}</span>
        <span className="text-xs font-bold tabular-nums" style={{ color, fontFamily: 'var(--font-display)' }}>{width}%</span>
      </div>
      <div className="w-full h-1.5 bg-neutral-800 overflow-hidden">
        <motion.div
          className="h-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: delay / 1000 }}
          style={{ backgroundColor: color }}
        >
          <div className="absolute inset-0 opacity-40"
            style={{ background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)` }} />
        </motion.div>
      </div>
    </div>
  );
}

/* ── Selected Competency Detail Panel (with AnimatePresence) ── */
function SelectedCompetencyDetail({ comp, onClose }: { comp: typeof competencies[0]; onClose: () => void }) {
  const [activeProject, setActiveProject] = useState(0);
  const project = comp.projects[activeProject];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative"
    >
      {/* Top color accent */}
      <motion.div
        className="h-1 w-full"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        style={{ backgroundColor: comp.color, transformOrigin: 'left' }}
      />

      <div className="bg-neutral-900/80 border border-neutral-800 backdrop-blur-sm">
        {/* Header row */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <motion.div
                className="p-3 flex-shrink-0"
                style={{ backgroundColor: `${comp.color}15` }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, type: 'spring', bounce: 0.4, delay: 0.15 }}
              >
                <comp.icon className="w-6 h-6" style={{ color: comp.color }} />
              </motion.div>
              <div className="min-w-0">
                <h4 className="text-lg font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                  {comp.title}
                </h4>
                <p className="text-sm text-neutral-400 mt-1 leading-relaxed max-w-xl">{comp.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <motion.span
                className="text-2xl font-bold"
                style={{ color: comp.color, fontFamily: 'var(--font-display)' }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                {comp.avgProficiency}%
              </motion.span>
              <button onClick={onClose} className="p-2 hover:bg-neutral-800 transition-colors group">
                <X className="w-5 h-5 text-neutral-500 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Skills + Project in two columns */}
        <div className="grid md:grid-cols-2 gap-6 p-6 pt-0">
          {/* Left: Skill bars */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5" style={{ backgroundColor: comp.color }} />
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
                Skill Breakdown
              </span>
            </div>
            <div className="space-y-4">
              {comp.skills.map((skill, si) => (
                <SkillBar key={skill.name} name={skill.name} level={skill.level}
                  color={comp.color} delay={si * 150 + 300} />
              ))}
            </div>
          </motion.div>

          {/* Right: Project example */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5" style={{ backgroundColor: comp.color }} />
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
                Project Examples
              </span>
            </div>

            {/* Project tabs */}
            <div className="flex gap-1 mb-4">
              {comp.projects.map((p, i) => (
                <button key={i} onClick={() => setActiveProject(i)}
                  className={`flex-1 py-2 px-3 text-[10px] uppercase tracking-wider font-bold transition-all duration-300 border-b-2 relative ${
                    activeProject === i
                      ? 'text-white'
                      : 'text-neutral-500 border-transparent hover:text-neutral-300 hover:border-neutral-700'
                  }`}
                  style={{ fontFamily: 'var(--font-display)' }}>
                  {p.title.split(' ').slice(0, 3).join(' ')}
                  {activeProject === i && (
                    <motion.div
                      layoutId={`project-tab-${comp.shortLabel}`}
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: comp.color }}
                      transition={{ duration: 0.3, type: 'spring', bounce: 0.15 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Metric highlight */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProject}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-4 mb-4 p-3 bg-neutral-800/50 border border-neutral-700/50">
                  <div className="text-center min-w-[70px]">
                    <p className="text-2xl font-bold" style={{ color: comp.color, fontFamily: 'var(--font-display)' }}>
                      {project.metric}
                    </p>
                    <p className="text-[9px] text-neutral-500 uppercase tracking-wider mt-0.5">{project.metricLabel}</p>
                  </div>
                  <div className="h-10 w-px bg-neutral-700" />
                  <div>
                    <p className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{project.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase className="w-3 h-3 text-neutral-500" />
                      <span className="text-[10px] text-neutral-400">{project.role} — {project.company}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-neutral-300 leading-relaxed mb-3">{project.description}</p>

                {/* Impact */}
                <div className="flex items-start gap-2 p-3 bg-neutral-800/30 border-l-2" style={{ borderColor: comp.color }}>
                  <Award className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: comp.color }} />
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-display)' }}>Key Impact</p>
                    <p className="text-xs text-neutral-300 leading-relaxed">{project.impact}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Competency selector pills ── */
function CompetencyPills({ selectedIndex, onSelect }: { selectedIndex: number | null; onSelect: (i: number) => void }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-6">
      {competencies.map((c, i) => {
        const isActive = selectedIndex === i;
        const Icon = c.icon;
        return (
          <motion.button
            key={i}
            onClick={() => onSelect(i)}
            className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-bold transition-all duration-300 border ${
              isActive
                ? 'text-white border-current bg-white/5'
                : 'text-neutral-500 border-neutral-800 hover:text-neutral-300 hover:border-neutral-600'
            }`}
            style={{
              color: isActive ? c.color : undefined,
              borderColor: isActive ? c.color : undefined,
              fontFamily: 'var(--font-display)',
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Icon className="w-3.5 h-3.5" />
            {c.shortLabel}
          </motion.button>
        );
      })}
    </div>
  );
}

export default function CompetenciesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleNodeClick = useCallback((index: number) => {
    setSelectedNode(prev => prev === index ? null : index);
  }, []);

  const handleNodeHover = useCallback((index: number) => {
    setHoveredCard(index);
  }, []);

  const handleNodeLeave = useCallback(() => {
    setHoveredCard(null);
  }, []);

  /* Memoize the custom tick to pass interaction state */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomTick = useCallback((tickProps: any) => {
    return (
      <CustomAngleTick
        {...tickProps}
        selectedIndex={selectedNode}
        hoveredIndex={hoveredCard}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onNodeLeave={handleNodeLeave}
      />
    );
  }, [selectedNode, hoveredCard, handleNodeClick, handleNodeHover, handleNodeLeave]);

  /* Memoize the custom dot to pass interaction state */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomDot = useCallback((dotProps: any) => {
    return (
      <CustomRadarDot
        {...dotProps}
        selectedIndex={selectedNode}
        hoveredIndex={hoveredCard}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onNodeLeave={handleNodeLeave}
      />
    );
  }, [selectedNode, hoveredCard, handleNodeClick, handleNodeHover, handleNodeLeave]);

  return (
    <section ref={sectionRef} id="competencies" className="relative w-full py-24 lg:py-32 bg-neutral-950 overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-red-900/5 to-transparent" />
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-red-600/3 blur-[120px]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className={`mb-12 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <ShinyText className="text-red-600 text-sm uppercase tracking-widest mb-4 block" speed={3} shimmerWidth={150} style={{ fontFamily: 'var(--font-display)' }}>Expertise</ShinyText>
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
            Core Competencies
          </ScrollFloat>
          <p className="mt-4 text-neutral-400 max-w-2xl text-lg leading-relaxed">
            Click any node on the radar or select a competency below to explore detailed skills and real project examples.
          </p>
        </div>

        {/* Recharts Radar Chart */}
        <motion.div
          className={`${isVisible ? '' : 'opacity-0'}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
        >
          <div className="relative max-w-2xl mx-auto">
            <div className="relative bg-neutral-900/20 border border-neutral-800/50 p-4 sm:p-6 lg:p-8 overflow-hidden">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-600/30" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-600/30" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-600/30" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-600/30" />

              {/* Recharts RadarChart */}
              <div className="w-full" style={{ height: 'clamp(320px, 50vw, 480px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <defs>
                      <radialGradient id="radarFillGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#dc2626" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#dc2626" stopOpacity={0.05} />
                      </radialGradient>
                      <filter id="recharts-glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <PolarGrid
                      stroke="rgba(255,255,255,0.07)"
                      strokeWidth={1}
                      gridType="polygon"
                    />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={renderCustomTick}
                      tickLine={false}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={false}
                      axisLine={false}
                    />
                    <Radar
                      name="Proficiency"
                      dataKey="value"
                      stroke="#dc2626"
                      strokeWidth={2.5}
                      fill="url(#radarFillGradient)"
                      dot={renderCustomDot}
                      animationBegin={0}
                      animationDuration={1500}
                      animationEasing="ease-out"
                      isAnimationActive={isVisible}
                    />
                    <Tooltip
                      content={<CustomRadarTooltip />}
                      cursor={false}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Center label overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {selectedNode !== null ? (
                    <motion.p
                      key={`selected-${selectedNode}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.25 }}
                      className="text-xs font-bold uppercase tracking-[3px]"
                      style={{ color: competencies[selectedNode].color, fontFamily: 'var(--font-display)' }}
                    >
                      {competencies[selectedNode].shortLabel}
                    </motion.p>
                  ) : (
                    <motion.div
                      key="hint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[3px] text-white/20" style={{ fontFamily: 'var(--font-display)' }}>
                        Click a Node
                      </p>
                      <p className="text-[8px] uppercase tracking-[2px] text-red-600/30 mt-0.5" style={{ fontFamily: 'var(--font-display)' }}>
                        to explore
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Competency pills below radar */}
            <CompetencyPills selectedIndex={selectedNode} onSelect={handleNodeClick} />
          </div>
        </motion.div>

        {/* Selected Competency Detail — AnimatePresence for smooth enter/exit */}
        <div className="mt-10 max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {selectedNode !== null ? (
              <SelectedCompetencyDetail
                key={selectedNode}
                comp={competencies[selectedNode]}
                onClose={() => setSelectedNode(null)}
              />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center py-8"
              >
                <p className="text-neutral-500 text-sm uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
                  Select a competency node above to view details
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Summary stats */}
        <div className={`grid grid-cols-3 gap-4 max-w-xl mx-auto mt-12 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
          {[
            { value: '15+', label: 'Technical Skills', red: true },
            { value: '10+', label: 'Financial Products', red: false },
            { value: '12+', label: 'Software Tools', red: true },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-neutral-900/40 border border-neutral-800 p-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              whileHover={{ borderColor: 'rgba(220,38,38,0.3)', scale: 1.02 }}
            >
              <p className={`text-2xl font-bold ${stat.red ? 'text-red-600' : 'text-white'}`} style={{ fontFamily: 'var(--font-display)' }}>{stat.value}</p>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
