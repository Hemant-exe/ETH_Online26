"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  PencilIcon,
  MapPinIcon,
  CalendarIcon,
  Hexagon,
  ChevronRight,
  ShieldIcon,
  LockIcon,
  HistoryIcon,
} from "lucide-react"
import EditProfileModal from "./edit-profile-modal"
import { useVeridaClient, useProfileRestService } from "@/app/lib/clientside-verida"

// Default profile data structure
const defaultProfileData = {
  name: "",
  bio: "",
  age: 0,
  location: "",
  profileImage: "",
  isOnChain: {
    name: false,
    bio: false,
    age: false,
    location: false,
  },
}

export default function ProfileSnapshot() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState(defaultProfileData)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Get Verida client and profile service
  const { client, isLoading: clientLoading, getDidId } = useVeridaClient()
  const { service: profileRestService, isLoading: serviceLoading } = useProfileRestService()

  // Load user data from Verida
  useEffect(() => {
    const loadUserData = async () => {
      // Skip if already loaded or dependencies are still loading
      if (dataLoaded || clientLoading || serviceLoading || !profileRestService) {
        return
      }
      
      try {
        setIsLoading(true)
        
        // Get DID from localStorage
        let did = localStorage.getItem("veridaDID") || ""
        
        if (!did && client) {
          try {
            did = await getDidId() || ""
            if (did) {
              localStorage.setItem("veridaDID", did)
            }
          } catch (error) {
            console.error("Error getting DID:", error)
          }
        }
        
        if (did) {
          // Load profile data from Verida
          try {
            const profile = await profileRestService.getProfile(did)
            console.log("Loaded profile data for snapshot:", profile)
            
            if (profile) {
              // Get the primary photo
              let photoUrl = ""
              try {
                const photos = await profileRestService.getProfilePhotos(did)
                if (photos && photos.length > 0) {
                  // Use primary photo if set, otherwise use first photo
                  const primaryIndex = profile.primaryPhotoIndex !== undefined ? profile.primaryPhotoIndex : 0
                  if (photos[primaryIndex]) {
                    photoUrl = photos[primaryIndex].photoUrl
                  }
                }
              } catch (photoError) {
                console.error("Error loading photos:", photoError)
              }
              
              // Check if user has NFT (indicates on-chain data)
              const hasNFT = !!localStorage.getItem("nftData")
              
              setProfileData({
                name: profile.displayName || "User",
                bio: profile.bio || "No bio available",
                age: profile.age || 0,
                location: profile.location || "Location not set",
                profileImage: photoUrl || "/Profile.png?height=200&width=200",
                isOnChain: {
                  name: hasNFT,
                  bio: false, // Bio is typically off-chain
                  age: hasNFT,
                  location: false, // Location is typically off-chain
                },
              })
            }
          } catch (error) {
            console.error("Error loading profile:", error)
            // Use default data if profile loading fails
            setProfileData({
              ...defaultProfileData,
              name: "User",
              profileImage: "/Profile.png?height=200&width=200",
            })
          }
        } else {
          // Use default data if no DID
          setProfileData({
            ...defaultProfileData,
            name: "User",
            profileImage: "/Profile.png?height=200&width=200",
          })
        }
        
        // Mark as loaded to prevent further calls
        setDataLoaded(true)
      } catch (error) {
        console.error("Error in loadUserData:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUserData()
  }, [client, clientLoading, serviceLoading, profileRestService, getDidId, dataLoaded])

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative backdrop-blur-sm bg-white/80 rounded-2xl border border-indigo-100 p-6 h-full shadow-md">
            <div className="absolute -top-3 -right-3 rotate-12">
              <Hexagon className="h-8 w-8 text-cyan-500 fill-cyan-100" />
            </div>

            <div className="flex flex-col items-center space-y-6">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-1000"></div>
                {isLoading ? (
                  <div className="h-32 w-32 rounded-full bg-gray-200 animate-pulse"></div>
                ) : (
                  <Avatar className="h-32 w-32 relative">
                    <AvatarImage src={profileData.profileImage} alt={profileData.name} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-400 text-white text-2xl">
                      {profileData.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              <div className="w-full space-y-4 mt-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    {isLoading ? (
                      <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      <h3 className="text-lg font-semibold text-slate-800">{profileData.name}</h3>
                    )}
                    {profileData.isOnChain.name && (
                      <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                        On-Chain
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-slate-600 gap-2">
                    <CalendarIcon className="h-4 w-4 text-indigo-500" />
                    {isLoading ? (
                      <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      <span>{profileData.age > 0 ? `${profileData.age} years old` : "Age not set"}</span>
                    )}
                    {profileData.isOnChain.age && (
                      <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                        On-Chain
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-slate-600 gap-2">
                    <MapPinIcon className="h-4 w-4 text-indigo-500" />
                    {isLoading ? (
                      <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      <span>{profileData.location}</span>
                    )}
                    {profileData.isOnChain.location && (
                      <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                        On-Chain
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="backdrop-blur-sm bg-white/80 rounded-2xl border border-indigo-100 p-6 h-full shadow-md">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Profile Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-700"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-indigo-700">Bio</h4>
                  {profileData.isOnChain.bio ? (
                    <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                      On-Chain
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                      Off-Chain
                    </Badge>
                  )}
                </div>
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                ) : (
                  <p className="text-slate-700 leading-relaxed">{profileData.bio}</p>
                )}
              </div>

              <div className="pt-4 border-t border-indigo-100">
                <h4 className="font-medium text-indigo-700 mb-3">Quick Actions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "View NFT Details", icon: Hexagon },
                    { label: "Update DID Settings", icon: ShieldIcon },
                    { label: "Manage Privacy", icon: LockIcon },
                    { label: "View Activity Log", icon: HistoryIcon },
                  ].map((action, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100">
                          <action.icon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{action.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {isEditing && <EditProfileModal isOpen={isEditing} onClose={() => setIsEditing(false)} profile={profileData} />}
    </>
  )
}

