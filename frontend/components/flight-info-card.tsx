import { Plane, ExternalLink, Clock } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface FlightInfoCardProps {
  fromCity: string
  toCity: string
  content: string
}

export function FlightInfoCard({ fromCity, toCity, content }: FlightInfoCardProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mt-8 overflow-hidden rounded-xl shadow-lg">
      {/* Card Header with Gradient */}
      <div className="relative p-6 bg-[#FF6B6B]/10">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#FF6B6B]"></div>
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold flex items-center gap-2 text-[#333]">
            <Plane className="h-6 w-6 text-[#FF6B6B]" />
            Flights from {fromCity} to {toCity}
          </h3>
        </div>
        <p className="text-[#666] mt-1">Available flight options for your journey</p>
      </div>

      {/* Card Content */}
      <div className="bg-white p-6">
        <div className="prose prose-sm md:prose-base max-w-none">
          <ReactMarkdown
            components={{
              // Style links as buttons
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FF6B6B]/10 text-[#FF6B6B] rounded-lg hover:bg-[#FF6B6B]/20 transition-colors duration-200 text-sm font-medium no-underline"
                >
                  {props.children}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ),
              // Style headings
              h1: ({ node, ...props }) => (
                <h1 {...props} className="text-2xl font-bold text-[#333] mb-4" />
              ),
              h2: ({ node, ...props }) => (
                <h2 {...props} className="text-xl font-bold text-[#FF6B6B] mt-6 mb-3 flex items-center gap-2">
                  <Plane className="h-5 w-5 text-[#FF6B6B]" />
                  {props.children}
                </h2>
              ),
              h3: ({ node, ...props }) => (
                <h3 {...props} className="text-lg font-bold text-[#FF6B6B] mt-4 mb-2" />
              ),
              // Style lists
              ul: ({ node, ...props }) => (
                <ul {...props} className="space-y-4 list-none" />
              ),
              li: ({ node, ...props }) => (
                <li {...props} className="bg-gray-50 p-4 rounded-lg flex items-start gap-2">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#FF6B6B]/10 rounded-full flex items-center justify-center mt-1">
                    <Clock className="h-4 w-4 text-[#FF6B6B]" />
                  </div>
                  <div className="flex-1 text-[#333] font-medium leading-relaxed">{props.children}</div>
                </li>
              ),
              // Style paragraphs
              p: ({ node, ...props }) => (
                <p {...props} className="text-[#666] leading-relaxed" />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
} 