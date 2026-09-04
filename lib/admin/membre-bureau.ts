import { getCoursPrixById } from '@/lib/admin/cours-override';

export const TYPE_TARIF_BUREAU = 'bureau';

export function isMembreBureau(row: {
  membre_bureau?: boolean | null;
  type_tarif?: string | null;
}): boolean {
  return row.membre_bureau === true || row.type_tarif === TYPE_TARIF_BUREAU;
}

/**
 * Applique ou retire l’exonération de cotisation.
 * Bureau / staff : montant 0, pas de solde, tarif « bureau », hors chiffre d’affaires.
 */
export function applyMembreBureauTarif(args: {
  membreBureau: boolean;
  wasMembreBureau: boolean;
  coursId: string;
  montantTotal: number;
  montantPaye: number;
  status: string;
}): {
  montantTotal: number;
  montantPaye: number;
  typeTarif: string;
  status: string;
} {
  if (args.membreBureau) {
    let status = args.status;
    if (status !== 'cancelled' && status !== 'validated' && status !== 'finalized') {
      status = 'paid';
    }
    return {
      montantTotal: 0,
      montantPaye: 0,
      typeTarif: TYPE_TARIF_BUREAU,
      status,
    };
  }

  if (args.wasMembreBureau) {
    const restored = getCoursPrixById(args.coursId);
    const montantTotal =
      restored != null && restored > 0 ? restored : Math.max(args.montantTotal, 0);
    const montantPaye = Math.min(Math.max(0, args.montantPaye), montantTotal);
    let status = args.status;
    if (status !== 'cancelled') {
      status =
        montantTotal <= 0 || montantPaye >= montantTotal ? 'paid' : 'pending_payment';
    }
    return {
      montantTotal,
      montantPaye,
      typeTarif: 'individuel',
      status,
    };
  }

  return {
    montantTotal: args.montantTotal,
    montantPaye: args.montantPaye,
    typeTarif: 'individuel',
    status: args.status,
  };
}
