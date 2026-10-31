import React from 'react';
import { useAlaya } from '../context/AlayaContext';
import { Smartphone, X, Send, CheckCircle2, MessageSquare, AlertTriangle, ShieldCheck } from 'lucide-react';

export const SmsAlertModal: React.FC = () => {
  const { activeSmsModal, dismissSmsModal, language } = useAlaya();

  if (!activeSmsModal) return null;

  const { floor, washroom, phone, rawPhone, message, mode, timestamp, reason } = activeSmsModal;
  const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Direct Mobile Links
  const encodedMsg = encodeURIComponent(message);
  const smsHref = `sms:+91${rawPhone}?body=${encodedMsg}`;
  const whatsappHref = `https://wa.me/91${rawPhone}?text=${encodedMsg}`;

  const isRealCarrierSent = mode === 'FAST2SMS';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0B0F1A] border-2 border-[#1F5BFF] rounded-2xl shadow-[0_0_35px_rgba(31,91,255,0.4)] overflow-hidden">
        {/* Top Header bar */}
        <div className="bg-[#121829] px-5 py-3.5 border-b border-[#1F5BFF]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1F5BFF]/20 border border-[#1F5BFF]/50 flex items-center justify-center text-[#1F5BFF]">
              <Smartphone className="w-4 h-4 text-[#C6FF00]" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#C6FF00] font-semibold flex items-center gap-1.5">
                <span>ALAYA Phone Alert Gateway</span>
              </div>
              <div className="text-[11px] text-[#8A94B2] flex items-center gap-1.5 mt-0.5">
                <span>{timeStr}</span>
                <span>•</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono border ${
                  isRealCarrierSent
                    ? 'bg-[#C6FF00]/15 text-[#C6FF00] border-[#C6FF00]/40'
                    : 'bg-[#1F5BFF]/20 text-[#1F5BFF] border-[#1F5BFF]/40'
                }`}>
                  {isRealCarrierSent ? 'REAL CARRIER SMS SENT' : `${mode} MODE`}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={dismissSmsModal}
            className="text-[#8A94B2] hover:text-[#F2F5FF] p-1 rounded-lg hover:bg-[#1F5BFF]/10 transition-colors"
            title="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Status Alert Highlight */}
          {isRealCarrierSent ? (
            <div className="p-3 rounded-xl bg-[#C6FF00]/10 border border-[#C6FF00]/40 flex items-center gap-2.5 text-xs text-[#C6FF00]">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#C6FF00]" />
              <div>
                <strong className="block font-semibold">Direct SMS Sent to Janitor's Phone!</strong>
                <span className="text-[11px] opacity-90">Carrier network delivered message to SIM card (+91 {rawPhone}).</span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#1F5BFF]/15 border border-[#1F5BFF]/40 flex items-center gap-2.5 text-xs text-[#F2F5FF]">
              <Smartphone className="w-5 h-5 shrink-0 text-[#C6FF00]" />
              <div>
                <strong className="block font-semibold text-[#C6FF00]">Public Report Triggered SMS Alert</strong>
                <span className="text-[11px] text-[#8A94B2]">Target Janitor: <span className="font-mono text-[#F2F5FF]">{phone}</span></span>
              </div>
            </div>
          )}

          {/* Target destination pill */}
          <div className="p-3 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.25)] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8A94B2]">Recipient Janitor:</span>
              <span className="font-mono font-semibold text-[#C6FF00]">{phone}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8A94B2]">Facility:</span>
              <span className="text-[#F2F5FF] font-medium">{floor} • {washroom}</span>
            </div>
            {reason && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8A94B2]">Trigger:</span>
                <span className="text-[#F2F5FF] font-mono text-[11px]">{reason}</span>
              </div>
            )}
          </div>

          {/* SMS Bubble Display */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#8A94B2] flex items-center justify-between">
              <span>SMS Message Text</span>
              <span className="text-[10px]">{message.length}/160 chars</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#121829] border border-[#1F5BFF]/30 font-mono text-xs sm:text-sm text-[#F2F5FF] leading-relaxed select-all">
              {message}
            </div>
          </div>

          {/* Direct One-Tap Mobile Actions */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] text-[#8A94B2] text-center">
              Direct Phone Actions (Tap to open on mobile or send instantly):
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={smsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1F5BFF] hover:bg-[#1F5BFF]/90 text-[#F2F5FF] text-xs font-semibold transition-all shadow-[0_0_12px_rgba(31,91,255,0.4)]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open in SMS App</span>
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 text-[#05060A] text-xs font-bold transition-all shadow-[0_0_12px_rgba(37,211,102,0.4)]"
              >
                <Send className="w-4 h-4" />
                <span>Send via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#121829] px-5 py-3 border-t border-[#1F5BFF]/30 flex items-center justify-between">
          <span className="text-[10px] text-[#8A94B2] font-mono">
            Direct SIM & WhatsApp Gateway
          </span>
          <button
            onClick={dismissSmsModal}
            className="py-1.5 px-4 rounded-lg bg-[#1F5BFF]/20 hover:bg-[#1F5BFF]/30 text-[#F2F5FF] text-xs font-medium border border-[#1F5BFF]/40 transition-colors"
          >
            {language === 'hi' ? 'बंद करें (Close)' : 'Dismiss Alert'}
          </button>
        </div>
      </div>
    </div>
  );
};
