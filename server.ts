import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Helper to clean 10-digit Indian phone
const cleanIndianPhone10 = (raw: string): string => {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits.slice(-10);
};

// Real SMS Dispatch API
app.post('/api/send-sms', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      phone,
      message,
      provider = 'fast2sms',
      apiKey,
      customUrl,
      twilioSid,
      twilioToken,
      twilioFrom,
    } = req.body;

    if (!phone || !message) {
      res.status(400).json({ success: false, error: 'Phone number and message are required' });
      return;
    }

    const cleanPhone = cleanIndianPhone10(phone);
    if (cleanPhone.length !== 10) {
      res.status(400).json({ success: false, error: 'Invalid 10-digit Indian mobile number' });
      return;
    }

    const effectiveFast2SmsKey = apiKey || process.env.FAST2SMS_API_KEY || '';
    const effectiveTwilioSid = twilioSid || process.env.TWILIO_ACCOUNT_SID || '';
    const effectiveTwilioToken = twilioToken || process.env.TWILIO_AUTH_TOKEN || '';
    const effectiveTwilioFrom = twilioFrom || process.env.TWILIO_PHONE_NUMBER || '';

    // 1. FAST2SMS (Most popular instant Indian SMS gateway)
    if (provider === 'fast2sms') {
      if (!effectiveFast2SmsKey) {
        res.status(400).json({
          success: false,
          error: 'MISSING_API_KEY',
          message: 'Fast2SMS API Key nahi mili. Admin settings me apni Fast2SMS API key enter karein (fast2sms.com se free milti hai).',
        });
        return;
      }

      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': effectiveFast2SmsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: message,
          language: 'english',
          flash: 0,
          numbers: cleanPhone,
        }),
      });

      const data: any = await response.json().catch(() => ({}));

      if (response.ok && data?.return === true) {
        res.json({
          success: true,
          provider: 'fast2sms',
          message: 'SMS phone par successfully send ho gaya!',
          requestId: data?.request_id,
          data,
        });
        return;
      } else {
        const errorMsg = data?.message?.[0] || data?.message || 'Fast2SMS delivery failed';
        res.status(400).json({
          success: false,
          provider: 'fast2sms',
          error: errorMsg,
          message: `Fast2SMS Error: ${errorMsg}`,
        });
        return;
      }
    }

    // 2. TWILIO (Global SMS Gateway)
    if (provider === 'twilio') {
      if (!effectiveTwilioSid || !effectiveTwilioToken || !effectiveTwilioFrom) {
        res.status(400).json({
          success: false,
          error: 'MISSING_TWILIO_CREDS',
          message: 'Twilio Account SID, Auth Token aur Phone Number required hain.',
        });
        return;
      }

      const auth = Buffer.from(`${effectiveTwilioSid}:${effectiveTwilioToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', `+91${cleanPhone}`);
      params.append('From', effectiveTwilioFrom);
      params.append('Body', message);

      const twilioRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${effectiveTwilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );

      const twilioData: any = await twilioRes.json().catch(() => ({}));

      if (twilioRes.ok && twilioData?.sid) {
        res.json({
          success: true,
          provider: 'twilio',
          message: 'Twilio SMS successfully sent!',
          sid: twilioData.sid,
        });
        return;
      } else {
        res.status(400).json({
          success: false,
          provider: 'twilio',
          error: twilioData?.message || 'Twilio failed to send SMS',
        });
        return;
      }
    }

    // 3. CUSTOM WEBHOOK / API
    if (provider === 'custom' && customUrl) {
      const customRes = await fetch(customUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'Authorization': apiKey, 'X-API-Key': apiKey } : {}),
        },
        body: JSON.stringify({
          phone: cleanPhone,
          phoneE164: `+91${cleanPhone}`,
          message,
          timestamp: Date.now(),
        }),
      });

      const customData = await customRes.json().catch(() => ({}));
      res.json({
        success: customRes.ok,
        provider: 'custom',
        data: customData,
      });
      return;
    }

    res.status(400).json({ success: false, error: 'Unknown provider or missing configuration' });
  } catch (err: any) {
    console.error('Error sending SMS:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Server error while sending SMS',
    });
  }
});

// Vite middleware in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ALAYA Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
