import { inscriptionInputClass } from '@/app/inscription/form-values';

type Props = {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
};

export function InscriptionField({ label, error, children, className }: Props) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm text-zinc-300">{label}</label>
      {children}
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}

export { inscriptionInputClass };
