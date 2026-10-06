import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import DatasetDetail from './pages/DatasetDetail';
import UploadDataset from './pages/UploadDataset';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/datasets/:id" element={<DatasetDetail />} />
            <Route path="/upload" element={<UploadDataset />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <div className="footer-inner">
            <div>
              <strong>ResearchCentre NHK</strong> — Web-based Secondary Data Management & Statistical System
            </div>
            <div>Powered by React, TypeScript, Recharts & Express</div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
