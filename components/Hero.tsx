import { motion } from 'framer-motion';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-800 bg-gradient-to-b from-black via-zinc-900/80 to-black">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(37,99,235,0.24),_transparent_55%)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:flex-row md:items-center md:py-24 md:px-6">
        <div className="flex-1 space-y-6">
          <motion.h1
            className="font-display text-4xl uppercase tracking-[0.2em] text-white sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Pretoria MMA
          </motion.h1>
          <motion.p
            className="max-w-xl text-lg font-medium text-white md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            Le Club de MMA à La Queue-en-Brie (94)
          </motion.p>
          <motion.p
            className="max-w-xl text-sm text-zinc-300 md:text-base"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Progressez en Arts Martiaux Mixtes, quel que soit votre niveau — dès 3 ans
          </motion.p>
          <motion.div
            className="flex flex-col items-start gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-red-900/40 transition hover:bg-red-700"
              >
                1er COURS OFFERT
              </Link>
              <Link
                href="/le-club"
                className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-600 bg-transparent px-6 text-sm font-semibold uppercase tracking-wide text-zinc-50 transition hover:border-zinc-400 hover:bg-zinc-900"
              >
                Découvrir
              </Link>
            </div>
            <p className="text-sm text-zinc-200">
              1er cours d&apos;essai offert — Débutants bienvenus
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-300 md:text-sm">
              <li className="inline-flex items-center gap-1.5">
                <span className="text-red-400" aria-hidden>
                  ✔
                </span>
                Cours d&apos;essai offert
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="text-red-400" aria-hidden>
                  ✔
                </span>
                Coach expérimenté
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="text-red-400" aria-hidden>
                  ✔
                </span>
                + de 50 adhérents
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="text-red-400" aria-hidden>
                  ✔
                </span>
                Enfants · Ados · Adultes
              </li>
            </ul>
          </motion.div>

          <motion.div
            className="mt-4 grid grid-cols-2 gap-4 text-xs text-zinc-300 sm:flex sm:flex-wrap sm:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div>
              <p className="font-semibold text-white">Enfants & adultes</p>
              <p>Cours adaptés à chaque niveau et âge.</p>
            </div>
            <div>
              <p className="font-semibold text-white">Préparation physique</p>
              <p>Renforcement, mobilité, explosivité.</p>
            </div>
            <div>
              <p className="font-semibold text-white">Compétition</p>
              <p>Accompagnement des combattants licenciés.</p>
            </div>
            <div>
              <p className="font-semibold text-white">Ambiance familiale</p>
              <p>Respect, bienveillance et exigence.</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="relative mt-4 flex-1 md:mt-0"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative h-64 overflow-hidden rounded-3xl border border-red-500/40 bg-[url('/images/mma-hero.jpg')] bg-cover bg-center shadow-[0_0_120px_rgba(248,113,113,0.55)] md:h-80">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent" />
          </div>
          <div className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full border border-red-400/60 bg-red-500/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 right-0 h-28 w-28 rounded-full border border-sky-400/60 bg-sky-500/20 blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
}
