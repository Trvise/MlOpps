import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { DatasetsPage } from './pages/DatasetsPage';
import { SearchDatasetPage } from './pages/SearchDatasetPage';
import { TrainPage } from './pages/TrainPage';
import { ValidatePage } from './pages/ValidatePage';
import { ExportPage } from './pages/ExportPage';
import { DeployPage } from './pages/DeployPage';
import { HistoryPage } from './pages/HistoryPage';
import { ConnectorsPage } from './pages/ConnectorsPage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black">
        <Sidebar />
        <main className="ml-64 min-h-screen bg-black">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/datasets" element={<DatasetsPage />} />
            <Route path="/search" element={<SearchDatasetPage />} />
            <Route path="/train" element={<TrainPage />} />
            <Route path="/validate" element={<ValidatePage />} />
            <Route path="/export" element={<ExportPage />} />
            <Route path="/deploy" element={<DeployPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/connectors" element={<ConnectorsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

