import React, { useState, useEffect } from 'react';
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
  CameraOff,
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

  // Check URL parameters / hash on mount to select specific washroom from door QR code
  useEffect(() => {
    try {
      const fullHref = window.location.href;
      const url = new URL(fullHref);
      let targetId = url.searchParams.get('washroom');

      // Also support hash pattern #public?washroom=...
      if (!targetId && window.location.hash.includes('washroom=')) {
        const hashPart = window.location.hash.split('washroom=')[1];
        if (hashPart) {
          targetId = hashPart.split('&')[0];
        }
      }

      if (targetId && washrooms.some((w) => w.id === targetId)) {
        setSelectedWashroomId(targetId);
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }, [washrooms, setSelectedWashroomId]);

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
          textColor: 'text-[#C6FF00]',
          label: t.statusClean,
        };
      case 'AMBER':
        return {
          bg: 'bg-[#FFB020]/10',
          border: 'border-[#FFB020]',
          textColor: 'text-[#FFB020]',
          label: t.statusAmber,
        };
      case 'RED':
        return {
          bg: 'bg-[#FF3B4E]/10',
          border: 'border-[#FF3B4E]',
          textColor: 'text-[#FF3B4E]',
          label: t.statusUrgent,
        };
      case 'WET_FLOOR':
        return {
          bg: 'bg-[#1F5BFF]/10',
          border: 'border-[#1F5BFF]',
          textColor: 'text-[#1F5BFF]',
          label: t.statusWetFloor,
        };
      default:
        return {
          bg: 'bg-[#121829]',
          border: 'border-slate-600',
          textColor: 'text-[#F2F5FF]',
          label: 'Unknown',
        };
    }
  };

  const statusStyle = getStatusVisuals(activeWashroom.status);

  // Handle report submission
  const handleSubmit = (typeToSubmit: CleaningReportType = selectedReportType!) => {
    if (!typeToSubmit) return;
    setIsSubmitting(true);

    const result = submitReport(activeWashroom.id, typeToSubmit, reportNote);
    if (result.success) {
      setFeedbackToast({
        type: 'success',
        msg: language === 'hi'
          ? 'सूचना: सफाई दल को भेज दी गई है।'
          : 'Notice: Sent to the cleaning team.',
      });
      setSelectedReportType(null);
      setReportNote('');
    } else {
      setFeedbackToast({ type: 'warn', msg: result.message });
    }

    setIsSubmitting(false);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 5000);
  };

  const reportButtons: { type: CleaningReportType; label: string; icon: React.ReactNode }[] = [
    { type: 'floor_wet', label: t.reportFloorWet, icon: <Droplets className="w-4 h-4 text-[#1F5BFF]" /> },
    { type: 'no_soap', label: t.reportNoSoap, icon: <AlertTriangle className="w-4 h-4 text-[#FFB020]" /> },
    { type: 'bad_smell', label: t.reportBadSmell, icon: <AlertTriangle className="w-4 h-4 text-[#FF3B4E]" /> },
    { type: 'bin_full', label: t.reportBinFull, icon: <Trash2 className="w-4 h-4 text-[#8A94B2]" /> },
    { type: 'something_broken', label: t.reportBroken, icon: <Wrench className="w-4 h-4 text-[#FFB020]" /> },
    { type: 'all_fine', label: t.reportAllFine, icon: <CheckCircle className="w-4 h-4 text-[#C6FF00]" /> },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-16">
      {/* Washroom Selection Dropdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0B0F1A] border border-[rgba(31,91,255,0.35)] shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C6FF00] shadow-[0_0_8px_#C6FF00]" />
          <span className="text-xs font-mono text-[#8A94B2] uppercase tracking-wider">
            {language === 'hi' ? 'प्रसाधन चुनें:' : 'Select Facility:'}
          </span>
        </div>

        <select
          value={selectedWashroomId}
          onChange={(e) => setSelectedWashroomId(e.target.value)}
          className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-[#05060A] border border-[#1F5BFF]/30 text-xs text-[#F2F5FF] font-medium focus:outline-none focus:border-[#C6FF00]"
        >
          {washrooms.map((w) => (
            <option key={w.id} value={w.id}>
              {w.floor} • {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Status Display Card */}
      <div className={`rounded-2xl p-6 sm:p-8 bg-[#0B0F1A] border-2 ${statusStyle.border} shadow-[0_0_30px_rgba(0,0,0,0.5)] text-center space-y-4`}>
        <div className="space-y-1">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#121829] border border-[#1F5BFF]/30 text-[#8A94B2]">
            {activeWashroom.floor} • {activeWashroom.washroomType || 'Standard'}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F2F5FF] tracking-tight">
            {language === 'hi' ? activeWashroom.nameHi : activeWashroom.name}
          </h2>
          <p className="text-xs text-[#8A94B2]">
            {language === 'hi' ? activeWashroom.locationHi : activeWashroom.location}
          </p>
        </div>

        {/* Big Status Badge */}
        <div className="py-2">
          <div
            className={`inline-block px-6 py-3 rounded-2xl border-2 ${statusStyle.border} ${statusStyle.bg} ${statusStyle.textColor} font-black font-mono text-xl sm:text-2xl uppercase tracking-wider shadow-lg`}
          >
            {statusStyle.label}
          </div>
        </div>

        {/* Verified Clean Badge */}
        <div className="pt-2 border-t border-[#1F5BFF]/15 flex items-center justify-center gap-2 text-xs text-[#8A94B2] font-mono">
          <Clock className="w-3.5 h-3.5 text-[#1F5BFF]" />
          <span>
            {language === 'hi'
              ? `पिछली सत्यापित सफाई: ${activeWashroom.lastVerifiedCleanMinAgo} मिनट पहले`
              : `Last verified clean: ${activeWashroom.lastVerifiedCleanMinAgo} mins ago`}
          </span>
        </div>
      </div>

      {/* Feedback / Notification Banner */}
      {feedbackToast && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs animate-fade-in ${
            feedbackToast.type === 'success'
              ? 'bg-[#C6FF00]/15 border-[#C6FF00] text-[#C6FF00]'
              : 'bg-[#FFB020]/15 border-[#FFB020] text-[#FFB020]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span className="font-medium">{feedbackToast.msg}</span>
          </div>
        </div>
      )}

      {/* Two-Tap Quick Report Card */}
      <div className="bg-[#0B0F1A] border border-[rgba(31,91,255,0.35)] rounded-2xl p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C6FF00]" />
            <h3 className="font-bold text-sm text-[#F2F5FF]">
              {language === 'hi' ? 'समस्या बताएं (2-Tap Quick Report)' : 'Report a Washroom Issue'}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#8A94B2]">
            {language === 'hi' ? '100% अनाम' : '100% Anonymous'}
          </span>
        </div>

        <p className="text-xs text-[#8A94B2] leading-relaxed">
          {language === 'hi'
            ? 'नीचे दिए गए विकल्प पर टैप करें। यह सूचना सीधे स्वच्छता दल को बिना आपकी पहचान उजागर किए भेज दी जाएगी।'
            : 'Tap an issue below to notify the cleaning team immediately. No identity, phone numbers, or login required.'}
        </p>

        {/* 6 Grid Options */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {reportButtons.map((btn) => {
            const isSelected = selectedReportType === btn.type;
            const isAllFine = btn.type === 'all_fine';

            return (
              <button
                key={btn.type}
                onClick={() => {
                  setSelectedReportType(btn.type);
                  // If it's "all fine", submit right away!
                  if (isAllFine) {
                    handleSubmit(btn.type);
                  }
                }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1F5BFF]/25 border-[#C6FF00] text-[#F2F5FF] shadow-[0_0_12px_rgba(31,91,255,0.4)]'
                    : 'bg-[#05060A] border-[rgba(31,91,255,0.25)] text-[#8A94B2] hover:text-[#F2F5FF] hover:border-[#1F5BFF]/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  {btn.icon}
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#C6FF00]" />}
                </div>
                <span className="text-xs font-semibold leading-tight">{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Optional Note & Submit Button if an issue is selected (other than all fine) */}
        {selectedReportType && selectedReportType !== 'all_fine' && (
          <div className="pt-2 space-y-3 animate-fade-in">
            <input
              type="text"
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
              placeholder={language === 'hi' ? 'अतिरिक्त विवरण (वैकल्पिक)...' : 'Optional detail (e.g. 2nd cubicle tap)...'}
              className="w-full px-3.5 py-2 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.3)] text-xs text-[#F2F5FF] focus:outline-none focus:border-[#C6FF00]"
            />

            <button
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1F5BFF] hover:bg-[#1F5BFF]/90 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(31,91,255,0.4)] transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#C6FF00]" />
              <span>
                {isSubmitting
                  ? (language === 'hi' ? 'भेजा जा रहा है...' : 'Sending...')
                  : (language === 'hi' ? 'सफाई दल को भेजें (Submit Report)' : 'Send to Cleaning Team')}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Privacy Safeguard Note */}
      <div className="p-3.5 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.2)] flex items-center gap-3 text-xs text-[#8A94B2]">
        <CameraOff className="w-4 h-4 text-[#C6FF00] shrink-0" />
        <span>
          {language === 'hi'
            ? 'गोपनीयता वादा: कोई कैमरा नहीं, कोई व्यक्तिगत डेटा संग्रहीत नहीं।'
            : 'Privacy Guarantee: Zero camera surveillance, zero personal tracking.'}
        </span>
      </div>
    </div>
  );
};
