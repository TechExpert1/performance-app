export const cmToInches = (cm: number): number => {
  return +(cm / 2.54).toFixed(2); // rounded to 2 decimal places
};

// Convert inches to cm
export const inchesToCm = (inches: number): number => {
  return +(inches * 2.54).toFixed(2);
};

// Convert kg to lb
export const kgToLb = (kg: number): number => {
  return +(kg * 2.20462).toFixed(2);
};

// Convert lb to kg
export const lbToKg = (lb: number): number => {
  return +(lb / 2.20462).toFixed(2);
};
