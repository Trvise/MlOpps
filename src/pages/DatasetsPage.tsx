import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDatasets } from '../store/useDatasets';
import { 
  Database, 
  Plus, 
  Download, 
  Trash2, 
  Eye,
  X,
  Upload,
  Tag,
  HardDrive,
  Image,
  Calendar,
  User
} from 'lucide-react';
import { formatDate, formatNumber } from '../lib/utils';

export const DatasetsPage = () => {
  const { datasets, addDataset, deleteDataset, exportDatasetInfo } = useDatasets();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'All' | 'Training' | 'Validation' | 'Test'>('All');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'Training' as 'Training' | 'Validation' | 'Test',
    size: '',
    samples: '',
    format: 'COCO' as 'COCO' | 'YOLO' | 'TFRecord' | 'Custom',
    description: '',
    tags: '',
    uploadedBy: 'admin',
    classes: '',
    resolution: '640x480',
    augmented: false,
  });

  const filteredDatasets = filterType === 'All' 
    ? datasets 
    : datasets.filter(d => d.type === filterType);

  const handleCreateDataset = () => {
    const newDataset = addDataset({
      name: formData.name,
      type: formData.type,
      size: parseFloat(formData.size),
      samples: parseInt(formData.samples),
      format: formData.format,
      description: formData.description,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      uploadedBy: formData.uploadedBy,
      s3Path: `s3://roboml/datasets/${formData.name.toLowerCase().replace(/\s+/g, '-')}/`,
      metadata: {
        classes: formData.classes.split(',').map(c => c.trim()).filter(c => c),
        resolution: formData.resolution,
        augmented: formData.augmented,
      },
    });

    // Reset form
    setFormData({
      name: '',
      type: 'Training',
      size: '',
      samples: '',
      format: 'COCO',
      description: '',
      tags: '',
      uploadedBy: 'admin',
      classes: '',
      resolution: '640x480',
      augmented: false,
    });
    setShowCreateModal(false);
  };

  const handleExportDataset = (id: string) => {
    const jsonData = exportDatasetInfo(id);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dataset = datasets.find(d => d.id === id);
    a.download = `${dataset?.version}-${dataset?.name.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleViewDetails = (id: string) => {
    setSelectedDataset(id);
    setShowDetailsModal(true);
  };

  const dataset = selectedDataset ? datasets.find(d => d.id === selectedDataset) : null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Training':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'Validation':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
      case 'Test':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      default:
        return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
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
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-light text-white mb-3 tracking-tight flex items-center gap-3">
              <Database className="w-8 h-8 text-amber-400" />
              Datasets
            </h1>
            <p className="text-lg text-slate-400">Manage training, validation, and test datasets</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            <Plus className="w-5 h-5" />
            Upload Dataset
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Total Datasets</div>
                <div className="text-3xl font-bold text-white">{datasets.length}</div>
              </div>
              <Database className="w-10 h-10 text-slate-700" />
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Total Samples</div>
                <div className="text-3xl font-bold text-cyan-400">
                  {datasets.reduce((sum, d) => sum + d.samples, 0).toLocaleString()}
                </div>
              </div>
              <Image className="w-10 h-10 text-cyan-900" />
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Total Size</div>
                <div className="text-3xl font-bold text-blue-400">
                  {formatNumber(datasets.reduce((sum, d) => sum + d.size, 0) / 1000, 1)} GB
                </div>
              </div>
              <HardDrive className="w-10 h-10 text-blue-900" />
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Training Sets</div>
                <div className="text-3xl font-bold text-green-400">
                  {datasets.filter(d => d.type === 'Training').length}
                </div>
              </div>
              <Upload className="w-10 h-10 text-green-900" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Filter by type:</span>
            {(['All', 'Training', 'Validation', 'Test'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-normal transition-all ${
                  filterType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-700/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Datasets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDatasets.map((dataset) => (
            <motion.div
              key={dataset.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:border-slate-700/50 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="font-mono text-xs text-amber-400 mb-1">{dataset.version}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{dataset.name}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getTypeColor(dataset.type)}`}>
                    {dataset.type}
                  </span>
                </div>
                <Database className="w-8 h-8 text-slate-700" />
              </div>

              {/* Description */}
              <p className="text-sm text-slate-400 mb-4 line-clamp-2">{dataset.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Samples</div>
                  <div className="text-lg font-bold text-white">{dataset.samples.toLocaleString()}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Size</div>
                  <div className="text-lg font-bold text-white">{formatNumber(dataset.size, 0)} MB</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {dataset.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
                {dataset.tags.length > 3 && (
                  <span className="text-xs text-slate-500">+{dataset.tags.length - 3}</span>
                )}
              </div>

              {/* Meta Info */}
              <div className="text-xs text-slate-500 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(dataset.createdAt)}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  {dataset.uploadedBy}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetails(dataset.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handleExportDataset(dataset.id)}
                  className="flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteDataset(dataset.id)}
                  className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDatasets.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
            <Database className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No datasets found for {filterType}</p>
          </div>
        )}
      </motion.div>

      {/* Create Dataset Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
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
                  <Upload className="w-6 h-6 text-amber-400" />
                  Upload New Dataset
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Dataset Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Robot Navigation Dataset"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Training">Training</option>
                      <option value="Validation">Validation</option>
                      <option value="Test">Test</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Format</label>
                    <select
                      value={formData.format}
                      onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="COCO">COCO</option>
                      <option value="YOLO">YOLO</option>
                      <option value="TFRecord">TFRecord</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Size (MB)</label>
                    <input
                      type="number"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                      placeholder="2500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Samples</label>
                    <input
                      type="number"
                      value={formData.samples}
                      onChange={(e) => setFormData({ ...formData, samples: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                      placeholder="15000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 h-24"
                    placeholder="Describe your dataset..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="navigation, indoor, obstacles"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Classes (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.classes}
                    onChange={(e) => setFormData({ ...formData, classes: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="obstacle, path, wall, door"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Resolution</label>
                    <input
                      type="text"
                      value={formData.resolution}
                      onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                      placeholder="640x480"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Augmented</label>
                    <div className="flex items-center h-[42px]">
                      <input
                        type="checkbox"
                        checked={formData.augmented}
                        onChange={(e) => setFormData({ ...formData, augmented: e.target.checked })}
                        className="w-5 h-5 text-blue-500 border-slate-600 rounded focus:ring-blue-500 focus:ring-offset-slate-800"
                      />
                      <span className="ml-2 text-sm text-slate-300">Data augmentation applied</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateDataset}
                    disabled={!formData.name || !formData.size || !formData.samples}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Dataset
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Dataset Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Version</div>
                  <div className="font-mono text-amber-400">{dataset.version}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-1">Name</div>
                  <div className="text-white font-semibold">{dataset.name}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-1">Description</div>
                  <div className="text-slate-300">{dataset.description}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Type</div>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getTypeColor(dataset.type)}`}>
                      {dataset.type}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Format</div>
                    <div className="text-white">{dataset.format}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Samples</div>
                    <div className="text-white font-semibold">{dataset.samples.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Size</div>
                    <div className="text-white font-semibold">{formatNumber(dataset.size, 0)} MB</div>
                  </div>
                </div>

                {dataset.s3Path && (
                  <div>
                    <div className="text-xs text-slate-400 mb-1">S3 Path</div>
                    <div className="font-mono text-sm text-slate-300 bg-slate-800 px-3 py-2 rounded">{dataset.s3Path}</div>
                  </div>
                )}

                {dataset.metadata && (
                  <>
                    {dataset.metadata.classes && (
                      <div>
                        <div className="text-xs text-slate-400 mb-2">Classes</div>
                        <div className="flex flex-wrap gap-2">
                          {dataset.metadata.classes.map((cls) => (
                            <span key={cls} className="px-2 py-1 bg-slate-800 rounded text-xs text-white">
                              {cls}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Resolution</div>
                        <div className="text-white">{dataset.metadata.resolution}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Augmented</div>
                        <div className="text-white">{dataset.metadata.augmented ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <div className="text-xs text-slate-400 mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {dataset.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Created</div>
                    <div className="text-white">{formatDate(dataset.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Uploaded By</div>
                    <div className="text-white">{dataset.uploadedBy}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleExportDataset(dataset.id)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20"
                >
                  <Download className="w-5 h-5" />
                  Export Dataset Info
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

