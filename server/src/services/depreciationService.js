// =============================================
// Depreciation Service
// All calculations are performed at request time —
// values are always current to today's date.
// =============================================

/**
 * Calculate the number of months between two dates.
 */
function monthsBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  // Add partial month based on days
  const dayFraction = (end.getDate() - start.getDate()) / 30.44;
  return Math.max(0, months + dayFraction);
}

/**
 * Straight-Line Depreciation
 * Annual = (Cost - Salvage) / Useful Life
 * Monthly = Annual / 12
 */
function straightLine(asset, monthsElapsed) {
  const { purchasePrice, salvageValue, usefulLifeYears } = asset;
  const totalMonths = usefulLifeYears * 12;
  const capped = Math.min(monthsElapsed, totalMonths);
  const annualDep = (purchasePrice - salvageValue) / usefulLifeYears;
  const monthlyDep = annualDep / 12;
  const totalDep = monthlyDep * capped;
  const currentValue = Math.max(salvageValue, purchasePrice - totalDep);
  return { currentValue, monthlyDep };
}

/**
 * Double Declining Balance Depreciation
 * Monthly Rate = (2 / Useful Life) / 12
 * Applied month-by-month from purchase date
 */
function doubleDeclining(asset, monthsElapsed) {
  const { purchasePrice, salvageValue, usefulLifeYears } = asset;
  const monthlyRate = (2 / usefulLifeYears) / 12;
  const totalMonths = usefulLifeYears * 12;
  const capped = Math.min(Math.floor(monthsElapsed), totalMonths);

  let bookValue = purchasePrice;
  let lastMonthDep = 0;

  for (let i = 0; i < capped; i++) {
    if (bookValue <= salvageValue) break;

    let dep = bookValue * monthlyRate;
    if (bookValue - dep < salvageValue) {
      dep = bookValue - salvageValue;
    }
    lastMonthDep = dep;
    bookValue -= dep;
  }

  return { currentValue: Math.max(salvageValue, bookValue), monthlyDep: lastMonthDep };
}

/**
 * Units of Production Depreciation
 * Per Unit = (Cost - Salvage) / Total Units
 * Total Dep = Per Unit × Units Used
 */
function unitsOfProduction(asset) {
  const { purchasePrice, salvageValue, totalUnits, unitsUsed } = asset;

  if (!totalUnits || totalUnits === 0) {
    return { currentValue: purchasePrice, monthlyDep: 0 };
  }

  const perUnit = (purchasePrice - salvageValue) / totalUnits;
  const used = unitsUsed || 0;
  const totalDep = perUnit * used;
  const currentValue = Math.max(salvageValue, purchasePrice - totalDep);

  // Estimate monthly dep as average over elapsed months or 0
  return { currentValue, monthlyDep: 0 }; // UoP doesn't have a fixed monthly rate
}

/**
 * Calculate depreciation for an asset at a given date.
 */
function calculateAtDate(asset, targetDate) {
  const elapsed = monthsBetween(asset.purchaseDate, targetDate);

  switch (asset.depreciationMethod) {
    case 'STRAIGHT_LINE':
      return straightLine(asset, elapsed);
    case 'DOUBLE_DECLINING':
      return doubleDeclining(asset, elapsed);
    case 'UNITS_OF_PRODUCTION':
      return unitsOfProduction(asset);
    default:
      return { currentValue: asset.purchasePrice, monthlyDep: 0 };
  }
}

/**
 * Compute all depreciation fields for an asset.
 * Returns an enriched object with computed values.
 */
export function computeDepreciation(asset) {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const current = calculateAtDate(asset, now);
  const projected = calculateAtDate(asset, nextMonth);

  const currentValue = Math.round(current.currentValue * 100) / 100;
  const projectedNextMonth = Math.round(projected.currentValue * 100) / 100;
  const monthlyDepreciation = Math.round((currentValue - projectedNextMonth) * 100) / 100;
  const totalDepreciated = Math.round((asset.purchasePrice - currentValue) * 100) / 100;
  const percentRemaining =
    asset.purchasePrice > 0
      ? Math.round((currentValue / asset.purchasePrice) * 10000) / 100
      : 0;

  // Calculate months remaining until fully depreciated
  const totalLifeMonths = asset.usefulLifeYears * 12;
  const monthsElapsed = monthsBetween(asset.purchaseDate, now);
  const monthsRemaining = Math.max(0, Math.ceil(totalLifeMonths - monthsElapsed));

  // Calculate fully deprecated date
  const fullyDepreciatedDate = new Date(asset.purchaseDate);
  fullyDepreciatedDate.setFullYear(
    fullyDepreciatedDate.getFullYear() + asset.usefulLifeYears
  );

  return {
    originalValue: asset.purchasePrice,
    currentValue,
    projectedNextMonth,
    monthlyDepreciation,
    totalDepreciated,
    percentRemaining,
    salvageValue: asset.salvageValue,
    monthsRemaining,
    fullyDepreciatedDate: fullyDepreciatedDate.toISOString().split('T')[0],
  };
}

/**
 * Enrich an asset object with computed depreciation fields.
 */
export function enrichAsset(asset) {
  return {
    ...asset,
    depreciation: computeDepreciation(asset),
  };
}

/**
 * Enrich an array of assets with computed depreciation fields.
 */
export function enrichAssets(assets) {
  return assets.map(enrichAsset);
}
