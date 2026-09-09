"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import MatchesFeed from "./matches-feed"
import MatchFilters from "./match-filters"
import AiRecommendations from "./ai-recommendations"
import DetailedProfile from "./detailed-profile"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Sparkles, Filter, Users, BotIcon as Robot, Heart } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

// Mock data - would be fetched from your API
import { profiles } from "@/data/mock-profiles"

export default function ExploreMatches() {
  const [activeTab, setActiveTab] = useState("all")
  const [aiModeEnabled, setAiModeEnabled] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    ageRange: [18, 45],
    distance: 50,
    interests: [] as string[],
  })
  const [showFilters, setShowFilters] = useState(false)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleProfileSelect = (profileId: string) => {
    setSelectedProfile(profileId)
  }

  const handleProfileClose = () => {
    setSelectedProfile(null)
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const toggleFilters = () => {
    setShowFilters((prev) => !prev)
  }

  if (!mounted) return null

  return (
    <div className="space-y-6" ref={containerRef}>
      {/* Floating control panel */}
      <motion.div
        className="relative backdrop-blur-xl bg-white/60 p-6 rounded-[2.5rem] border border-pink-200 shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 opacity-50"></div>
        <div className="absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 opacity-50"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Heart className="h-8 w-8 text-pink-500 absolute animate-ping opacity-30" />
                <Heart className="h-8 w-8 text-pink-500 relative" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Discover Love</h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2 bg-white/80 px-3 py-2 rounded-full shadow-sm">
                <Switch id="ai-mode" checked={aiModeEnabled} onCheckedChange={setAiModeEnabled} />
                <Label htmlFor="ai-mode" className="flex items-center gap-1 text-slate-700">
                  <Robot className="h-4 w-4 text-pink-500" />
                  AI Matchmaker
                </Label>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleFilters}
                className="bg-white/80 border-pink-200 hover:bg-pink-50 text-pink-700 rounded-full px-4"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dialog for filters */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="p-0 border-0 bg-transparent max-w-4xl">
          <MatchFilters filters={filters} onFilterChange={handleFilterChange} onClose={toggleFilters} />
        </DialogContent>
      </Dialog>

      {/* Custom tab selector */}
      <div className="flex justify-center mb-8">
        <div className="backdrop-blur-md bg-white/40 p-2 rounded-full border border-pink-100 shadow-md">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`relative px-6 py-3 rounded-full transition-all duration-300 ${
                activeTab === "all" ? "text-white" : "text-slate-700 hover:text-pink-600"
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>All Matches</span>
              </span>
              {activeTab === "all" && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full -z-0"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab("ai-picks")}
              className={`relative px-6 py-3 rounded-full transition-all duration-300 ${
                activeTab === "ai-picks" ? "text-white" : "text-slate-700 hover:text-pink-600"
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>AI Picks</span>
              </span>
              {activeTab === "ai-picks" && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full -z-0"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "all" && (
            <MatchesFeed profiles={profiles} onProfileSelect={handleProfileSelect} aiModeEnabled={aiModeEnabled} />
          )}
          {activeTab === "ai-picks" && (
            <AiRecommendations
              profiles={profiles.filter((p) => p.aiRecommended)}
              onProfileSelect={handleProfileSelect}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {selectedProfile && (
        <DetailedProfile profileId={selectedProfile} onClose={handleProfileClose} profiles={profiles} />
      )}

      <div className="flex justify-center mt-12">
        <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <Sparkles className="h-5 w-5 mr-2" />
          Refresh Matches
        </Button>
      </div>
    </div>
  )
}

