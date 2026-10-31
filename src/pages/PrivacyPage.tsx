import React from 'react';
import { useAlaya } from '../context/AlayaContext';
import {
  ShieldCheck,
  ShieldX,
  Cpu,
  Check,
  X,
  EyeOff,
  UserX,
  FileText,
  Lock,
  Layers,
  Sparkles,
  Phone,
  CameraOff,
} from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const { language, t } = useAlaya();

  const sensorPrinciples = [
    {
      sensor: 'MQ-135 Gas Sniffer',
      role: 'Ammonia (NH₃), H₂S & Volatile Organic Compounds (VOCs)',
      principle:
        'Semiconductor surface resistance change: Atmospheric gases adsorb onto heated Tin Dioxide (SnO₂), transferring electrons and shifting electrical resistance proportionately to odor gas concentration.',
      principleHi:
        'अर्धचालक सतह प्रतिरोध परिवर्तन: टिन डाइऑक्साइड (SnO₂) पर अमोनिया व गंध के कण चिपकते हैं, जिससे विद्युत प्रतिरोध में बदलाव आता है।',
      telemetry: '0–100 Normalized Index (Resistance Ohms)',
    },
    {
      sensor: 'Dual-Element PIR Array',
      role: 'Doorway Passage & Usage Footfall',
      principle:
        'Passive Pyroelectric differential: Twin crystalline infrared sensors measure differential changes in ambient blackbody thermal radiation (~9.4 µm wavelength) as bodies cross the doorway. Zero spatial imaging.',
      principleHi:
        'पैसिव इन्फ्रारेड थर्मल डिफरेंशियल: जुड़वां पायरोइलेक्ट्रिक क्रिस्टल केवल दरवाजे से गुजरने पर तापमान के अंतर को मापते हैं। कोई चित्र या वीडियो नहीं।',
      telemetry: 'Incremental count pulses only',
    },
    {
      sensor: 'Conductive Floor Probe',
      role: 'Standing Water & Mopping Verification',
      principle:
        'Electrical conductance & dielectric impedance: Two corrosion-resistant electrode tracks flush with floor tiles measure current conductance across surface water films (distinguishes dry tile from liquid spill or mopped water).',
      principleHi:
        'विद्युत चालकता और नमी: फर्श की टाइलों पर लगे दो समानांतर इलेक्ट्रोड पानी की पतली परत के कारण विद्युत प्रवाह को मापते हैं।',
      telemetry: 'Binary state (0 = Dry, 1 = Wet film)',
    },
    {
      sensor: 'Ultrasonic / ToF Supply Gauge',
      role: 'Liquid Soap & Paper Dispenser Level',
      principle:
        'Acoustic echo time-of-flight: Emits high-frequency sound wave burst (40 kHz) and calculates distance to soap reservoir meniscus via return flight time: d = (v × t) / 2.',
      principleHi:
        'अल्ट्रासोनिक इको समय मापन: 40 किलोहर्ट्ज़ की ध्वनि तरंग भेजकर साबुन या कागज़ की सतह से गूंज लौटने के समय द्वारा स्तर मापता है।',
      telemetry: '0–100% Volume Availability',
    },
  ];

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto">
      {/* Title & Core Philosophy */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121829] border border-[#1F5BFF]/40 text-xs font-mono text-[#F2F5FF]">
          <ShieldCheck className="w-4 h-4 text-[#C6FF00]" />
          <span>ALAYA Ethical & Privacy Architecture Charter</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F2F5FF] text-balance">
          {t.privacyTitle}
        </h1>

        <div className="p-4 rounded-2xl bg-[#0B0F1A] border border-[#C6FF00]/40 max-w-xl mx-auto shadow-[0_0_25px_rgba(198,255,0,0.15)]">
          <p className="text-lg sm:text-xl font-extrabold text-[#C6FF00]">
            "{t.measuresRoom}"
          </p>
          <p className="text-xs text-[#8A94B2] mt-1 font-mono">
            {language === 'hi'
              ? 'ALAYA केवल कमरे की भौतिक स्थिति को मापता है, किसी भी व्यक्ति या कर्मचारी को नहीं।'
              : 'ALAYA measures ambient chemical concentrations and room physical state—never the identity or behavior of any person.'}
          </p>
        </div>
      </div>

      {/* Explicit Phone Number & Visitor Privacy Section */}
      <div className="p-6 rounded-2xl bg-[#0B0F1A] border-2 border-[#1F5BFF] shadow-[0_0_25px_rgba(31,91,255,0.25)] space-y-3">
        <div className="flex items-center gap-2.5 text-[#C6FF00]">
          <Phone className="w-5 h-5 text-[#C6FF00]" />
          <h2 className="text-base font-bold text-[#F2F5FF]">
            Janitor Contact Routing & Visitor Anonymity Commitment
          </h2>
        </div>
        <p className="text-sm text-[#F2F5FF] font-medium leading-relaxed bg-[#121829] p-4 rounded-xl border border-[#1F5BFF]/30">
          "Janitor phone numbers are stored only to route alerts to the right floor. ALAYA never stores who submitted a report, and never tracks any person's movements."
        </p>
        <p className="text-xs text-[#8A94B2] leading-relaxed">
          {language === 'hi'
            ? 'सफाई कर्मचारियों के फोन नंबर केवल उनके संबंधित तल पर एसएमएस चेतावनी भेजने के लिए सुरक्षित रखे जाते हैं। सार्वजनिक रिपोर्टर का कोई नाम, आईपी, या फोन नंबर कभी नहीं लिया जाता।'
            : 'Phone numbers are masked in administrative views (+91 98••••••12). When a visitor reports an issue or CUS reaches Red, the automated gateway sends an alert solely to the floor janitor.'}
        </p>
      </div>

      {/* Side-by-side What We Collect vs What We NEVER Collect */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What We NEVER Collect */}
        <div className="p-6 rounded-2xl bg-[#0B0F1A] border border-[#FF3B4E]/40 shadow-md space-y-4">
          <div className="flex items-center gap-2 text-[#FF3B4E]">
            <ShieldX className="w-6 h-6" />
            <h2 className="text-lg font-bold">{t.whatWeNeverCollect}</h2>
          </div>

          <ul className="space-y-3 text-xs sm:text-sm text-[#F2F5FF]">
            <li className="flex items-start gap-2.5">
              <X className="w-4 h-4 text-[#FF3B4E] shrink-0 mt-0.5" />
              <span>
                <strong>Zero Cameras or Optical Lenses:</strong> No video streams, photographs, or computer vision sensors anywhere in the facility.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <X className="w-4 h-4 text-[#FF3B4E] shrink-0 mt-0.5" />
              <span>
                <strong>Zero Facial Recognition or Biometrics:</strong> Impossible to fingerprint or recognize visitors or pupils.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <X className="w-4 h-4 text-[#FF3B4E] shrink-0 mt-0.5" />
              <span>
                <strong>Zero User Identification or Logins:</strong> Public reporting requires no name, email, phone number, or device authentication.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <X className="w-4 h-4 text-[#FF3B4E] shrink-0 mt-0.5" />
              <span>
                <strong>Zero Audio or Microphones:</strong> No acoustic surveillance or speech recording.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <X className="w-4 h-4 text-[#FF3B4E] shrink-0 mt-0.5" />
              <span>
                <strong>Zero Individual Staff Tracking:</strong> Logs record room cleanliness verification delta, never individual cleaners' identities.
              </span>
            </li>
          </ul>
        </div>

        {/* What We Collect */}
        <div className="p-6 rounded-2xl bg-[#0B0F1A] border border-[#C6FF00]/40 shadow-md space-y-4">
          <div className="flex items-center gap-2 text-[#C6FF00]">
            <ShieldCheck className="w-6 h-6" />
            <h2 className="text-lg font-bold">{t.whatWeCollect}</h2>
          </div>

          <ul className="space-y-3 text-xs sm:text-sm text-[#F2F5FF]">
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#C6FF00] shrink-0 mt-0.5" />
              <span>
                <strong>Ambient Gas PPM:</strong> Semiconductor resistance changes corresponding to ammonia and sulfur compounds.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#C6FF00] shrink-0 mt-0.5" />
              <span>
                <strong>Doorway Heat Pulse Count:</strong> Anonymous infrared thermal change pulses to track aggregate footfall volume.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#C6FF00] shrink-0 mt-0.5" />
              <span>
                <strong>Floor Conductivity (0/1):</strong> Direct electrical conductance between floor contacts to detect standing water or mopping.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#C6FF00] shrink-0 mt-0.5" />
              <span>
                <strong>Consumables Fill Level (%):</strong> Ultrasonic distance from soap and paper roll dispensers.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#C6FF00] shrink-0 mt-0.5" />
              <span>
                <strong>Anonymous Feedback Buttons:</strong> Aggregated issue counter (e.g., "bad smell", "bin full") without tracking who submitted it.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Physical Sensor Principles Table */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0F1A] border border-[rgba(31,91,255,0.35)] space-y-6 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-[#F2F5FF]">{t.sensorPrinciples}</h2>
          <p className="text-xs text-[#8A94B2]">
            Detailed physics behind every sensor module deployed in the ALAYA hardware unit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sensorPrinciples.map((sp, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#121829] border border-[#1F5BFF]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#C6FF00] font-mono">{sp.sensor}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#05060A] text-[#1F5BFF] border border-[#1F5BFF]/30">
                  {sp.telemetry}
                </span>
              </div>
              <div className="text-xs font-semibold text-[#F2F5FF]">{sp.role}</div>
              <p className="text-xs text-[#8A94B2] leading-relaxed">
                {language === 'hi' ? sp.principleHi : sp.principle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
