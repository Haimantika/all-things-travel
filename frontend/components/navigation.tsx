import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

export function Navigation() {
  return (
    <div className="flex items-center gap-4">
      <nav className="hidden md:flex gap-6 items-center">
        <Link href="/" className="text-[#FF6B6B] hover:text-[#FF9E9E] font-medium">
          Home
        </Link>
        <Link href="/community" className="text-[#FF6B6B] hover:text-[#FF9E9E] font-medium flex items-center gap-1">
          <Users className="h-4 w-4" />
          Hear from the community
        </Link>
      </nav>
    </div>
  )
}
