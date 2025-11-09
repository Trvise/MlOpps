import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDatasets } from '../store/useDatasets';
import { 
  Database, 
  Eye,
  X,
  Tag,
  Calendar,
  User,
  Sparkles,
  Search,
  ArrowLeft
} from 'lucide-react';
import { formatDate, formatNumber } from '../lib/utils';

export const CuratedDatasetsPage = () => {
  const navigate = useNavigate();
  const { datasets, deleteDataset } = useDatasets();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);

  const curatedDatasets = datasets.filter(d => d.isCurated);

  const handleViewDetails = (id: string) => {
    setSelectedDataset(id);
    setShowDetailsModal(true);
  };

  const dataset = selectedDataset ? curatedDatasets.find(d => d.id === selectedDataset) : null;

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/datasets')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Datasets
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-light text-white tracking-tight">Curated Datasets</h1>
          </div>
          <p className="text-lg text-slate-400">
            Datasets created from search results and manual curation
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Total Curated</div>
                <div className="text-3xl font-bold text-purple-400">{curatedDatasets.length}</div>
              </div>
              <Sparkles className="w-10 h-10 text-purple-900" />
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Total Samples</div>
                <div className="text-3xl font-bold text-cyan-400">
                  {curatedDatasets.reduce((sum, d) => sum + d.samples, 0).toLocaleString()}
                </div>
              </div>
              <Database className="w-10 h-10 text-cyan-900" />
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Total Size</div>
                <div className="text-3xl font-bold text-blue-400">
                  {formatNumber(curatedDatasets.reduce((sum, d) => sum + d.size, 0) / 1000, 1)} GB
                </div>
              </div>
              <Database className="w-10 h-10 text-blue-900" />
            </div>
          </div>
        </div>

        {/* Curated Datasets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {curatedDatasets.map((dataset) => (
            <motion.div
              key={dataset.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:border-purple-500/50 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="font-mono text-xs text-amber-400 mb-1">{dataset.version}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{dataset.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-purple-500/10 border border-purple-500/20 text-purple-400">
                      <Sparkles className="w-3 h-3" />
                      Curated
                    </span>
                    {dataset.curationMetadata?.label && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <Tag className="w-3 h-3" />
                        {dataset.curationMetadata.label}
                      </span>
                    )}
                  </div>
                </div>
                <Database className="w-8 h-8 text-slate-700" />
              </div>

              {/* Description */}
              <p className="text-sm text-slate-400 mb-4 line-clamp-2">{dataset.description}</p>

              {/* Curation Info */}
              {dataset.curationMetadata && (
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3 mb-4">
                  <div className="text-xs text-purple-400 mb-1">Curated from</div>
                  <div className="text-sm text-white font-mono">{dataset.curationMetadata.sourceDatasetVersion}</div>
                  {dataset.curationMetadata.searchQuery && (
                    <div className="text-xs text-slate-400 mt-2">
                      Query: "{dataset.curationMetadata.searchQuery}"
                    </div>
                  )}
                </div>
              )}

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
                  onClick={() => deleteDataset(dataset.id)}
                  className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {curatedDatasets.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
            <Sparkles className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No curated datasets yet</p>
            <p className="text-sm text-slate-500 mb-4">
              Search datasets and create curated versions to get started
            </p>
            <button
              onClick={() => navigate('/datasets')}
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Go to Datasets →
            </button>
          </div>
        )}
      </motion.div>

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
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  Curated Dataset Details
                </h2>
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

                {dataset.curationMetadata && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <div className="text-sm font-semibold text-purple-400 mb-3">Curation Information</div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-400">Source Dataset:</span>{' '}
                        <span className="text-white font-mono">{dataset.curationMetadata.sourceDatasetVersion}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Label:</span>{' '}
                        <span className="text-white">{dataset.curationMetadata.label}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Search Query:</span>{' '}
                        <span className="text-white">"{dataset.curationMetadata.searchQuery}"</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Selected Results:</span>{' '}
                        <span className="text-white">{dataset.curationMetadata.selectedResults.length} samples</span>
                      </div>
                    </div>
                  </div>
                )}

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

                <div>
                  <div className="text-xs text-slate-400 mb-1">Format</div>
                  <div className="text-white">{dataset.format}</div>
                </div>

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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

