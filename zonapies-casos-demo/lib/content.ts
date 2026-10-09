/**
 * Contenidos de la demo: casos ficticios, datos ilustrativos, guion y textos de transparencia.
 * Regla: ninguna cifra de ahorro, mejora, plazo ni resultado «esperado». Los números del panel
 * son EJEMPLOS y la interfaz los rotula como tales.
 */
import type { CaseState, View } from "./domain";
import { STATE_RANK } from "./domain";

export const DEMO_NOTICE = "DEMO · datos y análisis simulados";
export const EXAMPLE_NOTICE = "Ejemplo ilustrativo · no son datos de Zona Pies";

export interface SeedCase {
  code: string;
  lado: "derecho" | "izquierdo";
  material: string;
  state: CaseState;
  clinic: string;
  since: string;
}

/** Casos ficticios de la lista del laboratorio (solo el caso de la demo es interactivo). */
export const SEED_CASES: SeedCase[] = [
  { code: "ZP-0417", lado: "izquierdo", material: "EVA", state: "expedido", clinic: "Centro Ejemplo Este", since: "hace 5 h" },
  { code: "ZP-0416", lado: "derecho", material: "PA11", state: "control_calidad", clinic: "Clínica Ejemplo Norte", since: "hace 2 h" },
  { code: "ZP-0415", lado: "derecho", material: "Fibra de carbono", state: "validado", clinic: "Podología Ejemplo Sur", since: "hace 40 min" },
  { code: "ZP-0414", lado: "izquierdo", material: "Resina", state: "escaneo_a_repetir", clinic: "Clínica Ejemplo Norte", since: "hace 20 min" },
  { code: "ZP-0413", lado: "derecho", material: "EVA", state: "esperando_aclaracion", clinic: "Podología Ejemplo Sur", since: "hace 1 h" },
  { code: "ZP-0412", lado: "izquierdo", material: "PA11", state: "en_fabricacion", clinic: "Clínica Ejemplo Norte", since: "hace 3 h" },
];

/** Agrupación por color de la lista del laboratorio. */
export function labGroup(state: CaseState): "listo" | "espera" | "repetir" | "curso" {
  if (state === "escaneo_a_repetir") return "repetir";
  if (state === "esperando_aclaracion") return "espera";
  const r = STATE_RANK[state];
  if (r >= STATE_RANK.validado && r <= STATE_RANK.diseno_aprobado) return "listo";
  return "curso";
}

/** Datos del panel del dueño: EJEMPLO ILUSTRATIVO. */
export const DASH_EXAMPLE = {
  casosTotales: 40,
  correctosPrimera: 31,
  bucles: 13,
  causas: [
    { id: "escaneo", label: "Escaneo", n: 5 },
    { id: "prescripcion", label: "Prescripción", n: 4 },
    { id: "material", label: "Material", n: 2 },
    { id: "fabricacion", label: "Fabricación", n: 1 },
    { id: "transporte", label: "Transporte", n: 1 },
  ],
  fases: [
    { id: "validacion", label: "Validación del caso", mediana: 1.5, p90: 6 },
    { id: "diseno", label: "Diseño", mediana: 2, p90: 5 },
    { id: "fabricacion", label: "Fabricación", mediana: 20, p90: 36 },
    { id: "envio", label: "Control y envío", mediana: 6, p90: 12 },
  ],
};

export const METRICS_EXPLAINED: { title: string; body: string }[] = [
  {
    title: "Casos correctos a la primera",
    body: "Casos que llegan a producción sin reescaneo, aclaración ni retoque. Es el indicador central: cada bucle consume parte del plazo prometido.",
  },
  {
    title: "Bucles por pedido",
    body: "Cuántas veces vuelve atrás un caso (escaneo repetido, aclaración, retoque o pieza rehecha). Se registra solo con los cambios de estado.",
  },
  {
    title: "Causa de cada bucle",
    body: "Escaneo, prescripción, diseño, material, fabricación o transporte. Una persona confirma la causa; la IA puede sugerirla a partir del texto.",
  },
  {
    title: "Plazo por fase (mediana y percentil 90)",
    body: "La mediana dice lo habitual y el percentil 90 lo que pasa en los casos malos. Para cumplir un plazo importa más el segundo.",
  },
];

export interface TourStep {
  id: string;
  title: string;
  view: View;
  /** Valor de data-tour del elemento a resaltar */
  target: string;
  /** Estado mínimo del caso para que el paso tenga sentido */
  minState: CaseState;
  say: string[];
  ask: string;
}

