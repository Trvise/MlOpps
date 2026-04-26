import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Eye, BellRing, Menu, X, Sun, Moon } from 'lucide-react';
import RobotCanvas from '../components/RobotCanvas';

export function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  const scrollTo = (id: string) => {
    setIsMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={isLightMode ? 'light' : 'dark'}>
      <div className="bg-white dark:bg-[#000000] text-gray-900 dark:text-white min-h-screen font-sans overflow-x-hidden transition-colors duration-500">

        {/* Navbar */}
        <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-black/50 backdrop-blur-md transition-colors duration-500">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/images/logo.png" alt="Trvise Logo" className="w-6 h-6 object-contain drop-shadow-sm" />
            <span className="font-sans font-bold text-xl tracking-wide text-black dark:text-white">Trvise</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 mr-4">
              <button onClick={() => scrollTo('solution')} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">Solution</button>
              <button onClick={() => scrollTo('prototype')} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">Prototype</button>
              <button onClick={() => scrollTo('how-it-works')} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">How It Works</button>
              <button onClick={() => scrollTo('roadmap')} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">The Trillion Dollar Dream</button>
            </div>
            <button onClick={() => setIsLightMode(!isLightMode)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              {isLightMode ? <Moon className="w-5 h-5 text-gray-700" /> : <Sun className="w-5 h-5 text-gray-300" />}
            </button>
            <button onClick={() => navigate('/software-demo')} className="text-sm font-bold tracking-wide text-[#C9A84C] hover:text-[#ebd088] transition-colors flex items-center gap-2 border border-[#C9A84C]/30 px-3 py-1.5 rounded-sm bg-[#C9A84C]/10 backdrop-blur-sm">
              <Settings2 className="w-4 h-4" /> Terravortex OS Demo
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setIsLightMode(!isLightMode)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              {isLightMode ? <Moon className="w-5 h-5 text-gray-700" /> : <Sun className="w-5 h-5 text-gray-300" />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-900 dark:text-white">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="fixed top-[64px] left-0 w-full bg-white dark:bg-black border-b border-black/10 dark:border-white/10 z-40 md:hidden flex flex-col items-center py-6 gap-6 shadow-xl"
            >
              <button onClick={() => scrollTo('solution')} className="text-lg font-medium text-gray-700 dark:text-gray-300">Solution</button>
              <button onClick={() => scrollTo('prototype')} className="text-lg font-medium text-gray-700 dark:text-gray-300">Prototype</button>
              <button onClick={() => scrollTo('how-it-works')} className="text-lg font-medium text-gray-700 dark:text-gray-300">How It Works</button>
              <button onClick={() => scrollTo('roadmap')} className="text-lg font-medium text-gray-700 dark:text-gray-300">The Trillion Dollar Dream</button>
              <div className="w-12 h-[1px] bg-black/20 dark:bg-white/20"></div>
              <button onClick={() => navigate('/software-demo')} className="text-base font-bold text-[#C9A84C] flex items-center gap-2">
                <Settings2 className="w-5 h-5" /> Terravortex OS Demo
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. Hero Section */}
        <section className="relative min-h-screen items-center justify-center pt-24 pb-12 px-6 flex flex-col overflow-hidden">
          {/* Gradients */}
          <div className="absolute inset-x-0 bottom-0 top-0 opacity-30 dark:opacity-60 bg-gradient-to-b from-transparent via-white dark:via-black to-white dark:to-black pointer-events-none z-0 transition-colors duration-500"></div>

          {/* 3D Robot Background */}
          <div className="absolute inset-0 opacity-100 dark:opacity-90 z-0">
            <RobotCanvas isLightMode={isLightMode} />
          </div>

          <div className="relative z-20 max-w-5xl mx-auto flex flex-col items-center text-center mt-12 md:mt-0 px-4 w-full">
            <div className="bg-white/80 dark:bg-black/70 backdrop-blur-md px-6 py-6 sm:px-10 sm:py-8 rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 inline-flex flex-col items-center max-w-4xl mx-auto">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="font-sans font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight mb-6 sm:mb-8 leading-tight text-gray-900 dark:text-white drop-shadow-sm"
              >
                Unplanned downtime costs millions.<br />
                <span className="block mt-2 md:mt-4 xl:mt-6"><span className="text-[#C9A84C]">We stop it</span> before it starts.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg md:text-2xl text-gray-800 dark:text-gray-200 max-w-2xl font-semibold leading-relaxed mb-8"
              >
                Autonomous robots that inspect your floor 24/7 — catching anomalies before they cascade into catastrophic failure.
              </motion.p>
              <motion.button
                onClick={() => navigate('/software-demo')}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-[#C9A84C] text-black px-10 py-5 font-bold tracking-wide text-lg rounded-md hover:bg-[#ebd088] transition-colors flex items-center gap-3 shadow-[0_0_30px_rgba(201,168,76,0.3)] hover:scale-105"
              >
                <Settings2 className="w-5 h-5" /> Vortex OS Demo
              </motion.button>
            </div>
          </div>
        </section>

        {/* 2. The Problem */}
        <section className="relative z-10 py-24 md:py-32 px-6 bg-gray-50 dark:bg-[#050505] border-t border-black/5 dark:border-white/5 transition-colors duration-500">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <div className="flex flex-col border-t border-black/10 dark:border-white/10 pt-6">
              <span className="font-bebas text-6xl md:text-7xl text-[#C9A84C] mb-4 drop-shadow-sm">$260B</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Lost annually by manufacturers to unplanned downtime.</span>
            </div>
            <div className="flex flex-col border-t border-black/10 dark:border-white/10 pt-6">
              <span className="font-bebas text-6xl md:text-7xl text-[#C9A84C] mb-4 drop-shadow-sm">23 HRS</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Average time to diagnose and repair a critical machine failure.</span>
            </div>
            <div className="flex flex-col border-t border-black/10 dark:border-white/10 pt-6">
              <span className="font-bebas text-6xl md:text-7xl text-[#C9A84C] mb-4 drop-shadow-sm">70%</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Of failures are detectable early via vibration, thermal, or acoustic signals.</span>
            </div>
          </div>
        </section>

        {/* 3. The Solution */}
        <section id="solution" className="relative z-10 py-24 md:py-32 px-6 bg-white dark:bg-black transition-colors duration-500">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-sans font-bold text-4xl md:text-5xl tracking-tight mb-16 text-black dark:text-white">Continuous Autonomous Inspection</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 dark:bg-[#111] p-8 border-l-4 border-[#C9A84C] flex flex-col rounded-sm shadow-md ring-1 ring-black/5 dark:ring-white/5 transition-colors">
                <Eye className="w-8 h-8 text-[#C9A84C] mb-6" />
                <h3 className="font-sans font-semibold text-2xl tracking-tight mb-3">Always-On Patrol</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">Robot navigates the factory floor 24/7, scanning every machine with thermal, acoustic, and visual sensors.</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#111] p-8 border-l-4 border-[#1A3BFF] flex flex-col rounded-sm shadow-md ring-1 ring-black/5 dark:ring-white/5 transition-colors">
                <BellRing className="w-8 h-8 text-[#1A3BFF] mb-6" />
                <h3 className="font-sans font-semibold text-2xl tracking-tight mb-3">Predictive Alerting</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">ML models learn each machine's health baseline and flag anomalies before they cascade into failures.</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#111] p-8 border-l-4 border-gray-400 dark:border-white/20 flex flex-col rounded-sm shadow-md ring-1 ring-black/5 dark:ring-white/5 transition-colors">
                <Settings2 className="w-8 h-8 text-gray-700 dark:text-white mb-6" />
                <h3 className="font-sans font-semibold text-2xl tracking-tight mb-3">Zero Infrastructure Changes</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">Deploys in days. No retrofitting. No sensor installation. Just drop it on the floor and go.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. The Robot Prototype */}
        <section id="prototype" className="relative z-10 py-32 px-6 bg-gray-50 dark:bg-[#050505] border-y border-black/5 dark:border-white/5 transition-colors duration-500">
          <div className="max-w-6xl mx-auto flex flex-col items-center">
            <h2 className="font-sans font-bold text-4xl md:text-5xl tracking-tight mb-6 text-center">Our Perception Prototype</h2>
            <p className="font-medium text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-3xl text-center mb-16 leading-relaxed">
              Previously built by our team as <span className="text-[#1A3BFF] font-bold">TRINA, a nursing robot</span>, this advanced perception platform serves as the direct inspiration for our upcoming <span className="text-[#C9A84C] font-bold">industrial factory product line</span>.
            </p>

            <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12 justify-center">
              <div className="flex-1 bg-white dark:bg-[#111] rounded-sm p-4 ring-1 ring-black/5 dark:ring-white/10 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <img src="/images/robot/deck-011.png" alt="Trvise Robot Perception Prototype Angle 1" className="w-full object-cover rounded-sm" />
              </div>
              <div className="flex-1 bg-white dark:bg-[#111] rounded-sm p-4 ring-1 ring-black/5 dark:ring-white/10 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <img src="/images/robot/deck-013.png" alt="Trvise Robot Perception Prototype Angle 2" className="w-full object-cover rounded-sm" />
              </div>
            </div>
          </div>
        </section>

        {/* 5. How It Works */}
        <section id="how-it-works" className="relative z-10 py-24 px-6 bg-white dark:bg-black transition-colors duration-500">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-sans font-bold text-4xl md:text-5xl tracking-tight mb-16 text-center">How It Works</h2>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative">
              <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[1px] bg-black/10 dark:bg-white/10 z-0"></div>

              {[
                { step: 1, title: 'Deploy in Days', desc: 'No infrastructure changes' },
                { step: 2, title: 'Map Floor', desc: 'Autonomous discovery' },
                { step: 3, title: 'Learn Baselines', desc: 'Establishes normal signals' },
                { step: 4, title: 'Flag Anomalies', desc: 'Predictive deviations' },
                { step: 5, title: 'Get Alerted', desc: 'Before failure cascade' }
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center relative z-10 w-full md:w-1/5">
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-[#0c0c0c] border border-black/10 dark:border-white/20 flex items-center justify-center font-bebas text-2xl mb-6 shadow-md dark:shadow-[0_0_15px_rgba(201,168,76,0.1)] text-black dark:text-white transition-colors">
                    {item.step}
                  </div>
                  <h4 className="font-sans font-semibold text-lg text-[#C9A84C] mb-2">{item.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Product Roadmap */}
        <section id="roadmap" className="relative z-10 py-24 px-6 bg-gray-50 dark:bg-[#050505] border-t border-black/5 dark:border-white/5 transition-colors duration-500">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <h2 className="font-sans font-bold text-4xl md:text-5xl tracking-tight mb-6">The Trvise Trillion Dollar Dream</h2>
                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">The only robot that sees problems today and fixes them tomorrow.</p>
              </div>
              <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#111] p-6 border border-black/5 dark:border-white/5 rounded-sm shadow-sm">
                  <span className="inline-block px-2 py-1 bg-[#C9A84C]/10 text-[#C9A84C] text-[10px] tracking-widest font-bold uppercase mb-4 rounded-sm">Phase 1 (Now)</span>
                  <h4 className="font-sans font-semibold text-2xl tracking-tight mb-3">Inspect</h4>
                  <p className="text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-400">Autonomous patrols capturing vibrational, thermal, and acoustic signatures.</p>
                </div>
                <div className="bg-white dark:bg-[#111] p-6 border border-black/5 dark:border-white/5 rounded-sm shadow-sm">
                  <span className="inline-block px-2 py-1 bg-[#1A3BFF]/10 text-[#1A3BFF] text-[10px] tracking-widest font-bold uppercase mb-4 rounded-sm">Phase 2 (2027)</span>
                  <h4 className="font-sans font-semibold text-2xl tracking-tight mb-3">Predict</h4>
                  <p className="text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-400">Cross-facility ML models identifying degradation before breakdown.</p>
                </div>
                <div className="bg-white dark:bg-[#111] p-6 border border-black/5 dark:border-white/5 rounded-sm shadow-sm opacity-100 md:opacity-60 hover:opacity-100 transition-opacity">
                  <span className="inline-block px-2 py-1 bg-black/10 dark:bg-white/10 text-gray-800 dark:text-white text-[10px] tracking-widest font-bold uppercase mb-4 rounded-sm">Phase 3 (2028+)</span>
                  <h4 className="font-sans font-semibold text-2xl tracking-tight mb-3">Act</h4>
                  <p className="text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-400">Interventions via manipulator arms. Replacing parts, tightening, no human entry.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Social Proof / Traction & Market */}
        <section className="relative z-10 py-24 px-6 bg-white dark:bg-black border-y border-black/5 dark:border-white/5 transition-colors duration-500">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="font-sans font-bold text-4xl md:text-5xl tracking-tight mb-12">Momentum</h2>
              <div className="space-y-8">
                <div className="flex border-b border-black/10 dark:border-white/10 pb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] mt-2 mr-6 shrink-0" />
                  <p className="text-xl font-medium tracking-tight text-gray-900 dark:text-white leading-snug">3 LOIs from midwest auto parts manufacturers.</p>
                </div>
                <div className="flex border-b border-black/10 dark:border-white/10 pb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] mt-2 mr-6 shrink-0" />
                  <p className="text-xl font-medium tracking-tight text-gray-900 dark:text-white leading-snug">Functional prototype built and tested at UIUC.</p>
                </div>
                <div className="flex pb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] mt-2 mr-6 shrink-0" />
                  <p className="text-xl font-medium tracking-tight text-gray-900 dark:text-white leading-snug">Patent pending: Perception Box sensor array.</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="font-sans font-bold text-4xl md:text-5xl tracking-tight mb-12">Addressable Market</h2>
              <div className="bg-gray-50 dark:bg-[#111] p-10 border-l-4 border-[#C9A84C] rounded-sm ring-1 ring-black/5 dark:ring-white/5 shadow-md">
                <span className="font-bebas text-8xl text-black dark:text-white block mb-4">$47B</span>
                <h4 className="font-sans font-semibold text-xl tracking-tight mb-2">Total Addressable Market</h4>
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-8 max-w-sm leading-relaxed">Global industrial predictive maintenance software & robotics scaling exponentially.</p>

                <div className="pt-8 border-t border-black/10 dark:border-white/10">
                  <span className="font-bebas text-4xl text-[#C9A84C] block mb-2">1,200 PLANTS</span>
                  <p className="text-gray-600 dark:text-gray-400 font-medium text-sm leading-relaxed">Our initial beachhead: Underserved mid-size Midwest automotive facilities with zero automation.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. CTA & Footer */}
        <section className="relative z-10 py-32 px-6 bg-gray-50 dark:bg-black text-center flex flex-col items-center overflow-hidden border-t border-black/5 dark:border-white/5 transition-colors duration-500">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent opacity-30 z-0"></div>

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="font-sans font-bold text-5xl md:text-7xl tracking-tight mb-8">Ready to stop guessing?</h2>
            <a href="mailto:aadityav@trvise.com" className="text-gray-600 dark:text-gray-400 font-medium hover:text-black dark:hover:text-white transition-colors border-b border-transparent hover:border-black dark:hover:border-white pb-1">
              aadityav@trvise.com
            </a>
          </div>
        </section>

        <footer className="bg-white dark:bg-[#050505] py-8 px-6 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-between z-10 relative transition-colors duration-500">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <img src="/images/logo.png" alt="Trvise Logo" className="w-5 h-5 object-contain opacity-80" />
            <span className="font-sans font-bold text-lg tracking-wide text-gray-500 dark:text-gray-400">Trvise</span>
          </div>
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500">&copy; 2026 Trvise Inc. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
