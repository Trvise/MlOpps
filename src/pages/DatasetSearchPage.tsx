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
      navigate('/dashboard/datasets');
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

  // Dynamically discover images from the public/images directory
  // Since we can't directly scan the filesystem in the browser, we'll try to discover
  // images by attempting to load them and checking which prefixes exist
  const discoverImages = async (prefix: string): Promise<string[]> => {
    const discoveredImages: string[] = [];
    const maxAttempts = 20; // Try up to 20 images per prefix
    
    // Check all images for the given prefix in parallel for better performance
    const checkPromises: Promise<{ filename: string; exists: boolean }>[] = [];
    
    for (let i = 1; i <= maxAttempts; i++) {
      const filename = `${prefix}${i}.png`;
      const imagePath = `/images/${encodeURIComponent(filename)}`;
      
      // Create a promise to check if image exists
      const checkPromise = fetch(imagePath, { method: 'HEAD' })
        .then(response => ({ filename, exists: response.ok }))
        .catch(() => ({ filename, exists: false }));
      
      checkPromises.push(checkPromise);
    }
    
    // Wait for all checks to complete
    const results = await Promise.all(checkPromises);
    
    // Filter to only include existing images
    results.forEach(({ filename, exists }) => {
      if (exists) {
        discoveredImages.push(filename);
      }
    });
    
    return discoveredImages;
  };

  // Generate search results using actual images from the images directory
  const generateImageResults = async (query: string): Promise<SearchResult[]> => {
    const results: SearchResult[] = [];
    
    // Determine which prefix to use based on search query
    // If "drop" is in the query, show images starting with "image"
    // Otherwise, show images starting with "hold"
    const queryLower = query.toLowerCase();
    const prefix = queryLower.includes('drop') ? 'image' : 'hold';
    
    // Discover only the images with the correct prefix
    const filteredImages = await discoverImages(prefix);
    
    // Only create results for images that actually exist
    filteredImages.forEach((filename, index) => {
      // In Vite, files in public/ are served from root
      // URL encode the filename to handle spaces and special characters
      const imagePath = `/images/${encodeURIComponent(filename)}`;
      
      // Generate random similarity between 0.70 and 0.98
      const randomSimilarity = (0.70 + Math.random() * 0.28).toFixed(3);
      
      results.push({
        id: `result-${index}-${Date.now()}`,
        imageUrl: imagePath,
        timestamp: index * 10, // Simulated timestamp
        metadata: {
          similarity: randomSimilarity,
          frame: index * 1000,
          filename: filename,
        },
      });
    });
    
    // Shuffle the results to randomize the order
    for (let i = results.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [results[i], results[j]] = [results[j], results[i]];
    }
    
    return results;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !dataset) return;

    setIsSearching(true);
    setSelectedResults(new Set());

    // Add delay before displaying results
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate results using actual images from the images directory
    // This will dynamically discover and filter images based on the query
    const results = await generateImageResults(searchQuery);
    console.log('Generated image results:', results.map(r => r.imageUrl));
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
            onClick={() => navigate('/dashboard/datasets')}
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
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Tag className="w-4 h-4" />
                Dataset Label
              </label>
              <input
                type="text"
                value={datasetLabel}
                onChange={(e) => setDatasetLabel(e.target.value)}
                placeholder="example: robot moving towards the container"
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
                    <div className="relative bg-slate-800 overflow-hidden" style={{ aspectRatio: '16/9', width: '100%' }}>
                      <img
                        src={result.imageUrl}
                        alt={`Search result ${result.metadata?.filename || result.id}`}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ objectPosition: 'center' }}
                        onError={(e) => {
                          console.error('Failed to load image:', result.imageUrl);
                          // Hide the image container if image fails to load
                          const container = (e.target as HTMLImageElement).closest('.relative.group');
                          if (container) {
                            (container as HTMLElement).style.display = 'none';
                          }
                        }}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center z-10">
                          <CheckCircle2 className="w-8 h-8 text-purple-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white z-10">
                        {result.metadata?.similarity ? `${(parseFloat(result.metadata.similarity) * 100).toFixed(1)}%` : 'N/A'}
                      </div>
                    </div>
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

