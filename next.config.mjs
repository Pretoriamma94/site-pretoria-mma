/** @type {import('next').NextConfig} */

/**
 * En-têtes de sécurité appliqués à toutes les routes.
 * - HSTS force le navigateur à n'utiliser que HTTPS (protège la connexion SSL/TLS).
 * - Les autres en-têtes limitent le clickjacking, le sniffing MIME et les fuites de referrer.
 */
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      // Par défaut Next.js limite le body d'une Server Action à 1 Mo.
      // Les uploads de photos (actualités, documents d'inscription) dépassent
      // vite cette limite -> requête rejetée avant l'exécution de l'action,
      // ce qui provoquait un écran d'erreur client sans message exploitable.
      // 4 Mo = marge maximale sûre sous la limite plateforme Vercel (~4,5 Mo).
      bodySizeLimit: '4mb',
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
