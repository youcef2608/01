import { Call, MonthlyArchiveRecord, FieldNote, AppNotification, UserProfile, LeaderboardUser } from '../types';

export const INITIAL_CALLS: Call[] = [
  {
    id: 'call-1',
    title: 'توزيع قفف وسلال غذائية للأسر المعوزة في الجزائر العاصمة',
    description: 'نبحث عن 6 متطوعين للمساعدة في فرز وتوزيع 200 سلة غذائية للأسر المحتاجة بالتعاون مع الهلال الأحمر الجزائري وجمعيات الإغاثة.',
    category: 'help',
    goal: 'إيصال المساعدات الغذائية لـ 200 عائلة معوزة في الحي المستهدف قبل حلول المساء.',
    targetAudience: 'المتطوعون الشباب والراغبون في العمل الإغاثي الميداني.',
    requiredSkills: ['لياقة بدنية', 'تنظيم ميداني', 'تواصل لبق'],
    requiredCount: 6,
    startTime: '2026-09-20T16:00:00Z',
    endTime: '2026-09-20T20:00:00Z',
    priority: 'urgent',
    requiredResources: ['شاحنات نقل خفيفة أو سيارات نفعية', 'قفازات وأقنعة'],
    participationTerms: 'التفرغ التام خلال فترة التوزيع وارتداء الزي الميداني المريح.',
    contactInfo: '0550123456 - أ. عبد القادر مرابط',
    status: 'active',
    location: {
      latitude: 36.7538,
      longitude: 3.0588,
      placeName: 'مكان عادي (الجزائر)',
      city: 'الجزائر',
      region: 'الجزائر',
      approxAddress: 'موقع ميداني بالقرب من ساحة الشهداء'
    },
    creatorId: 'org-1',
    creatorName: 'جمعية ناس الخير',
    creatorOrg: 'ناس الخير الجزائر',
    responsesCount: 4,
    confirmedCount: 3,
    viewsCount: 142,
    createdAt: '2026-09-18T10:30:00Z',
    updatedAt: '2026-09-19T08:15:00Z'
  },
  {
    id: 'call-2',
    title: 'حملة تشجير وتنظيف غابة الصنوبر ومسارات المشي بوهران',
    description: 'نداء بيئي تطوعي لغرس 200 شجيرة ملائمة للمناخ المتوسطي وتنظيف المسارات الطبيعية لتعزيز الغطاء النباتي والسلامة البيئية.',
    category: 'volunteer',
    goal: 'غرس 200 شجيرة وتأهيل المسارات الطبيعية لاستقبال العائلات.',
    targetAudience: 'العائلات والشباب والكشافة وجميع المهتمين بالبيئة.',
    requiredSkills: ['غرس وتشجير', 'عمل جماعي', 'صبر وهمة'],
    requiredCount: 15,
    startTime: '2026-09-21T07:00:00Z',
    endTime: '2026-09-21T11:30:00Z',
    priority: 'medium',
    requiredResources: ['أدوات بستنة خفيفة متوفرة في الموقع'],
    participationTerms: 'إحضار قبعة شمسية وماء للشرب وحذاء مناسب.',
    contactInfo: '0661987654 - م. كريم بلقاسم',
    status: 'receiving_responses',
    location: {
      latitude: 35.6987,
      longitude: -0.6349,
      placeName: 'مكان عادي (وهران)',
      city: 'الجزائر',
      region: 'الجزائر',
      approxAddress: 'موقع بيئي بالواجهة البحرية الغربية'
    },
    creatorId: 'user-admin-1',
    creatorName: 'مبادرة الجزائر الخضراء',
    creatorOrg: 'فريق أصدقاء البيئة',
    responsesCount: 11,
    confirmedCount: 9,
    viewsCount: 230,
    createdAt: '2026-09-17T14:00:00Z',
    updatedAt: '2026-09-19T09:00:00Z'
  },
  {
    id: 'call-3',
    title: 'دعم تقني وتدريب كبار السن على الخدمات الرقمية بقسنطينة',
    description: 'نداء للمتطوعين لتقديم ورشات إرشاد وتدريب فردية لكبار السن في المركز المجتمعي على استخدام الهواتف الذكية والتطبيقات الخدمية بأمان.',
    category: 'tech',
    goal: 'تمكين 40 مسناً ومسنة من إنجاز معاملاتهم اليومية وحمايتهم من الاحتيال الرقمي.',
    targetAudience: 'طلبة الإعلام الآلي والمهندسون التقنيون والشباب المهتم.',
    requiredSkills: ['صبر وحسن استماع', 'مهارات حاسوب وهاتف ذكي', 'شرح مبسط'],
    requiredCount: 5,
    startTime: '2026-09-22T17:00:00Z',
    endTime: '2026-09-22T20:30:00Z',
    priority: 'high',
    requiredResources: ['أجهزة لوحية تدريبية متوفرة بالمركز'],
    participationTerms: 'حضور اللقاء التنسيقي المسبق قبل الورشة بنصف ساعة.',
    contactInfo: '0770332211 - أ. نادية بن زينة',
    status: 'active',
    location: {
      latitude: 36.3650,
      longitude: 6.6147,
      placeName: 'مكان عادي (قسنطينة)',
      city: 'الجزائر',
      region: 'الجزائر',
      approxAddress: 'المركز الثقافي المجتمعي'
    },
    creatorId: 'org-2',
    creatorName: 'نادي الابتكار والرقمنة المجتمعية',
    creatorOrg: 'جمعية الشباب الرقمي الجزائري',
    responsesCount: 3,
    confirmedCount: 3,
    viewsCount: 98,
    createdAt: '2026-09-19T06:00:00Z',
    updatedAt: '2026-09-19T11:00:00Z'
  },
  {
    id: 'call-4',
    title: 'تنظيم ورشات القراءة والرسم للأطفال بمدينة عنابة',
    description: 'نحتاج لمساندين لتوجيه الأطفال والزوار وإدارة مسار الأنشطة الثقافية والقرائية في بهو دار الثقافة.',
    category: 'event',
    goal: 'تنظيم يوم ثقافي ممتع لأكثر من 250 طفلاً مع توفير مسابقات تشجيعية.',
    targetAudience: 'المتطوعون الشباب وأصحاب المهارات التربوية والفنية.',
    requiredSkills: ['توجيه وتنظيم', 'رسم وتنشيط تربوي', 'إسعافات أولية'],
    requiredCount: 8,
    startTime: '2026-09-25T15:30:00Z',
    endTime: '2026-09-25T21:00:00Z',
    priority: 'medium',
    requiredResources: ['بطاقات تعريفية وتجهيزات التنشيط تسلم في المكان'],
    participationTerms: 'الالتزام بجدول الورشات والتفاعل الإيجابي مع الأطفال.',
    contactInfo: '0552778899 - أ. سليم بوعكاز',
    status: 'active',
    location: {
      latitude: 36.9000,
      longitude: 7.7667,
      placeName: 'مكان عادي (عنابة)',
      city: 'الجزائر',
      region: 'الجزائر',
      approxAddress: 'محيط دار الثقافة والساحة المركزية'
    },
    creatorId: 'org-3',
    creatorName: 'جمعية أمل الطفولة',
    creatorOrg: 'رابطة الأنشطة الثقافية للشباب',
    responsesCount: 6,
    confirmedCount: 5,
    viewsCount: 180,
    createdAt: '2026-09-16T12:00:00Z',
    updatedAt: '2026-09-18T16:20:00Z'
  },
  {
    id: 'call-5',
    title: 'تدخل عاجل: مساندة المتضررين من اضطراب جوي مفاجئ بسطيف',
    description: 'نداء إغاثي عاجل لنقل المؤن ومياه الشرب والأغطية للعائلات المتضررة من السيول المطرية الأخيرة بالتعاون مع الحماية المدنية.',
    category: 'help',
    goal: 'تأمين 30 مسكناً وتوزيع الأغطية والوجبات الساخنة فوراً.',
    targetAudience: 'المتطوعون القريبون وذوو اللياقة العالية والمستجيبون الأوائل.',
    requiredSkills: ['استجابة سريعة', 'إسعافات أولية', 'سياقة مركبات دفع رباعي'],
    requiredCount: 8,
    startTime: '2026-09-19T13:00:00Z',
    endTime: '2026-09-19T22:00:00Z',
    priority: 'urgent',
    requiredResources: ['مركبات دفع رباعي', 'أغطية صوفية', 'مياه معبأة'],
    participationTerms: 'التنسيق المباشر مع خلية الأزمة وارتداء السترات الفسفورية.',
    contactInfo: '0661998877 - خلية الطوارئ الميدانية',
    status: 'active',
    location: {
      latitude: 36.1911,
      longitude: 5.4137,
      placeName: 'مكان عادي (سطيف)',
      city: 'الجزائر',
      region: 'الجزائر',
      approxAddress: 'نقطة التجمع الإغاثي بالقرب من المدخل الشرقي'
    },
    creatorId: 'emergency-1',
    creatorName: 'فريق الإغاثة الميداني',
    creatorOrg: 'الهلال الأحمر الجزائري - فرع سطيف',
    responsesCount: 7,
    confirmedCount: 6,
    viewsCount: 310,
    createdAt: '2026-09-19T11:45:00Z',
    updatedAt: '2026-09-19T12:05:00Z'
  },
  {
    id: 'call-6',
    title: 'دورة تقوية مجانية لطلبة شهادة البكالوريا في الرياضيات والفيزياء',
    description: 'مبادرة تعليمية تطوعية لمساعدة الطلاب قبل الامتحانات التجريبية في مقر الجمعية التربوية بتلمسان.',
    category: 'education',
    goal: 'تقديم مراجعات مكثفة وتمارين نموذجية لأكثر من 70 طالباً مجاناً.',
    targetAudience: 'الأساتذة والمهندسون وطلبة الجامعات المتفوقون.',
    requiredSkills: ['تدريس رياضيات', 'شرح فيزياء', 'تبسيط المفاهيم'],
    requiredCount: 4,
    startTime: '2026-09-23T18:00:00Z',
    endTime: '2026-09-23T21:00:00Z',
    priority: 'medium',
    requiredResources: ['سبورات ذكية ومطبوعات مجهزة مسبقاً'],
    participationTerms: 'إعداد ملخص مركز وحل تمارين امتحانات سابقة.',
    contactInfo: '0771344556 - أ. طارق التلمساني',
    status: 'receiving_responses',
    location: {
      latitude: 34.8783,
      longitude: -1.3150,
      placeName: 'مكان عادي (تلمسان)',
      city: 'الجزائر',
      region: 'الجزائر',
      approxAddress: 'المركز التعليمي الجامعي'
    },
    creatorId: 'edu-team-1',
    creatorName: 'مبادرة علم وعطاء',
    creatorOrg: 'جمعية الإرشاد والإصلاح الجزائرية',
    responsesCount: 3,
    confirmedCount: 3,
    viewsCount: 112,
    createdAt: '2026-09-18T15:00:00Z',
    updatedAt: '2026-09-19T07:30:00Z'
  },
  {
    id: 'call-7',
    title: 'قافلة طبية واجتماعية تطوعية بواحات غرداية وبسكرة',
    description: 'تنظيم فحوصات طبية عامة وتوزيع نظارات قراءة ومستلزمات صحية للأسر في القرى والمناطق النائية.',
    category: 'community',
    goal: 'فحص 150 مستفيداً وتأمين الأدوية الأساسية لهم.',
    targetAudience: 'الأطباء، الممرضون، الصيادلة والمتطوعون التنظيميون.',
    requiredSkills: ['تمريض', 'صيدلة', 'تنظيم المرضى', 'إرشاد صحي'],
    requiredCount: 6,
    startTime: '2026-09-26T08:00:00Z',
    endTime: '2026-09-26T16:00:00Z',
    priority: 'high',
    requiredResources: ['حقائب طبية متنقلة', 'أجهزة قياس الضغط والسكر'],
    participationTerms: 'الالتزام بالأخلاقيات الطبية والتعامل الإنساني الرحيم.',
    contactInfo: '0550112233 - د. أحمد باحمد',
    status: 'active',
    location: {
      latitude: 32.4909,
      longitude: 3.6735,
      placeName: 'مكان عادي (غرداية)',
      city: 'الجزائر',
      region: 'الجزائر',
      approxAddress: 'مركز الرعاية الصحية المتنقل'
    },
    creatorId: 'community-team-2',
    creatorName: 'فريق بسمة أمل الطبي',
    creatorOrg: 'جمعية سبل الخيرات الجزائرية',
    responsesCount: 5,
    confirmedCount: 5,
    viewsCount: 165,
    createdAt: '2026-09-17T09:00:00Z',
    updatedAt: '2026-09-18T18:00:00Z'
  }
];

