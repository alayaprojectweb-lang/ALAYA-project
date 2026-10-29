import React from 'react';
import { useAlaya } from '../context/AlayaContext';
import {
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  Droplets,
  Wind,
  Footprints,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { calculateCUS } from '../utils/cusLogic';

export const SimulatorPage: React.FC = () => {
  const {
    activeWashroom,
    updateWashroomParams,
    simulateCleanResult,
    runDaySimulation,
    isSimulatingDay,
    demoMode,
    setDemoMode,
    isAutoSimulateEnabled,
    setIsAutoSimulateEnabled,
    resetAllScoresToClean,
    language,
    t,
  } = useAlaya();

  // Current inputs for active washroom
  const { airQuality, footfall, supplyLevel, moistureFlag, userReports, timeSinceLastClean } =
    activeWashroom;

  // Formula calculation details
  const { breakdown, status } = calculateCUS({
    airQuality,
    userReportsCount: userReports,
    timeSinceLastClean,
    footfall,
    moistureFlag,
    supplyLevel,
    previousStatus: activeWashroom.status,
    isWetFloorAfterMop: activeWashroom.isWetFloorAfterMop,
  });

  const getStatusVisuals = (st: string) => {
    switch (st) {
      case 'GREEN':
        return {
          textColor: 'text-[#C6FF00]',
          border: 'border-[#C6FF00]',
          bg: 'bg-[#C6FF00]/10',
          glow: 'glow-lime',
          label: t.statusClean,
        };
      case 'AMBER':
        return {
          textColor: 'text-[#FFB020]',
          border: 'border-[#FFB020]',
          bg: 'bg-[#FFB020]/10',
          glow: 'glow-amber',
          label: t.statusAmber,
        };
      case 'RED':
        return {
          textColor: 'text-[#FF3B4E]',
          border: 'border-[#FF3B4E]',
          bg: 'bg-[#FF3B4E]/10',
          glow: 'glow-red',
          label: t.statusUrgent,
        };
      case 'WET_FLOOR':
        return {
          textColor: 'text-[#1F5BFF]',
          border: 'border-[#1F5BFF]',
          bg: 'bg-[#1F5BFF]/10',
          glow: 'glow-blue',
          label: t.statusWetFloor,
        };
      default:
        return {
          textColor: 'text-[#F2F5FF]',
          border: 'border-slate-700',
          bg: 'bg-slate-900',
          glow: '',
          label: st,
        };
    }
  };

  const statusStyle = getStatusVisuals(status);

  return (
    <div className="space-y-8 pb-16">
      {/* Title & Exhibition Demo Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F2F5FF] flex items-center gap-2">
            <Sliders className="w-7 h-7 text-[#C6FF00]" />
            <span>{t.simulatorTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8A94B2] mt-1">{t.simulatorSubtitle}</p>
        </div>

        {/* Demo Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Reset All to Clean (0 Score) */}
          <button
            onClick={resetAllScoresToClean}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#05060A] hover:bg-[#121829] text-[#C6FF00] border border-[#C6FF00]/40 text-xs font-semibold cursor-pointer transition-all shadow-sm"
            title="Reset all scores to 0 (Clean baseline)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C6FF00]" />
            <span>{t.resetClean}</span>
          </button>

          {/* Auto Mock Data Toggle */}
          <label className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
            isAutoSimulateEnabled
              ? 'bg-[#1F5BFF]/15 border-[#1F5BFF] text-[#F2F5FF]'
              : 'bg-[#121829] border-[#1F5BFF]/30 text-[#8A94B2]'
          }`}>
            <input
              type="checkbox"
              checked={isAutoSimulateEnabled}
              onChange={(e) => setIsAutoSimulateEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-[#1F5BFF] focus:ring-[#C6FF00] accent-[#1F5BFF]"
            />
            <span>{t.autoSimulateToggle}</span>
          </label>

          {/* Demo Mode Toggle (60s settling) */}
          <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121829] border border-[#1F5BFF]/35 cursor-pointer text-xs font-semibold text-[#F2F5FF]">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="w-4 h-4 rounded text-[#1F5BFF] focus:ring-[#C6FF00] accent-[#1F5BFF]"
            />
            <span className="text-[#C6FF00] font-mono">{t.demoModeToggle}</span>
          </label>

          {/* Run Day Simulation Fast-Forward */}
          <button
            onClick={runDaySimulation}
            disabled={isSimulatingDay}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(31,91,255,0.4)] cursor-pointer ${
              isSimulatingDay
                ? 'bg-[#1F5BFF]/40 text-slate-300'
                : 'bg-[#1F5BFF] hover:bg-[#1F5BFF]/90 text-white'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isSimulatingDay ? 'animate-spin' : ''}`} />
            <span>{isSimulatingDay ? t.daySimRunning : t.runDaySimulation}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage: Live Gauge & Math substitution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Big Live CUS Gauge & State (5 cols) */}
        <div className="alaya-card p-6 lg:col-span-5 flex flex-col items-center justify-between space-y-6 text-center">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8A94B2]">
              ALAYA Live Output Gauge
            </span>
            <h2 className="text-base font-bold text-[#F2F5FF]">
              {language === 'hi' ? activeWashroom.nameHi : activeWashroom.name}
            </h2>
          </div>

          {/* Big Circular Gauge */}
          <div className="relative my-2">
            <div
              className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 ${
                statusStyle.border
              } ${statusStyle.bg} ${statusStyle.glow}`}
            >
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A94B2]">
                CUS SCORE
              </span>
              <span
                className={`text-6xl sm:text-7xl font-extrabold font-mono tracking-tighter ${statusStyle.textColor}`}
              >
                {activeWashroom.cus}
              </span>
              <span className="text-xs font-mono text-[#8A94B2] mt-0.5">/ 100</span>

              <div className="mt-2 px-3 py-1 rounded-full bg-[#05060A]/80 border border-[#1F5BFF]/40">
                <span className={`text-xs font-bold tracking-wide ${statusStyle.textColor}`}>
                  {statusStyle.label}
                </span>
              </div>
            </div>
          </div>

          {/* Time to threshold readout */}
          <div className="w-full grid grid-cols-2 gap-3 text-left">
            <div className="p-3 rounded-xl bg-[#121829] border border-[#1F5BFF]/25">
              <span className="text-[10px] font-mono text-[#8A94B2] uppercase block">
                Time to Threshold
              </span>
              <span className="text-lg font-bold font-mono text-[#C6FF00]">
                {typeof activeWashroom.timeToThreshold === 'number'
                  ? `~${activeWashroom.timeToThreshold} min`
                  : activeWashroom.timeToThreshold}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#121829] border border-[#1F5BFF]/25">
              <span className="text-[10px] font-mono text-[#8A94B2] uppercase block">
                Rate of Increase
              </span>
              <span className="text-lg font-bold font-mono text-[#F2F5FF]">
                +{activeWashroom.rate}/min
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actual Numbers Substituted into Formula (7 cols) */}
        <div className="alaya-card p-6 lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#1F5BFF]">
              Science Exhibition Algebraic Proof
            </span>
            <h2 className="text-lg font-bold text-[#F2F5FF]">The Cleanliness & Urgency Formula</h2>
            <p className="text-xs text-[#8A94B2]">
              Watch how each physical variable modifies the overall score in real time.
            </p>
          </div>

          {/* Formula Display Box */}
          <div className="p-4 rounded-xl bg-[#05060A] border border-[#1F5BFF]/35 font-mono text-xs sm:text-sm space-y-3">
            <div className="text-[#8A94B2] text-[11px] border-b border-[#1F5BFF]/20 pb-2">
              CUS = 0.25×Air + 0.20×Reports + 0.15×Time + 0.15×Footfall + 0.15×(Moisture×100) − 0.10×Supply
            </div>

            <div className="text-[#F2F5FF] leading-relaxed break-words font-semibold">
              = <span className="text-[#1F5BFF]">0.25×({airQuality})</span>
              {' + '}
              <span className="text-[#FFB020]">0.20×({breakdown.userReportsNormalized})</span>
              {' + '}
              <span className="text-[#8A94B2]">0.15×({timeSinceLastClean})</span>
              {' + '}
              <span className="text-[#1F5BFF]">0.15×({footfall})</span>
              {' + '}
              <span className="text-[#1F5BFF]">0.15×({moistureFlag * 100})</span>
              {' − '}
              <span className="text-[#C6FF00]">0.10×({supplyLevel})</span>
            </div>

            <div className="pt-2 border-t border-[#1F5BFF]/20 flex items-center justify-between">
              <span className="text-xs text-[#8A94B2]">Calculated:</span>
              <span className="text-base font-bold text-[#C6FF00]">
                {breakdown.rawTotal.toFixed(1)} → Clamped: {activeWashroom.cus}
              </span>
            </div>
          </div>

          {/* Demonstration of Empirical Verification (Air improves vs Nothing changes) */}
          <div className="p-4 rounded-xl bg-[#121829] border border-[#1F5BFF]/30 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#C6FF00]" />
              <span className="text-xs font-bold text-[#F2F5FF]">
                Exhibition Clean Verification Test (Rule: ΔAir &gt; 8 pts or 1 → 0 Dry-off)
              </span>
            </div>
            <p className="text-xs text-[#8A94B2]">
              Prove to judges that unverified cleans do NOT reset the score, preventing phantom logs!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Option A: Air Improves */}
              <button
                onClick={() => simulateCleanResult(activeWashroom.id, 'VERIFIED')}
                className="p-3 rounded-xl bg-[#C6FF00]/15 hover:bg-[#C6FF00]/25 border border-[#C6FF00]/40 text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C6FF00]"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#C6FF00]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{t.simCleanAirImproves}</span>
                </div>
                <p className="text-[10px] text-[#8A94B2] mt-1">
                  Ammonia drops &gt;8 pts → Score resets to Clean!
                </p>
              </button>

              {/* Option B: Nothing changes */}
              <button
                onClick={() => simulateCleanResult(activeWashroom.id, 'UNVERIFIED')}
                className="p-3 rounded-xl bg-[#FF3B4E]/15 hover:bg-[#FF3B4E]/25 border border-[#FF3B4E]/40 text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF3B4E]"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF3B4E]">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>{t.simCleanNoChange}</span>
                </div>
                <p className="text-[10px] text-[#8A94B2] mt-1">
                  No drop detected → Logged as Unverified, score stays elevated!
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Parameter Control Sliders */}
      <div className="alaya-card p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F5BFF]/20">
          <div>
            <h2 className="text-base font-bold text-[#F2F5FF]">Real-Time Variable Manipulation</h2>
            <p className="text-xs text-[#8A94B2]">
              Drag the rails to trigger immediate re-calculations and band transitions.
            </p>
          </div>
          <button
            onClick={() =>
              updateWashroomParams(activeWashroom.id, {
                airQuality: 20,
                footfall: 15,
                supplyLevel: 90,
                moistureFlag: 0,
                userReports: 0,
                timeSinceLastClean: 10,
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121829] hover:bg-[#1F5BFF]/30 text-xs font-mono text-[#8A94B2] hover:text-[#F2F5FF] border border-[#1F5BFF]/30 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Clean</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Air Quality Slider */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#121829] border border-[#1F5BFF]/25">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#F2F5FF] flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-[#1F5BFF]" />
                {t.airQuality}
              </span>
              <span className="font-mono font-bold text-[#C6FF00]">{airQuality} /100</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={airQuality}
              onChange={(e) =>
                updateWashroomParams(activeWashroom.id, { airQuality: Number(e.target.value) })
              }
              className="w-full h-2 bg-[#05060A] rounded-lg appearance-none cursor-pointer accent-[#1F5BFF]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#8A94B2]">
              <span>0 (Pristine)</span>
              <span>70+ (Stench)</span>
              <span>100</span>
            </div>
          </div>

          {/* Footfall Slider */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#121829] border border-[#1F5BFF]/25">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#F2F5FF] flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-[#C6FF00]" />
                {t.footfall}
              </span>
              <span className="font-mono font-bold text-[#C6FF00]">{footfall} entries</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={footfall}
              onChange={(e) =>
                updateWashroomParams(activeWashroom.id, { footfall: Number(e.target.value) })
              }
              className="w-full h-2 bg-[#05060A] rounded-lg appearance-none cursor-pointer accent-[#1F5BFF]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#8A94B2]">
              <span>0 visits</span>
              <span>50 visits</span>
              <span>100</span>
            </div>
          </div>

          {/* Supply Level Slider */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#121829] border border-[#1F5BFF]/25">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#F2F5FF] flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#FFB020]" />
                {t.supplyLevel}
              </span>
              <span className="font-mono font-bold text-[#C6FF00]">{supplyLevel}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={supplyLevel}
              onChange={(e) =>
                updateWashroomParams(activeWashroom.id, { supplyLevel: Number(e.target.value) })
              }
              className="w-full h-2 bg-[#05060A] rounded-lg appearance-none cursor-pointer accent-[#1F5BFF]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#8A94B2]">
              <span>0% (Empty)</span>
              <span>50%</span>
              <span>100% (Full)</span>
            </div>
          </div>

          {/* Time Since Last Clean Slider */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#121829] border border-[#1F5BFF]/25">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#F2F5FF] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#8A94B2]" />
                {t.timeSinceClean}
              </span>
              <span className="font-mono font-bold text-[#C6FF00]">{timeSinceLastClean} min</span>
            </div>
            <input
              type="range"
              min={0}
              max={120}
              value={timeSinceLastClean}
              onChange={(e) =>
                updateWashroomParams(activeWashroom.id, {
                  timeSinceLastClean: Number(e.target.value),
                })
              }
              className="w-full h-2 bg-[#05060A] rounded-lg appearance-none cursor-pointer accent-[#1F5BFF]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#8A94B2]">
              <span>0 min</span>
              <span>60 min</span>
              <span>120 min</span>
            </div>
          </div>

          {/* User Reports Stepper (0-4) */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#121829] border border-[#1F5BFF]/25">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#F2F5FF] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FFB020]" />
                {t.userReports} (Saturates at 4)
              </span>
              <span className="font-mono font-bold text-[#C6FF00]">
                {userReports} ({breakdown.userReportsNormalized} pts)
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {[0, 1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => updateWashroomParams(activeWashroom.id, { userReports: n })}
                  className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer border ${
                    userReports === n
                      ? 'bg-[#1F5BFF] text-white border-[#1F5BFF] shadow-[0_0_10px_rgba(31,91,255,0.4)]'
                      : 'bg-[#05060A] text-[#8A94B2] border-[#1F5BFF]/30 hover:text-[#F2F5FF]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Moisture Flag Toggle (Dry 0 / Wet 1) */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#121829] border border-[#1F5BFF]/25">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#F2F5FF] flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-[#1F5BFF]" />
                {t.moisture} Flag
              </span>
              <span
                className={`font-mono font-bold ${
                  moistureFlag === 1 ? 'text-[#1F5BFF]' : 'text-[#C6FF00]'
                }`}
              >
                {moistureFlag === 1 ? 'WET (1)' : 'DRY (0)'}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => updateWashroomParams(activeWashroom.id, { moistureFlag: 0 })}
                className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer border ${
                  moistureFlag === 0
                    ? 'bg-[#C6FF00]/15 text-[#C6FF00] border-[#C6FF00]/40'
                    : 'bg-[#05060A] text-[#8A94B2] border-[#1F5BFF]/30'
                }`}
              >
                DRY (0)
              </button>
              <button
                onClick={() => updateWashroomParams(activeWashroom.id, { moistureFlag: 1 })}
                className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer border ${
                  moistureFlag === 1
                    ? 'bg-[#1F5BFF] text-white border-[#1F5BFF] shadow-[0_0_10px_rgba(31,91,255,0.4)]'
                    : 'bg-[#05060A] text-[#8A94B2] border-[#1F5BFF]/30'
                }`}
              >
                WET (1)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
