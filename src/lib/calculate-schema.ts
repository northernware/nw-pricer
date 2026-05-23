import { z } from "zod";

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

export const calculateRequestSchema = z.object({
  projectType,
  pages: z.number().int().min(1).max(100),
  designLevel,
  complexity,
  features: z.array(feature).optional(),
  hourlyRate: z.number().positive().optional(),
  bufferPercent: z.number().min(0).max(100).optional(),
  roundingMode: roundingMode.optional(),
  hostingPlan: hostingPlan.optional(),
  seoPlan: seoPlan.optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  currency: currency.optional(),
});

export type CalculateRequest = z.infer<typeof calculateRequestSchema>;

export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_root";
    if (!fieldErrors[path]) fieldErrors[path] = [];
    fieldErrors[path].push(issue.message);
  }
  return fieldErrors;
}
