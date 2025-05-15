"use client"
import { Stamp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

interface VisaSelectorProps {
  onVisaSelectionChange: (selectedVisas: string[]) => void;
}

export function VisaSelector({ onVisaSelectionChange }: VisaSelectorProps) {
  const [selectedVisas, setSelectedVisas] = useState<string[]>([]);

  const visaOptions = [
    { id: "UnitedStates", label: "United States" },
    { id: "UnitedKingdom", label: "United Kingdom" },
    { id: "Canada", label: "Canada" },
    { id: "Schengen", label: "Schengen" },
    { id: "Japan", label: "Japan" },
    { id: "Australia", label: "Australia" },
    { id: "NewZealand", label: "New Zealand" },
    { id: "Singapore", label: "Singapore" },
  ];

  const toggleVisa = (visaId: string) => {
    let newSelectedVisas: string[];
    
    if (selectedVisas.includes(visaId)) {
      newSelectedVisas = selectedVisas.filter(id => id !== visaId);
    } else {
      newSelectedVisas = [...selectedVisas, visaId];
    }
    
    setSelectedVisas(newSelectedVisas);
    onVisaSelectionChange(newSelectedVisas);
  };

  return (
    <Card className="bg-white w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Stamp className="h-5 w-5 text-[#FF6B6B]" />
          Select visas you hold
        </CardTitle>
        <CardDescription>
          Having these visas typically enables you to travel to other countries as well
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-2">
          {visaOptions.map(visa => (
            <Button
              key={visa.id}
              variant={selectedVisas.includes(visa.id) ? "default" : "outline"}
              className={`
                flex justify-center items-center
                ${selectedVisas.includes(visa.id) 
                  ? "bg-[#FF6B6B] hover:bg-[#FF9E9E] text-white" 
                  : "hover:bg-gray-100 text-gray-700"}
              `}
              onClick={() => toggleVisa(visa.id)}
            >
              {visa.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Select all visas you currently hold to see which countries you can visit
        </p>
      </CardContent>
    </Card>
  );
} 