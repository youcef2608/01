import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { BOOKS_LIBRARY_DATA } from './src/data/booksLibraryData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory data store for server-side persistence during session
  // Seeded with rich real-world data
  let callsData: any[] = [];
  let notesData: any[] = [];
  let responsesData: any[] = [];

  // Local Server Knowledge Registry (activities, past evaluations, documented solutions)
  let serverEvaluationsDatabase: any[] = [
    {
      id: 'eval-1',
      activityTitle: 'توزيع وجبات وسلال غذائية للأسر المتعففة في حي البطحاء',
      associationName: 'جمعية الإحسان الخيرية',
      city: 'الرياض',
      category: 'relief',
      whatWentWell: 'تجاوب سريع من المتطوعين، سرعة فرز المنتجات خلال ساعة ونصف، الالتزام بالوقت المحدد، والتنسيق المسبق لقوائم الأسر.',
      challengesFaced: 'صعوبة وصول سيارات النقل الكبيرة للشوارع الضيقة في عمق الحي القديم، ونقص في كراتين التعبئة المقواة في الدفعة الأخيرة، وضعف شبكة الاتصال في بعض الأزقة المسقوفة.',
      operationalNotes: 'يُنصح مستقبلاً بالاعتماد على دراجات شحن أو عربات يدوية صغيرة للشوارع الضيقة، وتأمين كميات احتياطية من أشرطة الإغلاق وأجهزة لاسلكي مشفرة.',
      lessonsLearned: [
        'ضرورة مسح جغرافيا الحي ميدانياً وتصنيف الشوارع حسب عرضها قبل تحديد نوع مركبات التوزيع.',
        'اعتماد نظام التعبئة الجزئية المسبقة لتخفيف الضغط الزمني على المتطوعين.',
        'تقسيم الفرق إلى خلايا ثنائية مرنة ومزودة بأجهزة دفع يدوية للميل الأخير.'
      ]
    },
    {
      id: 'eval-2',
      activityTitle: 'حملة تشجير وتنظيف حديقة حي الملقا',
      associationName: 'فريق بصمة خضراء',
      city: 'الرياض',
      category: 'environment',
      whatWentWell: 'إقبال ممتاز من المتطوعين، غرس كامل الشتلات الـ 150 بنجاح، وجود شبكة ري مهيأة جزئياً.',
      challengesFaced: 'نقص أدوات الحفر الثقيلة لبعض البقع الصخرية الصلبة، وازدحام في مواقف السيارات المجاورة للمدخل الرئيسي للحديقة، وارتفاع حرارة الشمس المفاجئ.',
      operationalNotes: 'تم التنسيق مع بلدية الحي لفتح المواقف الإضافية في الحملة القادمة، وتوفير جهاز حفر يدوي كهربائي للأرض الصلبة، ونصب مظلات ترطيب متنقلة.',
      lessonsLearned: [
        'فحص صلابة التربة قبل 48 ساعة يحدد كمية الأدوات والمعدات الثقيلة المطلوبة.',
        'تخصيص مسار آمن لتفريغ الشتلات يمنع الازدحام والاختناق المروري.',
        'تحديد أصناف نباتية وشجيرات محلية تتحمل قلة المياه وحرارة الطقس.'
      ]
    },
    {
      id: 'eval-3',
      activityTitle: 'دعم تقني وتدريب كبار السن على المنصات الرقمية',
      associationName: 'مركز تمكين المجتمع الرقمي',
      city: 'جدة',
      category: 'education',
      whatWentWell: 'تفاعل رائع من المستفيدين، توفير كتيبات تدريبية مطبوعة بخط كبير، ومرافقة متطوع لكل مستفيد (1-to-1).',
      challengesFaced: 'ضعف شبكة الواي فاي بالصالة في النصف الأول من الورشة، والنسيان السريع لكلمات المرور من كبار السن.',
      operationalNotes: 'تأمين راوترات 5G احتياطية بشرائح متعددة، وإعداد بطاقات ورقية آمنة للمستفيدين لتدوين خطوات الدخول خطوة بخطوة.',
      lessonsLearned: [
        'الاعتماد على راوترين من مزودين مختلفين لتفادي انقطاع الإنترنت أثناء التدريب.',
        'التدريب بالممارسة العملية الفردية يضاعف استيعاب كبار السن 3 أضعاف مقارنة بالعرض الجماعي.'
      ]
    },
    {
      id: 'eval-4',
      activityTitle: 'إسناد عاجل وإيواء المتضررين من مياه الأمطار والسيول',
      associationName: 'فريق غوث للإنقاذ والإغاثة',
      city: 'جدة',
      category: 'emergency',
      whatWentWell: 'سرعة التحرك خلال 35 دقيقة من بلاغ الدفاع المدني، ونشر زوارق مطاطية وسيارات دفع رباعي مجهزة.',
      challengesFaced: 'انقطاع التيار الكهربائي في مركز الفرز الميداني، وصعوبة شحن أجهزة الاتصال اللاسلكي والهواتف.',
      operationalNotes: 'اعتماد مولد ديزل كهربائي متنقل وبطاريات شحن شمسية فورية لغرفة العمليات الميدانية.',
      lessonsLearned: [
        'ربط خطة الإخلاء بخرائط السيول الجغرافية المعتمدة ومسارات الطرق المرتفعة.',
        'توفير محطات طاقة متنقلة (Power Banks) محمية من المياه لجميع قادة الفرق.'
      ]
    },
    {
      id: 'eval-5',
      activityTitle: 'حملة التبرع بالدم ودعم بنوك الدم المركزية',
      associationName: 'جمعية أصدقاء بنوك الدم',
      city: 'الدمام',
      category: 'health',
      whatWentWell: 'تحقيق المستهدف بجمع 120 وحدة دم في يوم واحد، تنسيق عالي مع المختبر الإقليمي والتنظيم عبر المواعيد الرقمية.',
      challengesFaced: 'هبوط ضغط مؤقت لبعض المتبرعين بسبب عدم تناول وجبة خفيفة كافية قبل التبرع، وتأخر سيارة التبريد المخصصة لنقل العينات.',
      operationalNotes: 'إلزام جميع المتبرعين بتناول عصير وتمر قبل سحب الدم بـ 15 دقيقة، وتوفير ثلاجة طبية متنقلة إضافية.',
      lessonsLearned: [
        'محطة الفحص المبدئي (الهيموجلوبين والضغط والحرارة) هي صمام الأمان لمنع الإغماءات الميدانية.',
        'الاتفاق المسبق على سيارتي نقل مبردة لتفادي توقف استقبال المتبرعين عند امتلاء الحافظة الأولى.'
      ]
    },
    {
      id: 'eval-6',
      activityTitle: 'مبادرة كسوة الشتاء وتأمين التدفئة لمناطق القرى الجبلية',
      associationName: 'جمعية البر الخيرية',
      city: 'أبها',
      category: 'relief',
      whatWentWell: 'توزيع 450 حقيبة شتوية ومدفأة آمنة، واستخدام سيارات دفع رباعي لعبور الطرق الجبلية الوعرة.',
      challengesFaced: 'ضباب كثيف وانخفاض الرؤية الأفقية لأقل من 20 متراً، وتضارب أرقام التواصل مع بعض عُمد القرى.',
      operationalNotes: 'تجهيز السيارات بمصابيح ضباب صفراء كاشفة، وتعيين مرافق محلي من أبناء المنطقة لكل قافلة.',
      lessonsLearned: [
        'الاستعانة بمرشدين محليين من أهل المنطقة يختصر مسافات الطرق الجبلية ويوفر معلومات آنية عن الانهيارات الصخرية.',
        'تحديد جدول زمني ينتهي قبل حلول الغسق بـ 3 ساعات لتفادي برودة الطقس والضباب الكثيف.'
      ]
    }
  ];

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
          { title: 'المركز الوطني لتنمية القطاع غير الربحي - الأدلة الإجرائية', uri: 'https://ncnp.gov.sa' },
          { title: 'المديرية العامة للدفاع المدني - بروتوكولات السلامة الميدانية', uri: 'https://998.gov.sa' }
        ],
        searchQueries: [query],
        answer: `🌐 [بحث شبكة الإنترنت: نظراً لعدم توفر سابقة محلية مسجلة في السيرفر، تم استرجاع هذا الحل المعتمد عبر بروتوكولات القطاع غير الربحي]\n\nبشأن "${query}":\n1. مراجعة خطة السلامة الميدانية والتنسيق مع الجهات الإشرافية المختصة.\n2. إعداد حقيبة تدخل سريع وتفويض قائد ميداني بصلاحيات فورية.\n3. توثيق التجربة في منظومة أثر لتصبح مرجعاً مستقبلياً للجمعيات الأخرى.`
      };
    }
  }

  // Lazy Gemini AI client
  function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
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

  // Dedicated Gemini AI Chat endpoint for real-time conversation & field assistance
  app.post('/api/ai/gemini-chat', async (req, res) => {
    try {
      const { message, history = [], attachment, wilaya, mode } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const ai = getGeminiClient();

      if (ai) {
        // Build conversational contents
        const formattedHistory = Array.isArray(history)
          ? history.slice(-8).map((h: any) => ({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.text || '' }]
            }))
          : [];

        const contextInfo = [
          wilaya ? `نطاق الولاية الحالية: ${wilaya}` : '',
          mode === 'emergency' ? 'تنبيه: هذا استفسار طارئ / إغاثي عاجل، يجب إعطاء أولوية مطلقة للسلامة والاتصال بالحماية المدنية (14) أو الإسعاف (1021).' : '',
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

        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents,
            config: {
              systemInstruction: `أنت Gemini، المستشار الذكي الميداني لمنظومة "أثر" التطوعية والإنسانية بالجمهورية الجزائرية الديمقراطية الشعبية.
تساعد المتطوعين، قادة الجمعيات (مثل ناس الخير، الهلال الأحمر الجزائري، سبل الخيرات، جمعيات حماية البيئة)، وفرق الإسعاف الميداني في كافة ولايات الجزائر الـ 58.
تتميز بالخبرة في اللوجستيات، السلامة الميدانية، تنسيق المبادرات، توزيع المساعدات، وإدارة الأزمات.
قدّم إجابات واضحة، مهيكلة بنقاط عملية قابلة للتنفيذ، بنبرة ملهمة ومشجعة.`
            }
          });

          return res.json({
            success: true,
            answer: response.text || 'أهلاً بك، أنا في خدمتك لدعم مبادرتك الميدانية.',
            source: 'gemini-3.8-flash',
            timestamp: new Date().toISOString()
          });
        } catch (modelErr: any) {
          console.warn('Gemini model call had error or high load, using smart field fallback:', modelErr.message);
          // Continue to fallback below
        }
      }

      // Intelligent localized fallback when Gemini key is not configured or model is temporarily unavailable
      let smartAnswer = '';
      const lower = message.toLowerCase();

      if (lower.includes('طوارئ') || lower.includes('اسعاف') || lower.includes('حريق') || lower.includes('حادث')) {
        smartAnswer = `🚨 **بروتوكول التدخل الإسعافي والطوارئ الميدانية:**\n\n1. **أرقام الطوارئ المعتمدة في الجزائر:**\n   - الحماية المدنية: **14**\n   - الشرطة: **17** / الدرك الوطني: **1055**\n   - الإسعاف الطبي SAMU: **1021**\n\n2. **خطوات التأمين الميداني الفوري:**\n   • تأمين محيط الحادث ووضع مثلثات تحذيرية على بعد 50 متراً.\n   • عدم تحريك المصابين إلا في حالة الخطر الداهم (حريق، انهيار).\n   • إرسال إحداثيات الموقع الدقيقة عبر تطبيق أثر لغرفة العمليات المشتركة.`;
      } else if (lower.includes('توزيع') || lower.includes('قفة') || lower.includes('سلال') || lower.includes('غذائي')) {
        smartAnswer = `📦 **دليل تنظيم حملات التوزيع الإغاثي والسلال الغذائية:**\n\n1. **الفرز والتعبئة:**\n   • تخصيص صالة مركزية جافة ومرتفعة لفرز المواد.\n   • ترقيم الطرود وتسجيل محتوياتها بقوائم رقمية مسبقة.\n\n2. **التوزيع والتسليم بكرامة:**\n   • تفضيل التوصيل المباشر لمنازل الأسر المتعففة في أوقات هادئة حفظاً للكرامة.\n   • استخدام سيارات نقل صغيرة للأحياء ذات المسالك الضيقة.\n   • توثيق التسليم عبر رمز QR دون تصوير وجوه المستفيدين.`;
      } else if (lower.includes('تشجير') || lower.includes('بيئة') || lower.includes('تنظيف')) {
        smartAnswer = `🌱 **دليل حملات التشجير وحماية الغابات بالجزائر:**\n\n1. **اختيار الأصناف:** شتلات الصنوبر الحلبي، الخروب، والزيتون البري المتلائمة مع المناخ الجزائري.\n2. **العمق والري:** حفر بعمق 40-50 سم وسقي أولي مباشر بـ 5-10 لترات لكل شتلة.\n3. **السلامة:** تزويد المتطوعين بقفازات سميكة وسترات عاكسة وأحذية عمل متينة.`;
      } else {
        smartAnswer = `✨ **مرحباً بك! مستشار Gemini الذكي لمنظومة أثر الميدانية:**\n\nبناءً على استفسارك حول "${message}":\n\n• **الخطوة الميدانية الأولى:** مراجعة معايير التنسيق بين الجمعيات المشاركة في الولاية.\n• **تنظيم المتطوعين:** توزيع المهام إلى خلايا متخصصة (استقبال، لوجستيك، إعلام وتوثيق، إسعاف أولي).\n• **توثيق الأثر:** تسجيل المؤشرات والأرقام الميدانية عبر منصة أثر للاستفادة التراكمية.\n\nهل تود استفساراً محدداً حول ولاية معينة أو نوع نداء مخصص؟`;
      }

      return res.json({
        success: true,
        answer: smartAnswer,
        source: 'athar-field-engine',
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('Gemini Chat Error:', err);
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

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
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
