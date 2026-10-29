import React from 'react';
import { useAlaya } from '../context/AlayaContext';
import {
  ShieldCheck,
  Cpu,
  Sliders,
  QrCode,
  ShieldAlert,
  BarChart3,
  Waves,
  MessageSquare,
  BrainCircuit,
  Sparkles,
  ArrowRight,
  Droplets,
  Wind,
  Users,
  CheckCircle2,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { washrooms, setActiveTab, setSelectedWashroomId, language, t } = useAlaya();

  const layers = [
    {
      num: '01',
      title: 'Sensing Layer',
      titleHi: 'संवेदन स्तर (सेंसर)',
      desc: 'Autonomous micro-sensors monitor chemical air composition (NH₃, H₂S, VOCs), doorway PIR heat deltas, conductive floor moisture, and soap levels.',
      descHi: 'स्वायत्त माइक्रो-सेंसर हवा में अमोनिया, गंध, दरवाजे की आवाजाही, फर्श की नमी और साबुन के स्तर की निरंतर निगरानी करते हैं।',
      icon: <Wind className="w-5 h-5 text-[#1F5BFF]" />,
      stats: 'MQ-135 · PIR · Conductivity · ToF',
    },
    {
      num: '02',
      title: 'User Report Layer',
      titleHi: 'उपयोगकर्ता रिपोर्ट स्तर',
      desc: 'Students and staff submit two-tap anonymous feedback via wall QR codes. Saturates at 4 reports, rate-limited, zero logins, zero personal telemetry.',
      descHi: 'दीवार पर लगे क्यूआर कोड से दो-टैप में अनाम रिपोर्ट। कोई लॉगिन नहीं, कोई फोन नंबर नहीं, केवल कक्ष की स्थिति।',
      icon: <MessageSquare className="w-5 h-5 text-[#C6FF00]" />,
      stats: '2-Tap Mobile · 120s Rate Limit · 0 Login',
    },
    {
      num: '03',
      title: 'AI Decision Engine',
      titleHi: 'विश्लेषणात्मक निर्णय इंजन',
      desc: 'Synthesizes CUS (Cleanliness & Urgency Score) with regression slope rate. Computes exact minutes to threshold (70 pts) with anti-jitter hysteresis.',
      descHi: 'CUS सूत्र और ढलान दर द्वारा गणना करता है कि शौचालय कब सीमा (70 अंक) पार करेगा। एंटी-फ्लिकर हिस्टैरिसीस युक्त।',
      icon: <BrainCircuit className="w-5 h-5 text-[#1F5BFF]" />,
      stats: 'CUS Formula · Regression Rate · Hysteresis',
    },
    {
      num: '04',
      title: 'Empirical Verification',
      titleHi: 'प्रयोगात्मक सत्यापन स्तर',
      desc: 'Cleaning is only logged as VERIFIED when sensor decay confirms ammonia drops >8 points or moisture clears 1 → 0. Unverified cleans never reset score.',
      descHi: 'सफाई तभी सत्यापित मानी जाती है जब सेंसर अमोनिया में >8 अंक गिरावट या फर्श सूखना प्रमाणित करें। अधूरा काम स्कोर रीसेट नहीं करता।',
      icon: <CheckCircle2 className="w-5 h-5 text-[#C6FF00]" />,
      stats: 'Settling Window · ΔAir > 8 · 1→0 Dry-off',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GREEN':
        return 'text-[#C6FF00] border-[#C6FF00]/40 bg-[#C6FF00]/10';
      case 'AMBER':
        return 'text-[#FFB020] border-[#FFB020]/40 bg-[#FFB020]/10';
      case 'RED':
        return 'text-[#FF3B4E] border-[#FF3B4E]/40 bg-[#FF3B4E]/10 animate-pulse';
      case 'WET_FLOOR':
        return 'text-[#1F5BFF] border-[#1F5BFF]/40 bg-[#1F5BFF]/10';
      default:
        return 'text-[#8A94B2] border-slate-700 bg-slate-900';
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 rounded-3xl bg-gradient-to-b from-[#0B0F1A] via-[#080B14] to-[#05060A] border border-[#1F5BFF]/30 px-6 sm:px-12">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#1F5BFF]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-[#C6FF00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121829] border border-[#1F5BFF]/40 text-xs font-mono text-[#F2F5FF]">
            <span className="w-2 h-2 rounded-full bg-[#C6FF00] shadow-[0_0_6px_#C6FF00]" />
            <span>School Science Exhibition Edition · Project ALAYA</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F2F5FF] text-balance">
            {t.tagline}
          </h1>

          <p className="text-base sm:text-xl text-[#8A94B2] max-w-2xl mx-auto leading-relaxed">
            {language === 'hi'
              ? 'ALAYA (एआई-सक्षम स्वच्छता सहायक): विद्यालयों और संस्थानों के लिए बिना किसी कैमरे के, सेंसर-आधारित पूर्वानुमानात्मक स्वच्छता मॉनिटर।'
              : 'ALAYA (AI-enabled Lavatory & Hygiene Assistant) predicts washroom urgency before odor or stains form, verifying actual cleaning through empirical sensor decay.'}
          </p>

          {/* Core Privacy Promise Banner */}
          <div className="p-4 rounded-xl bg-[#121829]/90 border border-[#1F5BFF]/50 max-w-xl mx-auto shadow-lg">
            <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-semibold text-[#C6FF00]">
              <ShieldCheck className="w-5 h-5 text-[#C6FF00] shrink-0" />
              <span>No cameras. No identity. Measures the room, not the person.</span>
            </div>
            <p className="text-xs text-[#8A94B2] mt-1">
              Zero facial recognition · Zero video · Zero biometrics · 100% Dignified
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setActiveTab('public')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1F5BFF] hover:bg-[#1F5BFF]/90 text-white font-semibold text-sm shadow-[0_0_20px_rgba(31,91,255,0.4)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C6FF00]"
            >
              <QrCode className="w-4 h-4" />
              <span>Simulate QR Scan (Public View)</span>
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#121829] hover:bg-[#121829]/80 text-[#F2F5FF] border border-[#1F5BFF]/40 font-semibold text-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C6FF00]"
            >
              <Sliders className="w-4 h-4 text-[#C6FF00]" />
              <span>Open Exhibition Simulator</span>
            </button>
          </div>
        </div>
      </section>

      {/* Live Campus Washroom Status Snapshot */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#F2F5FF]">
              {language === 'hi' ? 'परिसर स्वच्छता टेलीमेट्री अवलोकन' : 'Campus Hygiene Status Overview'}
            </h2>
            <p className="text-xs text-[#8A94B2]">
              {language === 'hi'
                ? '4 निगरानी केंद्रों का वास्तविक समय CUS स्कोर'
                : 'Real-time telemetry and predictive urgency for 4 monitored washroom zones'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('admin')}
            className="text-xs text-[#1F5BFF] hover:text-[#C6FF00] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>{language === 'hi' ? 'विस्तृत रिपोर्ट देखें' : 'View Full Telemetry'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {washrooms.map((w) => {
            const isTarget = w.id === 'gf-boys';
            return (
              <div
                key={w.id}
                onClick={() => {
                  setSelectedWashroomId(w.id);
                  setActiveTab('public');
                }}
                className="alaya-card p-4 flex flex-col justify-between cursor-pointer group hover:border-[#1F5BFF] transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#8A94B2]">
                      {isTarget ? (w.isLiveHardware ? 'ZONE 1 · LIVE' : 'ZONE 1 · SIM') : `ZONE ${w.id.toUpperCase()}`}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${getStatusColor(
                        w.status
                      )}`}
                    >
                      {w.status === 'WET_FLOOR' ? 'WET FLOOR' : w.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#F2F5FF] group-hover:text-[#1F5BFF] transition-colors">
                    {language === 'hi' ? w.nameHi : w.name}
                  </h3>
                  <p className="text-[11px] text-[#8A94B2] font-mono">
                    <span className="text-[#1F5BFF] font-semibold">{w.floor}</span> · {language === 'hi' ? w.locationHi : w.location}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-[#1F5BFF]/20 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] text-[#8A94B2] uppercase font-mono block">CUS Score</span>
                    <span className="text-2xl font-extrabold font-mono text-[#F2F5FF]">
                      {w.cus}
                      <span className="text-xs text-[#8A94B2] font-normal"> /100</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#8A94B2] font-mono block">Needs clean in</span>
                    <span className="text-xs font-mono font-semibold text-[#C6FF00]">
                      {typeof w.timeToThreshold === 'number'
                        ? `~${w.timeToThreshold} min`
                        : w.timeToThreshold}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* The 4 Architectural Layers */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-[#1F5BFF]">
            Architecture & Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F2F5FF]">
            {language === 'hi' ? 'ALAYA की चार रक्षा परतें' : 'The Four Operational Layers'}
          </h2>
          <p className="text-sm text-[#8A94B2]">
            {language === 'hi'
              ? 'सेंसर डेटा से लेकर कर्मचारी सत्यापन तक एक संपूर्ण, स्वचालित प्रणाली'
              : 'From ambient chemical changes to crowdsourced reporting and empirical audit logs.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {layers.map((layer) => (
            <div key={layer.num} className="alaya-card p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-[#121829] border border-[#1F5BFF]/30">{layer.icon}</div>
                  <span className="text-xs font-mono font-bold text-[#8A94B2]">{layer.num}</span>
                </div>
                <h3 className="font-bold text-base text-[#F2F5FF]">
                  {language === 'hi' ? layer.titleHi : layer.title}
                </h3>
                <p className="text-xs text-[#8A94B2] leading-relaxed">
                  {language === 'hi' ? layer.descHi : layer.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1F5BFF]/20 text-[11px] font-mono text-[#C6FF00]/90">
                {layer.stats}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Exploration Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#F2F5FF]">
          {language === 'hi' ? 'सिस्टम मॉड्यूल एक्सप्लोर करें' : 'Explore System Modules'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Public Status */}
          <div
            onClick={() => setActiveTab('public')}
            className="alaya-card p-5 cursor-pointer group hover:border-[#1F5BFF] transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[#121829] text-[#1F5BFF] group-hover:text-[#C6FF00] transition-colors">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#F2F5FF] group-hover:text-[#1F5BFF]">
                  {t.tabPublic}
                </h3>
                <span className="text-[11px] text-[#8A94B2]">QR View for Visitors</span>
              </div>
            </div>
            <p className="text-xs text-[#8A94B2] mt-2">
              Large high-contrast display with CUS circle, verification badge, and 2-tap report form.
            </p>
          </div>

          {/* Staff Dashboard */}
          <div
            onClick={() => setActiveTab('staff')}
            className="alaya-card p-5 cursor-pointer group hover:border-[#1F5BFF] transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[#121829] text-[#FFB020] group-hover:text-[#C6FF00] transition-colors">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#F2F5FF] group-hover:text-[#1F5BFF]">
                  {t.tabStaff}
                </h3>
                <span className="text-[11px] text-[#8A94B2]">Dispatch & Verification</span>
              </div>
            </div>
            <p className="text-xs text-[#8A94B2] mt-2">
              Prioritised washrooms, recommended kit hints, Mark Cleaned countdown, and Maintenance queue.
            </p>
          </div>

          {/* Admin Analytics */}
          <div
            onClick={() => setActiveTab('admin')}
            className="alaya-card p-5 cursor-pointer group hover:border-[#1F5BFF] transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[#121829] text-[#1F5BFF] group-hover:text-[#C6FF00] transition-colors">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#F2F5FF] group-hover:text-[#1F5BFF]">
                  {t.tabAdmin}
                </h3>
                <span className="text-[11px] text-[#8A94B2]">Hourly Charts & CSV Audit</span>
              </div>
            </div>
            <p className="text-xs text-[#8A94B2] mt-2">
              Recharts trend line, factor attribution breakdown, cleaning audit log, pattern insights, and CSV export.
            </p>
          </div>

          {/* Hardware Serial */}
          <div
            onClick={() => setActiveTab('hardware')}
            className="alaya-card p-5 cursor-pointer group hover:border-[#1F5BFF] transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[#121829] text-[#C6FF00] group-hover:text-[#1F5BFF] transition-colors">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#F2F5FF] group-hover:text-[#1F5BFF]">
                  {t.tabHardware}
                </h3>
                <span className="text-[11px] text-[#8A94B2]">ESP32 Web Serial API</span>
              </div>
            </div>
            <p className="text-xs text-[#8A94B2] mt-2">
              Connect real microcontrollers over USB at 115200 baud, send commands, stream raw telemetry.
            </p>
          </div>

          {/* Simulator */}
          <div
            onClick={() => setActiveTab('simulator')}
            className="alaya-card p-5 cursor-pointer group hover:border-[#1F5BFF] transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[#121829] text-[#1F5BFF] group-hover:text-[#C6FF00] transition-colors">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#F2F5FF] group-hover:text-[#1F5BFF]">
                  {t.tabSimulator}
                </h3>
                <span className="text-[11px] text-[#8A94B2]">Exhibition Demo Lab</span>
              </div>
            </div>
            <p className="text-xs text-[#8A94B2] mt-2">
              Interactive sliders, live formula substitution, school day fast-forward, and verification trial.
            </p>
          </div>

          {/* Privacy */}
          <div
            onClick={() => setActiveTab('privacy')}
            className="alaya-card p-5 cursor-pointer group hover:border-[#1F5BFF] transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[#121829] text-[#C6FF00] group-hover:text-[#1F5BFF] transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#F2F5FF] group-hover:text-[#1F5BFF]">
                  {t.tabPrivacy}
                </h3>
                <span className="text-[11px] text-[#8A94B2]">Manifesto & Ethics</span>
              </div>
            </div>
            <p className="text-xs text-[#8A94B2] mt-2">
              Zero-camera manifesto, scientific sensor principles, and ₹2,000 ALAYA vs ₹45,000 camera comparison.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
