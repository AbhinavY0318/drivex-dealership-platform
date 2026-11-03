/**
 * Masks vehicle registration numbers to protect vehicle privacy under DPDP.
 * Example: 'UP32AB1234' -> 'UP32**1234'
 * Example: 'DL01C1234' -> 'DL01**1234'
 */
export const maskRegistrationNumber = (regNumber: string | undefined | null): string => {
  if (!regNumber) return 'UP32**XXXX';
  const cleaned = regNumber.trim().toUpperCase().replace(/[\s-]/g, '');
  if (cleaned.length < 6) return 'UP32**XXXX';

  // Format typically: 2 chars State + 2 digits RTO + 1-2 chars Series + 4 digits Number
  // E.g. UP 32 AB 1234 (length 10) -> UP32**1234
  const prefix = cleaned.slice(0, 4); // UP32
  const suffix = cleaned.slice(-4); // 1234
  return `${prefix}**${suffix}`;
};

/**
 * Strips or masks private vehicle registration numbers from used vehicle payloads
 * before returning in public API responses.
 */
export const sanitizeUsedVehiclePublic = (vehicle: any): any => {
  if (!vehicle) return vehicle;
  const obj = vehicle.toObject ? vehicle.toObject() : { ...vehicle };

  if (obj.registrationNumber) {
    obj.registrationNumber = maskRegistrationNumber(obj.registrationNumber);
  }
  return obj;
};

export const sanitizeUsedVehiclesPublicList = (vehicles: any[]): any[] => {
  return vehicles.map(sanitizeUsedVehiclePublic);
};
