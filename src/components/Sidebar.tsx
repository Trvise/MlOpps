import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Zap, 
  FlaskConical, 
  Package, 
  Rocket, 
  History,
  Database,
  Plug,
  User,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/datasets', icon: Database, label: 'Datasets' },
  { to: '/curated-datasets', icon: BookOpen, label: 'Curated Datasets' },
  { to: '/search', icon: Sparkles, label: 'Search & Curate' },
  { to: '/train', icon: Zap, label: 'Train' },
  { to: '/validate', icon: FlaskConical, label: 'Validate' },
  { to: '/export', icon: Package, label: 'Export' },
  { to: '/deploy', icon: Rocket, label: 'Deploy' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/connectors', icon: Plug, label: 'Connectors' },
];

const bottomNavItems = [
  { to: '/profile', icon: User, label: 'Profile' },
];

export const Sidebar = () => {
  return (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 bg-black border-r border-slate-900 flex flex-col h-screen fixed left-0 top-0"
    >
      {/* Logo */}
      <div className="p-6 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            <img 
              src="/images/logo.png" 
              alt="The Vortex Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-light tracking-tight text-white">The Vortex</h1>
            <p className="text-xs text-slate-400 mt-1">ML Lifecycle Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'group-hover:text-white'}`} />
                  <span className="font-normal text-sm">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom Navigation - Profile */}
      <div className="p-4 border-t border-slate-900">
        <div className="space-y-1">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'group-hover:text-white'}`} />
                  <span className="font-normal text-sm">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-900">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-xs text-slate-400">System Status</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-white">All Systems Operational</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

