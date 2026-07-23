export default function EspaceMembrePage() {
  // TODO: protéger cette route (auth Supabase) et afficher les données réelles
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-display text-3xl uppercase tracking-[0.2em] text-white md:text-4xl">
        Espace membre
      </h1>
      <p className="mt-4 text-sm text-zinc-300 md:text-base">
        Tableau de bord personnel de l&apos;adhérent. Cette page affichera le profil, l&apos;abonnement et
        les documents à signer.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-200">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Mes documents
          </h2>
          <p className="mt-2 text-zinc-300">
            Liste des documents à lire et à signer (charte, règlement intérieur, etc.).
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-200">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Mon abonnement
          </h2>
          <p className="mt-2 text-zinc-300">
            Statut de l&apos;abonnement, échéance et type de formule.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-200">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Profil
          </h2>
          <p className="mt-2 text-zinc-300">
            Informations personnelles (adresse, contact, niveau, etc.).
          </p>
        </div>
      </div>
    </div>
  );
}