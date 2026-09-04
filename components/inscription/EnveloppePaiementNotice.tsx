export function EnveloppePaiementNotice() {
  return (
    <div className="rounded-xl border border-amber-800/60 bg-amber-950/30 p-4 text-sm text-amber-50">
      <p className="font-semibold uppercase tracking-wide text-amber-100">
        Important – Paiement par chèque ou en espèces
      </p>
      <p className="mt-2 text-amber-50/90">
        Pour tout règlement par chèque ou en espèces, merci de placer votre paiement dans une
        enveloppe fermée en indiquant clairement :
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-50/90">
        <li>le nom et prénom de l’adhérent ;</li>
        <li>le montant total du règlement ;</li>
        <li>pour un paiement par chèque, le nombre de chèques remis.</li>
      </ul>
      <p className="mt-3 font-medium text-amber-100">Merci de votre compréhension</p>
    </div>
  );
}
