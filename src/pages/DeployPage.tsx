import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useModels } from '../store/useModels';
import { useRobots } from '../store/useRobots';
import { useHistory } from '../store/useHistory';
import { Rocket, CheckCircle2, Circle, AlertCircle, Undo2 } from 'lucide-react';
import { formatDate } from '../lib/utils';

export const DeployPage = () => {
  const { models, deployModel } = useModels();
  const { robots, initializeRobots, updateRobotModel } = useRobots();
  const { addEvent } = useHistory();
  
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedRobots, setSelectedRobots] = useState<string[]>([]);
  const [deploySuccess, setDeploySuccess] = useState(false);

  useEffect(() => {
    initializeRobots();
  }, [initializeRobots]);

  const exportedModels = models.filter(m => m.export);
  const selectedModel = models.find(m => m.id === selectedModelId);

  const handleRobotSelect = (robotId: string) => {
    setSelectedRobots(prev => 
      prev.includes(robotId) 
        ? prev.filter(id => id !== robotId)
        : [...prev, robotId]
    );
  };

  const handleDeploy = () => {
    if (!selectedModelId || selectedRobots.length === 0) return;

    const model = models.find(m => m.id === selectedModelId);
    if (!model) return;

    // Determine deployment type based on component type
    let deploymentType: 'ROS2' | 'Docker' | 'Orin' | 'A100' = 'ROS2';
    if (model.componentType === 'Policy/Control' || model.componentType === 'Perception') {
      deploymentType = 'Orin'; // Edge deployment
    } else if (model.componentType === 'High-level reasoning') {
      deploymentType = 'A100'; // Cloud/GPU deployment
    }

    // Update robot models
    selectedRobots.forEach(robotId => {
      updateRobotModel(robotId, model.version);
    });

    // Deploy model
    deployModel(selectedModelId, selectedRobots, deploymentType);

    // Add history event
    addEvent({
      modelVersion: model.version,
      type: 'Deploy',
      details: `Deployed ${model.componentType} component to ${selectedRobots.length} robot(s) via ${deploymentType === 'ROS2' ? 'ROS2' : deploymentType === 'Orin' ? 'Dockerized ROS2 on Orin' : 'A100 cluster'}`,
      metadata: { robotIds: selectedRobots, deploymentType, componentType: model.componentType },
    });

    setDeploySuccess(true);
    setTimeout(() => {
      setDeploySuccess(false);
      setSelectedRobots([]);
    }, 3000);
  };

  const handleRollback = (robotId: string) => {
    const robot = robots.find(r => r.id === robotId);
    if (!robot) return;

    // Find previous model version
    const currentVersionNum = parseInt(robot.currentModelVersion.replace('M-', ''), 10);
    const previousVersion = `M-${String(currentVersionNum - 1).padStart(3, '0')}`;
    const previousModel = models.find(m => m.version === previousVersion);

    if (previousModel) {
      updateRobotModel(robotId, previousVersion);
      addEvent({
        modelVersion: previousVersion,
        type: 'Rollback',
        details: `Rolled back ${robot.name} to ${previousVersion}`,
      });
    }
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-light text-white mb-3 tracking-tight flex items-center gap-3">
            <Rocket className="w-8 h-8 text-green-400" />
            Deploy to Fleet
          </h1>
          <p className="text-lg text-slate-400">Deploy components to robot fleet via ROS2/Docker on Orin or A100 cluster</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deployment Form */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-8">
              <h2 className="text-xl font-medium text-white mb-6">Deployment Configuration</h2>
              
              <div className="space-y-6">
                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Model
                  </label>
                  <select
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="">Choose an exported model...</option>
                    {exportedModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.version} - {model.export?.format} ({model.export?.fileSizeMB.toFixed(1)} MB)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Model Info */}
                {selectedModel && (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-2">Selected Model</div>
                    <div className="font-mono text-cyan-400 mb-2">{selectedModel.version}</div>
                    <div className="text-xs text-blue-400 mb-2">Component: {selectedModel.componentType}</div>
                    <div className="flex gap-4 text-xs text-slate-300">
                      <div>Format: {selectedModel.export?.format}</div>
                      <div>Size: {selectedModel.export?.fileSizeMB.toFixed(1)} MB</div>
                    </div>
                    {selectedModel.export?.exportVersion && (
                      <div className="text-xs text-yellow-400 mt-1">
                        Export: {selectedModel.export.exportVersion}
                      </div>
                    )}
                    <div className="text-xs text-slate-500 mt-2">
                      Deployment: {selectedModel.componentType === 'Policy/Control' || selectedModel.componentType === 'Perception' 
                        ? 'Dockerized ROS2 nodes on Orin' 
                        : selectedModel.componentType === 'High-level reasoning'
                        ? 'A100 cluster'
                        : 'ROS2 nodes'}
                    </div>
                  </div>
                )}

                {/* Robot Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Robots ({selectedRobots.length} selected)
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-700 rounded-lg p-3 bg-slate-800/30">
                    {robots.map(robot => (
                      <label
                        key={robot.id}
                        className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRobots.includes(robot.id)}
                          onChange={() => handleRobotSelect(robot.id)}
                          className="w-4 h-4 text-green-500 border-slate-600 rounded focus:ring-green-500 focus:ring-offset-slate-800"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{robot.name}</span>
                            <span className="text-xs font-mono text-slate-400">({robot.id})</span>
                            {robot.status === 'online' ? (
                              <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                            ) : (
                              <Circle className="w-2 h-2 fill-slate-500 text-slate-500" />
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            Current: {robot.currentModelVersion}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Deploy Button */}
                <button
                onClick={handleDeploy}
                disabled={!selectedModelId || selectedRobots.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <Rocket className="w-5 h-5" />
                  Deploy to {selectedRobots.length} Robot{selectedRobots.length !== 1 ? 's' : ''}
                </button>

                {deploySuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                    <div>
                      <div className="text-green-400 font-medium">Deployment Successful!</div>
                      <div className="text-sm text-slate-400">Model rolled out to fleet</div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Fleet Status */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-800/50">
                <h2 className="text-xl font-medium text-white">Fleet Status</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {robots.map(robot => (
                    <motion.div
                      key={robot.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white">{robot.name}</span>
                            {robot.status === 'online' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-400">
                                <Circle className="w-2 h-2 fill-green-400" />
                                Online
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700 border border-slate-600 rounded text-xs text-slate-400">
                                <Circle className="w-2 h-2 fill-slate-500" />
                                Offline
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mb-1">{robot.id}</div>
                          <div className="text-xs">
                            <span className="text-slate-400">Model: </span>
                            <span className="font-mono text-cyan-400">{robot.currentModelVersion}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Last sync: {formatDate(robot.lastSync)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRollback(robot.id)}
                          disabled={robot.currentModelVersion === 'M-001'}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Rollback to previous version"
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
        </div>

        {/* Deployment Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Total Robots</div>
                <div className="text-3xl font-bold text-white">{robots.length}</div>
              </div>
              <Rocket className="w-10 h-10 text-slate-700" />
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Online</div>
                <div className="text-3xl font-bold text-green-400">
                  {robots.filter(r => r.status === 'online').length}
                </div>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-900" />
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Offline</div>
                <div className="text-3xl font-bold text-slate-400">
                  {robots.filter(r => r.status === 'offline').length}
                </div>
              </div>
              <AlertCircle className="w-10 h-10 text-slate-700" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

