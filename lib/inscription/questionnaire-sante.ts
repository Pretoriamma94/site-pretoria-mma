export type QsQuestion = {
  id: string;
  text: string;
};

export type QsSection = {
  id: string;
  title: string;
  questions: readonly QsQuestion[];
};

/** QS-SPORT adulte — renouvellement de licence. OUI à une question → certificat obligatoire. */
export const QS_ADULTE_SECTIONS: readonly QsSection[] = [
  {
    id: '12mois',
    title: 'Durant les 12 derniers mois',
    questions: [
      {
        id: 'a1',
        text: 'Un membre de votre famille est-il décédé subitement d’une cause cardiaque ou inexpliquée ?',
      },
      {
        id: 'a2',
        text: 'Avez-vous ressenti une douleur dans la poitrine, des palpitations, un essoufflement inhabituel ou un malaise ?',
      },
      {
        id: 'a3',
        text: 'Avez-vous eu un épisode de respiration sifflante (asthme) ?',
      },
      {
        id: 'a4',
        text: 'Avez-vous eu une perte de connaissance ?',
      },
      {
        id: 'a5',
        text: 'Si vous avez arrêté le sport pendant 30 jours ou plus pour des raisons de santé, avez-vous repris sans l’accord d’un médecin ?',
      },
      {
        id: 'a6',
        text: 'Avez-vous débuté un traitement médical de longue durée (hors contraception et désensibilisation aux allergies) ?',
      },
    ],
  },
  {
    id: 'aujourdhui',
    title: 'À ce jour',
    questions: [
      {
        id: 'a7',
        text: 'Ressentez-vous une douleur, un manque de force ou une raideur suite à un problème osseux, articulaire ou musculaire (fracture, entorse, luxation, déchirure, tendinite, etc.) survenu durant les 12 derniers mois ?',
      },
      {
        id: 'a8',
        text: 'Votre pratique sportive est-elle interrompue pour des raisons de santé ?',
      },
      {
        id: 'a9',
        text: 'Pensez-vous avoir besoin d’un avis médical pour poursuivre votre pratique sportive ?',
      },
    ],
  },
];

/** Questionnaire sportif mineur (arrêté du 7 mai 2021). OUI → avis médical / certificat. */
export const QS_MINEUR_SECTIONS: readonly QsSection[] = [
  {
    id: 'annee',
    title: 'L’année dernière',
    questions: [
      { id: 'm1', text: 'Es-tu allé(e) à l’hôpital pendant toute une journée ou plusieurs jours ?' },
      { id: 'm2', text: 'As-tu été opéré(e) ?' },
      { id: 'm3', text: 'As-tu beaucoup plus grandi que les autres années ?' },
      { id: 'm4', text: 'As-tu beaucoup maigri ou grossi ?' },
      { id: 'm5', text: 'As-tu eu la tête qui tourne pendant un effort ?' },
      {
        id: 'm6',
        text: 'As-tu perdu connaissance ou es-tu tombé sans te souvenir de ce qui s’était passé ?',
      },
      {
        id: 'm7',
        text: 'As-tu reçu un ou plusieurs chocs violents qui t’ont obligé à interrompre un moment une séance de sport ?',
      },
      {
        id: 'm8',
        text: 'As-tu eu beaucoup de mal à respirer pendant un effort par rapport à d’habitude ?',
      },
      { id: 'm9', text: 'As-tu eu beaucoup de mal à respirer après un effort ?' },
      {
        id: 'm10',
        text: 'As-tu eu mal dans la poitrine ou des palpitations (le cœur qui bat très vite) ?',
      },
      {
        id: 'm11',
        text: 'As-tu commencé à prendre un nouveau médicament tous les jours et pour longtemps ?',
      },
      {
        id: 'm12',
        text: 'As-tu arrêté le sport à cause d’un problème de santé pendant un mois ou plus ?',
      },
    ],
  },
  {
    id: '2semaines',
    title: 'Ces 2 dernières semaines',
    questions: [
      { id: 'm13', text: 'Te sens-tu très fatigué(e) ?' },
      { id: 'm14', text: 'As-tu du mal à t’endormir ou te réveilles-tu souvent dans la nuit ?' },
      { id: 'm15', text: 'Sens-tu que tu as moins faim ? que tu manges moins ?' },
      { id: 'm16', text: 'Te sens-tu triste ou inquiet ?' },
      { id: 'm17', text: 'Pleures-tu plus souvent ?' },
      {
        id: 'm18',
        text: 'Ressens-tu une douleur ou un manque de force à cause d’une blessure que tu t’es faite cette année ?',
      },
    ],
  },
  {
    id: 'now',
    title: 'Aujourd’hui',
    questions: [
      { id: 'm19', text: 'Penses-tu quelquefois à arrêter de faire du sport ou à changer de sport ?' },
      { id: 'm20', text: 'Penses-tu avoir besoin de voir ton médecin pour continuer le sport ?' },
      { id: 'm21', text: 'Souhaites-tu signaler quelque chose de plus concernant ta santé ?' },
    ],
  },
  {
    id: 'parents',
    title: 'À faire remplir par les parents',
    questions: [
      {
        id: 'm22',
        text: 'Quelqu’un dans votre famille proche a-t-il eu une maladie grave du cœur ou du cerveau, ou est-il décédé subitement avant l’âge de 50 ans ?',
      },
      {
        id: 'm23',
        text: 'Êtes-vous inquiet pour son poids ? Trouvez-vous qu’il se nourrit trop ou pas assez ?',
      },
      {
        id: 'm24',
        text: 'Avez-vous manqué l’examen de santé prévu à l’âge de votre enfant chez le médecin ? (2, 3, 4, 5 ans, entre 8 et 9 ans, 11-13 ans, 15-16 ans.)',
      },
    ],
  },
];

