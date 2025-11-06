import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Zap, 
  FlaskConical, 
  Package, 
  Rocket, 
  History,
  Activity,
  Database,
  Plug,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/datasets', icon: Database, label: 'Datasets' },
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
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
            <Activity className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text text-transparent">The Vortex</h1>
            <p className="text-xs text-slate-400">ML Lifecycle v1.1</p>
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
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/10 to-amber-600/10 text-amber-400 border border-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'group-hover:text-white'}`} />
                  <span className="font-medium">{item.label}</span>
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
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/10 to-amber-600/10 text-amber-400 border border-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'group-hover:text-white'}`} />
                  <span className="font-medium">{item.label}</span>
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

