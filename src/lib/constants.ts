// ─── Labels & Display Constants ───

import type { ProjectType, DesignLevel, Complexity, Feature, RoundingMode } from './calculator';

export const PROJECT_TYPES: { value: ProjectType; label: string; code: string }[] = [
  { value: 'business_website', label: 'Business Website', code: 'BW' },
  { value: 'ecommerce', label: 'E-commerce', code: 'EC' },
  { value: 'redesign', label: 'Redesign', code: 'RD' },
  { value: 'custom_system', label: 'Custom System', code: 'CS' },
];

export const DESIGN_LEVELS: { value: DesignLevel; label: string; hours: number }[] = [
  { value: 'basic', label: 'Basic', hours: 5 },
  { value: 'custom', label: 'Custom', hours: 10 },
  { value: 'high_end', label: 'High-end', hours: 15 },
];

export const COMPLEXITIES: { value: Complexity; label: string; multiplier: string }[] = [
  { value: 'simple', label: 'Simple', multiplier: '×1.0' },
  { value: 'medium', label: 'Medium', multiplier: '×1.3' },
  { value: 'complex', label: 'Complex', multiplier: '×1.6' },
];

export const FEATURES: { value: Feature; label: string; hours: number }[] = [
  { value: 'contact_form', label: 'Contact Form', hours: 2 },
  { value: 'cms_blog', label: 'CMS / Blog', hours: 6 },
  { value: 'authentication', label: 'Authentication', hours: 10 },
  { value: 'dashboard_admin', label: 'Dashboard / Admin', hours: 15 },
  { value: 'payment_integration', label: 'Payment Integration', hours: 10 },
  { value: 'api_integration', label: 'API Integration', hours: 8 },
];

export const ROUNDING_MODES: { value: RoundingMode; label: string }[] = [
  { value: 'nearest_1000', label: 'Nearest ₱1,000' },
  { value: 'nearest_5000', label: 'Nearest ₱5,000' },
];

export const DEFAULTS = {
  hourlyRate: 700,
  bufferPercent: 30,
  roundingMode: 'nearest_1000' as RoundingMode,
  complexity: 'medium' as Complexity,
  designLevel: 'custom' as DesignLevel,
  projectType: 'business_website' as ProjectType,
  pages: 5,
};

export const TEMPLATES: { 
  label: string; 
  config: Partial<CalculatorInput> 
}[] = [
  {
    label: "Landing Page (Simple)",
    config: {
      projectType: "business_website",
      pages: 1,
      designLevel: "basic",
      complexity: "simple",
      features: ["contact_form"],
    }
  },
  {
    label: "Corporate Site (Standard)",
    config: {
      projectType: "business_website",
      pages: 8,
      designLevel: "custom",
      complexity: "medium",
      features: ["contact_form", "cms_blog"],
    }
  },
  {
    label: "E-commerce Store (Pro)",
    config: {
      projectType: "ecommerce",
      pages: 12,
      designLevel: "high_end",
      complexity: "complex",
      features: ["contact_form", "cms_blog", "authentication", "payment_integration"],
    }
  },
  {
    label: "SaaS Dashboard (Custom)",
    config: {
      projectType: "custom_system",
      pages: 15,
      designLevel: "high_end",
      complexity: "complex",
      features: ["authentication", "dashboard_admin", "api_integration"],
    }
  }
];
