/** Tipos y catálogos compartidos entre servidor e interfaz. */

// ——— Servicios de Odisas Lab ———
export const SERVICES = {
  web: 'Desarrollo y diseño de páginas web',
  software: 'Aplicaciones y software a medida',
  ia: 'Implementación de inteligencia artificial',
  automatizacion: 'Automatización de procesos',
  procesos: 'Estudio de mejora de procesos productivos',
  digitalizacion: 'Digitalización y optimización del negocio',
} as const;
export type ServiceId = keyof typeof SERVICES;
export const SERVICE_IDS = Object.keys(SERVICES) as ServiceId[];

// ——— Tipo de empresa ———
export const CATEGORIES = {
  industrial: 'Industrial',
  distribucion: 'Distribución',
  comercial: 'Comercial',
  servicios: 'Servicios',
  otro: 'Otro',
} as const;
export type Category = keyof typeof CATEGORIES;

export const SIZE_BANDS = {
  micro: 'Micro (1-9)',
  pequena: 'Pequeña (10-49)',
  mediana: 'Mediana (50-249)',
  grande: 'Grande (250+)',
} as const;
export type SizeBand = keyof typeof SIZE_BANDS;

export function sizeBandOf(employees: number | null | undefined): SizeBand | null {
  if (employees == null || !Number.isFinite(employees) || employees <= 0) return null;
  if (employees < 10) return 'micro';
  if (employees < 50) return 'pequena';
  if (employees < 250) return 'mediana';
  return 'grande';
}

// ——— Estado comercial ———
export const STATUSES = {
  nueva: 'Nueva empresa',
  pendiente_investigar: 'Pendiente de investigar',
  analizada: 'Empresa analizada',
  pendiente_contactar: 'Pendiente de contactar',
  primer_contacto: 'Primer contacto realizado',
  pendiente_respuesta: 'Pendiente de respuesta',
  reunion_propuesta: 'Reunión propuesta',
  reunion_concertada: 'Reunión concertada',
  presupuesto_enviado: 'Presupuesto enviado',
  negociacion: 'Negociación',
  cliente: 'Cliente conseguido',
  perdida: 'Oportunidad perdida',
  descartada: 'Descartada',
} as const;
export type Status = keyof typeof STATUSES;
export const STATUS_IDS = Object.keys(STATUSES) as Status[];
/** Estados en los que hay una conversación comercial abierta y debe haber seguimiento. */
export const ACTIVE_STATUSES: Status[] = ['pendiente_contactar', 'primer_contacto', 'pendiente_respuesta', 'reunion_propuesta', 'reunion_concertada', 'presupuesto_enviado', 'negociacion'];
export const CONTACTED_STATUSES: Status[] = ['primer_contacto', 'pendiente_respuesta', 'reunion_propuesta', 'reunion_concertada', 'presupuesto_enviado', 'negociacion', 'cliente', 'perdida'];
export const PIPELINE_COLUMNS: Status[] = ['pendiente_contactar', 'primer_contacto', 'pendiente_respuesta', 'reunion_propuesta', 'reunion_concertada', 'presupuesto_enviado', 'negociacion', 'cliente'];

export const PRIORITIES = { muy_alta: 'Muy alta', alta: 'Alta', media: 'Media', baja: 'Baja' } as const;
export type Priority = keyof typeof PRIORITIES;

export const WEB_STATUSES = {
  sin_web: 'Sin página web',
  caida: 'Web caída o inaccesible',
  desactualizada: 'Web desactualizada',
  mejorable: 'Web mejorable',
  correcta: 'Web correcta',
  desconocido: 'Sin comprobar',
} as const;
export type WebStatus = keyof typeof WEB_STATUSES;

