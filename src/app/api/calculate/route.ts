import { NextRequest, NextResponse } from "next/server";
import { calculate } from "@/lib/calculator";
import type { CalculatorInput } from "@/lib/calculator";
import { DEFAULTS } from "@/lib/constants";
import {
  calculateRequestSchema,
  formatZodErrors,
} from "@/lib/calculate-schema";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = calculateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fields: formatZodErrors(parsed.error),
      },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const input: CalculatorInput = {
    ...DEFAULTS,
    projectType: data.projectType,
    pages: data.pages,
    designLevel: data.designLevel,
    complexity: data.complexity,
    features: data.features ?? DEFAULTS.features,
    hourlyRate: data.hourlyRate ?? DEFAULTS.hourlyRate,
    bufferPercent: data.bufferPercent ?? DEFAULTS.bufferPercent,
    roundingMode: data.roundingMode ?? DEFAULTS.roundingMode,
    hostingPlan: data.hostingPlan ?? DEFAULTS.hostingPlan,
    seoPlan: data.seoPlan ?? DEFAULTS.seoPlan,
    discountPercent: data.discountPercent ?? DEFAULTS.discountPercent,
    currency: data.currency ?? DEFAULTS.currency,
  };

  const result = calculate(input);
  return NextResponse.json(result);
}
