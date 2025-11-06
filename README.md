# 🤖 RoboML Console

A comprehensive React web application for managing the complete ML model lifecycle for robotics - from training to deployment.

![RoboML Console](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan)
![Zustand](https://img.shields.io/badge/Zustand-4.4-purple)

## ✨ Features

### 🎯 Model Dashboard
- **Real-time Overview**: View all models with metadata (version, status, accuracy, loss)
- **Quick Actions**: Fast access to training, validation, export, and deployment
- **Metrics at a Glance**: Total models, deployed models, average accuracy
- **Interactive Table**: Click-through model details and status tracking

### 💾 Datasets Management
- **Dataset Library**: Manage training, validation, and test datasets
- **Upload & Track**: Add new datasets with metadata (size, samples, format)
- **Export Dataset Info**: Download dataset metadata as JSON
- **Rich Metadata**: Track classes, resolution, augmentation status
- **Dataset Statistics**: View total samples, storage usage, dataset counts
- **Filtering**: Filter by dataset type (Training/Validation/Test)
- **Integration**: Seamlessly link datasets to training runs

### 🔥 Training Module
- **Framework Selection**: Choose between PyTorch and TensorFlow
- **Dataset Selection**: Pick from available training datasets
- **Hyperparameter Configuration**: 
  - Learning rate adjustment
  - Batch size customization
  - Epoch control
- **Live Training Simulation**: Real-time progress bars and training logs
- **Automatic Versioning**: Models auto-versioned as M-001, M-002, etc.
- **Dataset Linking**: Each training run linked to a specific dataset version

### 🧪 Validation Module
- **Simulator Support**: 
  - NVIDIA Isaac Sim
  - Gazebo
- **Comprehensive Metrics**:
  - Safety score
  - Latency measurements
  - FPS performance
- **Live Validation**: Real-time progress and simulator logs
- **Results Tracking**: All validation results stored with model version

### 📦 Export & Optimize
- **Multiple Formats**:
  - ONNX (cross-platform)
  - TensorRT (NVIDIA optimization)
  - TFLite (mobile/edge devices)
- **Artifact Management**: Track file sizes, export versions, timestamps
- **Conversion Progress**: Live progress bars and logs
- **Export History**: View all exported artifacts with metadata

### 🚀 Deployment Module
- **Robot Fleet Management**: 
  - 6 mock robots (Scout, Cargo, Navigation units)
  - Online/offline status tracking
  - Last sync timestamps
- **Selective Deployment**: Choose which robots to update
- **One-Click Rollback**: Revert to previous model versions
- **Fleet Statistics**: Real-time online/offline counts

### 📊 Version History & Git-Style Diff
- **Event Timeline**: Complete audit trail of all operations
  - Training events
  - Validations
  - Exports
  - Deployments
  - Rollbacks
- **Version Comparison**: Side-by-side diff viewer
  - Hyperparameter changes
  - Metrics improvements
  - Framework differences
  - Dataset version tracking
- **Detailed Metadata**: JSON metadata for each event

## 🎨 UI/UX Features

- **Dark Theme**: Minimalistic design inspired by Weights & Biases
- **Gradient Accents**: Neon blue/green/purple color scheme
- **Smooth Animations**: Framer Motion transitions between states
- **Responsive Design**: Works on desktop and tablet screens
- **Live Progress**: Real-time updates with auto-scrolling logs
- **Status Badges**: Color-coded model status indicators

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend**: React 18.2 with TypeScript
- **State Management**: Zustand with localStorage persistence
- **Styling**: Tailwind CSS + custom dark theme
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Build Tool**: Vite

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── ProgressBar.tsx # Animated progress indicator
│   ├── LogViewer.tsx   # Monospace log display
│   ├── DiffViewer.tsx  # Version comparison
│   └── MetricCard.tsx  # Metric display cards
│
├── pages/              # Main application pages
│   ├── DashboardPage.tsx   # Model overview
│   ├── DatasetsPage.tsx    # Dataset management
│   ├── TrainPage.tsx       # Training interface
│   ├── ValidatePage.tsx    # Validation interface
│   ├── ExportPage.tsx      # Export & optimization
│   ├── DeployPage.tsx      # Fleet deployment
│   └── HistoryPage.tsx     # Timeline & diffs
│
├── store/              # Zustand state stores
│   ├── useModels.ts    # Model state management
│   ├── useDatasets.ts  # Dataset management
│   ├── useHistory.ts   # Event history
│   └── useRobots.ts    # Robot fleet state
│
├── utils/              # Utility functions
│   ├── fakeJobs.ts     # Async job simulation
│   ├── versionUtils.ts # Version generation
│   └── randomMetrics.ts # Mock metrics
│
├── types/              # TypeScript interfaces
│   └── index.ts        # Shared types
│
├── lib/                # Utility libraries
│   └── utils.ts        # Helper functions
│
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Start development server**:
```bash
npm run dev
```

3. **Build for production**:
```bash
npm run build
```

4. **Preview production build**:
```bash
npm run preview
```

## 💾 Data Persistence

All data is stored in the browser's `localStorage`:
- **Models**: `roboml-models-storage`
- **Datasets**: `roboml-datasets-storage`
- **History**: `roboml-history-storage`
- **Robots**: `roboml-robots-storage`

Data persists across page refreshes and browser sessions. Sample datasets are automatically initialized on first load.

## 🔄 Workflow Example

1. **Upload Dataset**: Add training data to the Datasets library
2. **Train**: Create a new model with selected dataset and hyperparameters
3. **Validate**: Test in Isaac Sim or Gazebo simulator
4. **Export**: Convert to ONNX/TensorRT/TFLite
5. **Deploy**: Push to robot fleet
6. **Monitor**: Track in history and compare versions
7. **Export Data**: Download dataset info for external use
8. **Rollback**: Revert if needed

## 🎯 Model Versioning

- **Models**: `M-001`, `M-002`, `M-003`...
- **Exports**: `E-001`, `E-002`, `E-003`...
- **Fleet**: `F-001`, `F-002`, `F-003`...
- **Datasets**: `DS-001`, `DS-002`, `DS-003`...

## 🔮 Future Enhancements

Once you connect to your real data pipeline:

1. **Dataset Integration**: 
   - Add Dataset store
   - Link datasets to training runs
   - Dataset versioning and lineage

2. **API Layer**:
   - REST/gRPC endpoints
   - Real model registry (MLflow)
   - Actual job orchestration (Kubernetes, Ray)

3. **Advanced Features**:
   - Real-time model monitoring
   - A/B testing deployment
   - Performance analytics
   - Cost optimization tracking

## 📝 Development Notes

### Simulated Jobs
All training, validation, and export processes are simulated with:
- Realistic progress updates (800ms intervals)
- Generated metrics (randomized but realistic)
- Auto-scrolling log displays

### State Management
Zustand provides:
- Simple, hook-based API
- Automatic localStorage sync
- No boilerplate or reducers needed

### Styling
Tailwind classes follow a dark theme:
- Background: `slate-950`, `slate-900`
- Borders: `slate-800`, `slate-700`
- Accents: `cyan-400`, `blue-600`, `green-400`

## 🤝 Contributing

This is a demonstration/prototype application. Feel free to:
- Customize the UI theme
- Add new metrics
- Integrate with real ML pipelines
- Extend robot fleet management

## 📄 License

MIT License - feel free to use this in your projects!

## 🙏 Acknowledgments

- Design inspired by Weights & Biases
- Built with modern React best practices
- Optimized for ML/robotics workflows

---

**Built with ❤️ for the ML/Robotics community**
