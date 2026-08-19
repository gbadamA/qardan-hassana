import type { Dictionary } from "./fr";

/**
 * Dictionnaire MÉTIER arabe.
 *
 * Typé `Dictionary` : toute clé ajoutée au français et oubliée ici casse le typecheck.
 *
 * Conventions de traduction retenues :
 *  - **arabe standard moderne**, registre institutionnel sobre — c'est la langue des
 *    documents associatifs, pas un dialecte ;
 *  - les noms propres et raisons sociales restent tels quels (Orange Money, Wave, MTN) :
 *    c'est ainsi qu'ils apparaissent sur les téléphones ivoiriens ;
 *  - les **chiffres restent occidentaux** (voir la note `NUMBER_LOCALE` dans `i18n.ts`) ;
 *  - « POPB » est explicité en arabe puis suivi du sigle français, seul repère utilisable
 *    face à un personnel soignant francophone.
 */
export const ar: Dictionary = {
  org: {
    slogan: "من أجل القضية النبيلة",
    legal:
      "منظمة غير حكومية إيفوارية، مستقلة عن الأحزاب ولا تهدف إلى الربح، خاضعة للقانون رقم 60-315 المؤرخ في 21 سبتمبر 1960 المتعلق بالجمعيات في كوت ديفوار.",
    legalShort:
      "منظمة إيفوارية غير حزبية ولا تهدف إلى الربح — القانون رقم 60-315 المؤرخ في 21 سبتمبر 1960",
    law: "القانون رقم 60-315 المؤرخ في 21 سبتمبر 1960",
    address: "أبيدجان، كوت ديفوار",
    city: "أبيدجان",
    country: "كوت ديفوار",
    arabicMeaning: "القرض الحسن",
  },

  roles: {
    super_admin: "المدير العام (رئيس مجلس الإدارة)",
    tresorier: "أمين المال العام",
    commissaire: "مراقب الحسابات",
    direction: "الإدارة التنفيذية",
    administratif: "المصلحة الإدارية",
    resp_programme: "مسؤول البرنامج",
    donateur: "متبرع / عضو",
  },

  contactRoles: {
    pca: { title: "رئيس مجلس الإدارة", short: "رئيس المجلس" },
    secretaire: { title: "الأمين التنفيذي", short: "الأمين التنفيذي" },
    tresorier: { title: "أمين المال العام", short: "أمين المال" },
  },

  programs: {
    social: {
      name: "الاجتماعي",
      fullName: "البرنامج الاجتماعي",
      tagline: "أن ننهض بمن أوقعته الحياة.",
      actions: [
        "إدماج الشباب العاطلين ومساعدتهم",
        "رعاية الأطفال المصابين بشلل الضفيرة العضدية الولادي (POPB)",
        "مساندة الأسر المفجوعة",
      ],
    },
    environnement: {
      name: "البيئة",
      fullName: "برنامج البيئة",
      tagline: "إطار حياة كريم، حتى آخر مثوى.",
      actions: ["صيانة المقابر", "التوعية بالنظافة والبيئة"],
    },
    education: {
      name: "التعليم والتكوين",
      fullName: "برنامج التعليم والتكوين",
      tagline: "التعليم قيمة أساسية في المجتمع.",
      actions: ["التكوين والتعليم في الثقافة الإسلامية", "تحفيظ القرآن الكريم"],
    },
    "sante-sport": {
      name: "الصحة والرياضة",
      fullName: "برنامج الصحة والرياضة",
      tagline: "الصحة بالعلاج، وبالرياضة.",
      actions: ["رعاية المرضى (الحالات الاجتماعية)", "مسابقات رياضية من أجل الصحة بالرياضة"],
    },
  },

  paymentMethods: {
    "orange-money": { label: "Orange Money", hint: "#144#" },
    "mtn-momo": { label: "MTN MoMo", hint: "*133#" },
    "moov-money": { label: "Moov Money", hint: "*155#" },
    wave: { label: "Wave", hint: "تطبيق Wave" },
    especes: { label: "نقدًا / تسليم مباشر", hint: "بمقر المنظمة" },
    virement: { label: "تحويل بنكي", hint: "يُرسل الحساب البنكي عند الطلب" },
  },

  paymentInstructions: {
    "orange-money":
      "اطلب ‎#144#‎ ثم اختر «تحويل الأموال» إلى رقم المنظمة، مع ذكر المرجع أدناه في خانة البيان.",
    "mtn-momo": "اطلب ‎*133#‎ ثم اختر «تحويل الأموال» إلى رقم المنظمة، مع ذكر المرجع أدناه.",
    "moov-money": "اطلب ‎*155#‎ ثم اختر «تحويل الأموال» إلى رقم المنظمة، مع ذكر المرجع أدناه.",
    wave: "افتح تطبيق Wave وأرسل المبلغ إلى رقم المنظمة، مع ذكر المرجع أدناه.",
    especes: "توجّه إلى مقر المنظمة ومعك المرجع: يسلّمك أمين المال العام إيصالًا مرقّمًا.",
    virement: "يوافيك أمين المال العام بالحساب البنكي للمنظمة. اذكر المرجع أدناه في بيان التحويل.",
  },

  contactSubjects: {
    don: "التبرع / استفسار عن تبرع",
    benevolat: "التطوع أو العضوية",
    partenariat: "شراكة / رعاية",
    beneficiaire: "طلب مساعدة",
    presse: "الصحافة والاتصال",
    autre: "موضوع آخر",
  },

  availability: {
    semaine: "أيام الأسبوع",
    "week-end": "نهاية الأسبوع",
    vacances: "خلال العطل",
    ponctuel: "عند تنظيم فعالية",
  },

  impact: {
    min: "كل مساهمة مهمة، مهما كان مقدارها",
    t2000: "نقل مريض إلى المركز الصحي",
    t5000: "سلة غذائية لأسرة مفجوعة",
    t10000: "صيانة ممر في المقبرة لمدة شهر",
    t25000: "حقيبة مدرسية كاملة لخمسة متعلمين",
    t50000: "حصة علاج طبيعي لطفل مصاب بشلل الضفيرة العضدية",
  },

  errors: {
    "errors.amount.required": "يرجى تحديد المبلغ.",
    "errors.amount.integer": "يجب أن يكون المبلغ عددًا صحيحًا بالفرنك.",
    "errors.amount.min": "الحد الأدنى للتبرع هو 500 فرنك.",
    "errors.amount.max": "لتبرع بهذا الحجم، يرجى الاتصال مباشرة بأمين المال العام.",
    "errors.name.min": "يرجى إدخال اسمك.",
    "errors.city.min": "يرجى إدخال بلديتك.",
    "errors.phone.invalid": "يُتوقع رقم إيفواري من 10 أرقام (مثال: 07 07 30 22 29).",
    "errors.email.invalid": "عنوان بريد إلكتروني غير صالح.",
    "errors.message.min": "رسالتك قصيرة جدًا.",
    "errors.motivation.min": "أخبرنا بكلمات قليلة عن دوافعك.",
    "errors.birthYear.invalid": "سنة ميلاد غير صالحة.",
    "errors.birthYear.tooYoung": "يجب أن يكون عمرك 15 سنة على الأقل للتطوع.",
    "errors.programs.min": "اختر برنامجًا واحدًا على الأقل.",
    "errors.availability.min": "يرجى تحديد أوقات توفرك.",
    "errors.tooLong": "هذا الحقل طويل جدًا.",
    "errors.submitFailed": "خدمة التسجيل غير متاحة مؤقتًا. اتصل بنا أو أعد المحاولة لاحقًا.",
    "errors.form": "بعض المعلومات بحاجة إلى تصحيح.",
  },

  fields: {
    fullName: "الاسم واللقب",
    fullNamePlaceholder: "كواسي أدجوا",
    phone: "الهاتف",
    phoneOptional: "الهاتف (اختياري)",
    phonePlaceholder: "07 07 30 22 29",
    email: "البريد الإلكتروني",
    emailOptional: "البريد الإلكتروني (اختياري)",
    emailPlaceholder: "vous@exemple.ci",
    subject: "الموضوع",
    message: "رسالتك",
    messagePlaceholder: "صف طلبك…",
    city: "البلدية / الحي",
    cityPlaceholder: "أبوبو",
    birthYear: "سنة الميلاد",
    skills: "مهارات خاصة (اختياري)",
    skillsPlaceholder: "ممرّض، رخصة سياقة",
    motivation: "ما الذي يحفّزك",
    motivationPlaceholder: "بضعة أسطر تكفي.",
  },
};
