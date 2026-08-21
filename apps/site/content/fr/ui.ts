/**
 * Textes d'interface du SITE en français — source de vérité.
 * Le type `SiteUi` en est dérivé : toute clé ajoutée ici doit être traduite dans
 * `content/ar/ui.ts`, sinon le typecheck échoue.
 *
 * Périmètre : uniquement le site vitrine. Les libellés métier partagés avec le futur
 * dashboard et le mobile (rôles, programmes, moyens de paiement, erreurs) vivent dans
 * `@qardan/shared` → `dictionaries/`.
 */

export const uiFr = {
  nav: {
    home: "Accueil",
    about: "À propos",
    programs: "Nos programmes",
    news: "Actualités",
    events: "Événements",
    transparency: "Transparence",
    volunteer: "Devenir bénévole",
    contact: "Contact",
    donate: "Faire un don",
    app: "Application mobile",
    main: "Navigation principale",
    mobile: "Navigation mobile",
    breadcrumb: "Fil d'Ariane",
    sitemap: "Plan du site",
    callThe: "Appeler le",
  },

  common: {
    seeAll: "Tout voir",
    readArticle: "Lire l'article",
    skipToContent: "Aller au contenu principal",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    toLight: "Passer en mode clair",
    toDark: "Passer en mode sombre",
    lightMode: "Mode clair",
    darkMode: "Mode sombre",
    changeLanguage: "Changer de langue",
    whatsapp: "WhatsApp",
    print: "Imprimer cette page",
    minRead: "min",
    sending: "Envoi…",
    homeAria: "accueil",
    comma: ", ",
    allRights: "Tous droits réservés.",
  },

  demoBanner: {
    title: "Maquette de travail.",
    text: "Chiffres, articles, événements et rapports sont des exemples de mise en forme — aucun n'a été fourni par l'ONG. À remplacer avant mise en ligne :",
  },

  footer: {
    site: "Le site",
    programs: "Nos programmes",
    reach: "Nous joindre",
    appTitle: "L'application arrive",
    appText: "Donner, suivre ses reçus et recevoir les actualités, depuis le téléphone.",
    appCta: "Être prévenu de la sortie",
  },

  home: {
    badge: "ONG ivoirienne · apolitique · à but non lucratif",
    titleLine1: "L'entraide,",
    titleLine2: "pour la bonne cause.",
    lead: "Qardan Hassana accompagne les familles, les jeunes et les malades d'Abidjan à travers quatre programmes : social, environnement, éducation et santé. Chaque don est tracé, affecté, et rendu public.",
    ctaDonate: "Faire un don",
    ctaPrograms: "Découvrir nos actions",
    trust: "reçu numéroté après validation du Trésorier",
    trustFrom: "Dons à partir de",
    sealSub: "Le prêt bienfaisant",
    sealText:
      "Donner sans rien attendre en retour : c'est le principe qui a donné son nom à notre organisation.",
    sealPrograms: "Programmes",
    sealLaw: "Cadre légal",
    programsEyebrow: "Nos quatre programmes",
    programsTitle: "Quatre terrains, une seule exigence",
    programsLead:
      "Chaque programme correspond à une action inscrite dans nos statuts. Rien n'est improvisé : un responsable, des bénéficiaires suivis, un budget qui se justifie.",
    programsCta: "Voir tous les programmes",
    donateEyebrow: "Faire un don",
    donateTitle: "Votre don devient une action, pas une ligne de budget",
    donateLead:
      "Orange Money, MTN, Moov, Wave ou espèces. Vous choisissez le programme, nous vous envoyons un reçu numéroté dès validation par le Trésorier Général.",
    donateCta: "Je fais un don",
    donateWhere: "Où va l'argent ?",
    valuesEyebrow: "Ce qui nous tient",
    valuesTitle: "Quatre principes, appliqués sans exception",
    testimoniesEyebrow: "Celles et ceux que nous accompagnons",
    testimoniesTitle: "Des vies, pas des statistiques",
    newsEyebrow: "Actualités",
    newsTitle: "Ce que nous avons fait, concrètement",
    newsLead:
      "Chaque action menée est racontée ici : ce qui a été fait, avec qui, et ce qu'il reste à faire.",
    newsCta: "Toutes les actualités",
    agendaEyebrow: "Agenda",
    agendaTitle: "Nos prochains rendez-vous",
    agendaLead:
      "Journées de salubrité, dépistages, remises de kits : nos actions sont publiques, venez y prendre part.",
    agendaCta: "Voir l'agenda complet",
    volunteerTitle: "Donner du temps",
    volunteerText:
      "Une matinée au cimetière, un appel hebdomadaire à un jeune en formation, une tente de dépistage à tenir. Le bénévolat ici n'est pas symbolique : il fait tourner l'ONG.",
    volunteerCta: "Devenir bénévole",
    appTitle: "L'ONG dans votre poche",
    appText:
      "Donner en trois gestes, retrouver ses reçus, suivre les programmes et recevoir les annonces. L'application mobile Android et iOS est en préparation.",
    appCta: "En savoir plus",
    metaDescription:
      "ONG ivoirienne apolitique et à but non lucratif : action sociale, environnement, éducation et santé. Faites un don, devenez bénévole, suivez nos actions à Abidjan.",
  },

  about: {
    title: "À propos",
    heroEyebrow: "Qui sommes-nous",
    heroTitle: "Une organisation née d'un principe : le prêt bienfaisant",
    objectEyebrow: "Notre objet",
    objectTitle: "Trois missions inscrites dans nos statuts",
    arabicSub: "Qard hassan — le prêt bienfaisant",
    objectText:
      "Prêter sans intérêt, donner sans rien attendre : le nom de l'organisation dit exactement ce qu'elle fait. Notre devise n'est pas un slogan de campagne — c'est le critère qui tranche chaque décision du Conseil d'Administration.",
    missions: [
      {
        title: "La promotion du bien-être social",
        text: "Assister ceux que la difficulté frappe sans prévenir : familles endeuillées, jeunes sans activité, enfants malades.",
      },
      {
        title: "La protection de l'environnement",
        text: "Entretenir les lieux de repos, sensibiliser à l'hygiène, préserver un cadre de vie digne dans les quartiers.",
      },
      {
        title: "La promotion de l'éducation",
        text: "Faire de l'éducation une valeur cardinale de la société — savoir scolaire comme transmission culturelle.",
      },
    ],
    legalTitle: "Cadre légal",
    legalIntro: "L'ONG est constituée conformément à la",
    legalIntroEnd: "relative aux Associations en Côte d'Ivoire.",
    legalPoints: [
      "Organisation apolitique — aucune affiliation partisane",
      "But non lucratif — aucun bénéfice distribué",
      "Comptes soumis au Commissaire aux Comptes",
      "Statuts et récépissé consultables page Transparence",
    ],
    legalCta: "Consulter nos documents",
    chartTitle: "Organigramme",
    chartRoot: "Conseil d'Administration",
    chartDirect: ["Trésorier Général", "Commissaire aux Comptes", "Direction Exécutive"],
    chartService: "Service Administratif",
    pathEyebrow: "Notre parcours",
    pathTitle: "D'une entraide de quartier à une organisation structurée",
    valuesEyebrow: "Nos valeurs",
    valuesTitle: "Ce qui nous engage",
    boardEyebrow: "Le bureau",
    boardTitle: "Des responsables joignables",
    boardLead:
      "Pas de standard, pas de formulaire à rallonge : les responsables de l'ONG répondent directement au téléphone.",
    metaDescription:
      "Histoire, cadre légal, organigramme et valeurs de l'ONG Qardan Hassana, organisation ivoirienne apolitique et à but non lucratif régie par la loi n° 60-315 du 21 septembre 1960.",
  },

  campaigns: {
    eyebrow: "Collectes en cours",
    title: "Suivi des dons",
    of: "sur",
    donors: "participants",
    remaining: "Plus que",
    goalReached: "Objectif atteint — merci à tous.",
    give: "Je fais un don",
    shareWhatsapp: "Partager sur WhatsApp",
    copyLink: "Copier le lien",
    linkCopied: "Lien copié",
    donorsTitle: "Derniers dons",
    sortRecent: "Récents",
    sortAmount: "Montants",
    sortComment: "Avec message",
    anonymous: "Anonyme",
    hiddenAmount: "Montant privé",
    seeMore: "Voir plus de dons",
    justNow: "à l'instant",
    validatedBy:
      "Chaque montant affiché correspond à un versement constaté et validé par le Trésorier Général. Les dons en attente de validation n'entrent pas dans le compteur.",
  },
  programs: {
    heroEyebrow: "Nos programmes",
    heroTitle: "Quatre programmes, quatre terrains d'action",
    heroLead:
      "Chacun correspond à une mission inscrite dans nos statuts, avec un responsable identifié, des bénéficiaires suivis nominativement et un budget qui doit se justifier.",
    discover: "Découvrir le programme",
    support: "Soutenir",
    ctaTitle: "Vous pouvez choisir votre terrain",
    ctaLead:
      "Un don affecté à un programme précis ne peut pas servir ailleurs. C'est la règle que s'impose le Trésorier Général, et que vérifie le Commissaire aux Comptes.",
    ctaDonate: "Faire un don ciblé",
    ctaVolunteer: "Devenir bénévole",
    metaDescription:
      "Les quatre programmes d'activité de l'ONG Qardan Hassana : Social, Environnement, Éducation & Formation, Santé & Sport. Actions statutaires, bénéficiaires suivis, besoins concrets.",
    detail: {
      support: "Soutenir ce programme",
      giveTime: "Y consacrer du temps",
      contextTitle: "Le constat",
      actionsEyebrow: "Ce que nous faisons",
      actionsTitle: "Nos actions, en détail",
      needsEyebrow: "Ce dont nous avons besoin",
      needsTitle: "Voici précisément ce qui manque à ce programme",
      needsCta: "Contribuer",
      newsEyebrow: "Sur le terrain",
      newsTitle: "Dernières actions menées",
      newsCta: "Toutes les actualités",
      eventsEyebrow: "Agenda",
      eventsTitle: "Prochains rendez-vous de ce programme",
      others: "Les autres programmes",
    },
  },

  news: {
    heroEyebrow: "Actualités",
    heroTitle: "Ce que nous avons fait, concrètement",
    heroTitlePrefix: "Actualités —",
    heroLead:
      "Chaque action menée est racontée ici : ce qui a été fait, avec qui, ce que ça a coûté et ce qu'il reste à faire.",
    filterLabel: "Filtrer par programme",
    all: "Tout",
    empty: "Aucune actualité publiée pour ce programme pour le moment.",
    alsoRead: "À lire aussi",
    supportProgram: "Soutenir ce programme",
    supportText: "Votre don affecté à ce programme ne peut pas servir ailleurs.",
    donate: "Faire un don",
    publishedAria: "Date de publication",
    authorAria: "Auteur",
    readingAria: "Temps de lecture",
    metaDescription:
      "Le journal des actions de l'ONG Qardan Hassana à Abidjan : journées de salubrité, prises en charge médicales, remises de kits scolaires, tournois de dépistage.",
  },

  events: {
    heroEyebrow: "Agenda",
    heroTitle: "Nos rendez-vous sont publics",
    heroLead:
      "Journées de salubrité, dépistages gratuits, distributions, tournois : nos actions se déroulent au vu de tous. Vous pouvez venir, observer, ou mettre la main à la pâte.",
    upcomingEyebrow: "À venir",
    upcomingTitle: "rendez-vous programmés",
    empty: "Aucun événement programmé pour le moment. Revenez bientôt.",
    registration: "Inscription souhaitée",
    scheduleAria: "Horaire",
    placeAria: "Lieu",
    at: "à",
    participateTitle: "Participer à un événement",
    participateText:
      "Pour les rendez-vous marqués « inscription souhaitée », prévenez-nous : cela nous permet de prévoir le matériel, les repas et l'encadrement. Un simple appel suffit.",
    participateWrite: "Écrire au Service Administratif",
    participateVolunteer: "Devenir bénévole régulier",
    pastEyebrow: "Déjà passés",
    pastTitle: "Les rendez-vous récents",
    pastLead: "Le compte rendu de chaque action menée est publié dans nos actualités.",
    metaDescription:
      "Agenda public de l'ONG Qardan Hassana à Abidjan : journées de salubrité, consultations foraines, remises de kits scolaires, tournois inter-quartiers.",
  },

  transparency: {
    heroEyebrow: "Transparence",
    heroTitle: "Où va l'argent",
    heroLead:
      "Une ONG qui demande la confiance doit la mériter par ses écritures, pas par ses déclarations. Voici comment nous rendons compte.",
    commitmentsEyebrow: "Nos engagements",
    commitmentsTitle: "Quatre règles que nous nous imposons",
    allocationEyebrow: "Emplois des fonds",
    allocationTitle: "Comment se répartissent les ressources",
    allocationLead:
      "Répartition indicative des dépenses entre les quatre programmes sur le dernier exercice.",
    allocationWarning:
      "Données de démonstration — la répartition réelle sera générée automatiquement depuis la comptabilité du back-office.",
    allocationTotalPrefix: "Total des dépenses de programme :",
    allocationTotalSuffix:
      "· le solde couvre le fonctionnement (déplacements, fournitures, frais administratifs).",
    allocationBarAria: "des dépenses",
    docsEyebrow: "Documents publics",
    docsTitle: "Rapports et statuts, librement téléchargeables",
    docsLead:
      "Les rapports validés par le Conseil d'Administration et visés par le Commissaire aux Comptes sont publiés ici.",
    download: "Télécharger le PDF",
    pending: "Document en cours de publication",
    govEyebrow: "Gouvernance financière",
    govTitle: "Trois regards différents sur les mêmes comptes",
    govRoles: [
      "Enregistre les recettes, valide les dépenses, établit les rapports de trésorerie et émet les reçus.",
      "Accès permanent aux écritures, en LECTURE SEULE. Il ne peut rien modifier — c'est ce qui donne son sens à son avis.",
      "Arbitre l'affectation des dons généraux et valide les décisions engageant l'ONG.",
    ],
    questionTitle: "Une question sur nos comptes ?",
    questionText:
      "Le Trésorier Général répond directement aux donateurs qui souhaitent comprendre l'affectation de leur don.",
    writeTreasurer: "Écrire au Trésorier",
    metaDescription:
      "Rapports d'activité et financiers de l'ONG Qardan Hassana, engagements de gouvernance, répartition des fonds par programme et rôle du Commissaire aux Comptes.",
  },

  donate: {
    heroEyebrow: "Faire un don",
    heroTitle: "Votre don devient une action",
    heroLead:
      "Choisissez un montant, un programme, un moyen de paiement. Nous vous envoyons une référence, puis un reçu officiel dès validation par le Trésorier Général.",
    trust: [
      "Affectation garantie au programme choisi",
      "Reçu numéroté après validation",
      "Aucune donnée bancaire demandée",
    ],
    afterTitle: "Ce qui se passe après votre don",
    steps: [
      {
        title: "Vous validez",
        text: "Le site enregistre votre intention de don et vous donne une référence unique (DON-2026-XXXX).",
      },
      {
        title: "Vous versez",
        text: "Depuis votre compte Mobile Money, ou en espèces au siège, en indiquant la référence.",
      },
      {
        title: "Le Trésorier valide",
        text: "Il rapproche votre versement de votre référence et passe le don en « validé ».",
      },
      {
        title: "Vous recevez le reçu",
        text: "Un reçu officiel numéroté, opposable, que vous retrouverez aussi dans l'application mobile.",
      },
    ],
    whyTitle: "Pourquoi pas de paiement automatique ?",
    whyText:
      "Parce qu'un encaissement automatique suppose un compte marchand agréé et des frais par transaction qui amputeraient chaque don. Tant que ce compte n'est pas ouvert, nous préférons un circuit plus simple et intégralement traçable : vous versez directement, le Trésorier rapproche, vous recevez un reçu. Le jour où l'ONG disposera d'un compte marchand, le paiement en ligne sera activé sans rien changer à ce formulaire.",
    formLoading: "Chargement du formulaire de don",
    metaDescription:
      "Soutenez l'ONG Qardan Hassana par Orange Money, MTN MoMo, Moov Money, Wave ou en espèces. Choisissez le programme, recevez un reçu numéroté après validation du Trésorier Général.",
    form: {
      step1: "Quel montant ?",
      step2: "Pour quel programme ?",
      step3: "Comment ?",
      step4: "Vos coordonnées",
      other: "Autre",
      freeAmountAria: "Montant libre en FCFA",
      impactPrefix: "Concrètement :",
      general: "Don général",
      generalHint: "Réparti par le Conseil d'Administration selon les urgences",
      oneOff: "Don ponctuel",
      oneOffHint: "Une seule fois",
      monthly: "Don mensuel",
      monthlyHint: "Le Trésorier vous rappellera chaque mois",
      phoneHint: "Sert à retrouver votre versement Mobile Money",
      emailHint: "Pour recevoir votre reçu par email",
      messageOptional: "Message (facultatif)",
      messagePlaceholder: "Une intention particulière, une dédicace…",
      hideAmount: "Ne pas afficher mon montant",
      hideAmountHint:
        "Votre nom restera dans la liste des dons de la collecte, mais le montant et votre message seront masqués.",
      anonymous: "Rester anonyme",
      anonymousHint: "Votre nom n'apparaîtra dans aucune publication ni liste de bienfaiteurs.",
      recapTitle: "Votre don",
      submit: "Valider mon don",
      submitting: "Enregistrement…",
      security:
        "Aucune donnée bancaire ne vous est demandée sur ce site. Vous réglez directement depuis votre compte Mobile Money, puis le Trésorier Général valide et émet votre reçu.",
      thanks: "Merci",
      registered: "Votre intention de don est enregistrée.",
      notPaid: "Votre don n'est pas encore encaissé.",
      amount: "Montant",
      program: "Programme",
      generalRecap: "Don général (réparti par le CA)",
      frequency: "Fréquence",
      method: "Moyen",
      phone: "Téléphone",
      keepRef:
        "Le Trésorier Général validera votre versement, puis un reçu officiel numéroté vous sera délivré. Conservez la référence ci-dessus : elle permet de retrouver votre don.",
      again: "Faire un autre don",
    },
  },

  volunteer: {
    heroEyebrow: "Devenir bénévole",
    heroTitle: "Le bénévolat, ici, n'est pas symbolique",
    heroLead:
      "Sans ses bénévoles, l'ONG ne tiendrait pas une semaine. Débroussailler, appeler un jeune chaque semaine, tenir une tente de dépistage, enseigner : chaque main compte.",
    benefits: [
      {
        title: "À votre rythme",
        text: "Une matinée par trimestre ou plusieurs heures chaque semaine : vous fixez votre disponibilité, nous adaptons la mission.",
      },
      {
        title: "Sur le terrain qui vous parle",
        text: "Vous choisissez un ou plusieurs programmes. Personne n'est affecté d'office à une mission qui ne lui convient pas.",
      },
      {
        title: "Jamais seul",
        text: "Chaque bénévole est rattaché à un responsable de programme qui l'accompagne dès sa première sortie.",
      },
    ],
    formEyebrow: "Votre candidature",
    formTitle: "Dites-nous qui vous êtes",
    formLead:
      "Un responsable de programme vous rappellera pour un premier échange — sans engagement de votre part.",
    programsLegend: "Sur quels programmes souhaitez-vous agir ?",
    availabilityLegend: "Vos disponibilités",
    birthYearHint: "15 ans minimum pour rejoindre les équipes de terrain",
    skillsHint: "Santé, comptabilité, informatique, enseignement, conduite, artisanat…",
    membership: "Je souhaite également adhérer comme membre de l'ONG",
    membershipHint:
      "L'adhésion implique une cotisation dont le montant vous sera précisé par le Service Administratif.",
    submit: "Envoyer ma candidature",
    successTitle: "Bienvenue parmi nous",
    successText:
      "Candidature enregistrée. Un responsable de programme vous appellera pour un premier échange.",
    metaDescription:
      "Rejoignez les bénévoles de l'ONG Qardan Hassana à Abidjan : journées de salubrité, accompagnement des jeunes, dépistages santé, enseignement. Formulaire d'engagement en ligne.",
  },

  contact: {
    heroEyebrow: "Contact",
    heroTitle: "Parlez-nous directement",
    heroLead:
      "Pas de standard automatique : les responsables de l'ONG répondent eux-mêmes au téléphone. Pour tout le reste, le formulaire ci-dessous arrive au Service Administratif.",
    hqTitle: "Le siège",
    send: "Envoyer le message",
    mapPending: "Plan d'accès — en attente de l'adresse exacte du siège",
    successTitle: "Message envoyé",
    successText:
      "Message reçu. Le Service Administratif vous répond généralement sous 48 heures ouvrées.",
    metaDescription:
      "Contactez l'ONG Qardan Hassana à Abidjan : PCA, Secrétaire Exécutif et Trésorier Général joignables directement, formulaire de contact et adresse du siège.",
  },

  app: {
    heroEyebrow: "Application mobile",
    heroTitle: "L'ONG dans votre poche",
    heroLead:
      "Donner, retrouver ses reçus, suivre les programmes et recevoir les annonces — depuis un téléphone, même avec une connexion capricieuse.",
    features: [
      {
        title: "Donner en trois gestes",
        text: "Montant, programme, opérateur Mobile Money. Le parcours est le même que sur le site, en plus court.",
      },
      {
        title: "Vos reçus, toujours là",
        text: "L'historique de vos dons et les reçus numérotés, téléchargeables à tout moment.",
      },
      {
        title: "Les annonces en direct",
        text: "Nouvelle campagne, journée de salubrité, remerciement après un don : les notifications arrivent sur le téléphone.",
      },
      {
        title: "Les quatre programmes",
        text: "Le détail de chaque programme, ses actions et ses actualités, avec photos.",
      },
      {
        title: "Pensée pour la faible data",
        text: "Les derniers contenus consultés restent lisibles hors connexion. Pas de vidéos imposées, pas de mégaoctets gaspillés.",
      },
      {
        title: "Android et iOS",
        text: "Une seule base de code, deux plateformes — Android en priorité, comme le veut l'usage local.",
      },
    ],
    comingTitle: "L'application arrive",
    comingText:
      "Elle est en cours de développement. En attendant sa publication sur le Play Store et l'App Store, tout est déjà possible depuis ce site : faire un don, s'inscrire comme bénévole, suivre les actualités.",
    playStore: "Google Play — bientôt",
    appStore: "App Store — bientôt",
    ctaDonate: "Faire un don depuis le site",
    ctaNotify: "Être prévenu de la sortie",
    metaDescription:
      "L'application mobile de l'ONG Qardan Hassana : faire un don en trois gestes, retrouver ses reçus, suivre les programmes et recevoir les annonces. Android et iOS.",
  },

  notFound: {
    title: "Cette page n'existe pas",
    text: "Le lien que vous avez suivi est peut-être ancien, ou la page a été déplacée.",
    home: "Retour à l'accueil",
    programs: "Voir nos programmes",
  },
};

export type SiteUi = typeof uiFr;
