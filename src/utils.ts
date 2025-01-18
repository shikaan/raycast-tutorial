/// utils
const TWO_PI = Math.PI * 2;
export const normalize = (a: number) => a < 0 ? a + TWO_PI : a >= TWO_PI ? a - TWO_PI : a;
export const lineLength = (x0: number, y0: number, x1: number, y1: number) => Math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2)