export const TOUR: TourStep[] = [
  {
    id: "problema",
    title: "El problema de hoy",
    view: "inicio",
    target: "intro-problema",
    minState: "borrador",
    say: [
      "Hoy un caso viaja entre la clínica y el laboratorio por WhatsApp, correo y teléfono.",
      "Si el escaneo sale mal o falta un dato, el laboratorio se entera al recibirlo: llamadas, el paciente vuelve a la consulta y el plazo se estira.",
      "Lo que vais a ver es un revisor a la puerta del laboratorio que lo detecta en el minuto uno.",
    ],
    ask: "¿Os pasa esto? ¿Con qué frecuencia y en qué tipo de casos?",
  },
  {
    id: "crear",
    title: "El profesional crea el caso",
    view: "profesional",
    target: "form-caso",
    minState: "borrador",
    say: [
      "Así lo vería Marta, podóloga de ejemplo, desde el móvil en su consulta.",
      "Son menús para elegir, no un texto largo. Del paciente solo van las iniciales.",
      "Si prefiere pegar un mensaje desordenado, la IA lo lee y rellena la ficha (aquí está simulado): pulsa «Interpretar mensaje».",
    ],
    ask: "¿Qué datos pedís hoy que no estén en esta ficha? ¿Cuáles sobran?",
  },
  {
    id: "semaforo",
    title: "El semáforo del escaneo",
    view: "profesional",
    target: "semaforo",
    minState: "borrador",
    say: [
      "Pulsa «Escaneo A»: tiene un fallo a propósito. Sale rojo y el 3D marca la zona sin captar.",
      "El aviso llega con el paciente aún delante, así que se repite en el momento.",
      "Ahora «Escaneo B»: verde. Las comprobaciones de la demo son de ejemplo; en la versión real serían medidas sobre el archivo real.",
    ],
    ask: "¿Qué escáner usáis y en qué formato exporta? ¿Cuáles son los fallos de captura más habituales?",
  },
  {
    id: "aclaracion",
    title: "Una pregunta a tiempo",
    view: "profesional",
    target: "aclaracion",
    minState: "esperando_aclaracion",
    say: [
      "Enviamos el caso y pasa por las reglas del laboratorio (de ejemplo).",
      "Salta una: deporte intenso con un material muy blando. La pregunta llega dentro del propio caso, con botones.",
      "La IA solo redacta la pregunta. Lo que bloquea lo deciden las reglas del laboratorio, no un modelo.",
    ],
    ask: "¿Qué combinaciones os generan llamadas hoy? ¿Quién las resuelve y con qué criterio?",
  },
  {
    id: "laboratorio",
    title: "El laboratorio ve todo ordenado",
    view: "laboratorio",
    target: "lab-lista",
    minState: "validado",
    say: [
      "La lista se ordena por colores: listos, esperando respuesta, escaneo a repetir.",
      "Al abrir el caso, el técnico lo ve completo y recibe una propuesta de especificación que acepta o cambia con un botón.",
      "Cada cambio queda registrado: es la semilla de un futuro copiloto de diseño.",
    ],
    ask: "¿Quién decide hoy el material, la dureza y el proceso? ¿Se puede escribir como reglas?",
  },
  {
    id: "diseno",
    title: "Diseño de la plantilla",
    view: "laboratorio",
    target: "editor-diseno",
    minState: "diseno_borrador",
    say: [
      "Este es el único módulo que se calcula de verdad en el navegador. Mueve los controles y la ortesis cambia al instante.",
      "El mapa de calor es el grosor y los avisos salen de un perfil de proceso de ejemplo.",
      "Es un borrador. Hasta que el técnico lo aprueba no se puede exportar: pulsa «Aprobar» y luego exporta el STL y la hoja de fabricación.",
    ],
    ask: "¿Qué parámetros ajusta hoy un técnico a mano? ¿Cuáles faltan o sobran en esta lista?",
  },
  {
    id: "seguimiento",
    title: "Seguimiento sin llamar",
    view: "profesional",
    target: "timeline",
    minState: "en_fabricacion",
    say: [
      "El profesional ve en qué punto está su caso sin llamar a nadie, y puede compartir un enlace público de estado sin datos personales.",
      "Desde la vista del laboratorio, «Simular avance» hace progresar el caso y aquí se refleja.",
      "En la versión real, los avisos llegarían por correo y más adelante por WhatsApp.",
    ],
    ask: "¿Qué os preguntan más los clientes durante el plazo?",
  },
  {
    id: "panel",
    title: "El panel del dueño",
    view: "dueno",
    target: "dash",
    minState: "validado",
    say: [
      "Hoy no hay forma de saber cuántos casos salen bien a la primera ni dónde se pierde el tiempo.",
      "Los números de este panel son de ejemplo y no tienen nada que ver con Zona Pies. Lo que sí es real es el caso que acabáis de simular, que aparece como bucle.",
      "Las métricas se miden solas a partir de los cambios de estado, sin que nadie rellene nada.",
    ],
    ask: "¿Qué indicador os gustaría ver cada lunes? ¿Hay alguno que hoy os cueste medir?",
  },
  {
    id: "cierre",
    title: "Qué es real y qué necesitamos",
    view: "acerca",
    target: "cierre",
    minState: "borrador",
    say: [
      "Para ser claros: casi todo lo que habéis visto es simulado. Lo único calculado de verdad es la geometría de la plantilla.",
      "Si la idea os encaja, lo siguiente es la lista de la derecha: con ella, la versión real pasa de datos sintéticos a datos vuestros.",
      "Antes de cerrar, marcad en cada pantalla si cuadra con vuestro proceso.",
    ],
    ask: "¿Qué cambiaríais? ¿Qué falta para que os sirviera el primer día?",
  },
];

