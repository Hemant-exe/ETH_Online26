"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, XIcon, HeartIcon, TagIcon, LoaderIcon } from "lucide-react"
import type { ProfileData } from "../profile-creation-flow"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useVeridaClient, useProfileRestService } from "@/app/lib/clientside-verida"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PreferencesStepProps {
  profileData: ProfileData
  updateProfileData: (data: Partial<ProfileData>) => void
  onContinue: () => void
}

const SUGGESTED_INTERESTS = [
  "Music",
  "Movies",
  "Reading",
  "Travel",
  "Cooking",
  "Fitness",
  "Art",
  "Photography",
  "Technology",
  "Gaming",
  "Hiking",
  "Yoga",
  "Dancing",
  "Writing",
  "Fashion",
  "Sports",
  "Meditation",
  "Cycling",
]

export default function PreferencesStep({ profileData, updateProfileData, onContinue }: PreferencesStepProps) {
  const { toast } = useToast()
  const [newInterest, setNewInterest] = useState("")
  const interestsRef = useRef<HTMLDivElement>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isLoadingPreferences, setIsLoadingPreferences] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { client } = useVeridaClient()
  const { service: profileRestService, isLoading: serviceLoading } = useProfileRestService()

  // Fetch existing preferences when component mounts
  useEffect(() => {
    const fetchExistingPreferences = async () => {
      // Only fetch if we have a DID and the interests array is empty
      if (profileData.did && profileData.interests.length === 0) {
        try {
          setIsLoadingPreferences(true)
          
          if (!serviceLoading && profileRestService) {
            console.log("Fetching preferences for DID:", profileData.did)
            
            // Check if the service has a getPreferences method
            if (typeof profileRestService.getPreferences === 'function') {
              try {
                const preferences = await profileRestService.getPreferences(profileData.did)
                console.log("Fetched preferences:", preferences)
                
                if (preferences) {
                  // Update profile data with fetched preferences
                  updateProfileData({
                    interests: preferences.interests || [],
                    relationshipGoals: preferences.relationshipGoals || "",
                    // Include any other preference fields here
                  })
                  
                  // toast({
                  //   title: "Preferences Retrieved",
                  //   description: "Loaded your existing preferences from your profile.",
                  //   duration: 3000,
                  // })
                } else {
                  console.log("No preferences found for this DID")
                }
              } catch (prefError) {
                console.error("Error fetching preferences:", prefError)
                // Don't show an error toast here, just log it
              }
            } else {
              console.warn("profileRestService.getPreferences method not available")
              
              // Try to get preferences from profile data if it exists
              if (profileData._id && profileData.interests) {
                console.log("Using interests from existing profile data")
              }
            }
          }
        } catch (error) {
          console.error("Error in fetchExistingPreferences:", error)
        } finally {
          setIsLoadingPreferences(false)
        }
      }
    }
    
    fetchExistingPreferences()
  }, [profileData.did, serviceLoading, profileRestService])

  const handleContinue = async () => {
    if (profileData.interests.length === 0) {
      toast({
        variant: "destructive",
        title: "Required Field Missing",
        description: "Please add at least one interest to continue",
        duration: 3000,
      })
      return
    }

    if (!profileData.relationshipGoals) {
      toast({
        variant: "destructive",
        title: "Required Field Missing",
        description: "Please select your relationship goals to continue",
        duration: 3000,
      })
      return
    }

    // Save complete profile data to Verida
    setIsSaving(true)
    setError(null)
    
    try {
      console.log("Starting profile save process...")
      
      // Ensure we have a DID
      let did = profileData.did || "unknown"
      if (did === "unknown" && client) {
        try {
          if (!client.isConnected()) {
            const connected = await client.connect()
            if (connected) {
              did = client.getDid() || "unknown"
              console.log("Connected successfully, got DID:", did)
              updateProfileData({ did })
            }
          } else {
            did = client.getDid() || "unknown"
            console.log("Already connected, using DID:", did)
            updateProfileData({ did })
          }
        } catch (didError) {
          console.error("Error getting DID:", didError)
        }
      }
      
      if (did === "unknown") {
        console.warn("Using 'unknown' as DID. This might cause issues with data retrieval later.")
        toast({
          title: "Authentication Notice",
          description: "Unable to authenticate with Verida. Your data will be saved with a temporary identifier.",
          duration: 5000,
        })
      }
      
      // Prepare complete profile data
      const profileDataToSave = {
        did: did,
        displayName: profileData.displayName,
        age: profileData.age,
        location: profileData.location || "",
        bio: profileData.bio || "",
        interests: profileData.interests || [],
        relationshipGoals: profileData.relationshipGoals || "",
        primaryPhotoIndex: profileData.primaryPhotoIndex !== undefined ? profileData.primaryPhotoIndex : 0,
        _id: profileData._id,
        _rev: profileData._rev
      }
      
      console.log("Saving complete profile data:", profileDataToSave)
      console.log("Using primaryPhotoIndex for save:", profileDataToSave.primaryPhotoIndex)
      
      // Try to save using the REST service
      if (profileRestService) {
        try {
          console.log("Using REST API to save profile with standard schemas")
          const savedProfile = await profileRestService.saveProfile(profileDataToSave)
          console.log("Profile saved successfully via REST API:", savedProfile)
          
          // Update local profile data with the saved data including _id and _rev
          updateProfileData({
            ...savedProfile,
            _id: savedProfile._id,
            _rev: savedProfile._rev
          })
          
          // If we have photos, save them one by one
          if (profileData.photos && profileData.photos.length > 0) {
            console.log(`Saving ${profileData.photos.length} photos to Verida...`)
            
            // Use photoDataArray if available, otherwise create data from photos array
            const photoData = profileData.photoDataArray || profileData.photos.map((url, i) => ({
              did: did,
              photoUrl: url,
              description: `Profile Photo ${i + 1}`,
              isPrivate: false,
              order: i
            }));
            
            // Save photos one by one, but add a delay between each to ensure unique timestamps
            for (let i = 0; i < photoData.length; i++) {
              try {
                // Make sure the photo data has the correct DID and a unique timestamp
                const photoToSave = {
                  ...photoData[i],
                  did: did, // Ensure we use the current DID
                  uniqueId: `${Date.now()}-${i}` // Add a unique identifier
                };
                
                // Add a small delay between saves to ensure unique timestamps
                if (i > 0) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                await profileRestService.saveProfilePhoto(photoToSave)
                console.log(`Photo ${i + 1} saved successfully with uniqueId ${photoToSave.uniqueId}`)
              } catch (photoError) {
                console.error(`Error saving photo ${i + 1}:`, photoError)
                // Continue with next photo
              }
            }
          }
          
          toast({
            title: "Profile Saved",
            description: "Your complete profile has been securely stored using Verida.",
            duration: 3000,
          })
          
          // Continue to next step
          onContinue()
          return
        } catch (restError: any) {
          // Check for specific REST API errors
          const errorMessage = restError instanceof Error ? restError.message : String(restError)
          
          if (errorMessage.includes("Missing scope")) {
            console.error("REST API error - Missing scope:", errorMessage)
            setError("The app lacks permission to save your profile. The API token is missing required scopes.")
            
            toast({
              variant: "destructive",
              title: "Permission Error",
              description: "Your profile cannot be saved due to missing API permissions. Please use the Continue anyway button to proceed.",
              duration: 5000,
            })
          } else if (errorMessage.includes("Invalid permission")) {
            console.error("REST API error - Invalid permission:", errorMessage)
            setError("The app lacks permission to save your profile. Please use the Continue anyway button to proceed.")
          } else {
            console.error("REST API error:", errorMessage)
            setError(`REST API error: ${errorMessage}. Please use the Continue anyway button to proceed.`)
          }
        }
      } else {
        console.log("REST service not available")
        setError("REST service not available. Please use the Continue anyway button to proceed.")
        toast({
          variant: "destructive",
          title: "Service Unavailable",
          description: "The profile service is not available. Please use the Continue anyway button to proceed.",
          duration: 5000,
        })
      }
      
      // If we reach here, there was an error but we'll continue anyway
      onContinue()
    } catch (err) {
      console.error("Error in profile save process:", err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(errorMessage)
      
      toast({
        variant: "destructive",
        title: "Profile Save Failed",
        description: "An unexpected error occurred while saving your profile.",
        duration: 3000,
      })
      
      // Continue anyway
      onContinue()
    } finally {
      setIsSaving(false)
    }
  }

  const addInterest = (interest: string) => {
    if (!interest.trim()) return

    if (profileData.interests.includes(interest.trim())) {
      toast({
        variant: "destructive",
        title: "Duplicate Interest",
        description: "This interest is already added to your profile",
        duration: 3000,
      })
      return
    }

    if (profileData.interests.length >= 10) {
      toast({
        variant: "destructive",
        title: "Maximum Reached",
        description: "You can add up to 10 interests maximum",
        duration: 3000,
      })
      return
    }

    updateProfileData({
      interests: [...profileData.interests, interest.trim()],
    })

    setNewInterest("")
  }

  const removeInterest = (interest: string) => {
    updateProfileData({
      interests: profileData.interests.filter((item) => item !== interest),
    })
  }

  return (
    <>
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">
          Your Interests & Match Preferences
        </CardTitle>
        <CardDescription className="text-base mt-1 text-gray-600">Help us find your perfect matches</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
            <AlertDescription className="flex justify-between items-center">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-4 text-xs border-red-300 hover:bg-red-100"
                onClick={() => onContinue()}
              >
                Continue anyway
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {isLoadingPreferences ? (
          <div className="flex items-center justify-center h-40">
            <LoaderIcon className="h-6 w-6 text-indigo-600 animate-spin mr-2" />
            <p className="text-indigo-600">Loading your preferences...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interests Section */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-1.5 rounded-md mr-2">
                  <TagIcon className="h-4 w-4 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-indigo-800">Your Interests</h3>
              </div>

              {/* Interest cloud */}
              <div
                ref={interestsRef}
                className="min-h-[120px] mb-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100"
              >
                {profileData.interests.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-indigo-300 text-lg">Add your interests below</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileData.interests.map((interest) => (
                      <div
                        key={interest}
                        className="group bg-white flex items-center px-3 py-1.5 rounded-full border border-indigo-200 shadow-sm hover:shadow transition-all duration-200"
                      >
                        <span className="text-indigo-700 font-medium mr-2">{interest}</span>
                        <button
                          onClick={() => removeInterest(interest)}
                          className="h-5 w-5 rounded-full flex items-center justify-center bg-indigo-100 hover:bg-indigo-200 transition-colors"
                        >
                          <XIcon className="h-3 w-3 text-indigo-700" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Interest input */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type an interest..."
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addInterest(newInterest)
                        }
                      }}
                      className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 pl-10 py-2 text-gray-800"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <TagIcon className="h-4 w-4 text-indigo-500" />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => addInterest(newInterest)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Suggested interests */}
              <div>
                <p className="text-sm text-indigo-700 font-medium mb-3">Suggested interests:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_INTERESTS.filter((interest) => !profileData.interests.includes(interest))
                    .slice(0, 8)
                    .map((interest) => (
                      <button
                        key={interest}
                        onClick={() => addInterest(interest)}
                        className="bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 px-3 py-1.5 rounded-full text-indigo-700 font-medium text-sm border border-indigo-200 transition-all duration-200 hover:shadow-sm"
                      >
                        {interest}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Relationship Goals Section */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-1.5 rounded-md mr-2">
                  <HeartIcon className="h-4 w-4 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-indigo-800">Relationship Goals</h3>
              </div>

              <p className="text-center text-gray-600 mb-6">What are you looking for?</p>

              <RadioGroup
                value={profileData.relationshipGoals}
                onValueChange={(value) => updateProfileData({ relationshipGoals: value })}
                className="grid grid-cols-2 gap-4"
              >
                <div className="relative">
                  <RadioGroupItem value="long-term" id="long-term" className="sr-only peer" />
                  <Label
                    htmlFor="long-term"
                    className="flex flex-col items-center p-4 rounded-lg border-2 border-indigo-200 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50 hover:bg-indigo-50/50 transition-all duration-200 cursor-pointer"
                  >
                    <div className="h-12 w-12 rounded-full mb-2 flex items-center justify-center bg-gradient-to-r from-indigo-100 to-purple-100 peer-data-[state=checked]:from-indigo-500 peer-data-[state=checked]:to-purple-500">
                      <HeartIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <span className="font-medium text-indigo-800">Long-term Relationship</span>
                  </Label>
                </div>

                <div className="relative">
                  <RadioGroupItem value="casual" id="casual" className="sr-only peer" />
                  <Label
                    htmlFor="casual"
                    className="flex flex-col items-center p-4 rounded-lg border-2 border-indigo-200 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50 hover:bg-indigo-50/50 transition-all duration-200 cursor-pointer"
                  >
                    <div className="h-12 w-12 rounded-full mb-2 flex items-center justify-center bg-gradient-to-r from-indigo-100 to-purple-100 peer-data-[state=checked]:from-indigo-500 peer-data-[state=checked]:to-purple-500">
                      <svg
                        className="h-6 w-6 text-indigo-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
                    <span className="font-medium text-indigo-800">Casual Dating</span>
                  </Label>
                </div>

                <div className="relative">
                  <RadioGroupItem value="friendship" id="friendship" className="sr-only peer" />
                  <Label
                    htmlFor="friendship"
                    className="flex flex-col items-center p-4 rounded-lg border-2 border-indigo-200 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50 hover:bg-indigo-50/50 transition-all duration-200 cursor-pointer"
                  >
                    <div className="h-12 w-12 rounded-full mb-2 flex items-center justify-center bg-gradient-to-r from-indigo-100 to-purple-100 peer-data-[state=checked]:from-indigo-500 peer-data-[state=checked]:to-purple-500">
                      <svg
                        className="h-6 w-6 text-indigo-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span className="font-medium text-indigo-800">Friendship</span>
                  </Label>
                </div>

                <div className="relative">
                  <RadioGroupItem value="undecided" id="undecided" className="sr-only peer" />
                  <Label
                    htmlFor="undecided"
                    className="flex flex-col items-center p-4 rounded-lg border-2 border-indigo-200 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50 hover:bg-indigo-50/50 transition-all duration-200 cursor-pointer"
                  >
                    <div className="h-12 w-12 rounded-full mb-2 flex items-center justify-center bg-gradient-to-r from-indigo-100 to-purple-100 peer-data-[state=checked]:from-indigo-500 peer-data-[state=checked]:to-purple-500">
                      <svg
                        className="h-6 w-6 text-indigo-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-medium text-indigo-800">Still Figuring It Out</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          onClick={handleContinue}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          disabled={isSaving || isLoadingPreferences}
        >
          {isSaving ? (
            <div className="flex items-center justify-center">
              <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
              <span>Saving to Verida...</span>
            </div>
          ) : (
            "Continue to NFT Minting"
          )}
        </Button>
      </CardFooter>
    </>
  )
}

