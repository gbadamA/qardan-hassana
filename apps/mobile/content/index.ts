import type { Locale } from "@qardan/shared";

/**
 * Textes de l'APPLICATION MOBILE.
 * Le français est la source de vérité typée : `mobileAr` est typé `MobileUi`, donc une
 * clé ajoutée ici et oubliée en arabe casse le typecheck.
 *
 * Les libellés métier (programmes, opérateurs, erreurs, rôles) viennent de
 * `@qardan/shared` — ne rien redéfinir ici.
 */

export const mobileFr = {
  tabs: {
    home: "Accueil",
    programs: "Programmes",
    news: "Actualités",
    donate: "Donner",
  },
  home: {
    greeting: "Pour la bonne cause",
    lead: "Quatre programmes, une seule exigence : que chaque don serve, et que ça se voie.",
    donate: "Faire un don",
    ourPrograms: "Nos programmes",
    latestNews: "Dernières actualités",
    seeAll: "Tout voir",
    agenda: "Prochains rendez-vous",
    callUs: "Appeler l'ONG",
    noNews: "Aucune actualité publiée pour le moment.",
  },
  programs: {
    title: "Nos programmes",
    support: "Soutenir ce programme",
  },
  news: {
    title: "Actualités",
    readingTime: "min de lecture",
    empty: "Aucune actualité publiée.",
  },
  donate: {
    title: "Faire un don",
    lead: "Choisissez un montant et un programme. Vous recevrez une référence à indiquer lors de votre versement Mobile Money.",
    amount: "Montant",
    other: "Autre montant",
    program: "Programme",
    general: "Don général",
    method: "Moyen de paiement",
    name: "Nom et prénoms",
    phone: "Téléphone",
    anonymous: "Rester anonyme",
    submit: "Valider mon don",
    submitting: "Enregistrement…",
    successTitle: "Merci",
    successLead: "Votre intention de don est enregistrée.",
    notPaid: "Votre don n'est pas encore encaissé.",
    keepRef: "Conservez cette référence : elle permet au Trésorier de retrouver votre versement.",
    again: "Faire un autre don",
    impact: "Concrètement",
  },
  settings: {
    title: "Réglages",
    language: "Langue",
    rtlNotice:
      "Le passage à l'arabe inverse le sens de lecture de toute l'application : elle redémarre pour l'appliquer.",
    theme: "Apparence",
    light: "Clair",
    dark: "Sombre",
    offline: "Hors connexion — dernières données enregistrées.",
  },
  common: {
    loading: "Chargement…",
    error: "Une erreur est survenue.",
    retry: "Réessayer",
    close: "Fermer",
    required: "Champ obligatoire.",
  },
};

export type MobileUi = typeof mobileFr;

export const mobileAr: MobileUi = {
  tabs: {
    home: "الرئيسية",
    programs: "البرامج",
    news: "الأخبار",
    donate: "التبرع",
  },
  home: {
    greeting: "من أجل القضية النبيلة",
    lead: "أربعة برامج، ومطلب واحد: أن يخدم كل تبرع، وأن يظهر أثره.",
    donate: "تبرّع الآن",
    ourPrograms: "برامجنا",
    latestNews: "آخر الأخبار",
    seeAll: "عرض الكل",
    agenda: "المواعيد القادمة",
    callUs: "الاتصال بالمنظمة",
    noNews: "لا توجد أخبار منشورة حاليًا.",
  },
  programs: {
    title: "برامجنا",
    support: "ادعم هذا البرنامج",
  },
  news: {
    title: "الأخبار",
    readingTime: "دقيقة قراءة",
    empty: "لا توجد أخبار منشورة.",
  },
  donate: {
    title: "التبرع",
    lead: "اختر مبلغًا وبرنامجًا. ستتلقى مرجعًا تذكره عند الدفع عبر Mobile Money.",
    amount: "المبلغ",
    other: "مبلغ آخر",
    program: "البرنامج",
    general: "تبرع عام",
    method: "وسيلة الدفع",
    name: "الاسم واللقب",
    phone: "الهاتف",
    anonymous: "أرغب في عدم ذكر اسمي",
    submit: "تأكيد التبرع",
    submitting: "جارٍ التسجيل…",
    successTitle: "شكرًا",
    successLead: "تم تسجيل نية تبرعك.",
    notPaid: "لم يتم تحصيل تبرعك بعد.",
    keepRef: "احتفظ بهذا المرجع: به يعثر أمين المال على دفعتك.",
    again: "تبرّع مرة أخرى",
    impact: "بشكل ملموس",
  },
  settings: {
    title: "الإعدادات",
    language: "اللغة",
    rtlNotice:
      "التحويل إلى العربية يعكس اتجاه القراءة في التطبيق كله: سيُعاد تشغيله لتطبيق ذلك.",
    theme: "المظهر",
    light: "فاتح",
    dark: "داكن",
    offline: "دون اتصال — آخر البيانات المحفوظة.",
  },
  common: {
    loading: "جارٍ التحميل…",
    error: "حدث خطأ.",
    retry: "إعادة المحاولة",
    close: "إغلاق",
    required: "حقل إلزامي.",
  },
};

const UI: Record<Locale, MobileUi> = { fr: mobileFr, ar: mobileAr };

export function getMobileUi(locale: Locale): MobileUi {
  return UI[locale] ?? mobileFr;
}
