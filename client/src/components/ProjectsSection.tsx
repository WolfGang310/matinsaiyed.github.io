import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, TrendingUp, Users, Target, ChevronRight, LayoutDashboard } from 'lucide-react';
import ShinyText from './reactbits/ShinyText';
import ScrollFloat from './reactbits/ScrollFloat';

interface CaseStudy {
  id: string;
  category: string;
  title: string;
  metric: string;
  metricLabel: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  challenge: string;
  approach: string[];
  result: string;
  impactStats: { value: string; label: string }[];
  link?: string;
}

const caseStudies: CaseStudy[] = [
  {
    id: 'scheduler',
    category: 'Product Development',
    title: 'Building a Full-Stack Test Center Scheduling Platform',
    metric: '0→1',
    metricLabel: 'Built from Scratch',
    color: '#8b5cf6',
    icon: LayoutDashboard,
    challenge:
      'Managing scheduling across multiple test centers relied on manual coordination, spreadsheets, and fragmented communication — leading to coverage gaps, scheduling conflicts, and limited operational visibility.',
    approach: [
      'Designed a role-based platform with Manager, Supervisor, and TCA tiers — each with tailored dashboards and permissions',
      'Built a real-time Command Center with live status boards, action queues, and an automated scheduling algorithm',
      'Implemented multi-center management with per-center sessions, operating hours, and staff assignment workflows',
      'Engineered full-stack architecture with React 18, TypeScript, and Supabase — featuring real-time sync, leave management, clock tracking, and daily reporting',
    ],
    result:
      'Delivered a production-ready platform that replaced manual spreadsheet processes with a unified, real-time system — managing scheduling, leave requests, time tracking, and reporting across three test centers and 15+ staff.',
    impactStats: [
      { value: '3', label: 'Centers Managed' },
      { value: '15+', label: 'Staff Scheduled' },
      { value: 'Real-Time', label: 'Live Sync' },
    ],
    link: '/scheduler/index.html',
  },
  {
    id: 'capacity',
    category: 'Operations',
    title: 'Scaling Test Center Capacity from 30% to 80%',
    metric: '2.7x',
    metricLabel: 'Capacity Growth',
    color: '#3b82f6',
    icon: Target,
    challenge:
      'Inherited a test center operating at only 30% capacity with declining client satisfaction scores and inefficient processes that were limiting growth potential.',
    approach: [
      'Mapped the full client journey to identify friction points and drop-off stages',
      'Implemented streamlined scheduling system reducing wait times by 40%',
      'Developed proactive outreach program to re-engage lapsed clients',
      'Created standardized SOPs and trained a team of 15+ staff on new procedures',
    ],
    result:
      'Grew operational capacity from 30% to 80% within 18 months, earned Regional Best Test Centre recognition, and established a replicable model adopted by other locations.',
    impactStats: [
      { value: '80%', label: 'Final Capacity' },
      { value: '15+', label: 'Staff Trained' },
      { value: '40%', label: 'Wait Time Reduction' },
    ],
  },
  {
    id: 'satisfaction',
    category: 'Client Experience',
    title: 'Transforming Client Satisfaction from 68% to 94%',
    metric: '+26%',
    metricLabel: 'Satisfaction Lift',
    color: '#22c55e',
    icon: Users,
    challenge:
      'Client satisfaction had dropped to 68%, with recurring complaints about communication gaps, inconsistent service quality, and lack of follow-up after initial interactions.',
    approach: [
      'Conducted root-cause analysis of all negative feedback and exit surveys',
      'Established proactive follow-up cadence within 48 hours of every interaction',
      'Built customer feedback loop with weekly review and rapid response protocol',
      'Introduced personalized service plans based on individual client needs assessment',
    ],
    result:
      'Raised satisfaction scores from 68% to 94% in under a year, with the center achieving top 5% ranking across all regional branches for client experience.',
    impactStats: [
      { value: '94%', label: 'Satisfaction Rate' },
      { value: 'Top 5%', label: 'Regional Rank' },
      { value: '<48h', label: 'Follow-up Time' },
    ],
  },
  {
    id: 'sales',
    category: 'Sales Performance',
    title: 'Consistently Exceeding Sales Targets by 25%',
    metric: '+25%',
    metricLabel: 'Above Target',
    color: '#dc2626',
    icon: TrendingUp,
    challenge:
      'New to a client-facing sales role in financial services with ambitious quarterly targets and a competitive landscape requiring rapid credential-building and client trust.',
    approach: [
      'Earned CIFC license within first months to establish credibility with clients',
      'Developed holistic needs discovery framework using active listening techniques',
      'Built a referral pipeline through exceptional post-sale follow-up and relationship nurturing',
      'Leveraged CRM analytics to identify cross-selling opportunities and timing',
    ],
    result:
      'Exceeded quarterly sales targets by 25% while maintaining 96% client satisfaction, demonstrating that high performance and excellent service are not mutually exclusive.',
    impactStats: [
      { value: '25%', label: 'Above Target' },
      { value: '96%', label: 'Client Satisfaction' },
      { value: 'Q1-Q4', label: 'Consistent Results' },
    ],
  },
];

