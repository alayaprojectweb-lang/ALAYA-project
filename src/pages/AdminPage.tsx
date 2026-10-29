import React, { useState } from 'react';
import { useAlaya } from '../context/AlayaContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  Download,
  Filter,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Sparkles,
  Cpu,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Lock,
  Unlock,
  LogOut,
  Plus,
  Trash2,
  Building,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { calculateCUS } from '../utils/cusLogic';

export const AdminPage: React.FC = () => {
  const {
    washrooms,
    selectedWashroomId,
    setSelectedWashroomId,
    activeWashroom,
    cleaningLogs,
    cleaningReports,
    exportCsvLogs,
    isAdminLoggedIn,
    adminLogin,
    adminLogout,
    availableFloors,
    addWashroom,
    removeWashroom,
    clearAllData,
    language,
    t,
  } = useAlaya();

  // Login form state
  const [adminIdInput, setAdminIdInput] = useState<string>('');
  const [adminPassInput, setAdminPassInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Add washroom form state
  const [newFloorName, setNewFloorName] = useState<string>('Second Floor');
  const [newWashroomName, setNewWashroomName] = useState<string>('');
  const [newLocation, setNewLocation] = useState<string>('');
  const [newStaffId, setNewStaffId] = useState<string>('staff_2f');
  const [newStaffPassword, setNewStaffPassword] = useState<string>('1234');
  const [addZoneSuccess, setAddZoneSuccess] = useState<string | null>(null);

  // Filter logs state
  const [logFilterWashroom, setLogFilterWashroom] = useState<string>('all');
  const [confirmClearData, setConfirmClearData] = useState<boolean>(false);

  // Handle Admin Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const success = adminLogin(adminIdInput, adminPassInput);
    if (!success) {
      setLoginError(t.adminAuthError || 'Invalid Admin ID or Password. (Use admin / alaya2026)');
    }
  };

  // Handle Add Washroom
  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWashroomName.trim()) return;

    addWashroom({
      name: newWashroomName.trim(),
      floor: newFloorName.trim() || 'General Floor',
      location: newLocation.trim() || `${newFloorName} Zone`,
      staffId: newStaffId.trim() || `staff_${newFloorName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      staffPassword: newStaffPassword.trim() || '1234',
    });

    setAddZoneSuccess(`Zone "${newWashroomName}" added to ${newFloorName} with Staff ID "${newStaffId}"!`);
    setNewWashroomName('');
    setNewLocation('');
    setNewStaffId(`staff_${Date.now().toString(36).slice(-3)}`);

    setTimeout(() => {
      setAddZoneSuccess(null);
    }, 4500);
  };

  // If Admin is NOT logged in, show secure login prompt
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 alaya-card p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#121829] border border-[#1F5BFF]/40 flex items-center justify-center text-[#1F5BFF] shadow-[0_0_20px_rgba(31,91,255,0.25)]">
            <Lock className="w-6 h-6 text-[#C6FF00]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F2F5FF]">
            {t.adminLoginTitle}
          </h1>
          <p className="text-xs text-[#8A94B2] leading-relaxed">
            {t.adminLoginDesc}
          </p>
        </div>

        {loginError && (
          <div className="p-3 rounded-xl bg-[#FF3B4E]/15 border border-[#FF3B4E]/50 text-xs text-[#FF3B4E] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-[#8A94B2] block">
              {t.adminIdLabel}
            </label>
            <input
              type="text"
              required
              value={adminIdInput}
              onChange={(e) => setAdminIdInput(e.target.value)}
              placeholder="e.g. admin"
              className="w-full px-4 py-2.5 text-xs bg-[#121829] border border-[#1F5BFF]/40 rounded-xl text-[#F2F5FF] placeholder-[#8A94B2] focus:outline-none focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-[#8A94B2] block">
              {t.adminPasswordLabel}
            </label>
            <input
              type="password"
              required
              value={adminPassInput}
              onChange={(e) => setAdminPassInput(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 text-xs bg-[#121829] border border-[#1F5BFF]/40 rounded-xl text-[#F2F5FF] placeholder-[#8A94B2] focus:outline-none focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00]"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#05060A] border border-[#1F5BFF]/25 text-[11px] font-mono text-[#8A94B2] space-y-1">
            <div className="text-[#C6FF00] font-bold">Admin Credentials:</div>
            <div>ID: <span className="text-[#F2F5FF]">admin</span></div>
            <div>Password: <span className="text-[#F2F5FF]">admin</span> or <span className="text-[#F2F5FF]">alaya2026</span></div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#1F5BFF] hover:bg-[#1F5BFF]/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(31,91,255,0.4)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C6FF00]"
          >
            <Unlock className="w-4 h-4" />
            <span>{t.adminLoginBtn}</span>
          </button>
        </form>
      </div>
    );
  }

  // Filter logs
  const filteredLogs = cleaningLogs.filter((log) => {
    if (logFilterWashroom === 'all') return true;
    return log.washroomId === logFilterWashroom;
  });

  // Calculate current formula breakdown for the active washroom
  const { breakdown } = calculateCUS({
    airQuality: activeWashroom.airQuality,
    userReportsCount: activeWashroom.userReports,
    timeSinceLastClean: activeWashroom.timeSinceLastClean,
    footfall: activeWashroom.footfall,
    moistureFlag: activeWashroom.moistureFlag,
    supplyLevel: activeWashroom.supplyLevel,
    previousStatus: activeWashroom.status,
    isWetFloorAfterMop: activeWashroom.isWetFloorAfterMop,
  });

  // Factor breakdown data list
  const factorRows = [
    {
      name: t.airQuality,
      weight: '25%',
      rawInput: `${activeWashroom.airQuality} /100`,
      pts: `+${breakdown.airQualityScore.toFixed(1)}`,
      color: '#1F5BFF',
      desc: 'MQ-135 chemical sensor reading (NH₃ / VOCs)',
    },
    {
      name: t.userReports,
      weight: '20%',
      rawInput: `${activeWashroom.userReports} reports (${breakdown.userReportsNormalized}/100)`,
      pts: `+${breakdown.userReportsScore.toFixed(1)}`,
      color: '#FFB020',
      desc: 'Crowdsourced reports (saturates at 4 × 25 pts)',
    },
    {
      name: t.timeSinceClean,
      weight: '15%',
      rawInput: `${activeWashroom.timeSinceLastClean} min`,
      pts: `+${breakdown.timeScore.toFixed(1)}`,
      color: '#8A94B2',
      desc: 'Normalized minutes elapsed since last verified clean',
    },
    {
      name: t.footfall,
      weight: '15%',
      rawInput: `${activeWashroom.footfall} entries`,
      pts: `+${breakdown.footfallScore.toFixed(1)}`,
      color: '#1F5BFF',
      desc: 'PIR doorway passage count since last verified clean',
    },
    {
      name: t.moisture,
      weight: '15%',
      rawInput: activeWashroom.moistureFlag === 1 ? 'WET (100)' : 'DRY (0)',
      pts: `+${breakdown.moistureScore.toFixed(1)}`,
      color: '#1F5BFF',
      desc: 'Floor conductivity probe state',
    },
    {
      name: t.supplyLevel,
      weight: '-10%',
      rawInput: `${activeWashroom.supplyLevel}% full`,
      pts: `-${breakdown.supplyDeduction.toFixed(1)}`,
      color: '#C6FF00',
      desc: 'Hand soap & paper availability (deducted from urgency)',
    },
  ];

  const verifiedCount = cleaningLogs.filter((l) => l.status === 'VERIFIED').length;
  const reportsCount = cleaningReports.length;
  const visitsAvoided = Math.max(0, verifiedCount * 3);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'GREEN':
        return 'border-[#C6FF00] text-[#C6FF00] bg-[#C6FF00]/10';
      case 'AMBER':
        return 'border-[#FFB020] text-[#FFB020] bg-[#FFB020]/10';
      case 'RED':
        return 'border-[#FF3B4E] text-[#FF3B4E] bg-[#FF3B4E]/10 animate-pulse';
      case 'WET_FLOOR':
        return 'border-[#1F5BFF] text-[#1F5BFF] bg-[#1F5BFF]/10';
      default:
        return 'border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Title & Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F2F5FF]">{t.adminTitle}</h1>
            <span className="px-2 py-0.5 rounded-full bg-[#C6FF00]/15 text-[#C6FF00] text-[10px] font-mono font-bold border border-[#C6FF00]/30">
              AUTHENTICATED
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8A94B2] mt-1">{t.adminSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Clear Previous Data Button */}
          {confirmClearData ? (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#FF3B4E]/15 border border-[#FF3B4E]/50">
              <span className="text-[11px] text-[#FF3B4E] font-bold px-2">Clear all logs?</span>
              <button
                onClick={() => {
                  clearAllData();
                  setConfirmClearData(false);
                }}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#FF3B4E] text-white hover:bg-[#FF3B4E]/90 cursor-pointer"
              >
                Yes, Purge
              </button>
              <button
                onClick={() => setConfirmClearData(false)}
                className="px-2 py-1 text-xs rounded-lg bg-[#121829] text-[#8A94B2] hover:text-[#F2F5FF] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClearData(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#121829] hover:bg-[#FF3B4E]/20 text-[#8A94B2] hover:text-[#FF3B4E] border border-[#1F5BFF]/30 text-xs font-mono transition-colors cursor-pointer"
              title="Clear all old logs and reset scores"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.clearAllDataBtn}</span>
            </button>
          )}

          {/* Export CSV */}
          <button
            onClick={exportCsvLogs}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#121829] hover:bg-[#1F5BFF] text-[#F2F5FF] border border-[#1F5BFF]/40 text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#C6FF00]" />
            <span>{t.exportCsv}</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={adminLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF3B4E]/15 hover:bg-[#FF3B4E]/25 text-[#FF3B4E] border border-[#FF3B4E]/40 text-xs font-semibold transition-all cursor-pointer"
            title="Log out of Admin session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.adminLogoutBtn}</span>
          </button>
        </div>
      </div>

      {/* NEW: Floor & Zone Architecture Manager (Add / Remove Floor and Washroom) */}
      <div className="alaya-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1F5BFF]/25">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#1F5BFF]" />
            <div>
              <h2 className="text-base font-bold text-[#F2F5FF]">{t.floorManagementTitle}</h2>
              <p className="text-xs text-[#8A94B2]">{t.floorManagementSubtitle}</p>
            </div>
          </div>
          <span className="text-xs font-mono text-[#C6FF00]">
            {availableFloors.length} Active Floors · {washrooms.length} Monitored Zones
          </span>
        </div>

        {addZoneSuccess && (
          <div className="p-3 rounded-xl bg-[#C6FF00]/15 border border-[#C6FF00]/50 text-xs text-[#C6FF00] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{addZoneSuccess}</span>
          </div>
        )}

        {/* Add Zone / Floor Form with Staff Credentials */}
        <form onSubmit={handleAddZone} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#8A94B2] uppercase block">
              Floor Level (तल)
            </label>
            <input
              type="text"
              required
              value={newFloorName}
              onChange={(e) => setNewFloorName(e.target.value)}
              placeholder="e.g. Ground Floor, First Floor, 2nd Floor..."
              className="w-full px-3 py-2 text-xs bg-[#121829] border border-[#1F5BFF]/35 rounded-xl text-[#F2F5FF] focus:outline-none focus:border-[#C6FF00]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#8A94B2] uppercase block">
              Washroom Name
            </label>
            <input
              type="text"
              required
              value={newWashroomName}
              onChange={(e) => setNewWashroomName(e.target.value)}
              placeholder="e.g. 2nd Floor Boys, Science Wing"
              className="w-full px-3 py-2 text-xs bg-[#121829] border border-[#1F5BFF]/35 rounded-xl text-[#F2F5FF] focus:outline-none focus:border-[#C6FF00]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#8A94B2] uppercase block">
              Floor Staff ID (लॉगिन आईडी)
            </label>
            <input
              type="text"
              required
              value={newStaffId}
              onChange={(e) => setNewStaffId(e.target.value)}
              placeholder="e.g. staff_2f"
              className="w-full px-3 py-2 text-xs bg-[#121829] border border-[#1F5BFF]/35 rounded-xl text-[#F2F5FF] focus:outline-none focus:border-[#C6FF00]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#8A94B2] uppercase block">
              Staff Password (पासवर्ड)
            </label>
            <input
              type="text"
              required
              value={newStaffPassword}
              onChange={(e) => setNewStaffPassword(e.target.value)}
              placeholder="e.g. 1234"
              className="w-full px-3 py-2 text-xs bg-[#121829] border border-[#1F5BFF]/35 rounded-xl text-[#F2F5FF] focus:outline-none focus:border-[#C6FF00]"
            />
          </div>

          <button
            type="submit"
            className="py-2 px-4 rounded-xl bg-[#1F5BFF] hover:bg-[#1F5BFF]/90 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(31,91,255,0.4)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C6FF00] h-[38px]"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNewWashroomBtn}</span>
          </button>
        </form>

        {/* Existing Zones List with Staff Credentials & Delete Button */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-mono text-[#8A94B2] uppercase block">
            Existing Configured Zones & Staff Logins:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {washrooms.map((w) => (
              <div
                key={w.id}
                className="p-3 rounded-xl bg-[#121829] border border-[#1F5BFF]/25 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1 truncate">
                  <div className="font-bold text-[#F2F5FF] truncate">{w.name}</div>
                  <div className="text-[10px] font-mono text-[#8A94B2]">
                    <span className="text-[#1F5BFF] font-semibold">{w.floor}</span> · Score: {w.cus}
                  </div>
                  <div className="text-[11px] font-mono p-1 rounded bg-[#05060A] border border-[#1F5BFF]/20 text-[#C6FF00]">
                    Staff Login: <span className="text-[#F2F5FF] font-bold">{w.staffId || 'staff_gf'}</span> | Pass: <span className="text-[#F2F5FF] font-bold">{w.staffPassword || '1234'}</span>
                  </div>
                </div>

                {/* Only allow deleting if more than 1 washroom remains */}
                {washrooms.length > 1 && (
                  <button
                    onClick={() => removeWashroom(w.id)}
                    className="p-2 rounded-lg bg-[#FF3B4E]/10 hover:bg-[#FF3B4E]/25 text-[#FF3B4E] border border-[#FF3B4E]/30 transition-colors cursor-pointer shrink-0 mt-1"
                    title={`Delete ${w.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impact Counters Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="alaya-card p-4 space-y-1">
          <span className="text-[11px] font-mono text-[#8A94B2] uppercase">{t.verifiedCleansCount}</span>
          <div className="text-3xl font-extrabold font-mono text-[#C6FF00]">{verifiedCount}</div>
          <p className="text-[11px] text-[#8A94B2]">Empirically proven sensor drops today</p>
        </div>

        <div className="alaya-card p-4 space-y-1">
          <span className="text-[11px] font-mono text-[#8A94B2] uppercase">{t.reportsResolved}</span>
          <div className="text-3xl font-extrabold font-mono text-[#1F5BFF]">{reportsCount}</div>
          <p className="text-[11px] text-[#8A94B2]">Crowdsourced feedback items handled</p>
        </div>

        <div className="alaya-card p-4 space-y-1">
          <span className="text-[11px] font-mono text-[#8A94B2] uppercase">{t.visitsAvoided}</span>
          <div className="text-3xl font-extrabold font-mono text-[#F2F5FF]">{visitsAvoided}</div>
          <p className="text-[11px] text-[#8A94B2]">{t.visitsAvoidedSubtitle}</p>
        </div>
      </div>

      {/* Colour-Coded Tiles for All Washrooms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {washrooms.map((w) => {
          const isSelected = w.id === selectedWashroomId;
          return (
            <div
              key={w.id}
              onClick={() => setSelectedWashroomId(w.id)}
              className={`alaya-card p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#1F5BFF] ring-2 ring-[#1F5BFF]/50 bg-[#121829]'
                  : 'hover:border-[#1F5BFF]/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#1F5BFF] font-semibold">{w.floor}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getStatusBadge(
                    w.status
                  )}`}
                >
                  {w.status === 'WET_FLOOR' ? 'WET FLOOR' : w.status}
                </span>
              </div>

              <h2 className="text-base font-bold text-[#F2F5FF] mt-2 truncate">
                {language === 'hi' ? w.nameHi : w.name}
              </h2>
              <p className="text-[11px] text-[#8A94B2] truncate font-mono">
                {language === 'hi' ? w.locationHi : w.location}
              </p>

              <div className="mt-4 pt-3 border-t border-[#1F5BFF]/20 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#8A94B2] uppercase block">CUS</span>
                  <span className="text-2xl font-extrabold font-mono text-[#F2F5FF]">{w.cus}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-[#8A94B2] uppercase block">Threshold</span>
                  <span className="text-xs font-mono font-semibold text-[#C6FF00]">
                    {typeof w.timeToThreshold === 'number'
                      ? `~${w.timeToThreshold}m`
                      : w.timeToThreshold}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Washroom Detailed Telemetry: Chart & Factor Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Trend Line Chart with Recharts (2 cols) */}
        <div className="alaya-card p-6 lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#F2F5FF]">
                {t.hourlyTrend}: {language === 'hi' ? activeWashroom.nameHi : activeWashroom.name}
              </h2>
              <p className="text-xs text-[#8A94B2]">
                Horizontal threshold guides: Amber (40) and Red Urgent (70) · Floor: {activeWashroom.floor}
              </p>
            </div>
            <div className="text-xs font-mono text-[#8A94B2] flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#1F5BFF]" /> CUS Line
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#FF3B4E]" /> Threshold 70
              </span>
            </div>
          </div>

          {/* Line Chart */}
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activeWashroom.hourlyHistory}
                margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,91,255,0.15)" vertical={false} />
                <XAxis
                  dataKey="time"
                  stroke="#8A94B2"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(31,91,255,0.3)' }}
                />
                <YAxis
                  stroke="#8A94B2"
                  fontSize={11}
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 70, 80, 100]}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(31,91,255,0.3)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0F1A',
                    borderColor: 'rgba(31,91,255,0.5)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#F2F5FF',
                  }}
                  itemStyle={{ color: '#F2F5FF' }}
                />
                <ReferenceLine
                  y={40}
                  stroke="#FFB020"
                  strokeDasharray="4 4"
                  label={{ value: 'Amber (40)', fill: '#FFB020', fontSize: 10, position: 'insideTopLeft' }}
                />
                <ReferenceLine
                  y={70}
                  stroke="#FF3B4E"
                  strokeDasharray="4 4"
                  label={{ value: 'Urgent (70)', fill: '#FF3B4E', fontSize: 10, position: 'insideTopLeft' }}
                />
                <Line
                  type="monotone"
                  dataKey="cus"
                  stroke="#1F5BFF"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#C6FF00' }}
                  activeDot={{ r: 6, fill: '#C6FF00' }}
                  name="CUS Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Explainable Factor Breakdown (1 col) */}
        <div className="alaya-card p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#F2F5FF]">{t.factorBreakdown}</h2>
            <p className="text-xs text-[#8A94B2]">
              Mathematical contribution to current CUS ({activeWashroom.cus})
            </p>
          </div>

          <div className="space-y-3">
            {factorRows.map((f, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-[#121829] border border-[#1F5BFF]/20 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#F2F5FF]">{f.name}</span>
                  <span className="font-mono font-bold text-[#C6FF00]">{f.pts} pts</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8A94B2]">
                  <span>Weight: {f.weight}</span>
                  <span>Input: {f.rawInput}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#1F5BFF]/30 text-xs font-mono flex items-center justify-between">
            <span className="text-[#8A94B2]">Clamped Formula Sum:</span>
            <span className="text-base font-bold text-[#C6FF00]">{activeWashroom.cus} /100</span>
          </div>
        </div>
      </div>

      {/* Pattern Insights & Sensor Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pattern Insights Card */}
        <div className="alaya-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#C6FF00]" />
            <h2 className="text-base font-bold text-[#F2F5FF]">{t.patternInsights}</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#121829] border border-[#1F5BFF]/20 space-y-1">
              <div className="font-bold text-[#FFB020] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Floor Area Load Analysis</span>
              </div>
              <p className="text-[#8A94B2] leading-relaxed">
                Upper floors show periodic spikes following classroom intervals. Organizing dedicated floor rounds reduces footfall congestion and maintains optimal hygiene.
              </p>
            </div>
          </div>
        </div>

        {/* Sensor Health Panel */}
        <div className="alaya-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#1F5BFF]" />
              <h2 className="text-base font-bold text-[#F2F5FF]">{t.sensorHealth}</h2>
            </div>
            <span className="text-[11px] font-mono text-[#C6FF00]">All Telemetry Operational</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#121829] border border-[#1F5BFF]/20 space-y-1">
              <div className="text-[#8A94B2] font-mono text-[10px] uppercase">MQ-135 Gas Sniffer</div>
              <div className="font-bold text-[#C6FF00] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#C6FF00]" /> Online (Calibrated)
              </div>
              <div className="text-[10px] text-[#8A94B2] font-mono">Analog ADC · 3.3V</div>
            </div>

            <div className="p-3 rounded-xl bg-[#121829] border border-[#1F5BFF]/20 space-y-1">
              <div className="text-[#8A94B2] font-mono text-[10px] uppercase">PIR Motion Array</div>
              <div className="font-bold text-[#C6FF00] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#C6FF00]" /> Online (Active)
              </div>
              <div className="text-[10px] text-[#8A94B2] font-mono">Pyroelectric Heat Delta</div>
            </div>

            <div className="p-3 rounded-xl bg-[#121829] border border-[#1F5BFF]/20 space-y-1">
              <div className="text-[#8A94B2] font-mono text-[10px] uppercase">Floor Conductivity</div>
              <div className="font-bold text-[#C6FF00] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#C6FF00]" /> Online (Dry)
              </div>
              <div className="text-[10px] text-[#8A94B2] font-mono">Conductance Probe · Pin 34</div>
            </div>

            <div className="p-3 rounded-xl bg-[#121829] border border-[#1F5BFF]/20 space-y-1">
              <div className="text-[#8A94B2] font-mono text-[10px] uppercase">Ultrasonic Supply Level</div>
              <div className="font-bold text-[#C6FF00] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#C6FF00]" /> Online (Echo 40kHz)
              </div>
              <div className="text-[10px] text-[#8A94B2] font-mono">ToF Range: 4-40cm</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cleaning Audit Log Table */}
      <div className="alaya-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#F2F5FF]">{t.cleaningAuditLog}</h2>
            <p className="text-xs text-[#8A94B2]">
              Historical sensor audit trail. Verified entries reset CUS; unverified entries keep score elevated.
            </p>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#8A94B2]" />
            <select
              value={logFilterWashroom}
              onChange={(e) => setLogFilterWashroom(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#121829] border border-[#1F5BFF]/40 rounded-lg text-[#F2F5FF] focus:outline-none focus:ring-1 focus:ring-[#C6FF00]"
            >
              <option value="all">All Washrooms</option>
              {washrooms.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.floor})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table or Empty State */}
        {filteredLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8A94B2] font-mono">
            No audit logs recorded yet. (Ready for new cleaning verifications).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1F5BFF]/30 text-[#8A94B2]">
                  <th className="py-2.5 px-3">TIMESTAMP</th>
                  <th className="py-2.5 px-3">ZONE / WASHROOM</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">SENSOR AUDIT REASON</th>
                  <th className="py-2.5 px-3 text-right">AIR (PRE → POST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F5BFF]/15">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#121829]/50 transition-colors">
                    <td className="py-3 px-3 text-[#F2F5FF] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 font-sans font-semibold text-[#F2F5FF] whitespace-nowrap">
                      {log.washroomName}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.status === 'VERIFIED'
                            ? 'bg-[#C6FF00]/15 text-[#C6FF00] border border-[#C6FF00]/40'
                            : 'bg-[#FF3B4E]/15 text-[#FF3B4E] border border-[#FF3B4E]/40'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-[#8A94B2] max-w-md">{log.reason}</td>
                    <td className="py-3 px-3 text-right text-[#F2F5FF] whitespace-nowrap">
                      {log.airBefore} → {log.airAfter} (Δ{(log.airBefore - log.airAfter).toFixed(1)})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
