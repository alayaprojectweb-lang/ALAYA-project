import React from 'react';
import { useAlaya } from '../context/AlayaContext';
import { ScoreChangePanel } from '../components/ScoreChangePanel';
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
  Zap,
  Building,
} from 'lucide-react';
import { calculateCUS } from '../utils/cusLogic';

export const SimulatorPage: React.FC = () => {
  const {
    washrooms,
    selectedWashroomId,
    setSelectedWashroomId,
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

  const { airQuality, footfall, supplyLevel, moistureFlag, userReports, timeSinceLastClean } =
    activeWashroom;

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

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'GREEN':
        return 'text-[#C6FF00] border-[#C6FF00] bg-[#C6FF00]/10 shadow-[0_0_15px_rgba(198,255,0,0.25)]';
      case 'AMBER':
        return 'text-[#FFB020] border-[#FFB020] bg-[#FFB020]/10 shadow-[0_0_15px_rgba(255,176,32,0.25)]';
      case 'RED':
        return 'text-[#FF3B4E] border-[#FF3B4E] bg-[#FF3B4E]/10 shadow-[0_0_20px_rgba(255,59,78,0.3)] animate-pulse';
      case 'WET_FLOOR':
        return 'text-[#1F5BFF] border-[#1F5BFF] bg-[#1F5BFF]/10 shadow-[0_0_15px_rgba(31,91,255,0.25)]';
      default:
        return 'text-[#8A94B2] border-slate-700 bg-slate-900';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Washroom Selector */}
      <div className="bg-[#0B0F1A] border border-[rgba(31,91,255,0.35)] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#C6FF00]" />
            <h2 className="text-xl font-bold text-[#F2F5FF]">
              {language === 'hi' ? 'सेंसर सिम्युलेटर एवं निर्णय विश्लेषण' : 'Hygiene Sensor Simulator & CUS Engine'}
            </h2>
          </div>
          <p className="text-xs text-[#8A94B2] mt-0.5">
            Test real-time sensor variations, observe automatic SMS dispatching, and audit score delta factors.
          </p>
        </div>

        {/* Facility Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-[#8A94B2]">Target Washroom:</label>
          <select
            value={selectedWashroomId}
            onChange={(e) => setSelectedWashroomId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.3)] text-xs text-[#F2F5FF] font-medium focus:outline-none focus:border-[#C6FF00]"
          >
            {washrooms.map((w) => (
              <option key={w.id} value={w.id}>
                {w.floor} • {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Controls + Gauge on Left, "Why Did Score Change?" Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sliders & Quick Scenarios (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Score Gauge Display */}
          <div className="bg-[#0B0F1A] border border-[rgba(31,91,255,0.35)] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[#8A94B2]">
                Active Cleanliness & Urgency Score
              </span>
              <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                <span className="text-4xl sm:text-5xl font-black font-mono text-[#F2F5FF]">
                  {activeWashroom.cus}
                </span>
                <span className="text-sm font-mono text-[#8A94B2]">/ 100</span>
              </div>
              <div className="text-xs text-[#8A94B2]">
                Rate: <span className="font-mono text-[#C6FF00]">{activeWashroom.rate > 0 ? `+${activeWashroom.rate}` : activeWashroom.rate} pts/min</span>
                {' · '}
                TTT: <span className="font-mono text-[#F2F5FF]">{typeof activeWashroom.timeToThreshold === 'number' ? `${activeWashroom.timeToThreshold} mins` : activeWashroom.timeToThreshold}</span>
              </div>
            </div>

            <div className={`px-5 py-3 rounded-2xl border text-center font-mono font-bold text-sm tracking-wider uppercase ${getStatusColor(status)}`}>
              <div>{status === 'WET_FLOOR' ? 'WET FLOOR' : status}</div>
              <div className="text-[10px] font-normal opacity-80 mt-0.5">
                {status === 'GREEN' && 'Clean / Safe'}
                {status === 'AMBER' && 'Visit Needed Soon'}
                {status === 'RED' && 'URGENT DISPATCH'}
                {status === 'WET_FLOOR' && 'Caution: Wet Floor'}
              </div>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="bg-[#0B0F1A] border border-[rgba(31,91,255,0.35)] rounded-2xl p-6 space-y-5 shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-[#1F5BFF]/20">
              <h3 className="font-bold text-sm text-[#F2F5FF] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#C6FF00]" />
                <span>Adjust Sensor Inputs (0 - 100 Normalized)</span>
              </h3>
              <button
                onClick={resetAllScoresToClean}
                className="text-xs font-mono text-[#8A94B2] hover:text-[#C6FF00] flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Clean</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Air Quality (Ammonia / VOCs) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#F2F5FF] flex items-center gap-2">
                    <Wind className="w-4 h-4 text-[#1F5BFF]" />
                    <span>Air Quality Index (MQ-135 Gas / NH₃)</span>
                  </span>
                  <span className="font-mono font-bold text-[#C6FF00]">{airQuality}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={airQuality}
                  onChange={(e) => updateWashroomParams(selectedWashroomId, { airQuality: Number(e.target.value) })}
                  className="w-full accent-[#1F5BFF] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#8A94B2]">
                  <span>0 (Fresh)</span>
                  <span>Weight: 0.25</span>
                  <span>100 (Severe Odor)</span>
                </div>
              </div>

              {/* User Reports */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#F2F5FF] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C6FF00]" />
                    <span>Unresolved Visitor Reports</span>
                  </span>
                  <span className="font-mono font-bold text-[#C6FF00]">{userReports} ({Math.min(userReports * 25, 100)} pts)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={userReports}
                  onChange={(e) => updateWashroomParams(selectedWashroomId, { userReports: Number(e.target.value) })}
                  className="w-full accent-[#C6FF00] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#8A94B2]">
                  <span>0 Reports</span>
                  <span>Weight: 0.20 (Saturates at 4)</span>
                  <span>4+ Reports</span>
                </div>
              </div>

              {/* Time Elapsed */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#F2F5FF] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#1F5BFF]" />
                    <span>Time Elapsed Since Last Clean</span>
                  </span>
                  <span className="font-mono font-bold text-[#C6FF00]">{timeSinceLastClean} mins</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={timeSinceLastClean}
                  onChange={(e) => updateWashroomParams(selectedWashroomId, { timeSinceLastClean: Number(e.target.value) })}
                  className="w-full accent-[#1F5BFF] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#8A94B2]">
                  <span>0m</span>
                  <span>Weight: 0.15</span>
                  <span>100m+</span>
                </div>
              </div>

              {/* Footfall */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#F2F5FF] flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-[#C6FF00]" />
                    <span>Door Footfall PIR Heat Deltas</span>
                  </span>
                  <span className="font-mono font-bold text-[#C6FF00]">{footfall} people</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={footfall}
                  onChange={(e) => updateWashroomParams(selectedWashroomId, { footfall: Number(e.target.value) })}
                  className="w-full accent-[#C6FF00] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#8A94B2]">
                  <span>0 entries</span>
                  <span>Weight: 0.15</span>
                  <span>100 entries</span>
                </div>
              </div>

              {/* Floor Moisture (0 / 1) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#F2F5FF] flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-[#1F5BFF]" />
                    <span>Floor Moisture Sensor (Conductive Grid)</span>
                  </span>
                  <span className="font-mono font-bold text-[#1F5BFF]">
                    {moistureFlag === 1 ? 'WET (1)' : 'DRY (0)'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateWashroomParams(selectedWashroomId, { moistureFlag: 0 })}
                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                      moistureFlag === 0
                        ? 'bg-[#C6FF00]/20 border-[#C6FF00] text-[#C6FF00]'
                        : 'bg-[#05060A] border-[rgba(31,91,255,0.25)] text-[#8A94B2]'
                    }`}
                  >
                    DRY (0)
                  </button>
                  <button
                    onClick={() => updateWashroomParams(selectedWashroomId, { moistureFlag: 1 })}
                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                      moistureFlag === 1
                        ? 'bg-[#1F5BFF] border-[#1F5BFF] text-white shadow-[0_0_15px_rgba(31,91,255,0.5)]'
                        : 'bg-[#05060A] border-[rgba(31,91,255,0.25)] text-[#8A94B2]'
                    }`}
                  >
                    WET (1) [+15 pts]
                  </button>
                </div>
              </div>

              {/* Soap Supply Level (Negative Deduction) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#F2F5FF] flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#C6FF00]" />
                    <span>Soap / Supply Level (Negative Deduction)</span>
                  </span>
                  <span className="font-mono font-bold text-[#C6FF00]">{supplyLevel}% (−{(0.10 * supplyLevel).toFixed(0)} pts)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={supplyLevel}
                  onChange={(e) => updateWashroomParams(selectedWashroomId, { supplyLevel: Number(e.target.value) })}
                  className="w-full accent-[#C6FF00] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#8A94B2]">
                  <span>0% (Empty)</span>
                  <span>Weight: −0.10 (Good supply reduces urgency)</span>
                  <span>100% (Full)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Exhibition Scenario Presets */}
          <div className="bg-[#0B0F1A] border border-[rgba(31,91,255,0.35)] rounded-2xl p-5 space-y-3 shadow-md">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#8A94B2] font-mono">
              Quick Science Exhibition Scenarios
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() =>
                  updateWashroomParams(selectedWashroomId, {
                    airQuality: 15,
                    footfall: 10,
                    userReports: 0,
                    timeSinceLastClean: 5,
                    moistureFlag: 0,
                    supplyLevel: 95,
                  })
                }
                className="p-2.5 rounded-xl bg-[#05060A] hover:bg-[#121829] border border-[rgba(31,91,255,0.25)] hover:border-[#C6FF00] text-left text-xs transition-all"
              >
                <div className="font-semibold text-[#C6FF00]">01. Morning Clean</div>
                <div className="text-[10px] text-[#8A94B2] mt-0.5">Low footfall, fresh air</div>
              </button>

              <button
                onClick={() =>
                  updateWashroomParams(selectedWashroomId, {
                    airQuality: 55,
                    footfall: 60,
                    userReports: 1,
                    timeSinceLastClean: 45,
                    moistureFlag: 0,
                    supplyLevel: 40,
                  })
                }
                className="p-2.5 rounded-xl bg-[#05060A] hover:bg-[#121829] border border-[rgba(31,91,255,0.25)] hover:border-[#FFB020] text-left text-xs transition-all"
              >
                <div className="font-semibold text-[#FFB020]">02. Lunch Rush (Amber)</div>
                <div className="text-[10px] text-[#8A94B2] mt-0.5">Score ~52, visit needed</div>
              </button>

              <button
                onClick={() =>
                  updateWashroomParams(selectedWashroomId, {
                    airQuality: 85,
                    footfall: 90,
                    userReports: 3,
                    timeSinceLastClean: 75,
                    moistureFlag: 1,
                    supplyLevel: 10,
                  })
                }
                className="p-2.5 rounded-xl bg-[#05060A] hover:bg-[#121829] border border-[#FF3B4E]/40 hover:border-[#FF3B4E] text-left text-xs transition-all"
              >
                <div className="font-semibold text-[#FF3B4E]">03. Urgent Red Alert</div>
                <div className="text-[10px] text-[#8A94B2] mt-0.5">Triggers SMS to Janitor</div>
              </button>

              <button
                onClick={() =>
                  updateWashroomParams(selectedWashroomId, {
                    moistureFlag: 1,
                    airQuality: 20,
                  })
                }
                className="p-2.5 rounded-xl bg-[#05060A] hover:bg-[#121829] border border-[#1F5BFF]/40 text-left text-xs transition-all"
              >
                <div className="font-semibold text-[#1F5BFF]">04. Water Tap Spill</div>
                <div className="text-[10px] text-[#8A94B2] mt-0.5">Wet floor detected</div>
              </button>

              <button
                onClick={() => simulateCleanResult(selectedWashroomId, 'VERIFIED')}
                className="p-2.5 rounded-xl bg-[#C6FF00]/10 hover:bg-[#C6FF00]/20 border border-[#C6FF00]/40 text-left text-xs transition-all"
              >
                <div className="font-semibold text-[#C6FF00]">05. Verified Clean</div>
                <div className="text-[10px] text-[#8A94B2] mt-0.5">ΔAir &gt; 8 decay pass</div>
              </button>

              <button
                onClick={() => simulateCleanResult(selectedWashroomId, 'UNVERIFIED')}
                className="p-2.5 rounded-xl bg-[#FF3B4E]/10 hover:bg-[#FF3B4E]/20 border border-[#FF3B4E]/40 text-left text-xs transition-all"
              >
                <div className="font-semibold text-[#FF3B4E]">06. Unverified Clean</div>
                <div className="text-[10px] text-[#8A94B2] mt-0.5">No sensor change rejection</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: "Why Did Score Change?" Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <ScoreChangePanel selectedWashroomId={selectedWashroomId} />
        </div>
      </div>
    </div>
  );
};
