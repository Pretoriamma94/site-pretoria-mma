import type { ManualInscriptionInput } from '@/lib/admin/manual-inscription-schema';
import type { TailleTenue } from '@/lib/inscription/taille-tenue';
import { DEFAULT_CODE_POSTAL, DEFAULT_VILLE } from '@/lib/inscription/schema';

export const MANUAL_FORM_INPUT_CLASS =
  'mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white';

export const LIEN_PARENTE_OPTIONS = [
  { value: 'pere', label: 'Père' },
  { value: 'mere', label: 'Mère' },
  { value: 'tuteur', label: 'Tuteur légal' },
] as const;

export type ManualFormState = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateNaissance: string;
  numeroVoie: string;
  rue: string;
  codePostal: string;
  ville: string;
  tailleCm: string;
  poidsKg: string;
  tailleTenue: TailleTenue | '';
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
  autorisePhotos: boolean;
  informeAssurance: boolean;
  informeDroitAcces: boolean;
  autoriseSortieSeul: boolean | null;
  autoriseVoiturePrivee: boolean | null;
  autorisePhotosMineur: boolean | null;
  nomResponsable: string;
  prenomResponsable: string;
  telephoneResponsable: string;
  emailResponsable: string;
  lienParente: '' | 'pere' | 'mere' | 'tuteur';
};

export const MANUAL_FORM_INITIAL: ManualFormState = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  dateNaissance: '',
  numeroVoie: '',
  rue: '',
  codePostal: DEFAULT_CODE_POSTAL,
  ville: DEFAULT_VILLE,
  tailleCm: '',
  poidsKg: '',
  tailleTenue: '',
  cours: '',
  montantTotal: '',
  modePaiement: 'cash',
  nombreEcheances: 1,
  montantPaye: '0',
  accepteReglement: true,
  attesteCertificat: false,
  photoRecue: false,
  engagementPhoto: true,
  engagementCertificat: true,
  autorisePhotos: false,
  informeAssurance: true,
  informeDroitAcces: true,
  autoriseSortieSeul: null,
  autoriseVoiturePrivee: null,
  autorisePhotosMineur: null,
  nomResponsable: '',
  prenomResponsable: '',
  telephoneResponsable: '',
  emailResponsable: '',
  lienParente: '',
};

export type SetManualField = <K extends keyof ManualFormState>(
  key: K,
  value: ManualFormState[K],
) => void;