// ——— Procedencia de cada dato (RGPD y fiabilidad) ———
export type FactStatus = 'verificado' | 'estimado' | 'no_encontrado';
export interface Fact {
  value: string;
  status: FactStatus;
  /** Fuente legible: «Web de la empresa», «OpenStreetMap», «Introducido a mano»… */
  source: string;
  url?: string;
  at: string;
}
export type Facts = Record<string, Fact>;
/** Campos sobre los que se registra procedencia y se mide la calidad de la información. */
export const FACT_FIELDS = {
  name: 'Nombre comercial',
  legalName: 'Razón social',
  taxId: 'CIF',
  sector: 'Sector',
  activity: 'Actividad',
  description: 'Descripción',
  address: 'Dirección',
  city: 'Ciudad',
  province: 'Provincia',
  website: 'Página web',
  email: 'Correo corporativo',
  phone: 'Teléfono',
  contactForm: 'Formulario de contacto',
  socials: 'Redes sociales',
  employees: 'Número de empleados',
  sizeBand: 'Tamaño aproximado',
  branches: 'Sedes o delegaciones',
} as const;
export type FactField = keyof typeof FACT_FIELDS;

// ——— Señales técnicas observadas en la web ———
export interface SiteSignals {
  https: boolean;
  responsive: boolean;
  copyrightYear: number | null;
  generator: string | null;
  ecommerce: boolean;
  chat: boolean;
  whatsapp: boolean;
  form: boolean;
  analytics: boolean;
  booking: boolean;
  clientArea: boolean;
  catalogPdf: boolean;
  careers: boolean;
  languages: number;
  wordCount: number;
}

export interface WebAudit {
  url: string;
  checkedAt: string;
  ok: boolean;
  error?: string;
  robotsBlocked?: boolean;
  score?: number;
  categories?: { id: string; label: string; score: number }[];
  issues?: { severity: string; title: string; evidence: string; category: string }[];
  signals?: SiteSignals;
  title?: string;
  metaDescription?: string;
  /** Texto visible de la portada (recortado), base del análisis. */
  text?: string;
  pages?: string[];
  hash?: string;
  responseMs?: number;
}

// ——— Informe de oportunidad ———
export interface Rating {
  value: number;
  reason: string;
}
export interface Report {
  engine: 'ia' | 'reglas';
  model?: string;
  createdAt: string;
  description: string;
  /** Hechos comprobados en fuentes públicas. */
  observed: { title: string; evidence: string }[];
  /** Hipótesis: hay que validarlas en una reunión. */
  hypotheses: { title: string; rationale: string; validate: string }[];
  problems: string[];
  services: { id: ServiceId; fit: 'alto' | 'medio' | 'bajo'; why: string }[];
  whyInterested: string;
  proposal: string;
  missing: string[];
  ratings: { fit: Rating; need: Rating; potential: Rating; urgency: Rating };
  flags: { automation: boolean; ai: boolean };
  nextAction: string;
}

export interface ScoreData {
  total: number;
  priority: Priority;
  components: { id: string; label: string; weight: number; value: number; points: number; reason: string }[];
  /** Fiabilidad del análisis según los datos disponibles: no forma parte del potencial comercial. */
  confidence: 'alta' | 'media' | 'baja';
  explanation: string[];
}

export interface Company {
  id: string;
  name: string;
  legalName: string;
  taxId: string;
  category: Category;
  sector: string;
  activity: string;
  description: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  lat: number | null;
  lon: number | null;
  website: string;
  domain: string;
  email: string;
  phone: string;
  contactFormUrl: string;
  socials: Record<string, string>;
  employees: number | null;
  sizeBand: SizeBand | null;
  branches: number;
  status: Status;
  score: number | null;
  priority: Priority | null;
  webStatus: WebStatus;
  oppAutomation: boolean;
  oppAi: boolean;
  source: string;
  sourceRef: string;
  doNotContact: boolean;
  archived: boolean;
  archiveReason: string;
  inCrm: boolean;
  crmId: string;
  crmSyncedAt: string | null;
  contactPerson: string;
  lastChannel: string;
  lastContactAt: string | null;
  nextFollowupAt: string | null;
  nextAction: string;
  notes: string;
  facts: Facts;
  audit: WebAudit | null;
  report: Report | null;
  scoreData: ScoreData | null;
  createdAt: string;
  updatedAt: string;
  researchedAt: string | null;
  analyzedAt: string | null;
}

/** Empresa candidata devuelta por un proveedor de datos, antes de guardarla. */
export interface Candidate {
  name: string;
  legalName?: string;
  category?: Category;
  sector?: string;
  activity?: string;
  description?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  lat?: number | null;
  lon?: number | null;
  website?: string;
  email?: string;
  phone?: string;
  employees?: number | null;
  branches?: number;
  socials?: Record<string, string>;
  source: string;
  sourceRef?: string;
  sourceUrl?: string;
  /** Si los datos proceden de una fuente estructurada fiable o son una estimación. */
  reliability: 'verificado' | 'estimado';
}

