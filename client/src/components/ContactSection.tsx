import { useEffect, useRef, useState } from 'react';
import { Mail, Phone, MapPin, Linkedin, Send, Loader2, CheckCircle, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import ShinyText from './reactbits/ShinyText';
import ScrollFloat from './reactbits/ScrollFloat';

const contactMethods = [
  { icon: Mail, label: 'Email', value: 'matinsaiyed3100@gmail.com', href: 'mailto:matinsaiyed3100@gmail.com' },
  { icon: Phone, label: 'Phone', value: '+1 (416) 270-7531', href: 'tel:+14162707531' },
  { icon: Linkedin, label: 'LinkedIn', value: 'linkedin.com/in/matinsaiyed', href: 'https://linkedin.com/in/matinsaiyed/' },
  { icon: MapPin, label: 'Location', value: 'Mississauga, Ontario', href: null as string | null },
];

export default function ContactSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const validate = (name: string, value: string): string => {
    if (name === 'name' && !value.trim()) return 'Name is required';
    if (name === 'email') {
      if (!value.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
    }
    if (name === 'message' && !value.trim()) return 'Message is required';
    return '';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append('access_key', 'YOUR_WEB3FORMS_KEY');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setIsSubmitted(true);
        formRef.current?.reset();
        toast.success('Message sent successfully!');
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section ref={sectionRef} id="contact" className="relative w-full py-24 lg:py-32 bg-black overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
      {/* Subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/3 blur-[150px]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className={`mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <ShinyText
            className="text-red-600 text-sm uppercase tracking-widest mb-4 block"
            speed={3} shimmerWidth={150}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Let's Talk
          </ShinyText>
          <ScrollFloat
            containerTag="h2"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white uppercase mb-6"
            stagger={0.04}
            animationDuration={0.9}
            ease="back.out(1.2)"
            from={{ opacity: 0, y: 60, rotateX: -40 }}
            to={{ opacity: 1, y: 0, rotateX: 0 }}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Start a Conversation
          </ScrollFloat>
          <p className="text-neutral-400 max-w-xl text-lg leading-relaxed">
            Whether you're looking for a dedicated financial professional, exploring a
            collaboration, or simply want to connect — I'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20">
          {/* Left: Contact methods */}
          <div className="space-y-6">
            <div className="space-y-3">
              {contactMethods.map((method, index) => {
                const inner = (
                  <motion.div
                    className="group flex items-center gap-4 p-4 bg-neutral-900/30 border border-neutral-800/50 hover:border-neutral-700 transition-all duration-400"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.08 }}
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-neutral-800/50 group-hover:bg-red-600/10 transition-colors duration-300">
                      <method.icon className="w-4 h-4 text-neutral-400 group-hover:text-red-500 transition-colors duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>
                        {method.label}
                      </p>
                      <p className="text-sm text-white truncate">{method.value}</p>
                    </div>
                    {method.href && (
                      <ArrowUpRight className="w-4 h-4 text-neutral-700 group-hover:text-red-500 transition-colors duration-300 shrink-0" />
                    )}
                  </motion.div>
                );

                return method.href ? (
                  <a
                    key={method.label}
                    href={method.href}
                    target={method.href.startsWith('http') ? '_blank' : undefined}
                    rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={method.label}>{inner}</div>
                );
              })}
            </div>

            {/* Status */}
            <motion.div
              className="flex items-center gap-3 p-4 border border-green-900/30 bg-green-950/20"
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7 }}
            >
              <span className="relative flex items-center justify-center">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                <span className="absolute w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
              </span>
              <div>
                <p className="text-green-400 text-sm font-medium">Open to opportunities</p>
                <p className="text-green-700 text-xs mt-0.5">Typically responds within 24 hours</p>
              </div>
            </motion.div>
          </div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="p-6 lg:p-8 bg-neutral-900/20 border border-neutral-800/40">
              <div className="mb-6">
                <h3 className="text-sm text-white uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  Send a Message
                </h3>
                <p className="text-xs text-neutral-600">All fields required. I'll get back to you promptly.</p>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                <input type="hidden" name="subject" value="Portfolio Contact Form Submission" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-display)' }}>Name</label>
                    <input
                      type="text" id="name" name="name" required disabled={isSubmitting}
                      aria-invalid={touched.name && !!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      onBlur={handleBlur}
                      onChange={handleFieldChange}
                      className={`w-full px-4 py-3 bg-black/50 border text-white text-sm placeholder-neutral-700 focus:border-red-600/50 focus:outline-none transition-colors duration-300 disabled:opacity-50 ${touched.name && errors.name ? 'border-red-500/80' : 'border-neutral-800/60'}`}
                      placeholder="Your name"
                    />
                    {touched.name && errors.name && <p id="name-error" className="text-red-500 text-[10px] mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-display)' }}>Email</label>
                    <input
                      type="email" id="email" name="email" required disabled={isSubmitting}
                      aria-invalid={touched.email && !!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      onBlur={handleBlur}
                      onChange={handleFieldChange}
                      className={`w-full px-4 py-3 bg-black/50 border text-white text-sm placeholder-neutral-700 focus:border-red-600/50 focus:outline-none transition-colors duration-300 disabled:opacity-50 ${touched.email && errors.email ? 'border-red-500/80' : 'border-neutral-800/60'}`}
                      placeholder="your@email.com"
                    />
                    {touched.email && errors.email && <p id="email-error" className="text-red-500 text-[10px] mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="subject-line" className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-display)' }}>Subject</label>
                  <input
                    type="text" id="subject-line" name="subject_line" disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-black/50 border border-neutral-800/60 text-white text-sm placeholder-neutral-700 focus:border-red-600/50 focus:outline-none transition-colors duration-300 disabled:opacity-50"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-display)' }}>Message</label>
                  <textarea
                    id="message" name="message" required rows={4} disabled={isSubmitting}
                    aria-invalid={touched.message && !!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    onBlur={handleBlur}
                    onChange={handleFieldChange}
                    className={`w-full px-4 py-3 bg-black/50 border text-white text-sm placeholder-neutral-700 focus:border-red-600/50 focus:outline-none transition-colors duration-300 resize-none disabled:opacity-50 ${touched.message && errors.message ? 'border-red-500/80' : 'border-neutral-800/60'}`}
                    placeholder="Tell me about the opportunity or how I can help..."
                  />
                  {touched.message && errors.message && <p id="message-error" className="text-red-500 text-[10px] mt-1">{errors.message}</p>}
                </div>

                <button
                  type="submit" disabled={isSubmitting}
                  className="group relative w-full flex items-center justify-center gap-3 px-8 py-4 bg-red-600 text-white font-medium uppercase tracking-wider text-sm overflow-hidden transition-all duration-300 hover:shadow-glow disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {isSubmitting ? (
                      <>Sending...<Loader2 className="w-4 h-4 animate-spin" /></>
                    ) : isSubmitted ? (
                      <>Message Sent<CheckCircle className="w-4 h-4" /></>
                    ) : (
                      <>Send Message<Send className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" /></>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-red-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
