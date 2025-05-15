import { CalendarRange, Backpack } from "lucide-react"

interface TripPlannerCardProps {
  data: {
    destination: string
    itinerary: Array<{
      day: number
      activities: string[]
    }>
    packingList: string[]
  }
}

export function TripPlannerCard({ data }: TripPlannerCardProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mt-8 overflow-hidden rounded-xl shadow-lg">
      {/* Card Header with Gradient */}
      <div className="relative p-6 bg-[#4ECDC4]/10">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#4ECDC4]"></div>
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold flex items-center gap-2 text-[#333]">
            <CalendarRange className="h-6 w-6 text-[#4ECDC4]" />
            Your Trip to {data.destination}
          </h3>
        </div>
        <p className="text-[#666] mt-1">Personalized itinerary and packing list for your adventure</p>
      </div>

      {/* Card Content */}
      <div className="bg-white p-6">
        {/* Itinerary Section */}
        <div className="mb-8">
          <h4 className="text-xl font-bold mb-4 text-[#333] flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-[#4ECDC4]" />
            Suggested Itinerary
          </h4>

          <div className="space-y-6">
            {data.itinerary.map((day) => (
              <div key={day.day} className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-bold text-[#4ECDC4] mb-2">Day {day.day}</h5>
                <ul className="space-y-2">
                  {day.activities.map((activity, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#4ECDC4] font-bold">•</span>
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Packing List Section */}
        <div>
          <h4 className="text-xl font-bold mb-4 text-[#333] flex items-center gap-2">
            <Backpack className="h-5 w-5 text-[#FF6B6B]" />
            Packing List
          </h4>

          <div className="bg-[#FF6B6B]/5 p-4 rounded-lg">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.packingList.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#FF6B6B] font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
