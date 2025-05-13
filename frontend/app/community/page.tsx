"use client"
import { Header } from "@/components/header"
import { CommunitySection } from "@/components/community-section"

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[#FFF8E1]">
      {/* Header with navigation */}
      <Header showNavigation={true} />

      {/* Page Title */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        <h1 className="text-4xl md:text-5xl font-bold text-[#333] mb-4 leading-tight text-center">
          Hear from the <span className="text-[#FF6B6B]">Community</span> 👋
        </h1>
        <p className="text-lg text-[#333] mb-8 text-center max-w-2xl mx-auto">
          Discover travel tips and experiences shared by fellow adventurers from around the world!
        </p>
      </div>

      {/* Community Section */}
      <CommunitySection />

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
