/// utils
const TWO_PI = Math.PI * 2;

// Normalizes an angle to be always in [0, 2PI)
export const normalize = (a: number) => a < 0 ? a + TWO_PI : a >= TWO_PI ? a - TWO_PI : a;

// Returns the length of a segment from (x0,y0) to (x1, y1)
export const lineLength = (x0: number, y0: number, x1: number, y1: number) => Math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2)