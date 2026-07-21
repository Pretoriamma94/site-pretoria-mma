import { ContactForm } from '@/components/ContactForm';

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <div className="grid gap-10 md:grid-cols-[3fr,2fr]">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-[0.2em] text-white md:text-4xl">
            Contact
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-300">
            Une question sur les cours, les inscriptions ou les compétitions ? Écrivez-nous, nous
            vous répondrons rapidement.
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>

        <aside className="space-y-6 text-sm text-zinc-300">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
              Coordonnées du club
            </h2>
            <p className="mt-2 text-zinc-300">
              Pretoria MMA La Queue-en-Brie
              <br />
              Gymnase Pierre de Coubertin
              <br />
              94510 La Queue-en-Brie
            </p>
            <p className="mt-2 text-zinc-300">
              Halles des Violettes
              <br />
              94510 La Queue-en-Brie
            </p>
            <p className="mt-2 text-zinc-300">
              Tél :{' '}
              <a href="tel:+33619845786" className="text-white underline-offset-2 hover:underline">
                06 19 84 57 86
              </a>
              <br />
              Email :{' '}
              <a
                href="mailto:pretoriamma94@gmail.com"
                className="text-white underline-offset-2 hover:underline"
              >
                pretoriamma94@gmail.com
              </a>
            </p>
            <p className="mt-2 text-zinc-300">
              Instagram :{' '}
              <a
                href="https://www.instagram.com/pretoria_mma/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mma-red hover:underline"
              >
                @pretoria_mma
              </a>
              <br />
              TikTok :{' '}
              <a
                href="https://www.tiktok.com/@pretoria86"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mma-red hover:underline"
              >
                @pretoria86
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
              Accès
            </h2>
            <p className="mt-2 text-zinc-300">
              Salle accessible en voiture (parking à proximité) et en transports en commun.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}