export const INITIAL_USER: UserProfile = {
  id: 'user-current-1',
  name: 'يوسف بن علي',
  email: 'youcef@athar-algeria.org',
  phone: '0550123456',
  role: 'both',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  location: {
    useGps: true,
    latitude: 36.7538,
    longitude: 3.0588,
    city: 'الجزائر',
    neighborhood: 'وسط الجزائر',
    maxRadiusKm: 25
  },
  skills: ['إسعافات أولية', 'تنظيم ميداني', 'دعم تقني', 'سياقة مركبات'],
  interests: ['مساعدة إغاثية', 'دعم كبار السن', 'تعليم ورقمنة', 'بيئة وتشجير'],
  notificationSettings: {
    nearbyAlerts: true,
    urgentOnly: false,
    quietHoursStart: '23:00',
    quietHoursEnd: '06:00'
  },
  monthlyPoints: 340,
  totalImpactPoints: 1520,
  savedCallIds: ['call-1', 'call-5']
};

export const INITIAL_NOTES: FieldNote[] = [
  {
    id: 'note-1',
    userId: 'user-current-1',
    callId: 'call-1',
    callTitle: 'توزيع قفف وسلال غذائية للأسر المعوزة في الجزائر العاصمة',
    title: 'تنسيق نقطة التجمع وساعة الانطلاق',
    content: 'تواصلت مع أ. عبد القادر مرابط، التجمع سيكون في مقر الهلال الأحمر الساعة 3:30 بعد الزوال. تم تجهيز شاحنتين صغيرتين لتسهيل دخول الأزقة الضيقة.',
    category: 'تنسيق ميداني',
    createdAt: '2026-09-18T18:20:00Z',
    updatedAt: '2026-09-18T18:20:00Z'
  },
  {
    id: 'note-2',
    userId: 'user-current-1',
    callId: 'call-3',
    callTitle: 'دعم تقني وتدريب كبار السن على الخدمات الرقمية بقسنطينة',
    title: 'تجهيز دليل مبسط ومصور للخدمات الإلكترونية',
    content: 'طبعت 25 نسخة من الدليل الورقي المصور بخط كبير لمساعدة المستفيدين على تثبيت التطبيقات واستعمالها بأمان.',
    category: 'مواد مساندة',
    createdAt: '2026-09-19T09:30:00Z',
    updatedAt: '2026-09-19T10:15:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'user-current-1',
    title: 'نداء إغاثي عاجل في الجزائر! (1.5 كم)',
    body: 'تم نشر نداء «توزيع قفف وسلال غذائية» وهو بحاجة لمتطوعين ميدانيين فوراً.',
    type: 'nearby_call',
    callId: 'call-1',
    read: false,
    createdAt: '2026-09-19T11:30:00Z'
  },
  {
    id: 'notif-2',
    userId: 'user-current-1',
    title: 'تم قبول ردك الميداني!',
    body: 'اعتمدت جمعية ناس الخير مشاركتك كمتطوع ميداني في النداء الإغاثي.',
    type: 'response_status',
    callId: 'call-1',
    read: true,
    createdAt: '2026-09-19T10:00:00Z'
  },
  {
    id: 'notif-3',
    userId: 'user-current-1',
    title: 'تقدمت في الترتيب الوطني للنشاط التطوعي! 🏆',
    body: 'حصلت على +60 نقطة جديدة وأصبحت في المركز الرابع لهذا الشهر.',
    type: 'rank_update',
    read: false,
    createdAt: '2026-09-18T20:15:00Z'
  }
];

