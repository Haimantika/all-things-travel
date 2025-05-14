"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Globe, ChevronDown, Search, X } from "lucide-react"
import { countryNameToCode } from "@/lib/countries"

interface SimpleCountryDropdownProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  icon?: React.ReactNode
  label?: string
}

export function SimpleCountryDropdown({
  value,
  onChange,
  placeholder,
  icon = <Globe className="h-5 w-5 text-[#FF6B6B]" />,
  label,
}: SimpleCountryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Convert the countryNameToCode object to an array of countries
  const countries = Object.keys(countryNameToCode)
    .map((name) => ({
      name,
      code: countryNameToCode[name],
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  // Filter countries based on search term
  const filteredCountries = countries.filter((country) => country.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Position the dropdown menu properly
  useEffect(() => {
    if (isOpen && dropdownRef.current && menuRef.current) {
      const dropdownRect = dropdownRef.current.getBoundingClientRect()
      const menuElement = menuRef.current

      // Check if there's enough space below
      const spaceBelow = window.innerHeight - dropdownRect.bottom
      const menuHeight = menuElement.offsetHeight

      if (spaceBelow < menuHeight && dropdownRect.top > menuHeight) {
        // Position above if there's not enough space below but enough space above
        menuElement.style.bottom = "100%"
        menuElement.style.top = "auto"
        menuElement.style.maxHeight = `${Math.min(300, dropdownRect.top - 10)}px`
      } else {
        // Position below
        menuElement.style.top = "100%"
        menuElement.style.bottom = "auto"
        menuElement.style.maxHeight = `${Math.min(300, spaceBelow - 10)}px`
      }
    }
  }, [isOpen, filteredCountries])

  // Handle country selection
  const handleSelectCountry = (countryName: string) => {
    onChange(countryName)
    setIsOpen(false)
    setSearchTerm("")
  }

  // Clear selection
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
    setSearchTerm("")
  }

  return (
    <div className="w-full relative" ref={dropdownRef}>
      {label && <label className="block text-sm font-medium text-[#666] mb-1">{label}</label>}

      {/* Dropdown trigger button */}
      <div
        className="relative w-full flex items-center justify-between pl-10 pr-4 py-6 rounded-xl border border-[#FFD166] focus:border-[#FF6B6B] bg-white hover:bg-white/90 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">{icon}</div>
        <div className="text-left truncate">{value || placeholder}</div>
        <div className="flex items-center">
          {value && (
            <button type="button" onClick={handleClear} className="mr-2 p-1 rounded-full hover:bg-gray-100">
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200"
          style={{ maxWidth: dropdownRef.current?.offsetWidth }}
        >
          {/* Search input */}
          <div className="p-2 border-b border-gray-200 flex items-center">
            <Search className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search countries..."
              className="w-full border-none outline-none text-sm"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Country list */}
          <div className="overflow-y-auto" style={{ maxHeight: "250px" }}>
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <div
                  key={country.code}
                  className={`px-3 py-2 text-sm cursor-pointer rounded hover:bg-gray-100 ${
                    value === country.name ? "bg-gray-100 font-medium" : ""
                  }`}
                  onClick={() => handleSelectCountry(country.name)}
                >
                  {country.name}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">No countries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
