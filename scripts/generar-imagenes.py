#!/usr/bin/env python3
"""
Genera los iconos y la imagen Open Graph de Odisas Lab.

Uso:
    python3 scripts/generar-imagenes.py

Requiere Pillow:  pip install Pillow

FUENTES
-------
Para que el resultado use la tipografía real de la marca, descarga estos dos
archivos y déjalos en scripts/fonts/:

    SpaceGrotesk-Bold.ttf     https://fonts.google.com/specimen/Space+Grotesk
    Inter-Regular.ttf         https://fonts.google.com/specimen/Inter

Si no están, el script usa la alternativa más parecida que encuentre en el
sistema y avisa por consola. Las imágenes ya generadas están en el repositorio,
así que solo hace falta ejecutar esto si cambias la identidad o los textos.

SALIDA
------
    app/opengraph-image.png    1200 x 630
    app/twitter-image.png      1200 x 630

Los iconos y el favicon se generan en scripts/preparar-logo.py, que parte del
logotipo real de la marca. Ejecuta ese primero.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

# ── Identidad ────────────────────────────────────────────────────────────
PRIMARY = (255, 107, 0)
DARK = (23, 23, 23)
WHITE = (255, 255, 255)
GRAY = (155, 155, 155)

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "app"
PUBLIC = ROOT / "public"
FONT_DIR = Path(__file__).resolve().parent / "fonts"

# Candidatas por orden de preferencia: la primera que exista, gana
DISPLAY_CANDIDATES = [
    FONT_DIR / "SpaceGrotesk-Bold.ttf",
    Path("/mnt/skills/examples/canvas-design/canvas-fonts/BricolageGrotesque-Bold.ttf"),
    Path("/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf"),
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
]

BODY_CANDIDATES = [
    FONT_DIR / "Inter-Regular.ttf",
    Path("/mnt/skills/examples/canvas-design/canvas-fonts/InstrumentSans-Regular.ttf"),
    Path("/usr/share/fonts/truetype/google-fonts/Poppins-Regular.ttf"),
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
]

MEDIUM_CANDIDATES = [
    FONT_DIR / "Inter-Medium.ttf",
    Path("/mnt/skills/examples/canvas-design/canvas-fonts/InstrumentSans-Bold.ttf"),
    Path("/usr/share/fonts/truetype/google-fonts/Poppins-Medium.ttf"),
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
]


def pick(candidates, label):
    for path in candidates:
        if path.exists():
            if candidates.index(path) > 0:
                print(f"  · {label}: usando {path.name} (sustituto)")
            else:
                print(f"  · {label}: {path.name}")
            return path
    raise SystemExit(f"No se ha encontrado ninguna fuente para {label}")


def font(path, size):
    return ImageFont.truetype(str(path), size)


def text_width(draw, content, typeface):
    box = draw.textbbox((0, 0), content, font=typeface)
    return box[2] - box[0]


# ── Icono: cuadrado naranja con la O de Odisas ───────────────────────────
def build_icon(size, display_path, radius_ratio=0.22, padding_ratio=0.0):
    """Se dibuja al cuádruple y se reduce, para que los bordes queden limpios."""
    scale = 4
    canvas = size * scale
    image = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    pad = int(canvas * padding_ratio)
    draw.rounded_rectangle(
        [pad, pad, canvas - pad - 1, canvas - pad - 1],
        radius=int((canvas - 2 * pad) * radius_ratio),
        fill=PRIMARY,
    )

    inner = canvas - 2 * pad
    letter = font(display_path, int(inner * 0.58))
    box = draw.textbbox((0, 0), "O", font=letter)
    letter_w = box[2] - box[0]
    letter_h = box[3] - box[1]

    # La O ligeramente descentrada para dejar sitio al punto de la marca
    shift = inner * 0.05
    left = pad + (inner - letter_w) / 2 - box[0] - shift
    top = pad + (inner - letter_h) / 2 - box[1]
    draw.text((left, top), "O", font=letter, fill=WHITE)

    # Punto de la marca, el mismo que acompaña al logotipo en la web
    dot = inner * 0.11
    dot_x = left + box[0] + letter_w + inner * 0.07
    dot_y = top + box[1] + letter_h - dot
    draw.ellipse([dot_x, dot_y, dot_x + dot, dot_y + dot], fill=WHITE)

    return image.resize((size, size), Image.LANCZOS)


# ── Imagen Open Graph ────────────────────────────────────────────────────
def build_og(display_path, body_path, medium_path):
    width, height = 1200, 630
    margin = 80

    image = Image.new("RGB", (width, height), DARK)
    draw = ImageDraw.Draw(image, "RGBA")

    # Rejilla técnica muy tenue
    for x in range(0, width, 72):
        draw.line([(x, 0), (x, height)], fill=(255, 255, 255, 10), width=1)
    for y in range(0, height, 72):
        draw.line([(0, y), (width, y)], fill=(255, 255, 255, 10), width=1)

    # Halo naranja arriba a la derecha, desenfocado para que no se vea el borde
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([700, -320, 1300, 280], fill=(255, 107, 0, 62))
    glow = glow.filter(ImageFilter.GaussianBlur(130))
    image = Image.alpha_composite(image.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(image, "RGBA")

    # Marca: se usa el logotipo real en blanco, generado por preparar-logo.py
    logo_path = ROOT / "public" / "brand" / "logo-completo-blanco.png"
    if logo_path.exists():
        logo = Image.open(logo_path).convert("RGBA")
        logo.thumbnail((10_000, 62), Image.LANCZOS)
        image.paste(logo, (margin, margin - 6), logo)
    else:
        print("  · aviso: falta logo-completo-blanco.png, ejecuta preparar-logo.py")

    # Titular
    title_font = font(display_path, 78)
    lines = [("Marketing que", WHITE), ("mueve negocios.", PRIMARY)]
    y = 236
    for line, color in lines:
        draw.text((margin, y), line, font=title_font, fill=color)
        y += 92

    # Subtítulo
    subtitle_font = font(body_path, 26)
    draw.text(
        (margin, y + 26),
        "Estrategia, tecnología e inteligencia artificial",
        font=subtitle_font,
        fill=GRAY,
    )

    # Regla naranja y servicios
    rule_y = height - margin - 46
    draw.rounded_rectangle([margin, rule_y, margin + 44, rule_y + 5], radius=3, fill=PRIMARY)

    services_font = font(medium_path, 21)
    draw.text(
        (margin, rule_y + 24),
        "SEO  ·  Google Ads  ·  Meta Ads  ·  Diseño web  ·  Social media  ·  IA",
        font=services_font,
        fill=(210, 210, 210),
    )

    # Tarjeta con gráfico, guiño al hero de la web
    card_x, card_y, card_w, card_h = 812, 196, 308, 238
    draw.rounded_rectangle(
        [card_x, card_y, card_x + card_w, card_y + card_h],
        radius=16,
        fill=(35, 35, 35),
        outline=(255, 255, 255, 22),
        width=1,
    )

    label_font = font(body_path, 17)
    value_font = font(display_path, 40)
    draw.text((card_x + 26, card_y + 24), "Visibilidad", font=label_font, fill=GRAY)
    draw.text((card_x + 26, card_y + 48), "+142%", font=value_font, fill=WHITE)

    bars = [34, 41, 38, 52, 61, 74, 92]
    bar_w, gap = 24, 14
    base = card_y + card_h - 34
    for index, value in enumerate(bars):
        bar_h = int(value / 100 * 96)
        x0 = card_x + 26 + index * (bar_w + gap)
        color = PRIMARY if index == len(bars) - 1 else (70, 70, 70)
        draw.rounded_rectangle([x0, base - bar_h, x0 + bar_w, base], radius=5, fill=color)

    # Dominio
    domain_font = font(body_path, 21)
    domain = "odisaslab.com"
    draw.text(
        (width - margin - text_width(draw, domain, domain_font), height - margin - 22),
        domain,
        font=domain_font,
        fill=GRAY,
    )

    return image


def main():
    print("Fuentes:")
    display_path = pick(DISPLAY_CANDIDATES, "titulares")
    body_path = pick(BODY_CANDIDATES, "texto")
    medium_path = pick(MEDIUM_CANDIDATES, "texto medio")

    APP.mkdir(exist_ok=True)

    print("\nGenerando:")

    # Los iconos se generan en scripts/preparar-logo.py, a partir del símbolo
    # real de la marca. Aquí solo se compone la imagen de compartición.
    og = build_og(display_path, body_path, medium_path)
    og.save(APP / "opengraph-image.png", optimize=True)
    og.save(APP / "twitter-image.png", optimize=True)
    print("  · app/opengraph-image.png y twitter-image.png")

    print("\nListo.")


if __name__ == "__main__":
    main()
