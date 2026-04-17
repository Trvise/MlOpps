import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDatasets, SearchInstance } from '../store/useDatasets';
import { useHistory } from '../store/useHistory';
import { Search, Upload, Play, CheckCircle2, Loader, FileVideo, FileSpreadsheet, Sparkles } from 'lucide-react';
import {
  uploadVideo,
  uploadCsv,
  startTokenization,
  getTokenizationStatus,
  initializeSearchSystem,
  performSearch,
  SearchResult,
  QueryDecomposition,
} from '../utils/searchApi';

export const SearchDatasetPage = () => {
  const { createSearchDatasetWithSplits, datasets, updateDataset } = useDatasets();
  const { addEvent } = useHistory();

  const [step, setStep] = useState<'upload' | 'tokenize' | 'search' | 'curate'>('upload');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [csvInfo, setCsvInfo] = useState<any>(null);
  const [tokenizationProgress, setTokenizationProgress] = useState(0);
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [skipFrames, setSkipFrames] = useState('30');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [decomposition, setDecomposition] = useState<QueryDecomposition | null>(null);
  const [selectedInstances, setSelectedInstances] = useState<Set<number>>(new Set());
  const [datasetMode, setDatasetMode] = useState<'new' | 'existing'>('new');
  const [datasetName, setDatasetName] = useState('');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [customDescription, setCustomDescription] = useState('');
  const [customTags, setCustomTags] = useState('');
  // Track which instances are assigned to which split
  const [splitAssignments, setSplitAssignments] = useState<{
    train: Set<number>;
    test: Set<number>;
    inference: Set<number>;
  }>({
    train: new Set(),
    test: new Set(),
    inference: new Set(),
  });

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    const result = await uploadVideo(file);
    setVideoInfo(result.info);
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const result = await uploadCsv(file);
    setCsvInfo(result.info);
  };

  const handleTokenize = async () => {
    if (!videoFile) return;

    setIsTokenizing(true);
    setStep('tokenize');

    await startTokenization(parseInt(skipFrames));

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setTokenizationProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsTokenizing(false);
        const status = getTokenizationStatus();
        if (status.status === 'complete') {
          // Auto-initialize search system after tokenization
          initializeSearchSystem().then((initResult) => {
            if (initResult.success) {
              setStep('search');
            }
          });
        }
      }
    }, 500);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const result = await performSearch(searchQuery, 20);

    if (result.success) {
      setDecomposition(result.decomposition);
      setSearchResults(result.results);
      setSelectedInstances(new Set(result.results.map((_, i) => i)));
      setIsSearching(false);
      setStep('curate');
      // Reset split assignments for new search
      setSplitAssignments({
        train: new Set(),
        test: new Set(),
        inference: new Set(),
      });
    }
  };

  const assignSelectedToSplit = (split: 'train' | 'test' | 'inference') => {
    setSplitAssignments(prev => {
      const newAssignments = { ...prev };
      // Remove from other splits
      newAssignments.train = new Set(prev.train);
      newAssignments.test = new Set(prev.test);
      newAssignments.inference = new Set(prev.inference);
      
      // Remove from other splits first
      selectedInstances.forEach(idx => {
        newAssignments.train.delete(idx);
        newAssignments.test.delete(idx);
        newAssignments.inference.delete(idx);
      });
      
      // Add to selected split
      selectedInstances.forEach(idx => {
        newAssignments[split].add(idx);
      });
      
      return newAssignments;
    });
  };

  const handleCreateDataset = () => {
    if (!videoFile || !csvFile) return;
    
    // Check if we have any instances assigned to splits
    const totalAssigned = splitAssignments.train.size + splitAssignments.test.size + splitAssignments.inference.size;
    if (totalAssigned === 0) {
      alert('Please assign instances to at least one split (train, test, or inference)');
      return;
    }
    
    if (datasetMode === 'new' && !datasetName.trim()) return;
    if (datasetMode === 'existing' && !selectedDatasetId) return;

    // Get all instances mapped by index
    const allInstances: SearchInstance[] = searchResults.map((r) => ({
      timestamp: r.timestamp,
      similarity: r.similarity,
      dataValues: r.dataValues,
      matchedCriteria: r.matchedCriteria,
      visualQuery: r.visualQuery,
    }));

    // Get instances for each split
    const trainInstances = Array.from(splitAssignments.train).map(idx => allInstances[idx]);
    const testInstances = Array.from(splitAssignments.test).map(idx => allInstances[idx]);
    const inferenceInstances = Array.from(splitAssignments.inference).map(idx => allInstances[idx]);

    if (datasetMode === 'new') {
      const description = customDescription.trim() || undefined;
      const tags = customTags.trim() 
        ? customTags.split(',').map(t => t.trim()).filter(t => t)
        : undefined;
      
      // Create dataset with all splits
      const dataset = createSearchDatasetWithSplits(
        datasetName,
        searchQuery,
        trainInstances,
        testInstances,
        inferenceInstances,
        videoFile.name,
        csvFile.name,
        {
          skipFrames: parseInt(skipFrames),
        },
        description,
        tags
      );

      addEvent({
        modelVersion: dataset.version,
        type: 'Train',
        details: `Created curated dataset "${datasetName}" with ${trainInstances.length} train, ${testInstances.length} test, ${inferenceInstances.length} inference instances`,
        metadata: {
          searchQuery,
          trainInstances: trainInstances.length,
          testInstances: testInstances.length,
          inferenceInstances: inferenceInstances.length,
          sourceVideo: videoFile.name,
          sourceCsv: csvFile.name,
        },
      });

      alert(`Dataset ${dataset.version} created successfully!\nTrain: ${trainInstances.length}\nTest: ${testInstances.length}\nInference: ${inferenceInstances.length}`);
    } else {
      // Add to existing dataset
      const existingDataset = datasets.find(d => d.id === selectedDatasetId);
      if (!existingDataset) {
        alert('Selected dataset not found');
        return;
      }

      // Ensure splits exist
      const currentSplits = existingDataset.splits || {
        train: [],
        test: [],
        inference: [],
      };

      // Add instances to each split
      const updatedSplits = {
        train: [...(currentSplits.train || []), ...trainInstances],
        test: [...(currentSplits.test || []), ...testInstances],
        inference: [...(currentSplits.inference || []), ...inferenceInstances],
      };

      // Calculate total samples across all splits
      const totalSamples = updatedSplits.train.length + updatedSplits.test.length + updatedSplits.inference.length;

      updateDataset(selectedDatasetId, {
        splits: updatedSplits,
        searchInstances: [...updatedSplits.train, ...updatedSplits.test, ...updatedSplits.inference],
        samples: totalSamples,
        size: totalSamples * 0.5,
      });

      addEvent({
        modelVersion: existingDataset.version,
        type: 'Train',
        details: `Added instances to dataset "${existingDataset.name}": ${trainInstances.length} train, ${testInstances.length} test, ${inferenceInstances.length} inference`,
        metadata: {
          searchQuery,
          trainAdded: trainInstances.length,
          testAdded: testInstances.length,
          inferenceAdded: inferenceInstances.length,
          totalInstances: totalSamples,
          sourceVideo: videoFile.name,
          sourceCsv: csvFile.name,
        },
      });

      alert(`Added instances to dataset "${existingDataset.name}"!\nTrain: +${trainInstances.length}\nTest: +${testInstances.length}\nInference: +${inferenceInstances.length}\nTotal: ${totalSamples} instances`);
    }

    // Reset
    setStep('upload');
    setVideoFile(null);
    setCsvFile(null);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedInstances(new Set());
    setDatasetName('');
    setDatasetMode('new');
    setSelectedDatasetId('');
    setCustomDescription('');
    setCustomTags('');
    setSplitAssignments({
      train: new Set(),
      test: new Set(),
      inference: new Set(),
    });
  };

  const toggleInstance = (index: number) => {
    const newSelected = new Set(selectedInstances);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedInstances(newSelected);
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
            <Sparkles className="w-8 h-8 text-purple-400" />
            Agentic Dataset Curation
          </h1>
          <p className="text-lg text-[#c8c8c8]">
            Upload video & CSV, tokenize with CLIP, search for training instances, and create curated datasets
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-between max-w-4xl">
          {[
            { key: 'upload', label: 'Upload', icon: Upload },
            { key: 'tokenize', label: 'Tokenize', icon: Play },
            { key: 'search', label: 'Search', icon: Search },
            { key: 'curate', label: 'Curate', icon: CheckCircle2 },
          ].map((stepItem, index) => {
            const Icon = stepItem.icon;
            const isActive = step === stepItem.key;
            const isCompleted = ['upload', 'tokenize', 'search', 'curate'].indexOf(step) > index;

            return (
              <div key={stepItem.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-white/[0.04] text-[#c8c8c8]'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-sm mt-2 ${isActive ? 'text-white' : 'text-[#c8c8c8]'}`}>
                    {stepItem.label}
                  </span>
                </div>
                {index < 3 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-white/[0.04]'}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-transparent border border-white/[0.07] p-8">
                <h2 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
                  <FileVideo className="w-5 h-5" />
                  Upload Video
                </h2>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-white/[0.07] rounded-sm p-12 cursor-pointer hover:border-purple-500 transition-colors"
                >
                  {videoFile ? (
                    <>
                      <CheckCircle2 className="w-12 h-12 text-green-400 mb-4" />
                      <span className="text-white font-medium">{videoFile.name}</span>
                      {videoInfo && (
                        <span className="text-sm text-[#c8c8c8] mt-2">
                          {videoInfo.duration.toFixed(1)}s • {videoInfo.width}x{videoInfo.height} • {videoInfo.fps.toFixed(1)} FPS
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-[#999] mb-4" />
                      <span className="text-[#c8c8c8]">Click to upload video</span>
                      <span className="text-xs text-[#999] mt-2">MP4, AVI, MOV, etc.</span>
                    </>
                  )}
                </label>
              </div>

              <div className="bg-transparent border border-white/[0.07] p-8">
                <h2 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  Upload CSV Data
                </h2>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-white/[0.07] rounded-sm p-12 cursor-pointer hover:border-purple-500 transition-colors"
                >
                  {csvFile ? (
                    <>
                      <CheckCircle2 className="w-12 h-12 text-green-400 mb-4" />
                      <span className="text-white font-medium">{csvFile.name}</span>
                      {csvInfo && (
                        <span className="text-sm text-[#c8c8c8] mt-2">
                          {csvInfo.rows.toLocaleString()} rows • {csvInfo.columnCount} columns
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-[#999] mb-4" />
                      <span className="text-[#c8c8c8]">Click to upload CSV</span>
                      <span className="text-xs text-[#999] mt-2">Must include timestamp column</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Continue Button */}
            {videoFile && csvFile && (
              <div className="flex justify-center">
                <button
                  onClick={() => setStep('tokenize')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-sm font-medium transition-all flex items-center gap-2"
                >
                  Continue to Tokenization
                  <Play className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Tokenize */}
        {step === 'tokenize' && (
          <div className="bg-transparent border border-white/[0.07] p-8 max-w-2xl">
            <h2 className="text-xl font-medium text-white mb-6">Tokenize Video</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Frame Skip Interval
                </label>
                <input
                  type="number"
                  value={skipFrames}
                  onChange={(e) => setSkipFrames(e.target.value)}
                  disabled={isTokenizing}
                  className="w-full bg-white/[0.04] border border-white/[0.07] rounded-sm px-4 py-2 text-white"
                  placeholder="30 (1 frame per second at 30fps)"
                />
                <p className="text-xs text-[#999] mt-2">
                  Lower values = more frames = better search but slower processing
                </p>
              </div>

              {isTokenizing ? (
                <div className="space-y-4">
                  <div className="bg-white/[0.04] rounded-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white">Processing frames...</span>
                      <span className="text-sm text-purple-400">{tokenizationProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${tokenizationProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleTokenize}
                  disabled={!videoFile}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className="w-5 h-5" />
                  Start Tokenization
                </button>
              )}

              {tokenizationProgress === 100 && !isTokenizing && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-sm p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div>
                    <div className="text-blue-400 font-medium">Tokenization Complete!</div>
                    <div className="text-sm text-[#c8c8c8]">Search system ready. Proceeding to search...</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Search */}
        {step === 'search' && (
          <div className="bg-transparent border border-white/[0.07] p-8 max-w-4xl">
            <h2 className="text-xl font-medium text-white mb-6">Agentic Search</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Natural Language Query
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isSearching && handleSearch()}
                  disabled={isSearching}
                  className="w-full bg-white/[0.04] border border-white/[0.07] rounded-sm px-4 py-3 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g., car at 50 kmph with acceleration over 10 m/s²"
                />
                <p className="text-xs text-[#999] mt-2">
                  Examples: "vehicle with speed greater than 100", "manufacturing scene at 10 kmph"
                </p>
              </div>

              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search
                  </>
                )}
              </button>

              {decomposition && (
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-sm p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Query Decomposition</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-purple-400">Visual:</span>{' '}
                      <span className="text-white">{decomposition.visualQuery}</span>
                    </div>
                    <div>
                      <span className="text-purple-400">Data Criteria:</span>{' '}
                      <span className="text-white">
                        {decomposition.dataCriteria.length > 0
                          ? decomposition.dataCriteria.map((c) => `${c.field} ${c.operator} ${c.value}`).join(', ')
                          : 'None'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Curate */}
        {step === 'curate' && (
          <div className="space-y-6">
            <div className="bg-transparent border border-white/[0.07] p-8">
              <h2 className="text-xl font-medium text-white mb-6">Curate Dataset</h2>
              <div className="space-y-4">
                {/* Dataset Mode Selection */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Dataset Action
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setDatasetMode('new');
                        setSelectedDatasetId('');
                      }}
                      className={`px-4 py-2 rounded-sm font-medium transition-all ${
                        datasetMode === 'new'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/[0.04] text-[#c8c8c8] hover:bg-white/[0.04]'
                      }`}
                    >
                      Create New Dataset
                    </button>
                    <button
                      onClick={() => {
                        setDatasetMode('existing');
                        setDatasetName('');
                      }}
                      className={`px-4 py-2 rounded-sm font-medium transition-all ${
                        datasetMode === 'existing'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/[0.04] text-[#c8c8c8] hover:bg-white/[0.04]'
                      }`}
                    >
                      Add to Existing Dataset
                    </button>
                  </div>
                </div>

                {/* New Dataset Name */}
                {datasetMode === 'new' && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Dataset Name
                    </label>
                    <input
                      type="text"
                      value={datasetName}
                      onChange={(e) => setDatasetName(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.07] rounded-sm px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g., High-Speed Vehicle Instances"
                    />
                  </div>
                )}

                {/* Existing Dataset Selection */}
                {datasetMode === 'existing' && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Select Dataset
                    </label>
                    <select
                      value={selectedDatasetId}
                      onChange={(e) => setSelectedDatasetId(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.07] rounded-sm px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Choose a dataset...</option>
                      {datasets
                        .filter(d => d.isSearchBased)
                        .map((dataset) => {
                          const splits = dataset.splits || { train: [], test: [], inference: [] };
                          const trainCount = splits.train?.length || 0;
                          const testCount = splits.test?.length || 0;
                          const inferenceCount = splits.inference?.length || 0;
                          return (
                            <option key={dataset.id} value={dataset.id}>
                              {dataset.name} ({dataset.version}) - Train: {trainCount}, Test: {testCount}, Inference: {inferenceCount}
                            </option>
                          );
                        })}
                    </select>
                    {datasets.filter(d => d.isSearchBased).length === 0 && (
                      <p className="text-xs text-[#999] mt-2">
                        No search-based datasets found. Create a new one instead.
                      </p>
                    )}
                  </div>
                )}

                {/* Split Assignment */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Assign Selected Instances to Splits
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <button
                      onClick={() => assignSelectedToSplit('train')}
                      disabled={selectedInstances.size === 0}
                      className="px-4 py-3 rounded-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Assign to Train ({selectedInstances.size})
                    </button>
                    <button
                      onClick={() => assignSelectedToSplit('test')}
                      disabled={selectedInstances.size === 0}
                      className="px-4 py-3 rounded-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700 text-white"
                    >
                      Assign to Test ({selectedInstances.size})
                    </button>
                    <button
                      onClick={() => assignSelectedToSplit('inference')}
                      disabled={selectedInstances.size === 0}
                      className="px-4 py-3 rounded-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Assign to Inference ({selectedInstances.size})
                    </button>
                  </div>
                  
                  {/* Split Summary */}
                  <div className="bg-white/[0.03] border border-white/[0.07] rounded-sm p-4">
                    <div className="text-sm font-medium text-white mb-2">Split Summary</div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-[#c8c8c8]">Train</div>
                        <div className="text-blue-400 font-semibold text-lg">{splitAssignments.train.size}</div>
                      </div>
                      <div>
                        <div className="text-[#c8c8c8]">Test</div>
                        <div className="text-green-400 font-semibold text-lg">{splitAssignments.test.size}</div>
                      </div>
                      <div>
                        <div className="text-[#c8c8c8]">Inference</div>
                        <div className="text-purple-400 font-semibold text-lg">{splitAssignments.inference.size}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-[#999]">
                      Total assigned: {splitAssignments.train.size + splitAssignments.test.size + splitAssignments.inference.size} instances
                    </div>
                  </div>
                </div>

                {/* Custom Description and Tags (only for new datasets) */}
                {datasetMode === 'new' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Description <span className="text-xs text-[#999]">(optional)</span>
                      </label>
                      <textarea
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.07] rounded-sm px-4 py-2 text-white focus:outline-none focus:border-purple-500 h-24 resize-none"
                        placeholder={`Default: Curated dataset from agentic search: "${searchQuery}"`}
                      />
                      <p className="text-xs text-[#999] mt-1">
                        Leave empty to use default description based on search query
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Tags <span className="text-xs text-[#999]">(optional, comma-separated)</span>
                      </label>
                      <input
                        type="text"
                        value={customTags}
                        onChange={(e) => setCustomTags(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.07] rounded-sm px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                        placeholder="e.g., high-speed, vehicles, urban (default: search-based, curated, agentic)"
                      />
                      <p className="text-xs text-[#999] mt-1">
                        Leave empty to use default tags: search-based, curated, agentic
                      </p>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">
                    {selectedInstances.size} of {searchResults.length} instances selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedInstances(new Set(searchResults.map((_, i) => i)))}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedInstances(new Set())}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {searchResults.map((result, index) => {
                    const isInTrain = splitAssignments.train.has(index);
                    const isInTest = splitAssignments.test.has(index);
                    const isInInference = splitAssignments.inference.has(index);
                    const isAssigned = isInTrain || isInTest || isInInference;
                    
                    return (
                      <div
                        key={index}
                        onClick={() => toggleInstance(index)}
                        className={`p-4 rounded-sm border cursor-pointer transition-all relative ${
                          selectedInstances.has(index)
                            ? 'bg-purple-600/20 border-purple-500'
                            : isAssigned
                            ? 'bg-slate-700/50 border-slate-600'
                            : 'bg-white/[0.03] border-white/[0.07] hover:border-slate-600'
                        }`}
                      >
                        {/* Split badges */}
                        {(isInTrain || isInTest || isInInference) && (
                          <div className="absolute top-2 right-2 flex gap-1">
                            {isInTrain && <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">T</span>}
                            {isInTest && <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">V</span>}
                            {isInInference && <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded">I</span>}
                          </div>
                        )}
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs text-[#c8c8c8]">#{index + 1}</span>
                          <span className="text-xs text-purple-400">
                            {(result.similarity * 100).toFixed(1)}% match
                          </span>
                        </div>
                        <div className="text-sm text-white mb-2">
                          {result.timestamp.toFixed(2)}s
                        </div>
                        <div className="space-y-1 text-xs text-[#c8c8c8]">
                          {Object.entries(result.dataValues).slice(0, 3).map(([key, value]) => (
                            <div key={key}>
                              {key}: {typeof value === 'number' ? value.toFixed(2) : value}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleCreateDataset}
                  disabled={
                    (splitAssignments.train.size + splitAssignments.test.size + splitAssignments.inference.size === 0) ||
                    (datasetMode === 'new' && !datasetName.trim()) ||
                    (datasetMode === 'existing' && !selectedDatasetId)
                  }
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {datasetMode === 'new'
                    ? `Create Dataset (Train: ${splitAssignments.train.size}, Test: ${splitAssignments.test.size}, Inference: ${splitAssignments.inference.size})`
                    : `Add to Dataset (Train: +${splitAssignments.train.size}, Test: +${splitAssignments.test.size}, Inference: +${splitAssignments.inference.size})`}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

