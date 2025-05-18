"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Users, X, Save, Info } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock data - would be fetched from your API
const initialPreferences = {
  interestAlignment: 75,
  locationProximity: 50,
  personalityMatch: 85,
  dealbreakers: ["Smoking", "Different relationship goals"],
}

export default function MatchingPreferences() {
  const [preferences, setPreferences] = useState(initialPreferences)
  const [newDealbreaker, setNewDealbreaker] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSliderChange = (name: string, value: number[]) => {
    setPreferences({
      ...preferences,
      [name]: value[0],
    })
  }

  const handleAddDealbreaker = (e: React.FormEvent) => {
    e.preventDefault()
    if (newDealbreaker.trim()) {
      setPreferences({
        ...preferences,
        dealbreakers: [...preferences.dealbreakers, newDealbreaker.trim()],
      })
      setNewDealbreaker("")
    }
  }

  const handleRemoveDealbreaker = (index: number) => {
    const newDealbreakers = [...preferences.dealbreakers]
    newDealbreakers.splice(index, 1)
    setPreferences({
      ...preferences,
      dealbreakers: newDealbreakers,
    })
  }

  const handleSave = () => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Preferences Saved",
        description: "Your AI twin will now use these preferences for matching.",
        variant: "default",
      })
    }, 1500)
  }

  return (
    <motion.div
      className="backdrop-blur-xl bg-white/60 rounded-[2rem] border border-pink-200 p-6 shadow-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative elements */}
      <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 opacity-30"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-xl">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Customize Your Match Criteria</h3>
        </div>

        <div className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="text-slate-700 flex items-center gap-2 cursor-help">
                        <Heart className="h-4 w-4 text-pink-500" />
                        Interest Alignment
                        <Info className="h-4 w-4 text-slate-400" />
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border border-pink-100 text-slate-700 max-w-xs p-3 rounded-xl">
                      <p>How strongly should your AI prioritize shared interests when finding matches?</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-bold text-pink-600">{preferences.interestAlignment}%</span>
              </div>
              <Slider
                defaultValue={[preferences.interestAlignment]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => handleSliderChange("interestAlignment", value)}
                className="py-4"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="text-slate-700 flex items-center gap-2 cursor-help">
                        <MapPin className="h-4 w-4 text-pink-500" />
                        Location Proximity
                        <Info className="h-4 w-4 text-slate-400" />
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border border-pink-100 text-slate-700 max-w-xs p-3 rounded-xl">
                      <p>
                        How important is physical distance? Higher values mean your AI will prioritize people closer to
                        you.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-bold text-pink-600">{preferences.locationProximity}%</span>
              </div>
              <Slider
                defaultValue={[preferences.locationProximity]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => handleSliderChange("locationProximity", value)}
                className="py-4"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="text-slate-700 flex items-center gap-2 cursor-help">
                        <Users className="h-4 w-4 text-pink-500" />
                        Personality Match
                        <Info className="h-4 w-4 text-slate-400" />
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border border-pink-100 text-slate-700 max-w-xs p-3 rounded-xl">
                      <p>
                        How much weight should your AI give to personality compatibility based on communication style
                        and values?
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-bold text-pink-600">{preferences.personalityMatch}%</span>
              </div>
              <Slider
                defaultValue={[preferences.personalityMatch]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => handleSliderChange("personalityMatch", value)}
                className="py-4"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-slate-700 flex items-center gap-2">
              <X className="h-4 w-4 text-pink-500" />
              Dealbreakers
            </Label>

            <div className="flex flex-wrap gap-2 mb-4">
              {preferences.dealbreakers.map((dealbreaker, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-pink-50 text-pink-700 border-pink-200 px-3 py-1 rounded-full flex items-center gap-1"
                >
                  {dealbreaker}
                  <button onClick={() => handleRemoveDealbreaker(index)} className="ml-1 hover:text-rose-600">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <form onSubmit={handleAddDealbreaker} className="flex gap-2">
              <input
                type="text"
                value={newDealbreaker}
                onChange={(e) => setNewDealbreaker(e.target.value)}
                placeholder="Add a dealbreaker..."
                className="flex-1 px-4 py-2 rounded-full border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white/80"
              />
              <Button
                type="submit"
                variant="outline"
                className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700 rounded-full"
              >
                Add
              </Button>
            </form>
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full py-6"
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

