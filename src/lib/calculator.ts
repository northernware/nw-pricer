// ─── Northernware Pricing Calculator — Core Logic ───

export type ProjectType = 'business_website' | 'ecommerce' | 'redesign' | 'custom_system';
export type DesignLevel = 'basic' | 'custom' | 'high_end';
export type Complexity = 'simple' | 'complex';
export type Feature =
  | 'contact_form'
  | 'cms_blog'
  | 'authentication'
  | 'dashboard_admin'
  | 'payment_integration'
  | 'api_integration';
export type RoundingMode = 'none' | 'nearest_1000' | 'nearest_5000';
export type HostingPlan = 'none' | 'basic' | 'standard' | 'advanced';


export interface ProjectInvoice {
  id: string;
  label: string;
  percentage: number;
  status: 'unpaid' | 'paid';
}

export interface ProposalContent {
  // Shared
  clientName: string;       // full name fallback / display
  clientFirstName: string;
  clientLastName: string;
  clientCompany: string;
  projectName: string;
  // Proposal fields
  projectOverview: string;
  businessGoals: string;
  scopeOfWork: string;
  deliverables: string;
  timeline: string;
  validityPeriod: string;
  // Contract-specific
  presentationDate: string;
  backupTerm: string;
  maintenanceDays: string;
  // Legacy / kept for compatibility
  exclusions: string;
  assumptions: string;
  paymentTerms: string;
}

export interface CalculatorInput {
  projectType: ProjectType;
  pages: number;
  designLevel: DesignLevel;
  complexity: Complexity;
  features: Feature[];
  hourlyRate: number;
  bufferPercent: number;
  roundingMode: RoundingMode;
  hostingPlan: HostingPlan;
  discountPercent: number;
  // Proposal Engine fields
  proposal: ProposalContent;
  invoices: ProjectInvoice[];
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
  hostingPrice: number;
  discountAmount: number;
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
    complex: 1.5,
  };
  return map[complexity];
}

function getHostingPrice(plan: HostingPlan): number {
  const map: Record<HostingPlan, number> = {
    none: 0,
    basic: 1500,
    standard: 4000,
    advanced: 8000,
  };
  return map[plan];
}

// ─── Rounding ───

function roundToNearest(value: number, mode: RoundingMode): number {
  if (mode === 'none') return Math.round(value);
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
  const baseFinalPrice = baseCost * (1 + input.bufferPercent / 100);

  // Step 5: Apply Discount
  const discountAmount = baseFinalPrice * (input.discountPercent / 100);
  const finalPrice = baseFinalPrice - discountAmount;

  // Step 6: Rounded Price
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
    hostingPrice: getHostingPrice(input.hostingPlan),
    discountAmount,
  };
}
