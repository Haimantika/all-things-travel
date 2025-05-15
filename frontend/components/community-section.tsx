"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ExperienceTag } from "@/components/experience-tag"
import { ExperienceCard } from "@/components/experience-card"
import { Globe, Send, User, X, Filter, AlertCircle, Loader2, RefreshCw, Database, Ban } from "lucide-react"
import { getExperiences, addExperience, getCountriesWithCounts } from "@/app/actions/experience-actions"
import { moderateContent } from "@/app/actions/moderation-actions"

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

export function CommunitySection() {
  // State for experiences
  const [experiences, setExperiences] = useState<TravelerExperience[]>([])

  // State for countries with counts
  const [countriesWithCounts, setCountriesWithCounts] = useState<{ country: string; count: number }[]>([])

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
  const [moderationError, setModerationError] = useState<{ 
    flagged: boolean; 
    reasons: string[];
    field?: 'country' | 'name' | 'experience';
  } | null>(null)

  // State for submission loading
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State for filtering
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  // Load experiences and countries on component mount
  useEffect(() => {
    loadData()
  }, [])

  // Load experiences when selected country changes
  useEffect(() => {
    loadExperiences()
  }, [selectedCountry])

  // Function to load all data
  const loadData = async () => {
    setIsLoading(true)
    setDbError(null)

    try {
      // Load from database
      const [experiencesResult, countriesResult] = await Promise.all([
        getExperiences(selectedCountry || undefined),
        getCountriesWithCounts(),
      ])

      setExperiences(
        experiencesResult.map((exp) => ({
          ...exp,
          id: exp.id,
          userName: exp.user_name,
          createdAt: exp.created_at,
        })),
      )
      setCountriesWithCounts(countriesResult)
    } catch (error) {
      console.error("Error loading data:", error)
      setDbError("Unable to connect to database. Please try again later.")
    } finally {
      setIsLoading(false)
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

  // Function to load experiences
  const loadExperiences = async () => {
    try {
      const data = await getExperiences(selectedCountry || undefined)
      setExperiences(
        data.map((exp) => ({
          ...exp,
          id: exp.id,
          userName: exp.user_name,
          createdAt: exp.created_at,
        })),
      )
    } catch (error) {
      console.error("Error loading experiences:", error)
      setDbError("Unable to load experiences from database. Please try again later.")
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors
    setError(null)
    setModerationError(null)

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
      // Validate and moderate all input fields
      const allContent = `${country.trim()} ${userName.trim()} ${experience.trim()}`;
      console.log("Sending all content for moderation:", allContent.substring(0, 50) + (allContent.length > 50 ? "..." : ""));
      
      // Check for gibberish in location or name
      const countryModerationResult = await moderateContent(country.trim());
      if (!countryModerationResult.success || countryModerationResult.flagged) {
        setModerationError({
          flagged: true,
          reasons: countryModerationResult.flagged ? countryModerationResult.reasons : ["Invalid location text"],
          field: 'country'
        });
        setIsSubmitting(false);
        return;
      }
      
      const nameModerationResult = await moderateContent(userName.trim());
      if (!nameModerationResult.success || nameModerationResult.flagged) {
        setModerationError({
          flagged: true,
          reasons: nameModerationResult.flagged ? nameModerationResult.reasons : ["Invalid name text"],
          field: 'name'
        });
        setIsSubmitting(false);
        return;
      }
      
      // Check experience content
      const experienceModerationResult = await moderateContent(experience.trim())
      console.log("Experience moderation result:", experienceModerationResult);
      
      if (!experienceModerationResult.success) {
        setError(experienceModerationResult.error || "Failed to moderate content. Please try again.")
        setIsSubmitting(false);
        return
      }
      
      // If content is flagged, show moderation error and stop submission
      if (experienceModerationResult.flagged) {
        setModerationError({
          flagged: true,
          reasons: experienceModerationResult.reasons,
          field: 'experience'
        })
        setIsSubmitting(false);
        return
      }
      
      // All content passed moderation, proceed with submission
      const result = await addExperience({
        country: country.trim(),
        experience: experience.trim(),
        userName: userName.trim(),
        moderationPassed: true
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
      }
    } catch (error) {
      console.error("Error adding experience:", error)
      setError("An error occurred while adding your experience. Please try again.")
    } finally {
      setIsSubmitting(false)
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
          <h3 className="text-xl font-bold mb-4 text-[#333]">Share your experience</h3>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-[#666] mb-1">
                  Country/City
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-5 w-5 text-[#FF6B6B]" />
                  <Input
                    id="country"
                    placeholder="Which country/city did you visit?"
                    className="pl-10 pr-4 py-6 rounded-xl border-[#FFD166] focus:border-[#FF6B6B]"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-[#666] mb-1">
                  Your name
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
                Your experience
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

            {moderationError && moderationError.flagged && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-600 text-sm flex items-start gap-2">
                <Ban className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">
                    {moderationError.field === 'country' && "The comment you entered contains inappropriate content:"}
                    {moderationError.field === 'name' && "The comment you entered contains inappropriate content:"}
                    {moderationError.field === 'experience' && "Your experience contains inappropriate content:"}
                    {!moderationError.field && "Your content has been flagged for inappropriate content:"}
                  </p>
                  <ul className="list-disc list-inside mt-1">
                    {moderationError.reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                  <p className="mt-1">
                    {!moderationError.field && "Please revise your content to comply with community guidelines."}
                  </p>
                </div>
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
                  Share with community
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Country filter tags */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#333] flex items-center gap-2">
              <Filter className="h-5 w-5 text-[#FF6B6B]" />
              Filter by country
            </h3>

            <div className="flex items-center gap-2">
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

              <Button
                variant="outline"
                size="sm"
                className="text-[#4ECDC4] border-[#4ECDC4] hover:bg-[#F0FFFC]"
                onClick={refreshData}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {countriesWithCounts.map((item, index) => (
              <ExperienceTag
                key={item.country}
                country={item.country}
                colorIndex={index}
                isSelected={selectedCountry === item.country}
                count={item.count}
                onClick={() => setSelectedCountry((prev) => (prev === item.country ? null : item.country))}
              />
            ))}
          </div>

          {countriesWithCounts.length === 0 && !isLoading && (
            <p className="text-center text-gray-500 py-4">No countries yet. Be the first to share an experience!</p>
          )}

          {isLoading && (
            <div className="text-center py-4 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              Loading countries...
            </div>
          )}
        </div>

        {/* Experience cards */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-6 text-[#333] flex items-center justify-between">
            <span>
              {selectedCountry
                ? `Experiences in ${selectedCountry} (${experiences.length})`
                : `All community experiences (${experiences.length})`}
            </span>
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
                    colorIndex={countriesWithCounts.findIndex((c) => c.country === exp.country)}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {selectedCountry
                    ? `No experiences shared for ${selectedCountry} yet. Be the first to share!`
                    : "No experiences shared yet. Be the first to share!"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}