export const CURRENT_LEADERBOARD: LeaderboardUser[] = [
  {
    rank: 1,
    userId: 'user-top-1',
    userName: 'أمين بن مسعود',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    points: 590,
    responsesCount: 9,
    completedCount: 8,
    volunteerHours: 26,
    badges: ['مستجيب ذهبي', 'فارس الميدان', 'سفير الإغاثة']
  },
  {
    rank: 2,
    userId: 'user-top-2',
    userName: 'أمينة بوجمعة',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    points: 495,
    responsesCount: 7,
    completedCount: 6,
    volunteerHours: 20,
    badges: ['مسعف معتمد', 'بصمة أثر الجزائر']
  },
  {
    rank: 3,
    userId: 'user-top-3',
    userName: 'رياض معمري',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    points: 420,
    responsesCount: 6,
    completedCount: 5,
    volunteerHours: 17,
    badges: ['تقني ماهر', 'المركز الثالث']
  },
  {
    rank: 4,
    userId: 'user-current-1',
    userName: 'يوسف بن علي (أنت)',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    points: 340,
    responsesCount: 4,
    completedCount: 3,
    volunteerHours: 13,
    badges: ['استجابة سريعة', 'مشارك نشط']
  },
  {
    rank: 5,
    userId: 'user-top-5',
    userName: 'مريم شريف',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
    points: 300,
    responsesCount: 4,
    completedCount: 3,
    volunteerHours: 11,
    badges: ['تعليم وتنشيط']
  },
  {
    rank: 6,
    userId: 'user-top-6',
    userName: 'عبد الرزاق دحماني',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    points: 250,
    responsesCount: 3,
    completedCount: 2,
    volunteerHours: 9,
    badges: ['همة وتطوع']
  }
];