function CaseStudyCard({ study, isExpanded, onToggle, index, isVisible }: {
  study: CaseStudy;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
  isVisible: boolean;
}) {
  const Icon = study.icon;

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 40 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 + index * 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={`relative bg-neutral-900/40 border transition-all duration-500 overflow-hidden cursor-pointer ${
          isExpanded ? 'border-neutral-700' : 'border-neutral-800/60 hover:border-neutral-700'
        }`}
        onClick={onToggle}
      >
        {/* Color accent top bar */}
        <div
          className="h-1 transition-transform duration-500 origin-left"
          style={{
            backgroundColor: study.color,
            transform: isExpanded ? 'scaleX(1)' : 'scaleX(0)',
          }}
        />

        {/* Header */}
        <div className="p-6 lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 flex items-center justify-center transition-colors duration-300"
                  style={{ backgroundColor: `${study.color}12`, color: study.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className="text-[10px] uppercase tracking-[3px] text-neutral-500"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {study.category}
                </span>
              </div>

              <h3
                className="text-lg lg:text-xl font-medium text-white uppercase tracking-wide leading-snug"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {study.title}
              </h3>
            </div>

            {/* Big metric */}
            <div className="text-right shrink-0">
              <span
                className="text-3xl lg:text-4xl font-bold"
                style={{ fontFamily: 'var(--font-display)', color: study.color }}
              >
                {study.metric}
              </span>
              <p className="text-[9px] text-neutral-500 uppercase tracking-wider mt-1">{study.metricLabel}</p>
            </div>
          </div>

          {/* Expand indicator */}
          <div className="flex items-center gap-2 mt-5">
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className="w-4 h-4 text-neutral-600" />
            </motion.div>
            <span className="text-[10px] text-neutral-600 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
              {isExpanded ? 'Collapse' : 'View case study'}
            </span>
          </div>
        </div>

        {/* Expandable content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div className="px-6 lg:px-8 pb-8 space-y-6">
                {/* Divider */}
                <div
                  className="h-px"
                  style={{ background: `linear-gradient(to right, ${study.color}30, transparent)` }}
                />

                {/* Challenge */}
                <div>
                  <h4
                    className="text-[10px] text-neutral-500 uppercase tracking-[3px] mb-3"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    The Challenge
                  </h4>
                  <p className="text-sm text-neutral-400 leading-relaxed">{study.challenge}</p>
                </div>

                {/* Approach */}
                <div>
                  <h4
                    className="text-[10px] text-neutral-500 uppercase tracking-[3px] mb-3"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    The Approach
                  </h4>
                  <div className="space-y-2">
                    {study.approach.map((step, i) => (
                      <motion.div
                        key={i}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                      >
                        <span
                          className="text-[10px] font-bold mt-1 shrink-0"
                          style={{ color: study.color, fontFamily: 'var(--font-display)' }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <p className="text-sm text-neutral-400 leading-relaxed">{step}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Result */}
                <div>
                  <h4
                    className="text-[10px] text-neutral-500 uppercase tracking-[3px] mb-3"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    The Result
                  </h4>
                  <p className="text-sm text-neutral-300 leading-relaxed">{study.result}</p>
                </div>

                {/* Impact stats */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                  {study.impactStats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className="text-center py-4 border border-neutral-800/50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <p
                        className="text-xl font-bold"
                        style={{ fontFamily: 'var(--font-display)', color: study.color }}
                      >
                        {stat.value}
                      </p>
                      <p className="text-[9px] text-neutral-500 uppercase tracking-wider mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Launch link */}
                {study.link && (
                  <motion.div
                    className="pt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <a
                      href={study.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-widest font-medium text-white transition-all duration-300 hover:gap-3"
                      style={{
                        fontFamily: 'var(--font-display)',
                        backgroundColor: `${study.color}20`,
                        border: `1px solid ${study.color}40`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${study.color}35`;
                        e.currentTarget.style.borderColor = study.color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${study.color}20`;
                        e.currentTarget.style.borderColor = `${study.color}40`;
                      }}
                    >
                      Launch Platform
                      <ArrowUpRight className="w-3.5 h-3.5" style={{ color: study.color }} />
                    </a>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function ProjectsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="projects" className="relative w-full py-24 lg:py-32 bg-neutral-950">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-900/3 to-transparent" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <ShinyText
              className="text-red-600 text-sm uppercase tracking-widest mb-4 block"
              speed={3} shimmerWidth={150}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Impact
            </ShinyText>
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
              Case Studies
            </ScrollFloat>
          </div>

          <motion.p
            className="text-neutral-500 max-w-md text-sm leading-relaxed lg:text-right"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
          >
            Real challenges, real strategies, real results. Click each to explore the full story.
          </motion.p>
        </div>

        {/* Case studies */}
        <div className="space-y-4">
          {caseStudies.map((study, index) => (
            <CaseStudyCard
              key={study.id}
              study={study}
              index={index}
              isExpanded={expandedId === study.id}
              onToggle={() => setExpandedId(prev => prev === study.id ? null : study.id)}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* Summary callout */}
        <motion.div
          className="mt-12 flex items-center justify-center gap-3 text-neutral-600"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
        >
          <ArrowUpRight className="w-4 h-4 text-red-600" />
          <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
            Each outcome backed by measurable data
          </span>
        </motion.div>
      </div>
    </section>
  );
}
