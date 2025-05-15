"use client"

import { CalendarRange } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface TravelPlanCardProps {
  destination: string
  content: string
}

export function TravelPlanCard({ destination, content }: TravelPlanCardProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mt-8 overflow-hidden rounded-xl shadow-lg">
      {/* Card Header with Gradient */}
      <div className="relative p-6 bg-[#4ECDC4]/10">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#4ECDC4]"></div>
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold flex items-center gap-2 text-[#333]">
            <CalendarRange className="h-6 w-6 text-[#4ECDC4]" />
            Your Trip to {destination}
          </h3>
        </div>
        <p className="text-[#666] mt-1">Personalized itinerary and packing list for your adventure</p>
      </div>

      {/* Card Content */}
      <div className="bg-white p-6">
        <div className="prose prose-sm md:prose-base max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
