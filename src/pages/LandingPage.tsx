import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import RobotCanvas from '../components/RobotCanvas';

const UPDATES = [
  {
    date: 'Apr 2026',
    tag: 'Search',
    title: 'Video Intelligence Search',
    desc: 'CLIP-powered visual semantic search with LLM query decomposition for agentic dataset curation.',
    isNew: true,
  },
  {
    date: 'Mar 2026',
    tag: 'Training',
    title: 'Multi-framework training support',
    desc: 'Launch runs across PyTorch and TensorFlow with configurable hyperparameters and live log streaming.',
    isNew: false,
  },
  {
    date: 'Feb 2026',
    tag: 'Deployment',
    title: 'Fleet deployment & rollback',
    desc: 'Push models to your full robot fleet over ROS2 and Docker. One-click rollback to any prior version.',
    isNew: false,
  },
  {
    date: 'Jan 2026',
    tag: 'Validation',
    title: 'Simulator integration',
    desc: 'Validate policies in NVIDIA Isaac Sim, Gazebo, and Isaac Gym before shipping to hardware.',
    isNew: false,
  },
  {
    date: 'Dec 2025',
    tag: 'Export',
    title: 'Multi-format model export',
    desc: 'Convert trained weights to ONNX, TensorRT, or TFLite with automated optimization passes.',
    isNew: false,
  },
];

const PIPELINE_STEPS = [
  { label: 'Ingest', desc: 'Connect any data source. Versioned, deduplicated, ready.' },
  { label: 'Train', desc: 'Kick off runs across PyTorch, TensorFlow, CasADi, LangChain.' },
  { label: 'Validate', desc: 'Simulate in Isaac Sim, Gazebo, or Isaac Gym before shipping.' },
  { label: 'Export', desc: 'Optimise and package. ONNX, TensorRT, or native weights.' },
  { label: 'Deploy', desc: 'Push to the full fleet — ROS2, Docker, Orin, A100.' },
];

