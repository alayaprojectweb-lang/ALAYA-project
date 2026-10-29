import React, { useState } from 'react';
import { useAlaya } from '../context/AlayaContext';
import { CleaningReportType } from '../types';
import {
  Sparkles,
  Droplets,
  AlertTriangle,
  Trash2,
  Wrench,
  CheckCircle,
  Clock,
  ShieldCheck,
  Send,
  Info,
  Check,
  RefreshCw,
} from 'lucide-react';

export const PublicStatusPage: React.FC = () => {
  const {
    washrooms,
    selectedWashroomId,
    setSelectedWashroomId,
    activeWashroom,
    submitReport,
    cleaningLogs,
    language,
    t,
  } = useAlaya();

  const [selectedReportType, setSelectedReportType] = useState<CleaningReportType | null>(null);
  const [reportNote, setReportNote] = useState<string>('');
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'warn'; msg: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Find latest verified clean log for this washroom
  const latestVerifiedLog = cleaningLogs.find(
    (l) => l.washroomId === activeWashroom.id && l.status === 'VERIFIED'
  );

  const getStatusVisuals = (status: string) => {
    switch (status) {
      case 'GREEN':
        return {
          bg: 'bg-[#C6FF00]/10',
          border: 'border-[#C6FF00]',
          glow: 'glow-lime',
          textColor: 'text-[#C6FF00]',
          label: t.statusClean,
          pulse: 'animate-pulse-lime',
        };
      case 'AMBER':
        return {
          bg: 'bg-[#FFB020]/10',
          border: 'border-[#FFB020]',
          glow: 'glow-amber',
          textColor: 'text-[#FFB020]',
          label: t.statusAmber,
          pulse: '',
        };
      case 'RED':
        return {
          bg: 'bg-[#FF3B4E]/10',
          border: 'border-[#FF3B4E]',
          glow: 'glow-red',
          textColor: 'text-[#FF3B4E]',
          label: t.statusUrgent,
          pulse: 'animate-pulse-red',
        };
      case 'WET_FLOOR':
        return {
          bg: 'bg-[#1F5BFF]/10',
          border: 'border-[#1F5BFF]',
          glow: 'glow-blue',
          textColor: 'text-[#1F5BFF]',
          label: t.statusWetFloor,
          pulse: '',
        };
      default:
        return {
          bg: 'bg-[#121829]',
          border: 'border-slate-600',
          glow: '',
          textColor: 'text-[#F2F5FF]',
          label: 'Unknown',
          pulse: '',
        };
    }
  };

  const statusStyle = getStatusVisuals(activeWashroom.status);

  // Handle report submission (two taps: 1 tap to select category, 1 tap to submit)
  const handleSubmit = (typeToSubmit: CleaningReportType = selectedReportType!) => {
    if (!typeToSubmit) return;
    setIsSubmitting(true);

    const result = submitReport(activeWashroom.id, typeToSubmit, reportNote);
    if (result.success) {
      setFeedbackToast({ type: 'success', msg: result.message });
      setSelectedReportType(null);
      setReportNote('');
    } else {
      setFeedbackToast({ type: 'warn', msg: result.message });
    }

    setIsSubmitting(false);

    // Auto dismiss toast after 5s
    setTimeout(() => {
      setFeedbackToast(null);
    }, 5000);
  };

  const reportButtons: {
    type: CleaningReportType;
    label: string;
    icon: React.ReactNode;
    color: string;
    isPrimaryFeedback?: boolean;
  }[] = [
    {
      type: 'floor_wet',
      label: t.reportFloorWet,
      icon: <Droplets className="w-5 h-5 text-[#1F5BFF]" />,
      color: 'hover:border-[#1F5BFF] hover:bg-[#1F5BFF]/10',
    },
    {
      type: 'no_soap',
      label: t.reportNoSoap,
      icon: <Sparkles className="w-5 h-5 text-[#FFB020]" />,
      color: 'hover:border-[#FFB020] hover:bg-[#FFB020]/10',
    },
    {
      type: 'bad_smell',
      label: t.reportBadSmell,
      icon: <AlertTriangle className="w-5 h-5 text-[#FF3B4E]" />,
      color: 'hover:border-[#FF3B4E] hover:bg-[#FF3B4E]/10',
    },
    {
      type: 'bin_full',
      label: t.reportBinFull,
      icon: <Trash2 className="w-5 h-5 text-[#FFB020]" />,
      color: 'hover:border-[#FFB020] hover:bg-[#FFB020]/10',
    },
    {
      type: 'something_broken',
      label: t.reportBroken,
      icon: <Wrench className="w-5 h-5 text-[#FF3B4E]" />,
      color: 'hover:border-[#FF3B4E] hover:bg-[#FF3B4E]/10',
    },
    {
      type: 'all_fine',
      label: t.reportAllFine,
      icon: <CheckCircle className="w-5 h-5 text-[#C6FF00]" />,
      color: 'hover:border-[#C6FF00] hover:bg-[#C6FF00]/10',
      isPrimaryFeedback: true,
    },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      {/* Washroom QR Location Switcher */}
      <div className="alaya-card p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-[#8A94B2]">
          <span className="font-mono uppercase">{t.scanLocation}</span>
          <span className="font-mono text-[10px]">QR LINK #53DF-7A51</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {washrooms.map((w) => {
            const isSelected = w.id === selectedWashroomId;
            return (
              <button
                key={w.id}
                onClick={() => setSelectedWashroomId(w.id)}
                className={`p-2.5 text-left rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#121829] border-[#1F5BFF] text-[#F2F5FF] shadow-[0_0_12px_rgba(31,91,255,0.3)]'
                    : 'bg-[#0B0F1A] border-[#1F5BFF]/20 text-[#8A94B2] hover:border-[#1F5BFF]/40'
                }`}
              >
                <div className="truncate">{language === 'hi' ? w.nameHi : w.name}</div>
                <div className="text-[10px] text-[#8A94B2] font-mono mt-0.5 truncate">
                  <span className="text-[#1F5BFF]">{w.floor}</span> · {language === 'hi' ? w.locationHi : w.location}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Status Display: Big Glowing Circle */}
      <div className="alaya-card p-6 sm:p-8 text-center flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
        {/* Verification Settling Banner */}
        {activeWashroom.isSettling && (
          <div className="w-full py-2 px-3 rounded-lg bg-[#1F5BFF]/15 border border-[#1F5BFF] flex items-center justify-center gap-2 text-xs font-mono text-[#F2F5FF]">
            <RefreshCw className="w-3.5 h-3.5 text-[#1F5BFF] animate-spin" />
            <span>
              {t.pendingVerification} ({activeWashroom.settlingSecondsRemaining}s {t.settlingRemaining})
            </span>
          </div>
        )}

        {/* Big Status Circle (Min 200px) */}
        <div className="relative my-2">
          <div
            className={`w-52 h-52 sm:w-60 sm:h-60 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-500 ${
              statusStyle.border
            } ${statusStyle.bg} ${statusStyle.glow} ${statusStyle.pulse}`}
          >
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#8A94B2]">
              CUS SCORE
            </span>
            <span className={`text-6xl sm:text-7xl font-extrabold font-mono tracking-tighter ${statusStyle.textColor}`}>
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

        {/* Status Metrics Strip */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm pt-2">
          {/* Last Verified Clean */}
          <div className="p-3 rounded-xl bg-[#121829] border border-[#1F5BFF]/25 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[#8A94B2] font-mono mb-1">
              <Clock className="w-3.5 h-3.5 text-[#8A94B2]" />
              <span>{t.lastVerifiedClean}</span>
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-[#F2F5FF]">
              {activeWashroom.lastVerifiedCleanMinAgo}{' '}
              <span className="text-xs font-normal text-[#8A94B2]">{t.minAgo}</span>
            </div>
          </div>

          {/* Time to threshold */}
          <div className="p-3 rounded-xl bg-[#121829] border border-[#1F5BFF]/25 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[#8A94B2] font-mono mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C6FF00]" />
              <span>{t.predictedThreshold}</span>
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-[#C6FF00]">
              {typeof activeWashroom.timeToThreshold === 'number'
                ? `~${activeWashroom.timeToThreshold} ${t.minAgo.replace('ago', '')}`
                : activeWashroom.timeToThreshold}
            </div>
          </div>
        </div>

        {/* Verification Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121829] border border-[#C6FF00]/40 text-xs text-[#F2F5FF]">
          <ShieldCheck className="w-4 h-4 text-[#C6FF00]" />
          <span>
            {t.verificationBadge} ·{' '}
            {latestVerifiedLog
              ? new Date(latestVerifiedLog.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Empirically Audited'}
          </span>
        </div>

        {/* Recent verified clean notice */}
        {latestVerifiedLog && (
          <p className="text-xs text-[#8A94B2] font-mono">
            Cleaned and verified at{' '}
            <span className="text-[#C6FF00]">
              {new Date(latestVerifiedLog.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            : {latestVerifiedLog.reason}
          </p>
        )}

        {/* Gas drift notice if flagged */}
        {activeWashroom.gasDriftDetected && (
          <div className="p-3 rounded-xl bg-[#FFB020]/15 border border-[#FFB020]/50 text-xs text-[#FFB020] text-left flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{t.gasDriftNotice}</span>
          </div>
        )}
      </div>

      {/* Two-Tap Report Form (Min 48px target buttons) */}
      <div className="alaya-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#F2F5FF]">{t.reportIssueTitle}</h2>
          <p className="text-xs text-[#8A94B2]">{t.reportIssueDesc}</p>
        </div>

        {/* Feedback alert banner */}
        {feedbackToast && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 font-medium border ${
              feedbackToast.type === 'success'
                ? 'bg-[#C6FF00]/15 border-[#C6FF00] text-[#C6FF00]'
                : 'bg-[#FFB020]/15 border-[#FFB020] text-[#FFB020]'
            }`}
          >
            {feedbackToast.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackToast.msg}</span>
          </div>
        )}

        {/* Grid of Report Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {reportButtons.map((btn) => {
            const isSelected = selectedReportType === btn.type;
            return (
              <button
                key={btn.type}
                onClick={() => {
                  setSelectedReportType(btn.type);
                  // If "All fine", direct submit on one tap or let user confirm
                  if (btn.type === 'all_fine') {
                    handleSubmit('all_fine');
                  }
                }}
                className={`min-h-[56px] p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C6FF00] ${
                  isSelected
                    ? 'bg-[#121829] border-[#1F5BFF] ring-2 ring-[#1F5BFF] text-[#F2F5FF]'
                    : `bg-[#0B0F1A] border-[#1F5BFF]/30 text-[#F2F5FF] ${btn.color}`
                }`}
              >
                <div className="p-2 rounded-lg bg-[#121829] shrink-0">{btn.icon}</div>
                <span className="text-xs sm:text-sm font-semibold leading-tight">{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Optional text input & Second Tap Confirmation */}
        {selectedReportType && selectedReportType !== 'all_fine' && (
          <div className="pt-2 space-y-3 animate-fadeIn">
            <input
              type="text"
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
              placeholder={t.optionalNote}
              maxLength={120}
              className="w-full px-4 py-3 text-xs bg-[#121829] border border-[#1F5BFF]/40 rounded-xl text-[#F2F5FF] placeholder-[#8A94B2] focus:outline-none focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00]"
            />

            <button
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#1F5BFF] hover:bg-[#1F5BFF]/90 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(31,91,255,0.4)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C6FF00]"
            >
              <Send className="w-4 h-4" />
              <span>{t.submitReport} (Tap 2)</span>
            </button>
          </div>
        )}

        <div className="pt-2 text-[11px] font-mono text-[#8A94B2] flex items-center justify-between border-t border-[#1F5BFF]/20">
          <span>Rate limit: 1 report / 2 min / browser</span>
          <span className="text-[#C6FF00]">0 PII collected</span>
        </div>
      </div>
    </div>
  );
};
