/** Opciones del formulario de presupuesto y del selector «¿Qué necesitas?». */

export interface NeedOption {
  value: string;
  /** Texto del botón del selector (briefing §8) */
  title: string;
  /** Para quién es */
  audience: string;
  /** Etiqueta corta para el formulario */
  short: string;
}

export const needs: NeedOption[] = [
  {
    value: "fabricacion",
    title: "Quiero que fabriquéis mis plantillas",
    audience: "Para profesionales que quieren externalizar la fabricación.",
    short: "Fabricación de plantillas",
  },
  {
    value: "shell",
    title: "Quiero solo el shell",
    audience: "Para profesionales que realizan parte del proceso.",
    short: "Solo el shell",
  },
  {
    value: "sistemas",
    title: "Quiero fabricar mis propias plantillas",
    audience: "Para profesionales que quieren producir en su centro: soluciones y sistemas disponibles.",
    short: "Sistemas para fabricar mis plantillas",
  },
];

export const extraNeeds: { value: string; short: string }[] = [
  { value: "formacion", short: "Formación" },
  { value: "franquicia", short: "Franquicia" },
  { value: "otro", short: "Otra consulta" },
];

export const needOptions = [...needs.map((n) => ({ value: n.value, label: n.short })), ...extraNeeds.map((n) => ({ value: n.value, label: n.short }))];

export const professionalTypes = [
  { value: "podologo", label: "Podólogo/a" },
  { value: "clinica", label: "Clínica o centro podológico" },
  { value: "ortopedia", label: "Ortopedia" },
  { value: "centro-medico", label: "Centro médico" },
  { value: "centro-deportivo", label: "Centro deportivo" },
  { value: "otro-sanitario", label: "Otro profesional sanitario" },
  { value: "otro", label: "Otro" },
];

export const provinces = [
  "A Coruña", "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz",
  "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real", "Córdoba",
  "Cuenca", "Girona", "Granada", "Guadalajara", "Gipuzkoa", "Huelva", "Huesca", "Illes Balears",
  "Jaén", "La Rioja", "Las Palmas", "León", "Lleida", "Lugo", "Madrid", "Málaga", "Murcia",
  "Navarra", "Ourense", "Palencia", "Pontevedra", "Salamanca", "Santa Cruz de Tenerife",
  "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid",
  "Bizkaia", "Zamora", "Zaragoza", "Ceuta", "Melilla",
];
