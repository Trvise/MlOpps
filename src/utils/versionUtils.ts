export const generateModelVersion = (existingVersions: string[]): string => {
  const numbers = existingVersions
    .map(v => parseInt(v.replace('M-', ''), 10))
    .filter(n => !isNaN(n));
  
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `M-${String(maxNumber + 1).padStart(3, '0')}`;
};

export const generateExportVersion = (existingVersions: string[]): string => {
  const numbers = existingVersions
    .map(v => parseInt(v.replace('E-', ''), 10))
    .filter(n => !isNaN(n));
  
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `E-${String(maxNumber + 1).padStart(3, '0')}`;
};

export const generateFleetVersion = (modelVersion: string): string => {
  return `F-${modelVersion.replace('M-', '')}`;
};

export const parseVersion = (version: string): number => {
  return parseInt(version.split('-')[1], 10) || 0;
};

