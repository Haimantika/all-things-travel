"use client"
import { Button } from "@/components/ui/button"
import { Compass, MapPin, Plane, Globe, StampIcon as Passport, CalendarRange, Backpack, Calendar, Stamp, X, Github } from "lucide-react"
import { useState, useEffect } from "react"
import { countryNameToCode } from "@/lib/countries"
import { VisaInfoCard } from "@/components/visa-info-card"
import { Header } from "@/components/header"
import { SimpleCountryDropdown } from "@/components/simple-country-dropdown"
import { MobileNavigation } from "@/components/mobile-navigation"
import { specialVisaCases } from "@/lib/special-visa-cases"
import { TravelPlanCard } from "@/components/travel-plan-card"
import { generateTravelPlan } from "@/app/actions/generate-travel-plan"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import Script from "next/script"
import { FlightInfoCard } from "@/components/flight-info-card"
import { generateFlightInfo } from "@/app/actions/generate-flight-info"

export default function Home() {
  const [passportCountry, setPassportCountry] = useState("")
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [visaInfo, setVisaInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState<string | null>(null)
  const [showPlanner, setShowPlanner] = useState(false)
  const [plannerLoading, setPlannerLoading] = useState(false)
  const [travelPlanContent, setTravelPlanContent] = useState<string | null>(null)
  const [tripDuration, setTripDuration] = useState("3")
  const [visitMonth, setVisitMonth] = useState("")
  const [fromCity, setFromCity] = useState("")
  const [toCity, setToCity] = useState("")
  const [departureDate, setDepartureDate] = useState("")
  const [returnDate, setReturnDate] = useState("")
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("one-way")
  const [showFlightInfo, setShowFlightInfo] = useState(false)
  const [flightInfoLoading, setFlightInfoLoading] = useState(false)
  const [flightInfoContent, setFlightInfoContent] = useState<string | null>(null)
  const [showChatNotification, setShowChatNotification] = useState(false)

  // Show chat notification after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChatNotification(true)
    }, 3000) // Show after 3 seconds

    return () => clearTimeout(timer)
  }, [])

  // Show notification when visa info is displayed
  useEffect(() => {
    if (visaInfo && !showChatNotification) {
      const timer = setTimeout(() => {
        setShowChatNotification(true)
      }, 2000) // Show 2 seconds after visa info appears

      return () => clearTimeout(timer)
    }
  }, [visaInfo, showChatNotification])

  // Auto-hide notification after 8 seconds
  useEffect(() => {
    if (showChatNotification) {
      const timer = setTimeout(() => {
        setShowChatNotification(false)
      }, 8000)

      return () => clearTimeout(timer)
    }
  }, [showChatNotification])

  // Helper function to normalize country names for comparison
  const normalizeCountry = (country: string): string => {
    return country.trim().toLowerCase()
  }

  // Function to find special visa case information
  const findSpecialCaseInfo = (passport: string, from: string, to: string): string | null => {
    // Normalize the input countries
    const normalizedPassport = normalizeCountry(passport)
    const normalizedFrom = normalizeCountry(from)
    const normalizedTo = normalizeCountry(to)

    // Check each special case
    for (const specialCase of specialVisaCases) {
      // Normalize the special case countries
      const casePassport = normalizeCountry(specialCase.passportCountry)
      const caseFrom = normalizeCountry(specialCase.fromCountry)
      const caseTo = normalizeCountry(specialCase.toCountry)

      // Check for matches with normalization
      const passportMatch = casePassport === normalizedPassport || casePassport === "any"
      const fromMatch = caseFrom === normalizedFrom || caseFrom === "any"
      const toMatch = caseTo === normalizedTo

      if (passportMatch && fromMatch && toMatch) {
        return specialCase.description
      }
    }

    // Fallback to direct checks for critical cases with normalization
    if (
      normalizedPassport === "india" &&
      normalizedFrom === "united states" &&
      normalizedTo === "united arab emirates"
    ) {
      return "Indian passport holders with a valid US visa can get a visa on arrival in the UAE for up to 14 days."
    }

    if (normalizedPassport === "india" && normalizedTo === "thailand") {
      return "Indian passport holders can apply for visa on arrival in Thailand for tourism purposes (up to 15 days)."
    }

    if (normalizedTo === "turkey" && (normalizedFrom === "united states" || normalizedFrom === "united kingdom")) {
      return "Travelers with a valid Schengen, UK, or US visa may be eligible for an e-Visa or visa on arrival in Turkey."
    }

    return null
  }

  const handleFindAdventure = async () => {
    if (!passportCountry || !toLocation) {
      setError("Please select both passport country and destination country")
      return
    }

    if (fromLocation && fromLocation === toLocation) {
      setError("Come on, you need to REALLY travel! Pick a different destination 😉")
      return
    }

    const passportCode = getCountryCode(passportCountry)
    const toCode = getCountryCode(toLocation)

    if (!passportCode || !toCode) {
      setError("Please select valid countries")
      return
    }

    // Reset previous results
    setError(null)
    setVisaInfo(null)
    setShowPlanner(false)
    setTravelPlanContent(null)
    setIsLoading(true)

    // Find special case information BEFORE API call
    const specialInfo = findSpecialCaseInfo(passportCountry, fromLocation, toLocation)

    // Set the additional info directly
    setAdditionalInfo(specialInfo)

    try {
      const data = `passport=${passportCode}&destination=${toCode}`
      
      const response = await fetch("https://visa-requirement.p.rapidapi.com/", {
        method: 'POST',
        headers: {
          'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || 'a44fe90a4cmsh4069920c797fa54p17fa8bjsnd4baeb96a710',
          'x-rapidapi-host': 'visa-requirement.p.rapidapi.com',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("API access denied. Please contact support.");
        } else if (response.status === 429) {
          throw new Error("Too many requests. Please try again later.");
        } else {
          throw new Error(`Unable to fetch visa information (Error ${response.status}). Please try again later.`);
        }
      }

      const responseData = await response.json();
      
      // Check if we got valid data
      if (!responseData || typeof responseData !== 'object') {
        throw new Error("Invalid response from visa information service.");
      }

      setVisaInfo(responseData);
      setIsLoading(false);
      // Show the planner section after visa info is loaded
      setShowPlanner(true);
    } catch (error) {
      console.error("Error fetching visa information:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch visa information. Please try again later.");
      setIsLoading(false);
      
      // Show special case info even if API fails
      if (additionalInfo) {
        setShowPlanner(true);
      }
    }
  }

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

  // Function to handle the "Help me plan" button click
  const handlePlanTrip = async () => {
    if (!toLocation) {
      setError("Destination country is required")
      return
    }

    if (!tripDuration) {
      setError("Please select how long your trip will be")
      return
    }

    if (!visitMonth) {
      setError("Please select which month you're visiting")
      return
    }

    setPlannerLoading(true)
    setError(null)

    try {
      // Call the server action to generate a travel plan using your DigitalOcean GenAI agent
      // Pass the trip duration and visit month to the server action
      const content = await generateTravelPlan(toLocation, Number.parseInt(tripDuration), visitMonth)
      setTravelPlanContent(content)
      setPlannerLoading(false)
    } catch (error) {
      console.error("Error generating travel plan:", error)
      setError(error instanceof Error ? error.message : "Failed to generate travel plan. Please try again.")
      setPlannerLoading(false)
    }
  }

  // Function to handle flight information generation
  const handleFlightInfo = async () => {
    if (!fromCity || !toCity || !departureDate) {
      setError("Please fill in all required flight information")
      return
    }

    if (tripType === "round-trip" && !returnDate) {
      setError("Please select a return date for round-trip flights")
      return
    }

    setFlightInfoLoading(true)
    setError(null)

    try {
      const content = await generateFlightInfo(
        fromCity,
        toCity,
        departureDate,
        tripType === "round-trip" ? returnDate : null,
        tripType
      )
      setFlightInfoContent(content)
      setFlightInfoLoading(false)
    } catch (error) {
      console.error("Error generating flight information:", error)
      setError(error instanceof Error ? error.message : "Failed to generate flight information. Please try again.")
      setFlightInfoLoading(false)
    }
  }

  // Array of months for the dropdown
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Array of trip durations for the dropdown
  const durations = ["1", "2", "3", "4", "5", "6", "7", "10", "14", "21", "30"]

  // Structured data for the travel service
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Nomado",
    "description": "Your smart travel companion for visa information and trip planning",
    "url": "https://nomado.com",
    "logo": "https://nomado.com/logo.png",
    "sameAs": [
      "https://twitter.com/nomado",
      "https://facebook.com/nomado",
      "https://instagram.com/nomado"
    ],
    "offers": {
      "@type": "Offer",
      "name": "Travel Planning Service",
      "description": "Get instant visa information, personalized travel itineraries, and smart packing lists"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Worldwide"
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8E1] pb-16 md:pb-0">
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-P48LFZFY0M"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-P48LFZFY0M');
        `}
      </Script>

      {/* Add structured data */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Chatbot Script */}
      <Script
        id="chatbot-script"
        src="https://rnd2lhiawerdm56gwqaniuuk.agents.do-ai.run/static/chatbot/widget.js"
        data-agent-id="d4dae41f-4cd9-11f0-bf8f-4e013e2ddde4"
        data-chatbot-id="BF5y8hoZsVCP7iDtbJnYt6LGJxkC0zXE"
        data-name="Nomado Travel Assistant"
        data-primary-color="#FF6B6B"
        data-secondary-color="#FFF8E1"
        data-button-background-color="#FF6B6B"
        data-button-text-color="#FFFFFF"
        data-chat-background-color="#FFFFFF"
        data-user-message-background-color="#FF6B6B"
        data-user-message-text-color="#FFFFFF"
        data-bot-message-background-color="#F8F9FA"
        data-bot-message-text-color="#333333"
        data-starting-message="Hello! I'm your Nomado travel assistant. I can help you find perfect accommodation options, nomad-friendly stays, and answer all your travel questions! 🏠✈️"
        data-logo="/static/chatbot/icons/default-agent.svg"
        data-button-icon="🏠"
        data-button-text="Need accommodation?"
        data-header-title="Nomado Travel Assistant"
        data-header-subtitle="Your AI travel companion"
        data-welcome-message="Welcome to Nomado! I'm here to help you find the perfect accommodation for your travels. Whether you're looking for nomad-friendly stays, budget options, or luxury accommodations, I've got you covered! 🏠✨"
        data-typing-indicator-color="#FF6B6B"
        data-input-placeholder="Ask me about accommodation options..."
        data-send-button-color="#FF6B6B"
        data-close-button-color="#FF6B6B"
        data-minimize-button-color="#FF6B6B"
        data-chat-window-width="400"
        data-chat-window-height="600"
        data-button-size="60"
        data-button-border-radius="50%"
        data-chat-window-border-radius="20px"
        data-message-border-radius="15px"
        data-font-family="Inter, system-ui, sans-serif"
        data-animation-duration="300"
        data-show-typing-indicator="true"
        data-show-timestamp="true"
        data-show-user-avatar="true"
        data-show-bot-avatar="true"
        data-bot-avatar="🏠"
        data-user-avatar="👤"
        data-enable-sound="false"
        data-enable-notifications="true"
        data-position="bottom-right"
        data-offset-x="20"
        data-offset-y="20"
        data-z-index="9999"
        data-theme="light"
        data-custom-css="
          .chatbot-widget {
            font-family: 'Inter', system-ui, sans-serif !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1) !important;
            border-radius: 20px !important;
          }
          .chatbot-button {
            background: linear-gradient(135deg, #FF6B6B 0%, #FF9E9E 100%) !important;
            box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3) !important;
            border-radius: 50% !important;
            transition: all 0.3s ease !important;
          }
          .chatbot-button:hover {
            transform: scale(1.1) !important;
            box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4) !important;
          }
          .chatbot-header {
            background: linear-gradient(135deg, #FF6B6B 0%, #FF9E9E 100%) !important;
            border-radius: 20px 20px 0 0 !important;
            color: white !important;
          }
          .chatbot-messages {
            background: #FFF8E1 !important;
          }
          .chatbot-user-message {
            background: linear-gradient(135deg, #FF6B6B 0%, #FF9E9E 100%) !important;
            border-radius: 18px 18px 4px 18px !important;
            color: white !important;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2) !important;
          }
          .chatbot-bot-message {
            background: white !important;
            border-radius: 18px 18px 18px 4px !important;
            color: #333 !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
            border: 1px solid #E5E7EB !important;
          }
          .chatbot-input {
            border: 2px solid #FF6B6B !important;
            border-radius: 25px !important;
            background: white !important;
          }
          .chatbot-input:focus {
            border-color: #FF9E9E !important;
            box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1) !important;
          }
          .chatbot-send-button {
            background: #FF6B6B !important;
            border-radius: 50% !important;
            transition: all 0.3s ease !important;
          }
          .chatbot-send-button:hover {
            background: #FF9E9E !important;
            transform: scale(1.1) !important;
          }
          .chatbot-typing-indicator {
            background: #FF6B6B !important;
          }
          .chatbot-avatar {
            border-radius: 50% !important;
            font-size: 20px !important;
          }
          .chatbot-timestamp {
            color: #9CA3AF !important;
            font-size: 11px !important;
          }
        "
        strategy="afterInteractive"
      />

      {/* Header with navigation */}
      <Header showNavigation={true} />

      {/* Main Content */}
      <main>
        {/* Hero Section with Flight Search */}
        <section className="container mx-auto px-4 py-4 md:py-8" aria-label="Travel Search">
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
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg" role="form" aria-label="Travel Search Form">
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
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600" role="alert">
                  {error}
                </div>
              )}

              {/* Special Case Information */}
              {additionalInfo && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700" role="complementary">
                  <p className="font-medium mb-1">Additional information</p>
                  <p>{additionalInfo}</p>
                </div>
              )}

              {/* Visa Information Card */}
              {visaInfo && <VisaInfoCard {...visaInfo} additionalInfo={additionalInfo} />}

              {/* Trip Planner Section */}
              {showPlanner && (
                <div className="mt-6 bg-white p-6 rounded-xl shadow-lg" role="complementary" aria-label="Trip Planner">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-[#333] mb-2">Ready to plan your trip to {toLocation}?</h2>
                    <p className="text-[#666] mb-6">
                      Let our AI help you create a personalized itinerary and packing list for your adventure!
                    </p>

                    {/* Trip Duration and Visit Month Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-center">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="tripDuration" className="text-xs md:text-sm font-medium text-[#666]">
                          Length of your trip
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-3">
                            <CalendarRange className="h-4 w-4 md:h-5 md:w-5 text-[#4ECDC4]" />
                          </div>
                          <Select value={tripDuration} onValueChange={setTripDuration}>
                            <SelectTrigger className="pl-10 pr-4 py-4 md:py-6 rounded-xl border-[#4ECDC4] focus:border-[#4ECDC4] w-full text-sm md:text-base">
                              <SelectValue placeholder="Select number of days" />
                            </SelectTrigger>
                            <SelectContent>
                              {durations.map((days) => (
                                <SelectItem key={days} value={days} className="text-sm md:text-base">
                                  {days} {Number.parseInt(days) === 1 ? "day" : "days"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="visitMonth" className="text-xs md:text-sm font-medium text-[#666]">
                          Month of visit
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-3">
                            <Calendar className="h-4 w-4 md:h-5 md:w-5 text-[#FFD166]" />
                          </div>
                          <Select value={visitMonth} onValueChange={setVisitMonth}>
                            <SelectTrigger className="pl-10 pr-4 py-4 md:py-6 rounded-xl border-[#FFD166] focus:border-[#FFD166] w-full text-sm md:text-base">
                              <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                            <SelectContent>
                              {months.map((month) => (
                                <SelectItem key={month} value={month} className="text-sm md:text-base">
                                  {month}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button
                      className="bg-[#4ECDC4] hover:bg-[#3DBCB4] text-white py-3 px-6 rounded-xl text-base flex items-center gap-2"
                      onClick={handlePlanTrip}
                      disabled={plannerLoading}
                    >
                      <CalendarRange className="h-5 w-5" />
                      {plannerLoading ? "Creating your plan..." : "Help me plan my trip!"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Travel Plan Card */}
              {travelPlanContent && <TravelPlanCard destination={toLocation} content={travelPlanContent} />}
            </div>
          </div>
        </section>

        {/* Flight Information Section */}
        {visaInfo && (
          <section className="container mx-auto px-4 py-8 md:py-16" aria-label="Flight Information">
            <div className="relative bg-[#FFE3E3] rounded-3xl p-6 md:p-12 overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#FF9E9E] rounded-full opacity-20"></div>
              <div className="absolute -left-10 -bottom-20 w-48 h-48 bg-[#4ECDC4] rounded-full opacity-10"></div>

              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold text-[#333] mb-2 md:mb-4 leading-tight text-center px-2 md:px-8">
                  Flights from {fromCity} to {toCity}
                </h2>
                <p className="text-[#666] text-base md:text-lg mb-4 md:mb-8 text-center px-2 md:px-8">
                  Available flight options for your journey
                </p>
                {/* Flight Search Form */}
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg" role="form" aria-label="Flight Search Form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="fromCity" className="text-sm font-medium text-[#666]">
                        From City
                      </label>
                      <input
                        type="text"
                        id="fromCity"
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        placeholder="Enter departure city"
                        className="px-4 py-2 rounded-lg border border-gray-200 focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="toCity" className="text-sm font-medium text-[#666]">
                        To City
                      </label>
                      <input
                        type="text"
                        id="toCity"
                        value={toCity}
                        onChange={(e) => setToCity(e.target.value)}
                        placeholder="Enter destination city"
                        className="px-4 py-2 rounded-lg border border-gray-200 focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="departureDate" className="text-sm font-medium text-[#666]">
                        Departure Date
                      </label>
                      <input
                        type="date"
                        id="departureDate"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-200 focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="tripType" className="text-sm font-medium text-[#666]">
                        Trip Type
                      </label>
                      <select
                        id="tripType"
                        value={tripType}
                        onChange={(e) => setTripType(e.target.value as "one-way" | "round-trip")}
                        className="px-4 py-2 rounded-lg border border-gray-200 focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] outline-none"
                      >
                        <option value="one-way">One Way</option>
                        <option value="round-trip">Round Trip</option>
                      </select>
                    </div>

                    {tripType === "round-trip" && (
                      <div className="flex flex-col gap-2">
                        <label htmlFor="returnDate" className="text-sm font-medium text-[#666]">
                          Return Date
                        </label>
                        <input
                          type="date"
                          id="returnDate"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="px-4 py-2 rounded-lg border border-gray-200 focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full bg-[#FF6B6B] hover:bg-[#FF9E9E] text-white py-4 md:py-6 rounded-xl text-base md:text-lg"
                    onClick={handleFlightInfo}
                    disabled={flightInfoLoading}
                  >
                    {flightInfoLoading ? "Finding flight info..." : "Get Flight Information"}
                  </Button>
                </div>

                {/* Flight Information Card */}
                {flightInfoContent && (
                  <FlightInfoCard
                    fromCity={fromCity}
                    toCity={toCity}
                    content={flightInfoContent}
                  />
                )}
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="container mx-auto px-4 py-8 md:py-16" aria-label="Travel Features">
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
                <Backpack className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 text-center text-[#333]">Packing guide</h3>
              <p className="text-sm md:text-base text-[#666] text-center">
                "Oops, forgot my charger!" Not anymore! We'll remind you to pack everything you need.
              </p>
            </div>
          </div>

          {/* Special Feature for Indian Passport Holders */}
          <div className="mt-12 bg-blue-50 p-6 rounded-3xl relative overflow-hidden border border-blue-100" role="complementary" aria-label="Special Visa Information">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-200 rounded-full opacity-40"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              <div className="md:w-1/4 flex justify-center">
                <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
                  <Stamp className="h-12 w-12 text-white" />
                </div>
              </div>
              
              <div className="md:w-3/4 text-center md:text-left">
                <div className="inline-block bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs font-medium mb-2">
                  For Indian Passport Holders
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-blue-800 mb-2">Special visa tips for Indians</h3>
                <p className="text-blue-700 mb-4">
                  Did you know your US, UK, or Schengen visa can give you access to 
                  multiple other countries without additional visas?
                </p>
                <Link href="/visa-hacks" passHref>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Find more!
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#333] text-white py-6 md:py-8" role="contentinfo">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center gap-4 mb-4">
            {["🌍", "🧳", "🗺️","🏖️","✈️"].map((emoji, index) => (
              <div key={index} className="text-xl md:text-2xl">
                {emoji}
              </div>
            ))}
          </div>
          <p className="mb-2 text-sm md:text-base">Made with ❤️ by <a href="https://x.com/haimantikam" target="_blank" rel="noopener noreferrer" className="text-[#FF6B6B] hover:underline">Haimantika</a> a fellow travel enthusiast</p>
          <p className="text-xs md:text-sm text-gray-400 mb-2">© {new Date().getFullYear()} Nomado</p>
          <p className="text-xs md:text-sm text-gray-400 mb-4">
            Built with <a href="https://www.digitalocean.com/products/gradientai" target="_blank" rel="noopener noreferrer" className="text-[#FF6B6B] hover:underline">DigitalOcean GradientAI</a>, <a href="https://www.digitalocean.com/products/app-platform" target="_blank" rel="noopener noreferrer" className="text-[#FF6B6B] hover:underline">App Platform</a> and <a href="https://www.digitalocean.com/products/managed-databases-postgresql" target="_blank" rel="noopener noreferrer" className="text-[#FF6B6B] hover:underline">Managed PostgreSQL Database</a>
          </p>
          <div className="border-t border-gray-700 pt-4">
            <a 
              href="https://github.com/Haimantika/all-things-travel" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-white rounded-full hover:bg-[#ff5252] transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <Github className="h-5 w-5" />
              <span className="font-medium">View on GitHub</span>
            </a>
            
          </div>
        </div>
      </footer>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Chat Notification */}
      {showChatNotification && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 animate-in slide-in-from-bottom-2 duration-500">
          <div className="bg-gradient-to-r from-[#FF6B6B] to-[#FF9E9E] text-white p-4 rounded-2xl shadow-2xl border border-pink-200 max-w-sm transform hover:scale-105 transition-transform duration-200 animate-bounce">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-lg">🏠</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm">Looking for accommodation?</h4>
                  <button
                    onClick={() => setShowChatNotification(false)}
                    className="text-white/70 hover:text-white transition-colors duration-200 hover:scale-110"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-white/90 mb-3 leading-relaxed">
                  Chat with our AI travel assistant to find perfect stays and accommodation options!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Trigger the chatbot to open
                      const chatbotButton = document.querySelector('[data-testid="chatbot-button"]') as HTMLElement;
                      if (chatbotButton) {
                        chatbotButton.click();
                      }
                      setShowChatNotification(false);
                    }}
                    className="bg-white text-[#FF6B6B] px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/90 transition-all duration-200 flex items-center gap-1 hover:scale-105 hover:shadow-lg"
                  >
                    <span>💬</span>
                    Chat Now
                  </button>
                  <button
                    onClick={() => setShowChatNotification(false)}
                    className="text-white/70 hover:text-white text-xs transition-colors duration-200 hover:underline"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}














