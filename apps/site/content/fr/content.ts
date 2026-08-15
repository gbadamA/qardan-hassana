import type { SiteContent } from "../types";

/**
 * ⚠️⚠️ CONTENUS DE DÉMONSTRATION (français) ⚠️⚠️
 * Aucun chiffre, récit ou date n'a été fourni par l'ONG. À remplacer un par un avant
 * mise en ligne, puis passer `IS_DEMO_CONTENT` à `false` dans `content/shared.ts`.
 * En Phase 1, ce fichier disparaît au profit des tables du back-office.
 */
export const contentFr: SiteContent = {
  keyFigures: [
    {
      value: 1240,
      suffix: "+",
      label: "Bénéficiaires accompagnés",
      detail: "Depuis la création de l'ONG, tous programmes confondus.",
    },
    {
      value: 4,
      label: "Programmes d'activité",
      detail: "Social, Environnement, Éducation-Formation, Santé & Sport.",
    },
    {
      value: 86,
      suffix: " %",
      label: "Des fonds vers le terrain",
      detail: "Part des dons affectée directement aux actions, hors frais de fonctionnement.",
    },
    {
      value: 132,
      label: "Bénévoles engagés",
      detail: "Jeunes, cadres et retraités mobilisés sur les actions de terrain.",
    },
  ],

  values: [
    {
      title: "Solidarité",
      text: "Le nom de l'ONG dit son principe : le qard hassan, le prêt bienfaisant que l'on consent sans rien attendre en retour.",
      icon: "HeartHandshake",
    },
    {
      title: "Transparence",
      text: "Chaque franc reçu est enregistré, affecté à un programme et audité par le Commissaire aux Comptes.",
      icon: "ScrollText",
    },
    {
      title: "Neutralité",
      text: "Organisation apolitique et à but non lucratif. Nous n'aidons pas selon l'appartenance, mais selon le besoin.",
      icon: "Scale",
    },
    {
      title: "Proximité",
      text: "Nos actions naissent dans les quartiers d'Abidjan, portées par ceux qui y vivent.",
      icon: "MapPin",
    },
  ],

  milestones: [
    {
      year: "Création",
      title: "Naissance de l'ONG",
      text: "Constitution de l'association conformément à la loi n° 60-315 du 21 septembre 1960, autour d'un noyau de bénévoles décidés à structurer l'entraide de quartier.",
    },
    {
      year: "Structuration",
      title: "Quatre programmes, un cap",
      text: "L'action se répartit en quatre programmes statutaires pour sortir de l'aide improvisée et rendre compte de chaque intervention.",
    },
    {
      year: "Terrain",
      title: "Premières prises en charge POPB",
      text: "Ouverture d'un suivi dédié aux enfants atteints de Paralysie Obstétricale du Plexus Brachial, du diagnostic aux séances de kinésithérapie.",
    },
    {
      year: "Aujourd'hui",
      title: "Digitalisation",
      text: "Mise en place d'une plateforme numérique — back-office de gestion, site public et application mobile — pour tracer chaque don et chaque bénéficiaire.",
    },
  ],

  testimonies: [
    {
      quote:
        "Quand mon mari est décédé, je ne savais pas comment nourrir les enfants la semaine suivante. L'ONG était là avant même que je demande.",
      author: "Mme K.",
      role: "Famille accompagnée — Programme Social",
    },
    {
      quote:
        "Mon fils ne levait pas le bras gauche. Grâce au suivi, il écrit aujourd'hui au tableau comme les autres.",
      author: "M. D.",
      role: "Parent d'un enfant POPB",
    },
    {
      quote:
        "J'ai commencé bénévole au nettoyage du cimetière. Deux ans après, je coordonne l'équipe environnement de mon quartier.",
      author: "Ibrahim S.",
      role: "Bénévole — Programme Environnement",
    },
  ],

  commitments: [
    {
      title: "Chaque don est enregistré",
      text: "Espèces, Mobile Money ou virement : toute entrée est saisie au back-office, rattachée à un programme et rapprochée du solde de trésorerie.",
      icon: "Receipt",
    },
    {
      title: "Un reçu pour chaque donateur",
      text: "Un reçu numéroté est émis après validation par le Trésorier Général, téléchargeable depuis l'application mobile.",
      icon: "FileCheck2",
    },
    {
      title: "Un auditeur en lecture seule",
      text: "Le Commissaire aux Comptes dispose d'un accès permanent aux écritures, sans aucun droit de modification.",
      icon: "ShieldCheck",
    },
    {
      title: "Des comptes publiés",
      text: "Le rapport financier annuel est mis en ligne sur cette page, librement téléchargeable.",
      icon: "Download",
    },
  ],

  articles: {
    "journee-de-salubrite-au-cimetiere": {
      title: "Journée de salubrité : 180 bénévoles au cimetière municipal",
      excerpt:
        "Une matinée, des machettes, des sacs et beaucoup de sueur : l'allée centrale et trois carrés du cimetière ont retrouvé un visage digne.",
      author: "Cellule Communication",
      body: [
        "Il était six heures et demie quand les premiers bénévoles se sont présentés à l'entrée du cimetière, gants et sacs à la main. À midi, l'allée centrale, trois carrés et les abords immédiats du portail avaient changé de visage.",
        "## Pourquoi les cimetières",
        "L'entretien des cimetières est l'une des deux actions statutaires du programme Environnement. Ce n'est pas un choix esthétique : un lieu de repos laissé à l'abandon blesse les familles qui viennent s'y recueillir, et devient un foyer d'insalubrité pour le quartier voisin.",
        "## Ce qui a été fait",
        "Débroussaillage des allées, évacuation de douze bennes de déchets verts, remise en état de la signalétique des carrés, et réfection du point d'eau à l'entrée. Une équipe restreinte reste mobilisée chaque mois pour éviter que la végétation ne reprenne le dessus.",
        "## Et ensuite",
        "La prochaine journée est programmée pour le trimestre suivant. Les bénévoles disponibles peuvent s'inscrire depuis la page Devenir bénévole — aucune compétence particulière n'est requise, seulement du temps et de la bonne volonté.",
      ],
    },
    "prise-en-charge-popb-cinq-enfants": {
      title: "POPB : cinq nouveaux enfants intégrés au suivi kinésithérapique",
      excerpt:
        "La Paralysie Obstétricale du Plexus Brachial reste mal connue des familles. Détectée tôt, elle se rééduque. L'ONG prend en charge le parcours complet.",
      author: "Programme Social",
      body: [
        "La Paralysie Obstétricale du Plexus Brachial (POPB) survient à la naissance, lorsque les nerfs qui commandent le bras sont étirés lors d'un accouchement difficile. L'enfant grandit avec un bras qui ne répond pas — ou mal.",
        "## Un handicap qui se rééduque",
        "Détectée dans les premiers mois, la POPB se traite. La rééducation est longue, régulière, et coûte cher pour une famille modeste : consultations, séances de kinésithérapie hebdomadaires, parfois chirurgie. C'est précisément cet écart que le programme Social comble.",
        "## Cinq nouveaux dossiers",
        "Cinq enfants ont rejoint ce trimestre le dispositif de suivi. Chacun dispose d'un dossier médical et social ouvert au sein de l'ONG, d'un référent, et d'un calendrier de séances pris en charge intégralement.",
        "## Repérer, c'est déjà aider",
        "Si vous connaissez un enfant dont un bras reste inerte ou nettement plus faible que l'autre depuis la naissance, parlez-en. Un signalement au Secrétaire Exécutif suffit à déclencher une évaluation.",
      ],
    },
    "tournoi-inter-quartiers-sante-par-le-sport": {
      title: "Tournoi inter-quartiers : la santé par le sport, pour de vrai",
      excerpt:
        "Huit équipes, un dépistage tension et glycémie à l'entrée du terrain, et 214 personnes examinées gratuitement en marge des matchs.",
      author: "Programme Santé & Sport",
      body: [
        "Le principe du programme Santé & Sport tient en une idée simple : là où les gens viennent pour le football, on peut aussi leur prendre la tension.",
        "## Le tournoi",
        "Huit équipes de quartier se sont affrontées sur deux week-ends. L'inscription était gratuite, la seule condition étant de passer par la tente de dépistage installée à l'entrée du terrain.",
        "## Le vrai résultat",
        "214 personnes ont bénéficié d'un contrôle de tension artérielle et de glycémie. Dix-sept ont été orientées vers un centre de santé pour des valeurs anormales — dont quatre qui ignoraient totalement être hypertendues.",
        "## Les cas sociaux",
        "Sept des personnes orientées ont été intégrées au dispositif de prise en charge des malades, l'ONG couvrant la consultation et le premier mois de traitement.",
      ],
    },
    "remise-de-kits-scolaires-et-memorisation": {
      title: "Rentrée : remise de kits scolaires et nouvelle promotion de mémorisation",
      excerpt:
        "Soixante kits distribués, et une nouvelle promotion d'apprenants engagés dans la mémorisation du Saint Qur'an.",
      author: "Programme Éducation & Formation",
      body: [
        "L'éducation est inscrite dans l'objet même de l'ONG, comme valeur cardinale de la société. Chaque rentrée, le programme Éducation & Formation traduit cette phrase en cartables.",
        "## Soixante kits",
        "Cahiers, stylos, ardoises, sacs : soixante kits complets ont été remis aux familles suivies par le programme Social, en priorité celles qui accompagnent un enfant malade ou qui viennent de perdre un parent.",
        "## Mémorisation du Saint Qur'an",
        "Une nouvelle promotion d'apprenants a démarré son parcours de mémorisation. Le suivi est individuel : chaque apprenant progresse à son rythme, et son niveau est consigné pour mesurer l'avancement réel plutôt que le temps passé.",
      ],
    },
    "assistance-aux-familles-endeuillees": {
      title: "Assistance aux familles endeuillées : ce que l'ONG prend en charge",
      excerpt:
        "Un décès plonge souvent une famille modeste dans une double épreuve : le chagrin et la dépense. Voici concrètement ce qui est couvert.",
      author: "Direction Exécutive",
      body: [
        "Perdre un proche coûte cher. Aux funérailles s'ajoutent la perte de revenus, l'accueil des visiteurs, et parfois la scolarité des enfants qui devient soudain incertaine.",
        "## Le dispositif",
        "L'assistance aux familles endeuillées est une action statutaire du programme Social. Elle est déclenchée par un signalement de quartier, puis évaluée par un référent qui rencontre la famille.",
        "## Ce qui est couvert",
        "Selon les situations : contribution aux frais funéraires, panier alimentaire pour les premières semaines, prise en charge de la scolarité des enfants sur un trimestre, accompagnement administratif.",
        "## Comment signaler",
        "Un appel au Secrétaire Exécutif suffit. La discrétion est la règle : aucun nom de famille bénéficiaire n'est publié sans accord écrit.",
      ],
    },
    "reinsertion-des-jeunes-desoeuvres": {
      title: "Réinsertion : douze jeunes orientés vers une formation qualifiante",
      excerpt:
        "Sortir un jeune de l'oisiveté ne se décrète pas. Cela demande un référent, une formation et un suivi de plusieurs mois.",
      author: "Programme Social",
      body: [
        "La réinsertion des jeunes désœuvrés est l'action la plus exigeante du programme Social, parce qu'elle se joue sur la durée.",
        "## Le parcours",
        "Chaque jeune est d'abord reçu individuellement. L'entretien détermine un projet réaliste — mécanique, couture, informatique, restauration — puis une place en formation est recherchée auprès des ateliers partenaires du quartier.",
        "## Douze parcours ouverts",
        "Douze jeunes sont actuellement en cours de formation qualifiante avec un référent bénévole qui les appelle chaque semaine. Ce coup de fil hebdomadaire est, de l'avis des référents, ce qui distingue un parcours mené à terme d'un abandon au troisième mois.",
        "## Ce qui manque",
        "Des maîtres d'apprentissage volontaires. Si vous dirigez un atelier et pouvez accueillir un apprenti, la Direction Exécutive attend votre appel.",
      ],
    },
  },

  events: {
    "journee-salubrite-trimestrielle": {
      title: "Journée de salubrité trimestrielle",
      place: "Cimetière municipal — entrée principale",
      city: "Abidjan",
      description:
        "Débroussaillage des allées, évacuation des déchets verts et remise en état de la signalétique. Venez avec des gants si vous en avez ; le matériel est fourni.",
    },
    "consultation-foraine-sante": {
      title: "Consultation foraine : tension et glycémie",
      place: "Place du marché",
      city: "Abidjan",
      description:
        "Dépistage gratuit de l'hypertension et du diabète, ouvert à tous. Les cas nécessitant un suivi sont orientés et pris en charge au titre des cas sociaux.",
    },
    "remise-kits-scolaires-rentree": {
      title: "Remise des kits scolaires de rentrée",
      place: "Siège de l'ONG",
      city: "Abidjan",
      description:
        "Distribution aux familles suivies par le programme Social. Les bénéficiaires sont convoqués individuellement par le Service Administratif.",
    },
    "tournoi-inter-quartiers": {
      title: "Tournoi inter-quartiers « La santé par le sport »",
      place: "Terrain municipal",
      city: "Abidjan",
      description:
        "Huit équipes, deux jours, un dépistage santé obligatoire à l'entrée du terrain. Inscription par équipe auprès du responsable de programme.",
    },
    "seance-sensibilisation-hygiene": {
      title: "Séance de sensibilisation à l'hygiène",
      place: "Cour de l'école primaire",
      city: "Abidjan",
      description:
        "Atelier destiné aux élèves et aux mères de famille : eau, lavage des mains, gestion des déchets domestiques.",
    },
  },

  reports: {
    "ra-2025": {
      title: "Rapport d'activité 2025",
      summary:
        "Bilan des actions menées par les quatre programmes, nombre de bénéficiaires accompagnés et perspectives pour l'exercice suivant.",
    },
    "rf-2025": {
      title: "Rapport financier 2025",
      summary:
        "Compte de résultat, emplois et ressources par programme, visé par le Commissaire aux Comptes.",
    },
    "ra-2024": {
      title: "Rapport d'activité 2024",
      summary: "Bilan des actions et de la mobilisation des bénévoles sur l'exercice 2024.",
    },
    statuts: {
      title: "Statuts de l'ONG",
      summary:
        "Statuts constitutifs et récépissé de déclaration au titre de la loi n° 60-315 du 21 septembre 1960.",
    },
  },

  programDetails: {
    social: {
      intro:
        "Le programme Social est la première ligne de l'ONG : celui vers lequel on se tourne quand il n'y a plus personne vers qui se tourner.",
      context: [
        "Dans les quartiers où nous intervenons, la difficulté ne prévient pas. Un décès, une naissance compliquée, un jeune qui décroche : la bascule se joue en quelques semaines, et la famille n'a souvent ni relais ni épargne.",
        "Notre rôle n'est pas de remplacer les services publics, mais de tenir la main pendant le temps nécessaire — quelques semaines pour un deuil, plusieurs années pour un enfant à rééduquer.",
      ],
      actionDetails: [
        {
          title: "Réinsertion des jeunes désœuvrés",
          text: "Entretien individuel, construction d'un projet réaliste, recherche d'une place en formation qualifiante auprès des ateliers du quartier, puis un référent bénévole qui appelle chaque semaine jusqu'au bout du parcours.",
        },
        {
          title: "Enfants atteints de POPB",
          text: "La Paralysie Obstétricale du Plexus Brachial se rééduque si elle est prise tôt. Nous ouvrons un dossier médical et social pour chaque enfant, finançons les séances de kinésithérapie et suivons la récupération dans la durée.",
        },
        {
          title: "Assistance aux familles endeuillées",
          text: "Contribution aux frais funéraires, panier alimentaire des premières semaines, maintien de la scolarité des enfants et accompagnement administratif. Toujours dans la discrétion.",
        },
      ],
      stats: [
        { value: "12", label: "Jeunes en formation qualifiante" },
        { value: "28", label: "Enfants POPB suivis" },
        { value: "63", label: "Familles accompagnées" },
      ],
      needs: [
        "Des maîtres d'apprentissage prêts à accueillir un apprenti",
        "Le financement de séances de kinésithérapie (environ 50 000 FCFA le cycle)",
        "Des bénévoles référents disponibles un appel par semaine",
      ],
    },

    environnement: {
      intro:
        "Un quartier propre et un cimetière digne ne relèvent pas du confort : ce sont des questions de santé publique et de respect.",
      context: [
        "L'entretien des lieux de repos est trop souvent laissé au hasard des bonnes volontés. Les allées disparaissent sous la végétation, les familles ne retrouvent plus les tombes, et les abords deviennent des dépotoirs.",
        "La même logique vaut pour l'hygiène domestique : la plupart des maladies que nous voyons passer au programme Santé se préviennent avec de l'eau propre, des mains lavées et des déchets évacués.",
      ],
      actionDetails: [
        {
          title: "Entretien des cimetières",
          text: "Journées de salubrité trimestrielles — débroussaillage, évacuation des déchets verts, remise en état de la signalétique et des points d'eau — puis une équipe réduite chaque mois pour que la végétation ne reprenne pas le dessus.",
        },
        {
          title: "Sensibilisation à l'hygiène et à l'environnement",
          text: "Ateliers dans les écoles et auprès des mères de famille : eau potable, lavage des mains, gestion des déchets domestiques, lutte contre les gîtes à moustiques.",
        },
      ],
      stats: [
        { value: "4", label: "Journées de salubrité par an" },
        { value: "180", label: "Bénévoles mobilisés par journée" },
        { value: "12", label: "Bennes de déchets évacuées" },
      ],
      needs: [
        "Du matériel : machettes, râteaux, gants, brouettes",
        "La location d'une benne pour chaque journée de salubrité",
        "Des bénévoles, simplement — aucune compétence requise",
      ],
    },

    education: {
      intro:
        "L'éducation figure dans l'objet même de l'ONG, comme valeur cardinale de la société. Nous la prenons au mot.",
      context: [
        "Une rentrée scolaire coûte, à une famille modeste, l'équivalent de plusieurs semaines de revenus. Le cartable manquant n'est jamais anodin : c'est souvent par là que commence le décrochage.",
        "À côté de l'école, la transmission de la culture islamique et la mémorisation du Saint Qur'an structurent le parcours de nombreux jeunes de nos quartiers. Nous l'accompagnons avec la même exigence de suivi.",
      ],
      actionDetails: [
        {
          title: "Formation et éducation sur la culture islamique",
          text: "Sessions régulières d'enseignement, ouvertes et gratuites, encadrées par des formateurs bénévoles.",
        },
        {
          title: "Mémorisation du Saint Qur'an",
          text: "Chaque apprenant progresse à son rythme, avec un niveau de mémorisation consigné et revu périodiquement. Nous mesurons l'avancement réel, pas le temps passé.",
        },
      ],
      stats: [
        { value: "60", label: "Kits scolaires distribués" },
        { value: "45", label: "Apprenants en mémorisation" },
        { value: "8", label: "Formateurs bénévoles" },
      ],
      needs: [
        "Le financement de kits scolaires (environ 5 000 FCFA le kit)",
        "Des enseignants bénévoles, quelques heures par semaine",
        "Des ouvrages et supports pédagogiques",
      ],
    },

    "sante-sport": {
      intro:
        "Soigner ceux qui ne peuvent pas payer, et prévenir chez ceux qui ne consultent jamais. Le sport est notre porte d'entrée.",
      context: [
        "Beaucoup d'adultes de nos quartiers n'ont pas vu de soignant depuis des années. Ils découvrent leur hypertension à l'hôpital, une fois la complication installée.",
        "Nous avons cessé d'attendre qu'ils viennent : nous installons le dépistage là où ils sont déjà — au bord d'un terrain de football, un dimanche après-midi.",
      ],
      actionDetails: [
        {
          title: "Prise en charge des malades (cas sociaux)",
          text: "Après évaluation sociale, l'ONG couvre la consultation, les examens et le premier mois de traitement, puis oriente vers un suivi durable.",
        },
        {
          title: "Compétitions sportives pour la santé par le sport",
          text: "Tournois inter-quartiers dont l'inscription est conditionnée à un passage par la tente de dépistage : tension, glycémie, orientation si nécessaire.",
        },
      ],
      stats: [
        { value: "214", label: "Personnes dépistées au dernier tournoi" },
        { value: "17", label: "Orientations vers un centre de santé" },
        { value: "8", label: "Équipes de quartier engagées" },
      ],
      needs: [
        "Des consommables de dépistage : bandelettes, tensiomètres, brassards",
        "La prise en charge de traitements (à partir de 10 000 FCFA)",
        "Des soignants bénévoles pour les journées de dépistage",
      ],
    },
  },
};
