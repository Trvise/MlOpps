# Quick Start Guide

Get The Vortex up and running in 5 minutes.

## Step 1: Install Dependencies

```bash
npm install
```

This installs:
- React + React Router
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Framer Motion (animations)
- Lucide React (icons)
- Monaco Editor (code editor)

## Step 2: Start Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173`

## Step 3: Explore the App

### View Available Datasets

1. Navigate to **Datasets** page in sidebar
2. Browse pre-loaded sample datasets
3. View dataset details (samples, size, classes)
4. Click **Export Dataset Info** to download metadata

### First Model Training Run

1. Navigate to **Train** page
2. Select a training dataset from the dropdown
3. Choose Code Editor or Form view
4. Configure hyperparameters:
   - Framework: PyTorch or TensorFlow
   - Learning Rate: 0.001
   - Batch Size: 32
   - Epochs: 10
5. Click **Start Training**
6. Watch the live progress bar and logs
7. Your first model (M-001) is created

### Validate Your Model

1. Go to **Validate** page
2. Select your trained model (M-001)
3. Choose simulator: Isaac Sim or Gazebo
4. Click **Start Validation**
5. View safety score, latency, and FPS metrics

### Export for Deployment

1. Navigate to **Export** page
2. Select validated model
3. Choose format: ONNX, TensorRT, or TFLite
4. Click **Start Export**
5. See your exported artifact (E-001)

### Deploy to Fleet

1. Go to **Deploy** page
2. Select an exported model
3. Check robots you want to update
4. Click **Deploy to N Robots**
5. Monitor deployment status
6. Try **Rollback** if needed

### View History

1. Open **History** page
2. See timeline of all events
3. Select two models to compare
4. View side-by-side diff of hyperparameters and metrics

## Key Features to Try

### Real-time Updates
- All progress bars update live
- Logs auto-scroll
- State persists on page refresh

### Version Control
- Every model auto-versioned (M-001, M-002...)
- Complete history of changes
- Git-style diffs between versions

### Fleet Management
- 6 mock robots included
- Online/offline status
- One-click rollback
- Selective deployment

### Code Editor
- VS Code-like interface
- YAML configuration editing
- Press Ctrl+F to search
- Press Ctrl+S to save

## Typical Workflow

```
Datasets → Train → Validate → Export → Deploy → Monitor → (Rollback if needed)
```

**Detailed Flow:**
1. Upload/Select Dataset
2. Train model with dataset
3. Validate in simulator
4. Export optimized model
5. Deploy to robot fleet
6. Monitor performance
7. Rollback if issues arise

## Data Storage

All data stored in browser localStorage:
- Survives page refresh
- No backend needed
- Clear browser data to reset

## UI Tips

- **Dark Theme**: Optimized for long sessions
- **Animations**: Smooth transitions everywhere
- **Color Coding**:
  - Blue: Primary actions and models
  - Gold/Amber: Highlights and versions
  - Green: Success states
  - Red: Errors and warnings

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173
npm run dev
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Check TypeScript
npm run build
```

## Learning Resources

- **Zustand**: Simple state management
- **Framer Motion**: Animation library
- **React Router v6**: Navigation
- **Tailwind CSS**: Utility-first styling
- **Monaco Editor**: VS Code editor in browser

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Pro Tips

1. **Organize Datasets**: Use tags to categorize your datasets
2. **Export Dataset Info**: Download JSON for external tools
3. **Train Multiple Models**: Try different hyperparameters with same dataset
4. **Compare Versions**: Use History page to see improvements
5. **Fleet Testing**: Deploy to subset of robots first
6. **Export Multiple Formats**: Same model, different targets
7. **Monitor Events**: Timeline shows complete audit trail
8. **Dataset Types**: Keep Training/Validation/Test datasets separate
9. **Code Editor**: Use YAML editor for advanced configuration
10. **Connectors**: Set up cloud storage for real data integration

## Next Steps

Once you have real data:
1. Replace `fakeJobs.ts` with actual API calls
2. Connect to real model registry (MLflow, etc.)
3. Integrate with Kubernetes/Ray for orchestration
4. Add dataset management
5. Connect to real robot fleet
6. Configure cloud connectors for data sources
