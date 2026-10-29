import React from 'react';
import { useAlaya } from '../context/AlayaContext';
import { TabType } from '../types';
import {
  Activity,
  QrCode,
  ShieldAlert,
  Sliders,
  Cpu,
  BarChart3,
  ShieldCheck,
  Radio,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, language, setLanguage, isHardwareConnected, t } = useAlaya();

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t.tabHome, icon: <Activity className="w-4 h-4" /> },
    { id: 'public', label: t.tabPublic, icon: <QrCode className="w-4 h-4" /> },
    { id: 'staff', label: t.tabStaff, icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'admin', label: t.tabAdmin, icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'hardware', label: t.tabHardware, icon: <Cpu className="w-4 h-4" /> },
    { id: 'simulator', label: t.tabSimulator, icon: <Sliders className="w-4 h-4" /> },
    { id: 'privacy', label: t.tabPrivacy, icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#05060A]/95 backdrop-blur border-b border-[#1F5BFF]/35">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Wordmark with lime dot */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF00]"
            >
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#F2F5FF] flex items-center">
                ALAYA
                <span className="inline-block w-2.5 h-2.5 ml-1 rounded-full bg-[#C6FF00] shadow-[0_0_8px_#C6FF00]" />
              </span>
              <span className="hidden xl:inline text-xs font-mono text-[#8A94B2] border-l border-[#1F5BFF]/40 pl-2">
                HYGIENE MONITOR
              </span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 overflow-x-auto py-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF00] ${
                    isActive
                      ? 'bg-[#1F5BFF] text-white shadow-[0_0_15px_rgba(31,91,255,0.45)]'
                      : 'text-[#8A94B2] hover:text-[#F2F5FF] hover:bg-[#121829]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Zone: Source Badge & Language Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Source Status Indicator */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold tracking-wide border ${
                isHardwareConnected
                  ? 'bg-[#C6FF00]/10 text-[#C6FF00] border-[#C6FF00]/40 shadow-[0_0_10px_rgba(198,255,0,0.2)]'
                  : 'bg-[#121829] text-[#8A94B2] border-[#1F5BFF]/30'
              }`}
            >
              <Radio
                className={`w-3 h-3 ${
                  isHardwareConnected ? 'text-[#C6FF00] animate-pulse' : 'text-[#8A94B2]'
                }`}
              />
              <span className="hidden sm:inline">
                {isHardwareConnected ? t.sourceHardware : t.sourceSimulator}
              </span>
              <span className="sm:hidden">
                {isHardwareConnected ? 'LIVE' : 'SIM'}
              </span>
            </div>

            {/* Language Toggle (EN | हिं) */}
            <div className="flex items-center bg-[#121829] p-0.5 rounded-lg border border-[#1F5BFF]/35">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#1F5BFF] text-white'
                    : 'text-[#8A94B2] hover:text-[#F2F5FF]'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  language === 'hi'
                    ? 'bg-[#1F5BFF] text-white'
                    : 'text-[#8A94B2] hover:text-[#F2F5FF]'
                }`}
                title="हिंदी में बदलें"
              >
                हिं
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Horizontal Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2.5 border-t border-[#1F5BFF]/20 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#1F5BFF] text-white'
                    : 'text-[#8A94B2] hover:text-[#F2F5FF] bg-[#0B0F1A]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
