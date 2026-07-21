import Link from 'next/link';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export default function AdminForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl uppercase tracking-[0.2em] text-white">
        Mot de passe oublié
      </h1>
      <p className="mt-3 text-sm text-zinc-400">
        Saisissez l&apos;adresse e-mail du compte administrateur. Vous recevrez un lien pour
        définir un nouveau mot de passe.
      </p>
      <p className="mt-2 text-xs text-zinc-500">
        Première connexion ? Utilisez aussi ce formulaire pour créer votre mot de passe.
      </p>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href="/admin/login" className="text-red-400 hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
