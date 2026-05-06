"use client";

import { useState } from "react";
import { approveProjectAction } from "@/app/actions";

export default function SignatureBlock({ 
  projectId, 
  isApproved, 
  signedBy, 
  approvedAt,
  title,
  ipAddress,
  snapshotHash
}: { 
  projectId: string, 
  isApproved: boolean, 
  signedBy?: string | null, 
  approvedAt?: Date | null,
  title?: string,
  ipAddress?: string | null,
  snapshotHash?: string | null
}) {
  const [signature, setSignature] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    if (!signature.trim()) {
      setError("Please type your full name to sign and accept.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    const res = await approveProjectAction(projectId, signature);
    
    setIsSubmitting(false);
    
    if (!res.success) {
      setError(res.error || "Failed to approve the project.");
    }
  };

  if (isApproved) {
    return (
      <div className="w-full border border-nw-acid bg-nw-acid/5 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-nw-acid text-nw-black text-[9px] font-bold uppercase track-widest px-3 py-1 font-mono">
          LEGALLY BINDING
        </div>
        <div className="text-[10px] font-bold uppercase track-widest mb-6 text-nw-acid font-mono">
          Accepted & Approved By (Client)
        </div>
        
        <div className="font-display text-2xl font-bold mb-1 italic text-nw-black wrap-break-word">
          {signedBy}
        </div>
        {title && (
          <div className="text-[10px] text-nw-acid font-mono uppercase mb-1">
            {title}
          </div>
        )}
        <div className="text-[11px] text-nw-graphite font-mono uppercase">
          Digitally Signed
        </div>
        
        <div className="mt-6 pt-4 border-t border-nw-acid/20 text-[10px] font-mono text-nw-graphite leading-relaxed">
          Timestamp: {approvedAt ? new Date(approvedAt).toLocaleString('en-PH') : 'Unknown'}<br />
          IP: {ipAddress || "Logged"}<br />
          {snapshotHash && (
            <span className="break-all opacity-60">Hash: {snapshotHash.substring(0, 16)}...</span>
          )}
          <br />
          Verified Digital Record
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-[10px] font-bold uppercase track-widest mb-4 text-nw-graphite font-mono">
        Acceptance & Digital Signature
      </div>
      
      <p className="text-xs text-nw-graphite mb-6 leading-relaxed">
        By typing your name and clicking "Approve & Sign", you officially agree to the terms, scope, and financial investment outlined in this document. This serves as a legally binding digital signature.
      </p>

      <div className="space-y-4">
        <div>
          <input 
            type="text" 
            placeholder="Type your full legal name"
            className="w-full bg-transparent border-b-2 border-nw-black p-2 text-lg font-display placeholder:text-nw-graphite/40 focus:outline-none focus:border-nw-acid transition-colors"
            value={signature}
            onChange={(e) => {
              setSignature(e.target.value);
              setError(null);
            }}
            disabled={isSubmitting}
          />
          {error && <div className="text-xs text-red-500 mt-2 font-mono">{error}</div>}
        </div>
        
        <button
          onClick={handleApprove}
          disabled={isSubmitting}
          className={`w-full py-3 px-6 font-mono text-xs font-bold uppercase track-widest transition-all ${
            isSubmitting 
              ? 'bg-nw-graphite text-nw-bone cursor-not-allowed' 
              : 'bg-nw-black text-nw-bone hover:bg-nw-acid hover:text-nw-black'
          }`}
        >
          {isSubmitting ? 'Processing...' : 'Approve & Sign Document'}
        </button>
      </div>
    </div>
  );
}
