"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ExperienceCard } from "@/components/experience-card"
import { Globe, Send, User, AlertCircle, Loader2, RefreshCw, Database } from "lucide-react"
import { getExperiences, addExperience } from "@/app/actions/experience-actions"

// Define the experience type to match the database schema
export interface TravelerExperience {
  id: number | string
  country: string
  experience: string
  user_name?: string
  userName?: string
  created_at?: string
  createdAt?: string
}

// Sample initial experiences as fallback
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
]

export function CommunitySection() {
  // State for experiences
  const [experiences, setExperiences] = useState<TravelerExperience[]>([])

  // State for using local storage fallback
  const [usingFallback, setUsingFallback] = useState(false)

  // State for loading
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // State for form inputs
  const [country, setCountry] = useState("")
  const [experience, setExperience] = useState("")
  const [userName, setUserName] = useState("")

  // State for form validation
  const [error, setError] = useState<string | null>(null)
  const [dbError, setDbError] = useState<string | null>(null)

  // State for submission loading
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load experiences on component mount
  useEffect(() => {
    loadData()
  }, [])

  // Function to load all data
  const loadData = async () => {
    setIsLoading(true)
    setDbError(null)

    try {
      // Try to load from database
      const experiencesResult = await getExperiences()

      // Check if we got data back
      if (experiencesResult.length > 0) {
        setExperiences(
          experiencesResult.map((exp) => ({
            ...exp,
            id: exp.id,
            userName: exp.user_name,
            createdAt: exp.created_at,
          })),
        )
        setUsingFallback(false)
      } else {
        // If no data, try to load from localStorage
        tryLoadFromLocalStorage()
      }
    } catch (error) {
      console.error("Error loading data:", error)
      setDbError("Unable to connect to database. Using local storage instead.")
      // Fall back to localStorage
      tryLoadFromLocalStorage()
    } finally {
      setIsLoading(false)
    }
  }

  // Try to load data from localStorage as fallback
  const tryLoadFromLocalStorage = () => {
    try {
      const storedExperiences = localStorage.getItem("communityExperiences")
      if (storedExperiences) {
        const parsedExperiences = JSON.parse(storedExperiences)
        setExperiences(parsedExperiences)
      } else {
        // If no localStorage data, use initial sample data
        setExperiences(initialExperiences)
      }
      setUsingFallback(true)
    } catch (error) {
      console.error("Error loading from localStorage:", error)
      // Use initial data as last resort
      setExperiences(initialExperiences)
      setUsingFallback(true)
    }
  }

  // Function to refresh data
  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      await loadData()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset error
    setError(null)

    // Validate inputs
    if (!country.trim() || !experience.trim() || !userName.trim()) {
      setError("Please fill in all fields")
      return
    }

    // Validate maximum length
    if (experience.trim().length > 500) {
      setError("Your experience is too long. Please keep it under 500 characters.")
      return
    }

    // Start submission process
    setIsSubmitting(true)

    try {
      if (!usingFallback) {
        // Try to add to database first
        const result = await addExperience({
          country: country.trim(),
          experience: experience.trim(),
          userName: userName.trim(),
        })

        if (result.success) {
          // Reset form
          setCountry("")
          setExperience("")
          setUserName("")

          // Refresh data
          await loadData()
        } else {
          setError(result.error || "Failed to add experience")
          // If database fails, fall back to localStorage
          addToLocalStorage()
        }
      } else {
        // Using fallback, add directly to localStorage
        addToLocalStorage()
      }
    } catch (error) {
      console.error("Error adding experience:", error)
      setError("An error occurred while adding your experience. Please try again.")
      // Try localStorage as fallback
      addToLocalStorage()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add experience to localStorage
  const addToLocalStorage = () => {
    try {
      // Create new experience
      const newExperience: TravelerExperience = {
        id: Date.now().toString(),
        country: country.trim(),
        experience: experience.trim(),
        userName: userName.trim(),
        createdAt: new Date().toISOString(),
      }

      // Get existing experiences from localStorage
      const storedExperiences = localStorage.getItem("communityExperiences")
      const existingExperiences = storedExperiences ? JSON.parse(storedExperiences) : initialExperiences

      // Add to experiences array
      const updatedExperiences = [newExperience, ...existingExperiences]

      // Save to localStorage
      localStorage.setItem("communityExperiences", JSON.stringify(updatedExperiences))

      // Update state
      setExperiences(updatedExperiences)

      // Reset form
      setCountry("")
      setExperience("")
      setUserName("")

      setUsingFallback(true)
    } catch (localError) {
      console.error("Error saving to localStorage:", localError)
      setError("Failed to save your experience. Please try again.")
    }
  }

  return (
    <section className="container mx-auto px-4 py-8 bg-[#FFF8E1]">
      <div className="max-w-5xl mx-auto">
        {/* Database status indicator */}
        {dbError && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <Database className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-600 text-sm">{dbError}</p>
            </div>
          </div>
        )}

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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500">{500 - experience.length} characters remaining</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#FF6B6B] hover:bg-[#FF9E9E] text-white py-6 rounded-xl text-lg flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Adding Experience...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Share with Community
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Refresh button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            className="text-[#4ECDC4] border-[#4ECDC4] hover:bg-[#F0FFFC]"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Experiences
          </Button>
        </div>

        {/* Experience cards */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-6 text-[#333] flex items-center justify-between">
            <span>Community Experiences ({experiences.length})</span>

            {usingFallback && (
              <span className="text-xs font-normal text-yellow-600 flex items-center gap-1">
                <Database className="h-3 w-3" /> Using local storage
              </span>
            )}
          </h3>

          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#FF6B6B]" />
              <p className="text-gray-500">Loading experiences...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {experiences.length > 0 ? (
                experiences.map((exp, index) => (
                  <ExperienceCard
                    key={exp.id}
                    experience={{
                      id: exp.id.toString(),
                      country: exp.country,
                      experience: exp.experience,
                      userName: exp.userName || exp.user_name || "",
                      createdAt: exp.createdAt || exp.created_at,
                    }}
                    colorIndex={index % 5} // Simple color rotation
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No experiences shared yet. Be the first to share!</div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}



