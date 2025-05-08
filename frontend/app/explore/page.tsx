import { Header } from "@/components/header"

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-[#FFF8E1]">
      {/* Use the Header with navigation */}
      <Header showNavigation={true} />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Explore Destinations</h1>
        <p className="mt-4">Discover amazing places to visit around the world.</p>
        {/* Add more content here */}
      </main>
    </div>
  )
}