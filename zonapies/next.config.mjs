import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // El repo contiene otra app (Odisas Lab) con su propio lockfile: se fija la raíz de esta
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ['nodemailer'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // URLs de la web anterior (WordPress). Las 7 primeras son las de su page-sitemap.xml (08/10/2026);
  // las 3 últimas aparecían en buscadores. Conservan el SEO. «sistema-de-fabricacion» se envía a
  // /tecnologia; si su contenido encaja mejor en /plantillas, cambiar el destino aquí.
  async redirects() {
    const moved = [
      ['/sobre-nosotros', '/nosotros'],
      ['/plantillas-ortopedicas-a-medida', '/plantillas'],
      ['/sistema-de-fabricacion', '/tecnologia'],
      ['/franciciados', '/franquicias'], // sic: así está escrita la URL original
      ['/quienes-somos', '/nosotros'],
      ['/productos', '/plantillas'],
      ['/condiciones-de-uso', '/aviso-legal'],
    ];
    return moved.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
