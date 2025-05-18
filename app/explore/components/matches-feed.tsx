"use client"

import type React from "react"
import type { PanInfo } from "framer-motion"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Heart, X, Sparkles, MapPin, Calendar } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import useMobile from "@/hooks/use-mobile"

interface Profile {
  id: string
  name: string
  age: number
  location: string
  bio: string
  tagline: string
  profileImage: string
  compatibilityScore: number
  aiRecommended: boolean
  interests: string[]
}

interface MatchesFeedProps {
  profiles: Profile[]
  onProfileSelect: (profileId: string) => void
  aiModeEnabled: boolean
}

export default function MatchesFeed({ profiles, onProfileSelect, aiModeEnabled }: MatchesFeedProps) {
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set())
  const [passedProfiles, setPassedProfiles] = useState<Set<string>>(new Set())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<string | null>(null)
  const isMobile = useMobile()
  const cardConstraintsRef = useRef<HTMLDivElement>(null)

  const filteredProfiles = profiles.filter(
    (profile) => !likedProfiles.has(profile.id) && !passedProfiles.has(profile.id),
  )

  const currentProfile = filteredProfiles[currentIndex]

  const handleLike = (profileId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()

    if (likedProfiles.has(profileId)) return

    setDirection("right")

    // Simulate a match (would be handled by your backend)
    const isMatch = Math.random() > 0.7
    if (isMatch) {
      setTimeout(() => {
        toast({
          title: "It's a match! ❤️",
          description: `You and ${profiles.find((p) => p.id === profileId)?.name} have liked each other.`,
          variant: "default",
        })
      }, 500)
    }

    setTimeout(() => {
      const newLiked = new Set(likedProfiles)
      newLiked.add(profileId)
      setLikedProfiles(newLiked)

      if (currentIndex < filteredProfiles.length - 1) {
        setCurrentIndex(currentIndex + 1)
      }
      setDirection(null)
    }, 300)
  }

  const handlePass = (profileId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()

    if (passedProfiles.has(profileId)) return

    setDirection("left")

    setTimeout(() => {
      const newPassed = new Set(passedProfiles)
      newPassed.add(profileId)
      setPassedProfiles(newPassed)

      if (currentIndex < filteredProfiles.length - 1) {
        setCurrentIndex(currentIndex + 1)
      }
      setDirection(null)
    }, 300)
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100
    if (info.offset.x > threshold) {
      handleLike(currentProfile.id)
    } else if (info.offset.x < -threshold) {
      handlePass(currentProfile.id)
    }
  }

  if (filteredProfiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <motion.div
          className="backdrop-blur-xl bg-white/60 rounded-[2rem] border border-pink-200 p-8 shadow-xl max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <Heart className="w-32 h-32 text-pink-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4 relative z-10">No more profiles to show</h3>
            <p className="text-slate-600 mb-6">
              You've gone through all available profiles. Check back later or adjust your filters to see more matches.
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full px-6 py-2"
            onClick={() => {
              setLikedProfiles(new Set())
              setPassedProfiles(new Set())
              setCurrentIndex(0)
            }}
          >
            Reset & Start Over
          </Button>
        </motion.div>
      </div>
    )
  }

  if (isMobile) {
    // Swipe card UI for mobile
    return (
      <div className="flex flex-col items-center justify-center relative h-[70vh]" ref={cardConstraintsRef}>
        <AnimatePresence>
          <motion.div
            key={currentProfile.id}
            className="absolute w-full max-w-sm"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              x: direction === "left" ? -300 : direction === "right" ? 300 : 0,
              opacity: 0,
              rotate: direction === "left" ? -20 : direction === "right" ? 20 : 0,
            }}
            transition={{ duration: 0.3 }}
            drag="x"
            dragConstraints={cardConstraintsRef}
            onDragEnd={handleDragEnd}
          >
            <Card
              className="backdrop-blur-xl bg-white/70 rounded-[2rem] border border-pink-200 overflow-hidden cursor-grab active:cursor-grabbing shadow-xl"
              onClick={() => onProfileSelect(currentProfile.id)}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-t-[2rem]">
                <img
                  src={currentProfile.profileImage || "/placeholder.svg?height=400&width=300"}
                  alt={currentProfile.name}
                  className="object-cover w-full h-full"
                />

                {currentProfile.aiRecommended && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 flex items-center gap-1 px-3 py-1 rounded-full shadow-md">
                      <Sparkles className="h-3 w-3" />
                      AI Pick
                    </Badge>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-6">
                  <h3 className="text-2xl font-bold text-white">
                    {currentProfile.name}, {currentProfile.age}
                  </h3>
                  <div className="flex items-center text-white/90 text-sm mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{currentProfile.location}</span>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant="outline"
                    className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 text-pink-700 border-pink-200 px-3 py-1 rounded-full"
                  >
                    {currentProfile.compatibilityScore}% Match
                  </Badge>

                  <div className="flex items-center text-xs text-slate-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Active recently</span>
                  </div>
                </div>

                <p className="text-slate-700 mb-4">{currentProfile.tagline}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {currentProfile.interests.slice(0, 3).map((interest, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="bg-pink-50 text-pink-700 border-pink-200 text-xs rounded-full px-3"
                    >
                      {interest}
                    </Badge>
                  ))}
                  {currentProfile.interests.length > 3 && (
                    <Badge
                      variant="outline"
                      className="bg-pink-50 text-pink-700 border-pink-200 text-xs rounded-full px-3"
                    >
                      +{currentProfile.interests.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex justify-between gap-4 mt-4">
                  <Button
                    size="lg"
                    className="bg-white border-2 border-rose-400 hover:bg-rose-50 text-rose-600 flex-1 rounded-full shadow-md"
                    onClick={(e) => handlePass(currentProfile.id, e)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                  <Button
                    size="lg"
                    className="bg-white border-2 border-pink-400 hover:bg-pink-50 text-pink-600 flex-1 rounded-full shadow-md"
                    onClick={(e) => handleLike(currentProfile.id, e)}
                  >
                    <Heart className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-[-70px] text-center text-slate-500 text-sm">
          <p>Swipe left to pass, right to like, or tap to view details</p>
        </div>
      </div>
    )
  }

  // Grid layout for desktop
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
      {filteredProfiles.map((profile, index) => (
        <motion.div
          key={profile.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ y: -10, transition: { duration: 0.2 } }}
          className="h-full"
        >
          <Card
            className="h-full backdrop-blur-xl bg-white/70 rounded-[2rem] border border-pink-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => onProfileSelect(profile.id)}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[2rem]">
              <img
                src={profile.profileImage || "/placeholder.svg?height=400&width=300"}
                alt={profile.name}
                className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
              />

              {profile.aiRecommended && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 flex items-center gap-1 px-3 py-1 rounded-full shadow-md">
                    <Sparkles className="h-3 w-3" />
                    AI Pick
                  </Badge>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-6">
                <h3 className="text-2xl font-bold text-white">
                  {profile.name}, {profile.age}
                </h3>
                <div className="flex items-center text-white/90 text-sm mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{profile.location}</span>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <Badge
                  variant="outline"
                  className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 text-pink-700 border-pink-200 px-3 py-1 rounded-full"
                >
                  {profile.compatibilityScore}% Match
                </Badge>

                <div className="flex items-center text-xs text-slate-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Active recently</span>
                </div>
              </div>

              <p className="text-slate-700 line-clamp-2 mb-4">{profile.tagline}</p>

              <div className="flex flex-wrap gap-1 mb-4">
                {profile.interests.slice(0, 3).map((interest, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="bg-pink-50 text-pink-700 border-pink-200 text-xs rounded-full px-3"
                  >
                    {interest}
                  </Badge>
                ))}
                {profile.interests.length > 3 && (
                  <Badge
                    variant="outline"
                    className="bg-pink-50 text-pink-700 border-pink-200 text-xs rounded-full px-3"
                  >
                    +{profile.interests.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="flex justify-between gap-4 mt-4">
                <Button
                  variant="outline"
                  className="bg-white border-rose-200 hover:bg-rose-50 text-rose-600 flex-1 rounded-full"
                  onClick={(e) => handlePass(profile.id, e)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Pass
                </Button>
                <Button
                  variant="outline"
                  className="bg-white border-pink-200 hover:bg-pink-50 text-pink-600 flex-1 rounded-full"
                  onClick={(e) => handleLike(profile.id, e)}
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Like
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

