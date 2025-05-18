"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Sparkles, MapPin, Brain } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
  aiReason?: string
}

interface AiRecommendationsProps {
  profiles: Profile[]
  onProfileSelect: (profileId: string) => void
}

export default function AiRecommendations({ profiles, onProfileSelect }: AiRecommendationsProps) {
  return (
    <div className="space-y-8">
      <motion.div
        className="backdrop-blur-xl bg-white/60 rounded-[2rem] border border-pink-200 p-6 shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 opacity-50"></div>

          <div className="flex gap-3 relative z-10">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-3 rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-800 mb-1">Your AI Twin Recommends</h3>
              <p className="text-sm text-slate-600">
                These suggestions are based on both your on-chain NFT data and your off-chain preferences. Update your
                AI preferences anytime in your profile settings.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {profiles.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <motion.div
              className="backdrop-blur-xl bg-white/60 rounded-[2rem] border border-pink-200 p-8 shadow-xl max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold text-slate-800 mb-4">No AI recommendations yet</h3>
              <p className="text-slate-600 mb-6">
                Your AI twin is still learning your preferences. Check back soon or update your profile with more
                details.
              </p>
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full px-6 py-2">
                Update Preferences
              </Button>
            </motion.div>
          </div>
        ) : (
          profiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <div
                className="backdrop-blur-xl bg-white/70 rounded-[2rem] border border-pink-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                onClick={() => onProfileSelect(profile.id)}
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative md:w-2/5 aspect-square md:aspect-auto">
                    <img
                      src={profile.profileImage || "/placeholder.svg?height=300&width=300"}
                      alt={profile.name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 flex items-center gap-1 px-3 py-1 rounded-full shadow-md">
                        <Sparkles className="h-3 w-3" />
                        Top Match
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6 md:w-3/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800">
                          {profile.name}, {profile.age}
                        </h3>
                        <div className="flex items-center text-slate-500 text-sm mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{profile.location}</span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border-green-200 px-3 py-1 rounded-full"
                      >
                        {profile.compatibilityScore}% Match
                      </Badge>
                    </div>

                    <p className="text-slate-700 mt-4">{profile.tagline}</p>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {profile.interests.slice(0, 4).map((interest, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="bg-pink-50 text-pink-700 border-pink-200 text-xs rounded-full px-3"
                        >
                          {interest}
                        </Badge>
                      ))}
                      {profile.interests.length > 4 && (
                        <Badge
                          variant="outline"
                          className="bg-pink-50 text-pink-700 border-pink-200 text-xs rounded-full px-3"
                        >
                          +{profile.interests.length - 4} more
                        </Badge>
                      )}
                    </div>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="mt-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 flex items-start gap-2">
                            <Brain className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-pink-700 line-clamp-2">
                              {profile.aiReason ||
                                "Your AI twin thinks you'll connect well with this person based on shared interests and values."}
                            </p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-white border border-pink-100 text-slate-700 max-w-xs p-4 rounded-xl">
                          <p>
                            {profile.aiReason ||
                              "Your AI twin thinks you'll connect well with this person based on shared interests and values."}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div className="p-4 flex justify-between bg-gradient-to-r from-pink-50/50 to-rose-50/50">
                  <Button
                    variant="outline"
                    className="bg-white border-pink-200 hover:bg-pink-50 text-pink-600 flex-1 mr-2 rounded-full"
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Like
                  </Button>
                  <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex-1 rounded-full">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

