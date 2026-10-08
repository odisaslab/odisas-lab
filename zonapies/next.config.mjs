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
  // URLs de la web anterior que se han podido identificar (búsqueda web). Conservan el SEO.
  // PENDIENTE: completar con el resto de URLs antiguas (plantillas y materiales, sistemas de
  // fabricación, franquiciados, formación, contacto, acceso de clientes) cuando se pueda
  // rastrear zonapies.es o su sitemap.xml.
  async redirects() {
    return [
      { source: '/quienes-somos', destination: '/nosotros', permanent: true },
      { source: '/quienes-somos/', destination: '/nosotros', permanent: true },
      { source: '/productos', destination: '/plantillas', permanent: true },
      { source: '/productos/', destination: '/plantillas', permanent: true },
      { source: '/condiciones-de-uso', destination: '/aviso-legal', permanent: true },
      { source: '/condiciones-de-uso/', destination: '/aviso-legal', permanent: true },
    ];
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
