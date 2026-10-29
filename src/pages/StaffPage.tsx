import React, { useState } from 'react';
import { useAlaya } from '../context/AlayaContext';
import {
  Sparkles,
  Droplets,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BatteryCharging,
  Package,
  Wind,
  ShieldAlert,
  Building,
  Lock,
  Unlock,
  LogOut,
  UserCheck,
} from 'lucide-react';

export const StaffPage: React.FC = () => {
  const {
    washrooms,
    cleaningReports,
    resolveCleaningReport,
    markCleaned,
    maintenanceQueue,
    resolveMaintenance,
    mopState,
    cleaningLogs,
    availableFloors,
    staffSelectedFloor,
    setStaffSelectedFloor,
    staffAuth,
    staffLogin,
    staffLogout,
    language,
    t,
  } = useAlaya();

  // Login form state
  const [loginStaffId, setLoginStaffId] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = staffLogin(loginStaffId, loginPassword);
    if (!res.success) {
      setLoginError(res.error || t.staffAuthError);
    }
  };

  // If staff is NOT logged in, show simple Floor Staff Login screen
  if (!staffAuth.isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 alaya-card p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#121829] border border-[#1F5BFF]/40 flex items-center justify-center text-[#1F5BFF] shadow-[0_0_20px_rgba(31,91,255,0.25)]">
            <Lock className="w-6 h-6 text-[#C6FF00]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F2F5FF]">
            {t.staffLoginTitle}
          </h1>
          <p className="text-xs text-[#8A94B2] leading-relaxed">
            {t.staffLoginDesc}
          </p>
        </div>

        {loginError && (
          <div className="p-3 rounded-xl bg-[#FF3B4E]/15 border border-[#FF3B4E]/50 text-xs text-[#FF3B4E] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleStaffLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-[#8A94B2] block">
              {t.staffIdLabel}
            </label>
            <input
              type="text"
              required
              value={loginStaffId}
              onChange={(e) => setLoginStaffId(e.target.value)}
              placeholder="e.g. staff_gf, staff_ff, staff"
              className="w-full px-4 py-2.5 text-xs bg-[#121829] border border-[#1F5BFF]/40 rounded-xl text-[#F2F5FF] placeholder-[#8A94B2] focus:outline-none focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-[#8A94B2] block">
              {t.staffPasswordLabel}
            </label>
            <input
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••"
              className="w-full px-4 py-2.5 text-xs bg-[#121829] border border-[#1F5BFF]/40 rounded-xl text-[#F2F5FF] placeholder-[#8A94B2] focus:outline-none focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00]"
            />
          </div>

          {/* Quick Demo Credentials Help */}
          <div className="p-3 rounded-xl bg-[#05060A] border border-[#1F5BFF]/25 text-[11px] font-mono text-[#8A94B2] space-y-1.5">
            <div className="text-[#C6FF00] font-bold">Floor Staff Logins:</div>
            <div className="flex justify-between">
              <span>Ground Floor Staff:</span>
              <span className="text-[#F2F5FF]">ID: staff_gf | Pass: 1234</span>
            </div>
            <div className="flex justify-between">
              <span>First Floor Staff:</span>
              <span className="text-[#F2F5FF]">ID: staff_ff | Pass: 1234</span>
            </div>
            <div className="flex justify-between">
              <span>Master Staff (All Floors):</span>
              <span className="text-[#F2F5FF]">ID: staff | Pass: 1234</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#1F5BFF] hover:bg-[#1F5BFF]/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(31,91,255,0.4)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C6FF00]"
          >
            <Unlock className="w-4 h-4" />
            <span>{t.staffLoginBtn}</span>
          </button>
        </form>
      </div>
    );
  }

  // Active floor determination: if staff is assigned to a specific floor, lock to that floor
  const activeEffectiveFloor = staffAuth.floor === 'all' ? staffSelectedFloor : staffAuth.floor;

  // Filter washrooms by effective floor
  const floorWashrooms =
    activeEffectiveFloor === 'all'
      ? washrooms
      : washrooms.filter((w) => w.floor === activeEffectiveFloor);

  // Sort washrooms by CUS descending (highest urgency first), then timeToThreshold
  const prioritisedWashrooms = [...floorWashrooms].sort((a, b) => {
    if (b.cus !== a.cus) {
      return b.cus - a.cus;
    }
    const tttA = typeof a.timeToThreshold === 'number' ? a.timeToThreshold : 9999;
    const tttB = typeof b.timeToThreshold === 'number' ? b.timeToThreshold : 9999;
    return tttA - tttB;
  });

  // Filter maintenance items and active public cleaning reports for the floor
  const floorWashroomIds = new Set(floorWashrooms.map((w) => w.id));
  const floorMaintenanceQueue = maintenanceQueue.filter((m) =>
    activeEffectiveFloor === 'all' ? true : floorWashroomIds.has(m.washroomId)
  );
  const floorReports = cleaningReports.filter((r) =>
    !r.resolved && (activeEffectiveFloor === 'all' ? true : r.floor === activeEffectiveFloor || floorWashroomIds.has(r.washroomId))
  );

  // Simple tool recommendation
  const getToolHint = (w: typeof washrooms[0]) => {
    if (w.moistureFlag === 1) return t.hintMop;
    if (w.userReports >= 2) return t.hintGloves;
    if (w.supplyLevel < 35) return t.hintRefill;
    if (w.airQuality > 55) return t.hintVentilate;
    return t.hintStandard;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'GREEN':
        return {
          border: 'border-[#C6FF00]',
          bg: 'bg-[#C6FF00]/10',
          text: 'text-[#C6FF00]',
          label: t.statusClean,
        };
      case 'AMBER':
        return {
          border: 'border-[#FFB020]',
          bg: 'bg-[#FFB020]/10',
          text: 'text-[#FFB020]',
          label: t.statusAmber,
        };
      case 'RED':
        return {
          border: 'border-[#FF3B4E]',
          bg: 'bg-[#FF3B4E]/10',
          text: 'text-[#FF3B4E]',
          label: t.statusUrgent,
        };
      case 'WET_FLOOR':
        return {
          border: 'border-[#1F5BFF]',
          bg: 'bg-[#1F5BFF]/10',
          text: 'text-[#1F5BFF]',
          label: t.statusWetFloor,
        };
      default:
        return {
          border: 'border-slate-700',
          bg: 'bg-slate-900',
          text: 'text-slate-300',
          label: status,
        };
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Staff Logged In Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0B0F1A] border border-[#1F5BFF]/40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#121829] border border-[#C6FF00]/40 flex items-center justify-center text-[#C6FF00]">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#F2F5FF]">{t.staffDashboardTitle}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#C6FF00]/15 text-[#C6FF00] border border-[#C6FF00]/30">
                {staffAuth.staffId}
              </span>
            </div>
            <p className="text-xs text-[#8A94B2] mt-0.5">
              {t.staffAssignedFloor}{' '}
              <span className="text-[#1F5BFF] font-bold">
                {staffAuth.floor === 'all' ? 'All Floors (Supervisor Mode)' : staffAuth.floor}
              </span>
            </p>
          </div>
        </div>

        {/* Staff Logout Button */}
        <button
          onClick={staffLogout}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF3B4E]/15 hover:bg-[#FF3B4E]/25 text-[#FF3B4E] border border-[#FF3B4E]/40 text-xs font-semibold transition-all cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t.staffLogoutBtn}</span>
        </button>
      </div>

      {/* If Master Staff ('all'), show floor switcher tabs; otherwise locked to their assigned floor */}
      {staffAuth.floor === 'all' ? (
        <div className="alaya-card p-3 sm:p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#8A94B2]">
            <span className="flex items-center gap-1.5 text-[#F2F5FF] font-semibold">
              <Building className="w-4 h-4 text-[#1F5BFF]" />
              <span>Supervisor View: Switch Floor</span>
            </span>
            <span>{floorWashrooms.length} Zones on this floor</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setStaffSelectedFloor('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                staffSelectedFloor === 'all'
                  ? 'bg-[#1F5BFF] text-white border-[#1F5BFF] shadow-[0_0_15px_rgba(31,91,255,0.4)]'
                  : 'bg-[#121829] text-[#8A94B2] border-[#1F5BFF]/25 hover:text-[#F2F5FF]'
              }`}
            >
              {t.allFloors} ({washrooms.length})
            </button>

            {availableFloors.map((flr) => {
              const count = washrooms.filter((w) => w.floor === flr).length;
              const isSelected = staffSelectedFloor === flr;
              return (
                <button
                  key={flr}
                  onClick={() => setStaffSelectedFloor(flr)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#1F5BFF] text-white border-[#1F5BFF] shadow-[0_0_15px_rgba(31,91,255,0.4)]'
                      : 'bg-[#121829] text-[#8A94B2] border-[#1F5BFF]/25 hover:text-[#F2F5FF]'
                  }`}
                >
                  {flr} ({count})
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-[#121829] border border-[#1F5BFF]/30 text-xs text-[#8A94B2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-[#1F5BFF]" />
            <span>
              Showing washrooms exclusively for: <strong className="text-[#F2F5FF]">{staffAuth.floor}</strong>
            </span>
          </div>
          <span className="font-mono text-[#C6FF00]">{floorWashrooms.length} Assigned Zones</span>
        </div>
      )}

      {/* Prioritised Washrooms List for the Floor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#8A94B2] font-mono">
          <span>PRIORITY CLEANING ROSTER</span>
          <span>{prioritisedWashrooms.length} ZONES</span>
        </div>

        {prioritisedWashrooms.length === 0 ? (
          <div className="alaya-card p-8 text-center text-xs text-[#8A94B2]">
            No washrooms found for this floor.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {prioritisedWashrooms.map((w, index) => {
              const badge = getStatusBadge(w.status);
              const toolRecommendation = getToolHint(w);
              const latestLog = cleaningLogs.find((l) => l.washroomId === w.id);

              return (
                <div
                  key={w.id}
                  className={`alaya-card p-5 transition-all ${
                    w.status === 'RED'
                      ? 'border-[#FF3B4E]/60 bg-[#FF3B4E]/5'
                      : w.status === 'AMBER'
                      ? 'border-[#FFB020]/40'
                      : 'border-[#1F5BFF]/30'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left Column: Priority rank, Washroom Name, Score */}
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#121829] border border-[#1F5BFF]/40 flex items-center justify-center font-mono font-bold text-xs text-[#8A94B2] shrink-0">
                        #{index + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-[#F2F5FF]">
                            {language === 'hi' ? w.nameHi : w.name}
                          </h2>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${badge.border} ${badge.bg} ${badge.text}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-xs text-[#8A94B2] font-mono">
                          <span className="text-[#1F5BFF] font-semibold">{w.floor}</span> ·{' '}
                          {language === 'hi' ? w.locationHi : w.location} · Cleaned {w.timeSinceLastClean}m ago
                        </p>
                      </div>
                    </div>

                    {/* Middle Column: Score & Estimated Time */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-center bg-[#121829] p-3 rounded-xl border border-[#1F5BFF]/20">
                      <div>
                        <span className="text-[10px] font-mono text-[#8A94B2] uppercase block">
                          {t.cusScore}
                        </span>
                        <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#F2F5FF]">
                          {w.cus}
                          <span className="text-xs text-[#8A94B2] font-normal"> /100</span>
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-[#8A94B2] uppercase block">
                          {t.predictedThreshold}
                        </span>
                        <span className="text-sm sm:text-base font-bold font-mono text-[#C6FF00]">
                          {typeof w.timeToThreshold === 'number'
                            ? `~${w.timeToThreshold} min`
                            : w.timeToThreshold}
                        </span>
                      </div>

                      <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-[#1F5BFF]/20 pt-2 sm:pt-0 sm:pl-3">
                        <span className="text-[10px] font-mono text-[#8A94B2] uppercase block">
                          Current State
                        </span>
                        <span className="text-xs font-mono text-[#F2F5FF]">
                          Odor: {w.airQuality} · Floor: {w.moistureFlag ? 'WET' : 'DRY'} · Reports: {w.userReports}
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Kit Recommendation & Mark Cleaned Button */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                      {/* Tool Hint Pill */}
                      <div className="px-3 py-2 rounded-xl bg-[#05060A] border border-[#1F5BFF]/30 text-xs flex items-center gap-2 max-w-xs">
                        <Package className="w-4 h-4 text-[#C6FF00] shrink-0" />
                        <div className="truncate text-[#8A94B2]">
                          <span className="text-[10px] text-[#C6FF00] block font-mono uppercase">{t.toolHint}</span>
                          <span className="text-xs text-[#F2F5FF] truncate block">{toolRecommendation}</span>
                        </div>
                      </div>

                      {/* Mark Cleaned Trigger / Settling Countdown */}
                      {w.isSettling ? (
                        <div className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#1F5BFF]/20 border border-[#1F5BFF] flex items-center justify-center gap-3 text-xs font-mono text-[#F2F5FF] shadow-[0_0_15px_rgba(31,91,255,0.3)]">
                          <RotateCcw className="w-4 h-4 text-[#1F5BFF] animate-spin" />
                          <div>
                            <div className="font-bold text-[#C6FF00]">{t.settlingTitle}</div>
                            <div className="text-[10px] text-[#8A94B2]">
                              {w.settlingSecondsRemaining}s {t.settlingRemaining}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => markCleaned(w.id)}
                          className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#1F5BFF] hover:bg-[#1F5BFF]/90 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(31,91,255,0.4)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C6FF00]"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{t.markCleaned}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Active Problem Reports for this washroom */}
                  {(() => {
                    const activeReportsForRoom = cleaningReports.filter(
                      (r) => r.washroomId === w.id && !r.resolved
                    );
                    if (activeReportsForRoom.length === 0) return null;

                    return (
                      <div className="mt-4 pt-3 border-t border-[#1F5BFF]/25 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#FFB020]">
                          <AlertTriangle className="w-4 h-4 text-[#FF3B4E]" />
                          <span>{t.activeIssues} ({activeReportsForRoom.length}):</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {activeReportsForRoom.map((rep) => (
                            <div
                              key={rep.id}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#05060A] border border-[#FF3B4E]/40 text-xs"
                            >
                              <span className="font-bold text-[#F2F5FF]">
                                {rep.type === 'floor_wet'
                                  ? '💧 Floor Wet'
                                  : rep.type === 'no_soap'
                                  ? '🧼 No Soap/Paper'
                                  : rep.type === 'bad_smell'
                                  ? '👃 Bad Odor'
                                  : rep.type === 'bin_full'
                                  ? '🗑️ Bin Full'
                                  : rep.type}
                              </span>
                              {rep.text && (
                                <span className="text-[#8A94B2] italic font-mono text-[11px]">
                                  &quot;{rep.text}&quot;
                                </span>
                              )}
                              <span className="text-[10px] text-[#8A94B2] font-mono">
                                {new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <button
                                onClick={() => resolveCleaningReport(rep.id)}
                                className="ml-1 px-2 py-0.5 rounded bg-[#C6FF00]/15 hover:bg-[#C6FF00]/30 text-[#C6FF00] border border-[#C6FF00]/40 text-[10px] font-bold cursor-pointer transition-colors"
                                title="Mark this issue resolved"
                              >
                                {t.resolveReport} ✓
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Verification result explanation line if available */}
                  {latestLog && latestLog.washroomId === w.id && (
                    <div className="mt-4 pt-3 border-t border-[#1F5BFF]/20 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            latestLog.status === 'VERIFIED'
                              ? 'bg-[#C6FF00]/15 text-[#C6FF00]'
                              : 'bg-[#FF3B4E]/15 text-[#FF3B4E]'
                          }`}
                        >
                          {latestLog.status}
                        </span>
                        <span className="text-[#8A94B2]">{latestLog.reason}</span>
                      </div>
                      <span className="text-[#8A94B2]">
                        {new Date(latestLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Visitor & Student Problem Reports Queue */}
      <div className="alaya-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#FFB020]" />
            <h2 className="text-lg font-bold text-[#F2F5FF]">
              {t.publicReportsTitle} ({activeEffectiveFloor === 'all' ? 'All Floors' : activeEffectiveFloor})
            </h2>
          </div>
          <span className="text-xs font-mono text-[#C6FF00] font-bold">
            {floorReports.length} Active Alerts
          </span>
        </div>

        {floorReports.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#05060A] border border-[#1F5BFF]/25 text-xs text-[#8A94B2] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#C6FF00]" />
            <span>{t.noPublicReports}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {floorReports.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#0B0F1A] border border-[#FF3B4E]/40 space-y-2.5 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-[#F2F5FF]">{item.washroomName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      item.type === 'floor_wet'
                        ? 'bg-[#1F5BFF]/15 text-[#1F5BFF] border-[#1F5BFF]/40'
                        : item.type === 'bad_smell'
                        ? 'bg-[#FF3B4E]/15 text-[#FF3B4E] border-[#FF3B4E]/40'
                        : 'bg-[#FFB020]/15 text-[#FFB020] border-[#FFB020]/40'
                    }`}>
                      {item.type === 'floor_wet'
                        ? '💧 Floor Wet'
                        : item.type === 'no_soap'
                        ? '🧼 No Soap / Paper'
                        : item.type === 'bad_smell'
                        ? '👃 Bad Odor'
                        : item.type === 'bin_full'
                        ? '🗑️ Bin Full'
                        : item.type}
                    </span>
                  </div>

                  <p className="text-xs text-[#8A94B2]">
                    Floor: <strong className="text-[#F2F5FF]">{item.floor || 'School Washroom'}</strong>
                  </p>

                  {item.text && (
                    <p className="text-xs text-[#F2F5FF] bg-[#05060A] p-2.5 rounded-lg border border-[#1F5BFF]/25 italic">
                      &quot;{item.text}&quot;
                    </p>
                  )}

                  <p className="text-[10px] text-[#8A94B2] font-mono">
                    Reported: {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1F5BFF]/20 flex items-center justify-end">
                  <button
                    onClick={() => resolveCleaningReport(item.id)}
                    className="px-4 py-1.5 rounded-lg bg-[#C6FF00]/15 hover:bg-[#C6FF00]/25 text-[#C6FF00] border border-[#C6FF00]/40 text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-[0_0_10px_rgba(198,255,0,0.3)]"
                  >
                    {t.resolveReport} ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Maintenance & Repairs Queue for the Floor */}
      <div className="alaya-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#FF3B4E]" />
            <h2 className="text-lg font-bold text-[#F2F5FF]">
              {t.maintenanceQueue} ({activeEffectiveFloor === 'all' ? 'All Floors' : activeEffectiveFloor})
            </h2>
          </div>
          <span className="text-xs font-mono text-[#8A94B2]">
            {floorMaintenanceQueue.filter((m) => !m.resolved).length} Pending
          </span>
        </div>

        {floorMaintenanceQueue.length === 0 ? (
          <p className="text-xs text-[#8A94B2] py-4">{t.noMaintenance}</p>
        ) : (
          <div className="divide-y divide-[#1F5BFF]/20">
            {floorMaintenanceQueue.map((item) => (
              <div
                key={item.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#F2F5FF]">{item.washroomName}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                        item.resolved
                          ? 'bg-[#C6FF00]/15 text-[#C6FF00]'
                          : 'bg-[#FF3B4E]/15 text-[#FF3B4E]'
                      }`}
                    >
                      {item.resolved ? 'FIXED' : 'UNRESOLVED'}
                    </span>
                  </div>
                  <p className="text-[#8A94B2]">{item.fault}</p>
                  <p className="text-[10px] text-[#8A94B2] font-mono">
                    Reported: {new Date(item.timestamp).toLocaleTimeString()}
                    {item.resolvedAt && (
                      <span className="text-[#C6FF00] ml-2">
                        · Fixed: {new Date(item.resolvedAt).toLocaleTimeString()}
                      </span>
                    )}
                  </p>
                </div>

                {!item.resolved && (
                  <button
                    onClick={() => resolveMaintenance(item.id)}
                    className="min-h-[40px] px-4 py-1.5 rounded-lg bg-[#121829] hover:bg-[#1F5BFF] text-white border border-[#1F5BFF]/40 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-center"
                  >
                    {t.markFixed}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
