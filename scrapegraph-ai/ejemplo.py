#!/usr/bin/env python3
"""
Ejemplo mínimo de ScrapeGraphAI: le describes en lenguaje natural qué
extraer de una URL y un LLM interpreta la página y responde.

Uso:
    python3 ejemplo.py <url> "<qué quieres extraer>"

Requiere haber instalado las dependencias y configurado un LLM (ver
README.md de esta carpeta).

Config basada en la guía oficial del proyecto:
https://github.com/ScrapeGraphAI/Scrapegraph-ai#-quick-start
(revisa ahí si una versión futura cambia el formato).
"""
import os
import sys

from dotenv import load_dotenv
from scrapegraphai.graphs import SmartScraperGraph

load_dotenv()


def build_config() -> dict:
    api_key = os.environ.get("OPENAI_API_KEY")
    if api_key:
        return {"llm": {"api_key": api_key, "model": "openai/gpt-4o-mini"}}
    # Sin clave de OpenAI: intenta Ollama en local, sin necesidad de clave.
    return {
        "llm": {
            "model": "ollama/llama3.2",
            "model_tokens": 8192,
            "base_url": "http://localhost:11434",
        }
    }


def main() -> None:
    if len(sys.argv) != 3:
        print(f'Uso: python3 {sys.argv[0]} <url> "<qué extraer>"')
        sys.exit(1)

    url, prompt = sys.argv[1], sys.argv[2]
    config = build_config()
    config["verbose"] = True
    config["headless"] = True

    scraper = SmartScraperGraph(prompt=prompt, source=url, config=config)
    result = scraper.run()
    print(result)


if __name__ == "__main__":
    main()