export interface RealRow {
  piece: string;
  here: "real" | "ejemplo" | "simulado";
  demo: string;
  real: string;
}

export const REAL_VS_SIMULATED: RealRow[] = [
  {
    piece: "Diseño de la plantilla",
    here: "real",
    demo: "Se calcula de verdad en tu navegador: sliders, mapa de calor, avisos y exportación de un STL. Es una aproximación geométrica en JavaScript, no anatómica.",
    real: "Servicio de geometría en Python calibrado con escaneos reales del escáner de Zona Pies, con aprobación del técnico y versiones.",
  },
  {
    piece: "STL exportado y hoja de fabricación",
    here: "real",
    demo: "El STL es una malla cerrada de verdad, pero ilustrativa: no está calibrada y no es apta para fabricar.",
    real: "STL y hoja de fabricación con trazabilidad, solo tras la aprobación de un técnico.",
  },
  {
    piece: "Revisión del escaneo",
    here: "simulado",
    demo: "Dos escaneos sintéticos de ejemplo con comprobaciones guionizadas. Con un STL propio solo se miden largo, ancho y si la malla es cerrada.",
    real: "Análisis geométrico del archivo real: cobertura, huecos, escala, lado.",
  },
  {
    piece: "Lectura del mensaje desordenado",
    here: "simulado",
    demo: "Un texto fijo y una ficha prefijada. No hay ninguna IA conectada.",
    real: "Modelo de lenguaje con salida estructurada, sin enviarle datos identificables.",
  },
  {
    piece: "Reglas de coherencia y propuesta de especificación",
    here: "ejemplo",
    demo: "Reglas de ejemplo, sin validación clínica ni de Zona Pies.",
    real: "Reglas de los técnicos de Zona Pies, versionadas y marcadas como validadas.",
  },
  {
    piece: "Envío del caso, base de datos y accesos",
    here: "simulado",
    demo: "Todo vive en tu navegador (sessionStorage). No sale ningún dato.",
    real: "Servidor, base de datos y archivos en región UE, acceso por invitación y registro de auditoría.",
  },
  {
    piece: "Avisos, seguimiento y enlace público",
    here: "simulado",
    demo: "Pantallas de ejemplo; no se envía ningún correo.",
    real: "Correos reales y un enlace de estado sin datos personales.",
  },
  {
    piece: "Panel del dueño",
    here: "ejemplo",
    demo: "Datos de ejemplo. Solo el caso que simulas se calcula de verdad.",
    real: "Métricas calculadas a partir de los cambios de estado reales.",
  },
];

export const NEEDS_FROM_CLIENT: string[] = [
  "Marca y modelo del escáner y el formato de exportación, y 3–5 escaneos reales de muestra (pueden ir anonimizados).",
  "El formulario o formato real de la prescripción.",
  "Las reglas de decisión de los técnicos: qué revisan a ojo y qué bloquea un caso.",
  "Por proceso (PA11, EVA, resina, carbono, composite, memory): grosor mínimo, radio mínimo de fresa, formato de entrega y restricciones.",
  "Cómo definen el largo ¾ y qué contornos de calzado usan.",
  "Documentación o exportación del portal actual (API, base de datos o CSV).",
  "Si fabrican como producto sanitario a medida: requisitos de documentación y trazabilidad que debe cumplir la hoja de fabricación (a consultar con su responsable regulatorio).",
];
