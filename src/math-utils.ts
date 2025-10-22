
export const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180);
export const radiansToDegrees = (radians: number) => radians * (180 / Math.PI);

export function vector(args: { length: number; degrees: number }): { x: number; y: number; }
export function vector(args: { length: number; radians: number }): { x: number; y: number; }
export function vector({ length, ...radiansOrDegrees }: ({
  radians: number;
} | {
  degrees: number;
}) & {
  length: number;
}): {
  x: number;
  y: number;
} {
  const radians = "radians" in radiansOrDegrees
    ? radiansOrDegrees.radians
    : degreesToRadians(radiansOrDegrees.degrees);
  return {
    x: Math.cos(radians) * length,
    y: Math.sin(radians) * length
  };
}

export function vectorLength({ x, y }: { x: number; y: number; }): number {
  return Math.sqrt((x * x) + (y * y));
}

export function distanceBetween(from: { x: number; y: number; }, to: { x: number; y: number; }): number {
  const deltaX = from.x - to.x;
  const deltaY = from.y - to.y;
  return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
}

export function angleBetween(from: { x: number; y: number }, to: { x: number; y: number }): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.atan2(dy, dx) * 180 / Math.PI;
}