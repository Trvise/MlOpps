import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

const PIPELINE_STEPS = [
  { label: 'Ingest', desc: 'Connect any data source. Versioned, deduplicated, ready.' },
  { label: 'Train', desc: 'Kick off runs across PyTorch, TensorFlow, CasADi, LangChain.' },
  { label: 'Validate', desc: 'Simulate in Isaac Sim, Gazebo, or Isaac Gym before shipping.' },
  { label: 'Export', desc: 'Optimise and package. ONNX, TensorRT, or native weights.' },
  { label: 'Deploy', desc: 'Push to the full fleet—ROS2, Docker, Orin, A100.' },
];

const STATS = [
  { value: '4', label: 'component types' },
  { value: '5', label: 'lifecycle stages' },
  { value: '3', label: 'sim environments' },
  { value: '∞', label: 'model versions' },
];

const GRID_IMAGES = [
  '/images/image1.png',
  '/images/hold1.png',
  '/images/image2.png',
  '/images/hold2.png',
  '/images/image3.png',
  '/images/hold3.png',
  '/images/image4.png',
  '/images/hold4.png',
  '/images/image5.png',
  '/images/hold5.png',
  '/images/image6.png',
  '/images/hold6.png',
];

const FEATURES = [
  {
    title: 'Perception',
    sub: 'DROID-SLAM + Mask R-CNN',
    body: 'End-to-end visual pipelines from raw sensor streams to semantic scene graphs.',
  },
  {
    title: 'Policy & Control',
    sub: 'Isaac Gym · RL / IL',
    body: 'Train locomotion and manipulation policies with real-sim transfer built in.',
  },
  {
    title: 'Planning',
    sub: 'CasADi · MPC',
    body: 'Trajectory optimisation with configurable horizons and constraint sets.',
  },
  {
    title: 'Reasoning',
    sub: 'OpenVLA · GPT-4 · LangChain',
    body: 'High-level language grounding for instruction-following and task planning.',
  },
];

// Typewriter for rotating phrases
const HERO_PHRASES = [
  'ML lifecycle for real-world robots.',
  'Train. Validate. Deploy.',
  'From data to fleet in one platform.',
  'Built for the machines of tomorrow.',
];

function Typewriter() {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  const phrase = HERO_PHRASES[idx];

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < phrase.length) {
      timeout = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 40);
    } else if (!deleting && displayed.length === phrase.length) {
      timeout = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 22);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIdx((i) => (i + 1) % HERO_PHRASES.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, phrase]);

  return (
    <span className="text-white">
      {displayed}
      <span className="animate-pulse text-slate-400">|</span>
    </span>
  );
}

