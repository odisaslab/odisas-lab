/**
 * Límite de peticiones en memoria, por clave (normalmente la IP).
 * Frena abusos básicos. Cada instancia serverless tiene su propio contador, así que si
 * la web crece conviene sustituirlo por Upstash Redis o similar.
 */
export function createLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();

  /** Devuelve true si la petición está permitida (y la registra). */
  return function allowed(key: string): boolean {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
    if (recent.length >= max) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);

    // Limpieza para que el mapa no crezca indefinidamente
    if (hits.size > 500) {
      for (const [k, times] of hits) {
        if (times.every((time) => now - time > windowMs)) hits.delete(k);
      }
    }
    return true;
  };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "desconocida";
}
