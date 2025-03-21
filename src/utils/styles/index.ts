export function setAlphaToHex(color: string, opacity: number) {
  var _opacity = Math.round(Math.min(Math.max(opacity ?? 1, 0), 1) * 255);
  return color + _opacity.toString(16).toUpperCase();
}
