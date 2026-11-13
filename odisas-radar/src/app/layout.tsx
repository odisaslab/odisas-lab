import type { Metadata, Viewport } from 'next';
import '@/styles/app.css';

export const metadata: Metadata = {
  title: 'ODISAS RADAR',
  description: 'Búsqueda, análisis y captación de clientes potenciales de Odisas Lab.',
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: '#0a0a0b', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
