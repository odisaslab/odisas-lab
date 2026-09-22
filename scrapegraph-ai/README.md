# ScrapeGraphAI

Librería Python de scraping con IA: en vez de escribir selectores CSS, le
describes en lenguaje natural qué quieres extraer de una web y un LLM se
encarga de interpretarla. Repositorio original:
https://github.com/ScrapeGraphAI/Scrapegraph-ai

**No está conectada a la web ni a `odisas-audit`.** Es una herramienta
aparte, instalada y lista para usar cuando haga falta; de momento ninguna
parte del sitio la llama.

## Requisito importante: Python 3.12+

La versión actual de la librería (2.2.4) exige Python ≥ 3.12. Comprueba tu
versión con `python3 --version`; si es anterior a la 3.12, usa
explícitamente el binario `python3.12` en el paso siguiente.

## Instalación

```bash
cd scrapegraph-ai
python3.12 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium    # navegador que usa para leer páginas con JS
```

## Configuración

Necesita un LLM para interpretar las páginas:

```bash
cp .env.example .env
```

y rellena **una** de estas opciones en `.env`:

- **OpenAI** (de pago): `OPENAI_API_KEY`.
- **Ollama en local** (gratis, sin clave): instala [Ollama](https://ollama.com)
  y descarga un modelo, p. ej. `ollama pull llama3.2`.

## Probarlo

```bash
source .venv/bin/activate
python3 ejemplo.py https://example.com "Resume de qué trata esta página"
```

`ejemplo.py` usa OpenAI si detecta `OPENAI_API_KEY` en el entorno; si no,
prueba con Ollama en `localhost:11434`.

## Nota sobre la versión de PyPI

Con Python 3.11 o anterior, `pip install scrapegraphai` sin fijar versión
instala silenciosamente la última compatible con esa versión (1.76.0), que
tiene un import roto (`ChatOllama`) y no arranca. Por eso `requirements.txt`
fija la 2.2.4: el paso de Python 3.12 de arriba no es opcional.
