'use client';
import Link from 'next/link';
import { CompanyList, PageHead } from '@/components/CompanyList';

export default function Page() {
  return (
    <>
      <PageHead title="Empresas encontradas" text="Todas las empresas localizadas. Selecciona varias para investigarlas, analizarlas o pasarlas al pipeline.">
        <a className="btn" href="/api/export/companies.csv">Exportar CSV</a>
        <Link className="btn primary" href="/buscar">Buscar más</Link>
      </PageHead>
      <CompanyList preset={{ sort: 'reciente' }} emptyTitle="No hay empresas con estos filtros" emptyText="Prueba a quitar algún filtro o haz una búsqueda nueva." />
    </>
  );
}
