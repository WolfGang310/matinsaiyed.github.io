import { useState, useCallback, Suspense, lazy, Component, type ReactNode, type ErrorInfo } from 'react';
import type { Application } from '@splinetool/runtime';
import Navigation from "@/components/Navigation";

/* Only Spline is lazy — it's ~2 MB and loads its own scene over the network.
   All page sections are eagerly bundled so the UI paints instantly. */
const Spline = lazy(() => import('@splinetool/react-spline'));

import Preloader from "@/components/Preloader";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import PhilosophySection from "@/components/PhilosophySection";
import CompetenciesSection from "@/components/CompetenciesSection";
import ProjectsSection from "@/components/ProjectsSection";
import ExperienceSection from "@/components/ExperienceSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import EducationSection from "@/components/EducationSection";
import StudyGuideSection from "@/components/StudyGuideSection";
import PersonalSection from "@/components/PersonalSection";
import ContactSection from "@/components/ContactSection";
import SectionTransition from "@/components/SectionTransition";
import Footer from "@/components/Footer";
import ClickSpark from "@/components/reactbits/ClickSpark";

/** Catches Spline load failures silently — the 3D scene is non-essential. */
class SplineBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) { /* Spline failed — degrade gracefully */ }
  render() { return this.state.hasError ? null : this.props.children; }
}

export default function Home() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  const handlePreloaderComplete = useCallback(() => {
    setPreloaderDone(true);
  }, []);

  // Zoom the Spline camera in so the 3D scene fills the viewport.
  const handleSplineLoad = useCallback((splineApp: Application) => {
    if (splineApp && typeof splineApp.setZoom === 'function') {
      splineApp.setZoom(0.55);
    }
  }, []);

  return (
    <>
      {/* Spline 3D background — fixed behind all content, camera-zoomed for quality */}
      <div className="spline-bg fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <SplineBoundary>
          <Suspense fallback={null}>
            <Spline
              scene="https://prod.spline.design/qEHqkzH9t-4mYczb/scene.splinecode"
              onLoad={handleSplineLoad}
            />
          </Suspense>
        </SplineBoundary>
      </div>

      {/* Branded preloader */}
      {!preloaderDone && <Preloader onComplete={handlePreloaderComplete} />}

      <ClickSpark sparkColor="#dc2626" sparkSize={20} sparkRadius={75} sparkCount={12} duration={600}>
        <div className="relative z-10 min-h-screen text-white spline-through">
          {/* Skip to content */}
          <a
            href="#about"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10000] focus:bg-red-600 focus:text-white focus:px-4 focus:py-2 focus:text-sm focus:uppercase focus:tracking-wider"
          >
            Skip to main content
          </a>

          {/* Grain overlay */}
          <div className="grain-overlay" />

          {/* Navigation */}
          <Navigation />

          {/* Sections — narrative arc:
              1. Who I am (Hero)
              2. My background & metrics (About)
              3. My approach (Philosophy)
              4. What I can do (Competencies)
              5. What I've achieved (Projects/Case Studies)
              6. Where I've worked (Experience)
              7. What others say (Testimonials)
              8. My credentials (Education)
              9. The human behind the resume (Personal)
              10. Let's connect (Contact)
          */}
          <main>
            <HeroSection />
            <AboutSection />
            <PhilosophySection />
            <SectionTransition variant="text" text="Expertise" />
            <CompetenciesSection />
            <SectionTransition variant="counter" number="03" text="Proven Impact" />
            <ProjectsSection />
            <SectionTransition variant="line" />
            <ExperienceSection />
            <SectionTransition variant="text" text="Voices" />
            <TestimonialsSection />
            <SectionTransition variant="line" />
            <EducationSection />
            <SectionTransition variant="text" text="Study Hub" />
            <StudyGuideSection />
            <SectionTransition variant="text" text="Off the Clock" />
            <PersonalSection />
            <SectionTransition variant="line" />
            <ContactSection />
          </main>

          <Footer />
        </div>
      </ClickSpark>
    </>
  );
}
