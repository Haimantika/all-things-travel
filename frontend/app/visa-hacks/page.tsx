"use client"
import { useState } from "react"
import { Header } from "@/components/header"
import { VisaSelector } from "@/components/visa-selector"
import { VisaUnlockCard } from "@/components/visa-unlock-card"
import { InfoIcon, Stamp } from "lucide-react"

export default function VisaHacksPage() {
  const [selectedVisas, setSelectedVisas] = useState<string[]>([]);

  const handleVisaSelectionChange = (visas: string[]) => {
    setSelectedVisas(visas);
  };

  return (
    <div className="min-h-screen bg-[#FFF8E1] pb-16 md:pb-0">
      {/* Header with navigation */}
      <Header showNavigation={true} />

      {/* Main Content */}
      <section className="container mx-auto px-4 py-4 md:py-8">
        <div className="relative bg-[#FFD166] rounded-3xl p-4 md:p-8 overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#FF9E9E] rounded-full opacity-30"></div>
          <div className="absolute -left-10 -bottom-20 w-48 h-48 bg-[#4ECDC4] rounded-full opacity-20"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold text-[#333] mb-2 md:mb-4 leading-tight text-center">
              Travel smart <span className="text-[#FF6B6B]">freedom</span> 🌏
            </h1>
            <p className="text-base md:text-lg text-[#333] mb-4 md:mb-8 text-center">
              Learn where your Indian passport can take you, with the visas you already have!
            </p>

            {/* Indian Passport Badge */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 flex items-center justify-center gap-2">
              <Stamp className="h-5 w-5 text-blue-500" />
              <p className="text-blue-700 font-medium">This is specifically for Indian passport holders.</p>
            </div>

            {/* Visa Selector Component */}
            <VisaSelector onVisaSelectionChange={handleVisaSelectionChange} />

            {/* Unlocked Countries Display */}
            {selectedVisas.length > 0 && <VisaUnlockCard selectedVisas={selectedVisas} />}

            {/* Information Card */}
            <div className="bg-white p-4 mt-4 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <InfoIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-800">How it works</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Many countries allow Indian passport holders to enter with simplified visa procedures if they already 
                    hold valid visas from countries like the US, UK, or Schengen. Select the visas you have above 
                    to see where you can travel with minimal visa hassle.
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 mt-4 text-center">
              ⚠️ Information provided is for reference only. Always verify visa requirements with the official embassy
              or consulate before planning your trip as policies may change.
            </p>
          </div>
        </div>
      </section>

      
    </div>
  );
} 