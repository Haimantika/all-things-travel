import Link from "next/link"
import { Users, Home } from "lucide-react"

export function Navigation() {
  return (
    <div className="flex items-center gap-4">
      <nav className="hidden md:flex gap-6 items-center">
        <Link
          href="/"
          className="text-[#FF6B6B] hover:text-[#FF9E9E] font-medium flex items-center gap-1 transition-colors"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        <Link
          href="/community"
          className="text-[#FF6B6B] hover:text-[#FF9E9E] font-medium flex items-center gap-1 transition-colors"
        >
          <Users className="h-4 w-4" />
          Community
        </Link>
      </nav>
    </div>
  )
}
