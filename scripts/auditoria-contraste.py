#!/usr/bin/env python3
"""
Comprueba el contraste WCAG 2.1 de la paleta de Odisas Lab.

Uso:
    python3 scripts/auditoria-contraste.py

No necesita dependencias. Ejecútalo cada vez que cambies un color o añadas
una combinación nueva de texto y fondo.

CONTEXTO
--------
El naranja de marca #FF6B00 tiene una luminancia que NO alcanza 4.5:1 ni
sobre blanco (2.86) ni con texto blanco encima (2.86). Por eso la paleta
separa dos usos:

    --color-primary      #FF6B00   rellenos, iconos, barras, reglas, puntos
    --color-primary-ink  #BA4E00   TEXTO naranja sobre fondo claro

Y el texto que va encima del naranja es antracita, no blanco.
El logotipo mantiene el naranja puro: WCAG 1.4.3 exceptúa los logotipos.
"""

AA_NORMAL = 4.5  # texto normal
AA_LARGE = 3.0  # texto grande (24px+, o 18.66px+ en negrita) y componentes


def linear(channel):
    c = channel / 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def luminance(rgb):
    r, g, b = rgb
    return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)


def contrast(fg, bg):
    a, b = luminance(fg), luminance(bg)
    return (max(a, b) + 0.05) / (min(a, b) + 0.05)


def rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def over(fg, bg, alpha):
    """Color resultante de superponer fg con opacidad alpha sobre bg."""
    return tuple(round(alpha * f + (1 - alpha) * b) for f, b in zip(fg, bg))


WHITE = rgb("FFFFFF")
LIGHT = rgb("F5F5F5")
DARK = rgb("171717")
TEXT = rgb("222222")
GRAY = rgb("6B6B6B")
PRIMARY = rgb("FF6B00")
PRIMARY_DARK = rgb("E05E00")
PRIMARY_INK = rgb("BA4E00")
PRIMARY_SOFT = rgb("FFF3E9")

PAIRS = [
    # Texto sobre fondos claros
    ("Texto #222 sobre blanco", TEXT, WHITE, AA_NORMAL),
    ("Texto #222 sobre claro", TEXT, LIGHT, AA_NORMAL),
    ("Gris #6B6B6B sobre blanco", GRAY, WHITE, AA_NORMAL),
    ("Gris #6B6B6B sobre claro", GRAY, LIGHT, AA_NORMAL),
    ("Ink sobre blanco (etiquetas, numeración, errores)", PRIMARY_INK, WHITE, AA_NORMAL),
    ("Ink sobre claro", PRIMARY_INK, LIGHT, AA_NORMAL),
    ("Ink sobre naranja suave (avisos, dato pendiente)", PRIMARY_INK, PRIMARY_SOFT, AA_NORMAL),
    # Texto sobre naranja
    ("Antracita sobre naranja (botón primario, CTA)", DARK, PRIMARY, AA_NORMAL),
    ("Antracita sobre naranja hover", DARK, PRIMARY_DARK, AA_NORMAL),
    ("Antracita 80% sobre naranja (párrafos del CTA)", over(DARK, PRIMARY, 0.80), PRIMARY, AA_NORMAL),
    ("Borde antracita 70% sobre naranja", over(DARK, PRIMARY, 0.70), PRIMARY, AA_LARGE),
    # Texto sobre antracita
    ("Blanco sobre antracita", WHITE, DARK, AA_NORMAL),
    ("Blanco 75% sobre antracita", over(WHITE, DARK, 0.75), DARK, AA_NORMAL),
    ("Blanco 70% sobre antracita", over(WHITE, DARK, 0.70), DARK, AA_NORMAL),
    ("Blanco 60% sobre antracita", over(WHITE, DARK, 0.60), DARK, AA_NORMAL),
    ("Blanco 50% sobre antracita (títulos del pie)", over(WHITE, DARK, 0.50), DARK, AA_NORMAL),
    ("Naranja sobre antracita (etiquetas en oscuro)", PRIMARY, DARK, AA_NORMAL),
    # Combinaciones que NO deben usarse: se dejan documentadas
    ("[NO USAR] Naranja como texto sobre blanco", PRIMARY, WHITE, AA_NORMAL),
    ("[NO USAR] Blanco sobre naranja", WHITE, PRIMARY, AA_NORMAL),
]


def main():
    print(f"{'PAR':<52} {'RATIO':>7} {'MÍN':>6}  ")
    print("-" * 78)

    fails = []
    for label, fg, bg, minimum in PAIRS:
        ratio = contrast(fg, bg)
        expected_fail = label.startswith("[NO USAR]")
        ok = ratio >= minimum
        mark = "PASA" if ok else ("documentado" if expected_fail else "FALLA")
        if not ok and not expected_fail:
            fails.append((label, ratio, minimum))
        print(f"{label:<52} {ratio:>6.2f} {minimum:>6.1f}  {mark}")

    print()
    if fails:
        print(f"{len(fails)} combinaciones incumplen WCAG AA:")
        for label, ratio, minimum in fails:
            print(f"  · {label}: {ratio:.2f} (mínimo {minimum})")
        raise SystemExit(1)

    print("Todas las combinaciones en uso cumplen WCAG 2.1 AA.")


if __name__ == "__main__":
    main()
