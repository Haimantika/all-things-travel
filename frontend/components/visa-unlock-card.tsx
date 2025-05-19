"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Stamp, Globe, MapPin } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface VisaUnlock {
  fromVisa: string;
  toCountry: string;
  description: string;
}

interface VisaUnlockCardProps {
  selectedVisas: string[];
}

export function VisaUnlockCard({ selectedVisas }: VisaUnlockCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockedCountries, setUnlockedCountries] = useState<VisaUnlock[]>([]);

  const visaNames: Record<string, string> = {
    'UnitedStates': 'United States',
    'UnitedKingdom': 'United Kingdom',
    'Canada': 'Canada',
    'Schengen': 'Schengen',
    'Japan': 'Japan',
    'Australia': 'Australia',
    'NewZealand': 'New Zealand',
    'Singapore': 'Singapore'
  };

  useEffect(() => {
    if (selectedVisas.length === 0) {
      setUnlockedCountries([]);
      return;
    }

    const fetchUnlockedCountries = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/visa-info?visas=${selectedVisas.join(',')}`);
        if (!response.ok) {
          throw new Error('Failed to fetch unlocked countries');
        }
        
        const data = await response.json();
        setUnlockedCountries(data.unlockedCountries || []);
      } catch (err) {
        console.error('Error fetching unlocked countries:', err);
        setError('Failed to fetch unlocked countries. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUnlockedCountries();
  }, [selectedVisas]);

  // Group countries by the visa that unlocks them
  const countryByVisa: Record<string, VisaUnlock[]> = {};
  unlockedCountries.forEach(country => {
    if (!countryByVisa[country.fromVisa]) {
      countryByVisa[country.fromVisa] = [];
    }
    countryByVisa[country.fromVisa].push(country);
  });

  if (loading) {
    return (
      <Card className="bg-white mt-4 w-full animate-pulse">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#FF6B6B]" />
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white mt-4 w-full border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (unlockedCountries.length === 0 && selectedVisas.length > 0) {
    return (
      <Card className="bg-white mt-4 w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#FF6B6B]" />
            No Countries Unlocked
          </CardTitle>
          <CardDescription>
            We couldn't find any countries unlocked by your selected visas. This could be due to:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm text-gray-600">
            <li>Data might not be available yet for your selected combination</li>
            <li>Try selecting different visa combinations</li>
            <li>Our scraped data might be incomplete</li>
          </ul>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white mt-4 w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Globe className="h-5 w-5 text-[#FF6B6B]" />
          {unlockedCountries.length} Countries Unlocked
        </CardTitle>
        <CardDescription>
          Your selected visas unlock these additional travel destinations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(countryByVisa).map(([visa, countries]) => (
            <div key={visa} className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Stamp className="h-4 w-4 text-[#4ECDC4]" />
                Unlocked by {visaNames[visa] || visa} visa:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {countries.map((country, idx) => (
                  <div key={idx} className="border rounded p-2 bg-gray-50">
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-[#FFD166]" />
                      {country.toCountry}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{country.description || "Visa requirements simplified"}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 