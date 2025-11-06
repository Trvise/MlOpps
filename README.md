# The Vortex

A comprehensive ML model lifecycle management platform for robotics - from training to deployment.

## Features

### Model Dashboard
- Real-time overview of all models with metadata (version, status, accuracy, loss)
- Quick actions for training, validation, export, and deployment
- Metrics at a glance: total models, deployed models, average accuracy
- Interactive table with click-through model details and status tracking

### Datasets Management
- Dataset library for managing training, validation, and test datasets
- Upload and track datasets with metadata (size, samples, format)
- Export dataset info as JSON
- Rich metadata tracking: classes, resolution, augmentation status
- Dataset statistics: total samples, storage usage, dataset counts
- Filtering by dataset type (Training/Validation/Test)
- Seamless integration with training runs

### Training Module
- Framework selection: PyTorch and TensorFlow
- Dataset selection from available training datasets
- Hyperparameter configuration:
  - Learning rate adjustment
  - Batch size customization
  - Epoch control
- Live training simulation with real-time progress bars and logs
- Automatic versioning: models auto-versioned as M-001, M-002, etc.
- Code editor interface with VS Code-like experience
- YAML configuration editing with search and save functionality

### Validation Module
- Simulator support:
  - NVIDIA Isaac Sim
  - Gazebo
- Comprehensive metrics:
  - Safety score
  - Latency measurements
  - FPS performance
- Live validation with real-time progress and simulator logs
- Results tracking: all validation results stored with model version

### Export & Optimize
- Multiple formats:
  - ONNX (cross-platform)
  - TensorRT (NVIDIA optimization)
  - TFLite (mobile/edge devices)
- Artifact management: track file sizes, export versions, timestamps
- Conversion progress: live progress bars and logs
- Export history: view all exported artifacts with metadata

### Deployment Module
- Robot fleet management:
  - Multiple robot units (Scout, Cargo, Navigation)
  - Online/offline status tracking
  - Last sync timestamps
- Selective deployment: choose which robots to update
- One-click rollback: revert to previous model versions
- Fleet statistics: real-time online/offline counts
- ROS integration for robot deployment

### Version History & Git-Style Diff
- Event timeline: complete audit trail of all operations
  - Training events
  - Validations
  - Exports
  - Deployments
  - Rollbacks
- Version comparison: side-by-side diff viewer
  - Hyperparameter changes
  - Metrics improvements
  - Framework differences
  - Dataset version tracking
- Detailed metadata: JSON metadata for each event

### Connectors
- Cloud data source integration:
  - AWS S3
  - GCP Storage
  - Azure Blob Storage
- External model sources:
  - Custom ROS connections
  - External model APIs
- Connection testing and management
- Configuration management

### Profile & Settings
- User profile management
- Security settings with two-factor authentication
- Notification preferences
- ROS deployment configuration

## UI/UX Features

- Dark theme with minimalistic design
- Blue and gold accent colors (Trvise-inspired)
- Smooth animations with Framer Motion
- Responsive design for desktop and tablet
- Live progress updates with auto-scrolling logs
- Status badges with color-coded indicators
- Clean, professional B2B layout

## Technical Architecture

### Tech Stack
- Frontend: React 18.2 with TypeScript
- State Management: Zustand with localStorage persistence
- Styling: Tailwind CSS with custom dark theme
- Animations: Framer Motion
- Icons: Lucide React
- Code Editor: Monaco Editor (VS Code editor)
- Routing: React Router v6
- Build Tool: Vite

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── ProgressBar.tsx # Animated progress indicator
│   ├── LogViewer.tsx   # Monospace log display
│   ├── DiffViewer.tsx  # Version comparison
│   ├── MetricCard.tsx  # Metric display cards
│   └── CodeEditor.tsx  # Monaco code editor
│
├── pages/              # Main application pages
│   ├── DashboardPage.tsx   # Model overview
│   ├── DatasetsPage.tsx    # Dataset management
│   ├── TrainPage.tsx       # Training interface
│   ├── ValidatePage.tsx    # Validation interface
│   ├── ExportPage.tsx      # Export & optimization
│   ├── DeployPage.tsx      # Fleet deployment
│   ├── HistoryPage.tsx     # Timeline & diffs
│   ├── ConnectorsPage.tsx  # Cloud connectors
│   └── ProfilePage.tsx     # User settings
│
├── store/              # Zustand state stores
│   ├── useModels.ts    # Model state management
│   ├── useDatasets.ts  # Dataset management
│   ├── useHistory.ts   # Event history
│   ├── useRobots.ts    # Robot fleet state
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

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Data Persistence

All data is stored in the browser's localStorage:
- Models: `roboml-models-storage`
- Datasets: `roboml-datasets-storage`
- History: `roboml-history-storage`
- Robots: `roboml-robots-storage`

Data persists across page refreshes and browser sessions. Sample datasets are automatically initialized on first load.

## Workflow Example

1. Upload Dataset: Add training data to the Datasets library
2. Train: Create a new model with selected dataset and hyperparameters
3. Validate: Test in Isaac Sim or Gazebo simulator
4. Export: Convert to ONNX/TensorRT/TFLite
5. Deploy: Push to robot fleet
6. Monitor: Track in history and compare versions
7. Export Data: Download dataset info for external use
8. Rollback: Revert if needed

## Model Versioning

- Models: `M-001`, `M-002`, `M-003`...
- Exports: `E-001`, `E-002`, `E-003`...
- Fleet: `F-001`, `F-002`, `F-003`...
- Datasets: `DS-001`, `DS-002`, `DS-003`...

## Future Enhancements

Once you connect to your real data pipeline:

1. Dataset Integration: 
   - Add Dataset store
   - Link datasets to training runs
   - Dataset versioning and lineage

2. API Layer:
   - REST/gRPC endpoints
   - Real model registry (MLflow)
   - Actual job orchestration (Kubernetes, Ray)

3. Advanced Features:
   - Real-time model monitoring
   - A/B testing deployment
   - Performance analytics
   - Cost optimization tracking

## Development Notes

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
- Background: Black, slate-900
- Borders: slate-800, slate-700
- Accents: blue-600, amber-400

## Contributing

This is a demonstration/prototype application. Feel free to:
- Customize the UI theme
- Add new metrics
- Integrate with real ML pipelines
- Extend robot fleet management

## License

MIT License - feel free to use this in your projects!

## Acknowledgments

- Design inspired by modern AI platforms
- Built with modern React best practices
- Optimized for ML/robotics workflows
