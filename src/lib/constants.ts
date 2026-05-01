// ─── Labels & Display Constants ───

import type { ProjectType, DesignLevel, Complexity, Feature, RoundingMode, HostingPlan, CalculatorInput } from './calculator';

export const PROJECT_TYPES: { value: ProjectType; label: string; code: string }[] = [
  { value: 'business_website', label: 'Business Website', code: 'BW' },
  { value: 'ecommerce', label: 'E-commerce', code: 'EC' },
  { value: 'redesign', label: 'Redesign', code: 'RD' },
  { value: 'custom_system', label: 'Custom System', code: 'CS' },
];

export const DESIGN_LEVELS: { value: DesignLevel; label: string; hours: number }[] = [
  { value: 'basic', label: 'Basic', hours: 12 },
  { value: 'custom', label: 'Custom', hours: 18 },
  { value: 'high_end', label: 'High-end', hours: 24 },
];

export const COMPLEXITIES: { value: Complexity; label: string; multiplier: string }[] = [
  { value: 'simple', label: 'Simple', multiplier: '×1.00' },
  { value: 'complex', label: 'Complex', multiplier: '×1.50' },
];

export const FEATURES: { value: Feature; label: string; hours: number }[] = [
  { value: 'contact_form', label: 'Contact Form', hours: 4 },
  { value: 'cms_blog', label: 'CMS / Blog', hours: 12 },
  { value: 'authentication', label: 'Authentication', hours: 16 },
  { value: 'dashboard_admin', label: 'Dashboard / Admin', hours: 24 },
  { value: 'payment_integration', label: 'Payment Integration', hours: 16 },
  { value: 'api_integration', label: 'API Integration', hours: 12 },
];

export const ROUNDING_MODES: { value: RoundingMode; label: string }[] = [
  { value: 'none', label: 'None (Exact Price)' },
  { value: 'nearest_1000', label: 'Nearest ₱1,000' },
  { value: 'nearest_5000', label: 'Nearest ₱5,000' },
];

export const HOSTING_PLANS: { 
  value: HostingPlan; 
  label: string; 
  price: number; 
  description: string;
  includes: string[];
  bestFor: string[];
}[] = [
  {
    value: 'none',
    label: 'No Hosting',
    price: 0,
    description: 'Client handles hosting and maintenance.',
    includes: [],
    bestFor: []
  },
  {
    value: 'basic',
    label: 'Basic Plan',
    price: 1500,
    description: 'Managed hosting for simple business websites.',
    includes: [
      'Managed hosting',
      'Domain connection + SSL',
      'Basic monitoring',
      'Email support'
    ],
    bestFor: [
      'Simple business websites',
      'Landing pages'
    ]
  },
  {
    value: 'standard',
    label: 'Standard Plan',
    price: 4000,
    description: 'Managed hosting, maintenance, updates, and support.',
    includes: [
      'Everything in Basic',
      'Ongoing maintenance',
      'Bug fixes',
      'Minor content updates',
      'Performance checks'
    ],
    bestFor: [
      'Most client websites',
      'SMEs'
    ]
  },
  {
    value: 'advanced',
    label: 'Advanced Plan',
    price: 8000,
    description: 'Business-critical hosting with priority support and SEO.',
    includes: [
      'Everything in Standard',
      'Priority support',
      'SEO support (basic)',
      'Analytics tracking',
      'Faster turnaround'
    ],
    bestFor: [
      'E-commerce',
      'High-traffic sites',
      'Business-critical systems'
    ]
  }
];

export const PROPOSAL_STATUSES = [
  { value: 'draft', label: 'Draft', icon: 'solar:pen-new-square-linear', color: 'text-nw-graphite' },
  { value: 'sent', label: 'Sent', icon: 'solar:letter-linear', color: 'text-blue-500' },
  { value: 'viewed', label: 'Viewed', icon: 'solar:eye-linear', color: 'text-purple-500' },
  { value: 'approved', label: 'Approved', icon: 'solar:check-circle-linear', color: 'text-nw-emerald' },
  { value: 'rejected', label: 'Rejected', icon: 'solar:close-circle-linear', color: 'text-red-500' },
  { value: 'converted', label: 'Converted', icon: 'solar:transfer-horizontal-linear', color: 'text-nw-acid' },
  { value: 'paid', label: 'Paid', icon: 'solar:dollar-minimalistic-linear', color: 'text-emerald-600' },
];

export const DEFAULTS: CalculatorInput = {
  hourlyRate: 600,
  bufferPercent: 10,
  roundingMode: 'nearest_1000' as RoundingMode,
  complexity: 'simple' as Complexity,
  designLevel: 'custom' as DesignLevel,
  projectType: 'business_website' as ProjectType,
  pages: 5,
  hostingPlan: 'standard' as HostingPlan,
  features: [] as Feature[],
  discountPercent: 0,
  status: 'draft',
  proposal: {
    clientName: "",
    projectName: "",
    projectOverview: "A high-performance digital presence designed to elevate brand authority and drive conversions.",
    businessGoals: "1. Increase online visibility\n2. Streamline customer acquisition\n3. Establish professional digital credibility",
    scopeOfWork: "End-to-end development including UI/UX design, frontend development, CMS integration, and deployment.",
    deliverables: "• Responsive Website\n• Content Management System\n• Technical Documentation\n• 30-day Post-launch Support",
    timeline: "Estimated 4-6 weeks from kickoff to deployment.",
    exclusions: "• Content writing/Copywriting\n• Professional photography\n• Third-party API subscription fees",
    assumptions: "• Client will provide branding assets\n• Feedback cycles will be completed within 48 hours",
    paymentTerms: "50% upfront deposit to commence work. 50% upon project completion and deployment.",
    validityPeriod: "30 Days",
  }
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
      complexity: "simple",
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
