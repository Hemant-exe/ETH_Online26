"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { X, Plus, MapPin, Calendar, Search, SlidersHorizontal } from "lucide-react"
import { DialogTitle, DialogHeader } from "@/components/ui/dialog"

// Mock data - would be fetched from your API
const allInterests = [
  "Blockchain",
  "Hiking",
  "Photography",
  "Reading",
  "Travel",
  "Music",
  "Art",
  "Cooking",
  "Gaming",
  "Fitness",
  "Yoga",
  "Dancing",
  "Movies",
  "Technology",
  "Fashion",
  "Sports",
  "Writing",
  "Meditation",
]

interface MatchFiltersProps {
  filters: {
    ageRange: number[]
    distance: number
    interests: string[]
  }
  onFilterChange: (filters: any) => void
  onClose: () => void
}

export default function MatchFilters({ filters, onFilterChange, onClose }: MatchFiltersProps) {
  const [ageRange, setAgeRange] = useState(filters.ageRange)
  const [distance, setDistance] = useState(filters.distance)
  const [selectedInterests, setSelectedInterests] = useState<string[]>(filters.interests)
  const [searchTerm, setSearchTerm] = useState("")

  const handleAgeRangeChange = (newRange: number[]) => {
    setAgeRange(newRange)
  }

  const handleDistanceChange = (newDistance: number[]) => {
    setDistance(newDistance[0])
  }

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest))
    } else {
      setSelectedInterests([...selectedInterests, interest])
    }
  }

  const applyFilters = () => {
    onFilterChange({
      ageRange,
      distance,
      interests: selectedInterests,
    })
    onClose()
  }

  const resetFilters = () => {
    setAgeRange([18, 45])
    setDistance(50)
    setSelectedInterests([])
    setSearchTerm("")
  }

  const filteredInterests = searchTerm
    ? allInterests.filter((interest) => interest.toLowerCase().includes(searchTerm.toLowerCase()))
    : allInterests

  return (
    <div className="p-6 bg-white/60 backdrop-blur-xl rounded-lg overflow-hidden border border-pink-200 shadow-xl">
      <div className="relative">
        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 opacity-30"></div>
        <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 opacity-30"></div>

        <div className="relative z-10">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-xl">
                <SlidersHorizontal className="h-5 w-5 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold text-slate-800">Refine Your Search</DialogTitle>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-700 flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-pink-500" />
                    Age Range:{" "}
                    <span className="font-bold text-pink-600">
                      {ageRange[0]} - {ageRange[1]}
                    </span>
                  </Label>
                </div>
                <Slider
                  defaultValue={ageRange}
                  min={18}
                  max={80}
                  step={1}
                  onValueChange={handleAgeRangeChange}
                  className="py-4"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-700 flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-pink-500" />
                    Distance: <span className="font-bold text-pink-600">{distance} miles</span>
                  </Label>
                </div>
                <Slider
                  defaultValue={[distance]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={handleDistanceChange}
                  className="py-4"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-slate-700 text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-pink-500" />
                Interests
              </Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-pink-400" />
                <Input
                  placeholder="Search interests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-6 bg-white/80 border-pink-200 text-slate-800 focus:border-pink-500 rounded-xl text-lg"
                />
              </div>

              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 bg-gradient-to-r from-pink-50/50 to-rose-50/50 rounded-xl">
                {filteredInterests.map((interest) => (
                  <Badge
                    key={interest}
                    variant="outline"
                    className={`cursor-pointer transition-all duration-300 px-3 py-1 text-sm rounded-full ${
                      selectedInterests.includes(interest)
                        ? "bg-pink-100 text-pink-700 border-pink-300 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-pink-50"
                    }`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {selectedInterests.includes(interest) && <X className="h-3 w-3 mr-1" />}
                    {!selectedInterests.includes(interest) && <Plus className="h-3 w-3 mr-1" />}
                    {interest}
                  </Badge>
                ))}
                {filteredInterests.length === 0 && (
                  <p className="text-sm text-slate-500 p-2">No interests found. Try a different search term.</p>
                )}
              </div>

              <p className="text-xs text-pink-600">
                Your off-chain preferences and AI agent settings also influence these results. Filters here provide an
                additional layer of customization.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700 rounded-full px-6"
            >
              Clear All
            </Button>
            <Button
              onClick={applyFilters}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full px-6"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

