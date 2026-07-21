import Link from 'next/link';
import { ResetPasswordForm } from './ResetPasswordForm';

export default function AdminResetPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl uppercase tracking-[0.2em] text-white">
        Nouveau mot de passe
      </h1>
      <p className="mt-3 text-sm text-zinc-400">
        Choisissez un mot de passe personnel pour accéder à l&apos;espace administration.
      </p>
      <ResetPasswordForm />
      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href="/admin/login" className="text-red-400 hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
