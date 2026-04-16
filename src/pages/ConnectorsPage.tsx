import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database,
  Plus,
  Trash2,
  Edit,
  X,
  Cloud,
  Plug,
  Server,
  Settings,
  TestTube,
  Activity
} from 'lucide-react';
import { useDatasets } from '../store/useDatasets';
import { useHistory } from '../store/useHistory';

interface Connector {
  id: string;
  name: string;
  type: 'dataset' | 'model';
  provider: 'AWS S3' | 'GCP Storage' | 'Azure Blob' | 'Custom ROS' | 'External Model';
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, any>;
  lastSync?: string;
}

export const ConnectorsPage = () => {
  const { addDataset } = useDatasets();
  const { addEvent } = useHistory();

  const [connectors, setConnectors] = useState<Connector[]>([
    {
      id: '1',
      name: 'AWS S3 Dataset Source',
      type: 'dataset',
      provider: 'AWS S3',
      status: 'connected',
      config: { bucket: 'roboml-datasets', region: 'us-east-1' },
      lastSync: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'GCP Storage Bucket',
      type: 'dataset',
      provider: 'GCP Storage',
      status: 'connected',
      config: { bucket: 'ml-training-data', project: 'robot-project-123' },
      lastSync: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingConnector, setEditingConnector] = useState<Connector | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'dataset' as 'dataset' | 'model',
    provider: 'AWS S3' as Connector['provider'],
    config: {} as Record<string, any>,
  });

  const providers = {
    dataset: ['AWS S3', 'GCP Storage', 'Azure Blob'],
    model: ['Custom ROS', 'External Model'],
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'AWS S3':
      case 'GCP Storage':
      case 'Azure Blob':
        return <Cloud className="w-5 h-5" />;
      case 'Custom ROS':
      case 'External Model':
        return <Server className="w-5 h-5" />;
      default:
        return <Plug className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'disconnected':
        return 'bg-slate-700 border-slate-600 text-slate-400';
      case 'error':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      default:
        return 'bg-slate-700 border-slate-600 text-slate-400';
    }
  };

  const handleOpenModal = (connector?: Connector) => {
    if (connector) {
      setEditingConnector(connector);
      setFormData({
        name: connector.name,
        type: connector.type,
        provider: connector.provider,
        config: connector.config,
      });
    } else {
      setEditingConnector(null);
      setFormData({
        name: '',
        type: 'dataset',
        provider: 'AWS S3',
        config: {},
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingConnector) {
      setConnectors(connectors.map(c => 
        c.id === editingConnector.id 
          ? { ...c, ...formData, status: 'connected' as const }
          : c
      ));
    } else {
      const newConnector: Connector = {
        id: crypto.randomUUID(),
        ...formData,
        status: 'connected' as const,
        lastSync: new Date().toISOString(),
      };
      setConnectors([...connectors, newConnector]);

      // If it's an AWS S3 dataset connector, create a dummy dataset from the bucket
      if (newConnector.type === 'dataset' && newConnector.provider === 'AWS S3' && newConnector.config.bucket) {
        // Simulate discovering a dataset from S3 bucket
        const bucketName = newConnector.config.bucket;
        const region = newConnector.config.region || 'us-east-1';
        const pathPrefix = newConnector.config.pathPrefix || 'datasets';
        
        // Generate realistic dataset data
        const datasetNames = [
          'Robot Navigation Training Data',
          'Object Detection Dataset',
          'Warehouse Scenarios',
          'Indoor Navigation Set',
          'Autonomous Driving Data'
        ];
        const formats: ('COCO' | 'YOLO' | 'TFRecord' | 'Custom')[] = ['COCO', 'YOLO', 'TFRecord', 'Custom'];
        const classes = [
          ['obstacle', 'path', 'wall', 'door', 'person'],
          ['box', 'pallet', 'forklift', 'shelf', 'robot'],
          ['car', 'truck', 'pedestrian', 'traffic_light', 'sign'],
          ['object', 'ground', 'ceiling', 'window', 'corridor']
        ];

        const randomName = datasetNames[Math.floor(Math.random() * datasetNames.length)];
        const randomFormat = formats[Math.floor(Math.random() * formats.length)];
        const randomClasses = classes[Math.floor(Math.random() * classes.length)];
        const randomSamples = Math.floor(Math.random() * 15000) + 5000; // 5k-20k samples
        const randomSize = Math.floor(randomSamples * 0.15 + Math.random() * 500); // MB

        const newDataset = addDataset({
          name: randomName,
          size: randomSize,
          samples: randomSamples,
          format: randomFormat,
          description: `Dataset discovered from S3 bucket: ${bucketName}. Synced from AWS S3 connector "${newConnector.name}" in region ${region}.`,
          tags: ['s3', 'aws', 'synced', bucketName.replace(/[^a-z0-9]/gi, '').toLowerCase()],
          uploadedBy: 'system',
          s3Path: `s3://${bucketName}/${pathPrefix}/${randomName.toLowerCase().replace(/\s+/g, '-')}/`,
          splits: {
            train: [],
            test: [],
            inference: [],
          },
          metadata: {
            classes: randomClasses,
            resolution: randomFormat === 'YOLO' ? '640x640' : '1280x720',
            augmented: Math.random() > 0.5,
          },
        });

        // Add history event
        addEvent({
          modelVersion: newDataset.version,
          type: 'Train',
          details: `Dataset "${randomName}" (${newDataset.version}) discovered and synced from S3 bucket ${bucketName}`,
          metadata: {
            connectorId: newConnector.id,
            connectorName: newConnector.name,
            bucket: bucketName,
            region: region,
            s3Path: newDataset.s3Path,
            samples: randomSamples,
            format: randomFormat,
          },
        });
      }
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setConnectors(connectors.filter(c => c.id !== id));
  };

  const handleTest = (connector: Connector) => {
    // Simulate connection test
    console.log('Testing connection:', connector);
  };

  const renderConfigFields = () => {
    if (formData.provider === 'AWS S3') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">S3 Bucket Name</label>
            <input
              type="text"
              value={formData.config.bucket || ''}
              onChange={(e) => setFormData({ ...formData, config: { ...formData.config, bucket: e.target.value } })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="my-bucket-name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">AWS Region</label>
            <input
              type="text"
              value={formData.config.region || ''}
              onChange={(e) => setFormData({ ...formData, config: { ...formData.config, region: e.target.value } })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="us-east-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Access Key ID</label>
            <input
              type="password"
              value={formData.config.accessKey || ''}
              onChange={(e) => setFormData({ ...formData, config: { ...formData.config, accessKey: e.target.value } })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="AKIA..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Secret Access Key</label>
            <input
              type="password"
              value={formData.config.secretKey || ''}
              onChange={(e) => setFormData({ ...formData, config: { ...formData.config, secretKey: e.target.value } })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>
        </>
      );
    } else if (formData.provider === 'GCP Storage') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">GCP Project ID</label>
            <input
              type="text"
              value={formData.config.project || ''}
              onChange={(e) => setFormData({ ...formData, config: { ...formData.config, project: e.target.value } })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="my-gcp-project"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Bucket Name</label>
            <input
              type="text"
              value={formData.config.bucket || ''}
              onChange={(e) => setFormData({ ...formData, config: { ...formData.config, bucket: e.target.value } })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="my-bucket-name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Service Account JSON</label>
            <textarea
              value={formData.config.serviceAccount || ''}
              onChange={(e) => setFormData({ ...formData, config: { ...formData.config, serviceAccount: e.target.value } })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 h-32 font-mono text-xs"
              placeholder="Paste service account JSON key..."
            />
          </div>
        </>
      );
    } else if (formData.provider === 'Custom ROS') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">ROS Master URI</label>
            <input
              type="text"
              value={formData.config.masterUri || ''}
              onChange={(e) => setFormData({ ...formData, config: { ...formData.config, masterUri: e.target.value } })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="http://robot-ip:11311"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">ROS 2 DDS Domain ID</label>
            <input
              type="number"
              value={formData.config.domainId || ''}
              onChange={(e) => setFormData({ ...formData, config: { ...formData.config, domainId: parseInt(e.target.value) } })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Model Topic</label>
            <input
              type="text"
              value={formData.config.modelTopic || ''}
              onChange={(e) => setFormData({ ...formData, config: { ...formData.config, modelTopic: e.target.value } })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="/model/inference"
            />
          </div>
        </>
      );
    } else if (formData.provider === 'External Model') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Model API Endpoint</label>
            <input
              type="text"
              value={formData.config.endpoint || ''}
              onChange={(e) => setFormData({ ...formData, config: { ...formData.config, endpoint: e.target.value } })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="https://api.example.com/models"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">API Key</label>
            <input
              type="password"
              value={formData.config.apiKey || ''}
              onChange={(e) => setFormData({ ...formData, config: { ...formData.config, apiKey: e.target.value } })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Model Format</label>
            <select
              value={formData.config.format || 'onnx'}
              onChange={(e) => setFormData({ ...formData, config: { ...formData.config, format: e.target.value } })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="onnx">ONNX</option>
              <option value="tensorrt">TensorRT</option>
              <option value="tflite">TFLite</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-white mb-3 tracking-tight flex items-center gap-3">
              <Plug className="w-8 h-8 text-amber-400" />
              Connectors
            </h1>
            <p className="text-lg text-slate-400">Connect to cloud data sources and external model repositories</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Add Connector</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Connectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {connectors.map((connector) => (
            <motion.div
              key={connector.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:border-slate-700/50 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-amber-400">
                    {getProviderIcon(connector.provider)}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{connector.name}</h3>
                    <p className="text-xs text-slate-400">{connector.provider}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(connector.status)}`}>
                  <Activity className="w-3 h-3" />
                  {connector.status}
                </span>
              </div>

              {/* Type Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                  connector.type === 'dataset' 
                    ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                    : 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
                }`}>
                  <Database className="w-3 h-3" />
                  {connector.type === 'dataset' ? 'Dataset Source' : 'Model Source'}
                </span>
              </div>

              {/* Config Preview */}
              <div className="mb-4 space-y-2">
                {Object.entries(connector.config).slice(0, 2).map(([key, value]) => (
                  <div key={key} className="text-xs">
                    <span className="text-slate-500">{key}:</span>{' '}
                    <span className="text-slate-300 font-mono">
                      {typeof value === 'string' && value.length > 20 ? value.substring(0, 20) + '...' : String(value)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-800">
                <button
                  onClick={() => handleTest(connector)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium transition-colors"
                  title="Test connection"
                >
                  <TestTube className="w-3 h-3" />
                  Test
                </button>
                <button
                  onClick={() => handleOpenModal(connector)}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded text-xs font-medium transition-colors"
                  title="Edit connector"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(connector.id)}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded text-xs font-medium transition-colors"
                  title="Delete connector"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {connectors.length === 0 && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Plug className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">No connectors configured</p>
              <button
                onClick={() => handleOpenModal()}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Add your first connector →
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Plus className="w-6 h-6 text-amber-400" />
                  {editingConnector ? 'Edit Connector' : 'Add New Connector'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Connector Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="My AWS S3 Connection"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setFormData({ ...formData, type: 'dataset', provider: 'AWS S3' })}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        formData.type === 'dataset'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      Dataset Source
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, type: 'model', provider: 'Custom ROS' })}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        formData.type === 'model'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      Model Source
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Provider</label>
                  <select
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value as Connector['provider'], config: {} })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {providers[formData.type].map(provider => (
                      <option key={provider} value={provider}>{provider}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Settings className="w-4 h-4" />
                    Configuration
                  </div>
                  {renderConfigFields()}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!formData.name}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingConnector ? 'Update' : 'Create'} Connector
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

