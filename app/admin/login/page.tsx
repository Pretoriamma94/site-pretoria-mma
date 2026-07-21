import { LoginForm } from './LoginForm';

type SearchParams = Promise<{ error?: string }>;

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const initialError =
    params.error === 'forbidden'
      ? "Ce compte n'a pas les droits administrateur."
      : params.error === 'auth'
        ? 'Lien de connexion invalide ou expiré. Demandez un nouveau lien.'
        : null;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl uppercase tracking-[0.2em] text-white">
        Administration
      </h1>
      <p className="mt-3 text-sm text-zinc-400">
        Connectez-vous avec le compte administrateur du club.
      </p>
      <LoginForm initialError={initialError} />
    </div>
  );
}
