'use client';
import { CompanyList, PageHead } from '@/components/CompanyList';

export default function Page() {
  return (
    <>
      <PageHead title="Análisis de oportunidades" text="Empresas ya analizadas: qué se ha comprobado, qué servicios encajan y por qué podrían estar interesadas. Abre una empresa para ver el informe completo." />
      <CompanyList view="analisis" preset={{ analyzed: '1' }} emptyTitle="Aún no hay empresas analizadas" emptyText="Selecciona empresas en «Empresas encontradas» y pulsa «Investigar y analizar»." />
    </>
  );
}
