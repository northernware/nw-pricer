import { NextRequest, NextResponse } from "next/server";
import { calculate } from "@/lib/calculator";
import type { CalculatorInput } from "@/lib/calculator";
import { DEFAULTS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CalculatorInput>;

    if (!body.projectType || body.pages == null || !body.designLevel || !body.complexity) {
      return NextResponse.json(
        { error: "Missing required fields: projectType, pages, designLevel, complexity" },
        { status: 400 }
      );
    }

    const input: CalculatorInput = {
      ...DEFAULTS,
      ...body,
      projectType: body.projectType,
      pages: Math.max(1, Math.min(100, body.pages)),
      designLevel: body.designLevel,
      complexity: body.complexity,
      features: body.features ?? DEFAULTS.features,
      hourlyRate: body.hourlyRate ?? DEFAULTS.hourlyRate,
      bufferPercent: body.bufferPercent ?? DEFAULTS.bufferPercent,
      roundingMode: body.roundingMode ?? DEFAULTS.roundingMode,
      hostingPlan: body.hostingPlan ?? DEFAULTS.hostingPlan,
      discountPercent: body.discountPercent ?? DEFAULTS.discountPercent,
      currency: body.currency ?? DEFAULTS.currency,
      proposal: body.proposal ?? DEFAULTS.proposal,
      invoices: body.invoices ?? DEFAULTS.invoices,
    };

    const result = calculate(input);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
