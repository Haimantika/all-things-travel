"use client"

import { CalendarRange, MapPin, Clock, Utensils, Backpack, Car, Star } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface TravelPlanCardProps {
  destination: string
  content: string
}

export function TravelPlanCard({ destination, content }: TravelPlanCardProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mt-6 overflow-hidden rounded-2xl shadow-xl border border-gray-100">
      {/* Card Header with Enhanced Gradient */}
      <div className="relative p-6 bg-gradient-to-r from-[#4ECDC4]/20 to-[#36B5AC]/20">
        <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b from-[#4ECDC4] to-[#36B5AC]"></div>
        <div className="flex justify-between items-center pl-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-full shadow-sm">
              <CalendarRange className="h-6 w-6 text-[#4ECDC4]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#333]">
                Your Trip to {destination}
              </h3>
              <p className="text-[#666] text-sm font-medium">Personalized itinerary and recommendations</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-[#FFD166] fill-current" />
            <Star className="h-4 w-4 text-[#FFD166] fill-current" />
            <Star className="h-4 w-4 text-[#FFD166] fill-current" />
            <Star className="h-4 w-4 text-[#FFD166] fill-current" />
            <Star className="h-4 w-4 text-[#FFD166] fill-current" />
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="bg-white p-6">
        <div className="prose prose-sm md:prose-base max-w-none">
          <ReactMarkdown
            components={{
              // Style headings
              h1: ({ node, ...props }) => (
                <h1 {...props} className="text-xl font-bold text-[#333] mb-4 flex items-center gap-2 bg-gradient-to-r from-[#4ECDC4]/10 to-transparent p-3 rounded-lg">
                  <MapPin className="h-5 w-5 text-[#4ECDC4]" />
                  {props.children}
                </h1>
              ),
              h2: ({ node, ...props }) => (
                <h2 {...props} className="text-lg font-bold text-[#4ECDC4] mt-5 mb-3 flex items-center gap-2 border-l-4 border-[#4ECDC4] pl-3">
                  <Clock className="h-4 w-4" />
                  {props.children}
                </h2>
              ),
              h3: ({ node, ...props }) => (
                <h3 {...props} className="text-base font-bold text-[#FF6B6B] mt-4 mb-2 flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  {props.children}
                </h3>
              ),
              h4: ({ node, ...props }) => (
                <h4 {...props} className="text-sm font-bold text-[#FFD166] mt-3 mb-2 flex items-center gap-2">
                  <Car className="h-3 w-3" />
                  {props.children}
                </h4>
              ),
              // Style lists
              ul: ({ node, ...props }) => (
                <ul {...props} className="space-y-2 list-none" />
              ),
              li: ({ node, ...props }) => (
                <li {...props} className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg flex items-start gap-3 border border-gray-200 hover:border-[#4ECDC4]/30 transition-colors">
                  <div className="flex-shrink-0 w-5 h-5 bg-[#4ECDC4]/10 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-[#4ECDC4] rounded-full"></div>
                  </div>
                  <div className="flex-1 text-[#333] font-medium leading-relaxed">{props.children}</div>
                </li>
              ),
              // Style paragraphs
              p: ({ node, ...props }) => (
                <p {...props} className="text-[#666] leading-relaxed mb-3" />
              ),
              // Style strong/bold text
              strong: ({ node, ...props }) => (
                <strong {...props} className="font-bold text-[#4ECDC4] bg-[#4ECDC4]/5 px-1 rounded" />
              ),
              // Style emphasis/italic text
              em: ({ node, ...props }) => (
                <em {...props} className="italic text-[#FF6B6B] font-medium" />
              ),
              // Style links
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  className="text-[#4ECDC4] hover:text-[#36B5AC] font-medium underline decoration-dotted"
                >
                  {props.children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
