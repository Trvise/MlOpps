import { NavLink, useNavigate } from 'react-router-dom';
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

const BORDER = 'border-white/[0.07]';
const DIM = 'text-[#999]';
const DIMMER = 'text-[#777]';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/datasets', icon: Database, label: 'Datasets' },
  { to: '/dashboard/curated-datasets', icon: BookOpen, label: 'Curated Datasets' },
  { to: '/dashboard/search', icon: Sparkles, label: 'Search & Curate' },
  { to: '/dashboard/train', icon: Zap, label: 'Train' },
  { to: '/dashboard/validate', icon: FlaskConical, label: 'Validate' },
  { to: '/dashboard/export', icon: Package, label: 'Export' },
  { to: '/dashboard/deploy', icon: Rocket, label: 'Deploy' },
  { to: '/dashboard/history', icon: History, label: 'History' },
  { to: '/dashboard/connectors', icon: Plug, label: 'Connectors' },
];

const bottomNavItems = [
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
];

interface SidebarProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen }: SidebarProps) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen?.(false)}
        />
      )}

      <div
        className={`w-64 bg-[#0c0c0c] border-r ${BORDER} flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Logo */}
        <div className={`p-6 border-b ${BORDER}`}>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-70 transition-opacity w-full"
          >
            <div className="w-7 h-7 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src="/images/logo.png"
                alt="Vortex"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-medium tracking-tight text-white">Vortex</h1>
                <span className="text-[9px] font-mono font-medium tracking-widest uppercase text-[#E8B84B] border border-[#E8B84B]/30 px-1 py-0.5 leading-none">DEMO</span>
              </div>
              <p className={`text-xs ${DIMMER} mt-0.5`}>by Trvise</p>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className={`text-[10px] ${DIMMER} uppercase tracking-widest px-3 mb-3`}>Workspace</div>
          <div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 transition-all duration-150 group ${isActive
                    ? 'text-white'
                    : `${DIM} hover:text-white hover:bg-white/[0.02]`
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#E8B84B]' : `${DIM} group-hover:text-white`}`} />
                    <span className="text-sm font-normal">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Profile */}
        <div className={`px-4 border-t ${BORDER}`}>
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 transition-all duration-150 group ${isActive
                  ? 'text-white'
                  : `${DIM} hover:text-white hover:bg-white/[0.02]`
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#E8B84B]' : `${DIM} group-hover:text-white`}`} />
                  <span className="text-sm font-normal">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* SDK Coming Soon */}
        <div className={`p-4 border-t ${BORDER}`}>
          <div className={`border border-[#E8B84B]/20 bg-[#E8B84B]/[0.03] p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-1 rounded-full bg-[#E8B84B]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E8B84B]">Coming Soon</span>
            </div>
            <div className="text-xs text-white font-light mb-1">Trvise SDK</div>
            <p className={`text-[11px] ${DIMMER} leading-relaxed`}>
              Python & ROS 2 SDK for programmatic model lifecycle management.
            </p>
            <div className={`mt-3 text-[11px] ${DIMMER} font-mono`}>pip install trvise</div>
          </div>
        </div>

        {/* System Status */}
        <div className={`px-6 py-4 border-t ${BORDER}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className={`text-[11px] ${DIMMER}`}>All systems operational</span>
            </div>
            <span className={`text-[10px] font-mono ${DIMMER}`}>v0.1-demo</span>
          </div>
        </div>
      </div>
    </>
  );
};
