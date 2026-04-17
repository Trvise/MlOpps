import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DatasetsPage } from './pages/DatasetsPage';
import { CuratedDatasetsPage } from './pages/CuratedDatasetsPage';
import { SearchDatasetPage } from './pages/SearchDatasetPage';
import { DatasetSearchPage } from './pages/DatasetSearchPage';
import { TrainPage } from './pages/TrainPage';
import { ValidatePage } from './pages/ValidatePage';
import { ExportPage } from './pages/ExportPage';
import { DeployPage } from './pages/DeployPage';
import { HistoryPage } from './pages/HistoryPage';
import { ConnectorsPage } from './pages/ConnectorsPage';
import { ProfilePage } from './pages/ProfilePage';

// Dashboard shell — sidebar + nested routes
const DashboardShell = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="ml-0 md:ml-64 min-h-screen bg-[#0c0c0c]">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/[0.07] bg-[#0c0c0c] sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="" className="w-5 h-5 object-contain" />
            <span className="text-sm font-medium text-white">Vortex</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[#999] hover:text-white">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/datasets" element={<DatasetsPage />} />
          <Route path="/datasets/:datasetId/search" element={<DatasetSearchPage />} />
          <Route path="/curated-datasets" element={<CuratedDatasetsPage />} />
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
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page — no sidebar */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard + all sub-routes */}
        <Route path="/dashboard/*" element={<DashboardShell />} />
      </Routes>
    </Router>
  );
}

export default App;
