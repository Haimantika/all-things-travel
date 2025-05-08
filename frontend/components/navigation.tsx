import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navigation() {
  return (
    <div className="flex items-center gap-4">
      <nav className="hidden md:flex gap-6">
        <Link href="#" className="text-[#FF6B6B] hover:text-[#FF9E9E] font-medium">
          Home
        </Link>
        <Link href="#" className="text-[#FF6B6B] hover:text-[#FF9E9E] font-medium">
          Explore
        </Link>
        <Link href="#" className="text-[#FF6B6B] hover:text-[#FF9E9E] font-medium">
          About
        </Link>
      </nav>
      <Button className="bg-[#4ECDC4] hover:bg-[#36B5AC] text-white rounded-full">Let's Go!</Button>
    </div>
  )
}