export interface SearchQuery {
  text?: string;
  name?: string;
  sector?: string;
  activity?: string;
  location?: string;
  province?: string;
  city?: string;
  category?: Category | '';
  size?: SizeBand | '';
  minEmployees?: number;
  web?: 'cualquiera' | 'con_web' | 'sin_web';
  limit?: number;
}

export interface Contact {
  id: string;
  companyId: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  linkedin: string;
  source: string;
  sourceUrl: string;
  notes: string;
  createdAt: string;
}

export const ACTIVITY_TYPES = {
  llamada: 'Llamada',
  correo: 'Correo',
  linkedin: 'LinkedIn',
  reunion: 'Reunión',
  nota: 'Nota',
  respuesta: 'Respuesta recibida',
  estado: 'Cambio de estado',
  sistema: 'Sistema',
} as const;
export type ActivityType = keyof typeof ACTIVITY_TYPES;
export interface Activity {
  id: string;
  companyId: string;
  type: ActivityType;
  summary: string;
  body: string;
  data: Record<string, unknown> | null;
  at: string;
  userId: string | null;
  userName?: string;
}

export interface Task {
  id: string;
  companyId: string | null;
  companyName?: string;
  title: string;
  dueAt: string | null;
  done: boolean;
  origin: string;
  createdAt: string;
}

export const MESSAGE_KINDS = {
  email: 'Correo comercial',
  seguimiento: 'Mensaje de seguimiento',
  llamada: 'Guion de llamada',
  linkedin: 'Mensaje de LinkedIn',
  reunion: 'Propuesta de reunión',
  resumen: 'Resumen para preparar una llamada',
} as const;
export type MessageKind = keyof typeof MESSAGE_KINDS;
export interface Message {
  id: string;
  companyId: string;
  companyName?: string;
  kind: MessageKind;
  subject: string;
  body: string;
  status: 'borrador' | 'enviado';
  engine: 'ia' | 'plantilla';
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
}

export const SIGNAL_TYPES = {
  nueva_empresa: 'Empresa nueva en la zona',
  cambio_web: 'Cambio importante en la web',
  contratando: 'Está contratando personal',
  crecimiento: 'Crecimiento o ampliación',
  inversion: 'Nueva inversión',
  instalaciones: 'Nuevas instalaciones',
  necesidad_tecnologica: 'Necesidad tecnológica publicada',
  noticia: 'Noticia relevante',
} as const;
export type SignalType = keyof typeof SIGNAL_TYPES;
export interface Signal {
  id: string;
  companyId: string | null;
  companyName?: string;
  type: SignalType;
  title: string;
  detail: string;
  source: string;
  url: string;
  reliability: 'verificado' | 'estimado';
  detectedAt: string;
  dismissed: boolean;
}

export const AUTOMATION_TYPES = {
  busqueda: 'Buscar, investigar y puntuar empresas',
  seguimiento: 'Avisar de oportunidades sin seguimiento',
  senales: 'Detectar señales en empresas guardadas',
  informe: 'Preparar informe de captación',
} as const;
export type AutomationType = keyof typeof AUTOMATION_TYPES;
export const FREQUENCIES = { diaria: 'Cada día', semanal: 'Cada semana', mensual: 'Cada mes' } as const;
export type Frequency = keyof typeof FREQUENCIES;
export interface AutomationConfig {
  query?: SearchQuery;
  provider?: string;
  research?: boolean;
  analyze?: boolean;
  /** Las empresas por debajo se archivan y no vuelven a procesarse. */
  minScore?: number;
  createTasks?: boolean;
  /** Señales: cuántas empresas revisar por ejecución y si se buscan noticias con IA. */
  maxCompanies?: number;
  news?: boolean;
}
export interface Automation {
  id: string;
  name: string;
  type: AutomationType;
  frequency: Frequency;
  enabled: boolean;
  config: AutomationConfig;
  lastRunAt: string | null;
  nextRunAt: string | null;
  lastResult: string;
  createdAt: string;
}

export type Role = 'admin' | 'comercial';
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}