export const INITIAL_LEADERBOARD = CURRENT_LEADERBOARD;
export const INITIAL_ARCHIVES: MonthlyArchiveRecord[] = [];

export const INITIAL_ACTIVITY_EVALUATIONS: import('../types').ActivityEvaluation[] = [
  {
    id: 'eval-1',
    callId: 'call-1',
    activityTitle: 'توزيع قفف وسلال غذائية للأسر المعوزة في الجزائر العاصمة',
    associationName: 'جمعية ناس الخير',
    date: '2026-09-18',
    whatWentWell: 'تجاوب سريع من المتطوعين، فرز وتعبئة السلال في وقت قياسي (أقل من ساعتين)، والالتزام بقوائم العائلات المستفيدة بدقة.',
    challengesFaced: 'صعوبة وصول الشاحنات الكبيرة لبعض الأزقة القديمة المرتفعة، ونقص في الصناديق الكرتونية المقواة في الدفعة الأخيرة.',
    operationalNotes: 'يُنصح مستقبلاً بالاعتماد على عربات يدوية مخصصة للأزقة الضيقة، وتأمين كميات احتياطية من أشرطة الإغلاق والتغليف.',
    ratingScore: 5,
    aiAnalysis: {
      summary: 'المبادرة حققت أهدافها الميدانية بنسبة 90% مع كفاءة عالية في توزيع المهام وروح الفريق.',
      lessonsLearned: [
        'معاينة المسارات الميدانية مسبقاً وتصنيف الشوارع حسب عرضها قبل إرسال المركبات.',
        'اعتماد نظام التعبئة الجزئية المسبقة لتخفيف الجهد الزمني على المتطوعين.'
      ],
      futureRiskMitigations: [
        'تجهيز فريق خاص بالنقل اليدوي للمنازل الواقعة في ممرات ضيقة.',
        'إضافة 15% مواد تعبئة وتغليف كاحتياطي طوارئ لأي تلف.'
      ],
      crossAssociationAdvice: [
        'توصية لجمعيات الإغاثة الجزائرية: تقسيم المتطوعين إلى خلايا ثنائية مرنة يضاعف سرعة التوزيع في الأحياء الشعبية.'
      ],
      readinessScore: 92
    },
    createdAt: '2026-09-18T21:00:00Z'
  },
  {
    id: 'eval-2',
    callId: 'call-2',
    activityTitle: 'حملة تشجير وتنظيف غابة الصنوبر ومسارات المشي بوهران',
    associationName: 'فريق أصدقاء البيئة',
    date: '2026-09-17',
    whatWentWell: 'إقبال قياسي من العائلات والشباب، غرس 200 شجيرة ملائمة للبيئة المتوسطية بنجاح، وتهيئة ممرات نظيفة للمتنزهين.',
    challengesFaced: 'صلابة بعض المناطق الصخرية أثناء الحفر ونقص في المعاول الثقيلة.',
    operationalNotes: 'تم التنسيق مع محافظة الغابات لتوفير أدوات حفر إضافية وتحديد برنامج ري أسبوعي منتظم للشتلات.',
    ratingScore: 4,
    aiAnalysis: {
      summary: 'مبادرة بيئية ناجحة ومؤثرة مجتمعياً عززت الوعي بأهمية الحفاظ على الفضاءات الطبيعية.',
      lessonsLearned: [
        'فحص التربة الجبلية قبل 48 ساعة يحدد كمية الأدوات اليدوية والميكانيكية المطلوبة.',
        'تخصيص مسار آمن لتفريغ الشتلات لتفادي ازدحام المداخل.'
      ],
      futureRiskMitigations: [
        'تأمين نقاط توزيع مياه الشرب عند محطات المسار المختلفة.',
        'توفير حقيبة إسعافات متخصصة للتعامل مع الخدوش ولدغات الحشرات.'
      ],
      crossAssociationAdvice: [
        'توصية للمبادرات البيئية: اختيار الأشجار المتأقلمة مع الجفاف كالصنوبر الحلبي والخروب لضمان استدامتها.'
      ],
      readinessScore: 90
    },
    createdAt: '2026-09-17T18:30:00Z'
  }
];

