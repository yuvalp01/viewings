/**
 * Calculates the amount for a viewing extra based on extra configuration and rent.
 * 
 * Calculation rules:
 * - ID 6 (Finding tenant): Uses 1 month rent
 * - ID 7 (Y&S fee): Uses estimation + 500
 * - General: Uses estimation field
 * 
 * @param extra - The viewing extra configuration
 * @param rent - The expected minimal rent (can be null, only used for ID 6)
 * @returns The calculated amount rounded to integer, or null if calculation cannot be performed
 */
export interface ViewingExtraForCalculation {
  id: number;
  estimation: number | null;
}

export function calculateExtraAmount(
  extra: ViewingExtraForCalculation,
  rent: number | null
): number | null {
  // Special case: ID 6 - Finding tenant (1 month rent)
  if (extra.id === 6) {
    return rent !== null ? Math.round(rent) : null;
  }

  // Calculate base amount from estimation
  let baseAmount: number | null = null;

  if (extra.estimation !== null) {
    baseAmount = extra.estimation;
  }

  // Special case: ID 7 - Y&S fee (add 500 on top)
  if (extra.id === 7 && baseAmount !== null) {
    return Math.round(baseAmount + 500);
  }

  // Round to integer before returning
  return baseAmount !== null ? Math.round(baseAmount) : null;
}

