/**
 * Formats numbers into Indian Rupee Currency string
 * e.g. 1245000 -> "₹12,45,000"
 */
export const formatINR = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats large figures into Lakh format for high-level badges
 * e.g. 1245000 -> "₹12.45 Lakh"
 */
export const formatLakh = (amount: number | undefined | null): string => {
  if (!amount || isNaN(amount)) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  }
  return formatINR(amount);
};

/**
 * Formats kilometres driven with commas
 * e.g. 41200 -> "41,200 km"
 */
export const formatKm = (km: number | undefined | null): string => {
  if (!km) return '0 km';
  return `${new Intl.NumberFormat('en-IN').format(km)} km`;
};

/**
 * Formats date into readable string e.g. "05 Nov 2026"
 */
export const formatDate = (dateString: string | Date | undefined | null): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

/**
 * Masks registration number for frontend display
 * e.g. "UP32AB1234" -> "UP32**1234"
 */
export const maskRegNumber = (reg: string | undefined | null): string => {
  if (!reg) return 'UP32**XXXX';
  const cleaned = reg.trim().toUpperCase().replace(/[\s-]/g, '');
  if (cleaned.length < 6) return 'UP32**XXXX';
  const prefix = cleaned.slice(0, 4);
  const suffix = cleaned.slice(-4);
  return `${prefix}**${suffix}`;
};
