import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDatasets } from '../store/useDatasets';
import { Database, Plus, Download, Trash2, Eye, X, Upload, Tag, HardDrive, Image, Calendar, User, Sparkles, Search } from 'lucide-react';
import { formatDate, formatNumber } from '../lib/utils';

const BORDER = 'border-white/[0.07]';
const MUTED = 'text-[#c8c8c8]';
const DIM = 'text-[#999]';
const DIMMER = 'text-[#777]';

const INPUT_CLS = `w-full bg-transparent border ${BORDER} px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/20`;

export const DatasetsPage = () => {
  const navigate = useNavigate();
  const { datasets, addDataset, deleteDataset, exportDatasetInfo } = useDatasets();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', size: '', samples: '', format: 'COCO' as 'COCO' | 'YOLO' | 'TFRecord' | 'Custom',
    description: '', tags: '', uploadedBy: 'admin', classes: '', resolution: '640x480', augmented: false,
  });

  const handleCreateDataset = () => {
    addDataset({
      name: formData.name, size: parseFloat(formData.size), samples: parseInt(formData.samples),
      format: formData.format, description: formData.description,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      uploadedBy: formData.uploadedBy,
      s3Path: `s3://roboml/datasets/${formData.name.toLowerCase().replace(/\s+/g, '-')}/`,
      splits: { train: [], test: [], inference: [] },
      metadata: { classes: formData.classes.split(',').map(c => c.trim()).filter(c => c), resolution: formData.resolution, augmented: formData.augmented },
    });
    setFormData({ name: '', size: '', samples: '', format: 'COCO', description: '', tags: '', uploadedBy: 'admin', classes: '', resolution: '640x480', augmented: false });
    setShowCreateModal(false);
  };

  const handleExportDataset = (id: string) => {
    const jsonData = exportDatasetInfo(id);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ds = datasets.find(d => d.id === id);
    a.download = `${ds?.version}-${ds?.name.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const dataset = selectedDataset ? datasets.find(d => d.id === selectedDataset) : null;

  const totalSamples = datasets.reduce((s, d) => s + d.samples, 0);
  const totalSizeMB = datasets.reduce((s, d) => s + d.size, 0);
  const searchBased = datasets.filter(d => d.isSearchBased).length;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: 'easeOut' }}>
        {/* Header */}
        <div className={`pb-10 border-b ${BORDER} flex items-start justify-between`}>
          <div>
            <h1 className="text-4xl font-light text-white tracking-tight mb-2">Datasets</h1>
            <p className={`text-sm ${MUTED}`}>Manage training, validation, and test datasets</p>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/dashboard/search')} className={`text-sm ${DIM} hover:text-white transition-colors flex items-center gap-1.5`}>
              <Sparkles className="w-3.5 h-3.5" /> Curate with Search →
            </button>
            <button onClick={() => setShowCreateModal(true)} className={`text-sm text-white border-b ${BORDER} hover:border-white/30 pb-px transition-colors flex items-center gap-1.5`}>
              <Plus className="w-3.5 h-3.5" /> Upload Dataset →
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className={`grid grid-cols-4 border-b ${BORDER}`}>
          {[
            { label: 'Total Datasets', value: datasets.length, icon: Database },
            { label: 'Total Samples', value: totalSamples.toLocaleString(), icon: Image },
            { label: 'Total Size', value: `${formatNumber(totalSizeMB / 1000, 1)} GB`, icon: HardDrive },
            { label: 'Search-Based', value: searchBased, icon: Sparkles },
          ].map(({ label, value, icon: Icon }, i) => (
            <div key={label} className={`py-6 ${i < 3 ? `border-r ${BORDER}` : ''} ${i > 0 ? 'px-8' : 'pr-8'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`text-xs ${DIMMER} uppercase tracking-widest`}>{label}</div>
                <Icon className={`w-3.5 h-3.5 ${DIMMER}`} />
              </div>
              <div className="text-2xl font-light text-white">{value}</div>
            </div>
          ))}
        </div>

        {/* Datasets list */}
        <div className="mt-10">
          {datasets.length === 0 ? (
            <div className={`border ${BORDER} p-12 text-center`}>
              <Database className={`w-8 h-8 ${DIMMER} mx-auto mb-4`} />
              <p className={`text-sm ${MUTED} mb-4`}>No datasets found</p>
              <button onClick={() => setShowCreateModal(true)} className={`text-sm text-white border-b ${BORDER} hover:border-white/30 pb-px transition-colors`}>Upload your first dataset →</button>
            </div>
          ) : (
            <div className={`border ${BORDER} divide-y divide-white/[0.07]`}>
              {datasets.map((ds) => (
                <motion.div
                  key={ds.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-6 py-5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-mono text-white">{ds.version}</span>
                        {ds.isSearchBased && (
                          <span className={`flex items-center gap-1 text-xs ${DIM}`}><Sparkles className="w-3 h-3" /> Search-Based</span>
                        )}
                      </div>
                      <div className="text-base text-white font-light mb-1">{ds.name}</div>
                      <p className={`text-sm ${MUTED} line-clamp-1 mb-2`}>{ds.description}</p>
                      <div className={`flex items-center gap-5 text-xs ${DIMMER}`}>
                        <span className="flex items-center gap-1"><Image className="w-3 h-3" />{ds.samples.toLocaleString()} samples</span>
                        <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" />{formatNumber(ds.size, 0)} MB</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(ds.createdAt)}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{ds.uploadedBy}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {ds.tags.slice(0, 4).map(tag => (
                          <span key={tag} className={`flex items-center gap-1 text-xs ${DIMMER} bg-white/[0.03] px-2 py-0.5`}>
                            <Tag className="w-2.5 h-2.5" />{tag}
                          </span>
                        ))}
                        {ds.tags.length > 4 && <span className={`text-xs ${DIMMER}`}>+{ds.tags.length - 4}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <button onClick={() => navigate(`/dashboard/datasets/${ds.id}/search`)} className={`text-xs ${DIM} hover:text-white transition-colors flex items-center gap-1`}>
                        <Search className="w-3 h-3" /> Search →
                      </button>
                      <button onClick={() => { setSelectedDataset(ds.id); setShowDetailsModal(true); }} className={`text-xs ${DIM} hover:text-white transition-colors`}>
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleExportDataset(ds.id)} className={`text-xs ${DIM} hover:text-white transition-colors`}>
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteDataset(ds.id)} className={`text-xs text-[#777] hover:text-white transition-colors`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className={`bg-[#0c0c0c] border ${BORDER} p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Upload className={`w-4 h-4 ${DIMMER}`} />
                  <h2 className="text-lg font-light text-white">Upload Dataset</h2>
                </div>
                <button onClick={() => setShowCreateModal(false)} className={`${DIM} hover:text-white transition-colors`}><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-5">
                {[
                  { label: 'Dataset Name', key: 'name', placeholder: 'e.g., Robot Navigation Dataset' },
                  { label: 'Size (MB)', key: 'size', placeholder: '2500', type: 'number' },
                  { label: 'Samples', key: 'samples', placeholder: '15000', type: 'number' },
                  { label: 'Tags (comma-separated)', key: 'tags', placeholder: 'navigation, indoor, obstacles' },
                  { label: 'Classes (comma-separated)', key: 'classes', placeholder: 'obstacle, path, wall, door' },
                  { label: 'Resolution', key: 'resolution', placeholder: '640x480' },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key}>
                    <label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>{label}</label>
                    <input type={type || 'text'} value={(formData as any)[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                      className={INPUT_CLS} placeholder={placeholder} />
                  </div>
                ))}
                <div>
                  <label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>Format</label>
                  <select value={formData.format} onChange={e => setFormData({ ...formData, format: e.target.value as any })} className={INPUT_CLS}>
                    {['COCO', 'YOLO', 'TFRecord', 'Custom'].map(f => <option key={f} value={f} className="bg-[#0c0c0c]">{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className={`${INPUT_CLS} h-20 resize-none`} placeholder="Describe your dataset..." />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={formData.augmented} onChange={e => setFormData({ ...formData, augmented: e.target.checked })} className="accent-white" />
                  <span className={`text-sm ${MUTED}`}>Data augmentation applied</span>
                </div>
                <div className={`flex gap-6 pt-4 border-t ${BORDER}`}>
                  <button onClick={() => setShowCreateModal(false)} className={`text-sm ${DIM} hover:text-white transition-colors`}>Cancel</button>
                  <button onClick={handleCreateDataset} disabled={!formData.name || !formData.size || !formData.samples}
                    className={`text-sm text-white border-b ${BORDER} hover:border-white/30 pb-px transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}>
                    Create Dataset →
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && dataset && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className={`bg-[#0c0c0c] border ${BORDER} p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-light text-white">Dataset Details</h2>
                <button onClick={() => setShowDetailsModal(false)} className={`${DIM} hover:text-white`}><X className="w-4 h-4" /></button>
              </div>
              <div className={`divide-y ${BORDER.replace('border-', 'divide-')} space-y-0`}>
                {[
                  { label: 'Version', value: <span className="font-mono">{dataset.version}</span> },
                  { label: 'Name', value: dataset.name },
                  { label: 'Format', value: dataset.format },
                  { label: 'Samples', value: dataset.samples.toLocaleString() },
                  { label: 'Size', value: `${formatNumber(dataset.size, 0)} MB` },
                  { label: 'Resolution', value: dataset.metadata?.resolution },
                  { label: 'Augmented', value: dataset.metadata?.augmented ? 'Yes' : 'No' },
                  { label: 'Uploaded By', value: dataset.uploadedBy },
                  { label: 'Created', value: formatDate(dataset.createdAt) },
                ].map(({ label, value }) => (
                  <div key={label} className="py-3 flex items-baseline justify-between gap-4">
                    <span className={`text-xs ${DIMMER} uppercase tracking-widest flex-shrink-0`}>{label}</span>
                    <span className={`text-sm text-white text-right`}>{value}</span>
                  </div>
                ))}
                {dataset.s3Path && (
                  <div className="py-3">
                    <div className={`text-xs ${DIMMER} uppercase tracking-widest mb-2`}>S3 Path</div>
                    <div className={`text-xs font-mono ${MUTED} bg-white/[0.02] px-3 py-2`}>{dataset.s3Path}</div>
                  </div>
                )}
                {dataset.metadata?.classes && dataset.metadata.classes.length > 0 && (
                  <div className="py-3">
                    <div className={`text-xs ${DIMMER} uppercase tracking-widest mb-2`}>Classes</div>
                    <div className="flex flex-wrap gap-2">
                      {dataset.metadata.classes.map(cls => <span key={cls} className={`text-xs ${MUTED} bg-white/[0.03] px-2 py-0.5`}>{cls}</span>)}
                    </div>
                  </div>
                )}
              </div>
              <div className={`mt-6 pt-6 border-t ${BORDER}`}>
                <button onClick={() => handleExportDataset(dataset.id)} className={`text-sm text-white border-b ${BORDER} hover:border-white/30 pb-px transition-colors flex items-center gap-1.5`}>
                  <Download className="w-3.5 h-3.5" /> Export Dataset Info →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