export const TEXTE_ENGAGEMENT_CERTIFICAT_MMA =
  'Je m’engage à fournir un certificat médical de non contre-indication à la pratique du MMA en loisir et/ou compétition dans les 3 semaines suivant mon inscription.';

export const TEXTE_CERTIFICAT_NOUVEAU =
  'Certificat médical de non contre-indication à la pratique du MMA en loisir et/ou compétition (nouveaux inscrits). PDF, JPG ou PNG — max 5 Mo.';

export function flattenQs(sections: readonly QsSection[]): QsQuestion[] {
  return sections.flatMap((s) => [...s.questions]);
}

export function questionnaireHasOui(answers: Record<string, boolean | null | undefined>): boolean {
  return Object.values(answers).some((v) => v === true);
}

export function questionnaireComplet(
  sections: readonly QsSection[],
  answers: Record<string, boolean | null | undefined>,
): boolean {
  return flattenQs(sections).every((q) => answers[q.id] === true || answers[q.id] === false);
}

export const TEXTE_ATTESTATION_QS_NON =
  'Je certifie avoir répondu NON à l’ensemble des rubriques du questionnaire de santé';

export const TEXTE_ATTESTATION_QS_OUI =
  'Je reconnais avoir répondu « OUI » à au moins une question du questionnaire de santé et m’engage à fournir un certificat médical attestant de l’absence de contre-indication à la pratique du MMA.';

export type AttestationSanteEnregistree = {
  resultat: 'non_toutes' | 'oui_au_moins_une';
  texte: string;
  date: string;
  declarantNom: string;
  declarantPrenom: string;
  declarantQualite: 'adherent' | 'representant_legal';
  adherentNom: string;
  adherentPrenom: string;
  questionnaire: 'adulte' | 'mineur';
  /** Papier (saisie admin) ou formulaire en ligne. */
  origine?: 'papier' | 'en_ligne';
  /** Scan du questionnaire papier (chemin Storage). */
  fichierUrl?: string | null;
};

export function buildAttestationSante(params: {
  hasOui: boolean;
  isMineur: boolean;
  adherentNom: string;
  adherentPrenom: string;
  declarantNom: string;
  declarantPrenom: string;
  date?: Date;
  origine?: 'papier' | 'en_ligne';
}): AttestationSanteEnregistree {
  const hasOui = params.hasOui;
  return {
    resultat: hasOui ? 'oui_au_moins_une' : 'non_toutes',
    texte: hasOui ? TEXTE_ATTESTATION_QS_OUI : TEXTE_ATTESTATION_QS_NON,
    date: (params.date ?? new Date()).toISOString(),
    declarantNom: params.declarantNom.trim(),
    declarantPrenom: params.declarantPrenom.trim(),
    declarantQualite: params.isMineur ? 'representant_legal' : 'adherent',
    adherentNom: params.adherentNom.trim(),
    adherentPrenom: params.adherentPrenom.trim(),
    questionnaire: params.isMineur ? 'mineur' : 'adulte',
    origine: params.origine,
  };
}

export function parseAttestationSante(value: unknown): AttestationSanteEnregistree | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  if (v.resultat !== 'non_toutes' && v.resultat !== 'oui_au_moins_une') return null;
  if (typeof v.texte !== 'string' || !v.texte.trim()) return null;
  if (typeof v.date !== 'string' || !v.date) return null;
  if (typeof v.declarantNom !== 'string' || typeof v.declarantPrenom !== 'string') return null;
  if (v.declarantQualite !== 'adherent' && v.declarantQualite !== 'representant_legal') return null;
  if (typeof v.adherentNom !== 'string' || typeof v.adherentPrenom !== 'string') return null;
  if (v.questionnaire !== 'adulte' && v.questionnaire !== 'mineur') return null;
  const origine =
    v.origine === 'papier' || v.origine === 'en_ligne' ? v.origine : undefined;
  const fichierUrl = typeof v.fichierUrl === 'string' && v.fichierUrl.trim() ? v.fichierUrl : null;
  return {
    resultat: v.resultat,
    texte: v.texte,
    date: v.date,
    declarantNom: v.declarantNom,
    declarantPrenom: v.declarantPrenom,
    declarantQualite: v.declarantQualite,
    adherentNom: v.adherentNom,
    adherentPrenom: v.adherentPrenom,
    questionnaire: v.questionnaire,
    origine,
    fichierUrl,
  };
}

export function isAttestationAllNon(value: unknown, flag?: boolean | null): boolean {
  if (parseAttestationSante(value)?.resultat === 'non_toutes') return true;
  return flag === true;
}

export function declarantQualiteLabel(qualite: AttestationSanteEnregistree['declarantQualite']): string {
  return qualite === 'representant_legal' ? 'Représentant légal' : 'Adhérent';
}
