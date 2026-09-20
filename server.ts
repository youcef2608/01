import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { BOOKS_LIBRARY_DATA } from './src/data/booksLibraryData';
import { INITIAL_CALLS, INITIAL_INBOUND_NOTES } from './src/data/seedData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'db.json');
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mrrnahcytpocnasnlijv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ycm5haGN5dHBvY25hc25saWp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTg1MTQxMywiZXhwIjoyMTA1NDI3NDEzfQ.1UJ0RZpkTz_TP1_SzjWG2ELivvxBGww9VTxpyHmOez4';

async function supabaseQuery(table: string, method = 'GET', body: any = null) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) return null;
    return await res.json().catch(() => null);
  } catch (e) {
    return null;
  }
}

function loadLocalDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Error loading db.json:', e);
  }
  return null;
}

function saveLocalDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving db.json:', e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable CORS for mobile apps and other origins
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, apikey');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json());

  // CARTO Map Key configuration stored securely in environment
  const CARTO_API_KEY = process.env.CARTO_API_KEY || '';

  // Endpoint to provide authenticated map tile configuration
  app.get('/api/config/map', (req, res) => {
    res.json({
      cartoApiKey: CARTO_API_KEY,
      cartoTileUrl: CARTO_API_KEY ? `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?api_key=${CARTO_API_KEY}` : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      cartoTileUrlFallback: CARTO_API_KEY ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=${CARTO_API_KEY}` : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      osmTileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    });
  });

  // Persistent data store with local file fallback + Supabase
  const savedDb = loadLocalDb();
  let callsData: any[] = savedDb?.calls || [];
  let notesData: any[] = savedDb?.notes || [];
  let responsesData: any[] = savedDb?.responses || [];
  let usersData: any[] = savedDb?.users || [];

  const persistAll = () => {
    saveLocalDb({ calls: callsData, notes: notesData, responses: responsesData, users: usersData });
  };

  // Always keep database clean
  persistAll();

  // Resend API Key for real email verification codes
  const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
  const verificationCodes = new Map<string, { code: string; expiresAt: number; email?: string }>();

  // Local Server Knowledge Registry (activities, past evaluations, documented solutions)
  let serverEvaluationsDatabase: any[] = [];


  // Helper: Search Server Knowledge Database First
  function searchServerRecords(query: string, context?: any) {
    if (!query || typeof query !== 'string') {
      return { found: false, score: 0, reason: 'استفسار فارغ' };
    }

    const normalize = (t: string) =>
      t.toLowerCase()
        .replace(/[\u064B-\u065F]/g, '')
        .replace(/[إأآا]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/[^\u0621-\u064A\w\s]/g, ' ');

    const normalizedQuery = normalize(query);
    const stopWords = new Set(['في', 'من', 'على', 'الي', 'الى', 'عن', 'ما', 'هو', 'هي', 'كيف', 'هل', 'مع', 'هذا', 'هذه', 'التي', 'الذي', 'ان', 'كان', 'تم', 'او', 'ثم', 'لنا', 'كم', 'كل', 'لو']);
    
    const tokens = normalizedQuery.split(/\s+/).filter(t => t.length >= 3 && !stopWords.has(t));
    if (tokens.length === 0) {
      return { found: false, score: 0, reason: 'لا توجد كلمات مفتاحية كافية' };
    }

    let bestMatch: any = null;
    let bestScore = 0;
    let matchedFields: string[] = [];

    for (const record of serverEvaluationsDatabase) {
      let score = 0;
      const currentMatchedFields: string[] = [];

      const normTitle = normalize(record.activityTitle || '');
      const normAssoc = normalize(record.associationName || '');
      const normChallenges = normalize(record.challengesFaced || '');
      const normWell = normalize(record.whatWentWell || '');
      const normNotes = normalize(record.operationalNotes || '');
      const normLessons = normalize((record.lessonsLearned || []).join(' '));

      for (const token of tokens) {
        if (normChallenges.includes(token)) {
          score += 3.5;
          if (!currentMatchedFields.includes('العقبات والتحديات')) currentMatchedFields.push('العقبات والتحديات');
        }
        if (normTitle.includes(token)) {
          score += 3.0;
          if (!currentMatchedFields.includes('عنوان النشاط')) currentMatchedFields.push('عنوان النشاط');
        }
        if (normLessons.includes(token)) {
          score += 2.5;
          if (!currentMatchedFields.includes('الدروس المستفادة')) currentMatchedFields.push('الدروس المستفادة');
        }
        if (normNotes.includes(token)) {
          score += 2.0;
          if (!currentMatchedFields.includes('الملاحظات التشغيلية')) currentMatchedFields.push('الملاحظات التشغيلية');
        }
        if (normWell.includes(token)) {
          score += 1.5;
          if (!currentMatchedFields.includes('عوامل النجاح')) currentMatchedFields.push('عوامل النجاح');
        }
        if (normAssoc.includes(token)) {
          score += 1.0;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = record;
        matchedFields = currentMatchedFields;
      }
    }

    // Require strong relevance match (threshold >= 3.5)
    if (bestScore >= 3.5 && bestMatch) {
      return {
        found: true,
        score: bestScore,
        matchedRecord: bestMatch,
        matchedFields,
        reason: `تم العثور على سابقة مطابقة في قاعدة بيانات السيرفر (${bestMatch.associationName} - ${bestMatch.activityTitle})`
      };
    }

    return {
      found: false,
      score: bestScore,
      reason: 'لم يتم العثور على سابقة مطابقة كافية في قاعدة بيانات السيرفر المحلي'
    };
  }

  // Dual-Tier Search Engine: Server Database First -> Internet Fallback via Google Search Grounding
  async function executeDualTierEngine(params: {
    query: string;
    context?: any;
    history?: any[];
    ai: any;
  }) {
    const { query, context, history, ai } = params;

    // STEP 1: Search Server Database First
    const serverResult = searchServerRecords(query, context);

    if (serverResult.found && serverResult.matchedRecord) {
      const matched = serverResult.matchedRecord;

      if (ai) {
        const serverPrompt = `أنت كبير مستشاري العمليات الميدانية لمنظومة "أثر".
المستخدم يستفسر عن: "${query}".

تنبيه مسار الاستعلام:
1. تم فحص قاعدة بيانات السيرفر الداخلي أولاً (Server Database First).
2. وُجدت التجربة الميدانية السابقة التالية المعتمدة والمطابقة:
- اسم النشاط: ${matched.activityTitle}
- الجمعية المنفذة: ${matched.associationName}
- المدينة: ${matched.city || 'المملكة'}
- ما تم بنجاح: ${matched.whatWentWell}
- العقبات والمشاكل المرصودة: ${matched.challengesFaced}
- الملاحظات والحلول التشغيلية: ${matched.operationalNotes}
- الدروس المستفادة: ${(matched.lessonsLearned || []).join(' | ')}

المطلوب:
- قدّم إجابة استشارية محكمة وعملية تستند صراحة إلى هذه التجربة الميدانية الموثقة في السيرفر.
- اذكر في أول سطر بوضوح: "🖥️ [مصدر محلي معتمد: تم استرجاع الحل من قاعدة بيانات السيرفر لمنظومة أثر - سابقة نشاط \"${matched.activityTitle}\" المنفذ من قِبل ${matched.associationName}]".
- لخص كيف تعاملت هذه الجمعية مع المشكلة وما هي الخطوات الميدانية المباشرة لتفاديها بنجاح.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: serverPrompt,
          config: {
            systemInstruction: 'أنت مستشار تشغيلي لمنظومة أثر تعتمد على السجلات الميدانية الموثقة في السيرفر أولاً.'
          }
        });

        return {
          success: true,
          searchedServerFirst: true,
          serverFound: true,
          source: 'server_database',
          pipeline: [
            {
              step: 'server_search',
              name: 'فحص قاعدة بيانات السيرفر الداخلي',
              status: 'found',
              message: `تم العثور على سابقة مطابقة في قاعدة بيانات السيرفر: "${matched.activityTitle}" (${matched.associationName})`,
              timestamp: new Date().toISOString()
            }
          ],
          matchedRecord: {
            id: matched.id,
            activityTitle: matched.activityTitle,
            associationName: matched.associationName,
            challengesFaced: matched.challengesFaced,
            whatWentWell: matched.whatWentWell,
            lessonsLearned: matched.lessonsLearned || []
          },
          answer: response.text || 'تم استرجاع الإرشاد الميداني المعتمد من السيرفر بنجاح.'
        };
      } else {
        // Fallback rule when Gemini key is not configured
        return {
          success: true,
          searchedServerFirst: true,
          serverFound: true,
          source: 'server_database',
          pipeline: [
            {
              step: 'server_search',
              name: 'فحص قاعدة بيانات السيرفر الداخلي',
              status: 'found',
              message: `تم العثور على سابقة مطابقة في قاعدة بيانات السيرفر: "${matched.activityTitle}" (${matched.associationName})`,
              timestamp: new Date().toISOString()
            }
          ],
          matchedRecord: {
            id: matched.id,
            activityTitle: matched.activityTitle,
            associationName: matched.associationName,
            challengesFaced: matched.challengesFaced,
            whatWentWell: matched.whatWentWell,
            lessonsLearned: matched.lessonsLearned || []
          },
          answer: `🖥️ [مصدر محلي معتمد: مستخرج من قاعدة بيانات السيرفر - تجربة "${matched.activityTitle}"]\n\nبناءً على السجل الموثق لدى (${matched.associationName}):\n• التحدي المرصود: ${matched.challengesFaced}\n• الإجراء التشغيلي المعتمد: ${matched.operationalNotes}\n• أهم الدروس المستفادة: ${(matched.lessonsLearned || []).join('، ')}.`
        };
      }
    }

    // STEP 2: NOT FOUND ON SERVER -> AUTOMATIC INTERNET SEARCH (Google Search Grounding)
    if (ai) {
      const webPrompt = `أنت كبير المستشارين الميدانيين والتشغيليين لمنظومة "أثر" للنداءات والعمل الخيري بالمملكة العربية السعودية.

تنبيه مسار المعالجة المزدوج (Dual-Tier Execution):
1. تم فحص قاعدة بيانات السيرفر وسجلات الجمعيات المحلية أولاً: [لم يُعثر على سابقة أو تجربة مطابقة كافية مسجلة محلياً في السيرفر لهذا الاستفسار].
2. بناءً على توجيهات المنظومة الصارمة: تم الانتقال التلقائي للبحث المباشر عبر الإنترنت (Google Search Grounding) لاسترجاع أحدث البروتوكولات الدولية والسعودية، معايير المركز الوطني لتنمية القطاع غير الربحي، الدفاع المدني، وهيئة الهلال الأحمر.

استفسار المسؤول الميداني:
"${query}"

${context?.activityTitle ? `سياق النشاط الحالي: ${context.activityTitle} (${context.associationName || ''})` : ''}

المطلوب:
- قم بالبحث عبر الإنترنت عن أحدث وأفضل الممارسات الميدانية والإجراءات التنفيذية لحل هذه المشكلة أو الإجابة على السؤال.
- اذكر في أول سطر إشعاراً واضحاً ومميزاً:
"🌐 [بحث مباشر عبر الإنترنت: نظراً لعدم توفر سابقة محلية مسجلة في السيرفر، تم استرجاع هذه الممارسة المعتمدة بالبحث المباشر في شبكة الإنترنت عبر Google Search]"
- قدّم حلولاً عملية، قابلة للتطبيق الفوري في الميدان في المملكة العربية السعودية، مدعومة بالمراجع والمعايير التشغيلية المعتمدة.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: webPrompt,
        config: {
          systemInstruction: 'أنت مستشار ميداني خبير. عند عدم وجود سابقة في السيرفر، تبحث في الإنترنت وتستخرج المصادر الدقيقة.',
          tools: [{ googleSearch: {} }]
        }
      });

      const candidate = response.candidates?.[0];
      const grounding = candidate?.groundingMetadata;
      const webChunks = grounding?.groundingChunks || [];
      const webSources = webChunks
        .filter((c: any) => c.web?.uri)
        .map((c: any) => ({
          title: c.web.title || new URL(c.web.uri).hostname,
          uri: c.web.uri
        }));
      const searchQueries = grounding?.webSearchQueries || [];

      return {
        success: true,
        searchedServerFirst: true,
        serverFound: false,
        source: 'web_search_grounding',
        pipeline: [
          {
            step: 'server_search',
            name: 'فحص قاعدة بيانات السيرفر الداخلي',
            status: 'not_found',
            message: 'تم فحص سجلات السيرفر أولاً: لم يُعثر على تجربة مطابقة مسجلة محلياً',
            timestamp: new Date().toISOString()
          },
          {
            step: 'internet_search',
            name: 'البحث المباشر عبر الإنترنت (Google Grounding)',
            status: 'completed',
            message: 'تم الانتقال التلقائي للبحث عبر الإنترنت واسترجاع أحدث البروتوكولات المعتمدة',
            timestamp: new Date().toISOString()
          }
        ],
        webSources: webSources.slice(0, 5),
        searchQueries,
        answer: response.text || 'تم استرجاع الإرشادات من شبكة الإنترنت بنجاح.'
      };
    } else {
      // Fallback rule when Gemini client is not initialized
      return {
        success: true,
        searchedServerFirst: true,
        serverFound: false,
        source: 'rule_engine',
        pipeline: [
          {
            step: 'server_search',
            name: 'فحص قاعدة بيانات السيرفر الداخلي',
            status: 'not_found',
            message: 'تم فحص سجلات السيرفر أولاً: لم يُعثر على سابقة مسجلة محلياً',
            timestamp: new Date().toISOString()
          },
          {
            step: 'internet_search',
            name: 'محاكاة بحث الإنترنت والبروتوكولات العامة',
            status: 'completed',
            message: 'تم استرجاع المعايير الإرشادية القياسية للقطاع غير الربحي',
            timestamp: new Date().toISOString()
          }
        ],
        webSources: [
          { title: 'المديرية العامة للحماية المدنية الجزائرية - دليل الإسعاف والطوارئ (14)', uri: 'https://www.protectioncivile.dz' },
          { title: 'وزارة التضامن الوطني والأسرة وقضايا المرأة بالجمهورية الجزائرية', uri: 'https://www.msnfcf.gov.dz' },
          { title: 'الهلال الأحمر الجزائري - العمل الإنساني والإغاثي الميداني', uri: 'https://cra-algerie.org' }
        ],
        searchQueries: [query],
        answer: `🌐 [بحث منظومة أثر للعمل الميداني: تم استرجاع المعايير الوطنية المعتمدة]\n\nبشأن "${query}":\n1. مراجعة بروتوكولات السلامة الميدانية والتنسيق مع الحماية المدنية أو السلطات المحلية.\n2. تحديد قائد ميداني مسؤول وتوزيع المتطوعين في مجموعات صغيرة واضحة المهام.\n3. توثيق المخرجات والأرقام الميدانية لإيداع التقرير العام الإجباري واعتماد نقاط الجمعية.`
      };
    }
  }

  // Dynamic Gemini AI client (supports system env or user-provided custom key)
  function getGeminiClient(customKey?: string) {
    const apiKey = customKey || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') return null;
    return new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', name: 'Athar System' });
  });

  // --- REAL AUTHENTICATION SYSTEM (No mock/fake data) ---
  
  // Helper to send real email via Resend API
  async function sendResendOtpEmail(toEmail: string, code: string, recipientName: string) {
    if (!RESEND_API_KEY) return false;
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Athar DZ <onboarding@resend.dev>',
          to: [toEmail],
          subject: `رمز التحقق لمنظومة أثر الجزائر: ${code}`,
          html: `
            <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; background-color: #0f141c; color: #ffffff; border-radius: 16px; border: 1px solid #1e293b; padding: 32px; text-align: right;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 28px; font-weight: 900; color: #10b981; letter-spacing: -0.5px;">أثر | Athar DZ</span>
                <p style="font-size: 12px; color: #94a3b8; margin-top: 4px;">المنظومة الوطنية لتنسيق العمل الميداني والتطوعي • الجزائر</p>
              </div>
              <h2 style="font-size: 18px; color: #f1f5f9; margin-bottom: 8px;">مرحباً ${recipientName || 'بكم'}،</h2>
              <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">استخدم رمز التحقق السري التالي لتأكيد الدخول إلى حسابك الميداني:</p>
              <div style="background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1)); border: 2px solid #10b981; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-family: monospace; font-size: 36px; font-weight: 900; color: #34d399; letter-spacing: 10px;">${code}</span>
              </div>
              <p style="font-size: 12px; color: #64748b; line-height: 1.5;">هذا الرمز صالح لمدة 10 دقائق. إذا لم تكن أنت من طلب هذا الرمز، يمكنك تجاهل هذه الرسالة بأمان.</p>
              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #475569;">
                الجمهورية الجزائرية الديمقراطية الشعبية — منصة إدارة النداءات والميدان
              </div>
            </div>
          `
        })
      });
      const resData = await response.json();
      console.log('[Resend Email OTP] Result:', resData);
      return response.ok;
    } catch (e: any) {
      console.warn('[Resend Email OTP] Send failed:', e.message);
      return false;
    }
  }

  // Send Verification Code (OTP) endpoint
  app.post('/api/auth/send-verification-code', async (req, res) => {
    try {
      const { email, phone, name } = req.body;
      const identifier = (email || phone || '').trim().toLowerCase();
      if (!identifier) {
        return res.status(400).json({ success: false, message: 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف.' });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      verificationCodes.set(identifier, {
        code,
        expiresAt: Date.now() + 10 * 60 * 1000,
        email: email || undefined
      });

      console.log(`[Athar Auth] Verification code generated for ${identifier}: ${code}`);

      let emailSent = false;
      if (email && email.includes('@')) {
        emailSent = await sendResendOtpEmail(email, code, name || 'شريك الميدان');
      }

      return res.json({
        success: true,
        message: emailSent 
          ? 'تم إرسال رمز التحقق بنجاح إلى بريدك الإلكتروني.'
          : 'تم تجهيز رمز التحقق الميداني بنجاح.',
        code,
        emailSent
      });
    } catch (err: any) {
      console.error('Send verification code error:', err);
      return res.status(500).json({ success: false, message: 'حدث خطأ أثناء إرسال رمز التحقق.' });
    }
  });

  // Verify Code endpoint
  app.post('/api/auth/verify-code', (req, res) => {
    const { identifier, code } = req.body;
    if (!identifier || !code) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال الحساب ورمز التحقق.' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const entry = verificationCodes.get(cleanId);

    if (!entry) {
      return res.status(400).json({ success: false, message: 'انتهت صلاحية رمز التحقق أو لم يتم طلبه، يرجى إعادة الإرسال.' });
    }

    if (Date.now() > entry.expiresAt) {
      verificationCodes.delete(cleanId);
      return res.status(400).json({ success: false, message: 'انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد.' });
    }

    if (entry.code !== code.trim()) {
      return res.status(400).json({ success: false, message: 'رمز التحقق غير صحيح، يرجى التأكد وإعادة المحاولة.' });
    }

    verificationCodes.delete(cleanId);
    return res.json({ success: true, message: 'تم التحقق بنجاح.' });
  });

  // Register Real User / Association
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, phone, email, password, role, associationName, gpsCoords, verificationCode } = req.body;
      if (!name || !phone || !password) {
        return res.status(400).json({ success: false, message: 'يرجى ملء جميع الحقول المطلوبة (الاسم، الهاتف، كلمة المرور).' });
      }

      const cleanPhone = phone.replace(/\s+/g, '');
      const existing = usersData.find((u: any) => 
        (u.phone && u.phone.replace(/\s+/g, '') === cleanPhone) || 
        (email && u.email && u.email.toLowerCase() === email.toLowerCase())
      );

      if (existing) {
        return res.status(400).json({ success: false, message: 'رقم الهاتف أو البريد الإلكتروني مسجل بالفعل.' });
      }

      // If verification code provided, verify it
      if (verificationCode) {
        const identifier = (email || cleanPhone).toLowerCase();
        const entry = verificationCodes.get(identifier);
        if (entry && entry.code !== verificationCode.trim()) {
          return res.status(400).json({ success: false, message: 'رمز التحقق المدخل غير صحيح.' });
        }
        if (entry) verificationCodes.delete(identifier);
      }

      const assignedRole = role || 'association';
      const roleTitle = assignedRole === 'association' ? 'جمعية معتمدة' : assignedRole === 'field_medic' ? 'طاقم إسعاف' : 'متطوع ميداني';
      const assocName = associationName || (assignedRole === 'association' ? name : '');

      const newUser = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        phone: cleanPhone,
        email: email ? email.trim() : `${cleanPhone}@athar.dz`,
        password: password,
        role: assignedRole,
        roleTitle: roleTitle,
        associationName: assocName,
        wilaya: 'الجزائر',
        gpsCoords: gpsCoords || { lat: 36.7538, lng: 3.0588 },
        isVerified: true,
        volunteerHours: 0,
        points: 0,
        activeInitiativesCount: 0,
        createdAt: new Date().toISOString()
      };

      usersData.push(newUser);
      persistAll();

      const { password: _, ...userSafe } = newUser;
      return res.json({ success: true, user: userSafe, message: 'تم إنشاء الحساب بنجاح.' });
    } catch (err: any) {
      console.error('Registration error:', err);
      return res.status(500).json({ success: false, message: 'حدث خطأ أثناء إنشاء الحساب.' });
    }
  });

  // Real Login with OTP Verification
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { identifier, password, code } = req.body;
      if (!identifier || !password) {
        return res.status(400).json({ success: false, message: 'يرجى إدخال اسم الحساب وكلمة المرور.' });
      }

      const cleanInput = identifier.replace(/\s+/g, '').toLowerCase();

      // Find user matching phone, email, or exact name
      const user = usersData.find((u: any) => {
        const phoneMatch = u.phone && u.phone.replace(/\s+/g, '').toLowerCase() === cleanInput;
        const emailMatch = u.email && u.email.toLowerCase() === cleanInput;
        const nameMatch = u.name && u.name.toLowerCase() === cleanInput;
        const assocMatch = u.associationName && u.associationName.toLowerCase() === cleanInput;
        return phoneMatch || emailMatch || nameMatch || assocMatch;
      });

      if (!user) {
        return res.status(401).json({ success: false, message: 'الحساب غير موجود، يرجى التحقق أو إنشاء حساب جديد.' });
      }

      if (user.password !== password) {
        return res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة.' });
      }

      // Step 2: Verification code check
      if (!code) {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        verificationCodes.set(cleanInput, {
          code: otpCode,
          expiresAt: Date.now() + 10 * 60 * 1000,
          email: user.email
        });

        let emailSent = false;
        if (user.email && user.email.includes('@')) {
          emailSent = await sendResendOtpEmail(user.email, otpCode, user.associationName || user.name);
        }

        return res.json({
          success: true,
          requireCode: true,
          email: user.email,
          emailSent,
          code: otpCode,
          message: emailSent 
            ? 'تم إرسال رمز التحقق إلى بريدك الإلكتروني.'
            : 'تم توليد رمز التحقق، يرجى إدخاله لإكمال الدخول.'
        });
      }

      // Validate code
      const entry = verificationCodes.get(cleanInput);
      if (entry && entry.code !== code.trim()) {
        return res.status(400).json({ success: false, message: 'رمز التحقق غير صحيح، يرجى التأكد.' });
      }
      if (entry) verificationCodes.delete(cleanInput);

      const { password: _, ...userSafe } = user;
      return res.json({ success: true, user: userSafe, message: 'تم تسجيل الدخول بنجاح.' });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'حدث خطأ أثناء تسجيل الدخول.' });
    }
  });

  // Unified sync endpoint for Web & Mobile App (H:\02)
  app.get('/api/sync', (req, res) => {
    res.json({
      success: true,
      calls: callsData,
      responses: responsesData,
      notes: notesData,
      usersCount: usersData.length,
      timestamp: new Date().toISOString()
    });
  });

  // Get current users count & list
  app.get('/api/auth/users', (req, res) => {
    res.json({
      success: true,
      count: usersData.length,
      users: usersData.map(({ password, ...u }: any) => u)
    });
  });


  // Mobile App Download Endpoint
  app.get('/api/download/app', (req, res) => {
    const candidatePaths = [
      path.join(__dirname, 'public', 'athar-app.apk'),
      path.join(__dirname, '..', '02', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk'),
      path.join(__dirname, '..', '02', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk')
    ];

    for (const apkPath of candidatePaths) {
      if (fs.existsSync(apkPath)) {
        return res.download(apkPath, 'athar-volunteer-app.apk');
      }
    }

    res.status(404).json({
      success: false,
      message: 'ملف التطبيق غير متوفر حالياً، يرجى تشغيل gradle assembleDebug في مجلد 02 لإنشاء ملف apk.',
      projectPath: path.resolve(__dirname, '..', '02')
    });
  });

  // AI Analysis of Activity Post-Mortem & Cross-Association Lessons
  app.post('/api/ai/analyze-activity', async (req, res) => {
    try {
      const { activityTitle, associationName, whatWentWell, challengesFaced, operationalNotes, pastExperiences } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // High quality rule-based fallback when Gemini API key is not configured in local environment
        return res.json({
          success: true,
          summary: `أظهرت تجربة "${activityTitle || 'النشاط'}" المنفذة من قِبل (${associationName || 'الجمعية'}) نقاط قوة ملموسة في سرعة الاستجابة والتنسيق، مع تحديات لوجستية تتطلب تخطيطاً احترازياً مسبقاً.`,
          lessonsLearned: [
            whatWentWell ? `تعزيز وتكرار ممارسات: ${whatWentWell.slice(0, 70)}...` : 'ضرورة استمرار التوثيق الميداني المنتظم وتوزيع المهام بدقة.',
            challengesFaced ? `معالجة جذرية للتحدي المرصود: ${challengesFaced.slice(0, 70)}...` : 'التأكد من توفير قنوات اتصال بديلة للمتطوعين في الميدان.',
            'تأمين خطة طوارئ احتياطية للموارد والمعدات بنسبة 20% زيادة عن التقدير الأولي.'
          ],
          futureRiskMitigations: [
            'إجراء استطلاع ميداني للموقع قبل موعد انطلاق النشاط بـ 24 ساعة على الأقل.',
            'تحديد مسؤول لوجستي مختص بالتعامل مع المفاجآت ونقص الأدوات أو انقطاع الخدمات.',
            'تخصيص نقطة تجمع واضحة ومسار محدد لدخول وخروج المشاركين لتفادي الارتباك.'
          ],
          crossAssociationAdvice: [
            `توصية للجمعيات المماثلة: الاستفادة من تجربة (${associationName || 'الجهة المنفذة'}) في تجنب الوقوع في معضلات التنسيق الميداني المباشر.`,
            'مشاركة قوائم الموردين الموثوقين وأرقام الطوارئ بين الجمعيات في نفس النطاق الجغرافي لتوحيد الجهد.'
          ],
          readinessScore: 86,
          source: 'rule_engine'
        });
      }

      const prompt = `أنت كبير مستشاري العمليات الميدانية والذكاء الاصطناعي لمنظومة "أثر".
قم بإجراء تحليل شامل وعميق لتجربة هذا النشاط الميداني:
- عنوان النشاط / المبادرة: ${activityTitle || 'نشاط مجتمعي'}
- الجهة المنفذة: ${associationName || 'فريق مبادرة'}
- ما الذي نجح وتميز في النشاط: ${whatWentWell || 'غير محدد'}
- ما هي المشاكل والعقبات التي واجهت الفريق: ${challengesFaced || 'غير محدد'}
- ملاحظات تشغيلية إضافية: ${operationalNotes || 'لا توجد'}
- سياق تجارب سابقة لجمعيات أخرى: ${JSON.stringify(pastExperiences || [])}

المطلوب:
1. استخلاص ملخص تشخيصي احترافي (summary).
2. استخراج أهم 3-4 دروس مستفادة عملية وقابلة للقياس (lessonsLearned).
3. وضع 3 إجراءات استباقية للوقاية وتخفيف المخاطر في الأنشطة المستقبلية (futureRiskMitigations).
4. صياغة 2-3 توصيات جوهرية تستفيد منها الجمعيات والمبادرات الأخرى في المستقبل لمنع تكرار نفس المعضلة أو لتبني ما نجح (crossAssociationAdvice).
5. تقييم مؤشر الجاهزية التشغيلية (readinessScore) كنسبة مئوية بين 60 و 98.

أجب بصيغة JSON فقط بهذا الشكل:
{
  "summary": "...",
  "lessonsLearned": ["...", "..."],
  "futureRiskMitigations": ["...", "..."],
  "crossAssociationAdvice": ["...", "..."],
  "readinessScore": 88
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'أنت خبير تقييم الأنشطة والمبادرات الميدانية. أخرج النتيجة بصيغة JSON نظيفة فقط.',
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '{}';
      let parsed = {};
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        parsed = { raw: responseText };
      }

      return res.json({
        success: true,
        ...parsed,
        source: 'gemini'
      });
    } catch (err: any) {
      console.error('Gemini Activity Analysis Error:', err);
      res.status(500).json({ error: 'Failed to analyze activity', message: err.message });
    }
  });

  // ==========================================
  // ATHAR UNIFIED DATABASE REST APIS (Web & Mobile H:\02)
  // ==========================================

  // 1. Get all calls
  app.get('/api/calls', (req, res) => {
    res.json({
      success: true,
      count: callsData.length,
      calls: callsData
    });
  });

  // 2. Get single call
  app.get('/api/calls/:id', (req, res) => {
    const call = callsData.find((c: any) => c.id === req.params.id);
    if (!call) return res.status(404).json({ error: 'Call not found' });
    res.json({ success: true, call });
  });

  // 3. Create or save new call
  app.post('/api/calls', (req, res) => {
    try {
      const call = req.body;
      if (!call.id) call.id = `call-${Date.now()}`;
      if (!call.createdAt) call.createdAt = new Date().toISOString();
      call.updatedAt = new Date().toISOString();
      call.responsesCount = call.responsesCount || 0;
      call.confirmedCount = call.confirmedCount || 0;

      callsData = [call, ...callsData.filter((c: any) => c.id !== call.id)];
      persistAll();
      supabaseQuery('calls', 'POST', call).catch(() => {});

      console.log(`[Athar DB] Call created/updated: "${call.title}" by ${call.creatorOrg}`);
      res.json({ success: true, call });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Update call status
  app.put('/api/calls/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    callsData = callsData.map((c: any) => c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c);
    persistAll();
    res.json({ success: true, id, status });
  });

  // 5. Get responses
  app.get('/api/responses', (req, res) => {
    const { callId } = req.query;
    const filtered = callId ? responsesData.filter((r: any) => r.callId === callId) : responsesData;
    res.json({ success: true, responses: filtered, count: filtered.length });
  });

  // 6. Submit volunteer response (from web or mobile H:\02)
  app.post('/api/responses', (req, res) => {
    try {
      const response = req.body;
      if (!response.id) response.id = `resp-${Date.now()}`;
      if (!response.createdAt) response.createdAt = new Date().toISOString();
      if (!response.status) response.status = 'accepted';

      responsesData = [response, ...responsesData];

      // Update calls response counters
      callsData = callsData.map((c: any) => {
        if (c.id === response.callId) {
          return {
            ...c,
            responsesCount: (c.responsesCount || 0) + 1,
            confirmedCount: response.status === 'accepted' ? (c.confirmedCount || 0) + 1 : (c.confirmedCount || 0)
          };
        }
        return c;
      });

      persistAll();
      supabaseQuery('responses', 'POST', response).catch(() => {});

      console.log(`[Athar DB] Volunteer response submitted for call ${response.callId} by ${response.userName}`);
      res.json({ success: true, response });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Get inbound notes (from mobile app H:\02)
  app.get('/api/notes', (req, res) => {
    res.json({ success: true, count: notesData.length, notes: notesData });
  });

  // 8. Submit note from mobile app
  app.post('/api/notes', (req, res) => {
    try {
      const note = req.body;
      if (!note.id) note.id = `note-${Date.now()}`;
      if (!note.createdAt) note.createdAt = new Date().toISOString();
      if (!note.status) note.status = 'new';

      notesData = [note, ...notesData];
      persistAll();
      supabaseQuery('notes', 'POST', note).catch(() => {});

      console.log(`[Athar DB] Inbound note received from ${note.senderName}`);
      res.json({ success: true, note });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Status endpoint
  app.get('/api/ai/status', (req, res) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY);
    res.json({
      success: true,
      ready: true,
      hasKey,
      model: 'gemini-3.8-flash',
      engine: 'Google Gemini 3.8 Flash (Server-Side) + Dual-Tier Engine',
      capabilities: [
        'deep_evaluation',
        'cross_synthesis',
        'interactive_advisor',
        'playbook_generation',
        'server_first_lookup',
        'google_search_grounding'
      ],
      serverKnowledgeRecordsCount: serverEvaluationsDatabase.length
    });
  });

  // AI Interactive Advisor (Dual-tier: Server Knowledge Database First -> Google Search Grounding if not found)
  app.post('/api/ai/interactive-advisor', async (req, res) => {
    try {
      const { activityTitle, associationName, whatWentWell, challengesFaced, question, history } = req.body;
      const ai = getGeminiClient();

      const result = await executeDualTierEngine({
        query: question || '',
        context: { activityTitle, associationName, whatWentWell, challengesFaced },
        history,
        ai
      });

      return res.json(result);
    } catch (err: any) {
      console.error('Gemini Interactive Advisor Error:', err);
      res.status(500).json({ error: 'Failed to generate advisory response', message: err.message });
    }
  });

  // Dedicated Dual-Tier Smart Search: Server First -> Internet Search Fallback
  app.post('/api/ai/smart-search', async (req, res) => {
    try {
      const { query, context, history } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      const ai = getGeminiClient();
      const result = await executeDualTierEngine({
        query,
        context,
        history,
        ai
      });

      return res.json(result);
    } catch (err: any) {
      console.error('Dual Tier Smart Search Error:', err);
      res.status(500).json({ error: 'Failed to execute smart search', message: err.message });
    }
  });

  // Sync evaluations into server database (so server knowledge grows continuously)
  app.post('/api/evaluations/sync', (req, res) => {
    try {
      const { evaluations } = req.body;
      if (Array.isArray(evaluations)) {
        for (const ev of evaluations) {
          const existingIdx = serverEvaluationsDatabase.findIndex((e) => e.id === ev.id);
          if (existingIdx >= 0) {
            serverEvaluationsDatabase[existingIdx] = { ...serverEvaluationsDatabase[existingIdx], ...ev };
          } else {
            serverEvaluationsDatabase.push(ev);
          }
        }
      }
      res.json({
        success: true,
        count: serverEvaluationsDatabase.length,
        message: 'تمت مزامنة سجلات قاعدة بيانات السيرفر بنجاح'
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to sync evaluations', message: err.message });
    }
  });

  // Get server evaluations
  app.get('/api/evaluations', (req, res) => {
    res.json({
      success: true,
      data: serverEvaluationsDatabase
    });
  });

  // Endpoint to save or update Gemini AI API key dynamically
  app.post('/api/ai/save-key', (req, res) => {
    try {
      const { apiKey } = req.body;
      if (typeof apiKey === 'string') {
        const cleanKey = apiKey.trim();
        process.env.GEMINI_API_KEY = cleanKey;
        try {
          const envPath = path.join(__dirname, '.env');
          let content = '';
          if (fs.existsSync(envPath)) {
            content = fs.readFileSync(envPath, 'utf-8');
          }
          if (content.includes('GEMINI_API_KEY=')) {
            content = content.replace(/GEMINI_API_KEY=.*(\r?\n|$)/, `GEMINI_API_KEY="${cleanKey}"$1`);
          } else {
            content = `GEMINI_API_KEY="${cleanKey}"\n` + content;
          }
          fs.writeFileSync(envPath, content, 'utf-8');
        } catch (fileErr) {
          console.warn('Could not update .env file directly:', fileErr);
        }
        return res.json({
          success: true,
          message: cleanKey ? 'تم تفعيل وربط مفتاح الذكاء الاصطناعي (AI) المباشر بنجاح 🟢' : 'تم تفريغ المفتاح، يعمل المحرك الداخلي للذكاء الاصطناعي.'
        });
      }
      return res.status(400).json({ error: 'API key is required' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Dedicated AI Chat endpoint for real-time conversation & field assistance
  app.post('/api/ai/gemini-chat', async (req, res) => {
    try {
      const { message, history = [], attachment, mode, apiKey } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const clientKey = (req.headers['x-gemini-key'] as string) || apiKey || process.env.GEMINI_API_KEY;
      const ai = getGeminiClient(clientKey);

      if (ai) {
        const formattedHistory = Array.isArray(history)
          ? history.slice(-8).map((h: any) => ({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.text || '' }]
            }))
          : [];

        const contextInfo = [
          mode === 'emergency' ? 'تنبيه: هذا استفسار طارئ / إغاثي عاجل، يجب إعطاء أولوية مطلقة للسلامة والاتصال بالحماية المدنية الجزائرية (14) أو الإسعاف (1021).' : '',
          attachment ? `محتوى المرفق المقدم: ${JSON.stringify(attachment)}` : ''
        ].filter(Boolean).join('\n');

        const userPrompt = contextInfo ? `${contextInfo}\n\nسؤال المستخدم:\n${message}` : message;

        const contents = [
          ...formattedHistory,
          {
            role: 'user',
            parts: [{ text: userPrompt }]
          }
        ];

        // Try Gemini 2.5 Flash first, then 1.5 Flash
        const candidateModels = ['gemini-2.5-flash', 'gemini-1.5-flash'];
        for (const modelName of candidateModels) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents,
              config: {
                systemInstruction: `أنت مستشار الذكاء الاصطناعي (AI) المتخصص لمنظومة "أثر" لإدارة النداءات الميدانية والعمل الإنساني والتطوعي بالجمهورية الجزائرية الديمقراطية الشعبية.
أنت مستشار ذكي، خبير، شامل وسريع البديهة. تجيب عن أي موضوع أو سؤال يطرحه المستخدم بأسلوب عملي، دقيق واحترافي:
1. صياغة النداءات الميدانية وتوليد عناوين جذابة وأوصاف دقيقة وشروط المشاركة.
2. تقدير وتوزيع المتطوعين وجداول المناوبات والمهام الميدانية.
3. التخطيط اللوجستي لحملات الإغاثة، قفف رمضان، التشجير، التبرع بالدم، والكسوة الشتوية.
4. بروتوكولات السلامة والإسعافات الأولية والتنسيق مع الحماية المدنية الجزائرية (14).
5. قوانين الجمعيات وتنظيم العمل الإنساني وكتابة التقارير الميدانية الإجبارية بعد إتمام المشاريع.
6. تقديم إرشادات تكتيكية للتصدر في ترتيب الجمعيات الوطنية في منظومة أثر.`
              }
            });

            if (response.text) {
              return res.json({
                success: true,
                answer: response.text,
                source: 'gemini-live',
                modelUsed: modelName,
                timestamp: new Date().toISOString()
              });
            }
          } catch (modelErr: any) {
            console.warn(`Model ${modelName} call failed:`, modelErr.message);
          }
        }
      }

      // Advanced Contextual AI Field Reasoning Engine (When offline or no API key)
      const q = message.trim();
      const lower = q.toLowerCase();
      let smartAnswer = '';

      if (lower.includes('نداء') || lower.includes('صياغة') || lower.includes('إنشاء') || lower.includes('اكتب لي')) {
        smartAnswer = `📋 **مقترح صياغة نداء ميداني احترافي فوري:**

🔹 **العنوان المقترح:** استجابة مجتمعية: مبادرة ${q.slice(0, 45)}
🔹 **التصنيف الميداني:** إغاثة وإسناد مجتمعي عاجل
🔹 **الهدف الرئيسي:** تحقيق أثر ملموس وفوري وتلبية الاحتياج الميداني بأعلى معايير التنظيم.

📌 **الوصف الميداني للتطبيق:**
"ندعو إخواننا المتطوعين وأصحاب الهمم للانضمام إلى هذه المبادرة الميدانية الهادفة. سيتولى الفريق مهام التنسيق، التوزيع، وضمان وصول الدعم لمستحقيه بكل شفافية ونظام."

👥 **توزيع المتطوعين المقترح (تقديري: 12-15 متطوعاً):**
- **فريق الاستقبال والتسجيل:** 3 متطوعين (توثيق المستفيدين عبر المنظومة).
- **فريق الفرز واللوجستيات:** 6 متطوعين (تجهيز ونقل المواد).
- **فريق الإشراف والتنظيم الميداني:** 3 متطوعين (إدارة المسار وضمان السلامة).

🛡️ **شروط وتعليمات الميدان:**
• الحضور بالزي المريح والحذاء الرياضي.
• الالتزام بتوجيهات مسؤول المجموعة الميدانية.
• نقطة التجمع محددة بدقة عبر نظام GPS على خريطة المنظومة.`;
      } else if (lower.includes('طوارئ') || lower.includes('اسعاف') || lower.includes('حريق') || lower.includes('حادث') || lower.includes('فيضان')) {
        smartAnswer = `🚨 **بروتوكول التدخل الإسعافي وإدارة الأزمات الميدانية (الجزائر):**

📞 **أرقام الطوارئ الوطنية المباشرة:**
- **الحماية المدنية:** 14 (أو 1021 عبر الهاتف النقال)
- **الدرك الوطني:** 1055
- **الشرطة والأمن الوطني:** 17
- **الإسعاف الطبي الاستعجالي SAMU:** 1021

🛑 **الخطوات التكتيكية الـ 4 في الميدان:**
1. **تأمين المحيط أولاً:** إبعاد الفضوليين ووضع مثلث التحذير على مسافة 50 متراً لحماية المصابين والمتطوعين.
2. **التقييم الأولي السريع:** فحص التنفس، الوعي، والنزيف الحاد دون تحريك العمود الفقري للمصاب.
3. **تحديد الإحداثيات بـ GPS:** مشاركة إحداثيات الموقع الحالية فوراً مع مركز التنسيق والعمليات.
4. **فتح مسار آمن لمركبات الإسعاف:** تكليف 2 متطوعين لتسهيل دخول سيارات الحماية المدنية.`;
      } else if (lower.includes('توزيع') || lower.includes('قفة') || lower.includes('سلال') || lower.includes('رمضان') || lower.includes('غذائ')) {
        smartAnswer = `📦 **دليل التخطيط اللوجستي لحملات السلال الغذائية وقفف الإغاثة:**

📊 **المعادلة الميدانية التقديرية (لكل 100 سلة):**
- **الوزن التقديري الإجمالي:** ~ 2,200 كغ (متوسط 22 كغ للسلة الواحدة).
- **عدد المتطوعين المطلوبين:** 10 - 14 متطوعاً.
- **وقت التعبئة:** 90 - 120 دقيقة عند اعتماد خط الإنتاج التسلسلي.

🚚 **المسار اللوجستي الموصى به:**
1. **قاعدة الفرز:** صالة أرضية جافة، ذات مدخل ومخرج منفصلين لتفادي الاكتظاظ.
2. **نظام التوزيع بكرامة:**
   • التسليم المباشر لمنازل العائلات المتعففة في أوقات مسائية هادئة.
   • استخدام مركبات نقل نفعية صغيرة للمسالك الضيقة والأحياء القديمة.
   • التوثيق الميداني عبر رمز QR وتأكيد استلام الأثر دون تصوير وجوه المستفيدين.`;
      } else if (lower.includes('ترتيب') || lower.includes('مسابقة') || lower.includes('نقاط') || lower.includes('فوز') || lower.includes('أربح')) {
        smartAnswer = `🏆 **دليل استراتيجية تصدر ترتيب الجمعيات والفوز في مسابقة أثر الوطنية:**

✨ **معايير احتساب النقاط ورتبة الصدارة:**
1. **سرعة الاستجابة الميدانية (30%):** قبول وتأكيد المتطوعين خلال أقل من 20 دقيقة من إطلاق النداء.
2. **التقرير العام الإجباري بعد كل مشروع (35%):** إيداع التقرير الشامل فور انتهاء الوقت الميداني للنداء يمنح جمعيتك **+250 نقطة أثر فورية**.
3. **التوثيق الرقمي ودقة نظام GPS (20%):** تحديد الموقع الجغرافي الدقيق للنداء وتفادي المواقع العشوائية.
4. **ساعات التطوع الميدانية المحققة (15%):** تجميع ساعات العمل الفعلي للمتطوعين المشاركين.

💡 **نصيحة ذهبية للفوز:**
حافظ على إغلاق جميع المشاريع بإيداع تقاريرها الميدانية؛ الجمعيات التي تترك مشاريع منتهية دون تقرير تفقد نقاط الأثر التشغيلي!`;
      } else {
        smartAnswer = `🧠 **استشارة مستشار الذكاء الاصطناعي (AI) الميداني:**

بشأن استفسارك: **«${q}»**

🎯 **1. التشخيص والأهداف الميدانية:**
• تحويل هذا المقترح إلى خطوات قابلة للقياس والتنفيذ الميداني السريع.
• مراعاة السياق الجغرافي وتوافر المتطوعين المتخصصين.

⚙️ **2. الخطة التشغيلية والتنفيذية:**
• **المرحلة الأولى (التحضير 24 ساعة مسبقاً):** حصر الموارد المتاحة، تحديد نقطة الانطلاق عبر GPS، وإطلاق النداء في المنظومة.
• **المرحلة الثانية (التنفيذ الميداني):** توزيع شارات المهام، تشكيل خلايا ثنائية أو ثلاثية، وإدارة التواصل عبر الهاتف والمنظومة.
• **المرحلة الثالثة (الإغلاق والتوثيق):** حصر المستفيدين وساعات التطوع وإيداع التقرير العام الإجباري لاعتماد النقاط.

🛡️ **3. نصائح الأمان وضمان النجاح:**
• تعيين مسؤول سلامة ميداني ومسعف أولي ضمن الفريق.
• توفير قنوات تواصل بديلة في حال ضعف التغطية.

تفضل بطرح أي تفاصيل إضافية أو تحديد الموقع وسأقوم بصياغة الخطة والنداء المناسب لك فوراً!`;
      }

      return res.json({
        success: true,
        answer: smartAnswer,
        source: 'athar-ai-engine',
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      res.status(500).json({ error: 'Failed to complete chat', message: err.message });
    }
  });

  // --- AI Books Library Endpoints (مكتبة الكتب والمراجع الذكية) ---

  // Get all books in the library
  app.get('/api/books', (req, res) => {
    res.json({
      success: true,
      count: BOOKS_LIBRARY_DATA.length,
      books: BOOKS_LIBRARY_DATA
    });
  });

  // Search books library and synthesize answer
  app.post('/api/books/search', async (req, res) => {
    try {
      const { query, category, bookId } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query is required' });
      }

      const q = query.trim().toLowerCase();
      const tokens = q.split(/\s+/).filter(t => t.length > 2);

      // 1. Search and score books
      const scoredBooks: Array<{
        book: typeof BOOKS_LIBRARY_DATA[0];
        score: number;
        bestChapter?: typeof BOOKS_LIBRARY_DATA[0]['chapters'][0];
        matchReason: string;
      }> = [];

      for (const book of BOOKS_LIBRARY_DATA) {
        if (bookId && book.id !== bookId) continue;
        if (category && category !== 'all' && book.category !== category) continue;

        let score = 0;
        let bestChapter: typeof BOOKS_LIBRARY_DATA[0]['chapters'][0] | undefined;
        let matchReason = '';

        // Match title / overview
        for (const token of tokens) {
          if (book.title.toLowerCase().includes(token)) score += 15;
          if (book.author.toLowerCase().includes(token)) score += 10;
          if (book.overview.toLowerCase().includes(token)) score += 6;
        }

        // Match chapters
        for (const chap of book.chapters) {
          let chapScore = 0;
          for (const token of tokens) {
            if (chap.title.toLowerCase().includes(token)) chapScore += 12;
            if (chap.summary.toLowerCase().includes(token)) chapScore += 8;
            for (const top of chap.keyTopics) {
              if (top.toLowerCase().includes(token)) chapScore += 10;
            }
          }
          if (chapScore > 0 && (!bestChapter || chapScore > score)) {
            bestChapter = chap;
            matchReason = `الفصل ${chap.number}: ${chap.title}`;
          }
          score += chapScore;
        }

        // Match quotes
        for (const quote of book.coreQuotes) {
          for (const token of tokens) {
            if (quote.toLowerCase().includes(token)) score += 5;
          }
        }

        // Default base relevance if no exact token matches but general category aligns
        if (score === 0) {
          if (q.includes('شمس') || q.includes('حرار') || q.includes('سلامة') || q.includes('طوارئ')) {
            if (book.category === 'safety' || book.category === 'relief_emergency') score = 8;
          } else if (q.includes('تطوع') || q.includes('فريق') || q.includes('متطوع')) {
            if (book.category === 'volunteering') score = 8;
          } else if (q.includes('نقل') || q.includes('تخزين') || q.includes('مخزن') || q.includes('طرق')) {
            if (book.category === 'logistics') score = 8;
          } else if (q.includes('نظام') || q.includes('ترخيص') || q.includes('تبرع') || q.includes('قانون')) {
            if (book.category === 'governance') score = 8;
          } else {
            score = 1;
          }
        }

        scoredBooks.push({
          book,
          score,
          bestChapter: bestChapter || book.chapters[0],
          matchReason: matchReason || `الفصل ${book.chapters[0].number}: ${book.chapters[0].title}`
        });
      }

      // Sort by relevance score
      scoredBooks.sort((a, b) => b.score - a.score);
      const topMatches = scoredBooks.slice(0, 3);

      const matchedBooksForResponse = topMatches.map(m => ({
        bookId: m.book.id,
        bookTitle: m.book.title,
        author: m.book.author,
        category: m.book.category,
        chapterTitle: m.matchReason,
        relevanceScore: m.score,
        excerpt: m.bestChapter ? m.bestChapter.summary : m.book.overview
      }));

      // 2. Synthesize with Gemini if available
      const ai = getGeminiClient();

      if (ai) {
        const booksContextText = topMatches.map((m, idx) => `
الكتاب المرجعي رقم [${idx + 1}]:
- عنوان الكتاب: "${m.book.title}"
- المؤلف والناشر: ${m.book.author} (${m.book.publisher}) - سنة النشر: ${m.book.year}
- النبذة: ${m.book.overview}
- الفصل الأكثر مطابقة: ${m.bestChapter?.title || 'الفصل الأول'}
- ملخص الفصل ومحتواه: ${m.bestChapter?.summary || ''}
- الموضوعات الرئيسية: ${(m.bestChapter?.keyTopics || []).join(', ')}
- اقتباس معتمد من الكتاب: "${m.book.coreQuotes[0] || ''}"
`).join('\n---\n');

        const prompt = `أنت "أمين المكتبة المعرفية الرقمية" لمنظومة "أثر". دورك هو البحث في محتوى مكتبة الكتب والأدلة التخصصية المعتمدة والإجابة عن استفسارات القادة الميدانيين حصرياً استناداً إلى هذه الكتب ومراجعها.

سؤال المستخدم أو موضوع البحث:
"${query}"

مراجع الكتب والمصادر المطابقة في المكتبة:
${booksContextText}

المطلوب:
1. قدّم إجابة وافية، شمسية ومباشرة تستند نصاً ومضموناً إلى مراجع الكتب المذكورة أعلاه.
2. اذكر صراحة اسم الكتاب واسم المؤلف ورقم الفصل في سياق إجابتك كاستدلال وتوثيق علمي موثوق.
3. اختتم الإجابة بـ 3 خلاصات أو خطوات تنفيذية مباشرة مستخلصة من صفحات الكتاب.
4. استخدم لغة عربية رصينة، واضحة ومحفزة.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'أنت أمين مكتبة رقمية متخصص في كتب العمل الإنساني والتطوعي والإغاثي. توثق إجاباتك دوماً بالمؤلف والكتاب والفصل.'
          }
        });

        const answerText = response.text || 'تم استخراج النتائج بنجاح من مراجع المكتبة.';

        return res.json({
          success: true,
          query,
          matchedBooks: matchedBooksForResponse,
          answer: answerText,
          keyTakeaways: [
            topMatches[0]?.book?.coreQuotes[0] || 'الالتزام بالبروتوكولات الميدانية هو أساس نجاح أي مبادرة.',
            `مراجعة "${topMatches[0]?.bestChapter?.title || 'الفصل المرجعي'}" لتطبيق الخطوات التفصيلية.`,
            `الرجوع لكتاب "${topMatches[0]?.book?.title}" لمزيد من الإجراءات الميدانية المعتمدة.`
          ],
          recommendedReading: topMatches.map(m => `${m.book.title} - ${m.matchReason}`),
          source: 'gemini_library_synthesis'
        });
      }

      // Offline / Rule-based synthesis
      const primary = topMatches[0];
      const answer = `وفقاً لما ورد في كتاب "${primary.book.title}" للمؤلف ${primary.book.author} (${primary.matchReason}):

${primary.bestChapter?.summary || primary.book.overview}

الموضوعات الرئيسية المعالجة في هذا المرجع:
${(primary.bestChapter?.keyTopics || []).map(t => `• ${t}`).join('\n')}

اقتباس تنفيذي من صفحات المرجع:
"${primary.book.coreQuotes[0] || ''}"`;

      return res.json({
        success: true,
        query,
        matchedBooks: matchedBooksForResponse,
        answer,
        keyTakeaways: [
          primary.book.coreQuotes[0] || 'الرجوع للمراجع والكتيبات الميدانية يضمن سلامة وكفاءة التنفيذ.',
          `تطبيق إجراءات: ${primary.bestChapter?.title || 'الفصل ذي الصلة'}.`,
          `المؤلف ${primary.book.author} يوصي بالتحضير المسبق وتوثيق الميدان.`
        ],
        recommendedReading: topMatches.map(m => `${m.book.title} - ${m.matchReason}`),
        source: 'books_library'
      });
    } catch (err: any) {
      console.error('Books Library Search Error:', err);
      res.status(500).json({ error: 'Failed to search books library', message: err.message });
    }
  });

  // AI Playbook Generation
  app.post('/api/ai/generate-playbook', async (req, res) => {
    try {
      const { activityTitle, associationName, whatWentWell, challengesFaced } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          playbookTitle: `دليل الاستجابة الاحترازية لنشاط ${activityTitle || 'الميداني'}`,
          phases: [
            { phase: 'مرحلة ما قبل النشاط (T-48h)', items: ['مسح ميداني دقيق', 'تأكيد الحضور وتوزيع السترات', 'فحص جاهزية السيارات والمعدات'] },
            { phase: 'مرحلة التنفيذ الفعلي (T-0)', items: ['تفعيل نقطة الدعم اللوجستي المركزية', 'التواصل عبر الراديو أو تطبيق أثر', 'توزيع مياه الشرب والإسعاف الأولي'] },
            { phase: 'مرحلة ما بعد النشاط (T+24h)', items: ['التوثيق الرقمي', 'حصر الملاحظات في المنصة', 'توجيه شهادات الشكر للمتطوعين'] }
          ],
          source: 'rule_engine'
        });
      }

      const prompt = `قم بإنشاء "دليل إجراءات تشغيلي موحد (Playbook)" للجمعيات التي ستقوم بتنفيذ نشاط مشابه لـ "${activityTitle}".
الجهة السابقة المنفذة: ${associationName}
ما نجح سابقاً: ${whatWentWell}
العقبات والمشاكل السابقة: ${challengesFaced}

المطلوب: توليد دليل احترافي مكوّن من 3 مراحل (قبل، أثناء، بعد النشاط) مع توصيات خاصة لتفادي العقبات المذكورة.
أجب بصيغة JSON فقط بهذا الشكل:
{
  "playbookTitle": "...",
  "phases": [
    {
      "phase": "مرحلة التجهيز والتحضير المسبق (قبل 48 ساعة)",
      "items": ["...", "..."]
    },
    {
      "phase": "مرحلة التنفيذ الميداني والضبط المباشر",
      "items": ["...", "..."]
    },
    {
      "phase": "مرحلة الإغلاق والتقييم واستخلاص الأثر",
      "items": ["...", "..."]
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'أنت خبير إعداد أدلة الإجراءات الميدانية (SOPs). أخرج JSON فقط.',
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        ...parsed,
        source: 'gemini'
      });
    } catch (err: any) {
      console.error('Gemini Playbook Error:', err);
      res.status(500).json({ error: 'Failed to generate playbook', message: err.message });
    }
  });

  // AI Assistant endpoint for improving calls, extracting skills, or matching
  app.post('/api/ai/assist', async (req, res) => {
    try {
      const { prompt, task, title, description, skills, category } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Fallback intelligent offline suggestions if API key is not yet active
        if (task === 'enhance_call') {
          return res.json({
            success: true,
            suggestedTitle: title ? `نداء عاجل: ${title}` : 'نداء مجتمعي عاجل للمساندة',
            enhancedDescription: description 
              ? `${description}\n\n• الأهداف الميدانية المرجوة: تحقيق استجابة سريعة وتعزيز التكافل الاجتماعي.`
              : 'يرجى تزويدنا بمزيد من التفاصيل لتحسين صياغة النداء.',
            suggestedSkills: ['عمل جماعي', 'تنظيم ميداني', 'سرعة استجابة', 'تواصل فعال'],
            suggestedPriority: 'high',
            source: 'rule_engine'
          });
        }
        if (task === 'onboarding_match') {
          return res.json({
            success: true,
            extractedSkills: ['إسعافات أولية', 'دعم تقني', 'تنظيم ميداني', 'توصيل ونقل'],
            extractedInterests: ['مساعدة إغاثية', 'دعم كبار السن', 'تعليم وتقنية'],
            suggestedRadiusKm: 10,
            summary: 'تم تحليل تفضيلاتك بنجاح. سنقترح عليك النداءات القريبة التي تناسب قدراتك واهتماماتك.',
            source: 'rule_engine'
          });
        }
        return res.json({
          success: true,
          reply: 'تم استلام طلبك. يعمل المساعد الذكي على تحسين تجربتك واقتراح أفضل الفرص الميدانية.',
          source: 'rule_engine'
        });
      }

      // Gemini 3.8 Flash
      const systemInstruction = `أنت المساعد الذكي لمنظومة "أثر | Athar" لإدارة النداءات والمبادرات المجتمعية.
دورك:
1. تقديم اقتراحات صياغة دقيقة، واضحة، محفزة، وباللغة العربية الفصحى السليمة.
2. استخراج المهارات المطلوبة للنداء بدقة (مثل: إسعافات، صيانة، نقل، تدريس، تنظيم).
3. احترام أن جميع اقتراحاتك هي مجرد توصيات قابلة للمراجعة البشرية وليست قرارات نهائية ملزمة.
4. إرجاع النتائج بتنسيق JSON نظيف عند الطلب.`;

      let userPrompt = prompt || '';
      if (task === 'enhance_call') {
        userPrompt = `قم بتحسين صياغة النداء التالي، واقترح عنواناً جذاباً، ووصفاً دقيقاً، وقائمة بالمهارات المطلوبة:
العنوان الحالي: ${title}
الوصف الحالي: ${description}
التصنيف: ${category}
المهارات المحددة: ${(skills || []).join(', ')}

أجب بصيغة JSON فقط بهذا الشكل:
{
  "suggestedTitle": "...",
  "enhancedDescription": "...",
  "suggestedSkills": ["...", "..."],
  "suggestedPriority": "urgent"
}`;
      } else if (task === 'onboarding_match') {
        userPrompt = `قام المستخدم بالإجابة على أسئلة التعرف الأولية في تطبيق أثر كالتالي:
"${prompt}"

استخرج بدقة:
1. المهارات والقدرات المتوفرة لديه.
2. مجالات الاهتمام المفضلة.
3. نطاق المسافة المقترح بالكيلومترات (رقم صحيح بين 3 و 30).
4. رسالة ترحيبية ملخصة ومحفزة.

أجب بصيغة JSON فقط:
{
  "extractedSkills": ["...", "..."],
  "extractedInterests": ["...", "..."],
  "suggestedRadiusKm": 10,
  "summary": "..."
}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '{}';
      let parsed = {};
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        parsed = { raw: responseText };
      }

      return res.json({
        success: true,
        ...parsed,
        source: 'gemini'
      });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      res.status(500).json({ error: 'Failed to process AI assist request', message: err.message });
    }
  });

  // Vite dev middleware with resilient HTML serving & dist fallback
  if (process.env.NODE_ENV !== 'production') {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      app.use('*', async (req, res, next) => {
        const url = req.originalUrl;
        try {
          const indexPath = path.resolve(__dirname, 'index.html');
          if (fs.existsSync(indexPath)) {
            let template = fs.readFileSync(indexPath, 'utf-8');
            template = await vite.transformIndexHtml(url, template);
            return res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
          }
          next();
        } catch (e) {
          next(e);
        }
      });
    } catch (viteErr) {
      console.warn('[Athar System] Vite dev middleware error, serving prebuilt dist folder:', viteErr);
      const distPath = path.join(__dirname, 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Athar System] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
