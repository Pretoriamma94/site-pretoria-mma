import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de confidentialité | Pretoria MMA',
  description:
    'Politique de confidentialité et de protection des données personnelles du club Pretoria MMA (RGPD).',
};

const LAST_UPDATE = '21 juillet 2026';

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <nav className="text-xs uppercase tracking-wide text-zinc-500">
        <Link href="/" className="hover:text-zinc-300">
          Accueil
        </Link>
        <span className="mx-2 text-zinc-700">/</span>
        <span className="text-zinc-300">Politique de confidentialité</span>
      </nav>

      <h1 className="mt-6 font-display text-3xl uppercase tracking-[0.2em] text-white">
        Politique de confidentialité
      </h1>
      <p className="mt-4 text-sm text-zinc-400">
        Protection de vos données personnelles conformément au Règlement Général sur
        la Protection des Données (RGPD, UE 2016/679) et à la loi Informatique et
        Libertés n° 78-17 du 6 janvier 1978 modifiée.
      </p>

      <article className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-200">
        <Block title="1. Responsable du traitement">
          <p>
            Le responsable du traitement des données est l&apos;association{' '}
            <strong className="text-white">Pretoria MMA</strong> (association loi
            1901). Pour toute question relative à vos données, vous pouvez nous
            contacter par email à{' '}
            <a
              href="mailto:pretoriamma94@gmail.com"
              className="text-primary hover:underline"
            >
              pretoriamma94@gmail.com
            </a>{' '}
            ou par téléphone au{' '}
            <a href="tel:+33619845786" className="text-zinc-100 hover:text-primary">
              06 19 84 57 86
            </a>
            .
          </p>
        </Block>

        <Block title="2. Données que nous collectons">
          <p>Dans le cadre des inscriptions et de la vie du club, nous collectons :</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-zinc-300">
            <li>
              <strong className="text-white">Identité :</strong> prénom, nom, date de
              naissance.
            </li>
            <li>
              <strong className="text-white">Coordonnées :</strong> adresse postale,
              email, numéro de téléphone.
            </li>
            <li>
              <strong className="text-white">Données du représentant légal</strong>{' '}
              (pour les adhérents mineurs) : nom, prénom, téléphone et autorisations
              parentales.
            </li>
            <li>
              <strong className="text-white">Données de santé :</strong> certificat
              médical de non contre-indication à la pratique du MMA. Ces données
              sensibles sont traitées uniquement pour vérifier l&apos;aptitude à la
              pratique sportive, avec votre consentement.
            </li>
            <li>
              <strong className="text-white">Photographie d&apos;identité</strong> et,
              le cas échéant, mensurations (taille, poids) et taille de tenue.
            </li>
            <li>
              <strong className="text-white">Données de paiement :</strong> mode de
              règlement, nombre d&apos;échéances et montants perçus (le paiement
              s&apos;effectue au club ; aucune donnée bancaire n&apos;est saisie sur
              le site).
            </li>
            <li>
              <strong className="text-white">Messages</strong> envoyés via le
              formulaire de contact.
            </li>
          </ul>
        </Block>

        <Block title="3. Finalités et bases légales">
          <ul className="list-disc space-y-1.5 pl-5 text-zinc-300">
            <li>
              <strong className="text-white">Gérer les adhésions et inscriptions</strong>{' '}
              (exécution du contrat d&apos;adhésion / mesures précontractuelles).
            </li>
            <li>
              <strong className="text-white">Vérifier l&apos;aptitude médicale</strong>{' '}
              et respecter nos obligations d&apos;encadrement sportif (consentement et
              obligation légale).
            </li>
            <li>
              <strong className="text-white">Assurer le suivi administratif et
              comptable</strong> des cotisations (obligation légale).
            </li>
            <li>
              <strong className="text-white">Communiquer avec les adhérents</strong>{' '}
              (informations sur les cours, actualités du club) — intérêt légitime ou
              consentement.
            </li>
            <li>
              <strong className="text-white">Répondre aux demandes</strong> reçues via
              le formulaire de contact (intérêt légitime).
            </li>
          </ul>
        </Block>

        <Block title="4. Destinataires des données">
          <p>
            Vos données sont destinées exclusivement aux membres habilités du bureau
            de l&apos;association. Elles ne sont ni vendues, ni cédées à des tiers à
            des fins commerciales. Nous faisons appel à des sous-traitants techniques
            agissant pour notre compte :
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-zinc-300">
            <li>
              <strong className="text-white">Supabase</strong> — hébergement de la
              base de données et des documents (infrastructure située dans
              l&apos;Union européenne).
            </li>
            <li>
              <strong className="text-white">Resend</strong> — envoi des emails
              transactionnels (confirmations, notifications).
            </li>
            <li>
              <strong className="text-white">Vercel</strong> — hébergement du site.
            </li>
          </ul>
        </Block>

        <Block title="5. Durée de conservation">
          <ul className="list-disc space-y-1.5 pl-5 text-zinc-300">
            <li>
              Données d&apos;adhésion : conservées pendant la durée de
              l&apos;adhésion, puis archivées jusqu&apos;à{' '}
              <strong className="text-white">3 ans</strong> après le dernier contact.
            </li>
            <li>
              Certificats médicaux : conservés le temps de la saison sportive
              concernée, puis supprimés.
            </li>
            <li>
              Documents comptables : conservés{' '}
              <strong className="text-white">10 ans</strong> conformément aux
              obligations légales.
            </li>
            <li>
              Messages de contact : conservés jusqu&apos;à{' '}
              <strong className="text-white">1 an</strong> après traitement.
            </li>
          </ul>
        </Block>

        <Block title="6. Sécurité">
          <p>
            L&apos;accès aux données est protégé par authentification et restreint aux
            personnes habilitées. Les échanges avec le site sont chiffrés via HTTPS
            (TLS). La base de données applique des règles de sécurité au niveau des
            lignes (Row Level Security) afin de cloisonner l&apos;accès aux données.
          </p>
        </Block>

        <Block title="7. Vos droits">
          <p>
            Conformément au RGPD, vous disposez des droits suivants sur vos données :
            droit d&apos;accès, de rectification, d&apos;effacement, de limitation,
            d&apos;opposition, et de portabilité. Pour les mineurs, ces droits sont
            exercés par le représentant légal.
          </p>
          <p className="mt-3">
            Pour exercer ces droits, contactez-nous à{' '}
            <a
              href="mailto:pretoriamma94@gmail.com"
              className="text-primary hover:underline"
            >
              pretoriamma94@gmail.com
            </a>
            . Vous pouvez également introduire une réclamation auprès de la CNIL{' '}
            (Commission Nationale de l&apos;Informatique et des Libertés,{' '}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              www.cnil.fr
            </a>
            ).
          </p>
        </Block>

        <Block title="8. Cookies">
          <p>
            L&apos;utilisation des cookies sur ce site est détaillée dans notre{' '}
            <Link href="/cookies" className="text-primary hover:underline">
              politique de gestion des cookies
            </Link>
            .
          </p>
        </Block>
      </article>

      <p className="mt-8 text-xs text-zinc-500">
        Dernière mise à jour : {LAST_UPDATE}.
      </p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
      <h2 className="font-display text-lg uppercase tracking-[0.15em] text-white">
        {title}
      </h2>
      <div className="mt-4 space-y-3 text-zinc-300">{children}</div>
    </section>
  );
}
