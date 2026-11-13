import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // RADAR vive en una subcarpeta del repositorio de la web: se fija su propia raíz para que
  // no herede la configuración (PostCSS, Tailwind) del proyecto de la carpeta superior.
  turbopack: { root: import.meta.dirname },
  outputFileTracingRoot: import.meta.dirname,
  poweredByHeader: false,
  // Paquetes de servidor que no deben empaquetarse (binarios WASM y drivers).
  serverExternalPackages: ['@electric-sql/pglite', 'pg', 'nodemailer'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Herramienta interna: que ningún buscador la indexe.
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
};

export default nextConfig;
