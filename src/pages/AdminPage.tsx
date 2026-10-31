import React, { useState } from 'react';
import { useAlaya, maskIndianPhone, isValidIndianPhone } from '../context/AlayaContext';
import { Washroom, Floor, WashroomType, SmsDeliveryMode } from '../types';
import { QrCodeModal } from '../components/QrCodeModal';
import {
  ShieldCheck,
  Building2,
  Phone,
  MessageSquare,
  QrCode,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Download,
  Send,
  Lock,
  LogOut,
  RefreshCw,
  Wrench,
  Check,
  X,
  ExternalLink,
  Flame,
  Radio,
  Sliders,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const {
    floors,
    addFloor,
    updateFloor,
    removeFloor,
    washrooms,
    addWashroom,
    updateWashroom,
    removeWashroom,
    selectedWashroomId,
    setSelectedWashroomId,
    cleaningReports,
    resolveCleaningReport,
    maintenanceQueue,
    resolveMaintenance,
    cleaningLogs,
    markCleaned,
    simulateCleanResult,
    demoMode,
    setDemoMode,
    smsSettings,
    updateSmsSettings,
    smsLogs,
    clearSmsLogs,
    exportSmsLogsCsv,
    sendTestSms,
    checkSmsConnection,
    dailySmsSentCount,
    smsFallbackBannerActive,
    isAdminLoggedIn,
    adminLogin,
    adminLogout,
    resetAllScoresToClean,
    exportCsvLogs,
    clearAllData,
    language,
    t,
  } = useAlaya();

  // Admin Login state
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active subtab inside Admin
  const [adminSubTab, setAdminSubTab] = useState<'roster' | 'floors' | 'sms' | 'logs'>('roster');

  // Phone visibility toggle for masking (floorId or washroomId -> boolean)
  const [revealedPhones, setRevealedPhones] = useState<Record<string, boolean>>({});

  // QR Modal State
  const [qrModalWashroom, setQrModalWashroom] = useState<Washroom | null>(null);

  // Add Floor Modal / Form
  const [showAddFloorModal, setShowAddFloorModal] = useState(false);
  const [floorNameInput, setFloorNameInput] = useState('');
  const [floorJanitorNameInput, setFloorJanitorNameInput] = useState('');
  const [floorJanitorPhoneInput, setFloorJanitorPhoneInput] = useState('');
  const [floorPhoneError, setFloorPhoneError] = useState<string | null>(null);

  // Add Washroom Form
  const [showAddWashroomModal, setShowAddWashroomModal] = useState(false);
  const [targetFloorId, setTargetFloorId] = useState('');
  const [washroomNameInput, setWashroomNameInput] = useState('');
  const [washroomTypeInput, setWashroomTypeInput] = useState<WashroomType>('Boys');
  const [washroomOverridePhoneInput, setWashroomOverridePhoneInput] = useState('');
  const [washroomPhoneError, setWashroomPhoneError] = useState<string | null>(null);

  // Edit Phone state
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [editingPhoneValue, setEditingPhoneValue] = useState('');
  const [editingPhoneError, setEditingPhoneError] = useState<string | null>(null);

  // SMS Gateway testing
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testResultMsg, setTestResultMsg] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingSms, setIsTestingSms] = useState(false);

  // Confirmation state for data clear
  const [confirmClear, setConfirmClear] = useState(false);

  // Handle Admin Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const ok = adminLogin(adminId, adminPass);
    if (!ok) {
      setLoginError(language === 'hi' ? 'गलत आईडी या पासवर्ड (admin / alaya2026)' : 'Invalid Admin ID or Password. Use admin / alaya2026');
    }
  };

  const togglePhoneReveal = (id: string) => {
    setRevealedPhones((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Add Floor submit
  const handleCreateFloor = (e: React.FormEvent) => {
    e.preventDefault();
    setFloorPhoneError(null);

    if (!floorNameInput.trim()) return;

    if (!isValidIndianPhone(floorJanitorPhoneInput)) {
      setFloorPhoneError(
        language === 'hi'
          ? 'कृपया 10 अंकों का मान्य भारतीय मोबाइल नंबर दर्ज करें (6, 7, 8, 9 से शुरू)'
          : 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9'
      );
      return;
    }

    const res = addFloor({
      name: floorNameInput.trim(),
      janitorName: floorJanitorNameInput.trim() || undefined,
      janitorPhone: floorJanitorPhoneInput.trim(),
      smsAlertsActive: true,
    });

    if (res.success) {
      setFloorNameInput('');
      setFloorJanitorNameInput('');
      setFloorJanitorPhoneInput('');
      setShowAddFloorModal(false);
    } else {
      setFloorPhoneError(res.error || 'Failed to add floor');
    }
  };

  // Add Washroom submit
  const handleCreateWashroom = (e: React.FormEvent) => {
    e.preventDefault();
    setWashroomPhoneError(null);

    if (!washroomNameInput.trim() || !targetFloorId) return;

    if (washroomOverridePhoneInput && !isValidIndianPhone(washroomOverridePhoneInput)) {
      setWashroomPhoneError(
        language === 'hi'
          ? 'अतिरिक्त नंबर 10 अंकों का मान्य भारतीय नंबर होना चाहिए'
          : 'Override phone must be a valid 10-digit Indian number'
      );
      return;
    }

    const parentFloor = floors.find((f) => f.id === targetFloorId);
    const floorName = parentFloor ? parentFloor.name : 'Unknown Floor';

    const res = addWashroom({
      name: washroomNameInput.trim(),
      floor: floorName,
      floorId: targetFloorId,
      washroomType: washroomTypeInput,
      janitorPhoneOverride: washroomOverridePhoneInput.trim() || undefined,
      location: `${floorName} - ${washroomTypeInput} Wing`,
    });

    if (res.success) {
      setWashroomNameInput('');
      setWashroomOverridePhoneInput('');
      setShowAddWashroomModal(false);
    } else {
      setWashroomPhoneError(res.error || 'Failed to add washroom');
    }
  };

  // Save inline edited phone
  const handleSavePhone = (floorId: string) => {
    setEditingPhoneError(null);
    if (!isValidIndianPhone(editingPhoneValue)) {
      setEditingPhoneError('Must be a valid 10-digit mobile number');
      return;
    }
    const res = updateFloor(floorId, { janitorPhone: editingPhoneValue.trim() });
    if (res.success) {
      setEditingPhoneId(null);
      setEditingPhoneValue('');
    } else {
      setEditingPhoneError(res.error || 'Update failed');
    }
  };

  // Test SMS Gateway Check
  const handleRunConnectionTest = async () => {
    if (!testPhoneNumber) {
      setTestResultMsg({
        success: false,
        message: 'Please enter a 10-digit phone number to test',
      });
      return;
    }
    setIsTestingSms(true);
    setTestResultMsg(null);
    const res = await checkSmsConnection(testPhoneNumber);
    setIsTestingSms(false);
    setTestResultMsg(res);
  };

  // If not logged in, render the login card
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 animate-fade-in">
        <div className="bg-[#0B0F1A] border-2 border-[#1F5BFF]/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_30px_rgba(31,91,255,0.25)] space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#1F5BFF]/20 border border-[#1F5BFF]/50 flex items-center justify-center mx-auto text-[#C6FF00]">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#F2F5FF]">
              {language === 'hi' ? 'प्रशासक लॉगिन (Admin Portal)' : 'Admin & Staff Portal'}
            </h2>
            <p className="text-xs text-[#8A94B2]">
              {language === 'hi'
                ? 'फ्लोर, प्रसाधन और सफाई दल के एसएमएस अलर्ट प्रबंधित करने हेतु लॉगिन करें'
                : 'Access floor management, janitor alert routing, and cleaning verification'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#8A94B2] uppercase tracking-wider">
                Admin Username / ID
              </label>
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.35)] text-[#F2F5FF] text-sm focus:outline-none focus:border-[#C6FF00] font-mono transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#8A94B2] uppercase tracking-wider">
                Admin Password
              </label>
              <input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.35)] text-[#F2F5FF] text-sm focus:outline-none focus:border-[#C6FF00] font-mono transition-colors"
                required
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-[#FF3B4E]/10 border border-[#FF3B4E]/40 text-[#FF3B4E] text-xs">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#1F5BFF] hover:bg-[#1F5BFF]/90 text-white font-semibold text-sm shadow-[0_0_15px_rgba(31,91,255,0.4)] transition-all cursor-pointer"
            >
              {language === 'hi' ? 'लॉगिन करें (Sign In)' : 'Sign In as Admin'}
            </button>
          </form>

          <div className="pt-2 border-t border-[#1F5BFF]/20 text-center">
            <span className="text-[11px] font-mono text-[#8A94B2]">
              Exhibition Credentials: <span className="text-[#C6FF00]">admin</span> / <span className="text-[#C6FF00]">alaya2026</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Sorted washrooms by urgency score
  const prioritizedWashrooms = [...washrooms].sort((a, b) => b.cus - a.cus);
  const urgentCount = washrooms.filter((w) => w.status === 'RED').length;
  const unresolvedReports = cleaningReports.filter((r) => !r.resolved);
  const unresolvedMaintenance = maintenanceQueue.filter((m) => !m.resolved);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-[#0B0F1A] border border-[rgba(31,91,255,0.35)] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C6FF00] shadow-[0_0_8px_#C6FF00]" />
            <h2 className="text-xl font-bold text-[#F2F5FF]">
              {language === 'hi' ? 'प्रशासक एवं स्वच्छता प्रबंधन' : 'Admin & Hygiene Operations Center'}
            </h2>
          </div>
          <p className="text-xs text-[#8A94B2] mt-0.5">
            {floors.length} Floors · {washrooms.length} Monitored Facilities · Janitors alerted via SMS
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-xl bg-[#121829] border border-[#1F5BFF]/30 text-xs font-mono text-[#C6FF00] flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5" />
            <span>Today's SMS: {dailySmsSentCount}/{smsSettings.dailyCap}</span>
          </div>

          <button
            onClick={adminLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121829] hover:bg-[#FF3B4E]/20 text-[#8A94B2] hover:text-[#FF3B4E] border border-white/10 text-xs font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'लॉगआउट' : 'Log Out'}</span>
          </button>
        </div>
      </div>

      {/* Fallback Warning Banner if API fails */}
      {smsFallbackBannerActive && (
        <div className="p-3.5 rounded-xl bg-[#FFB020]/10 border border-[#FFB020]/50 flex items-center justify-between gap-3 text-xs text-[#FFB020]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#FFB020]" />
            <span>
              SMS API endpoint was unreachable. ALAYA automatically switched to DEMO mode so alert simulations continue.
            </span>
          </div>
        </div>
      )}

      {/* Subtabs Navigation */}
      <div className="flex border-b border-[#1F5BFF]/25 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setAdminSubTab('roster')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            adminSubTab === 'roster'
              ? 'bg-[#1F5BFF] text-white shadow-[0_0_15px_rgba(31,91,255,0.4)]'
              : 'bg-[#0B0F1A] text-[#8A94B2] hover:text-[#F2F5FF] border border-[rgba(31,91,255,0.2)]'
          }`}
        >
          <Clock className="w-4 h-4 text-[#C6FF00]" />
          <span>Cleaning Roster & Tasks</span>
          {urgentCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#FF3B4E] text-white font-mono font-bold">
              {urgentCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminSubTab('floors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            adminSubTab === 'floors'
              ? 'bg-[#1F5BFF] text-white shadow-[0_0_15px_rgba(31,91,255,0.4)]'
              : 'bg-[#0B0F1A] text-[#8A94B2] hover:text-[#F2F5FF] border border-[rgba(31,91,255,0.2)]'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#C6FF00]" />
          <span>Floors & Washrooms ({washrooms.length})</span>
        </button>

        <button
          onClick={() => setAdminSubTab('sms')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            adminSubTab === 'sms'
              ? 'bg-[#1F5BFF] text-white shadow-[0_0_15px_rgba(31,91,255,0.4)]'
              : 'bg-[#0B0F1A] text-[#8A94B2] hover:text-[#F2F5FF] border border-[rgba(31,91,255,0.2)]'
          }`}
        >
          <Radio className="w-4 h-4 text-[#C6FF00]" />
          <span>SMS Gateway & Alerts</span>
        </button>

        <button
          onClick={() => setAdminSubTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            adminSubTab === 'logs'
              ? 'bg-[#1F5BFF] text-white shadow-[0_0_15px_rgba(31,91,255,0.4)]'
              : 'bg-[#0B0F1A] text-[#8A94B2] hover:text-[#F2F5FF] border border-[rgba(31,91,255,0.2)]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#C6FF00]" />
          <span>Verification Logs & Audit</span>
        </button>
      </div>

      {/* SUBTAB 1: CLEANING ROSTER & TASKS (Integrated from Staff Page) */}
      {adminSubTab === 'roster' && (
        <div className="space-y-6">
          {/* Header notes */}
          <div className="p-4 rounded-xl bg-[#121829] border border-[#1F5BFF]/30 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-[#F2F5FF]">
                Staff Operations Pipeline (Zero App Login Required for Janitors)
              </div>
              <div className="text-[11px] text-[#8A94B2]">
                Janitors receive instant SMS triggers on urgent status. Supervisors verify cleaning through sensor decay.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetAllScoresToClean}
                className="px-3 py-1.5 rounded-lg bg-[#05060A] hover:bg-[#121829] text-[#8A94B2] hover:text-[#C6FF00] border border-[#1F5BFF]/30 text-xs font-mono transition-colors"
              >
                Reset All to Clean
              </button>
            </div>
          </div>

          {/* Prioritised Round List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#F2F5FF] flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#FF3B4E]" />
                <span>Prioritised Cleaning Rounds (Sorted by CUS Urgency)</span>
              </h3>
              <span className="text-xs font-mono text-[#8A94B2]">
                Green &lt; 40 · Amber 40-69 · Red ≥ 70
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prioritizedWashrooms.map((w) => {
                const statusBorder =
                  w.status === 'RED'
                    ? 'border-[#FF3B4E] shadow-[0_0_20px_rgba(255,59,78,0.2)]'
                    : w.status === 'AMBER'
                    ? 'border-[#FFB020]/60'
                    : w.status === 'WET_FLOOR'
                    ? 'border-[#1F5BFF]'
                    : 'border-[#1F5BFF]/30';

                const statusColor =
                  w.status === 'RED'
                    ? 'text-[#FF3B4E] bg-[#FF3B4E]/10'
                    : w.status === 'AMBER'
                    ? 'text-[#FFB020] bg-[#FFB020]/10'
                    : w.status === 'WET_FLOOR'
                    ? 'text-[#1F5BFF] bg-[#1F5BFF]/10'
                    : 'text-[#C6FF00] bg-[#C6FF00]/10';

                return (
                  <div
                    key={w.id}
                    className={`p-5 rounded-2xl bg-[#0B0F1A] border ${statusBorder} space-y-4 transition-all`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#121829] text-[#8A94B2] border border-[#1F5BFF]/20">
                            {w.floor}
                          </span>
                          <span className="text-[11px] font-mono text-[#C6FF00]">
                            {w.washroomType || 'Standard'}
                          </span>
                        </div>
                        <h4 className="font-semibold text-base text-[#F2F5FF] mt-1">{w.name}</h4>
                        <div className="text-xs text-[#8A94B2] mt-0.5">{w.location}</div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono text-2xl font-black text-[#F2F5FF]">
                          {w.cus}
                          <span className="text-xs font-normal text-[#8A94B2]">/100</span>
                        </div>
                        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${statusColor}`}>
                          {w.status === 'WET_FLOOR' ? 'WET FLOOR' : w.status}
                        </span>
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono p-2.5 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.2)]">
                      <div>
                        <div className="text-[10px] text-[#8A94B2]">AIR QUAL</div>
                        <div className="text-[#F2F5FF]">{w.airQuality}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#8A94B2]">REPORTS</div>
                        <div className="text-[#F2F5FF]">{w.userReports}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#8A94B2]">FOOTFALL</div>
                        <div className="text-[#F2F5FF]">{w.footfall}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#8A94B2]">TTT</div>
                        <div className="text-[#C6FF00]">
                          {typeof w.timeToThreshold === 'number' ? `${w.timeToThreshold}m` : w.timeToThreshold}
                        </div>
                      </div>
                    </div>

                    {/* Settling / Verification Status Banner */}
                    {w.isSettling ? (
                      <div className="p-3 rounded-xl bg-[#1F5BFF]/15 border border-[#1F5BFF] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-[#F2F5FF]">
                          <span className="w-2 h-2 rounded-full bg-[#1F5BFF] animate-ping" />
                          <span>Sensor audit in progress...</span>
                        </div>
                        <span className="font-mono font-bold text-[#C6FF00]">
                          {w.settlingSecondsRemaining}s left
                        </span>
                      </div>
                    ) : w.verificationState === 'VERIFIED' ? (
                      <div className="p-2 rounded-xl bg-[#C6FF00]/10 border border-[#C6FF00]/30 flex items-center gap-2 text-xs text-[#C6FF00]">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Last Clean VERIFIED by sensor decay</span>
                      </div>
                    ) : w.verificationState === 'UNVERIFIED' ? (
                      <div className="p-2 rounded-xl bg-[#FF3B4E]/10 border border-[#FF3B4E]/30 flex items-center gap-2 text-xs text-[#FF3B4E]">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Clean UNVERIFIED: Sensor readings did not improve</span>
                      </div>
                    ) : null}

                    {/* Action Buttons: Mark Cleaned & Demo Verification */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => markCleaned(w.id)}
                        disabled={w.isSettling}
                        className={`flex-1 py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          w.isSettling
                            ? 'bg-[#121829] text-[#8A94B2] cursor-not-allowed'
                            : 'bg-[#1F5BFF] hover:bg-[#1F5BFF]/90 text-white shadow-[0_0_12px_rgba(31,91,255,0.4)]'
                        }`}
                      >
                        <Check className="w-4 h-4 text-[#C6FF00]" />
                        <span>{w.isSettling ? 'Settling...' : 'Mark Cleaned'}</span>
                      </button>

                      {/* Fast demo overrides for science judges */}
                      <button
                        onClick={() => simulateCleanResult(w.id, 'VERIFIED')}
                        className="py-2 px-2.5 rounded-xl bg-[#C6FF00]/15 hover:bg-[#C6FF00]/25 text-[#C6FF00] text-[11px] font-mono border border-[#C6FF00]/40 transition-colors"
                        title="Simulate successful air quality decay (ΔAir > 8)"
                      >
                        Demo Pass
                      </button>
                      <button
                        onClick={() => simulateCleanResult(w.id, 'UNVERIFIED')}
                        className="py-2 px-2.5 rounded-xl bg-[#FF3B4E]/15 hover:bg-[#FF3B4E]/25 text-[#FF3B4E] text-[11px] font-mono border border-[#FF3B4E]/40 transition-colors"
                        title="Simulate unverified clean (no sensor improvement)"
                      >
                        Demo Fail
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Visitor Cleaning Reports Queue */}
          <div className="bg-[#0B0F1A] border border-[rgba(31,91,255,0.35)] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#C6FF00]" />
                <h4 className="font-bold text-sm text-[#F2F5FF]">
                  Live Visitor Problem Reports ({unresolvedReports.length} pending)
                </h4>
              </div>
              <span className="text-xs font-mono text-[#8A94B2]">
                From Door QR Code Scans
              </span>
            </div>

            {unresolvedReports.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#8A94B2] rounded-xl bg-[#05060A] border border-[#1F5BFF]/20">
                All visitor reports have been resolved. Facilities are operating clean.
              </div>
            ) : (
              <div className="divide-y divide-[#1F5BFF]/15 rounded-xl border border-[#1F5BFF]/25 overflow-hidden bg-[#05060A]">
                {unresolvedReports.map((report) => (
                  <div key={report.id} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#F2F5FF]">
                          {report.washroomName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF3B4E]/20 text-[#FF3B4E] uppercase font-bold">
                          {report.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#8A94B2]">
                        {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {report.text ? ` • "${report.text}"` : ''}
                      </div>
                    </div>

                    <button
                      onClick={() => resolveCleaningReport(report.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#C6FF00]/15 hover:bg-[#C6FF00]/25 text-[#C6FF00] text-xs font-medium border border-[#C6FF00]/40 transition-colors shrink-0"
                    >
                      Mark Resolved
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Maintenance Queue */}
          <div className="bg-[#0B0F1A] border border-[rgba(31,91,255,0.35)] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#1F5BFF]" />
                <h4 className="font-bold text-sm text-[#F2F5FF]">
                  Maintenance Queue ({unresolvedMaintenance.length} faults)
                </h4>
              </div>
              <span className="text-xs font-mono text-[#8A94B2]">
                Taps, Leaks & Fixture Faults
              </span>
            </div>

            {unresolvedMaintenance.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#8A94B2] rounded-xl bg-[#05060A] border border-[#1F5BFF]/20">
                No active fixture faults reported.
              </div>
            ) : (
              <div className="divide-y divide-[#1F5BFF]/15 rounded-xl border border-[#1F5BFF]/25 overflow-hidden bg-[#05060A]">
                {unresolvedMaintenance.map((m) => (
                  <div key={m.id} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#F2F5FF]">{m.washroomName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FFB020]/20 text-[#FFB020] uppercase font-bold">
                          {m.fault}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#8A94B2]">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {m.detail ? ` • ${m.detail}` : ''}
                      </div>
                    </div>

                    <button
                      onClick={() => resolveMaintenance(m.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#1F5BFF]/20 hover:bg-[#1F5BFF]/30 text-[#F2F5FF] text-xs font-medium border border-[#1F5BFF]/40 transition-colors shrink-0"
                    >
                      Mark Fixed
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: FLOORS & WASHROOMS MANAGEMENT */}
      {adminSubTab === 'floors' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-[#F2F5FF]">Floor & Facility Architecture</h3>
              <p className="text-xs text-[#8A94B2]">
                Manage school floors, janitor contact numbers, and generate door QR codes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddFloorModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1F5BFF] hover:bg-[#1F5BFF]/90 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#C6FF00]" />
                <span>Add Floor</span>
              </button>
            </div>
          </div>

          {/* List of Floors with their respective Washrooms */}
          <div className="space-y-5">
            {floors.map((floor) => {
              const floorWashrooms = washrooms.filter(
                (w) => w.floorId === floor.id || w.floor === floor.name
              );
              const isRevealed = !!revealedPhones[floor.id];
              const isEditing = editingPhoneId === floor.id;

              return (
                <div
                  key={floor.id}
                  className="bg-[#0B0F1A] border border-[rgba(31,91,255,0.35)] rounded-2xl p-5 space-y-4 shadow-md"
                >
                  {/* Floor Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1F5BFF]/20">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#1F5BFF]/20 border border-[#1F5BFF]/40 flex items-center justify-center text-[#C6FF00] font-mono font-bold text-sm">
                        {floor.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-[#F2F5FF]">{floor.name}</h4>
                          {floor.nameHi && (
                            <span className="text-xs text-[#8A94B2]">({floor.nameHi})</span>
                          )}
                        </div>
                        <div className="text-xs text-[#8A94B2] flex items-center gap-2 mt-0.5">
                          <span>Janitor: <strong className="text-[#F2F5FF]">{floor.janitorName || 'Unassigned'}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Janitor Phone Number Controls */}
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.25)] flex items-center gap-2 text-xs font-mono">
                        <Phone className="w-3.5 h-3.5 text-[#C6FF00]" />
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editingPhoneValue}
                              onChange={(e) => setEditingPhoneValue(e.target.value)}
                              placeholder="9876543210"
                              className="px-2 py-0.5 rounded bg-[#121829] text-[#F2F5FF] border border-[#1F5BFF] text-xs font-mono w-32 focus:outline-none"
                            />
                            <button
                              onClick={() => handleSavePhone(floor.id)}
                              className="p-1 rounded bg-[#C6FF00]/20 text-[#C6FF00] hover:bg-[#C6FF00]/30"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingPhoneId(null)}
                              className="p-1 rounded bg-[#FF3B4E]/20 text-[#FF3B4E] hover:bg-[#FF3B4E]/30"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-[#F2F5FF]">
                              {isRevealed ? floor.janitorPhone : maskIndianPhone(floor.janitorPhone)}
                            </span>
                            <button
                              onClick={() => togglePhoneReveal(floor.id)}
                              className="text-[#8A94B2] hover:text-[#C6FF00] p-1 rounded"
                              title={isRevealed ? 'Hide phone' : 'Show phone'}
                            >
                              {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => {
                                setEditingPhoneId(floor.id);
                                setEditingPhoneValue(floor.janitorPhone.replace('+91', ''));
                              }}
                              className="text-[#8A94B2] hover:text-[#1F5BFF] p-1 rounded"
                              title="Edit Phone"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Test SMS to Janitor */}
                      <button
                        onClick={async () => {
                          const res = await sendTestSms(floor.id);
                          alert(res.message);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-[#121829] hover:bg-[#1F5BFF]/20 text-[#8A94B2] hover:text-[#C6FF00] border border-[#1F5BFF]/30 text-xs font-mono transition-colors"
                        title="Send sample alert SMS to this janitor"
                      >
                        Test SMS
                      </button>

                      {/* Delete Floor */}
                      {floors.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${floor.name} and its washrooms?`)) {
                              removeFloor(floor.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-[#121829] hover:bg-[#FF3B4E]/20 text-[#8A94B2] hover:text-[#FF3B4E] border border-white/10 transition-colors"
                          title="Delete Floor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {editingPhoneError && editingPhoneId === floor.id && (
                    <div className="text-[11px] text-[#FF3B4E]">{editingPhoneError}</div>
                  )}

                  {/* Washrooms under this Floor */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[#8A94B2] uppercase tracking-wider">
                        Washrooms on this floor ({floorWashrooms.length})
                      </span>
                      <button
                        onClick={() => {
                          setTargetFloorId(floor.id);
                          setShowAddWashroomModal(true);
                        }}
                        className="flex items-center gap-1 text-xs text-[#C6FF00] hover:underline cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Washroom</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {floorWashrooms.map((w) => (
                        <div
                          key={w.id}
                          className="p-3.5 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.25)] flex flex-col justify-between gap-3 hover:border-[#1F5BFF]/60 transition-colors"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-[#F2F5FF]">{w.name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1F5BFF]/20 text-[#C6FF00] border border-[#1F5BFF]/30">
                                {w.washroomType || 'Standard'}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#8A94B2] mt-1">{w.location}</div>
                            {w.janitorPhoneOverride && (
                              <div className="text-[10px] font-mono text-[#C6FF00] mt-1">
                                Override: {maskIndianPhone(w.janitorPhoneOverride)}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-[#1F5BFF]/15">
                            <span className="text-xs font-mono font-bold text-[#F2F5FF]">
                              Score: <span className="text-[#C6FF00]">{w.cus}</span>
                            </span>

                            <div className="flex items-center gap-2">
                              {/* Generate Door QR Button */}
                              <button
                                onClick={() => setQrModalWashroom(w)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1F5BFF]/20 hover:bg-[#1F5BFF]/35 text-[#F2F5FF] hover:text-[#C6FF00] text-xs font-medium border border-[#1F5BFF]/40 transition-colors"
                                title="Generate printable door QR code"
                              >
                                <QrCode className="w-3.5 h-3.5 text-[#C6FF00]" />
                                <span>Door QR</span>
                              </button>

                              {/* Delete Washroom */}
                              {washrooms.length > 1 && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete ${w.name}?`)) {
                                      removeWashroom(w.id);
                                    }
                                  }}
                                  className="p-1 rounded-lg hover:bg-[#FF3B4E]/20 text-[#8A94B2] hover:text-[#FF3B4E] transition-colors"
                                  title="Delete washroom"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: SMS GATEWAY & ANTI-SPAM SETTINGS */}
      {adminSubTab === 'sms' && (
        <div className="space-y-6">
          <div className="bg-[#0B0F1A] border border-[rgba(31,91,255,0.35)] rounded-2xl p-6 space-y-6 shadow-md">
            <div>
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#C6FF00]" />
                <h3 className="font-bold text-base text-[#F2F5FF]">
                  SMS Alert Gateway & Anti-Spam Engine
                </h3>
              </div>
              <p className="text-xs text-[#8A94B2] mt-1">
                SMS Dispatch Policy: SMS alerts are sent <strong>ONLY when a consumer/visitor reports a problem on the Public Status page</strong>. Background slider adjustments do not send SMS.
              </p>
            </div>

            {/* Delivery Mode Selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-[#8A94B2]">
                Delivery Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(['FAST2SMS', 'LINK', 'DEMO', 'API'] as SmsDeliveryMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateSmsSettings({ mode })}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      smsSettings.mode === mode
                        ? 'bg-[#1F5BFF]/20 border-[#C6FF00] text-[#F2F5FF] shadow-[0_0_15px_rgba(31,91,255,0.3)]'
                        : 'bg-[#05060A] border-[rgba(31,91,255,0.25)] text-[#8A94B2] hover:border-[#1F5BFF]/60'
                    }`}
                  >
                    <div className="font-mono font-bold text-xs flex items-center justify-between">
                      <span>{mode === 'FAST2SMS' ? 'DIRECT REAL SMS' : `${mode} MODE`}</span>
                      {smsSettings.mode === mode && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C6FF00]" />
                      )}
                    </div>
                    <div className="text-[11px] mt-1 text-[#8A94B2]">
                      {mode === 'FAST2SMS' && 'Real direct SMS to SIM card in India via Fast2SMS.'}
                      {mode === 'LINK' && 'Direct 1-tap WhatsApp and Phone SMS App buttons.'}
                      {mode === 'DEMO' && 'On-screen simulated phone popup for science exhibition.'}
                      {mode === 'API' && 'Custom HTTP Webhook / Twilio Gateway.'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fast2SMS Key Card if FAST2SMS is active */}
            {smsSettings.mode === 'FAST2SMS' && (
              <div className="p-4 rounded-xl bg-[#121829] border border-[#1F5BFF]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C6FF00] animate-ping" />
                    <span className="text-xs font-semibold text-[#F2F5FF]">
                      Fast2SMS Real Mobile Gateway Setup
                    </span>
                  </div>
                  <a
                    href="https://www.fast2sms.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#C6FF00] hover:underline flex items-center gap-1 font-mono"
                  >
                    Get Free Key at fast2sms.com →
                  </a>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#8A94B2]">
                    Fast2SMS Authorization API Key
                  </label>
                  <input
                    type="password"
                    value={smsSettings.fast2smsApiKey || smsSettings.backendAccessKey || ''}
                    onChange={(e) =>
                      updateSmsSettings({
                        fast2smsApiKey: e.target.value.trim(),
                        backendAccessKey: e.target.value.trim(),
                      })
                    }
                    placeholder="Paste Fast2SMS API Key here"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.4)] text-sm text-[#F2F5FF] font-mono focus:outline-none focus:border-[#C6FF00]"
                  />
                  <p className="text-[11px] text-[#8A94B2]">
                    Steps: 1. <a href="https://www.fast2sms.com" target="_blank" className="text-[#C6FF00] underline">fast2sms.com</a> par free account banayein (free trial balance milta hai). 2. Left menu me <strong>"Dev API"</strong> par click karein. 3. <strong>"Authorization Key"</strong> copy karke yahan paste karein.
                  </p>
                </div>
              </div>
            )}

            {/* Gateway Configuration Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {smsSettings.mode === 'API' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[#8A94B2]">
                      Backend HTTP Endpoint URL (API Mode)
                    </label>
                    <input
                      type="url"
                      value={smsSettings.backendEndpointUrl}
                      onChange={(e) => updateSmsSettings({ backendEndpointUrl: e.target.value })}
                      placeholder="https://api.fast2sms.com/v1/send"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.3)] text-[#F2F5FF] text-xs font-mono focus:outline-none focus:border-[#C6FF00]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[#8A94B2]">
                      Gateway Secret / API Key (X-ALAYA-Key)
                    </label>
                    <input
                      type="password"
                      value={smsSettings.backendAccessKey}
                      onChange={(e) => updateSmsSettings({ backendAccessKey: e.target.value })}
                      placeholder="••••••••••••••••"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.3)] text-[#F2F5FF] text-xs font-mono focus:outline-none focus:border-[#C6FF00]"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#8A94B2]">
                  Daily SMS Cap (Anti-Spam Budget Limit)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={smsSettings.dailyCap}
                    onChange={(e) => updateSmsSettings({ dailyCap: Number(e.target.value) || 30 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.3)] text-[#F2F5FF] text-xs font-mono focus:outline-none focus:border-[#C6FF00]"
                  />
                  <span className="text-xs text-[#8A94B2] shrink-0 font-mono">
                    Sent: {dailySmsSentCount}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#8A94B2]">
                  Cooldown Gap (Min minutes between SMS per washroom)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={smsSettings.minGapMinutes}
                  onChange={(e) =>
                    updateSmsSettings({ minGapMinutes: Number(e.target.value) || 10 })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.3)] text-[#F2F5FF] text-xs font-mono focus:outline-none focus:border-[#C6FF00]"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-mono text-[#8A94B2]">
                  Dedicated Maintenance Phone (Optional, for Taps & Fixtures)
                </label>
                <input
                  type="text"
                  value={smsSettings.maintenancePhone || ''}
                  onChange={(e) => updateSmsSettings({ maintenancePhone: e.target.value })}
                  placeholder="e.g. 9811002233"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.3)] text-[#F2F5FF] text-xs font-mono focus:outline-none focus:border-[#C6FF00]"
                />
              </div>
            </div>

            {/* Test Connection Check */}
            <div className="p-4 rounded-xl bg-[#05060A] border border-[#1F5BFF]/30 space-y-3">
              <div className="text-xs font-semibold text-[#F2F5FF] flex items-center justify-between">
                <span>Test Gateway Connection</span>
                <span className="text-[11px] font-mono text-[#C6FF00]">Ping & Delivery Check</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="flex-1 px-3 py-2 rounded-lg bg-[#121829] border border-[#1F5BFF]/30 text-xs font-mono text-[#F2F5FF] focus:outline-none focus:border-[#C6FF00]"
                />
                <button
                  onClick={handleRunConnectionTest}
                  disabled={isTestingSms}
                  className="px-4 py-2 rounded-lg bg-[#1F5BFF] hover:bg-[#1F5BFF]/90 text-white text-xs font-semibold shadow transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#C6FF00]" />
                  <span>{isTestingSms ? 'Sending to Phone...' : 'Send Real SMS to Phone'}</span>
                </button>
              </div>

              {testResultMsg && (
                <div
                  className={`p-2.5 rounded-lg text-xs ${
                    testResultMsg.success
                      ? 'bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/30'
                      : 'bg-[#FF3B4E]/10 text-[#FF3B4E] border border-[#FF3B4E]/30'
                  }`}
                >
                  {testResultMsg.message}
                </div>
              )}
            </div>
          </div>

          {/* SMS Dispatch Log Table */}
          <div className="bg-[#0B0F1A] border border-[rgba(31,91,255,0.35)] rounded-2xl p-5 space-y-4 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-[#F2F5FF]">
                  SMS Gateway Audit Trail ({smsLogs.length} logged)
                </h4>
                <p className="text-[11px] text-[#8A94B2]">
                  Recipients masked in UI for privacy.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportSmsLogsCsv}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121829] hover:bg-[#1F5BFF]/20 text-[#8A94B2] hover:text-[#F2F5FF] border border-[#1F5BFF]/30 text-xs font-mono transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#C6FF00]" />
                  <span>Export CSV</span>
                </button>
                {smsLogs.length > 0 && (
                  <button
                    onClick={clearSmsLogs}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121829] hover:bg-[#FF3B4E]/20 text-[#8A94B2] hover:text-[#FF3B4E] border border-white/10 text-xs font-mono transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#1F5BFF]/25 bg-[#05060A]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#121829] text-[#8A94B2] border-b border-[#1F5BFF]/20 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Time</th>
                    <th className="p-3">Floor / Facility</th>
                    <th className="p-3">Janitor (Masked)</th>
                    <th className="p-3">Message Preview (≤160c)</th>
                    <th className="p-3">Delivery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F5BFF]/15">
                  {smsLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-[#8A94B2] font-sans">
                        No SMS alerts sent yet. Alerts trigger when a washroom enters Red status or cleaning is requested.
                      </td>
                    </tr>
                  ) : (
                    smsLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#121829]/40 transition-colors">
                        <td className="p-3 text-[#8A94B2] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="p-3 text-[#F2F5FF] whitespace-nowrap">
                          {log.floor} • {log.washroom}
                        </td>
                        <td className="p-3 text-[#C6FF00] whitespace-nowrap">{log.phone}</td>
                        <td className="p-3 text-[#F2F5FF] max-w-xs truncate" title={log.message}>
                          {log.message}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === 'Sent'
                                ? 'bg-[#C6FF00]/15 text-[#C6FF00]'
                                : log.status === 'Simulated'
                                ? 'bg-[#1F5BFF]/15 text-[#1F5BFF]'
                                : log.status === 'Opened in app'
                                ? 'bg-[#25D366]/15 text-[#25D366]'
                                : 'bg-[#FF3B4E]/15 text-[#FF3B4E]'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: VERIFICATION LOGS & AUDIT */}
      {adminSubTab === 'logs' && (
        <div className="space-y-6">
          <div className="bg-[#0B0F1A] border border-[rgba(31,91,255,0.35)] rounded-2xl p-5 space-y-4 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-[#F2F5FF]">
                  Empirical Verification Records ({cleaningLogs.length} records)
                </h4>
                <p className="text-xs text-[#8A94B2]">
                  Logged when cleaning is marked, comparing sensor levels before & after settling window.
                </p>
              </div>

              <button
                onClick={exportCsvLogs}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F5BFF] hover:bg-[#1F5BFF]/90 text-white text-xs font-semibold shadow transition-all"
              >
                <Download className="w-3.5 h-3.5 text-[#C6FF00]" />
                <span>Export Verification CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#1F5BFF]/25 bg-[#05060A]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#121829] text-[#8A94B2] border-b border-[#1F5BFF]/20 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Facility</th>
                    <th className="p-3">Sensor Result</th>
                    <th className="p-3">ΔAir Before/After</th>
                    <th className="p-3">Moisture</th>
                    <th className="p-3">Verification Rule Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F5BFF]/15">
                  {cleaningLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-[#8A94B2] font-sans">
                        No cleaning events verified yet. Mark a washroom as cleaned to start the settling countdown.
                      </td>
                    </tr>
                  ) : (
                    cleaningLogs.map((entry) => (
                      <tr key={entry.id} className="hover:bg-[#121829]/40 transition-colors">
                        <td className="p-3 text-[#8A94B2] whitespace-nowrap">
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-3 text-[#F2F5FF] whitespace-nowrap">{entry.washroomName}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              entry.status === 'VERIFIED'
                                ? 'bg-[#C6FF00]/15 text-[#C6FF00]'
                                : 'bg-[#FF3B4E]/15 text-[#FF3B4E]'
                            }`}
                          >
                            {entry.status}
                          </span>
                        </td>
                        <td className="p-3 text-[#F2F5FF]">
                          {entry.airBefore} → {entry.airAfter} (Δ{entry.airBefore - entry.airAfter})
                        </td>
                        <td className="p-3 text-[#8A94B2]">
                          {entry.moistureBefore} → {entry.moistureAfter}
                        </td>
                        <td className="p-3 text-[#8A94B2]">{entry.reason}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Exhibition Reset / Wipe Controls */}
          <div className="p-5 rounded-2xl bg-[#0B0F1A] border border-[#FF3B4E]/30 space-y-3">
            <div className="flex items-center gap-2 text-[#FF3B4E] font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Exhibition Data Reset Controls</span>
            </div>
            <p className="text-xs text-[#8A94B2]">
              Use before presenting to a new panel of science judges to reset all telemetry to pristine clean state.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={resetAllScoresToClean}
                className="px-4 py-2 rounded-xl bg-[#121829] hover:bg-[#1F5BFF]/20 text-[#F2F5FF] hover:text-[#C6FF00] border border-[#1F5BFF]/40 text-xs font-mono font-semibold transition-colors"
              >
                Reset All Scores to 0 (Clean)
              </button>

              {confirmClear ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      clearAllData();
                      setConfirmClear(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#FF3B4E] hover:bg-[#FF3B4E]/90 text-white text-xs font-mono font-bold transition-all"
                  >
                    Confirm Full Wipe
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-2 rounded-xl bg-[#121829] text-[#8A94B2] text-xs font-mono"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="px-4 py-2 rounded-xl bg-[#121829] hover:bg-[#FF3B4E]/20 text-[#8A94B2] hover:text-[#FF3B4E] border border-white/10 text-xs font-mono transition-colors"
                >
                  Clear All Logs & Reports
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD FLOOR */}
      {showAddFloorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0B0F1A] border border-[#1F5BFF]/40 rounded-2xl shadow-[0_0_35px_rgba(31,91,255,0.35)] overflow-hidden">
            <div className="bg-[#121829] px-5 py-3.5 border-b border-[#1F5BFF]/30 flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#F2F5FF] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#C6FF00]" />
                <span>Add New School Floor</span>
              </h3>
              <button
                onClick={() => setShowAddFloorModal(false)}
                className="text-[#8A94B2] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFloor} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#8A94B2]">Floor Name *</label>
                <input
                  type="text"
                  value={floorNameInput}
                  onChange={(e) => setFloorNameInput(e.target.value)}
                  placeholder="e.g. Second Floor / Science Block"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.3)] text-sm text-[#F2F5FF] focus:outline-none focus:border-[#C6FF00]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#8A94B2]">Janitor Name (Optional)</label>
                <input
                  type="text"
                  value={floorJanitorNameInput}
                  onChange={(e) => setFloorJanitorNameInput(e.target.value)}
                  placeholder="e.g. Santosh Sharma"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.3)] text-sm text-[#F2F5FF] focus:outline-none focus:border-[#C6FF00]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#8A94B2]">
                  Janitor Mobile Phone * (10-digit Indian Number)
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2 rounded-xl bg-[#121829] border border-[#1F5BFF]/30 text-xs font-mono text-[#C6FF00] font-semibold">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={floorJanitorPhoneInput}
                    onChange={(e) => setFloorJanitorPhoneInput(e.target.value)}
                    placeholder="9876543210"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.3)] text-sm text-[#F2F5FF] font-mono focus:outline-none focus:border-[#C6FF00]"
                    required
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-[#121829]/60 border border-[#1F5BFF]/30 text-[11px] text-[#8A94B2] space-y-1">
                  <div className="text-[#C6FF00] font-medium flex items-center gap-1.5">
                    <span>🔔 SMS Alert Rule:</span>
                  </div>
                  <p>
                    Janitor ko SMS alert <strong>tabhi jayega jab koi consumer/student Public Status page se problem raise karega</strong> (Floor wet, No soap, Bad smell, Bin full, ya Broken tap). Background score changes par baar-baar SMS nahi jayega.
                  </p>
                </div>
              </div>

              {floorPhoneError && (
                <div className="p-2.5 rounded-xl bg-[#FF3B4E]/10 border border-[#FF3B4E]/30 text-[#FF3B4E] text-xs">
                  {floorPhoneError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFloorModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#121829] text-[#8A94B2] text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1F5BFF] hover:bg-[#1F5BFF]/90 text-white text-xs font-semibold shadow-md"
                >
                  Create Floor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD WASHROOM */}
      {showAddWashroomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0B0F1A] border border-[#1F5BFF]/40 rounded-2xl shadow-[0_0_35px_rgba(31,91,255,0.35)] overflow-hidden">
            <div className="bg-[#121829] px-5 py-3.5 border-b border-[#1F5BFF]/30 flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#F2F5FF] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#C6FF00]" />
                <span>Add Washroom to Floor</span>
              </h3>
              <button
                onClick={() => setShowAddWashroomModal(false)}
                className="text-[#8A94B2] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWashroom} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#8A94B2]">Floor</label>
                <select
                  value={targetFloorId}
                  onChange={(e) => setTargetFloorId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.3)] text-sm text-[#F2F5FF] focus:outline-none focus:border-[#C6FF00]"
                >
                  {floors.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#8A94B2]">Washroom Name *</label>
                <input
                  type="text"
                  value={washroomNameInput}
                  onChange={(e) => setWashroomNameInput(e.target.value)}
                  placeholder="e.g. Senior Boys Washroom"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.3)] text-sm text-[#F2F5FF] focus:outline-none focus:border-[#C6FF00]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#8A94B2]">Washroom Type</label>
                <select
                  value={washroomTypeInput}
                  onChange={(e) => setWashroomTypeInput(e.target.value as WashroomType)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.3)] text-sm text-[#F2F5FF] focus:outline-none focus:border-[#C6FF00]"
                >
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                  <option value="Staff">Staff</option>
                  <option value="Unisex">Unisex</option>
                  <option value="Accessible">Accessible</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#8A94B2]">
                  Dedicated Janitor Override Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={washroomOverridePhoneInput}
                  onChange={(e) => setWashroomOverridePhoneInput(e.target.value)}
                  placeholder="Leave empty to use floor janitor phone"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.3)] text-sm text-[#F2F5FF] font-mono focus:outline-none focus:border-[#C6FF00]"
                />
              </div>

              {washroomPhoneError && (
                <div className="p-2.5 rounded-xl bg-[#FF3B4E]/10 border border-[#FF3B4E]/30 text-[#FF3B4E] text-xs">
                  {washroomPhoneError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddWashroomModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#121829] text-[#8A94B2] text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1F5BFF] hover:bg-[#1F5BFF]/90 text-white text-xs font-semibold shadow-md"
                >
                  Add Washroom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR CODE MODAL FOR ANY WASHROOM */}
      <QrCodeModal
        washroom={qrModalWashroom}
        onClose={() => setQrModalWashroom(null)}
        language={language}
      />
    </div>
  );
};
