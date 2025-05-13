"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ExperienceTag } from "@/components/experience-tag"
import { ExperienceCard } from "@/components/experience-card"
import { Globe, Send, User, X, Filter } from "lucide-react"

// Define the experience type
export interface TravelerExperience {
  id: string
  country: string
  experience: string
  userName: string
  createdAt?: string
}

// Sample initial experiences
const initialExperiences: TravelerExperience[] = [
  {
    id: "1",
    country: "Japan",
    experience: "The street food in Tokyo is amazing! Don't miss the takoyaki stands in Shibuya.",
    userName: "SushiLover",
    createdAt: "2023-05-15T12:00:00Z",
  },
  {
    id: "2",
    country: "Italy",
    experience: "Rent a scooter in Amalfi Coast for the best views and experience!",
    userName: "PastaFanatic",
    createdAt: "2023-06-22T15:30:00Z",
  },
  {
    id: "3",
    country: "Thailand",
    experience: "The night markets in Chiang Mai have the best food and souvenirs.",
    userName: "BeachExplorer",
    createdAt: "2023-07-10T09:15:00Z",
  },
  {
    id: "4",
    country: "France",
    experience: "Skip the Eiffel Tower lines by going early morning or booking in advance.",
    userName: "CroissantQueen",
    createdAt: "2023-08-05T14:45:00Z",
  },
  {
    id: "5",
    country: "Australia",
    experience: "The Great Ocean Road is a must-do road trip with breathtaking coastal views.",
    userName: "SurfDude",
    createdAt: "2023-09-18T11:20:00Z",
  },
  {
    id: "6",
    country: "Japan",
    experience: "Visit Fushimi Inari Shrine early in the morning to avoid crowds and get the best photos.",
    userName: "TravelPhotographer",
    createdAt: "2023-10-03T08:10:00Z",
  },
  {
    id: "7",
    country: "Italy",
    experience:
      "In Rome, the best gelato is found at small shops away from tourist attractions. Look for natural colors!",
    userName: "GelatolLover",
    createdAt: "2023-11-12T16:40:00Z",
  },
  {
    id: "8",
    country: "Thailand",
    experience: "When visiting temples, always bring a light scarf to cover shoulders and knees as a sign of respect.",
    userName: "CulturalExplorer",
    createdAt: "2023-12-25T10:30:00Z",
  },
]

export function CommunitySection() {
  // State for experiences
  const [experiences, setExperiences] = useState<TravelerExperience[]>(initialExperiences)

  // State for form inputs
  const [country, setCountry] = useState("")
  const [experience, setExperience] = useState("")
  const [userName, setUserName] = useState("")

  // State for form validation
  const [error, setError] = useState<string | null>(null)

  // State for filtering
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  // Get unique countries and count experiences for each
  const countryData = experiences.reduce((acc: { [key: string]: number }, exp) => {
    const country = exp.country
    acc[country] = (acc[country] || 0) + 1
    return acc
  }, {})

  // Sort countries by count (descending)
  const sortedCountries = Object.keys(countryData).sort((a, b) => countryData[b] - countryData[a])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs
    if (!country.trim() || !experience.trim() || !userName.trim()) {
      setError("Please fill in all fields")
      return
    }

    // Create new experience
    const newExperience: TravelerExperience = {
      id: Date.now().toString(),
      country: country.trim(),
      experience: experience.trim(),
      userName: userName.trim(),
      createdAt: new Date().toISOString(),
    }

    // Add to experiences array
    setExperiences([newExperience, ...experiences])

    // Reset form
    setCountry("")
    setExperience("")
    setUserName("")
    setError(null)

    // If the new experience matches the current filter, keep it selected
    if (selectedCountry && selectedCountry !== country.trim()) {
      setSelectedCountry(null)
    }
  }

  // Filter experiences based on selected country
  const filteredExperiences = selectedCountry
    ? experiences.filter((exp) => exp.country === selectedCountry)
    : experiences

  return (
    <section className="container mx-auto px-4 py-8 bg-[#FFF8E1]">
      <div className="max-w-5xl mx-auto">
        {/* Experience submission form */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-12">
          <h3 className="text-xl font-bold mb-4 text-[#333]">Share Your Experience</h3>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-[#666] mb-1">
                  Country
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-5 w-5 text-[#FF6B6B]" />
                  <Input
                    id="country"
                    placeholder="Which country did you visit?"
                    className="pl-10 pr-4 py-6 rounded-xl border-[#FFD166] focus:border-[#FF6B6B]"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-[#666] mb-1">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-[#4ECDC4]" />
                  <Input
                    id="userName"
                    placeholder="What should we call you?"
                    className="pl-10 pr-4 py-6 rounded-xl border-[#FFD166] focus:border-[#FF6B6B]"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="experience" className="block text-sm font-medium text-[#666] mb-1">
                Your Experience
              </label>
              <Textarea
                id="experience"
                placeholder="Share a tip, recommendation, or experience..."
                className="min-h-[100px] rounded-xl border-[#FFD166] focus:border-[#FF6B6B]"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#FF6B6B] hover:bg-[#FF9E9E] text-white py-6 rounded-xl text-lg flex items-center justify-center gap-2"
            >
              <Send className="h-5 w-5" />
              Share with Community
            </Button>
          </form>
        </div>

        {/* Country filter tags */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#333] flex items-center gap-2">
              <Filter className="h-5 w-5 text-[#FF6B6B]" />
              Filter by Country
            </h3>

            {selectedCountry && (
              <Button
                variant="outline"
                size="sm"
                className="text-[#FF6B6B] border-[#FF6B6B] hover:bg-[#FFF0F0]"
                onClick={() => setSelectedCountry(null)}
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filter
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {sortedCountries.map((country, index) => (
              <ExperienceTag
                key={country}
                country={country}
                colorIndex={index}
                isSelected={selectedCountry === country}
                count={countryData[country]}
                onClick={() => setSelectedCountry((prev) => (prev === country ? null : country))}
              />
            ))}
          </div>

          {sortedCountries.length === 0 && (
            <p className="text-center text-gray-500 py-4">No countries yet. Be the first to share an experience!</p>
          )}
        </div>

        {/* Experience cards */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-6 text-[#333] flex items-center justify-between">
            <span>
              {selectedCountry
                ? `Experiences in ${selectedCountry} (${filteredExperiences.length})`
                : `All Community Experiences (${experiences.length})`}
            </span>
          </h3>

          <div className="space-y-4">
            {filteredExperiences.length > 0 ? (
              filteredExperiences.map((exp, index) => (
                <ExperienceCard key={exp.id} experience={exp} colorIndex={sortedCountries.indexOf(exp.country)} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {selectedCountry
                  ? `No experiences shared for ${selectedCountry} yet. Be the first to share!`
                  : "No experiences shared yet. Be the first to share!"}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