export const LandingPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="bg-black text-white min-h-screen font-sans antialiased overflow-x-hidden">

      {/* ── NAV ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-black/90 backdrop-blur border-b border-white/5' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* The Vortex button — top left */}
          <button
            onClick={() => navigate('/dashboard')}
            className="group flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
              <img src="/images/logo.png" alt="The Vortex" className="w-full h-full object-contain" />
            </div>
            <span className="text-sm font-medium tracking-wide text-white">The Vortex</span>
            <span className="text-xs text-slate-500 border border-slate-700 rounded px-1.5 py-0.5 group-hover:border-slate-500 transition-colors">
              Dashboard →
            </span>
          </button>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {['Platform', 'Pipeline', 'Components'].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                className="text-sm text-slate-400 hover:text-white transition-colors tracking-wide"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm bg-white text-black px-4 py-2 rounded hover:bg-slate-200 transition-colors font-medium"
            >
              Open Dashboard
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <div className="w-5 space-y-1">
              <span className={`block h-px bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block h-px bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-px bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-black border-t border-white/5 overflow-hidden"
            >
              <div className="px-6 py-4 space-y-4">
                {['Platform', 'Pipeline', 'Components'].map((label) => (
                  <a
                    key={label}
                    href={`#${label.toLowerCase()}`}
                    className="block text-sm text-slate-400 hover:text-white transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </a>
                ))}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full text-sm bg-white text-black px-4 py-2 rounded font-medium"
                >
                  Open Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_60%,rgba(59,130,246,0.08),transparent)]" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 mb-10">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-slate-400 tracking-widest uppercase">ML Lifecycle Platform</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
            className="text-5xl md:text-7xl font-light tracking-tight text-white leading-[1.05] mb-8"
          >
            Intelligence
            <br />
            <span className="text-slate-400">at scale.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
            className="text-lg md:text-xl text-slate-400 mb-4 min-h-[2rem]"
          >
            <Typewriter />
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-sm text-slate-600 mb-12 max-w-lg mx-auto"
          >
            The Vortex unifies every stage of the robot ML lifecycle — from raw data to
            fleet deployment — in a single platform built for scale.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="group flex items-center gap-2 bg-white text-black px-7 py-3.5 rounded text-sm font-medium hover:bg-slate-100 transition-all"
            >
              Enter The Vortex
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <a
              href="#platform"
              className="text-sm text-slate-400 hover:text-white transition-colors px-7 py-3.5 border border-white/10 rounded hover:border-white/20"
            >
              Learn more
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600"
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <div className="text-4xl font-light text-white mb-1">{s.value}</div>
              <div className="text-xs text-slate-500 uppercase tracking-widest">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PLATFORM OVERVIEW ── */}
      <section id="platform" className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Platform</p>
            <h2 className="text-3xl md:text-5xl font-light text-white leading-tight max-w-2xl">
              Every stage of the robot ML lifecycle, unified.
            </h2>
          </motion.div>

          {/* Image mosaic */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-20">
            {GRID_IMAGES.map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className={`overflow-hidden rounded bg-slate-900 ${
                  i === 0 ? 'col-span-2 row-span-2' : ''
                }`}
                style={{ aspectRatio: i === 0 ? '1/1' : '4/3' }}
              >
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PIPELINE ── */}
      <section id="pipeline" className="py-32 px-6 bg-white/[0.015] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Pipeline</p>
            <h2 className="text-3xl md:text-5xl font-light text-white leading-tight max-w-xl">
              A clear path from raw data to running robot.
            </h2>
          </motion.div>

          <div className="space-y-0">
            {PIPELINE_STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group flex items-start gap-8 py-8 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-4 px-4 rounded transition-colors"
              >
                <div className="flex-shrink-0 w-10 text-right">
                  <span className="text-xs text-slate-600 font-mono">0{i + 1}</span>
                </div>
                <div className="w-px self-stretch bg-white/5 flex-shrink-0" />
                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3 md:gap-12">
                  <h3 className="text-lg font-medium text-white w-32 flex-shrink-0">{step.label}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed flex-1">{step.desc}</p>
                </div>
                <div className="flex-shrink-0 text-slate-700 group-hover:text-slate-400 transition-colors text-lg">
                  →
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPONENTS ── */}
      <section id="components" className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Components</p>
            <h2 className="text-3xl md:text-5xl font-light text-white leading-tight max-w-xl">
              Four layers. One coherent stack.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 rounded-lg overflow-hidden">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-black hover:bg-white/[0.03] transition-colors p-10 group"
              >
                <div className="mb-6">
                  <div className="text-xs text-slate-600 font-mono mb-3 group-hover:text-slate-500 transition-colors">
                    {f.sub}
                  </div>
                  <h3 className="text-xl font-medium text-white">{f.title}</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <section className="border-y border-white/5 bg-white/[0.015] py-5 overflow-hidden">
        <motion.div
          animate={{ x: [0, '-50%'] }}
          transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
          className="flex gap-12 whitespace-nowrap text-xs text-slate-600 uppercase tracking-widest"
          style={{ width: 'max-content' }}
        >
          {Array.from({ length: 2 }).flatMap(() =>
            ['PyTorch', 'TensorFlow', 'CasADi', 'LangChain', 'Isaac Sim', 'Gazebo', 'Isaac Gym', 'ROS2', 'Docker', 'NVIDIA Orin', 'A100', 'ONNX', 'TensorRT', 'OpenVLA', 'GPT-4', 'DROID-SLAM', 'Mask R-CNN'].map(
              (t) => (
                <span key={t + Math.random()} className="mx-6">
                  {t}
                </span>
              )
            )
          )}
        </motion.div>
      </section>

      {/* ── FULLSCREEN CTA ── */}
      <section className="relative py-48 px-6 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,rgba(59,130,246,0.06),transparent)]" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 text-center max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-light text-white mb-6 leading-tight">
            Ready to close the loop?
          </h2>
          <p className="text-slate-400 text-lg mb-12">
            Spin up The Vortex and take your robot ML pipeline from prototype to production.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="group inline-flex items-center gap-3 bg-white text-black px-9 py-4 rounded text-sm font-medium hover:bg-slate-100 transition-all"
          >
            Enter The Vortex
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
              <img src="/images/logo.png" alt="The Vortex" className="w-full h-full object-contain" />
            </div>
            <span className="text-sm text-slate-400">The Vortex</span>
          </div>
          <p className="text-xs text-slate-700 text-center">
            ML Lifecycle Management Platform — built for robot intelligence at scale.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs text-slate-500 hover:text-white transition-colors"
          >
            Dashboard →
          </button>
        </div>
      </footer>
    </div>
  );
};
