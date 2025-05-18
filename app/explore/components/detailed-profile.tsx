"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, X, MapPin, Calendar, Sparkles, User, Image, Tag, Hexagon, Shield } from "lucide-react"
import { toast } from "@/hooks/use-toast"

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
  photos?: string[]
  aiReason?: string
  verified?: boolean
}

interface DetailedProfileProps {
  profileId: string
  onClose: () => void
  profiles: Profile[]
}

export default function DetailedProfile({ profileId, onClose, profiles }: DetailedProfileProps) {
  const [activeTab, setActiveTab] = useState("about")

  const profile = profiles.find((p) => p.id === profileId)

  if (!profile) {
    return null
  }

  const handleLike = () => {
    // Simulate a match (would be handled by your backend)
    const isMatch = Math.random() > 0.7
    if (isMatch) {
      toast({
        title: "It's a match! ❤️",
        description: `You and ${profile.name} have liked each other.`,
        variant: "default",
      })
    } else {
      toast({
        title: "Profile liked!",
        description: "We'll notify you if they like you back.",
        variant: "default",
      })
    }
    onClose()
  }

  const handleMessage = () => {
    toast({
      title: "Message sent!",
      description: `Your conversation with ${profile.name} has started.`,
      variant: "default",
    })
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 bg-white/90 backdrop-blur-xl rounded-[2rem] border border-pink-200 overflow-hidden shadow-xl">
        <div className="relative h-64 sm:h-80 overflow-hidden rounded-t-[2rem]">
          <img
            src={profile.profileImage || "/placeholder.svg?height=600&width=800"}
            alt={profile.name}
            className="object-cover w-full h-full"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {profile.name}, {profile.age}
                </h2>
                <div className="flex items-center text-white/90 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{profile.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {profile.verified && (
                  <Badge className="bg-green-500 text-white border-0 rounded-full px-3">Verified</Badge>
                )}
                {profile.aiRecommended && (
                  <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 flex items-center gap-1 rounded-full px-3">
                    <Sparkles className="h-3 w-3" />
                    AI Match
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="backdrop-blur-md bg-white/40 p-2 rounded-full border border-pink-100 shadow-md">
              <div className="flex space-x-2">
                {["about", "photos", "interests", "verification"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-5 py-2 rounded-full transition-all duration-300 ${
                      activeTab === tab ? "text-white" : "text-slate-700 hover:text-pink-600"
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {tab === "about" && <User className="h-4 w-4" />}
                      {tab === "photos" && <Image className="h-4 w-4" />}
                      {tab === "interests" && <Tag className="h-4 w-4" />}
                      {tab === "verification" && <Shield className="h-4 w-4" />}
                      <span className="capitalize">{tab}</span>
                    </span>
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeProfileTabBg"
                        className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full -z-0"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "about" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Bio</h3>
                    <p className="text-slate-700">{profile.bio || profile.tagline}</p>
                  </div>

                  {profile.aiRecommended && profile.aiReason && (
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-pink-700 mb-1">AI Insights</h4>
                        <p className="text-sm text-pink-600">{profile.aiReason}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border-green-200 px-3 py-1 rounded-full"
                    >
                      {profile.compatibilityScore}% Match
                    </Badge>

                    <div className="flex items-center text-sm text-slate-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Active recently</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "photos" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {(profile.photos || [profile.profileImage]).map((photo, index) => (
                    <motion.div
                      key={index}
                      className="aspect-square rounded-xl overflow-hidden border border-pink-100 shadow-md"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    >
                      <img
                        src={photo || "/placeholder.svg?height=300&width=300"}
                        alt={`${profile.name} photo ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === "interests" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-800">Interests & Hobbies</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Badge
                          variant="outline"
                          className="bg-pink-50 text-pink-700 border-pink-200 px-3 py-1 rounded-full text-sm"
                        >
                          {interest}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "verification" && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-full ${profile.verified ? "bg-green-100" : "bg-amber-100"}`}>
                      <Shield className={`h-6 w-6 ${profile.verified ? "text-green-500" : "text-amber-500"}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">
                        {profile.verified ? "Verified Profile" : "Verification Status"}
                      </h3>
                      <p className="text-slate-600">
                        {profile.verified
                          ? "This profile has been verified through our decentralized identity system."
                          : "This profile has not completed all verification steps yet."}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Hexagon className="h-5 w-5 text-indigo-500 fill-indigo-100" />
                      <h4 className="font-bold text-indigo-700">On-Chain Verification</h4>
                    </div>
                    <p className="text-sm text-indigo-600">
                      This profile is backed by a decentralized identity (DID) and NFT, ensuring authenticity and data
                      integrity.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-pink-100 flex justify-between">
          <Button
            variant="outline"
            className="bg-white border-rose-200 hover:bg-rose-50 text-rose-600 flex-1 mr-2 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button
            variant="outline"
            className="bg-white border-pink-200 hover:bg-pink-50 text-pink-600 flex-1 mr-2 rounded-full"
            onClick={handleLike}
          >
            <Heart className="h-4 w-4 mr-2" />
            Like
          </Button>
          <Button
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex-1 rounded-full"
            onClick={handleMessage}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

