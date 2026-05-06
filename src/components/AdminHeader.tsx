import Link from "next/link";
import { logoutAction } from "@/app/login/actions";
import { Icon } from "@iconify/react";
import ThemeToggle from "./ThemeToggle";

export default function AdminHeader() {
  return (
    <header className="border-b border-nw-black bg-nw-bone relative z-40">
      <div className="bg-noise absolute inset-0 z-0 pointer-events-none opacity-50"></div>
      
      <div className="w-full px-8 relative z-10 flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="font-display font-black text-xl tracking-tighter uppercase text-nw-black flex items-center gap-2">
            <Icon icon="solar:box-minimalistic-bold" className="text-nw-acid" />
            CRM
          </div>
          
          <nav className="hidden md:flex gap-6">
            <Link 
              href="/admin" 
              className="font-mono text-[10px] uppercase tracking-widest hover:text-nw-acid transition-colors"
            >
              Pipeline
            </Link>
            <Link 
              href="/admin/calculator" 
              className="font-mono text-[10px] uppercase tracking-widest hover:text-nw-acid transition-colors"
            >
              Pricing Engine
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="w-px h-4 bg-nw-graphite/30"></div>
          <form action={logoutAction}>
            <button 
              type="submit" 
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-nw-graphite hover:text-red-500 transition-colors"
            >
              <Icon icon="solar:logout-2-linear" />
              Disconnect
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
