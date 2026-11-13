'use client';
import { CompanyList, PageHead } from '@/components/CompanyList';

export default function Page() {
  return (
    <>
      <PageHead title="Empresas prioritarias" text="Las de prioridad alta y muy alta según el RADAR SCORE (65 puntos o más), con su siguiente paso." />
      <CompanyList view="prioritarias" preset={{ priority: 'muy_alta,alta' }} emptyTitle="Ninguna empresa prioritaria todavía" emptyText="Aparecerán aquí cuando el análisis les dé 65 puntos o más." />
    </>
  );
}
