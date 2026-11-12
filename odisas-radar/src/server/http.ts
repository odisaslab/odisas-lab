import 'server-only';
import { NextResponse } from 'next/server';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

export async function readJson<T>(req: Request, maxBytes = 6 * 1024 * 1024): Promise<T> {
  if (Number(req.headers.get('content-length') ?? 0) > maxBytes) throw new HttpError(413, 'Petición demasiado grande.');
  try {
    return (await req.json()) as T;
  } catch {
    throw new HttpError(400, 'JSON no válido.');
  }
}

export const str = (v: unknown, max = 500) => (v == null ? '' : String(v).trim().slice(0, max));
