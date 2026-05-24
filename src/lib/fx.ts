import type { CurrencyCode } from "@/lib/calculator";

/**
 * Reference FX: units of each currency per 1 PHP (indicative, not live market).
 * Override via FX_RATES_JSON env, e.g. {"PHP":1,"USD":0.0172,"EUR":0.016,"GBP":0.0138}
 */
export const DEFAULT_FX_PER_PHP: Record<CurrencyCode, number> = {
  PHP: 1,
  USD: 0.0172, // ~58 PHP/USD
  EUR: 0.0161, // ~62 PHP/EUR
  GBP: 0.0139, // ~72 PHP/GBP
};

export function getFxRatesPerPhp(): Record<CurrencyCode, number> {
  const raw = process.env.FX_RATES_JSON;
  if (!raw) return { ...DEFAULT_FX_PER_PHP };

  try {
    const parsed = JSON.parse(raw) as Partial<Record<CurrencyCode, number>>;
    return {
      PHP: parsed.PHP ?? DEFAULT_FX_PER_PHP.PHP,
      USD: parsed.USD ?? DEFAULT_FX_PER_PHP.USD,
      EUR: parsed.EUR ?? DEFAULT_FX_PER_PHP.EUR,
      GBP: parsed.GBP ?? DEFAULT_FX_PER_PHP.GBP,
    };
  } catch {
    return { ...DEFAULT_FX_PER_PHP };
  }
}

/** Client-safe rates (defaults only; env overrides apply on server). */
export const FX_PER_PHP = DEFAULT_FX_PER_PHP;

function toPhp(amount: number, currency: CurrencyCode, rates: Record<CurrencyCode, number>): number {
  const rate = rates[currency];
  if (!rate || rate <= 0) return amount;
  return amount / rate;
}

function fromPhp(amountPhp: number, currency: CurrencyCode, rates: Record<CurrencyCode, number>): number {
  return amountPhp * (rates[currency] ?? 1);
}

export function convertAmount(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: Record<CurrencyCode, number> = FX_PER_PHP
): number {
  if (from === to) return amount;
  const php = toPhp(amount, from, rates);
  return fromPhp(php, to, rates);
}

/** Round hourly rate for UI entry (whole PHP, 2 decimals for FX). */
export function roundHourlyRate(amount: number, currency: CurrencyCode): number {
  if (currency === "PHP") return Math.round(amount);
  return Math.round(amount * 100) / 100;
}

export function formatFxHint(from: CurrencyCode, to: CurrencyCode): string {
  const rates = FX_PER_PHP;
  const onePhpInTarget = rates[to];
  if (from === "PHP" && to !== "PHP") {
    return `1 PHP ≈ ${onePhpInTarget.toFixed(4)} ${to}`;
  }
  if (to === "PHP" && from !== "PHP") {
    const phpPerUnit = 1 / (rates[from] || 1);
    return `1 ${from} ≈ ${phpPerUnit.toFixed(2)} PHP`;
  }
  const viaPhp = convertAmount(1, from, to, rates);
  return `1 ${from} ≈ ${viaPhp.toFixed(4)} ${to}`;
}
