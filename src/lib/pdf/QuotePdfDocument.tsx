import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { CalculatorInput, CalculatorOutput } from "@/lib/calculator";
import { CURRENCIES, FEATURES, HOSTING_PLANS, SEO_PLANS, PROJECT_TYPES } from "@/lib/constants";

const NW = {
  black: "#0A0A0A",
  acid: "#FF3800",
  graphite: "#5C5C5C",
  bone: "#F9F9F9",
};

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 10,
    color: NW.black,
    fontFamily: "Helvetica",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: NW.black,
    paddingBottom: 16,
    marginBottom: 24,
  },
  brand: { fontSize: 22, fontWeight: 700 },
  brandMark: { color: NW.acid, fontSize: 10 },
  subtitle: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: NW.graphite,
    marginTop: 4,
  },
  meta: { fontSize: 8, color: NW.graphite, textAlign: "right", lineHeight: 1.5 },
  clientBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: NW.bone,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: NW.acid,
    marginBottom: 24,
  },
  label: {
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: NW.graphite,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: NW.acid,
    marginBottom: 8,
    marginTop: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingVertical: 8,
  },
  totalBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: NW.black,
    color: "#FFFFFF",
    padding: 14,
    marginTop: 12,
  },
  totalAmount: { color: NW.acid, fontSize: 16, fontWeight: 700 },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    textAlign: "center",
    fontSize: 7,
    color: NW.graphite,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});

export type PdfDocKind = "Quotation" | "Proposal" | "Contract";

interface QuotePdfDocumentProps {
  kind: PdfDocKind;
  input: CalculatorInput;
  result: CalculatorOutput;
  projectId?: string | null;
}

export function QuotePdfDocument({
  kind,
  input,
  result,
  projectId,
}: QuotePdfDocumentProps) {
  const currency = CURRENCIES.find((c) => c.value === input.currency) || CURRENCIES[0];
  const fmt = (n: number) =>
    `${currency.symbol}${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  const prefix =
    kind === "Contract" ? "CTR" : kind === "Proposal" ? "PRP" : "QUO";
  const docId = projectId ? `${prefix}-${projectId.toUpperCase()}` : prefix;
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const projectTypeLabel =
    PROJECT_TYPES.find((p) => p.value === input.projectType)?.label || input.projectType;
  const hostingPlan = HOSTING_PLANS.find((h) => h.value === input.hostingPlan);
  const seoPlan = SEO_PLANS.find((s) => s.value === input.seoPlan);
  const featureCost =
    result.featureHours * result.complexityMultiplier * input.hourlyRate;

  return (
    <Document title={`NW-${kind}`} author="Northernware">
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>
              northernware<Text style={styles.brandMark}>®</Text>
            </Text>
            <Text style={styles.subtitle}>{kind.toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.meta}>DOCUMENT ID: {docId}</Text>
            <Text style={styles.meta}>DATE: {today}</Text>
          </View>
        </View>

        <View style={styles.clientBox}>
          <View>
            <Text style={styles.label}>Prepared For</Text>
            <Text style={{ fontSize: 12, fontWeight: 700 }}>
              {input.proposal.clientName || "Valued Client"}
            </Text>
            <Text style={{ fontSize: 9, color: NW.graphite }}>
              {input.proposal.projectName || "New Digital Project"}
            </Text>
          </View>
          <View>
            <Text style={[styles.label, { textAlign: "right" }]}>Service Provider</Text>
            <Text style={{ fontSize: 9, textAlign: "right" }}>Northernware</Text>
            <Text style={{ fontSize: 8, color: NW.graphite, textAlign: "right" }}>
              Tabuk City, Kalinga, Philippines
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Financial Investment</Text>
        <View style={styles.row}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ fontWeight: 700 }}>Core Architecture & Development</Text>
            <Text style={{ fontSize: 8, color: NW.graphite }}>
              {input.pages} pages · {projectTypeLabel} ({input.complexity})
            </Text>
          </View>
          <Text style={{ fontWeight: 700 }}>{fmt(result.baseCost)}</Text>
        </View>
        {input.features.length > 0 && (
          <View style={styles.row}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ fontWeight: 700 }}>Custom Features</Text>
              <Text style={{ fontSize: 8, color: NW.graphite }}>
                {input.features
                  .map((f) => FEATURES.find((x) => x.value === f)?.label ?? f)
                  .join(", ")}
              </Text>
            </View>
            <Text style={{ fontWeight: 700 }}>{fmt(featureCost)}</Text>
          </View>
        )}
        {hostingPlan && hostingPlan.value !== "none" && (
          <View style={styles.row}>
            <Text>{hostingPlan.label} (MRR)</Text>
            <Text style={{ fontWeight: 700 }}>{fmt(hostingPlan.price)} /mo</Text>
          </View>
        )}
        {seoPlan && seoPlan.value !== "none" && (
          <View style={styles.row}>
            <Text>{seoPlan.label} (MRR)</Text>
            <Text style={{ fontWeight: 700 }}>{fmt(seoPlan.price)} /mo</Text>
          </View>
        )}

        {input.discountPercent > 0 && (
          <View style={styles.row}>
            <Text>Discount ({input.discountPercent}%)</Text>
            <Text style={{ color: NW.acid }}>-{fmt(result.discountAmount)}</Text>
          </View>
        )}

        <View style={styles.totalBar}>
          <Text style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
            Total Investment (one-time)
          </Text>
          <Text style={styles.totalAmount}>{fmt(result.roundedPrice)}</Text>
        </View>

        <Text style={styles.footer} fixed>
          Northernware Software Development Services · Confidential · {docId}
        </Text>
      </Page>
    </Document>
  );
}
