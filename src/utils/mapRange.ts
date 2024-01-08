export function clamp(input: number, min: number, max: number): number {
  return input < min ? min : input > max ? max : input;
}

/**
 * Map a value from one range to another
 *
 * @param value Value to map
 * @param oldRange Range to map from
 * @param newRange Range to map to
 * @return Mapped value
 */
export function mapRange(
  value: number,
  [in_min, in_max]: [number, number],
  [out_min, out_max]: [number, number],
  clamped = false
) {
  const mapped: number =
    ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  return clamped ? clamp(mapped, out_min, out_max) : mapped;
}
