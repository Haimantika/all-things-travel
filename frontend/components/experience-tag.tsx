"use client"

import { Badge } from "@/components/ui/badge"

interface ExperienceTagProps {
  country: string
  colorIndex: number
  isSelected: boolean
  count?: number
  onClick: () => void
}

export function ExperienceTag({ country, colorIndex, isSelected, count, onClick }: ExperienceTagProps) {
  // Array of fun colors for the tags
  const colors = [
    "bg-[#FF6B6B] hover:bg-[#FF9E9E]",
    "bg-[#4ECDC4] hover:bg-[#36B5AC]",
    "bg-[#FFD166] hover:bg-[#FFC44D]",
    "bg-[#FF9E9E] hover:bg-[#FFB6B6]",
    "bg-[#36B5AC] hover:bg-[#2A9D94]",
  ]

  // Selected state colors
  const selectedColors = [
    "bg-[#FF4747] ring-2 ring-[#FF6B6B] ring-offset-2",
    "bg-[#2AB5AC] ring-2 ring-[#4ECDC4] ring-offset-2",
    "bg-[#FFBA33] ring-2 ring-[#FFD166] ring-offset-2",
    "bg-[#FF8585] ring-2 ring-[#FF9E9E] ring-offset-2",
    "bg-[#1A9D94] ring-2 ring-[#36B5AC] ring-offset-2",
  ]

  // Text colors for each background color
  const textColors = ["text-white", "text-white", "text-[#333]", "text-[#333]", "text-white"]

  const bgColor = isSelected ? selectedColors[colorIndex % selectedColors.length] : colors[colorIndex % colors.length]
  const textColor = textColors[colorIndex % textColors.length]

  return (
    <Badge
      className={`px-3 py-2 text-sm font-medium cursor-pointer ${bgColor} ${textColor} border-none transition-all duration-200`}
      onClick={onClick}
    >
      {country} {count && count > 1 && <span className="ml-1 opacity-80">({count})</span>}
    </Badge>
  )
}

