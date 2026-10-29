import React, { useState } from 'react';
import { useAlaya } from '../context/AlayaContext';
import {
  Cpu,
  Plug,
  Unplug,
  AlertTriangle,
  Send,
  Terminal,
  Activity,
  Droplets,
  Wind,
  Footprints,
  BatteryCharging,
  Clock,
  Sliders,
  CheckCircle2,
  Volume2,
  RefreshCw,
  Power,
  Flame,
  ExternalLink,
  Radio,
  Sparkles,
} from 'lucide-react';

export const HardwarePage: React.FC = () => {
  const {
    washrooms,
    isHardwareConnected,
    isVirtualHardware,
    isIframeRestricted,
    connectSerial,
    connectVirtualSerial,
    disconnectSerial,
    sendSerialCommand,
    hardwareLogs,
    hardwareStaleWarning,
    secondsSinceLastData,
    deviceUptimeSeconds,
    lightMode,
    setLightMode,
    t,
  } = useAlaya();

  const [customCmd, setCustomCmd] = useState<string>('');

  const targetWashroom = washrooms.find((w) => w.isLiveHardware) || washrooms[0];
  const isSerialSupported = typeof navigator !== 'undefined' && 'serial' in navigator;

  const handleSendCommand = (cmd: string) => {
    sendSerialCommand(cmd);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCmd.trim()) return;
    sendSerialCommand(customCmd.trim());
    setCustomCmd('');
  };

  const openInNewTab = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header and Connection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F2F5FF] flex items-center gap-2">
            <Cpu className="w-7 h-7 text-[#1F5BFF]" />
            <span>{t.hardwareTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8A94B2] mt-1">{t.hardwareSubtitle}</p>
        </div>

        {/* Connect / Disconnect Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isHardwareConnected ? (
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border ${
                isVirtualHardware
                  ? 'bg-[#1F5BFF]/15 text-[#1F5BFF] border-[#1F5BFF]/40'
                  : 'bg-[#C6FF00]/15 text-[#C6FF00] border-[#C6FF00]/40'
              }`}>
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>{isVirtualHardware ? 'VIRTUAL STREAM ACTIVE' : 'USB SERIAL LIVE'}</span>
              </span>
              <button
                onClick={disconnectSerial}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF3B4E]/15 hover:bg-[#FF3B4E]/25 text-[#FF3B4E] border border-[#FF3B4E]/40 font-bold text-xs transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4E]"
              >
                <Unplug className="w-4 h-4" />
                <span>{t.disconnectPort}</span>
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={connectSerial}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F5BFF] hover:bg-[#1F5BFF]/90 text-white font-bold text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(31,91,255,0.4)] focus:outline-none focus:ring-2 focus:ring-[#C6FF00]"
                title="Connect physical ESP32 or Arduino via USB"
              >
                <Plug className="w-4 h-4" />
                <span>Connect Physical USB</span>
              </button>

              <button
                onClick={connectVirtualSerial}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#121829] hover:bg-[#1F5BFF]/20 text-[#C6FF00] border border-[#C6FF00]/40 font-bold text-xs transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(198,255,0,0.25)]"
                title="Simulate live 115200 baud hardware packet stream right now"
              >
                <Sparkles className="w-4 h-4 text-[#C6FF00]" />
                <span>Virtual ESP32 Live Stream</span>
              </button>
            </>
          )}

          <button
            onClick={openInNewTab}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0B0F1A] hover:bg-[#121829] text-[#8A94B2] hover:text-[#F2F5FF] border border-[#1F5BFF]/30 font-medium text-xs transition-all cursor-pointer"
            title="Open app in a top-level browser tab for direct hardware access"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open in Direct Tab</span>
          </button>
        </div>
      </div>

      {/* Embedded Iframe Sandboxing Notice */}
      {isIframeRestricted && (
        <div className="p-4 rounded-xl bg-[#121829] border border-[#1F5BFF]/50 text-xs text-[#F2F5FF] flex items-start gap-3 shadow-lg">
          <Activity className="w-5 h-5 text-[#C6FF00] shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <div className="font-bold text-[#C6FF00] flex items-center gap-2">
              <span>Preview Sandboxing Handled</span>
              <span className="text-[10px] font-mono text-[#8A94B2] px-1.5 py-0.5 rounded bg-[#05060A]">SAFE FALLBACK</span>
            </div>
            <p className="text-[#8A94B2] leading-relaxed">
              Browser iframe policies block direct USB selection inside embedded preview windows. ALAYA has automatically switched to the <strong className="text-[#F2F5FF]">Virtual ESP32 Live Stream</strong> so all sensor packet parsing, watchdog telemetry, and hardware commands work seamlessly below!
            </p>
            <div className="pt-1 flex items-center gap-3">
              <button
                onClick={openInNewTab}
                className="inline-flex items-center gap-1.5 text-xs text-[#1F5BFF] hover:text-[#C6FF00] font-semibold underline cursor-pointer"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open in dedicated browser tab for physical USB cable connection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Browser Support Check / Notice (only if Web Serial API not supported in this browser) */}
      {!isSerialSupported && (
        <div className="p-4 rounded-xl bg-[#121829] border border-[#FFB020]/50 text-xs text-[#FFB020] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Web Serial Browser Notice</div>
            <p className="text-[#8A94B2]">
              {t.hardwareFallback} You can use the &quot;Virtual ESP32 Live Stream&quot; button above to simulate live packets in any browser.
            </p>
          </div>
        </div>
      )}

      {/* 10-Second Watchdog Inactivity Alert */}
      {isHardwareConnected && hardwareStaleWarning && (
        <div className="p-4 rounded-xl bg-[#FF3B4E]/15 border border-[#FF3B4E] text-xs text-[#FF3B4E] flex items-center gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div className="font-semibold">
            {t.noDataAlert} ({secondsSinceLastData}s since last packet)
          </div>
        </div>
      )}

      {/* Live Hardware Telemetry Cards (Washroom 1: Ground Floor Boys) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#8A94B2] font-mono">
          <span>LIVE HARDWARE SENSOR TELEMETRY (ZONE 1 · GROUND FLOOR BOYS)</span>
          <span>
            {isHardwareConnected ? (
              <span className="text-[#C6FF00] font-bold">STREAMING ACTIVE</span>
            ) : (
              <span className="text-[#8A94B2]">STANDBY / SIMULATING</span>
            )}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Air Quality */}
          <div className="alaya-card p-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#8A94B2]">
              <span>AIR (NH₃)</span>
              <Wind className="w-3.5 h-3.5 text-[#1F5BFF]" />
            </div>
            <div className="text-xl font-extrabold font-mono text-[#F2F5FF]">
              {targetWashroom.airQuality}
              <span className="text-[10px] text-[#8A94B2]"> /100</span>
            </div>
            <div className="text-[10px] text-[#8A94B2]">MQ-135 Gas Sniffer</div>
          </div>

          {/* Footfall */}
          <div className="alaya-card p-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#8A94B2]">
              <span>FOOTFALL</span>
              <Footprints className="w-3.5 h-3.5 text-[#C6FF00]" />
            </div>
            <div className="text-xl font-extrabold font-mono text-[#F2F5FF]">
              {targetWashroom.footfall}
            </div>
            <div className="text-[10px] text-[#8A94B2]">PIR Motion Hits</div>
          </div>

          {/* Moisture */}
          <div className="alaya-card p-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#8A94B2]">
              <span>MOISTURE</span>
              <Droplets className="w-3.5 h-3.5 text-[#1F5BFF]" />
            </div>
            <div
              className={`text-xl font-extrabold font-mono ${
                targetWashroom.moistureFlag === 1 ? 'text-[#1F5BFF]' : 'text-[#C6FF00]'
              }`}
            >
              {targetWashroom.moistureFlag === 1 ? 'WET (1)' : 'DRY (0)'}
            </div>
            <div className="text-[10px] text-[#8A94B2]">Floor Conductivity</div>
          </div>

          {/* Supply Level */}
          <div className="alaya-card p-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#8A94B2]">
              <span>SUPPLY</span>
              <Activity className="w-3.5 h-3.5 text-[#FFB020]" />
            </div>
            <div className="text-xl font-extrabold font-mono text-[#F2F5FF]">
              {targetWashroom.supplyLevel}%
            </div>
            <div className="text-[10px] text-[#8A94B2]">Soap / Paper ToF</div>
          </div>

          {/* Mop Status */}
          <div className="alaya-card p-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#8A94B2]">
              <span>MOP STATE</span>
              <BatteryCharging className="w-3.5 h-3.5 text-[#C6FF00]" />
            </div>
            <div className="text-sm font-bold font-mono uppercase text-[#F2F5FF] truncate mt-1">
              docked
            </div>
            <div className="text-[10px] text-[#8A94B2]">Dock Station A</div>
          </div>

          {/* Uptime */}
          <div className="alaya-card p-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#8A94B2]">
              <span>DEVICE UPTIME</span>
              <Clock className="w-3.5 h-3.5 text-[#8A94B2]" />
            </div>
            <div className="text-xl font-extrabold font-mono text-[#F2F5FF]">
              {deviceUptimeSeconds}s
            </div>
            <div className="text-[10px] text-[#8A94B2]">ESP32 FreeRTOS</div>
          </div>

          {/* Last Data Age */}
          <div className="alaya-card p-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#8A94B2]">
              <span>LAST PACKET</span>
              <RefreshCw className="w-3.5 h-3.5 text-[#C6FF00]" />
            </div>
            <div
              className={`text-xl font-extrabold font-mono ${
                secondsSinceLastData > 10 ? 'text-[#FF3B4E]' : 'text-[#C6FF00]'
              }`}
            >
              {secondsSinceLastData}s ago
            </div>
            <div className="text-[10px] text-[#8A94B2]">Heartbeat Rate: 1s</div>
          </div>
        </div>
      </div>

      {/* Hardware Control Console & Lighting Mode */}
      <div className="alaya-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F5BFF]/20">
          <div>
            <h2 className="text-base font-bold text-[#F2F5FF]">ESP32 Command Dispatcher</h2>
            <p className="text-xs text-[#8A94B2]">
              Direct binary serial commands sent over the 115200 baud stream with newline delimiter.
            </p>
          </div>

          {/* Auto / Manual Light Mode Toggle */}
          <div className="flex items-center gap-2 bg-[#121829] p-1 rounded-xl border border-[#1F5BFF]/30">
            <button
              onClick={() => {
                setLightMode('AUTO');
                handleSendCommand('LIGHT:AUTO');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                lightMode === 'AUTO'
                  ? 'bg-[#1F5BFF] text-white'
                  : 'text-[#8A94B2] hover:text-[#F2F5FF]'
              }`}
            >
              Auto (Firmware)
            </button>
            <button
              onClick={() => {
                setLightMode('MANUAL');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                lightMode === 'MANUAL'
                  ? 'bg-[#1F5BFF] text-white'
                  : 'text-[#8A94B2] hover:text-[#F2F5FF]'
              }`}
            >
              Manual Override
            </button>
          </div>
        </div>

        {/* Manual Light Indicator Controls (shown when Manual or for testing) */}
        {lightMode === 'MANUAL' && (
          <div className="p-4 rounded-xl bg-[#121829] border border-[#1F5BFF]/30 space-y-2">
            <span className="text-xs font-mono uppercase text-[#8A94B2] block">
              RGB Hygiene Dome Light Indicators:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => handleSendCommand('LIGHT:GREEN')}
                className="py-2.5 px-3 rounded-lg bg-[#C6FF00]/15 hover:bg-[#C6FF00]/25 text-[#C6FF00] border border-[#C6FF00]/40 font-mono text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                LIGHT:GREEN
              </button>
              <button
                onClick={() => handleSendCommand('LIGHT:AMBER')}
                className="py-2.5 px-3 rounded-lg bg-[#FFB020]/15 hover:bg-[#FFB020]/25 text-[#FFB020] border border-[#FFB020]/40 font-mono text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                LIGHT:AMBER
              </button>
              <button
                onClick={() => handleSendCommand('LIGHT:RED')}
                className="py-2.5 px-3 rounded-lg bg-[#FF3B4E]/15 hover:bg-[#FF3B4E]/25 text-[#FF3B4E] border border-[#FF3B4E]/40 font-mono text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                LIGHT:RED
              </button>
              <button
                onClick={() => handleSendCommand('LIGHT:BLUE')}
                className="py-2.5 px-3 rounded-lg bg-[#1F5BFF]/15 hover:bg-[#1F5BFF]/25 text-[#1F5BFF] border border-[#1F5BFF]/40 font-mono text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                LIGHT:BLUE
              </button>
              <button
                onClick={() => handleSendCommand('LIGHT:AUTO')}
                className="py-2.5 px-3 rounded-lg bg-[#0B0F1A] hover:bg-[#121829] text-[#8A94B2] border border-[#1F5BFF]/30 font-mono text-xs font-bold transition-all cursor-pointer"
              >
                LIGHT:AUTO
              </button>
            </div>
          </div>
        )}

        {/* Command Buttons Grid */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase text-[#8A94B2] block">
            Peripheral & Firmware Actions:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            <button
              onClick={() => handleSendCommand('BUZZ')}
              className="p-3 rounded-xl bg-[#121829] hover:bg-[#1F5BFF]/20 border border-[#1F5BFF]/35 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 font-mono font-bold text-xs text-[#F2F5FF]">
                <Volume2 className="w-4 h-4 text-[#FFB020]" />
                <span>BUZZ</span>
              </div>
              <p className="text-[10px] text-[#8A94B2] mt-1">Audible piezo alert chirp</p>
            </button>

            <button
              onClick={() => handleSendCommand('CLEANED')}
              className="p-3 rounded-xl bg-[#121829] hover:bg-[#1F5BFF]/20 border border-[#1F5BFF]/35 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 font-mono font-bold text-xs text-[#F2F5FF]">
                <CheckCircle2 className="w-4 h-4 text-[#C6FF00]" />
                <span>CLEANED</span>
              </div>
              <p className="text-[10px] text-[#8A94B2] mt-1">Start settling evaluation</p>
            </button>

            <button
              onClick={() => handleSendCommand('RECAL')}
              className="p-3 rounded-xl bg-[#121829] hover:bg-[#1F5BFF]/20 border border-[#1F5BFF]/35 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 font-mono font-bold text-xs text-[#F2F5FF]">
                <RefreshCw className="w-4 h-4 text-[#1F5BFF]" />
                <span>RECAL</span>
              </div>
              <p className="text-[10px] text-[#8A94B2] mt-1">Recalibrate MQ-135 baseline</p>
            </button>

            <button
              onClick={() => handleSendCommand('RESETREPORTS')}
              className="p-3 rounded-xl bg-[#121829] hover:bg-[#1F5BFF]/20 border border-[#1F5BFF]/35 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 font-mono font-bold text-xs text-[#F2F5FF]">
                <Sliders className="w-4 h-4 text-[#FF3B4E]" />
                <span>RESETREPORTS</span>
              </div>
              <p className="text-[10px] text-[#8A94B2] mt-1">Clear pending report queue</p>
            </button>

            <button
              onClick={() => handleSendCommand('RELAY:ON')}
              className="p-3 rounded-xl bg-[#121829] hover:bg-[#1F5BFF]/20 border border-[#1F5BFF]/35 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 font-mono font-bold text-xs text-[#F2F5FF]">
                <Power className="w-4 h-4 text-[#C6FF00]" />
                <span>RELAY:ON</span>
              </div>
              <p className="text-[10px] text-[#8A94B2] mt-1">Turn on exhaust fan relay</p>
            </button>

            <button
              onClick={() => handleSendCommand('RELAY:OFF')}
              className="p-3 rounded-xl bg-[#121829] hover:bg-[#1F5BFF]/20 border border-[#1F5BFF]/35 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 font-mono font-bold text-xs text-[#F2F5FF]">
                <Power className="w-4 h-4 text-[#8A94B2]" />
                <span>RELAY:OFF</span>
              </div>
              <p className="text-[10px] text-[#8A94B2] mt-1">Cut exhaust fan relay</p>
            </button>

            <button
              onClick={() => handleSendCommand('DEMO:ON')}
              className="p-3 rounded-xl bg-[#121829] hover:bg-[#1F5BFF]/20 border border-[#1F5BFF]/35 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 font-mono font-bold text-xs text-[#F2F5FF]">
                <Flame className="w-4 h-4 text-[#C6FF00]" />
                <span>DEMO:ON</span>
              </div>
              <p className="text-[10px] text-[#8A94B2] mt-1">Shorten settling to 60s</p>
            </button>

            <button
              onClick={() => handleSendCommand('PING')}
              className="p-3 rounded-xl bg-[#121829] hover:bg-[#1F5BFF]/20 border border-[#1F5BFF]/35 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 font-mono font-bold text-xs text-[#F2F5FF]">
                <Activity className="w-4 h-4 text-[#1F5BFF]" />
                <span>PING</span>
              </div>
              <p className="text-[10px] text-[#8A94B2] mt-1">Request ESP32 status</p>
            </button>
          </div>
        </div>

        {/* Custom Serial Command Input */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2 pt-2">
          <input
            type="text"
            value={customCmd}
            onChange={(e) => setCustomCmd(e.target.value)}
            placeholder="Custom command (e.g. REPORTS:3, THRESHOLD:65, PING)..."
            className="flex-1 px-4 py-2.5 text-xs font-mono bg-[#121829] border border-[#1F5BFF]/40 rounded-xl text-[#F2F5FF] placeholder-[#8A94B2] focus:outline-none focus:border-[#C6FF00]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#1F5BFF] hover:bg-[#1F5BFF]/90 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* Command & Raw Serial Transmission Log */}
      <div className="alaya-card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#1F5BFF]" />
            <h2 className="text-base font-bold text-[#F2F5FF]">{t.serialLog}</h2>
          </div>
          <span className="text-xs font-mono text-[#8A94B2]">{hardwareLogs.length} events logged</span>
        </div>

        <div className="h-64 overflow-y-auto p-4 rounded-xl bg-[#05060A] border border-[#1F5BFF]/30 font-mono text-xs space-y-1.5 scrollbar-thin">
          {hardwareLogs.map((entry, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-[#8A94B2] shrink-0">[{entry.time}]</span>
              <span
                className={`font-semibold shrink-0 uppercase text-[10px] px-1 py-0.2 rounded ${
                  entry.type === 'rx'
                    ? 'bg-[#C6FF00]/15 text-[#C6FF00]'
                    : entry.type === 'tx'
                    ? 'bg-[#1F5BFF]/15 text-[#1F5BFF]'
                    : entry.type === 'err'
                    ? 'bg-[#FF3B4E]/15 text-[#FF3B4E]'
                    : 'bg-[#121829] text-[#8A94B2]'
                }`}
              >
                {entry.type}
              </span>
              <span
                className={`break-all ${
                  entry.type === 'err'
                    ? 'text-[#FF3B4E]'
                    : entry.type === 'rx'
                    ? 'text-[#F2F5FF]'
                    : entry.type === 'tx'
                    ? 'text-[#C6FF00]'
                    : 'text-[#8A94B2]'
                }`}
              >
                {entry.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