const COMPONENTS = [
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

const NAV_SECTIONS = ['Platform', 'Pipeline', 'Components'] as const;

const BORDER = 'border-white/[0.07]';
const MUTED = 'text-[#c8c8c8]';
const DIM = 'text-[#999]';
const DIMMER = 'text-[#777]';
const HOVER_BG = 'hover:bg-white/[0.02]';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const handleOpenVortex = () => {
    setIsEntering(true);
    window.dispatchEvent(new Event('enter-vortex'));
    setTimeout(() => {
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="bg-[#0c0c0c] text-white min-h-screen font-sans antialiased relative">
      <RobotCanvas />

      <div className={`relative z-10 w-full pointer-events-none *:pointer-events-auto transition-opacity duration-1000 ${isEntering ? 'opacity-0' : 'opacity-100'}`}>
        {/* ── NAV ── */}
        <header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? `bg-[#0c0c0c]/95 backdrop-blur border-b ${BORDER}` : 'bg-transparent'
            }`}
        >
          <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">

            {/* Brand — stays on landing */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 hover:opacity-60 transition-opacity"
            >
              <img src="/images/logo.png" alt="Trvise" className="w-10 h-10 object-contain" />
              <span className="text-xl font-medium tracking-tight">Trvise</span>
            </button>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-7">
              {NAV_SECTIONS.map((l) => (
                <button
                  key={l}
                  onClick={() => scrollTo(l.toLowerCase())}
                  className={`text-sm ${DIM} hover:text-white transition-colors`}
                >
                  {l}
                </button>
              ))}
              <button
                onClick={handleOpenVortex}
                className="text-sm text-black bg-[#E8B84B] hover:bg-[#cca341] px-4 py-2 transition-colors font-medium border border-[#E8B84B]"
              >
                Open Vortex
              </button>
            </nav>

            {/* Mobile hamburger */}
            <button
              className={`md:hidden ${DIM} hover:text-white`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <div className="w-5 space-y-1.5">
                <span className={`block h-px bg-current transition-all origin-center ${menuOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
                <span className={`block h-px bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-px bg-current transition-all origin-center ${menuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
              </div>
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className={`md:hidden bg-[#0c0c0c] border-t ${BORDER} px-6 py-5 space-y-4`}>
              {NAV_SECTIONS.map((l) => (
                <button
                  key={l}
                  onClick={() => { scrollTo(l.toLowerCase()); setMenuOpen(false); }}
                  className={`block text-sm ${DIM} hover:text-white transition-colors`}
                >
                  {l}
                </button>
              ))}
              <button
                onClick={handleOpenVortex}
                className="block w-full text-center text-sm text-black bg-[#E8B84B] hover:bg-[#cca341] py-2 transition-colors font-medium"
              >
                Open Vortex
              </button>
            </div>
          )}
        </header>

        {/* ── HERO ── */}
        <section className="relative px-6 pt-36 pb-20 overflow-hidden">
          {/* Subtle Background Image */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none">
            <img
              src="/images/image1.png"
              alt="Robot background"
              className="w-full h-full object-cover opacity-[0.25] grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0c] via-[#0c0c0c]/80 to-transparent" />
          </div>

          <motion.div
            className="relative z-10 max-w-5xl mx-auto bg-[#0c0c0c]/40 backdrop-blur-md p-8 md:p-12 rounded-[2rem] border border-white/[0.04] flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white leading-[1.08] mb-7 max-w-2xl">
              Trvise
            </h1>
            <p className={`${MUTED} text-base md:text-lg leading-relaxed max-w-lg mb-10`}>
              End-to-end ML model lifecycle management for real-world robotics. From raw sensor data
              to full fleet deployment — powered by Vortex.
            </p>
            <button
              onClick={handleOpenVortex}
              className="text-sm text-black bg-[#E8B84B] hover:bg-[#cca341] px-6 py-3 transition-colors font-medium inline-flex items-center gap-2"
            >
              Open Vortex →
            </button>
          </motion.div>
        </section>

        <div className={`border-t ${BORDER}`} />

        {/* ── PLATFORM UPDATES FEED ── */}
        <section id="platform" className="max-w-5xl mx-auto p-8 md:p-12 bg-[#0c0c0c]/40 backdrop-blur-md rounded-[2rem] border border-white/[0.04] my-10 flex flex-col items-center">
          <p className={`text-xs ${DIM} uppercase tracking-widest mb-10 text-center`}>Platform Updates</p>

          <div>
            {UPDATES.map((u, i) => (
              <motion.div
                key={u.title}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={`group flex flex-col md:flex-row md:items-start gap-3 md:gap-10 py-6 border-b ${BORDER} last:border-0 ${HOVER_BG} -mx-4 px-4 rounded transition-colors`}
              >
                <div className="flex-shrink-0 md:w-28 flex md:flex-col gap-3 md:gap-1.5 items-center md:items-start">
                  <span className={`text-xs ${DIMMER} font-mono tabular-nums`}>{u.date}</span>
                  <span className={`text-xs ${DIM} bg-white/[0.05] px-2 py-0.5 rounded-sm leading-tight`}>
                    {u.tag}
                  </span>
                  {u.isNew && (
                    <span className="text-xs text-emerald-500 font-medium">New</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white mb-1.5 group-hover:text-slate-200 transition-colors">
                    {u.title}
                  </h3>
                  <p className={`text-sm ${MUTED} leading-relaxed`}>{u.desc}</p>
                </div>
                <div className={`hidden md:block text-[#333] group-hover:${MUTED} transition-colors text-sm pt-0.5 flex-shrink-0`}>
                  →
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <div className={`border-t ${BORDER}`} />

        {/* ── PIPELINE ── */}
        <section id="pipeline" className="relative px-6 py-20 overflow-hidden">
          {/* Subtle Background */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none">
            <img
              src="/images/image2.png"
              alt=""
              className="w-full h-full object-cover opacity-[0.25] grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-[#0c0c0c]" />
            <div className="absolute inset-0 bg-[#0c0c0c]/80" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto bg-[#0c0c0c]/40 backdrop-blur-md p-8 md:p-12 rounded-[2rem] border border-white/[0.04] flex flex-col items-center text-center w-full">
            <p className={`text-xs ${DIM} uppercase tracking-widest mb-8`}>Pipeline</p>
            <h2 className="text-2xl md:text-4xl font-light text-white leading-tight mb-12 max-w-md">
              A clear path from raw data to running robot.
            </h2>

            <div className="w-full max-w-3xl">
              {PIPELINE_STEPS.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className={`group flex items-start gap-8 py-5 border-b ${BORDER} last:border-0 ${HOVER_BG} -mx-4 px-4 rounded transition-colors`}
                >
                  <span className={`text-xs text-[#333] font-mono flex-shrink-0 w-7 mt-0.5 tabular-nums`}>
                    0{i + 1}
                  </span>
                  <div className="flex-1 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-14 text-left">
                    <span className="text-sm font-medium text-white flex-shrink-0 w-24">{step.label}</span>
                    <span className={`text-sm ${MUTED} leading-relaxed`}>{step.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <div className={`border-t ${BORDER}`} />

        {/* ── COMPONENTS ── */}
        <section id="components" className="relative px-6 py-20">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-5xl mx-auto bg-[#0c0c0c]/40 backdrop-blur-md p-8 md:p-12 rounded-[2rem] border border-white/[0.04] flex flex-col items-center text-center w-full">
            <p className={`text-xs ${DIM} uppercase tracking-widest mb-8`}>Components</p>
            <h2 className="text-2xl md:text-4xl font-light text-white leading-tight mb-12 max-w-md">
              Four layers. One coherent stack.
            </h2>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.07] border ${BORDER} rounded overflow-hidden`}>
              {COMPONENTS.map((c, i) => (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`bg-[#0c0c0c] ${HOVER_BG} transition-colors p-8`}
                >
                  <p className={`text-xs ${DIMMER} font-mono mb-3`}>{c.sub}</p>
                  <h3 className="text-sm font-medium text-white mb-3">{c.title}</h3>
                  <p className={`text-sm ${MUTED} leading-relaxed`}>{c.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <div className={`border-t ${BORDER}`} />

        {/* ── CTA ── */}
        <section className="relative px-6 py-32 overflow-hidden">
          {/* Subtle Background Image */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none">
            <img
              src="/images/image3.png"
              alt="CTA background"
              className="w-full h-full object-cover opacity-[0.25] grayscale blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-[#0c0c0c]" />
            <div className="absolute inset-0 bg-[#0c0c0c]/70" />
          </div>

          <motion.div
            className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center bg-[#0c0c0c]/40 backdrop-blur-md p-8 md:p-12 rounded-[2rem] border border-white/[0.04]"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-light text-white mb-5 leading-tight">
              Ready to close the loop?
            </h2>
            <p className={`${MUTED} text-base md:text-lg mb-10 max-w-md`}>
              Take your robot ML pipeline from prototype to production with Vortex.
            </p>
            <button
              onClick={handleOpenVortex}
              className="text-sm text-black bg-[#E8B84B] hover:bg-[#cca341] px-6 py-3 transition-colors font-medium inline-flex items-center gap-2"
            >
              Open Vortex →
            </button>
          </motion.div>
        </section>

        {/* ── FOOTER ── */}
        <footer className={`border-t ${BORDER} py-8 px-6`}>
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/images/logo.png" alt="" className="w-5 h-5 object-contain opacity-60" />
              <span className={`text-sm ${DIM}`}>Trvise</span>
            </div>
            <p className={`text-xs text-[#333] text-center`}>
              ML lifecycle management for robot intelligence at scale.
            </p>
            <button
              onClick={handleOpenVortex}
              className="text-xs text-[#E8B84B] hover:text-[#cca341] transition-colors"
            >
              Vortex →
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
