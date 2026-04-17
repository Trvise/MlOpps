import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Key, Bell, Shield, Save, Building2, Mail, Phone, Globe } from 'lucide-react';

const BORDER = 'border-white/[0.07]';
const MUTED = 'text-[#c8c8c8]';
const DIM = 'text-[#999]';
const DIMMER = 'text-[#777]';
const INPUT_CLS = `w-full bg-transparent border ${BORDER} px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/20`;

const TOGGLE = `w-10 h-5 bg-white/[0.07] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[#555] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/20`;

type TabId = 'general' | 'security' | 'notifications' | 'deployment';

export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [formData, setFormData] = useState({
    name: 'John Doe', email: 'john.doe@company.com', company: 'RoboTech Industries',
    role: 'ML Engineer', phone: '+1 (555) 123-4567', timezone: 'America/New_York',
    currentPassword: '', newPassword: '', confirmPassword: '', twoFactorEnabled: false,
    emailNotifications: true, trainingComplete: true, deploymentAlerts: true, systemUpdates: false,
    rosVersion: 'ROS 2 Humble', deploymentTarget: 'Fleet', autoDeploy: false, deploymentTimeout: 300,
  });

  const tabs: { id: TabId; label: string; icon: typeof User }[] = [
    { id: 'general', label: 'General', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'deployment', label: 'Deployment', icon: Settings },
  ];

  const ToggleRow = ({ label, sub, field }: { label: string; sub: string; field: keyof typeof formData }) => (
    <div className={`flex items-center justify-between py-4 border-b ${BORDER} last:border-0`}>
      <div>
        <div className="text-sm text-white">{label}</div>
        <div className={`text-xs ${MUTED} mt-0.5`}>{sub}</div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={!!formData[field]} onChange={e => setFormData({ ...formData, [field]: e.target.checked })} className="sr-only peer" />
        <div className={TOGGLE} />
      </label>
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: 'easeOut' }}>
        {/* Header */}
        <div className={`pb-10 border-b ${BORDER}`}>
          <h1 className="text-4xl font-light text-white tracking-tight mb-2">Profile Settings</h1>
          <p className={`text-sm ${MUTED}`}>Manage your account settings and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 pt-10">
          {/* Tab Nav */}
          <div className="flex-shrink-0 lg:w-48">
            <nav className="space-y-0">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors text-left ${activeTab === id ? 'text-white' : `${DIM} hover:text-white hover:bg-white/[0.02]`}`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <p className={`text-xs ${DIMMER} uppercase tracking-widest`}>General Information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { label: 'Full Name', key: 'name', icon: User },
                    { label: 'Email', key: 'email', type: 'email', icon: Mail },
                    { label: 'Company', key: 'company', icon: Building2 },
                    { label: 'Role', key: 'role', icon: User },
                    { label: 'Phone', key: 'phone', type: 'tel', icon: Phone },
                  ].map(({ label, key, type, icon: Icon }) => (
                    <div key={key}>
                      <label className={`flex items-center gap-1.5 text-xs ${DIMMER} uppercase tracking-widest mb-2`}>
                        <Icon className="w-3 h-3" /> {label}
                      </label>
                      <input type={type || 'text'} value={(formData as any)[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} className={INPUT_CLS} />
                    </div>
                  ))}
                  <div>
                    <label className={`flex items-center gap-1.5 text-xs ${DIMMER} uppercase tracking-widest mb-2`}>
                      <Globe className="w-3 h-3" /> Timezone
                    </label>
                    <select value={formData.timezone} onChange={e => setFormData({ ...formData, timezone: e.target.value })} className={INPUT_CLS}>
                      {[['America/New_York', 'Eastern (ET)'], ['America/Chicago', 'Central (CT)'], ['America/Denver', 'Mountain (MT)'], ['America/Los_Angeles', 'Pacific (PT)'], ['UTC', 'UTC']].map(([v, l]) => <option key={v} value={v} className="bg-[#0c0c0c]">{l}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <p className={`text-xs ${DIMMER} uppercase tracking-widest`}>Security Settings</p>
                <div className="space-y-5">
                  {[{ label: 'Current Password', key: 'currentPassword' }, { label: 'New Password', key: 'newPassword', placeholder: 'Minimum 8 characters' }, { label: 'Confirm New Password', key: 'confirmPassword' }].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>{label}</label>
                      <input type="password" value={(formData as any)[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} className={INPUT_CLS} placeholder={placeholder} />
                    </div>
                  ))}
                  <ToggleRow label="Two-Factor Authentication" sub="Add an extra layer of security to your account" field="twoFactorEnabled" />
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <p className={`text-xs ${DIMMER} uppercase tracking-widest`}>Notification Preferences</p>
                <div>
                  <ToggleRow label="Email Notifications" sub="Receive notifications via email" field="emailNotifications" />
                  <ToggleRow label="Training Complete" sub="Notify when model training finishes" field="trainingComplete" />
                  <ToggleRow label="Deployment Alerts" sub="Alert on deployment status changes" field="deploymentAlerts" />
                  <ToggleRow label="System Updates" sub="Receive notifications about system updates" field="systemUpdates" />
                </div>
              </div>
            )}

            {activeTab === 'deployment' && (
              <div className="space-y-6">
                <p className={`text-xs ${DIMMER} uppercase tracking-widest`}>ROS Deployment Configuration</p>
                <p className={`text-sm ${MUTED}`}>Configure ROS deployment settings for your robot fleet</p>
                <div className="space-y-5">
                  <div>
                    <label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>ROS Version</label>
                    <select value={formData.rosVersion} onChange={e => setFormData({ ...formData, rosVersion: e.target.value })} className={INPUT_CLS}>
                      {['ROS 2 Humble', 'ROS 2 Iron', 'ROS 2 Jazzy', 'ROS 1 Noetic'].map(v => <option key={v} value={v} className="bg-[#0c0c0c]">{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>Default Deployment Target</label>
                    <select value={formData.deploymentTarget} onChange={e => setFormData({ ...formData, deploymentTarget: e.target.value })} className={INPUT_CLS}>
                      {[['Fleet', 'Entire Fleet'], ['Staged', 'Staged Rollout'], ['Single', 'Single Robot'], ['Custom', 'Custom Group']].map(([v, l]) => <option key={v} value={v} className="bg-[#0c0c0c]">{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>Deployment Timeout (seconds)</label>
                    <input type="number" value={formData.deploymentTimeout} onChange={e => setFormData({ ...formData, deploymentTimeout: parseInt(e.target.value) })} className={INPUT_CLS} min="60" max="3600" />
                    <p className={`text-xs ${DIMMER} mt-1`}>Maximum time to wait for deployment completion</p>
                  </div>
                  <ToggleRow label="Auto-Deploy After Validation" sub="Automatically deploy models after successful validation" field="autoDeploy" />
                  <div className={`border ${BORDER} p-4`}>
                    <div className="flex items-start gap-3">
                      <Key className={`w-4 h-4 ${DIMMER} flex-shrink-0 mt-0.5`} />
                      <div>
                        <div className={`text-xs ${DIMMER} uppercase tracking-widest mb-1`}>ROS Connection</div>
                        <div className={`text-sm ${MUTED}`}>Ensure robots are accessible via ROS bridge or ROS 2 DDS. Configure endpoints in the Connectors page.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save */}
            <div className={`mt-10 pt-6 border-t ${BORDER}`}>
              <button onClick={() => console.log('Saving profile:', formData)} className={`text-sm text-white border-b ${BORDER} hover:border-white/30 pb-px transition-colors flex items-center gap-1.5`}>
                <Save className="w-3.5 h-3.5" /> Save Changes →
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
