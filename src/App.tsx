/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlayaProvider, useAlaya } from './context/AlayaContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { PublicStatusPage } from './pages/PublicStatusPage';
import { StaffPage } from './pages/StaffPage';
import { AdminPage } from './pages/AdminPage';
import { HardwarePage } from './pages/HardwarePage';
import { SimulatorPage } from './pages/SimulatorPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, language } = useAlaya();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'public':
        return <PublicStatusPage />;
      case 'staff':
        return <StaffPage />;
      case 'admin':
        return <AdminPage />;
      case 'hardware':
        return <HardwarePage />;
      case 'simulator':
        return <SimulatorPage />;
      case 'privacy':
        return <PrivacyPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#05060A] text-[#F2F5FF] flex flex-col selection:bg-[#1F5BFF]/30 selection:text-[#C6FF00]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {renderActiveTab()}
      </main>

      {/* Clean Global Footer */}
      <footer className="border-t border-[#1F5BFF]/25 bg-[#080B14] py-8 text-xs text-[#8A94B2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#F2F5FF] flex items-center">
              ALAYA
              <span className="inline-block w-2 h-2 ml-1 rounded-full bg-[#C6FF00]" />
            </span>
            <span>· AI-enabled Lavatory & Hygiene Assistant</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#C6FF00] font-mono">
            <ShieldCheck className="w-4 h-4 text-[#C6FF00]" />
            <span>Measures the room, not the person. Zero cameras. Zero biometric capture.</span>
          </div>

          <div className="text-[11px] font-mono text-[#8A94B2]">
            School Science Exhibition 2026 · DPDP Act 2023 Compliant
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AlayaProvider>
      <AppContent />
    </AlayaProvider>
  );
}
