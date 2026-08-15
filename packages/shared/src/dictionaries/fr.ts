/**
 * Dictionnaire MÉTIER français — langue par défaut et **source de vérité**.
 *
 * Le type `Dictionary` est dérivé de ce fichier (`typeof fr`) : ajouter une clé ici rend
 * le dictionnaire arabe incomplet au typecheck. C'est exactement le garde-fou voulu —
 * on ne peut pas oublier une traduction en silence.
 *
 * ⚠️ Périmètre : ce dictionnaire est partagé par le site, le dashboard et le futur
 * mobile. On n'y met QUE ce qui est réellement commun aux trois : identité de l'ONG,
 * rôles, programmes, moyens de paiement, messages d'erreur, libellés de champs.
 * Le texte des pages du site vit dans `apps/site/content/<locale>/ui.ts`, celui du
 * back-office dans `apps/dashboard/content/<locale>.ts`.
 *
 * ⚠️ Pas de `as const` : sans lui, `typeof fr` élargit les littéraux en `string`, ce qui
 * permet à `ar: Dictionary` d'avoir d'autres valeurs tout en gardant la même forme.
 */

export const fr = {
  org: {
    slogan: "Pour la bonne cause",
    legal:
      "Organisation non gouvernementale ivoirienne, apolitique et à but non lucratif, régie par la loi n° 60-315 du 21 septembre 1960 relative aux Associations en Côte d'Ivoire.",
    legalShort:
      "ONG ivoirienne apolitique et à but non lucratif — loi n° 60-315 du 21 septembre 1960",
    law: "Loi n° 60-315 du 21 septembre 1960",
    /** ⚠️ Placeholder — à remplacer par l'adresse réelle du siège. */
    address: "Abidjan, Côte d'Ivoire",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    /** Sens du nom arabe de l'ONG, affiché sous la calligraphie. */
    arabicMeaning: "Le prêt bienfaisant",
  },

  roles: {
    super_admin: "Super Admin (PCA)",
    tresorier: "Trésorier Général",
    commissaire: "Commissaire aux Comptes",
    direction: "Direction Exécutive",
    administratif: "Service Administratif",
    resp_programme: "Responsable de Programme",
    donateur: "Donateur / Membre",
  },

  contactRoles: {
    pca: { title: "Président du Conseil d'Administration", short: "PCA" },
    secretaire: { title: "Secrétaire Exécutif", short: "Secrétaire Exécutif" },
    tresorier: { title: "Trésorier Général", short: "Trésorier" },
  },

  programs: {
    social: {
      name: "Social",
      fullName: "Programme Social",
      tagline: "Relever ceux que la vie a fait trébucher.",
      actions: [
        "Réinsertion et assistance des jeunes désœuvrés",
        "Prise en charge des enfants atteints de la maladie de POPB (Paralysie Obstétricale du Plexus Brachial)",
        "Assistance aux familles endeuillées",
      ],
    },
    environnement: {
      name: "Environnement",
      fullName: "Programme Environnement",
      tagline: "Un cadre de vie digne, jusqu'au dernier lieu de repos.",
      actions: ["Entretien des cimetières", "Sensibilisation sur l'hygiène et l'environnement"],
    },
    education: {
      name: "Éducation & Formation",
      fullName: "Programme Éducation & Formation",
      tagline: "L'éducation comme valeur cardinale de la société.",
      actions: ["Formation et éducation sur la culture islamique", "Mémorisation du Saint Qur'an"],
    },
    "sante-sport": {
      name: "Santé & Sport",
      fullName: "Programme Santé & Sport",
      tagline: "La santé par le soin, et par le sport.",
      actions: [
        "Prise en charge des malades (cas sociaux)",
        "Compétitions sportives pour la santé par le sport",
      ],
    },
  },

  paymentMethods: {
    "orange-money": { label: "Orange Money", hint: "#144#" },
    "mtn-momo": { label: "MTN MoMo", hint: "*133#" },
    "moov-money": { label: "Moov Money", hint: "*155#" },
    wave: { label: "Wave", hint: "Application Wave" },
    especes: { label: "Espèces / Remise en main propre", hint: "Au siège de l'ONG" },
    virement: { label: "Virement bancaire", hint: "RIB communiqué sur demande" },
  },

  paymentInstructions: {
    "orange-money":
      "Composez #144# puis suivez « Transfert d'argent » vers le numéro de l'ONG, en indiquant la référence ci-dessous dans le motif.",
    "mtn-momo":
      "Composez *133# puis « Transfert d'argent » vers le numéro de l'ONG, en indiquant la référence ci-dessous.",
    "moov-money":
      "Composez *155# puis « Transfert d'argent » vers le numéro de l'ONG, en indiquant la référence ci-dessous.",
    wave: "Ouvrez l'application Wave et envoyez le montant au numéro de l'ONG, en indiquant la référence ci-dessous.",
    especes:
      "Présentez-vous au siège de l'ONG muni de votre référence : le Trésorier Général vous remettra un reçu numéroté.",
    virement:
      "Le Trésorier Général vous communiquera le RIB de l'ONG. Indiquez la référence ci-dessous en libellé du virement.",
  },

  contactSubjects: {
    don: "Faire un don / question sur un don",
    benevolat: "Devenir bénévole ou membre",
    partenariat: "Partenariat / mécénat",
    beneficiaire: "Demande d'assistance",
    presse: "Presse et communication",
    autre: "Autre sujet",
  },

  availability: {
    semaine: "En semaine",
    "week-end": "Le week-end",
    vacances: "Pendant les vacances",
    ponctuel: "Sur événement ponctuel",
  },

  impact: {
    min: "Chaque contribution compte, quel qu'en soit le montant",
    t2000: "Le transport d'un malade jusqu'au centre de santé",
    t5000: "Un panier alimentaire pour une famille endeuillée",
    t10000: "L'entretien d'une allée de cimetière pendant un mois",
    t25000: "Un kit scolaire complet pour cinq apprenants",
    t50000: "Une séance de kinésithérapie pour un enfant atteint de POPB",
  },

  /** Clés renvoyées par les schémas Zod — traduites au moment de l'affichage. */
  errors: {
    "errors.amount.required": "Indiquez un montant.",
    "errors.amount.integer": "Le montant doit être un nombre entier de FCFA.",
    "errors.amount.min": "Le don minimum est de 500 FCFA.",
    "errors.amount.max": "Pour un don de cette ampleur, contactez directement le Trésorier Général.",
    "errors.name.min": "Indiquez votre nom.",
    "errors.city.min": "Indiquez votre commune.",
    "errors.phone.invalid": "Numéro ivoirien à 10 chiffres attendu (ex. 07 07 30 22 29).",
    "errors.email.invalid": "Adresse email invalide.",
    "errors.message.min": "Votre message est trop court.",
    "errors.motivation.min": "Dites-nous en quelques mots ce qui vous motive.",
    "errors.birthYear.invalid": "Année de naissance invalide.",
    "errors.birthYear.tooYoung": "Il faut avoir au moins 15 ans pour devenir bénévole.",
    "errors.programs.min": "Choisissez au moins un programme.",
    "errors.availability.min": "Indiquez vos disponibilités.",
    "errors.tooLong": "Ce champ est trop long.",
    "errors.form": "Quelques informations doivent être corrigées.",
  },

  /** Libellés de champs communs au site, au dashboard et au futur mobile. */
  fields: {
    fullName: "Nom et prénoms",
    fullNamePlaceholder: "Kouassi Adjoua",
    phone: "Téléphone",
    phoneOptional: "Téléphone (facultatif)",
    phonePlaceholder: "07 07 30 22 29",
    email: "Adresse email",
    emailOptional: "Email (facultatif)",
    emailPlaceholder: "vous@exemple.ci",
    subject: "Objet",
    message: "Votre message",
    messagePlaceholder: "Décrivez votre demande…",
    city: "Commune / quartier",
    cityPlaceholder: "Abobo",
    birthYear: "Année de naissance",
    skills: "Compétences particulières (facultatif)",
    skillsPlaceholder: "Infirmier, permis B",
    motivation: "Ce qui vous motive",
    motivationPlaceholder: "Quelques lignes suffisent.",
  },
};

export type Dictionary = typeof fr;
