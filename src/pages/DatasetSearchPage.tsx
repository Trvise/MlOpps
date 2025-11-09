import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDatasets } from '../store/useDatasets';
import { useHistory } from '../store/useHistory';
import { formatNumber } from '../lib/utils';
import { Search, ArrowLeft, Database, Tag, Plus, CheckCircle2 } from 'lucide-react';

interface SearchResult {
  id: string;
  imageUrl: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}

export const DatasetSearchPage = () => {
  const { datasetId } = useParams<{ datasetId: string }>();
  const navigate = useNavigate();
  const { getDataset, addDataset } = useDatasets();
  const { addEvent } = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [datasetLabel, setDatasetLabel] = useState('');
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [createdDatasetName, setCreatedDatasetName] = useState('');
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const dataset = datasetId ? getDataset(datasetId) : null;

  useEffect(() => {
    if (datasetId && !dataset) {
      // Dataset not found, redirect back to datasets page
      navigate('/datasets');
    }
  }, [datasetId, dataset, navigate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  if (!dataset) {
    return (
      <div className="p-8">
        <div className="text-center text-slate-400">Dataset not found</div>
      </div>
    );
  }

  // Generate random placeholder images
  const generateRandomImages = (count: number): SearchResult[] => {
    const results: SearchResult[] = [];
    for (let i = 0; i < count; i++) {
      // Using placeholder image service - in future, these will come from actual files
      const width = 400 + Math.floor(Math.random() * 200);
      const height = 300 + Math.floor(Math.random() * 200);
      results.push({
        id: `result-${i}-${Date.now()}`,
        imageUrl: `https://picsum.photos/seed/${dataset?.id}-${i}-${Date.now()}/${width}/${height}`,
        timestamp: Math.random() * 1000,
        metadata: {
          similarity: (0.9 - i * 0.05).toFixed(3),
          frame: Math.floor(Math.random() * 10000),
        },
      });
    }
    return results;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !dataset) return;

    setIsSearching(true);
    setSelectedResults(new Set());

    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate random images (in future, this will read from actual files)
    const results = generateRandomImages(12);
    setSearchResults(results);
    setIsSearching(false);
  };

  const toggleSelectResult = (resultId: string) => {
    const newSelected = new Set(selectedResults);
    if (newSelected.has(resultId)) {
      newSelected.delete(resultId);
    } else {
      newSelected.add(resultId);
    }
    setSelectedResults(newSelected);
  };

  const selectAllResults = () => {
    setSelectedResults(new Set(searchResults.map(r => r.id)));
  };

  const clearSelection = () => {
    setSelectedResults(new Set());
  };

  const handleCreateCuratedDataset = () => {
    if (!dataset || !datasetLabel.trim()) {
      alert('Please provide a label for the curated dataset');
      return;
    }

    if (selectedResults.size === 0) {
      alert('Please select at least one result to include in the curated dataset');
      return;
    }

    const selectedResultData = searchResults.filter(r => selectedResults.has(r.id));
    
    // Create curated dataset
    const curatedDataset = addDataset({
      name: `${dataset.name} - ${datasetLabel}`,
      size: selectedResultData.length * 0.5, // Estimate size
      samples: selectedResultData.length,
      format: dataset.format,
      description: `Curated dataset from "${dataset.name}" (${dataset.version}). Label: "${datasetLabel}". Search query: "${searchQuery}"`,
      tags: [...dataset.tags, 'curated', datasetLabel.toLowerCase().replace(/\s+/g, '-')],
      uploadedBy: 'system',
      s3Path: dataset.s3Path,
      splits: {
        train: [],
        test: [],
        inference: [],
      },
      metadata: {
        ...dataset.metadata,
        curatedFrom: dataset.version,
        curationLabel: datasetLabel,
        searchQuery: searchQuery,
        curatedSamples: selectedResultData.length,
      },
      isCurated: true,
      curationMetadata: {
        sourceDatasetId: dataset.id,
        sourceDatasetVersion: dataset.version,
        label: datasetLabel,
        searchQuery: searchQuery,
        selectedResults: selectedResultData.map(r => ({
          id: r.id,
          timestamp: r.timestamp,
          metadata: r.metadata,
        })),
      },
    });

    // Add history event
    addEvent({
      modelVersion: curatedDataset.version,
      type: 'Train',
      details: `Created curated dataset "${curatedDataset.name}" (${curatedDataset.version}) with ${selectedResultData.length} samples from "${dataset.name}"`,
      metadata: {
        sourceDataset: dataset.version,
        label: datasetLabel,
        searchQuery: searchQuery,
        samples: selectedResultData.length,
      },
    });

    // Show success toast
    setCreatedDatasetName(curatedDataset.name);
    setShowSuccessToast(true);
    
    // Clear any existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    
    // Auto-dismiss toast after 5 seconds
    toastTimeoutRef.current = setTimeout(() => {
      setShowSuccessToast(false);
      toastTimeoutRef.current = null;
    }, 5000);

    // Reset
    setSearchResults([]);
    setSelectedResults(new Set());
    setDatasetLabel('');
    setSearchQuery('');
  };

  return (
    <div className="p-8">
      {/* Success Toast Notification */}
      {showSuccessToast && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
        >
          <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-lg p-4 shadow-xl flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-green-400 font-medium">Dataset Created Successfully</div>
              <div className="text-sm text-slate-400 mt-1">
                {createdDatasetName} has been added to your datasets
              </div>
            </div>
            <button
              onClick={() => {
                if (toastTimeoutRef.current) {
                  clearTimeout(toastTimeoutRef.current);
                  toastTimeoutRef.current = null;
                }
                setShowSuccessToast(false);
              }}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Close notification"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/datasets')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Datasets
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="font-mono text-xs text-amber-400 mb-1">{dataset.version}</div>
              <h1 className="text-3xl font-light text-white tracking-tight">{dataset.name}</h1>
            </div>
          </div>
          
          <p className="text-slate-400 text-lg ml-16">{dataset.description}</p>
        </div>

        {/* Search Section */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-8 max-w-4xl">
          <div className="mb-6">
            <h2 className="text-xl font-medium text-white mb-2 flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-400" />
              Search Dataset
            </h2>
            <p className="text-sm text-slate-400">
              Search through {dataset.samples.toLocaleString()} samples in this dataset
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter your search query (e.g., 'car at 50 kmph', 'high speed vehicle')..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={!searchQuery.trim() || isSearching}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </form>

          {/* Dataset Label Input */}
          {searchResults.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-800">
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Dataset Label
              </label>
              <input
                type="text"
                value={datasetLabel}
                onChange={(e) => setDatasetLabel(e.target.value)}
                placeholder="e.g., robot doing a mistake when picking up stuff"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <p className="text-xs text-slate-500 mt-2">
                Label this curated dataset to describe the selected results
              </p>
            </div>
          )}

          {/* Dataset Info */}
          <div className="mt-8 pt-8 border-t border-slate-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-slate-400 mb-1">Samples</div>
                <div className="text-white font-semibold">{dataset.samples.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-400 mb-1">Format</div>
                <div className="text-white font-semibold">{dataset.format}</div>
              </div>
              <div>
                <div className="text-slate-400 mb-1">Size</div>
                <div className="text-white font-semibold">{formatNumber(dataset.size / 1000, 1)} GB</div>
              </div>
              <div>
                <div className="text-slate-400 mb-1">Version</div>
                <div className="text-amber-400 font-mono font-semibold">{dataset.version}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-medium text-white mb-2">
                  Search Results ({searchResults.length})
                </h2>
                <p className="text-sm text-slate-400">
                  {selectedResults.size} of {searchResults.length} selected
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={selectAllResults}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-all"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-all"
                >
                  Clear
                </button>
                <button
                  onClick={handleCreateCuratedDataset}
                  disabled={!datasetLabel.trim() || selectedResults.size === 0}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Dataset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map((result) => {
                const isSelected = selectedResults.has(result.id);
                return (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected
                        ? 'border-purple-500 ring-2 ring-purple-500/50'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                    onClick={() => toggleSelectResult(result.id)}
                  >
                    <div className="aspect-video bg-slate-800 relative">
                      <img
                        src={result.imageUrl}
                        alt="Search result"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback if image fails to load
                          (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300/1e293b/64748b?text=Image+${result.id.slice(-4)}`;
                        }}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-purple-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                        {result.metadata?.similarity ? `${(parseFloat(result.metadata.similarity) * 100).toFixed(1)}%` : 'N/A'}
                      </div>
                    </div>
                    {result.metadata?.frame && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <div className="text-xs text-white">Frame: {result.metadata.frame}</div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

