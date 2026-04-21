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

const NAV_SECTIONS = ['Pipeline', 'Components', 'Platform'] as const;

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
  const [activeTab, setActiveTab] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 5);
    }, 4000);
    return () => clearInterval(timer);
  }, [autoPlay]);

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
    <div className="bg-black text-[#f1f1f1] font-sans selection:bg-[#E8B84B] selection:text-black min-h-screen overflow-x-hidden w-full relative">
      <RobotCanvas />

      <div className={`relative z-10 w-full pointer-events-none *:pointer-events-auto transition-opacity duration-1000 ${isEntering ? 'opacity-0' : 'opacity-100'}`}>
        {/* ── NAV ── */}
        <header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? `bg-[#0c0c0c]/95 backdrop-blur border-b ${BORDER}` : 'bg-transparent'
            }`}
        >
          <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">

            {/* Brand — stays on landing */}
            <div className="flex items-center gap-3 cursor-pointer select-none group" onClick={() => window.scrollTo(0, 0)}>
              <img src="/images/logo.png" alt="Terravortex Logo" className="w-10 h-10 object-contain group-hover:opacity-80 transition-opacity" />
              <span className="text-xl font-medium tracking-tight text-white group-hover:opacity-80 transition-opacity">Terravortex</span>
            </div>

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

        {/* ── IMMERSIVE HERO ── */}
        <section className="relative w-full min-h-[92vh] flex flex-col items-center justify-center overflow-hidden pt-20 md:pt-10 pb-32 md:pb-0">
          {/* Subtle Background Gradient Overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none mix-blend-overlay">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0c0c0c]/40 to-[#0c0c0c] opacity-90" />
          </div>

          <motion.div
            className="relative z-10 flex flex-col items-center text-center mt-12 md:mt-20 px-4 md:px-6 w-full max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-light tracking-tight text-white leading-[1.3] md:leading-[1.1] mb-12 md:mb-20 bg-black/40 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-4 rounded-xl md:p-0 md:rounded-none drop-shadow-2xl break-words w-full">
              General-purpose AI infrastructure <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#E8B84B] font-medium"> for the physical world.</span>
            </h1>

            {/* Simulated Animated Dashboard Mockup */}
            <motion.div
              onMouseEnter={() => setAutoPlay(false)}
              onMouseLeave={() => setAutoPlay(true)}
              className="w-full max-w-4xl relative z-20 mt-4 rounded-xl border border-white/10 bg-[#0c0c0c]/90 backdrop-blur-xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] min-w-0"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
            >
              {/* Window Controls & Tabs */}
              <div className="h-12 border-b border-white/10 flex items-center px-4 bg-white/[0.02] justify-between relative overflow-hidden">
                <div className="flex gap-2 min-w-[60px]">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>

                {/* Carousel Navigation Tabs */}
                <div className="flex text-[9px] md:text-xs font-mono tracking-widest h-full overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth">
                  {['01 Collect', '02 Curate', '03 Train', '04 Validate', '05 Deploy'].map((tab, idx) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(idx)}
                      className={`px-3 md:px-5 h-full shrink-0 flex items-center transition-colors relative ${activeTab === idx ? 'text-white' : 'text-[#555] hover:text-[#888]'}`}
                    >
                      {tab}
                      {activeTab === idx && (
                        <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E8B84B]" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="hidden md:block min-w-[60px]"></div>
              </div>

              <div className="p-6 md:p-10 text-left min-h-[380px] relative overflow-hidden">
                {/* STATE 0: COLLECT */}
                {activeTab === 0 && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div>
                        <div className="text-[10px] text-fuchsia-400 font-mono uppercase tracking-widest mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" /> Telemetry Stream</div>
                        <div className="text-xl md:text-2xl text-white font-light">Ingesting 5 simultaneous feeds</div>
                      </div>
                      <div className="text-left sm:text-right border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 block">
                        <div className="text-xs text-[#888] font-mono mb-1">Incoming Bandwidth</div>
                        <div className="text-lg text-white">4.2 GB/s</div>
                      </div>
                    </div>
                    <div className="h-px w-full bg-white/10"></div>
                    <div className="flex flex-col gap-3">
                      {[
                        { name: "Camera Array Primary", type: "RGB-D", status: "Active", hz: "60Hz" },
                        { name: "Lidar Point Cloud", type: "PCD", status: "Active", hz: "10Hz" },
                        { name: "Joint States", type: "Proprioception", status: "Active", hz: "500Hz" },
                      ].map((feed, i) => (
                        <div key={i} className="flex flex-col sm:flex-row flex-wrap sm:items-center justify-between gap-y-3 p-3 border border-white/5 rounded-lg bg-white/[0.02]">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center font-mono text-[10px] shrink-0">
                              {feed.type.substring(0, 3)}
                            </div>
                            <div>
                              <div className="text-sm text-white font-medium leading-none mb-1">{feed.name}</div>
                              <div className="text-[10px] text-[#888] font-mono leading-none">{feed.type}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 w-full md:w-auto mt-1 md:mt-0 pt-2 md:pt-0 border-t border-white/5 md:border-0 justify-between md:justify-end">
                            <span className="text-xs text-[#888] font-mono">{feed.hz}</span>
                            <span className="text-xs text-fuchsia-400 border border-fuchsia-400/30 bg-fuchsia-400/10 px-2 py-0.5 rounded">{feed.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STATE 1: CURATE */}
                {activeTab === 1 && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6 w-full">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[10px] text-[#E8B84B] font-mono uppercase tracking-widest mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#E8B84B]" /> Semantic Search Engine</div>
                        <div className="text-xl md:text-2xl text-white font-light">Query: "Robot arm dropping object"</div>
                      </div>
                      <div className="text-right hidden md:block">
                        <div className="text-xs text-[#888] font-mono mb-1">Results</div>
                        <div className="text-lg text-white">4,209 Sequences</div>
                      </div>
                    </div>
                    <div className="h-px w-full bg-white/10"></div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        '/images/image1.png', '/images/image2.png', '/images/image3.png',
                        '/images/image4.png', '/images/image5.png', '/images/image6.png'
                      ].map((img, i) => (
                        <div key={i} className="aspect-video bg-[#0c0c0c] border border-white/5 rounded overflow-hidden relative group cursor-pointer">
                          <img src={img} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" alt={`Dataset sequence ${i}`} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                          <div className="absolute bottom-2 left-2 text-[8px] bg-[#E8B84B] px-1.5 py-0.5 rounded font-mono text-black font-semibold tracking-wide shadow-[0_0_10px_rgba(232,184,75,0.4)]">100% Match</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STATE 2: TRAIN */}
                {activeTab === 2 && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6 w-full">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Distributed Runs</div>
                        <div className="text-xl md:text-2xl text-white font-light">Train Policy (Run: epoch-102)</div>
                      </div>
                      <button className="hidden md:block px-4 py-2 border border-white/20 text-white text-xs rounded hover:bg-white/5 transition-colors">Abort Run</button>
                    </div>
                    <div className="h-px w-full bg-white/10"></div>
                    <div className="flex flex-col md:flex-row gap-6 md:h-40">
                      <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded p-4 font-mono text-[10px] text-emerald-500 overflow-hidden flex flex-col gap-1.5 justify-end">
                        <div>[00:14:02] GPU:0 loaded params (1.2B)</div>
                        <div>[00:14:05] Starting epoch 10...</div>
                        <div>[00:14:12] Loss: 0.041 | Val: 0.082</div>
                        <div>[00:14:19] Loss: 0.039 | Val: 0.076</div>
                        <div className="text-white bg-white/10 w-max px-1">[00:14:26] Loss: 0.034 | Val: 0.071</div>
                      </div>
                      <div className="w-full md:w-24 flex md:flex-col gap-3 justify-center">
                        <div className="flex-1 bg-white/5 p-2 rounded border border-white/10">
                          <div className="text-[9px] text-[#888] uppercase mb-1 flex justify-between"><span>GPU 0</span> <span>99%</span></div>
                          <div className="h-1 bg-black rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[99%]"></div></div>
                        </div>
                        <div className="flex-1 bg-white/5 p-2 rounded border border-white/10">
                          <div className="text-[9px] text-[#888] uppercase mb-1 flex justify-between"><span>GPU 1</span> <span>94%</span></div>
                          <div className="h-1 bg-black rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[94%]"></div></div>
                        </div>
                        <div className="flex-1 bg-white/5 p-2 rounded border border-white/10">
                          <div className="text-[9px] text-[#888] uppercase mb-1 flex justify-between"><span>GPU 2</span> <span>97%</span></div>
                          <div className="h-1 bg-black rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[97%]"></div></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STATE 3: VALIDATE */}
                {activeTab === 3 && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6 w-full">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[10px] text-purple-400 font-mono uppercase tracking-widest mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Evaluation Cluster</div>
                        <div className="text-xl md:text-2xl text-white font-light">Sim-to-Real Benchmark</div>
                      </div>
                      <div className="text-right hidden md:block">
                        <div className="text-xs text-[#888] font-mono mb-1">Success Rate</div>
                        <div className="text-lg text-emerald-400">99.8%</div>
                      </div>
                    </div>
                    <div className="h-px w-full bg-white/10"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/[0.03] border border-white/5 p-4 rounded-lg">
                        <div className="text-[10px] text-[#888] uppercase tracking-widest mb-2">Collision Rate</div>
                        <div className="text-2xl font-light text-white">0.01%</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 p-4 rounded-lg">
                        <div className="text-[10px] text-[#888] uppercase tracking-widest mb-2">Speed Delta</div>
                        <div className="text-2xl font-light text-white">+12%</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 p-4 rounded-lg col-span-2">
                        <div className="text-[10px] text-[#888] uppercase tracking-widest mb-2">Generalization Score</div>
                        <div className="w-full h-8 flex items-end gap-1">
                          {[40, 60, 45, 80, 95, 99, 98, 99].map((h, i) => (
                            <div key={i} className="flex-1 bg-purple-500/80 rounded-t-sm transition-all duration-500 hover:bg-purple-400" style={{ height: `${h}%` }}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STATE 4: DEPLOY */}
                {activeTab === 4 && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6 w-full">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[10px] text-blue-400 font-mono uppercase tracking-widest mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Fleet Orchestration</div>
                        <div className="text-xl md:text-2xl text-white font-light">124 Robots Online</div>
                      </div>
                      <button className="px-4 md:px-5 py-2 md:py-2.5 bg-[#E8B84B] text-black text-xs font-semibold rounded hover:bg-yellow-400 transition-colors shadow-lg">Push Update</button>
                    </div>
                    <div className="h-px w-full bg-white/10"></div>
                    <div className="flex flex-col gap-3">
                      {[
                        { name: "Unit-A4 · Spot", status: "Online", sync: "100%", ver: "v2.0.1" },
                        { name: "Unit-B2 · XDog", status: "Syncing", sync: "84%", ver: "v2.0.1" },
                        { name: "Unit-C9 · Arm", status: "Online", sync: "100%", ver: "v2.0.1" }
                      ].map((bot, i) => (
                        <div key={i} className="flex flex-wrap items-center justify-between p-3.5 bg-white/[0.03] border border-white/5 rounded-lg hover:border-white/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${bot.status === 'Online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-yellow-400 animate-pulse'}`}></div>
                            <span className="text-sm text-white font-mono">{bot.name}</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-xs text-[#888] font-mono hidden md:block">{bot.ver}</span>
                            <span className="text-xs text-[#888] w-12">{bot.status}</span>
                            <div className="w-24 h-1.5 bg-black rounded-full overflow-hidden">
                              <div className="h-full bg-blue-400 transition-all duration-1000" style={{ width: bot.sync }}></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }} className="mt-20 z-20 relative mb-12 flex flex-col items-center">
            <button
              onClick={handleOpenVortex}
              className="group relative px-10 py-5 bg-white/5 backdrop-blur-md border border-white/10 text-white font-medium text-sm overflow-hidden rounded-full hover:border-transparent transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-3 tracking-widest uppercase transition-colors duration-300 group-hover:text-black">ENTER VORTEX <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
              <div className="absolute inset-0 bg-[#E8B84B] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </button>
          </motion.div>

          {/* Magnetic scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3 z-10"
          >
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#777] mix-blend-difference">Scroll to Discover</span>
            <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent overflow-hidden object-left-bottom origin-bottom animate-pulse mix-blend-difference" />
          </motion.div>
        </section>

        <div className={`border-t ${BORDER}`} />

        {/* ── BACKED BY INVESTORS ── */}
        <section className="w-full py-8 md:py-12 bg-black border-y border-white/[0.05] relative z-20 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 px-6 md:px-0">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#666]">Backed By</span>
          <div className="flex gap-10 md:gap-24 items-center justify-center">
            <img src="/images/ef.png" className="h-12 md:h-16 object-contain" alt="Entrepreneurs First" />
            <img src="/images/canopy.png" className="h-16 md:h-20 object-contain" alt="Founders Canopy" />
          </div>
        </section>

        {/* ── THE IMPACT / METRICS ── */}
        <section className="relative px-6 py-24 overflow-hidden bg-[#0c0c0c]/80 backdrop-blur-sm z-10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start gap-16 md:gap-24">
            <div className="flex-1">
              <span className="text-[#E8B84B] font-mono text-xs uppercase tracking-widest mb-4 block">The Core Problem</span>
              <h2 className="text-3xl md:text-5xl font-light text-white leading-tight mb-8">
                80% of robotics projects fail at deployment.
              </h2>
              <p className="text-lg text-[#a0a0a0] leading-relaxed mb-6">
                According to industry benchmarks, ML engineering teams spend <span className="text-white font-medium">70% of their time wrangling disjointed tools</span>—shuffling rosbags, managing fragmented training clusters, and manually flashing physical hardware.
              </p>
              <p className="text-lg text-[#a0a0a0] leading-relaxed">
                Vortex unifies the entire lifecycle. We drop the simulation-to-reality transfer time by an order of magnitude, so you can focus on building intelligent policies, not internal infrastructure.
              </p>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-12 md:pl-16 relative">
              <div className="hidden md:block absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/5 to-transparent"></div>
              <div>
                <div className="text-4xl md:text-6xl font-light text-white mb-2">70<span className="text-2xl md:text-3xl text-[#E8B84B]">%</span></div>
                <div className="text-[10px] uppercase tracking-widest font-mono text-[#888]">Time Saved on Infra</div>
              </div>
              <div>
                <div className="text-4xl md:text-6xl font-light text-white mb-2">10<span className="text-2xl md:text-3xl text-[#E8B84B]">x</span></div>
                <div className="text-[10px] uppercase tracking-widest font-mono text-[#888]">Sim-to-Real Speed</div>
              </div>
              <div>
                <div className="text-4xl md:text-6xl font-light text-white mb-2">0</div>
                <div className="text-[10px] uppercase tracking-widest font-mono text-[#888]">Manual OTA Flashes</div>
              </div>
              <div>
                <div className="text-4xl md:text-6xl font-light text-white mb-2">ALL</div>
                <div className="text-[10px] uppercase tracking-widest font-mono text-[#888]">Hardware Supported</div>
              </div>
            </div>
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

        {/* ── PLATFORM UPDATES FEED ── */}
        <section id="platform" className="relative z-20 max-w-5xl mx-auto p-8 md:p-12 bg-black/[0.85] backdrop-blur-2xl rounded-[2rem] border border-white/10 my-16 flex flex-col items-center shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
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
              <span className={`text-sm ${DIM}`}>Terravortex</span>
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
