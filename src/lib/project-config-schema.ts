import { z } from "zod";
import type { CalculatorInput } from "@/lib/calculator";
import { DEFAULTS } from "@/lib/constants";

const projectType = z.enum([
  "business_website",
  "ecommerce",
  "redesign",
  "custom_system",
]);
const designLevel = z.enum(["basic", "custom", "high_end"]);
const complexity = z.enum(["simple", "complex"]);
const feature = z.enum([
  "contact_form",
  "cms_blog",
  "authentication",
  "dashboard_admin",
  "payment_integration",
  "api_integration",
]);
const roundingMode = z.enum(["none", "nearest_1000", "nearest_5000"]);
const hostingPlan = z.enum(["none", "basic", "standard", "advanced"]);
const seoPlan = z.enum(["none", "essential", "growth", "premium"]);
const currency = z.enum(["PHP", "USD", "EUR", "GBP"]);

const proposalSchema = z
  .object({
    clientName: z.string(),
    clientFirstName: z.string(),
    clientLastName: z.string(),
    clientCompany: z.string(),
    clientSignerTitle: z.string().optional(),
    pageNames: z.array(z.string()).optional(),
    projectName: z.string(),
    projectOverview: z.string(),
    businessGoals: z.string(),
    scopeOfWork: z.string(),
    deliverables: z.string(),
    presentationDate: z.string(),
    backupTerm: z.string(),
    maintenanceDays: z.string(),
    exclusions: z.string(),
    assumptions: z.string(),
    paymentTerms: z.string(),
  })
  .passthrough();

const invoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  percentage: z.number(),
  status: z.enum(["unpaid", "paid"]),
});

export const projectConfigSchema = z.object({
  projectType,
  pages: z.coerce.number().int().min(1).max(100),
  designLevel,
  complexity,
  features: z.array(feature),
  hourlyRate: z.coerce.number().positive(),
  bufferPercent: z.coerce.number().min(0).max(100),
  roundingMode,
  hostingPlan,
  seoPlan,
  discountPercent: z.coerce.number().min(0).max(100),
  currency,
  proposal: proposalSchema,
  invoices: z.array(invoiceSchema),
});

function mergeWithDefaults(raw: unknown): unknown {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return DEFAULTS;
  }
  const patch = raw as Record<string, unknown>;
  return {
    ...DEFAULTS,
    ...patch,
    proposal: {
      ...DEFAULTS.proposal,
      ...(typeof patch.proposal === "object" && patch.proposal !== null
        ? patch.proposal
        : {}),
    },
    invoices: Array.isArray(patch.invoices) ? patch.invoices : DEFAULTS.invoices,
    features: Array.isArray(patch.features) ? patch.features : DEFAULTS.features,
  };
}

/** Parse and normalize Prisma JSON project config. Falls back to DEFAULTS for invalid fields. */
export function parseProjectConfig(raw: unknown): CalculatorInput {
  const merged = mergeWithDefaults(raw);
  const result = projectConfigSchema.safeParse(merged);
  if (result.success) {
    return {
      ...result.data,
      proposal: {
        ...DEFAULTS.proposal,
        ...result.data.proposal,
      },
    };
  }
  console.warn("Invalid project config, using defaults where needed:", result.error.flatten());
  return projectConfigSchema.parse(DEFAULTS);
}

/** Validate before persisting; throws ZodError if invalid. */
export function assertProjectConfig(config: unknown): CalculatorInput {
  const merged = mergeWithDefaults(config);
  const result = projectConfigSchema.safeParse(merged);
  if (!result.success) {
    throw result.error;
  }
  return {
    ...result.data,
    proposal: { ...DEFAULTS.proposal, ...result.data.proposal },
  };
}
