export default function ConfigTamperBanner() {
  return (
    <div
      role="alert"
      className="mb-6 border-2 border-amber-600 bg-amber-50 text-amber-950 px-4 py-3 font-mono text-[11px] uppercase tracking-wide"
    >
      <strong className="block text-xs mb-1">Document integrity warning</strong>
      This project was approved, but the configuration has changed since signing. The
      displayed content may not match the signed record.
    </div>
  );
}
