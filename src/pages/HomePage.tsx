import React, { useRef } from 'react';
import { useAlaya } from '../context/AlayaContext';
import {
  ShieldCheck,
  Cpu,
  Sliders,
  QrCode,
  Sparkles,
  ArrowRight,
  Wind,
  CheckCircle2,
  CameraOff,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Award,
  Layers,
  HeartHandshake,
  FileCheck,
  Building2,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    washrooms,
    setActiveTab,
    setSelectedWashroomId,
    language,
    t,
    heroPhoto,
    setHeroPhoto,
    swachhLogo,
    setSwachhLogo,
  } = useAlaya();

  const heroInputRef = useRef<HTMLInputElement>(null);
  const swachhInputRef = useRef<HTMLInputElement>(null);

  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setHeroPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSwachhUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSwachhLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const layers = [
    {
      num: '01',
      title: 'Sensing Layer',
      titleHi: 'संवेदन स्तर (सेंसर)',
      desc: 'Monitors ambient air quality (NH₃, H₂S, VOCs), doorway footfall heat deltas, conductive floor moisture, and soap dispenser levels.',
      descHi: 'हवा में अमोनिया, गंध, दरवाजे की आवाजाही, फर्श की नमी और साबुन के स्तर की निरंतर निगरानी।',
      icon: <Wind className="w-5 h-5 text-[#1F5BFF]" />,
      stats: 'Air Sensor · Footfall PIR · Moisture · Soap Level',
    },
    {
      num: '02',
      title: 'Anonymous Feedback',
      titleHi: 'अनाम प्रतिक्रिया स्तर',
      desc: 'Students and staff submit two-tap feedback via wall QR codes. No logins, no cameras, no tracking of people.',
      descHi: 'दीवार पर लगे क्यूआर कोड से दो-टैप में अनाम रिपोर्ट। कोई लॉगिन नहीं, कोई कैमरा नहीं, पूर्ण गोपनीयता।',
      icon: <QrCode className="w-5 h-5 text-[#C6FF00]" />,
      stats: '2-Tap Mobile · Rate Limited · 0 Telemetry',
    },
    {
      num: '03',
      title: 'AI Decision Engine',
      titleHi: 'निर्णय इंजन (CUS)',
      desc: 'Calculates the Cleanliness & Urgency Score (0-100) and predicts the exact minutes until cleaning is required.',
      descHi: 'स्वच्छता और तात्कालिकता स्कोर (CUS) की गणना और सफाई की आवश्यकता का सटीक समय पूर्वानुमान।',
      icon: <Cpu className="w-5 h-5 text-[#1F5BFF]" />,
      stats: 'CUS Formula · Rate of Change · Time to Threshold',
    },
    {
      num: '04',
      title: 'Empirical Verification',
      titleHi: 'प्रयोगात्मक सत्यापन स्तर',
      desc: 'Cleaning is only logged as VERIFIED when sensor data confirms ammonia dropped >8 points or moisture cleared 1 → 0.',
      descHi: 'सफाई तभी सत्यापित मानी जाती है जब सेंसर अमोनिया गिरावट या फर्श सूखने की पुष्टि करें।',
      icon: <CheckCircle2 className="w-5 h-5 text-[#C6FF00]" />,
      stats: 'Settling Window · ΔAir > 8 · 1→0 Dry-off',
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Large Hero Container with Upload Slot & Door Placeholder */}
      <section className="relative rounded-2xl overflow-hidden border border-[rgba(31,91,255,0.35)] bg-[#0B0F1A] shadow-[0_0_30px_rgba(31,91,255,0.2)]">
        {/* Background Image or Door Line Illustration */}
        <div className="relative w-full min-h-[360px] sm:min-h-[440px] flex items-center justify-center overflow-hidden">
          {heroPhoto ? (
            <img
              src={heroPhoto}
              alt="ALAYA Hero"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            // Tasteful dark cobalt-to-black placeholder with washroom door line illustration
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#121829] via-[#0B0F1A] to-[#05060A] flex items-center justify-center">
              {/* Subtle grid pattern */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(31,91,255,0.3) 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />
              {/* Modern architectural line illustration of washroom door */}
              <div className="relative flex flex-col items-center opacity-40 hover:opacity-60 transition-opacity">
                <svg
                  className="w-32 h-44 text-[#1F5BFF]"
                  viewBox="0 0 100 140"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  {/* Outer Door Frame */}
                  <rect x="15" y="10" width="70" height="120" rx="3" stroke="#1F5BFF" strokeWidth="2.5" />
                  {/* Inner Door Panel */}
                  <rect x="22" y="18" width="56" height="106" rx="2" stroke="rgba(31,91,255,0.5)" strokeWidth="1.5" />
                  {/* Door Handle */}
                  <rect x="68" y="70" width="4" height="16" rx="2" fill="#C6FF00" />
                  {/* Sensor Halo over the Door */}
                  <circle cx="50" cy="8" r="4" fill="#C6FF00" />
                  <path d="M42 4 C 47 1, 53 1, 58 4" stroke="#C6FF00" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Subtle airflow wave lines */}
                  <path d="M30 40 Q 50 35 70 40" stroke="rgba(198,255,0,0.3)" strokeDasharray="2 3" />
                  <path d="M30 55 Q 50 50 70 55" stroke="rgba(198,255,0,0.3)" strokeDasharray="2 3" />
                </svg>
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#8A94B2] mt-2">
                  Smart Monitored Facility
                </span>
              </div>
            </div>
          )}

          {/* Dark gradient overlay so text remains razor-sharp */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05060A] via-[#05060A]/80 to-black/50" />

          {/* Hidden File Input for Hero Upload */}
          <input
            type="file"
            ref={heroInputRef}
            onChange={handleHeroUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Upload / Edit Button in Top Corner */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              onClick={() => heroInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#05060A]/85 hover:bg-[#121829] text-xs font-medium text-[#F2F5FF] border border-[#1F5BFF]/40 backdrop-blur-md transition-all shadow-md group"
              title="Upload your own hero photo from device"
            >
              <Upload className="w-3.5 h-3.5 text-[#C6FF00] group-hover:scale-110 transition-transform" />
              <span>{heroPhoto ? (language === 'hi' ? 'फोटो बदलें' : 'Change Hero Photo') : (language === 'hi' ? 'फोटो अपलोड करें' : 'Upload Hero Photo')}</span>
            </button>
            {heroPhoto && (
              <button
                onClick={() => setHeroPhoto(null)}
                className="p-1.5 rounded-lg bg-[#05060A]/85 hover:bg-[#FF3B4E]/20 text-[#8A94B2] hover:text-[#FF3B4E] border border-white/10 backdrop-blur-md transition-colors"
                title="Reset to default placeholder"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Hero Foreground Content */}
          <div className="relative z-10 max-w-3xl mx-auto px-6 py-12 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121829]/90 border border-[#1F5BFF]/50 text-xs font-mono text-[#F2F5FF] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#C6FF00] shadow-[0_0_8px_#C6FF00]" />
              <span>ALAYA · AI-Enabled Lavatory & Hygiene Assistant</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F2F5FF] drop-shadow-md">
              Camera-free. Predictive. Dignified.
            </h1>

            <p className="text-sm sm:text-lg text-[#8A94B2] max-w-2xl mx-auto leading-relaxed">
              {language === 'hi'
                ? 'बिना किसी कैमरे के, सेंसर-आधारित स्वायत्त स्वच्छता मॉनिटर। बदबू या गंदगी बनने से पहले ही सफाई का पूर्वानुमान।'
                : 'Predicting washroom hygiene urgency before odor forms, with empirical sensor-decay verification and zero surveillance.'}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setActiveTab('public')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F5BFF] hover:bg-[#1F5BFF]/90 text-white font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(31,91,255,0.4)] transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-[#C6FF00]" />
                <span>{language === 'hi' ? 'सार्वजनिक स्थिति देखें (Public Status)' : 'View Public Status'}</span>
              </button>

              <button
                onClick={() => setActiveTab('simulator')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#121829] hover:bg-[#1F5BFF]/20 text-[#F2F5FF] font-semibold text-xs sm:text-sm border border-[#1F5BFF]/40 transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-[#C6FF00]" />
                <span>{language === 'hi' ? 'सेंसर सिम्युलेटर (Simulator)' : 'Live Simulator'}</span>
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#05060A] hover:bg-[#121829] text-[#8A94B2] hover:text-[#F2F5FF] font-medium text-xs sm:text-sm border border-[rgba(31,91,255,0.25)] transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>{language === 'hi' ? 'प्रशासन (Admin & SMS)' : 'Admin & Staff Logs'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Swachh Bharat Section with Logo Upload Slot */}
      <section className="bg-[#0B0F1A] border border-[rgba(31,91,255,0.35)] rounded-2xl p-6 sm:p-8 shadow-[0_0_25px_rgba(0,0,0,0.4)] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C6FF00]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Logo Upload Slot (left column) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center">
            <input
              type="file"
              ref={swachhInputRef}
              onChange={handleSwachhUpload}
              accept="image/*"
              className="hidden"
            />

            <div
              onClick={() => swachhInputRef.current?.click()}
              className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl border-2 border-dashed border-[#1F5BFF]/50 bg-[#05060A] hover:border-[#C6FF00] hover:bg-[#121829] flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all group relative overflow-hidden shadow-inner"
              title="Click to upload official Swachh Bharat logo"
            >
              {swachhLogo ? (
                <>
                  <img
                    src={swachhLogo}
                    alt="Swachh Bharat Logo"
                    className="w-full h-full object-contain p-2"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-[#C6FF00] font-mono transition-opacity">
                    Change Logo
                  </div>
                </>
              ) : (
                <div className="space-y-2 flex flex-col items-center">
                  {/* Clean SVG Representation of Swachh Bharat Spectacles */}
                  <svg className="w-16 h-10 text-[#C6FF00]" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="28" cy="25" r="16" />
                    <circle cx="72" cy="25" r="16" />
                    <path d="M44 25 L 56 25" />
                    <path d="M12 25 L 4 15" strokeLinecap="round" />
                    <path d="M88 25 L 96 15" strokeLinecap="round" />
                  </svg>
                  <span className="text-xs font-semibold text-[#F2F5FF] group-hover:text-[#C6FF00]">
                    Upload logo
                  </span>
                  <span className="text-[10px] text-[#8A94B2]">
                    (Official Swachh Bharat Emblem)
                  </span>
                </div>
              )}
            </div>

            {swachhLogo && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSwachhLogo(null);
                }}
                className="mt-2 text-[11px] text-[#8A94B2] hover:text-[#FF3B4E] transition-colors"
              >
                Remove logo
              </button>
            )}
          </div>

          {/* Swachh Bharat Mission Details (right column) */}
          <div className="md:col-span-8 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#C6FF00]" />
                <span className="text-xs font-mono uppercase tracking-wider text-[#C6FF00] font-semibold">
                  National Mission Alignment
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F2F5FF]">
                Supporting Swachh Bharat Mission
              </h2>
            </div>

            {/* 3 Short Points */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.25)]">
                <CheckCircle2 className="w-4 h-4 text-[#C6FF00] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-[#F2F5FF] font-medium">
                  Cleaner public washrooms through need-based cleaning
                </span>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.25)]">
                <FileCheck className="w-4 h-4 text-[#1F5BFF] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-[#F2F5FF] font-medium">
                  Verified cleaning records instead of unverifiable registers
                </span>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.25)]">
                <HeartHandshake className="w-4 h-4 text-[#C6FF00] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-[#F2F5FF] font-medium">
                  Dignity and safety for women, children and sanitation workers
                </span>
              </div>
            </div>

            {/* SDG 6 and Exhibition Credit Lines */}
            <div className="pt-2 border-t border-[#1F5BFF]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#8A94B2]">
              <span className="font-mono text-[#C6FF00]">
                Aligned with SDG 6 (Clean Water and Sanitation)
              </span>
              <span className="text-[11px] font-mono text-[#8A94B2]">
                Science & Mathematics Exhibition 2026-27, Directorate of Education, GNCT of Delhi
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Privacy Guarantee Banner */}
      <section className="p-4 rounded-xl bg-[#121829] border border-[#1F5BFF]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#C6FF00]/15 flex items-center justify-center text-[#C6FF00] shrink-0">
            <CameraOff className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#F2F5FF]">
              Zero Camera · Zero Video · Zero Facial Recognition
            </div>
            <div className="text-[11px] text-[#8A94B2]">
              ALAYA measures chemical and physical variables in the room, never personal identity or telemetry.
            </div>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('privacy')}
          className="text-xs font-mono text-[#C6FF00] hover:underline shrink-0"
        >
          Read Privacy Charter →
        </button>
      </section>

      {/* 4. Four-Layer System Architecture */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#1F5BFF] font-semibold">
              Modular Engineering
            </div>
            <h3 className="text-lg font-bold text-[#F2F5FF]">Four-Layer Hygiene Pipeline</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {layers.map((layer) => (
            <div
              key={layer.num}
              className="p-5 rounded-2xl bg-[#0B0F1A] border border-[rgba(31,91,255,0.35)] hover:border-[#1F5BFF] transition-all space-y-3 shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#1F5BFF]">{layer.num}</span>
                {layer.icon}
              </div>
              <h4 className="font-semibold text-sm text-[#F2F5FF]">
                {language === 'hi' ? layer.titleHi : layer.title}
              </h4>
              <p className="text-xs text-[#8A94B2] leading-relaxed">
                {language === 'hi' ? layer.descHi : layer.desc}
              </p>
              <div className="pt-2 border-t border-[#1F5BFF]/15 text-[10px] font-mono text-[#C6FF00]">
                {layer.stats}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CUS Scientific Formula Card */}
      <section className="p-6 rounded-2xl bg-[#0B0F1A] border border-[rgba(31,91,255,0.35)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#1F5BFF]" />
            <h4 className="font-bold text-sm text-[#F2F5FF]">
              Cleanliness & Urgency Score (CUS) Logic
            </h4>
          </div>
          <span className="text-xs font-mono text-[#C6FF00]">Clamped to 0-100</span>
        </div>

        <div className="p-4 rounded-xl bg-[#05060A] border border-[#1F5BFF]/30 font-mono text-xs text-[#F2F5FF] overflow-x-auto">
          <code>
            CUS = 0.25×AirQuality + 0.20×UserReports + 0.15×TimeElapsed + 0.15×Footfall +
            0.15×(Moisture×100) − 0.10×SupplyLevel
          </code>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-[#05060A] border border-[#C6FF00]/40">
            <div className="font-mono font-bold text-[#C6FF00]">0 - 39</div>
            <div className="text-[11px] text-[#8A94B2]">Clean (Green)</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#05060A] border border-[#FFB020]/40">
            <div className="font-mono font-bold text-[#FFB020]">40 - 69</div>
            <div className="text-[11px] text-[#8A94B2]">Plan Visit (Amber)</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#05060A] border border-[#FF3B4E]/40">
            <div className="font-mono font-bold text-[#FF3B4E]">70 - 100</div>
            <div className="text-[11px] text-[#8A94B2]">Urgent (Red Alert)</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#05060A] border border-[#1F5BFF]/40">
            <div className="font-mono font-bold text-[#1F5BFF]">Moisture = 1</div>
            <div className="text-[11px] text-[#8A94B2]">Wet Floor (Cobalt)</div>
          </div>
        </div>
      </section>
    </div>
  );
};
