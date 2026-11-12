import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import type { z } from 'zod';
import { anthropicKey, getSettings } from '../settings';

/** Acceso a Claude. La clave vive en el servidor (variable de entorno o ajuste cifrado). */

export class AiError extends Error {}

let cached: { key: string; sdk: Anthropic } | null = null;

export async function aiClient(): Promise<{ sdk: Anthropic; model: string } | null> {
  const key = await anthropicKey();
  if (!key) return null;
  if (!cached || cached.key !== key) cached = { key, sdk: new Anthropic({ apiKey: key, maxRetries: 2, ...(process.env.ANTHROPIC_BASE_URL ? { baseURL: process.env.ANTHROPIC_BASE_URL } : {}) }) };
  return { sdk: cached.sdk, model: (await getSettings()).aiModel };
}

export const aiAvailable = async () => !!(await anthropicKey());

function describe(error: unknown): string {
  if (error instanceof Anthropic.AuthenticationError) return 'La clave de la API de Anthropic no es válida.';
  if (error instanceof Anthropic.PermissionDeniedError) return 'La clave de Anthropic no tiene permiso para usar este modelo.';
  if (error instanceof Anthropic.NotFoundError) return 'El modelo de IA configurado no existe o no está disponible para esta cuenta.';
  if (error instanceof Anthropic.RateLimitError) return 'Se ha alcanzado el límite de uso de la API de Anthropic. Inténtalo en unos minutos.';
  if (error instanceof Anthropic.APIConnectionError) return 'No se ha podido conectar con la API de Anthropic.';
  if (error instanceof Anthropic.APIError) return `La API de Anthropic ha devuelto un error (${error.status ?? 's/n'}).`;
  return error instanceof Error ? error.message : 'Error desconocido de la IA.';
}

/** Petición con salida estructurada: la respuesta cumple el esquema o se lanza AiError. */
export async function structured<S extends z.ZodType>(schema: S, system: string, user: string, opts: { maxTokens?: number; effort?: 'low' | 'medium' | 'high' } = {}): Promise<{ data: z.infer<S>; model: string }> {
  const ai = await aiClient();
  if (!ai) throw new AiError('La IA no está configurada.');
  try {
    const message = await ai.sdk.messages.parse({
      model: ai.model,
      max_tokens: opts.maxTokens ?? 8000,
      system,
      messages: [{ role: 'user', content: user }],
      output_config: { effort: opts.effort ?? 'medium', format: zodOutputFormat(schema) },
    });
    if (message.stop_reason === 'refusal') throw new AiError('El modelo ha declinado esta petición.');
    if (message.stop_reason === 'max_tokens' || !message.parsed_output) throw new AiError('La respuesta de la IA quedó incompleta.');
    return { data: message.parsed_output as z.infer<S>, model: message.model };
  } catch (error) {
    if (error instanceof AiError) throw error;
    throw new AiError(describe(error));
  }
}

/** Investigación con búsqueda web de Anthropic: devuelve el texto final y las páginas citadas. */
export async function webResearch(system: string, user: string, maxSearches = 5): Promise<{ text: string; sources: { url: string; title: string }[]; model: string }> {
  const ai = await aiClient();
  if (!ai) throw new AiError('La IA no está configurada.');
  try {
    const messages: Anthropic.MessageParam[] = [{ role: 'user', content: user }];
    let message: Anthropic.Message | null = null;
    for (let turn = 0; turn < 4; turn++) {
      message = await ai.sdk.messages.create({
        model: ai.model,
        max_tokens: 8000,
        system,
        messages,
        tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: maxSearches, user_location: { type: 'approximate', country: 'ES', timezone: 'Europe/Madrid' } }],
        output_config: { effort: 'medium' },
      });
      if (message.stop_reason !== 'pause_turn') break;
      messages.push({ role: 'assistant', content: message.content });
    }
    if (!message || message.stop_reason === 'refusal') throw new AiError('El modelo ha declinado esta petición.');
    const sources = new Map<string, string>();
    let text = '';
    for (const block of message.content) {
      if (block.type === 'text') text += block.text;
      if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) for (const r of block.content) if (r.type === 'web_search_result') sources.set(r.url, r.title);
    }
    return { text, sources: [...sources].map(([url, title]) => ({ url, title })), model: message.model };
  } catch (error) {
    if (error instanceof AiError) throw error;
    throw new AiError(describe(error));
  }
}

/** Extrae el último bloque JSON de un texto (la búsqueda web no admite salida estructurada). */
export function extractJson<T>(text: string): T | null {
  const fenced = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)].map((m) => m[1]);
  const candidates = [...fenced.reverse(), text.slice(text.indexOf('['), text.lastIndexOf(']') + 1), text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)];
  for (const c of candidates) {
    try {
      if (c.trim()) return JSON.parse(c) as T;
    } catch {
      /* se prueba con el siguiente candidato */
    }
  }
  return null;
}
