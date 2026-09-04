import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthUser, isAdminUser } from '@/lib/supabase/auth';
import { ManualInscriptionForm } from './ManualInscriptionForm';

export default async function NouvelleInscriptionAdminPage() {
  const user = await getAuthUser();
  if (!user || !isAdminUser(user)) {
    redirect('/admin/login');
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <nav className="text-xs uppercase tracking-wide text-zinc-500">
        <Link href="/admin/inscriptions" className="hover:text-zinc-300">
          Inscriptions
        </Link>
        <span className="mx-2 text-zinc-700">/</span>
        <span className="text-zinc-300">Nouvelle (papier)</span>
      </nav>

      <h1 className="mt-4 font-display text-3xl uppercase tracking-[0.2em] text-white">
        Inscription manuelle
      </h1>
      <p className="mt-3 text-sm text-zinc-400">
        Mêmes informations que l’inscription en ligne. À la validation, le même email de
        confirmation est envoyé à l’adresse saisie (lien documents + HelloAsso). Indiquez aussi
        le mode de paiement et l’éventuel montant déjà encaissé.
      </p>

      <div className="mt-8">
        <ManualInscriptionForm />
      </div>
    </div>
  );
}
