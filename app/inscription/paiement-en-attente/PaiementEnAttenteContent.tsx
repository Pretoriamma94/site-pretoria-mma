'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MODE_PAIEMENT_OPTIONS,
  montantParEcheance,
} from '@/lib/inscription/schema';

export function PaiementEnAttenteContent() {
  const searchParams = useSearchParams();

  const nom = searchParams.get('nom') ?? '';
  const prenom = searchParams.get('prenom') ?? '';
  const cours = searchParams.get('cours') ?? '';
  const montantParam = searchParams.get('montant');
  const montant =
    montantParam && !Number.isNaN(Number.parseFloat(montantParam))
      ? Number.parseFloat(montantParam)
      : null;
  const modeParam = searchParams.get('mode');
  const modeLabel = MODE_PAIEMENT_OPTIONS.find((m) => m.id === modeParam)?.label ?? null;
  const echeancesParam = searchParams.get('echeances');
  const echeances =
    echeancesParam === '1' || echeancesParam === '2' || echeancesParam === '3'
      ? Number(echeancesParam)
      : null;
  const parEcheance =
    montant != null && echeances != null ? montantParEcheance(montant, echeances) : null;
  const token = searchParams.get('token') ?? '';

  const hasParams = Boolean(nom || prenom || cours || montant);

  return (
    <div className="bg-black px-4 py-10 md:py-16">
      <div className="mx-auto max-w-4xl">
        <nav className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-red-500">
                Accueil
              </Link>
            </li>
            <li className="text-zinc-600">/</li>
            <li>
              <Link href="/inscription" className="hover:text-red-500">
                Inscription
              </Link>
            </li>
            <li className="text-zinc-600">/</li>
            <li className="text-zinc-200">Confirmation</li>
          </ol>
        </nav>

        <section className="mt-8 text-center">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-3xl">
            <span aria-hidden="true">✓</span>
          </div>
          <h1 className="mt-6 font-display text-3xl uppercase tracking-[0.2em] text-white md:text-4xl">
            Inscription enregistrée
          </h1>
          <p className="mt-4 text-sm text-zinc-300 md:text-base">
            Merci ! Votre demande a bien été prise en compte. Le paiement se fait au club.
          </p>
        </section>

        {hasParams ? (
          <>
            <section className="mt-10 grid gap-6 md:grid-cols-2">
              <Card className="border-gray-800 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-lg">Prochaines étapes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-zinc-200">
                  <p>
                    1. Réglez votre cotisation au club
                    {modeLabel
                      ? ` en ${modeLabel.toLowerCase()}`
                      : ' (espèces, chèque ou virement)'}
                    {echeances != null
                      ? echeances === 1
                        ? ' en une fois'
                        : ` en ${echeances} fois`
                      : ''}
                    .
                  </p>
                  <p>
                    2. Une fois le paiement validé par le club, votre inscription sera finalisée.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-800 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-lg">Votre inscription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-zinc-200">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Nom / prénom
                    </p>
                    <p className="mt-1">
                      {prenom || nom ? `${prenom} ${nom}`.trim() : '— À renseigner'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Cours sélectionné
                    </p>
                    <p className="mt-1">{cours || '— À confirmer'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Montant
                    </p>
                    <p className="mt-1">
                      {montant !== null ? `${Math.round(montant)}€` : '— À définir'}
                    </p>
                  </div>
                  {(modeLabel || echeances != null) && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        Paiement prévu
                      </p>
                      <p className="mt-1">
                        {[
                          modeLabel,
                          echeances != null
                            ? echeances === 1
                              ? '1 fois'
                              : `${echeances} fois`
                            : null,
                          parEcheance != null && echeances != null && echeances > 1
                            ? `≈ ${parEcheance}€ / échéance`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {token ? (
              <section className="mt-8">
                <Card className="border-mma-red/50 bg-red-950/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Documents à compléter</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-zinc-200">
                    <p>
                      Il vous manque un document (certificat médical et/ou photo) ? Vous pouvez le
                      transmettre plus tard — dans les 3 semaines — grâce à votre lien personnel.
                      Un email de rappel avec ce lien vous a également été envoyé.
                    </p>
                    <Link
                      href={`/mon-inscription/${token}`}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-red-600 px-6 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-red-700"
                    >
                      Transmettre mes documents
                    </Link>
                    <p className="text-xs text-zinc-400">
                      Conservez cet email : il contient votre lien pour revenir quand vous voulez.
                    </p>
                  </CardContent>
                </Card>
              </section>
            ) : null}

            <section className="mt-8">
              <Card className="border-zinc-700 bg-zinc-900/80">
                <CardContent className="text-sm text-zinc-200">
                  <p>
                    Présentez-vous au club pour régler selon le mode choisi. Pour toute question :{' '}
                    <Link href="/contact" className="text-red-400 underline hover:text-red-300">
                      contactez-nous
                    </Link>
                    .
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 flex-col gap-3 md:flex-row">
                <Link
                  href="/"
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-red-600 px-6 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-red-700"
                >
                  Retour à l&apos;accueil
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-zinc-600 bg-zinc-900 px-6 text-sm font-semibold uppercase tracking-wide text-zinc-100 transition hover:border-zinc-400 hover:bg-zinc-800"
                >
                  Nous contacter
                </Link>
              </div>
            </section>
          </>
        ) : (
          <section className="mt-10">
            <Card className="border-red-700 bg-red-950/40">
              <CardContent className="space-y-4 text-sm text-red-100">
                <p className="text-base font-semibold">
                  Aucune inscription trouvée. Veuillez recommencer le processus d&apos;inscription.
                </p>
                <div>
                  <Link
                    href="/inscription"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-red-600 px-6 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-red-700"
                  >
                    Nouvelle inscription
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
