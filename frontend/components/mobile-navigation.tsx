"use client"
import Link from "next/link"
import { Home, Users } from "lucide-react"
import { usePathname } from "next/navigation"

export function MobileNavigation() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 z-50">
      <div className="flex justify-around items-center">
        <Link
          href="/"
          className={`flex flex-col items-center p-2 ${pathname === "/" ? "text-[#FF6B6B]" : "text-gray-500"}`}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link
          href="/community"
          className={`flex flex-col items-center p-2 ${pathname === "/community" ? "text-[#FF6B6B]" : "text-gray-500"}`}
        >
          <Users className="h-6 w-6" />
          <span className="text-xs mt-1">Community</span>
        </Link>
      </div>
    </div>
  )
}
