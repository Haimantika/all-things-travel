"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Globe, Compass, MapPin, Plane } from "lucide-react"
import { useState } from "react"
import { countryNameToCode } from "@/lib/countries"
import { VisaInfoCard } from "@/components/visa-info-card"
import { Header } from "@/components/header"

export default function Home() {
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [visaInfo, setVisaInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCountryCode = (countryName: string): string | null => {
    const normalizedName = countryName.trim()
    // Try exact match first
    if (countryNameToCode[normalizedName]) {
      return countryNameToCode[normalizedName]
    }
    // Try case-insensitive match
    const foundCountry = Object.keys(countryNameToCode).find(
      (key) => key.toLowerCase() === normalizedName.toLowerCase(),
    )
    return foundCountry ? countryNameToCode[foundCountry] : null
  }

  const handleFindAdventure = async () => {
    if (!fromLocation || !toLocation) {
      setError("Please enter both departure and destination locations")
      return
    }

    const fromCode = getCountryCode(fromLocation)
    const toCode = getCountryCode(toLocation)

    if (!fromCode || !toCode) {
      setError("Please enter valid country names")
      return
    }

    setError(null)
    setIsLoading(true)
    try {
      const data = `passport=${fromCode}&destination=${toCode}`
      const xhr = new XMLHttpRequest()
      xhr.withCredentials = true

      xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
          setVisaInfo(JSON.parse(this.responseText))
          setIsLoading(false)
        }
      })

      xhr.open("POST", "https://visa-requirement.p.rapidapi.com/")
      xhr.setRequestHeader("x-rapidapi-key", process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "")
      xhr.setRequestHeader("x-rapidapi-host", process.env.NEXT_PUBLIC_RAPIDAPI_HOST || "")
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")

      xhr.send(data)
    } catch (error) {
      console.error("Error fetching visa information:", error)
      setError("Failed to fetch visa information. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8E1]">
      {/* Header with navigation */}
      <Header showNavigation={true} />

      {/* Fun Hero Section with Flight Search */}
      <section className="container mx-auto px-4 py-8">
        <div className="relative bg-[#FFD166] rounded-3xl p-8 overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#FF9E9E] rounded-full opacity-30"></div>
          <div className="absolute -left-10 -bottom-20 w-48 h-48 bg-[#4ECDC4] rounded-full opacity-20"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-[#333] mb-4 leading-tight text-center">
              Where are you <span className="text-[#FF6B6B]">flying</span> to? ✈️
            </h1>
            <p className="text-lg text-[#333] mb-8 text-center">
              Find your perfect adventure with Nomado - visa info, fun itineraries, and travel essentials!
            </p>

            {/* Flight Search Form */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <label htmlFor="from" className="block text-sm font-medium text-[#666] mb-1">
                    From
                  </label>
                  <div className="relative">
                    <Plane className="absolute left-3 top-3 h-5 w-5 text-[#FF6B6B]" />
                    <Input
                      id="from"
                      placeholder="Enter your country (e.g., United States)"
                      className="pl-10 pr-4 py-6 rounded-xl border-[#FFD166] focus:border-[#FF6B6B]"
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="to" className="block text-sm font-medium text-[#666] mb-1">
                    To
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-[#4ECDC4]" />
                    <Input
                      id="to"
                      placeholder="Enter destination country (e.g., United Arab Emirates)"
                      className="pl-10 pr-4 py-6 rounded-xl border-[#FFD166] focus:border-[#FF6B6B]"
                      value={toLocation}
                      onChange={(e) => setToLocation(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-[#FF6B6B] hover:bg-[#FF9E9E] text-white py-6 rounded-xl text-lg"
                onClick={handleFindAdventure}
                disabled={isLoading}
              >
                {isLoading ? "Finding Adventure..." : "Find My Adventure!"}
              </Button>
            </div>

            {/* Error Message */}
            {error && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">{error}</div>}

            {/* Visa Information Card */}
            {visaInfo && <VisaInfoCard {...visaInfo} />}
          </div>
        </div>
      </section>

      {/* Fun Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-[#333] mb-2">What's in my travel bag?</h2>
        <p className="text-center text-[#666] mb-12 max-w-2xl mx-auto">
          Nomado helps you with all the boring stuff so you can focus on the fun parts!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform border-t-8 border-[#FF6B6B]">
            <div className="w-16 h-16 bg-[#FF6B6B] rounded-full flex items-center justify-center mb-4 mx-auto">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-center text-[#333]">Visa Stuff Made Easy</h3>
            <p className="text-[#666] text-center">
              "Do I need a visa?" We'll tell you! No more boring embassy website searches.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform border-t-8 border-[#4ECDC4]">
            <div className="w-16 h-16 bg-[#4ECDC4] rounded-full flex items-center justify-center mb-4 mx-auto">
              <Compass className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-center text-[#333]">Fun Itineraries</h3>
            <p className="text-[#666] text-center">
              Tell us what you love, and we'll plan your days. Food tours? Art? Shopping? We got you!
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform border-t-8 border-[#FFD166]">
            <div className="w-16 h-16 bg-[#FFD166] rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-white"
              >
                <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5Z"></path>
                <path d="M6 9.01V9"></path>
                <path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-center text-[#333]">Packing Genius</h3>
            <p className="text-[#666] text-center">
              "Oops, forgot my charger!" Not anymore! We'll remind you to pack everything you need.
            </p>
          </div>
        </div>
      </section>

      {/* Fun Footer */}
      <footer className="bg-[#333] text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center gap-4 mb-4">
            {["🌍", "🧳", "🗺️", "🏖️", "✈️"].map((emoji, index) => (
              <div key={index} className="text-2xl">
                {emoji}
              </div>
            ))}
          </div>
          <p className="mb-2">Made with ❤️ by a fellow travel enthusiast</p>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Nomado</p>
        </div>
      </footer>
    </div>
  )
}


