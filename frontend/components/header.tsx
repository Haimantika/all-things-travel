import { Plane } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface HeaderProps {
  showNavigation?: boolean
}

export function Header({ showNavigation = false }: HeaderProps) {
  return (
    <header className="container mx-auto p-4 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="bg-[#FF6B6B] text-white p-2 rounded-full rotate-3 transform hover:rotate-12 transition-transform">
          <Plane className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-[#FF6B6B] tracking-tight">Nomado</h1>
      </Link>

      {showNavigation && (
        <div className="flex items-center gap-4">
          <Navigation />
        </div>
      )}
    </header>
  )
}