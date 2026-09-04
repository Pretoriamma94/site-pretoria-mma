import type { ManualInscriptionInput } from '@/lib/admin/manual-inscription-schema';
import { DEFAULT_CODE_POSTAL, DEFAULT_VILLE } from '@/lib/inscription/schema';

export const MANUAL_FORM_INPUT_CLASS =
  'mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white';

export type ManualFormState = {
  nom: string;
  prenom: string;
  sexe: '' | 'homme' | 'femme';
  email: string;
  telephone: string;
  dateNaissance: string;
  adresse: string;
  codePostal: string;
  ville: string;
  cours: ManualInscriptionInput['cours'] | '';
  montantTotal: string;
  modePaiement: ManualInscriptionInput['modePaiement'];
  nombreEcheances: 1 | 2 | 3;
  montantPaye: string;
  accepteReglement: boolean;
  attesteCertificat: boolean;
  photoRecue: boolean;
  engagementPhoto: boolean;
  engagementCertificat: boolean;
  acceptePhotos: boolean | null;
  informeAssurance: boolean;
  informeDroitAcces: boolean;
  accepteRgpd: boolean;
  charteLue: boolean;
  charteReglesConnues: boolean;
  charteEngagementRespect: boolean;
  parcoursSante: '' | 'nouveau' | 'renouvellement';
  certificatMoinsDe3Ans: boolean | null;
  attestationResultat: '' | 'non_toutes' | 'oui_au_moins_une';
  autoriseSortieSeul: boolean | null;
  autoriseVoiturePrivee: boolean | null;
  nomResponsable: string;
  prenomResponsable: string;
  nomPere: string;
  prenomPere: string;
  telephonePere: string;
  nomMere: string;
  prenomMere: string;
  telephoneMere: string;
};

export const MANUAL_FORM_INITIAL: ManualFormState = {
  nom: '',
  prenom: '',
  sexe: '',
  email: '',
  telephone: '',
  dateNaissance: '',
  adresse: '',
  codePostal: DEFAULT_CODE_POSTAL,
  ville: DEFAULT_VILLE,
  cours: '',
  montantTotal: '',
  modePaiement: 'cash',
  nombreEcheances: 1,
  montantPaye: '0',
  accepteReglement: false,
  attesteCertificat: false,
  photoRecue: false,
  engagementPhoto: false,
  engagementCertificat: false,
  acceptePhotos: null,
  informeAssurance: false,
  informeDroitAcces: false,
  accepteRgpd: false,
  charteLue: false,
  charteReglesConnues: false,
  charteEngagementRespect: false,
  parcoursSante: '',
  certificatMoinsDe3Ans: null,
  attestationResultat: '',
  autoriseSortieSeul: null,
  autoriseVoiturePrivee: null,
  nomResponsable: '',
  prenomResponsable: '',
  nomPere: '',
  prenomPere: '',
  telephonePere: '',
  nomMere: '',
  prenomMere: '',
  telephoneMere: '',
};

export type SetManualField = <K extends keyof ManualFormState>(
  key: K,
  value: ManualFormState[K],
) => void;
