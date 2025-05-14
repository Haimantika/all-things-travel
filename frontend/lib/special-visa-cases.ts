interface SpecialVisaCase {
  passportCountry: string
  fromCountry: string
  toCountry: string
  description: string
}

export const specialVisaCases: SpecialVisaCase[] = [
  {
    passportCountry: "India",
    fromCountry: "United States of America",
    toCountry: "United Arab Emirates",
    description: "Indian passport holders with a valid US visa can get a visa on arrival in the UAE for up to 14 days.",
  },
  {
    passportCountry: "India",
    fromCountry: "United Kingdom",
    toCountry: "United Arab Emirates",
    description: "Indian passport holders with a valid UK visa can get a visa on arrival in the UAE for up to 14 days.",
  },
  {
    passportCountry: "India",
    fromCountry: "European Union",
    toCountry: "United Arab Emirates",
    description:
      "Indian passport holders with a valid Schengen visa can get a visa on arrival in the UAE for up to 14 days.",
  },
  {
    passportCountry: "Any",
    fromCountry: "United States of America",
    toCountry: "Turkey",
    description: "Travelers with a valid US visa may be eligible for an e-Visa or visa on arrival in Turkey.",
  },
  {
    passportCountry: "Any",
    fromCountry: "United Kingdom",
    toCountry: "Turkey",
    description: "Travelers with a valid UK visa may be eligible for an e-Visa or visa on arrival in Turkey.",
  },
  {
    passportCountry: "Any",
    fromCountry: "European Union",
    toCountry: "Turkey",
    description: "Travelers with a valid Schengen visa may be eligible for an e-Visa or visa on arrival in Turkey.",
  },
  {
    passportCountry: "China",
    fromCountry: "Any",
    toCountry: "Singapore",
    description: "Chinese passport holders may be eligible for the 96-hour Visa Free Transit Facility in Singapore.",
  },
  {
    passportCountry: "India",
    fromCountry: "Any",
    toCountry: "Thailand",
    description:
      "Indian passport holders can apply for visa on arrival in Thailand for tourism purposes (up to 15 days).",
  },
]

export function findSpecialVisaCase(passport: string, from: string, to: string): SpecialVisaCase | undefined {
  console.log("Finding special case for:", passport, from, to)

  // First try exact match
  let match = specialVisaCases.find(
    (specialCase) =>
      specialCase.passportCountry === passport && specialCase.fromCountry === from && specialCase.toCountry === to,
  )

  if (match) {
    console.log("Found exact match:", match)
    return match
  }

  // Try with "Any" for fromCountry
  match = specialVisaCases.find(
    (specialCase) =>
      specialCase.passportCountry === passport && specialCase.fromCountry === "Any" && specialCase.toCountry === to,
  )

  if (match) {
    console.log("Found match with Any fromCountry:", match)
    return match
  }

  // Try with "Any" for passportCountry
  match = specialVisaCases.find(
    (specialCase) =>
      specialCase.passportCountry === "Any" && specialCase.fromCountry === from && specialCase.toCountry === to,
  )

  if (match) {
    console.log("Found match with Any passportCountry:", match)
    return match
  }

  console.log("No special case found")
  return undefined
}

  