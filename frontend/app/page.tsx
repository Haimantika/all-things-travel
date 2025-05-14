"use client"
import { Button } from "@/components/ui/button"
import { Compass, MapPin, Plane, Globe, StampIcon as Passport } from "lucide-react"
import { useState } from "react"
import { countryNameToCode } from "@/lib/countries"
import { VisaInfoCard } from "@/components/visa-info-card"
import { Header } from "@/components/header"
import { SimpleCountryDropdown } from "@/components/simple-country-dropdown"
import { MobileNavigation } from "@/components/mobile-navigation"

export default function Home() {
  const [passportCountry, setPassportCountry] = useState("")
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [visaInfo, setVisaInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState<string | null>(null)

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
    if (!passportCountry || !toLocation) {
      setError("Please select both passport country and destination country")
      return
    }

    const passportCode = getCountryCode(passportCountry)
    const toCode = getCountryCode(toLocation)

    if (!passportCode || !toCode) {
      setError("Please select valid countries")
      return
    }

    setError(null)
    setAdditionalInfo(null)
    setIsLoading(true)

    try {
      const data = `passport=${passportCode}&destination=${toCode}`
      const xhr = new XMLHttpRequest()
      xhr.withCredentials = true

      xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
          const response = JSON.parse(this.responseText)
          setVisaInfo(response)
          setIsLoading(false)

          // Check for special cases
          checkSpecialCases(passportCountry, fromLocation, toLocation, response)
        }
      })

      xhr.open("POST", "https://visa-requirement.p.rapidapi.com/")
      xhr.setRequestHeader("x-rapidapi-key", "a44fe90a4cmsh4069920c797fa54p17fa8bjsnd4baeb96a710")
      xhr.setRequestHeader("x-rapidapi-host", "visa-requirement.p.rapidapi.com")
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")

      xhr.send(data)
    } catch (error) {
      console.error("Error fetching visa information:", error)
      setError("Failed to fetch visa information. Please try again.")
      setIsLoading(false)
    }
  }

  // Function to check for special visa cases
  const checkSpecialCases = (passport: string, from: string, to: string, visaInfo: any) => {
    // Case: Indian passport holders with US visa traveling to Dubai
    if (
      passport === "India" &&
      from === "United States" &&
      to === "United Arab Emirates" &&
      visaInfo.visa !== "visa free"
    ) {
      setAdditionalInfo(
        "Special case: Indian passport holders with a valid US visa can get a visa on arrival in the UAE.",
      )
    }

    // Case: Many countries traveling to Turkey with valid Schengen, UK, or US visa
    else if (to === "Turkey" && visaInfo.visa !== "visa free" && ["United States", "United Kingdom"].includes(from)) {
      setAdditionalInfo(
        "Special case: Travelers with a valid Schengen, UK, or US visa may be eligible for an e-Visa or visa on arrival in Turkey.",
      )
    }

    // Add more special cases as needed
  }

  return (
    <div className="min-h-screen bg-[#FFF8E1] pb-16 md:pb-0">
      {/* Header with navigation */}
      <Header showNavigation={true} />

      {/* Fun Hero Section with Flight Search */}
      <section className="container mx-auto px-4 py-4 md:py-8">
        <div className="relative bg-[#FFD166] rounded-3xl p-4 md:p-8 overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#FF9E9E] rounded-full opacity-30"></div>
          <div className="absolute -left-10 -bottom-20 w-48 h-48 bg-[#4ECDC4] rounded-full opacity-20"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold text-[#333] mb-2 md:mb-4 leading-tight text-center">
              Where are you <span className="text-[#FF6B6B]">flying</span> to? ✈️
            </h1>
            <p className="text-base md:text-lg text-[#333] mb-4 md:mb-8 text-center">
              Find your perfect adventure with Nomado - visa info, fun itineraries, and travel essentials!
            </p>

            {/* Flight Search Form */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div className="relative">
                  <SimpleCountryDropdown
                    label="Passport Country"
                    value={passportCountry}
                    onChange={setPassportCountry}
                    placeholder="Select your passport country"
                    icon={<Passport className="h-5 w-5 text-[#FF6B6B]" />}
                  />
                </div>

                <div className="relative">
                  <SimpleCountryDropdown
                    label="From"
                    value={fromLocation}
                    onChange={setFromLocation}
                    placeholder="Select departure country"
                    icon={<Plane className="h-5 w-5 text-[#4ECDC4]" />}
                  />
                </div>

                <div className="relative">
                  <SimpleCountryDropdown
                    label="To"
                    value={toLocation}
                    onChange={setToLocation}
                    placeholder="Select destination country"
                    icon={<MapPin className="h-5 w-5 text-[#FFD166]" />}
                  />
                </div>
              </div>

              <Button
                className="w-full bg-[#FF6B6B] hover:bg-[#FF9E9E] text-white py-4 md:py-6 rounded-xl text-base md:text-lg"
                onClick={handleFindAdventure}
                disabled={isLoading}
              >
                {isLoading ? "Finding visa info..." : "Find visa info!"}
              </Button>
            </div>

            {/* Error Message */}
            {error && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">{error}</div>}

            {/* Special Case Information */}
            {additionalInfo && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
                <p className="font-medium mb-1">Additional Information</p>
                <p>{additionalInfo}</p>
              </div>
            )}

            {/* Visa Information Card */}
            {visaInfo && <VisaInfoCard {...visaInfo} additionalInfo={additionalInfo} />}
          </div>
        </div>
      </section>

      {/* Fun Features */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#333] mb-2">What's in my travel bag?</h2>
        <p className="text-center text-[#666] mb-8 md:mb-12 max-w-2xl mx-auto">
          Nomado helps you with all the boring stuff so you can focus on the fun parts!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform border-t-8 border-[#FF6B6B]">
            <div className="w-16 h-16 bg-[#FF6B6B] rounded-full flex items-center justify-center mb-4 mx-auto">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 text-center text-[#333]">Visa stuff made easy</h3>
            <p className="text-sm md:text-base text-[#666] text-center">
              "Do I need a visa?" We'll tell you! No more boring embassy website searches.
            </p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform border-t-8 border-[#4ECDC4]">
            <div className="w-16 h-16 bg-[#4ECDC4] rounded-full flex items-center justify-center mb-4 mx-auto">
              <Compass className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 text-center text-[#333]">Fun itineraries</h3>
            <p className="text-sm md:text-base text-[#666] text-center">
              Tell us what you love, and we'll plan your days. Food tours? Art? Shopping? We got you!
            </p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform border-t-8 border-[#FFD166]">
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
            <h3 className="text-lg md:text-xl font-bold mb-2 text-center text-[#333]">Packing guide</h3>
            <p className="text-sm md:text-base text-[#666] text-center">
              "Oops, forgot my charger!" Not anymore! We'll remind you to pack everything you need.
            </p>
          </div>
        </div>
      </section>

      {/* Fun Footer */}
      <footer className="bg-[#333] text-white py-6 md:py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center gap-4 mb-4">
            {["🌍", "🧳", "🗺️", "🏖️", "✈️"].map((emoji, index) => (
              <div key={index} className="text-xl md:text-2xl">
                {emoji}
              </div>
            ))}
          </div>
          <p className="mb-2 text-sm md:text-base">Made with ❤️ by a fellow travel enthusiast</p>
          <p className="text-xs md:text-sm text-gray-400">© {new Date().getFullYear()} Nomado</p>
        </div>
      </footer>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  )
}





