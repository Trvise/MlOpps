import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useModels } from '../store/useModels';
import { useRobots } from '../store/useRobots';
import { useHistory } from '../store/useHistory';
import { simulateDeployment } from '../utils/jobOrchestration';
import { LogViewer } from '../components/LogViewer';
import { ProgressBar } from '../components/ProgressBar';
import { CheckCircle2, Circle, Undo2 } from 'lucide-react';
import { formatDate } from '../lib/utils';

const BORDER = 'border-white/[0.07]';
const MUTED = 'text-[#c8c8c8]';
const DIM = 'text-[#999]';
const DIMMER = 'text-[#777]';

export const DeployPage = () => {
  const { models, startDeployment, completeDeployment, setJobProgress, clearJob, currentJob } = useModels();
  const { robots, initializeRobots, updateRobotModel } = useRobots();
  const { addEvent } = useHistory();

  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedRobots, setSelectedRobots] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);

  useEffect(() => { initializeRobots(); }, [initializeRobots]);

  const exportedModels = models.filter(m => m.export);
  const selectedModel = models.find(m => m.id === selectedModelId);

  const handleRobotSelect = (robotId: string) => {
    setSelectedRobots(prev => prev.includes(robotId) ? prev.filter(id => id !== robotId) : [...prev, robotId]);
  };

  const handleDeploy = () => {
    if (!selectedModelId || selectedRobots.length === 0) return;
    const model = models.find(m => m.id === selectedModelId);
    if (!model) return;
    let deploymentType: 'ROS2' | 'Docker' | 'Orin' | 'A100' = 'ROS2';
    if (model.componentType === 'Policy/Control' || model.componentType === 'Perception') deploymentType = 'Orin';
    else if (model.componentType === 'High-level reasoning') deploymentType = 'A100';
    startDeployment(selectedModelId);
    setIsDeploying(true);
    setDeploySuccess(false);
    addEvent({ modelVersion: model.version, type: 'Deploy', details: `Started deployment to ${selectedRobots.length} robot(s)`, metadata: { robotIds: selectedRobots, deploymentType, componentType: model.componentType } });
    simulateDeployment(
      (progress, logs) => { setJobProgress(progress, logs); },
      () => {
        selectedRobots.forEach(robotId => updateRobotModel(robotId, model.version));
        completeDeployment(selectedModelId, selectedRobots, deploymentType);
        clearJob();
        setIsDeploying(false);
        setDeploySuccess(true);
        addEvent({ modelVersion: model.version, type: 'Deploy', details: `Deployed to ${selectedRobots.length} robot(s) via ${deploymentType}`, metadata: { robotIds: selectedRobots, deploymentType, componentType: model.componentType } });
        setTimeout(() => { setDeploySuccess(false); setSelectedRobots([]); }, 3000);
      },
      selectedRobots.length
    );
  };

  const handleRollback = (robotId: string) => {
    const robot = robots.find(r => r.id === robotId);
    if (!robot) return;
    const currentVersionNum = parseInt(robot.currentModelVersion.replace('M-', ''), 10);
    const previousVersion = `M-${String(currentVersionNum - 1).padStart(3, '0')}`;
    const previousModel = models.find(m => m.version === previousVersion);
    if (previousModel) {
      updateRobotModel(robotId, previousVersion);
      addEvent({ modelVersion: previousVersion, type: 'Rollback', details: `Rolled back ${robot.name} to ${previousVersion}` });
    }
  };

  const onlineCount = robots.filter(r => r.status === 'online').length;
  const offlineCount = robots.filter(r => r.status === 'offline').length;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full overflow-x-hidden md:overflow-visible">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: 'easeOut' }}>
        {/* Header */}
        <div className={`pb-10 border-b ${BORDER}`}>
          <h1 className="text-4xl font-light text-white tracking-tight mb-2">Deploy to Fleet</h1>
          <p className={`text-sm ${MUTED}`}>Push components to robot fleet via ROS2, Docker on Orin, or A100 cluster</p>
        </div>

        {/* Fleet stats strip */}
        <div className={`grid grid-cols-3 border-b ${BORDER}`}>
          {[
            { label: 'Total Robots', value: robots.length },
            { label: 'Online', value: onlineCount, green: true },
            { label: 'Offline', value: offlineCount },
          ].map(({ label, value, green }, i) => (
            <div key={label} className={`py-6 ${i < 2 ? `border-r ${BORDER}` : ''} ${i > 0 ? 'px-8' : 'pr-8'}`}>
              <div className={`text-xs ${DIMMER} uppercase tracking-widest mb-2`}>{label}</div>
              <div className={`text-2xl font-light ${green ? 'text-emerald-500' : 'text-white'}`}>{value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-10">
          {/* Config */}
          <div className="space-y-6">
            <p className={`text-xs ${DIMMER} uppercase tracking-widest`}>Deployment Configuration</p>

            <div>
              <label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>Select Model</label>
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className={`w-full bg-transparent border ${BORDER} px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/20`}
              >
                <option value="" className="bg-[#0c0c0c]">Choose an exported model...</option>
                {exportedModels.map(model => (
                  <option key={model.id} value={model.id} className="bg-[#0c0c0c]">{model.version} — {model.name}</option>
                ))}
              </select>
            </div>

            {selectedModel && (
              <div className={`border ${BORDER} p-4`}>
                <div className={`text-xs ${DIMMER} uppercase tracking-widest mb-2`}>Selected</div>
                <div className="text-sm font-mono text-white">{selectedModel.version}</div>
                <div className={`text-sm ${MUTED}`}>{selectedModel.name}</div>
                <div className={`text-xs ${DIM} mt-1`}>Component: {selectedModel.componentType}</div>
                <div className={`text-xs ${DIM}`}>Format: {selectedModel.export?.format} · {selectedModel.export?.fileSizeMB.toFixed(1)} MB</div>
              </div>
            )}

            <div>
              <label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>
                Select Robots ({selectedRobots.length} selected)
              </label>
              <div className={`border ${BORDER} divide-y divide-white/[0.07] max-h-64 overflow-y-auto`}>
                {robots.map(robot => (
                  <label key={robot.id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors`}>
                    <input
                      type="checkbox"
                      checked={selectedRobots.includes(robot.id)}
                      onChange={() => handleRobotSelect(robot.id)}
                      className="w-3.5 h-3.5 accent-white"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white">{robot.name}</span>
                        <span className={`text-xs font-mono ${DIMMER}`}>{robot.id}</span>
                        <Circle className={`w-1.5 h-1.5 ${robot.status === 'online' ? 'fill-emerald-500 text-emerald-500' : 'fill-[#555] text-[#999]'}`} />
                      </div>
                      <div className={`text-xs ${DIM} mt-0.5`}>Current: {robot.currentModelVersion}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleDeploy}
              disabled={isDeploying || !selectedModelId || selectedRobots.length === 0}
              className={`text-sm text-white border-b ${BORDER} hover:border-white/30 pb-px transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              {isDeploying ? (
                <><div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> Deploying...</>
              ) : `Deploy to ${selectedRobots.length || '—'} Robot${selectedRobots.length !== 1 ? 's' : ''} →`}
            </button>

            {deploySuccess && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className={`text-sm ${MUTED}`}>Deployment successful — fleet updated</span>
              </motion.div>
            )}
          </div>

          {/* Fleet Status + Logs */}
          <div className="space-y-6">
            {isDeploying && currentJob && (
              <>
                <div className={`border ${BORDER} p-6`}>
                  <p className={`text-xs ${DIMMER} uppercase tracking-widest mb-4`}>Deployment Progress</p>
                  <ProgressBar progress={currentJob.progress} />
                </div>
                <LogViewer logs={currentJob.logs} title="Deployment Logs" />
              </>
            )}

            <div>
              <p className={`text-xs ${DIMMER} uppercase tracking-widest mb-4`}>Fleet Status</p>
              <div className={`border ${BORDER} divide-y divide-white/[0.07]`}>
                {robots.map(robot => (
                  <motion.div
                    key={robot.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 py-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-white">{robot.name}</span>
                          <Circle className={`w-1.5 h-1.5 ${robot.status === 'online' ? 'fill-emerald-500 text-emerald-500' : 'fill-[#555] text-[#999]'}`} />
                          <span className={`text-xs ${robot.status === 'online' ? 'text-emerald-500' : DIM}`}>{robot.status}</span>
                        </div>
                        <div className={`text-xs ${DIMMER} mb-0.5`}>{robot.id}</div>
                        <div className="text-xs">
                          <span className={DIM}>Model: </span>
                          <span className="font-mono text-white">{robot.currentModelVersion}</span>
                        </div>
                        <div className={`text-xs ${DIMMER} mt-0.5`}>Last sync: {formatDate(robot.lastSync)}</div>
                      </div>
                      <button
                        onClick={() => handleRollback(robot.id)}
                        disabled={robot.currentModelVersion === 'M-001'}
                        className={`flex items-center gap-1 text-xs ${DIM} hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed ml-3`}
                        title="Rollback"
                      >
                        <Undo2 className="w-3 h-3" />
                        Rollback
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
