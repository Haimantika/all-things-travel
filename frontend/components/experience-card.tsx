import { Card, CardContent } from "@/components/ui/card"
import { User, MapPin, Calendar } from "lucide-react"
import type { TravelerExperience } from "@/components/community-section"

interface ExperienceCardProps {
  experience: TravelerExperience
  colorIndex: number
}

export function ExperienceCard({ experience, colorIndex }: ExperienceCardProps) {
  // Array of fun colors for the cards
  const colors = ["border-[#FF6B6B]", "border-[#4ECDC4]", "border-[#FFD166]", "border-[#FF9E9E]", "border-[#36B5AC]"]

  const bgColors = ["bg-[#FFF0F0]", "bg-[#F0FFFC]", "bg-[#FFF8E1]", "bg-[#FFF5F5]", "bg-[#F0FFFC]"]

  const iconColors = ["text-[#FF6B6B]", "text-[#4ECDC4]", "text-[#FFD166]", "text-[#FF9E9E]", "text-[#36B5AC]"]

  const borderColor = colors[colorIndex % colors.length]
  const bgColor = bgColors[colorIndex % bgColors.length]
  const iconColor = iconColors[colorIndex % iconColors.length]

  // Format the date if it exists
  const formattedDate = experience.createdAt
    ? new Date(experience.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md border-l-4 ${borderColor}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2 rounded-full ${bgColor} mt-1`}>
            <User className={`h-4 w-4 ${iconColor}`} />
          </div>
          <div>
            <h4 className="font-medium text-gray-800">{experience.userName}</h4>
            {formattedDate && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" /> {formattedDate}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2 rounded-full ${bgColor} mt-1`}>
            <MapPin className={`h-4 w-4 ${iconColor}`} />
          </div>
          <div className="font-medium text-gray-700">{experience.country}</div>
        </div>

        <div className="pl-10 text-gray-600">"{experience.experience}"</div>
      </CardContent>
    </Card>
  )
}
