import { colors, accentColors } from "../constants/colors";

const HEX_COLOR_RE = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export function normalizeHexColor(value: string | undefined | null, fallback: string): string {
  if (!value) return fallback;
  if (!HEX_COLOR_RE.test(value)) return fallback;

  const hex = value.slice(1);
  if (hex.length === 3 || hex.length === 4) {
    const [r, g, b] = hex;
    return "#" + r + r + g + g + b + b;
  }

  return "#" + hex.slice(0, 6);
}

export function resolveAccentColor(value: string | undefined | null): string {
  if (!value) return colors.primary;
  if (value in accentColors) {
    return accentColors[value as keyof typeof accentColors];
  }
  return normalizeHexColor(value, colors.primary);
}

export function resolveBackgroundColor(value: string | undefined | null, fallback: string): string {
  return normalizeHexColor(value, fallback);
}

export function withAlpha(color: string | undefined | null, alphaHex: string, fallback: string = colors.primary): string {
  return normalizeHexColor(color, fallback) + alphaHex;
}
