import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface DestinationCardProps {
  image: string
  title: string
  visaRequirement: string
  duration: string
}

export default function DestinationCard({ image, title, visaRequirement, duration }: DestinationCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={`${title} travel destination`}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-teal-500" />
          <h3 className="font-bold text-xl">{title}</h3>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-medium">Visa:</span> {visaRequirement}
          </p>
          <p>
            <span className="font-medium">Stay:</span> {duration}
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0 flex gap-2">
        <Button variant="outline" className="flex-1">
          Visa Info
        </Button>
        <Button className="flex-1 bg-teal-600 hover:bg-teal-700">Explore</Button>
      </CardFooter>
    </Card>
  )
}
