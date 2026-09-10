#!/usr/bin/env python3
"""
Extrae los assets utilizables del logotipo de Odisas a partir del original.

Uso:
    python3 scripts/preparar-logo.py

El original está en scripts/brand-source/logo_grande_odisas.jpg: es un JPG con
fondo blanco, así que no sirve directamente para la web. Este script:

  1. Separa el símbolo (la flecha) del texto ("ODISAS" + "MARKETING DIGITAL").
  2. Recorta el fondo blanco y genera PNG con transparencia real.
  3. Compone una versión horizontal para la cabecera.
  4. Genera una versión en blanco para el pie oscuro.
  5. Genera el favicon y los iconos a partir del símbolo.

SALIDA
------
    public/brand/logo.png                  símbolo + ODISAS, transparente
    public/brand/logo-blanco.png           igual, para fondo oscuro
    public/brand/logo-completo.png         con la bajada MARKETING DIGITAL
    public/brand/logo-completo-blanco.png  igual, para fondo oscuro
    public/brand/simbolo.png         solo la flecha
    public/brand/simbolo-blanco.png  la flecha en blanco
    app/favicon.ico                  16 / 32 / 48
    app/apple-icon.png               180 x 180
    public/icon-192.png              manifest
    public/icon-512.png              manifest

NOTA
----
Lo ideal sería tener el logotipo en SVG (vectorial). Estos PNG se generan al
triple de resolución para que se vean nítidos en pantallas Retina, pero si en
algún momento consigues el SVG original, sustitúyelo: pesará menos y escalará
sin límite.
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = Path(__file__).resolve().parent / "brand-source" / "logo_grande_odisas.jpg"
BRAND = ROOT / "public" / "brand"
APP = ROOT / "app"
PUBLIC = ROOT / "public"

PRIMARY = (255, 107, 0)
DARK = (23, 23, 23)


def unmultiply_white(image, threshold=14):
    """
    Quita el fondo blanco calculando la transparencia de cada píxel.

    Sobre blanco, un píxel observado O = a·F + (1−a)·255. Usando el canal más
    oscuro como estimación de opacidad se recupera el color original F, así que
    el resultado se ve idéntico sobre blanco y funciona sobre cualquier fondo.

    El umbral descarta el ruido de compresión del JPG: sin él, el "blanco" del
    original (254,254,254) deja un velo de alfa 1 en toda la imagen.
    """
    data = np.asarray(image.convert("RGB")).astype(np.float64)
    raw = 255.0 - data.min(axis=2)

    # Todo lo que esté por debajo del umbral es fondo; el resto se reescala
    alpha = np.clip((raw - threshold) * (255.0 / (255.0 - threshold)), 0, 255)

    with np.errstate(divide="ignore", invalid="ignore"):
        foreground = (data - (255.0 - alpha)[..., None]) * 255.0 / alpha[..., None]

    foreground = np.nan_to_num(foreground, nan=0.0, posinf=255.0, neginf=0.0)
    foreground = np.clip(foreground, 0, 255)

    out = np.dstack([foreground, alpha]).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def trim(image):
    """Recorta el margen totalmente transparente."""
    alpha = np.asarray(image)[..., 3]
    rows = np.where(alpha.any(axis=1))[0]
    cols = np.where(alpha.any(axis=0))[0]
    return image.crop((cols.min(), rows.min(), cols.max() + 1, rows.max() + 1))


def recolor_dark_to_white(image):
    """Pasa el texto oscuro a blanco y deja intacto el naranja."""
    data = np.asarray(image).astype(int)
    r, g, b = data[..., 0], data[..., 1], data[..., 2]

    # El naranja de marca tiene el rojo muy por encima del azul
    is_orange = (r > 130) & (r > b + 60) & (g > 30)
    out = data.copy()
    out[..., 0] = np.where(is_orange, r, 255)
    out[..., 1] = np.where(is_orange, g, 255)
    out[..., 2] = np.where(is_orange, b, 255)
    return Image.fromarray(out.astype(np.uint8), "RGBA")


def recolor_all_to(image, color):
    """Pinta toda la figura de un color plano, conservando la transparencia."""
    data = np.asarray(image).astype(int)
    out = data.copy()
    out[..., 0], out[..., 1], out[..., 2] = color
    return Image.fromarray(out.astype(np.uint8), "RGBA")


def horizontal_lockup(symbol, wordmark, symbol_height=180, word_ratio=0.80, gap_ratio=0.16):
    """Símbolo a la izquierda y texto a la derecha, ópticamente centrados."""
    sym = symbol.copy()
    sym.thumbnail((10_000, symbol_height), Image.LANCZOS)

    # El bloque de texto se ajusta a una fracción del alto del símbolo
    word_height = int(symbol_height * word_ratio)
    word = wordmark.copy()
    word.thumbnail((10_000, word_height), Image.LANCZOS)

    gap = int(symbol_height * gap_ratio)
    width = sym.width + gap + word.width
    height = max(sym.height, word.height)

    canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    canvas.alpha_composite(sym, (0, (height - sym.height) // 2))
    canvas.alpha_composite(word, (sym.width + gap, (height - word.height) // 2))
    return trim(canvas)


def rounded_icon(symbol, size, background, symbol_color=None, radius_ratio=0.22, padding=0.22):
    """Cuadrado redondeado con el símbolo centrado. Se dibuja a 4x y se reduce."""
    from PIL import ImageDraw

    scale = 4
    canvas_size = size * scale
    image = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle(
        [0, 0, canvas_size - 1, canvas_size - 1],
        radius=int(canvas_size * radius_ratio),
        fill=background,
    )

    inner = int(canvas_size * (1 - 2 * padding))
    glyph = symbol.copy()
    if symbol_color:
        glyph = recolor_all_to(glyph, symbol_color)
    glyph.thumbnail((inner, inner), Image.LANCZOS)

    # Ligero desplazamiento a la izquierda: la flecha pesa visualmente a la derecha
    offset_x = (canvas_size - glyph.width) // 2 - int(canvas_size * 0.012)
    image.alpha_composite(glyph, (offset_x, (canvas_size - glyph.height) // 2))

    return image.resize((size, size), Image.LANCZOS)


def main():
    if not SOURCE.exists():
        raise SystemExit(f"No se encuentra el original en {SOURCE}")

    BRAND.mkdir(parents=True, exist_ok=True)

    original = Image.open(SOURCE)
    cleaned = unmultiply_white(original)

    # Bloques detectados en el original: símbolo, "ODISAS" y la bajada
    symbol = trim(cleaned.crop((0, 0, cleaned.width, 560)))
    name = trim(cleaned.crop((0, 570, cleaned.width, 790)))
    full_text = trim(cleaned.crop((0, 570, cleaned.width, cleaned.height)))

    print("Bloques extraídos:")
    print(f"  · símbolo        {symbol.width}x{symbol.height}")
    print(f"  · ODISAS         {name.width}x{name.height}")
    print(f"  · con bajada     {full_text.width}x{full_text.height}")

    # Versión principal, sin bajada: a 28 px de alto "MARKETING DIGITAL"
    # resultaría ilegible, y la cabecera necesita justamente ese tamaño.
    logo = horizontal_lockup(symbol, name, symbol_height=180, word_ratio=0.46)
    logo.save(BRAND / "logo.png")
    recolor_dark_to_white(logo).save(BRAND / "logo-blanco.png")

    # Versión con bajada, para usos grandes (papelería, imagen de compartición)
    complete = horizontal_lockup(symbol, full_text, symbol_height=180, word_ratio=0.80)
    complete.save(BRAND / "logo-completo.png")
    recolor_dark_to_white(complete).save(BRAND / "logo-completo-blanco.png")

    symbol_out = symbol.copy()
    symbol_out.thumbnail((512, 512), Image.LANCZOS)
    symbol_out.save(BRAND / "simbolo.png")
    recolor_all_to(symbol_out, (255, 255, 255)).save(BRAND / "simbolo-blanco.png")

    print("\nAssets de marca:")
    print(f"  · public/brand/logo.png            {logo.width}x{logo.height}")
    print(f"  · public/brand/logo-blanco.png     {logo.width}x{logo.height}")
    print(f"  · public/brand/logo-completo.png   {complete.width}x{complete.height}")
    print("  · public/brand/logo-completo-blanco.png")
    print(f"  · public/brand/simbolo.png         {symbol_out.width}x{symbol_out.height}")
    print("  · public/brand/simbolo-blanco.png")

    # Iconos: cuadrado naranja con el símbolo en blanco, como en tu manual de marca
    favicon = rounded_icon(symbol, 64, PRIMARY, symbol_color=(255, 255, 255))
    favicon.save(APP / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    rounded_icon(symbol, 180, PRIMARY, symbol_color=(255, 255, 255)).save(APP / "apple-icon.png")
    rounded_icon(symbol, 192, PRIMARY, symbol_color=(255, 255, 255), padding=0.28).save(
        PUBLIC / "icon-192.png"
    )
    rounded_icon(symbol, 512, PRIMARY, symbol_color=(255, 255, 255), padding=0.28).save(
        PUBLIC / "icon-512.png"
    )

    print("\nIconos:")
    print("  · app/favicon.ico (16/32/48)")
    print("  · app/apple-icon.png")
    print("  · public/icon-192.png y icon-512.png")
    print("\nListo.")


if __name__ == "__main__":
    main()
