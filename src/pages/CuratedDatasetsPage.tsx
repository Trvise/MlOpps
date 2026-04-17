import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDatasets } from '../store/useDatasets';
import { Database, Eye, X, Tag, Calendar, User, Sparkles, ArrowLeft } from 'lucide-react';
import { formatDate, formatNumber } from '../lib/utils';

const BORDER = 'border-white/[0.07]';
const MUTED = 'text-[#c8c8c8]';
const DIM = 'text-[#999]';
const DIMMER = 'text-[#777]';

export const CuratedDatasetsPage = () => {
  const navigate = useNavigate();
  const { datasets, deleteDataset } = useDatasets();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);

  const curatedDatasets = datasets.filter(d => d.isCurated);
  const dataset = selectedDataset ? curatedDatasets.find(d => d.id === selectedDataset) : null;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full overflow-x-hidden md:overflow-visible">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: 'easeOut' }}>
        {/* Header */}
        <div className={`pb-10 border-b ${BORDER}`}>
          <button onClick={() => navigate('/dashboard/datasets')} className={`flex items-center gap-1.5 text-xs ${DIM} hover:text-white transition-colors mb-6`}>
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Datasets
          </button>
          <h1 className="text-4xl font-light text-white tracking-tight mb-2">Curated Datasets</h1>
          <p className={`text-sm ${MUTED}`}>Datasets created from search results and manual curation</p>
        </div>

        {/* Stats Strip */}
        <div className={`grid grid-cols-3 border-b ${BORDER}`}>
          {[
            { label: 'Total Curated', value: curatedDatasets.length },
            { label: 'Total Samples', value: curatedDatasets.reduce((s, d) => s + d.samples, 0).toLocaleString() },
            { label: 'Total Size', value: `${formatNumber(curatedDatasets.reduce((s, d) => s + d.size, 0) / 1000, 1)} GB` },
          ].map(({ label, value }, i) => (
            <div key={label} className={`py-6 ${i < 2 ? `border-r ${BORDER}` : ''} ${i > 0 ? 'px-8' : 'pr-8'}`}>
              <div className={`text-xs ${DIMMER} uppercase tracking-widest mb-2`}>{label}</div>
              <div className="text-2xl font-light text-white">{value}</div>
            </div>
          ))}
        </div>

        {/* List */}
        <div className="mt-10">
          {curatedDatasets.length === 0 ? (
            <div className={`border ${BORDER} p-12 text-center`}>
              <Sparkles className={`w-8 h-8 ${DIMMER} mx-auto mb-4`} />
              <p className={`text-sm ${MUTED} mb-2`}>No curated datasets yet</p>
              <p className={`text-xs ${DIM} mb-4`}>Search datasets and create curated versions to get started</p>
              <button onClick={() => navigate('/dashboard/datasets')} className={`text-sm text-white border-b ${BORDER} hover:border-white/30 pb-px transition-colors`}>Go to Datasets →</button>
            </div>
          ) : (
            <div className={`border ${BORDER} divide-y divide-white/[0.07]`}>
              {curatedDatasets.map((ds) => (
                <motion.div key={ds.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 py-5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-mono text-white">{ds.version}</span>
                        <span className={`flex items-center gap-1 text-xs ${DIM}`}><Sparkles className="w-3 h-3" /> Curated</span>
                        {ds.curationMetadata?.label && <span className={`text-xs ${DIM} bg-white/[0.03] px-2 py-0.5`}>{ds.curationMetadata.label}</span>}
                      </div>
                      <div className="text-base text-white font-light mb-1">{ds.name}</div>
                      <p className={`text-sm ${MUTED} line-clamp-1 mb-2`}>{ds.description}</p>
                      {ds.curationMetadata && (
                        <div className={`text-xs ${DIMMER} mb-2`}>
                          Source: <span className="font-mono">{ds.curationMetadata.sourceDatasetVersion}</span>
                          {ds.curationMetadata.searchQuery && <> · "{ds.curationMetadata.searchQuery}"</>}
                          {ds.curationMetadata.selectedResults && <> · {ds.curationMetadata.selectedResults.length} samples</>}
                        </div>
                      )}
                      <div className={`flex items-center gap-5 text-xs ${DIMMER}`}>
                        <span className="flex items-center gap-1"><Database className="w-3 h-3" />{ds.samples.toLocaleString()} samples</span>
                        <span>{formatNumber(ds.size, 0)} MB</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(ds.createdAt)}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{ds.uploadedBy}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {ds.tags.slice(0, 4).map(tag => (
                          <span key={tag} className={`flex items-center gap-1 text-xs ${DIMMER} bg-white/[0.03] px-2 py-0.5`}><Tag className="w-2.5 h-2.5" />{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <button onClick={() => { setSelectedDataset(ds.id); setShowDetailsModal(true); }} className={`text-xs ${DIM} hover:text-white transition-colors flex items-center gap-1`}><Eye className="w-3.5 h-3.5" /> View</button>
                      <button onClick={() => deleteDataset(ds.id)} className={`text-xs text-[#777] hover:text-white transition-colors`}>Delete</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showDetailsModal && dataset && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className={`bg-[#0c0c0c] border ${BORDER} p-8 max-w-md w-full max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-light text-white">Curated Dataset Details</h2>
                <button onClick={() => setShowDetailsModal(false)} className={`${DIM} hover:text-white`}><X className="w-4 h-4" /></button>
              </div>
              <div className={`divide-y divide-white/[0.07]`}>
                {[
                  { label: 'Version', value: <span className="font-mono">{dataset.version}</span> },
                  { label: 'Name', value: dataset.name },
                  { label: 'Format', value: dataset.format },
                  { label: 'Samples', value: dataset.samples.toLocaleString() },
                  { label: 'Size', value: `${formatNumber(dataset.size, 0)} MB` },
                  { label: 'Created', value: formatDate(dataset.createdAt) },
                  { label: 'Uploaded By', value: dataset.uploadedBy },
                ].map(({ label, value }) => (
                  <div key={label} className="py-3 flex items-baseline justify-between gap-4">
                    <span className={`text-xs ${DIMMER} uppercase tracking-widest flex-shrink-0`}>{label}</span>
                    <span className="text-sm text-white text-right">{value}</span>
                  </div>
                ))}
                {dataset.curationMetadata && (
                  <div className="py-4">
                    <div className={`text-xs ${DIMMER} uppercase tracking-widest mb-3`}>Curation Info</div>
                    <div className={`space-y-1.5 text-sm ${MUTED}`}>
                      <div>Source: <span className="text-white font-mono">{dataset.curationMetadata.sourceDatasetVersion}</span></div>
                      <div>Label: <span className="text-white">{dataset.curationMetadata.label}</span></div>
                      {dataset.curationMetadata.searchQuery && <div>Query: "<span className="text-white">{dataset.curationMetadata.searchQuery}</span>"</div>}
                      {dataset.curationMetadata.selectedResults && <div>Results: <span className="text-white">{dataset.curationMetadata.selectedResults.length} samples</span></div>}
                    </div>
                  </div>
                )}
                {dataset.tags.length > 0 && (
                  <div className="py-4">
                    <div className={`text-xs ${DIMMER} uppercase tracking-widest mb-2`}>Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {dataset.tags.map(t => <span key={t} className={`flex items-center gap-1 text-xs ${MUTED} bg-white/[0.03] px-2 py-0.5`}><Tag className="w-2.5 h-2.5" />{t}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
