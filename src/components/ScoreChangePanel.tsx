import React from 'react';
import { useAlaya } from '../context/AlayaContext';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Info,
  Clock,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { ScoreTimelineEvent } from '../types';

interface ScoreChangePanelProps {
  compact?: boolean;
  selectedWashroomId?: string;
}

export const ScoreChangePanel: React.FC<ScoreChangePanelProps> = ({
  compact = false,
  selectedWashroomId,
}) => {
  const {
    activeWashroom,
    latestScoreDiff,
    scoreTimeline,
    clearScoreTimeline,
    language,
    t,
  } = useAlaya();

  // Filter timeline if specific washroom requested
  const filteredTimeline = selectedWashroomId
    ? scoreTimeline.filter((e) => e.washroomId === selectedWashroomId)
    : scoreTimeline;

  const currentDiff = latestScoreDiff;
  const isIncrease = currentDiff.delta > 0;
  const isDecrease = currentDiff.delta < 0;

  const deltaColor = isIncrease
    ? 'text-[#FF3B4E]'
    : isDecrease
    ? 'text-[#C6FF00]'
    : 'text-[#8A94B2]';

  const deltaBg = isIncrease
    ? 'bg-[#FF3B4E]/10 border-[#FF3B4E]/30'
    : isDecrease
    ? 'bg-[#C6FF00]/10 border-[#C6FF00]/30'
    : 'bg-[#1F5BFF]/10 border-[#1F5BFF]/30';

  return (
    <div className="space-y-4">
      {/* Primary Card: Latest Delta & Primary Explanation */}
      <div className="bg-[#0B0F1A] border border-[rgba(31,91,255,0.35)] rounded-2xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#1F5BFF]/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C6FF00]" />
            <h3 className="font-semibold text-sm text-[#F2F5FF] tracking-wide">
              {language === 'hi' ? 'स्कोर क्यों बदला? (Why Score Changed)' : 'Why Did The Score Change?'}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#8A94B2]">
            {activeWashroom.name}
          </span>
        </div>

        {/* Delta Highlight Banner */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.25)]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${deltaBg} flex items-center justify-center`}>
              {isIncrease ? (
                <TrendingUp className="w-5 h-5 text-[#FF3B4E]" />
              ) : isDecrease ? (
                <TrendingDown className="w-5 h-5 text-[#C6FF00]" />
              ) : (
                <Minus className="w-5 h-5 text-[#8A94B2]" />
              )}
            </div>
            <div>
              <div className="text-xs text-[#8A94B2]">Cleanliness & Urgency Score</div>
              <div className="flex items-baseline gap-2 font-mono">
                <span className="text-sm text-[#8A94B2]">{currentDiff.oldScore}</span>
                <span className="text-[#8A94B2]">→</span>
                <span className="text-lg font-bold text-[#F2F5FF]">{currentDiff.newScore}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${deltaBg} ${deltaColor}`}>
                  {currentDiff.delta > 0 ? `+${currentDiff.delta}` : currentDiff.delta} pts
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono text-[#8A94B2] block">Dominant Driver</span>
            <span className="text-xs font-semibold text-[#C6FF00] font-mono">
              {currentDiff.topFactor}
            </span>
          </div>
        </div>

        {/* Plain Language Explanation in EN & HI */}
        <div className="mt-3.5 p-3 rounded-xl bg-[#121829] border border-[#1F5BFF]/30">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#1F5BFF] shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed space-y-1">
              <p className="text-[#F2F5FF] font-medium">
                {language === 'hi' ? currentDiff.reasonHi : currentDiff.reasonEn}
              </p>
              {language === 'hi' && (
                <p className="text-[11px] text-[#8A94B2] italic">{currentDiff.reasonEn}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contribution Factors Breakdown Table */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8A94B2] uppercase tracking-wider px-1">
            <span>Factor Impact Breakdown</span>
            <span>Weight × Change</span>
          </div>

          <div className="divide-y divide-[#1F5BFF]/15 rounded-xl border border-[#1F5BFF]/25 overflow-hidden bg-[#05060A]">
            {currentDiff.factors.map((f, i) => {
              const isTop = f.name === currentDiff.topFactor && Math.abs(f.pointsChange) > 0;
              const ptsStr =
                f.pointsChange > 0 ? `+${f.pointsChange.toFixed(1)}` : f.pointsChange.toFixed(1);

              return (
                <div
                  key={f.name}
                  className={`p-3 flex items-center justify-between transition-colors ${
                    isTop ? 'bg-[#C6FF00]/10 border-l-4 border-l-[#C6FF00]' : 'hover:bg-[#121829]/50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          isTop ? 'text-[#C6FF00]' : 'text-[#F2F5FF]'
                        }`}
                      >
                        {f.name}
                      </span>
                      {isTop && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#C6FF00] text-[#05060A] font-bold">
                          TOP CAUSE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#8A94B2]">{f.desc}</div>
                  </div>

                  <div className="text-right font-mono space-y-0.5">
                    <div
                      className={`text-xs font-bold ${
                        f.pointsChange > 0
                          ? 'text-[#FF3B4E]'
                          : f.pointsChange < 0
                          ? 'text-[#C6FF00]'
                          : 'text-[#8A94B2]'
                      }`}
                    >
                      {ptsStr} pts
                    </div>
                    <div className="text-[10px] text-[#8A94B2]">
                      w={f.weight} ({f.oldVal}→{f.newVal})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Horizontal Contribution Bars */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.25)] space-y-2">
          <div className="text-[11px] font-mono text-[#8A94B2] uppercase tracking-wider">
            Relative Contribution Stack
          </div>
          <div className="space-y-1.5">
            {currentDiff.factors.map((f) => {
              const absChange = Math.abs(f.pointsChange);
              const widthPct = Math.min(100, Math.round((absChange / 25) * 100));
              return (
                <div key={f.name} className="flex items-center gap-2 text-[11px]">
                  <span className="w-24 truncate text-[#8A94B2]">{f.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-[#121829] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        f.pointsChange > 0
                          ? 'bg-[#FF3B4E]'
                          : f.pointsChange < 0
                          ? 'bg-[#C6FF00]'
                          : 'bg-[#8A94B2]'
                      }`}
                      style={{ width: `${Math.max(4, widthPct)}%` }}
                    />
                  </div>
                  <span className="w-14 text-right font-mono text-[#F2F5FF]">
                    {f.pointsChange > 0 ? `+${f.pointsChange.toFixed(1)}` : f.pointsChange.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline of Past Score Changes (Last 20) */}
      {!compact && (
        <div className="bg-[#0B0F1A] border border-[rgba(31,91,255,0.35)] rounded-2xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#1F5BFF]/20">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1F5BFF]" />
              <h4 className="font-semibold text-sm text-[#F2F5FF]">
                {language === 'hi' ? 'स्कोर इतिहास टाइमलाइन' : 'Recent Score Delta Timeline'}
              </h4>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#121829] text-[#8A94B2] border border-[#1F5BFF]/20">
                {filteredTimeline.length} events
              </span>
            </div>

            {filteredTimeline.length > 0 && (
              <button
                onClick={clearScoreTimeline}
                className="flex items-center gap-1.5 text-xs text-[#8A94B2] hover:text-[#FF3B4E] transition-colors px-2 py-1 rounded-lg hover:bg-[#FF3B4E]/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'साफ़ करें' : 'Clear Timeline'}</span>
              </button>
            )}
          </div>

          <div className="mt-3 divide-y divide-[#1F5BFF]/15 max-h-72 overflow-y-auto pr-1">
            {filteredTimeline.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8A94B2]">
                No score changes recorded yet. Adjust simulator sliders or mark clean to generate events.
              </div>
            ) : (
              filteredTimeline.map((item) => {
                const diff = item.newScore - item.oldScore;
                const isWorse = diff > 0;
                const isBetter = diff < 0;

                return (
                  <div key={item.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-[#8A94B2]">{item.time}</span>
                        <span className="text-[#F2F5FF] font-medium">{item.washroomName}</span>
                        {item.trigger && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1F5BFF]/20 text-[#C6FF00] font-mono">
                            {item.trigger}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8A94B2]">
                        {language === 'hi' ? item.reasonHi : item.reasonEn}
                      </p>
                    </div>

                    <div className="text-right font-mono shrink-0">
                      <div className="flex items-center justify-end gap-1 font-semibold">
                        <span className="text-[#8A94B2]">{item.oldScore}</span>
                        <span className="text-[#8A94B2]">→</span>
                        <span className="text-[#F2F5FF]">{item.newScore}</span>
                        <span
                          className={`ml-1 text-[11px] ${
                            isWorse ? 'text-[#FF3B4E]' : isBetter ? 'text-[#C6FF00]' : 'text-[#8A94B2]'
                          }`}
                        >
                          ({diff > 0 ? `+${diff}` : diff})
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8A94B2]">
                        {item.oldStatus} → {item.newStatus}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
