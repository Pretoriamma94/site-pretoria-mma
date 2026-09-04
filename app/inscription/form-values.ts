import { DEFAULT_CODE_POSTAL, DEFAULT_VILLE } from '@/lib/inscription/schema';

export type FiliereId = 'mma' | 'baby';

export type InscriptionFormValues = {
  filiere?: FiliereId;
  typeProfil?: 'adulte' | 'mineur';
  nom: string;
  prenom: string;
  sexe?: 'homme' | 'femme';
  email: string;
  telephone: string;
  dateNaissance: string;
  adresse: string;
  codePostal: string;
  ville: string;
  nomResponsable?: string;
  prenomResponsable?: string;
  nomPere?: string;
  prenomPere?: string;
  telephonePere?: string;
  nomMere?: string;
  prenomMere?: string;
  telephoneMere?: string;
  engagementCertificat?: boolean;
  informeAssurance?: boolean;
  informeDroitAcces?: boolean;
  accepteReglement?: boolean;
  accepteCharte?: boolean;
  autorisationPratiqueMineur?: boolean;
  autorisationSoinsUrgence?: boolean;
  acceptePhotos?: boolean | null;
  autoriseSortieSeul?: boolean | null;
  autoriseVoiturePrivee?: boolean | null;
  autoriseTransport?: boolean;
  accepteRgpd?: boolean;
  engagementPhoto?: boolean;
  cours?: FiliereId;
  formuleAdulte?: 'mixte' | 'femmes';
  parcoursSante?: 'nouveau' | 'renouvellement';
  certificatMoinsDe3Ans?: boolean | null;
  questionnaireSante?: Record<string, boolean | null>;
  attestationQuestionnaire?: boolean;
  charteLue?: boolean;
  charteReglesConnues?: boolean;
  charteEngagementRespect?: boolean;
  modePaiement?: 'cash' | 'cheque' | 'virement';
  nombreEcheances?: 1 | 2 | 3;
};

export const inscriptionDefaultValues: InscriptionFormValues = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  dateNaissance: '',
  adresse: '',
  codePostal: DEFAULT_CODE_POSTAL,
  ville: DEFAULT_VILLE,
  accepteReglement: false,
  accepteCharte: false,
  autorisationPratiqueMineur: false,
  autorisationSoinsUrgence: false,
  acceptePhotos: null,
  autoriseSortieSeul: null,
  autoriseVoiturePrivee: null,
  autoriseTransport: false,
  accepteRgpd: false,
  informeAssurance: false,
  informeDroitAcces: false,
  engagementCertificat: false,
  engagementPhoto: false,
  certificatMoinsDe3Ans: null,
  questionnaireSante: {},
  attestationQuestionnaire: false,
  charteLue: false,
  charteReglesConnues: false,
  charteEngagementRespect: false,
};

export const INSCRIPTION_STEPS = [
  'Activité',
  'Identité',
  'Infos',
  'Autorisations',
  'Santé',
  'Photo',
  'RGPD',
  'Charte',
  'Paiement',
  'Récap',
] as const;

export const inscriptionInputClass =
  'w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white';
