import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Washroom } from '../types';
import { QrCode, Download, X, Copy, Check, Printer } from 'lucide-react';

interface QrCodeModalProps {
  washroom: Washroom | null;
  onClose: () => void;
  language: 'en' | 'hi';
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ washroom, onClose, language }) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!washroom) return;

    // Build the public URL for this washroom
    const origin = window.location.origin;
    const publicUrl = `${origin}/#public?washroom=${washroom.id}`;

    QRCode.toDataURL(publicUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#05060A',
        light: '#FFFFFF',
      },
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [washroom]);

  if (!washroom) return null;

  const origin = window.location.origin;
  const publicUrl = `${origin}/#public?washroom=${washroom.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `ALAYA-QR-${washroom.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ALAYA Door QR - ${washroom.name}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              text-align: center;
              padding: 40px;
              color: #000;
            }
            .card {
              border: 3px solid #000;
              border-radius: 16px;
              padding: 30px;
              max-width: 420px;
              margin: 0 auto;
            }
            h1 { margin: 0 0 8px; font-size: 24px; }
            h2 { margin: 0 0 16px; font-size: 18px; color: #444; }
            img { width: 280px; height: 280px; margin: 10px 0; }
            p { font-size: 14px; margin: 8px 0; color: #555; }
            .badge {
              display: inline-block;
              background: #1F5BFF;
              color: #fff;
              padding: 6px 14px;
              border-radius: 20px;
              font-weight: bold;
              font-size: 12px;
              margin-bottom: 12px;
            }
            .footer {
              margin-top: 18px;
              font-size: 11px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">ALAYA SMART HYGIENE</div>
            <h1>${washroom.name}</h1>
            <h2>${washroom.floor}</h2>
            <img src="${dataUrl}" alt="QR Code" />
            <p><strong>Scan to check live cleanliness or report an issue</strong></p>
            <p>स्वच्छता स्थिति देखने या रिपोर्ट दर्ज करने हेतु स्कैन करें</p>
            <div class="footer">Directorate of Education, GNCT of Delhi • Swachh Bharat Mission</div>
          </div>
          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0B0F1A] border border-[#1F5BFF]/40 rounded-2xl shadow-[0_0_35px_rgba(31,91,255,0.35)] overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#121829] px-5 py-3.5 border-b border-[#1F5BFF]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#C6FF00]" />
            <h3 className="font-semibold text-sm text-[#F2F5FF]">
              {language === 'hi' ? 'प्रसाधन क्यूआर कोड (Door QR)' : 'Washroom Door QR Code'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8A94B2] hover:text-[#F2F5FF] p-1 rounded-lg hover:bg-[#1F5BFF]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-center space-y-4">
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#1F5BFF]/20 text-[#C6FF00] border border-[#1F5BFF]/40 mb-1.5">
              {washroom.floor} • {washroom.washroomType || 'Standard'}
            </div>
            <h4 className="text-base font-semibold text-[#F2F5FF]">{washroom.name}</h4>
            <p className="text-xs text-[#8A94B2] mt-0.5">
              {language === 'hi'
                ? 'इस क्यूआर को दरवाजे पर लगाएं ताकि छात्र और शिक्षक स्थिति देख सकें'
                : 'Stick this QR on the washroom door for public hygiene visibility'}
            </p>
          </div>

          {/* QR Code Container */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-2xl shadow-lg border-2 border-[#1F5BFF]/40">
              {dataUrl ? (
                <img src={dataUrl} alt={`QR Code for ${washroom.name}`} className="w-56 h-56 object-contain" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-black/50 text-xs">
                  Generating QR...
                </div>
              )}
            </div>
          </div>

          {/* URL Display */}
          <div className="p-2.5 rounded-xl bg-[#05060A] border border-[rgba(31,91,255,0.25)] flex items-center justify-between gap-2 text-xs font-mono text-[#8A94B2]">
            <span className="truncate">{publicUrl}</span>
            <button
              onClick={handleCopyLink}
              className="shrink-0 p-1.5 rounded-lg bg-[#121829] hover:bg-[#1F5BFF]/20 text-[#F2F5FF] hover:text-[#C6FF00] border border-[#1F5BFF]/30 transition-colors"
              title="Copy link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#C6FF00]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1F5BFF] hover:bg-[#1F5BFF]/90 text-[#F2F5FF] text-xs font-semibold transition-all shadow-[0_0_15px_rgba(31,91,255,0.4)]"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'hi' ? 'डाउनलोड PNG' : 'Download PNG'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#121829] hover:bg-[#1F5BFF]/20 text-[#F2F5FF] text-xs font-semibold border border-[#1F5BFF]/40 transition-colors"
            >
              <Printer className="w-4 h-4 text-[#C6FF00]" />
              <span>{language === 'hi' ? 'प्रिंट करें (Print)' : 'Print Door Sign'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
