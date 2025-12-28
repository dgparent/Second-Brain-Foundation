import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 border-b border-gray-200 bg-white text-black">
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <img 
            src="/hyperbrowser_symbol-light.svg" 
            alt="Hyperbrowser Logo" 
            width="20" 
            height="20"
            className="shrink-0"
          />
          <h1 className="text-base sm:text-lg font-bold tracking-tight">HyperbookLM</h1>
        </div>
        <span className="text-[10px] sm:text-xs text-gray-600 font-medium tracking-wide bg-gray-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
          Powered by Hyperbrowser
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Link 
          href="https://hyperbrowser.ai" 
          target="_blank" 
          className="text-xs sm:text-sm text-gray-600 hover:text-black transition-colors hidden sm:inline"
        >
          Get Hyperbrowser API Key
        </Link>
        <Button 
          variant="outline" 
          className="bg-black text-white hover:bg-gray-800 hover:text-white border-none font-medium h-8 sm:h-9 px-2 sm:px-4 gap-1 sm:gap-2 text-xs sm:text-sm"
          onClick={() => window.location.reload()}
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Create Notebook</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>
    </header>
  );
}
