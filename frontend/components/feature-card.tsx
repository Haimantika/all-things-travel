import { Card, CardContent } from "@/components/ui/card"
import { FileCheck, Luggage, MapPin } from "lucide-react"

interface FeatureCardProps {
  icon: "FileCheck" | "MapPin" | "Luggage"
  title: string
  description: string
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const IconComponent = () => {
    switch (icon) {
      case "FileCheck":
        return <FileCheck className="h-10 w-10 text-teal-500" />
      case "MapPin":
        return <MapPin className="h-10 w-10 text-teal-500" />
      case "Luggage":
        return <Luggage className="h-10 w-10 text-teal-500" />
      default:
        return null
    }
  }

  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6 text-center">
        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-teal-50 rounded-full mb-4">
          <IconComponent />
        </div>
        <h3 className="text-xl font-bold mb-2 text-teal-700">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )
}
