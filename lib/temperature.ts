// temperature: ℃
// humidity: %
export const discomfortIndex = (temperature: number, humidity: number) =>
  Math.round(0.81 * temperature + 0.01 * humidity * (0.99 * temperature - 14.3) + 46.3);