export const INITIAL_EVALUATIONS = INITIAL_ACTIVITY_EVALUATIONS;

export const INITIAL_INBOUND_NOTES: import('../types').AppUserInboundNote[] = [
  {
    id: 'inbound-1',
    senderName: 'سعيد بن مسعود',
    senderPhone: '0550112233',
    type: 'field_observation',
    callId: 'call-1',
    callTitle: 'توزيع قفف وسلال غذائية للأسر المعوزة في الجزائر العاصمة',
    message: 'المسار من جهة الباب الغربي مفتوح وسلس للشاحنات الصغيرة، يفضل توجيه المتطوعين للدخول من هناك لتجنب الازدحام.',
    locationName: 'مكان عادي (الجزائر)',
    cityName: 'الجزائر',
    rating: 5,
    status: 'new',
    appVersion: 'v2.0 (تطبيق أثر الجزائر)',
    createdAt: '2026-09-19T11:40:00Z'
  },
  {
    id: 'inbound-2',
    senderName: 'سمية حداد',
    senderPhone: '0661889900',
    type: 'suggestion',
    callId: 'call-2',
    callTitle: 'حملة تشجير وتنظيف غابة الصنوبر ومسارات المشي بوهران',
    message: 'نقترح تخصيص فوج خاص للأطفال في الحملات القادمة لتعليمهم مهارات الغرس والعناية بالشتلات.',
    cityName: 'الجزائر',
    status: 'new',
    appVersion: 'v2.0 (تطبيق أثر الجزائر)',
    createdAt: '2026-09-19T10:15:00Z'
  }
];
