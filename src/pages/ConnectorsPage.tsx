import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit, X, Cloud, Plug, Server, Settings, TestTube, Activity } from 'lucide-react';
import { useDatasets } from '../store/useDatasets';
import { useHistory } from '../store/useHistory';

const BORDER = 'border-white/[0.07]';
const MUTED = 'text-[#c8c8c8]';
const DIM = 'text-[#999]';
const DIMMER = 'text-[#777]';
const INPUT_CLS = `w-full bg-transparent border ${BORDER} px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/20`;

interface Connector {
  id: string; name: string; type: 'dataset' | 'model';
  provider: 'AWS S3' | 'GCP Storage' | 'Azure Blob' | 'Custom ROS' | 'External Model';
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, any>; lastSync?: string;
}

export const ConnectorsPage = () => {
  const { addDataset } = useDatasets();
  const { addEvent } = useHistory();
  const [connectors, setConnectors] = useState<Connector[]>([
    { id: '1', name: 'AWS S3 Dataset Source', type: 'dataset', provider: 'AWS S3', status: 'connected', config: { bucket: 'roboml-datasets', region: 'us-east-1' }, lastSync: new Date().toISOString() },
    { id: '2', name: 'GCP Storage Bucket', type: 'dataset', provider: 'GCP Storage', status: 'connected', config: { bucket: 'ml-training-data', project: 'robot-project-123' }, lastSync: new Date(Date.now() - 3600000).toISOString() },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editingConnector, setEditingConnector] = useState<Connector | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'dataset' as 'dataset' | 'model', provider: 'AWS S3' as Connector['provider'], config: {} as Record<string, any> });

  const providers = { dataset: ['AWS S3', 'GCP Storage', 'Azure Blob'], model: ['Custom ROS', 'External Model'] };

  const getProviderIcon = (provider: string) => {
    if (['AWS S3', 'GCP Storage', 'Azure Blob'].includes(provider)) return <Cloud className="w-4 h-4" />;
    return <Server className="w-4 h-4" />;
  };

  const getStatusStyle = (status: string) => {
    if (status === 'connected') return 'text-emerald-500';
    if (status === 'error') return 'text-[#c8c8c8]';
    return DIM;
  };

  const handleOpenModal = (connector?: Connector) => {
    if (connector) { setEditingConnector(connector); setFormData({ name: connector.name, type: connector.type, provider: connector.provider, config: connector.config }); }
    else { setEditingConnector(null); setFormData({ name: '', type: 'dataset', provider: 'AWS S3', config: {} }); }
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingConnector) {
      setConnectors(connectors.map(c => c.id === editingConnector.id ? { ...c, ...formData, status: 'connected' as const } : c));
    } else {
      const newConnector: Connector = { id: crypto.randomUUID(), ...formData, status: 'connected' as const, lastSync: new Date().toISOString() };
      setConnectors([...connectors, newConnector]);
      if (newConnector.type === 'dataset' && newConnector.provider === 'AWS S3' && newConnector.config.bucket) {
        const bucketName = newConnector.config.bucket;
        const region = newConnector.config.region || 'us-east-1';
        const names = ['Robot Navigation Data', 'Object Detection Dataset', 'Warehouse Scenarios', 'Indoor Navigation Set'];
        const formats: ('COCO' | 'YOLO' | 'TFRecord' | 'Custom')[] = ['COCO', 'YOLO', 'TFRecord', 'Custom'];
        const allClasses = [['obstacle', 'path', 'wall'], ['box', 'pallet', 'forklift'], ['car', 'pedestrian', 'sign']];
        const rName = names[Math.floor(Math.random() * names.length)];
        const rFormat = formats[Math.floor(Math.random() * formats.length)];
        const rClasses = allClasses[Math.floor(Math.random() * allClasses.length)];
        const rSamples = Math.floor(Math.random() * 15000) + 5000;
        const rSize = Math.floor(rSamples * 0.15 + Math.random() * 500);
        const newDataset = addDataset({ name: rName, size: rSize, samples: rSamples, format: rFormat, description: `Synced from S3 bucket: ${bucketName}`, tags: ['s3', 'aws'], uploadedBy: 'system', s3Path: `s3://${bucketName}/datasets/`, splits: { train: [], test: [], inference: [] }, metadata: { classes: rClasses, resolution: '640x480', augmented: false } });
        addEvent({ modelVersion: newDataset.version, type: 'Train', details: `Dataset "${rName}" synced from S3 bucket ${bucketName}`, metadata: { bucket: bucketName, region } });
      }
    }
    setShowModal(false);
  };

  const renderConfigFields = () => {
    const cls = INPUT_CLS;
    if (formData.provider === 'AWS S3') return (
      <>
        {[{ label: 'S3 Bucket Name', key: 'bucket', placeholder: 'my-bucket-name' }, { label: 'AWS Region', key: 'region', placeholder: 'us-east-1' }, { label: 'Access Key ID', key: 'accessKey', placeholder: 'AKIA...' }, { label: 'Secret Access Key', key: 'secretKey', placeholder: '••••••••', type: 'password' }].map(({ label, key, placeholder, type }) => (
          <div key={key}>
            <label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>{label}</label>
            <input type={type || 'text'} value={formData.config[key] || ''} onChange={e => setFormData({ ...formData, config: { ...formData.config, [key]: e.target.value } })} className={cls} placeholder={placeholder} />
          </div>
        ))}
      </>
    );
    if (formData.provider === 'GCP Storage') return (
      <>
        {[{ label: 'GCP Project ID', key: 'project', placeholder: 'my-gcp-project' }, { label: 'Bucket Name', key: 'bucket', placeholder: 'my-bucket-name' }].map(({ label, key, placeholder }) => (
          <div key={key}><label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>{label}</label><input type="text" value={formData.config[key] || ''} onChange={e => setFormData({ ...formData, config: { ...formData.config, [key]: e.target.value } })} className={cls} placeholder={placeholder} /></div>
        ))}
        <div><label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>Service Account JSON</label><textarea value={formData.config.serviceAccount || ''} onChange={e => setFormData({ ...formData, config: { ...formData.config, serviceAccount: e.target.value } })} className={`${cls} h-28 resize-none font-mono text-xs`} placeholder="Paste service account JSON key..." /></div>
      </>
    );
    if (formData.provider === 'Custom ROS') return (
      <>
        {[{ label: 'ROS Master URI', key: 'masterUri', placeholder: 'http://robot-ip:11311' }, { label: 'DDS Domain ID', key: 'domainId', placeholder: '0', type: 'number' }, { label: 'Model Topic', key: 'modelTopic', placeholder: '/model/inference' }].map(({ label, key, placeholder, type }) => (
          <div key={key}><label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>{label}</label><input type={type || 'text'} value={formData.config[key] || ''} onChange={e => setFormData({ ...formData, config: { ...formData.config, [key]: e.target.value } })} className={cls} placeholder={placeholder} /></div>
        ))}
      </>
    );
    if (formData.provider === 'External Model') return (
      <>
        <div><label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>API Endpoint</label><input type="text" value={formData.config.endpoint || ''} onChange={e => setFormData({ ...formData, config: { ...formData.config, endpoint: e.target.value } })} className={cls} placeholder="https://api.example.com/models" /></div>
        <div><label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>API Key</label><input type="password" value={formData.config.apiKey || ''} onChange={e => setFormData({ ...formData, config: { ...formData.config, apiKey: e.target.value } })} className={cls} placeholder="••••••••" /></div>
        <div><label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>Model Format</label><select value={formData.config.format || 'onnx'} onChange={e => setFormData({ ...formData, config: { ...formData.config, format: e.target.value } })} className={cls}>{['onnx', 'tensorrt', 'tflite', 'custom'].map(f => <option key={f} value={f} className="bg-[#0c0c0c]">{f.toUpperCase()}</option>)}</select></div>
      </>
    );
    return null;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: 'easeOut' }}>
        {/* Header */}
        <div className={`pb-10 border-b ${BORDER} flex items-start justify-between`}>
          <div>
            <h1 className="text-4xl font-light text-white tracking-tight mb-2">Connectors</h1>
            <p className={`text-sm ${MUTED}`}>Connect cloud data sources and external model repositories</p>
          </div>
          <button onClick={() => handleOpenModal()} className={`text-sm text-white border-b ${BORDER} hover:border-white/30 pb-px transition-colors flex items-center gap-1.5`}>
            <Plus className="w-3.5 h-3.5" /> Add Connector →
          </button>
        </div>

        {/* Connectors list */}
        <div className="mt-10">
          {connectors.length === 0 ? (
            <div className={`border ${BORDER} p-12 text-center`}>
              <Plug className={`w-8 h-8 ${DIMMER} mx-auto mb-4`} />
              <p className={`text-sm ${MUTED} mb-4`}>No connectors configured</p>
              <button onClick={() => handleOpenModal()} className={`text-sm text-white border-b ${BORDER} hover:border-white/30 pb-px transition-colors`}>Add your first connector →</button>
            </div>
          ) : (
            <div className={`border ${BORDER} divide-y divide-white/[0.07]`}>
              {connectors.map((connector) => (
                <motion.div key={connector.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 py-5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`mt-0.5 ${DIMMER}`}>{getProviderIcon(connector.provider)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm text-white">{connector.name}</span>
                          <span className={`text-xs ${getStatusStyle(connector.status)} flex items-center gap-1`}>
                            <Activity className="w-2.5 h-2.5" />{connector.status}
                          </span>
                        </div>
                        <div className={`text-xs ${DIMMER} mb-2`}>{connector.provider} · {connector.type === 'dataset' ? 'Dataset Source' : 'Model Source'}</div>
                        <div className={`flex gap-4 text-xs ${DIMMER} font-mono`}>
                          {Object.entries(connector.config).slice(0, 2).map(([k, v]) => (
                            <span key={k}><span className="text-[#777]">{k}:</span> {typeof v === 'string' && v.length > 16 ? v.substring(0, 16) + '…' : String(v)}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-4 text-xs ${DIM} flex-shrink-0`}>
                      <button onClick={() => console.log('Testing', connector)} className="hover:text-white transition-colors flex items-center gap-1"><TestTube className="w-3.5 h-3.5" /> Test</button>
                      <button onClick={() => handleOpenModal(connector)} className="hover:text-white transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setConnectors(connectors.filter(c => c.id !== connector.id))} className="hover:text-white transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className={`bg-[#0c0c0c] border ${BORDER} p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-light text-white">{editingConnector ? 'Edit Connector' : 'Add Connector'}</h2>
                <button onClick={() => setShowModal(false)} className={`${DIM} hover:text-white`}><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>Connector Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={INPUT_CLS} placeholder="My AWS S3 Connection" />
                </div>
                <div>
                  <label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>Type</label>
                  <div className={`grid grid-cols-2 gap-px bg-white/[0.07] border ${BORDER}`}>
                    {['dataset', 'model'].map(t => (
                      <button key={t} onClick={() => setFormData({ ...formData, type: t as any, provider: t === 'dataset' ? 'AWS S3' : 'Custom ROS' })}
                        className={`px-4 py-3 text-sm transition-colors ${formData.type === t ? 'bg-white/[0.06] text-white' : `bg-[#0c0c0c] ${DIM} hover:text-white`}`}>
                        {t === 'dataset' ? 'Dataset Source' : 'Model Source'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>Provider</label>
                  <select value={formData.provider} onChange={e => setFormData({ ...formData, provider: e.target.value as any, config: {} })} className={INPUT_CLS}>
                    {providers[formData.type].map(p => <option key={p} value={p} className="bg-[#0c0c0c]">{p}</option>)}
                  </select>
                </div>
                <div className={`pt-2 border-t ${BORDER}`}>
                  <div className={`flex items-center gap-2 text-xs ${DIMMER} uppercase tracking-widest mb-4`}><Settings className="w-3.5 h-3.5" /> Configuration</div>
                  <div className="space-y-4">{renderConfigFields()}</div>
                </div>
                <div className={`flex gap-6 pt-4 border-t ${BORDER}`}>
                  <button onClick={() => setShowModal(false)} className={`text-sm ${DIM} hover:text-white transition-colors`}>Cancel</button>
                  <button onClick={handleSave} disabled={!formData.name} className={`text-sm text-white border-b ${BORDER} hover:border-white/30 pb-px transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}>
                    {editingConnector ? 'Update' : 'Create'} Connector →
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
