import Calculator from "@/components/Calculator";
import Footer from "@/components/Footer";
import { Suspense } from "react";

export default function AdminCalculatorPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen font-mono text-xs uppercase tracking-widest text-nw-graphite">Loading Engine...</div>}>
      <Calculator />
      <Footer />
    </Suspense>
  );
}
