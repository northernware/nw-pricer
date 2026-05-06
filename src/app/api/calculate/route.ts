import { NextRequest, NextResponse } from "next/server";
import { calculate } from "@/lib/calculator";
import type { CalculatorInput } from "@/lib/calculator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CalculatorInput;

    // Validate required fields
    if (!body.projectType || !body.pages || !body.designLevel || !body.complexity) {
      return NextResponse.json(
        { error: "Missing required fields: projectType, pages, designLevel, complexity" },
        { status: 400 }
      );
    }

    const input: CalculatorInput = {
      ...body,
      projectType: body.projectType,
      pages: Math.max(1, Math.min(100, body.pages)),
      designLevel: body.designLevel,
      complexity: body.complexity,
      features: body.features || [],
      hourlyRate: body.hourlyRate || 700,
      bufferPercent: body.bufferPercent ?? 30,
      roundingMode: body.roundingMode || "nearest_1000",
      hostingPlan: body.hostingPlan || "none",
      discountPercent: body.discountPercent || 0,
      proposal: body.proposal || ({} as any),
      invoices: body.invoices || [],
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
