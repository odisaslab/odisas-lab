/**
 * Marca visible de dato pendiente. Nunca se inventa un valor legal:
 * si falta, se ve.
 */
export function Pending({ label, value }: { label: string; value: string }) {
  if (value.trim().length > 0) return <>{value}</>;

  return (
    <mark className="rounded bg-primary-soft px-1.5 py-0.5 font-medium text-primary-ink">
      [COMPLETAR: {label}]
    </mark>
  );
}
