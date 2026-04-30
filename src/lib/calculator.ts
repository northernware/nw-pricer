// ─── Northernware Pricing Calculator — Core Logic ───

export type ProjectType = 'business_website' | 'ecommerce' | 'redesign' | 'custom_system';
export type DesignLevel = 'basic' | 'custom' | 'high_end';
export type Complexity = 'simple' | 'medium' | 'complex';
export type Feature =
  | 'contact_form'
  | 'cms_blog'
  | 'authentication'
  | 'dashboard_admin'
  | 'payment_integration'
  | 'api_integration';
export type RoundingMode = 'nearest_1000' | 'nearest_5000';

export interface CalculatorInput {
  projectType: ProjectType;
  pages: number;
  designLevel: DesignLevel;
  complexity: Complexity;
  features: Feature[];
  hourlyRate: number;
  bufferPercent: number;
  roundingMode: RoundingMode;
}

export interface CalculatorOutput {
  baseHours: number;
  adjustedHours: number;
  baseCost: number;
  finalPrice: number;
  roundedPrice: number;
  priceRange: [number, number];
  // Breakdown
  pagesHours: number;
  designHours: number;
  featureHours: number;
  complexityMultiplier: number;
}

// ─── Hour Mappings ───

function getPagesHours(pages: number): number {
  const baseSetup = 10;
  const perPage = 6;
  return baseSetup + (pages * perPage);
}

function getDesignHours(level: DesignLevel): number {
  const map: Record<DesignLevel, number> = {
    basic: 12,
    custom: 18,
    high_end: 24,
  };
  return map[level];
}

const FEATURE_HOURS: Record<Feature, number> = {
  contact_form: 4,
  cms_blog: 12,
  authentication: 16,
  dashboard_admin: 24,
  payment_integration: 16,
  api_integration: 12,
};

function getFeatureHours(features: Feature[]): number {
  return features.reduce((sum, f) => sum + (FEATURE_HOURS[f] || 0), 0);
}

function getComplexityMultiplier(complexity: Complexity): number {
  const map: Record<Complexity, number> = {
    simple: 1.0,
    medium: 1.3,
    complex: 1.6,
  };
  return map[complexity];
}

// ─── Rounding ───

function roundToNearest(value: number, mode: RoundingMode): number {
  const base = mode === 'nearest_1000' ? 1000 : 5000;
  return Math.round(value / base) * base;
}

// ─── Main Calculation ───

export function calculate(input: CalculatorInput): CalculatorOutput {
  const pagesHours = getPagesHours(input.pages);
  const designHours = getDesignHours(input.designLevel);
  const featureHours = getFeatureHours(input.features);
  const complexityMultiplier = getComplexityMultiplier(input.complexity);

  // Step 1: Base Hours
  const baseHours = pagesHours + designHours + featureHours;

  // Step 2: Adjusted Hours
  const adjustedHours = Math.round(baseHours * complexityMultiplier * 10) / 10;

  // Step 3: Base Cost
  const baseCost = adjustedHours * input.hourlyRate;

  // Step 4: Final Price (with buffer)
  const finalPrice = baseCost * (1 + input.bufferPercent / 100);

  // Step 5: Rounded Price
  const roundedPrice = roundToNearest(finalPrice, input.roundingMode);

  // Price Range
  const priceRange: [number, number] = [
    roundToNearest(roundedPrice * 0.9, input.roundingMode),
    roundToNearest(roundedPrice * 1.1, input.roundingMode),
  ];

  return {
    baseHours,
    adjustedHours,
    baseCost,
    finalPrice,
    roundedPrice,
    priceRange,
    pagesHours,
    designHours,
    featureHours,
    complexityMultiplier,
  };
}
