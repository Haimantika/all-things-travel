import {
  Check,
  Clock,
  CreditCard,
  Globe,
  MapPin,
  Phone,
  AlertCircle,
  ArrowRight,
  StampIcon as Passport,
} from "lucide-react"

interface VisaInfoProps {
  passport_of: string
  destination: string
  capital?: string
  visa: string
  pass_valid: string
  currency: string
  timezone: string
  phone_code: string
  color: string
  link?: string
  additionalInfo?: string | null
}

export function VisaInfoCard({
  passport_of,
  destination,
  capital,
  visa,
  pass_valid,
  currency,
  timezone,
  phone_code,
  color,
  link,
  additionalInfo,
}: VisaInfoProps) {
  // Debug log to verify props
  console.log("VisaInfoCard props:", { passport_of, destination, additionalInfo })

  // Determine status color
  const statusColor = color === "red" ? "bg-red-500" : color === "green" ? "bg-green-500" : "bg-yellow-500"

  const statusTextColor = color === "red" ? "text-red-700" : color === "green" ? "text-green-700" : "text-yellow-700"

  const statusBgColor = color === "red" ? "bg-red-50" : color === "green" ? "bg-green-50" : "bg-yellow-50"

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 overflow-hidden rounded-xl shadow-lg">
      {/* Card Header with Gradient */}
      <div className={`relative p-6 ${statusBgColor}`}>
        <div className={`absolute top-0 left-0 w-2 h-full ${statusColor}`}></div>
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold flex items-center gap-2 text-[#333]">
            <Globe className="h-6 w-6 text-[#FF6B6B]" />
            Visa Information
          </h3>
          <div
            className={`px-4 py-1.5 rounded-full text-sm font-semibold ${statusBgColor} ${statusTextColor} border border-${color === "red" ? "red" : color === "green" ? "green" : "yellow"}-200`}
          >
            {visa}
          </div>
        </div>
        <p className="text-[#666] mt-1">
          Travel details for {passport_of} passport to {destination}
        </p>
      </div>

      {/* Card Content */}
      <div className="bg-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-[#FFF8E1] p-2 rounded-full">
                <Passport className="h-5 w-5 text-[#FF6B6B]" />
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Passport</h3>
                <p className="text-lg font-semibold text-[#333]">{passport_of}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-[#FFF8E1] p-2 rounded-full">
                <MapPin className="h-5 w-5 text-[#4ECDC4]" />
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Destination</h3>
                <p className="text-lg font-semibold text-[#333]">{destination}</p>
                {capital && <p className="text-sm text-gray-500">Capital: {capital}</p>}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-[#FFF8E1] p-2 rounded-full">
                <Check className="h-5 w-5 text-[#FFD166]" />
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Passport Validity Required</h3>
                <p className="text-lg font-semibold text-[#333]">{pass_valid}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-[#FFF8E1] p-2 rounded-full">
                <CreditCard className="h-5 w-5 text-[#4ECDC4]" />
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Currency</h3>
                <p className="text-lg font-semibold text-[#333]">{currency}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-[#FFF8E1] p-2 rounded-full">
                <Clock className="h-5 w-5 text-[#FF6B6B]" />
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Time Zone</h3>
                <p className="text-lg font-semibold text-[#333]">UTC {timezone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-[#FFF8E1] p-2 rounded-full">
                <Phone className="h-5 w-5 text-[#FFD166]" />
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Phone Code</h3>
                <p className="text-lg font-semibold text-[#333]">{phone_code}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visa Status Note */}
        <div className={`mt-6 p-4 ${statusBgColor} rounded-lg flex items-start gap-3`}>
          <AlertCircle className={`h-5 w-5 ${statusTextColor} mt-0.5`} />
          <div>
            <h3 className="font-medium text-gray-700">Visa Status</h3>
            <p className={`${statusTextColor}`}>
              {color === "green"
                ? "No visa required for your trip! You can travel freely."
                : color === "red"
                  ? "Visa is required before travel. Please apply in advance."
                  : "Visa on arrival or eVisa may be available. Check requirements."}
            </p>
          </div>
        </div>

        {/* Special Case Information */}
        {additionalInfo && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-700">Special Consideration</h3>
              <p className="text-blue-700">{additionalInfo}</p>
            </div>
          </div>
        )}

        {/* Apply for Visa Link */}
        {link && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#FF6B6B] hover:text-[#FF9E9E] font-medium"
            >
              Apply for Visa
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}



