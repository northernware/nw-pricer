"use client";

import { useState } from "react";
import { createPaymongoLinkAction } from "@/app/actions";
import { Icon } from "@iconify/react";

export default function PaymentBlock({ 
  projectId, 
  amount, 
  description 
}: { 
  projectId: string, 
  amount: number, 
  description: string 
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setIsProcessing(true);
    setError(null);
    
    const res = await createPaymongoLinkAction(projectId, amount, description);
    
    if (res.success && res.checkoutUrl) {
      window.location.href = res.checkoutUrl;
    } else {
      setIsProcessing(false);
      setError(res.error || "Failed to initiate payment.");
    }
  };

  return (
    <div className="w-full md:w-[45%] border border-nw-acid/20 bg-nw-bone/30 p-6">
      <div className="text-[10px] font-bold uppercase track-widest mb-4 text-nw-graphite font-mono">
        Online Payment Integration
      </div>
      
      <p className="text-xs text-nw-graphite mb-6 leading-relaxed">
        Securely pay this invoice online via Credit Card, GCash, Maya, or Bank Transfer using our PayMongo integration.
      </p>

      <div className="space-y-4">
        <button
          onClick={handlePay}
          disabled={isProcessing}
          className={`w-full py-3 px-6 font-mono text-xs font-bold uppercase track-widest transition-all flex items-center justify-center gap-2 ${
            isProcessing 
              ? 'bg-nw-graphite text-nw-bone cursor-not-allowed' 
              : 'bg-nw-acid text-nw-black hover:bg-nw-black hover:text-nw-acid'
          }`}
        >
          {isProcessing ? (
             <>Processing...</>
          ) : (
            <>
              <Icon icon="solar:card-bold" width="18" />
              Pay via PayMongo
            </>
          )}
        </button>
        {error && <div className="text-xs text-red-500 mt-2 font-mono text-center">{error}</div>}
      </div>
    </div>
  );
}
