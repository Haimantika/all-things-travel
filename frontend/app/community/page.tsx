"use client"
import { Header } from "@/components/header"
import { CommunitySection } from "@/components/community-section"
import { MobileNavigation } from "@/components/mobile-navigation"
import { Github } from "lucide-react"

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[#FFF8E1] pb-16 md:pb-0">
      {/* Header with navigation */}
      <Header showNavigation={true} />

      {/* Page Title */}
      <div className="container mx-auto px-4 pt-4 md:pt-8 pb-2 md:pb-4">
        <h1 className="text-3xl md:text-5xl font-bold text-[#333] mb-2 md:mb-4 leading-tight text-center">
          Hear from the <span className="text-[#FF6B6B]">community</span> 👋
        </h1>
        <p className="text-base md:text-lg text-[#333] mb-4 md:mb-8 text-center max-w-2xl mx-auto">
          Discover travel tips and experiences shared by fellow adventurers from around the world!
        </p>
      </div>

      {/* Community Section */}
      <CommunitySection />

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
          <p className="mb-2 text-sm md:text-base">Made with ❤️ by <a href="https://x.com/haimantikam" target="_blank" rel="noopener noreferrer" className="text-[#FF6B6B] hover:underline">Haimantika</a> a fellow travel enthusiast</p>
          <p className="text-xs md:text-sm text-gray-400 mb-2">© {new Date().getFullYear()} Nomado</p>
          <p className="text-xs md:text-sm text-gray-400 mb-4">
            Built with <a href="https://www.digitalocean.com/products/gradientai" target="_blank" rel="noopener noreferrer" className="text-[#FF6B6B] hover:underline">DigitalOcean GradientAI</a>, <a href="https://www.digitalocean.com/products/app-platform" target="_blank" rel="noopener noreferrer" className="text-[#FF6B6B] hover:underline">App Platform</a> and <a href="https://www.digitalocean.com/products/managed-databases-postgresql" target="_blank" rel="noopener noreferrer" className="text-[#FF6B6B] hover:underline">Managed PostgreSQL Database</a>
          </p>
          <div className="border-t border-gray-700 pt-4">
            <a 
              href="https://github.com/do-community/nomado" 
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
    </div>
  )
}
