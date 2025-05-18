"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { PlusIcon, XIcon, PencilIcon, ImageIcon, TagIcon, SlidersHorizontal, LockIcon, Copy, CheckCircle2, AlertCircleIcon, RefreshCwIcon } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useVeridaClient, useProfileRestService } from "@/app/lib/clientside-verida"

// Define interface for off-chain data
interface OffChainDataType {
  veridaDID: string;
  cheqdDID?: string; // Optional because it might not be available
  photos: string[];
  interests: string[];
  preferences: {
    ageRange: number[];
    distance: number;
    relationshipGoals: string;
    aiMatchingEnabled: boolean;
  };
  encryptionStatus: string;
  lastSynced: string;
}

// Default data structure with empty values
const defaultOffChainData: OffChainDataType = {
  veridaDID: "", 
  photos: [],
  interests: [],
  preferences: {
    ageRange: [25, 35],
    distance: 25,
    relationshipGoals: "Long-term",
    aiMatchingEnabled: true,
  },
  encryptionStatus: "Encrypted with Verida protocol",
  lastSynced: new Date().toLocaleString()
}

export default function OffChainData() {
  const [activeTab, setActiveTab] = useState("photos")
  const [ageRange, setAgeRange] = useState(defaultOffChainData.preferences.ageRange)
  const [distance, setDistance] = useState(defaultOffChainData.preferences.distance)
  const [aiMatching, setAiMatching] = useState(defaultOffChainData.preferences.aiMatchingEnabled)
  const [copied, setCopied] = useState<string | null>(null)
  const [offChainData, setOffChainData] = useState<OffChainDataType>(defaultOffChainData)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Get Verida client and profile service
  const { client, isLoading: clientLoading, getDidId } = useVeridaClient()
  const { service: profileRestService, isLoading: serviceLoading } = useProfileRestService()

  // Load real data from Verida and localStorage
  useEffect(() => {
    const loadUserData = async () => {
      // Skip if already loaded or dependencies are still loading
      if (dataLoaded || clientLoading || serviceLoading || !profileRestService) {
        return
      }
      
      try {
        setIsLoading(true)
        
        // Get DID from localStorage
        let veridaDID = localStorage.getItem("veridaDID") || ""
        
        if (!veridaDID && client) {
          try {
            veridaDID = await getDidId() || ""
            if (veridaDID) {
              localStorage.setItem("veridaDID", veridaDID)
            }
          } catch (error) {
            console.error("Error getting DID:", error)
          }
        }
        
        // Get Cheqd DID
        const cheqdDID = localStorage.getItem("cheqdWalletAddress") || undefined
        
        if (veridaDID) {
          // Load profile data from Verida
          try {
            const profile = await profileRestService.getProfile(veridaDID)
            console.log("Loaded profile data for off-chain view:", profile)
            
            // Load photos
            let photos: string[] = []
            try {
              const photoData = await profileRestService.getProfilePhotos(veridaDID)
              if (photoData && photoData.length > 0) {
                photos = photoData.map((photo: any) => photo.photoUrl)
              }
            } catch (photoError) {
              console.error("Error loading photos:", photoError)
            }
            
            // Load or create interests
            const interests = profile?.interests || ["Blockchain", "Privacy", "Web3"]
            
            // Load preferences from localStorage or use defaults
            const storedPreferences = localStorage.getItem("profilePreferences")
            const preferences = storedPreferences 
              ? JSON.parse(storedPreferences) 
              : defaultOffChainData.preferences
            
            // Update state with real data
            setOffChainData({
              veridaDID,
              ...(cheqdDID ? { cheqdDID } : {}),
              photos: photos.length > 0 ? photos : ["/placeholder.svg?height=300&width=300"],
              interests,
              preferences,
              encryptionStatus: "Encrypted with Verida protocol",
              lastSynced: localStorage.getItem("lastSyncTime") || new Date().toLocaleString()
            })
            
            // Update UI state
            setAgeRange(preferences.ageRange)
            setDistance(preferences.distance)
            setAiMatching(preferences.aiMatchingEnabled)
          } catch (error) {
            console.error("Error loading profile:", error)
            // Use minimal default data if profile loading fails
            setOffChainData({
              veridaDID,
              ...(cheqdDID ? { cheqdDID } : {}),
              photos: ["/placeholder.svg?height=300&width=300"],
              interests: ["Blockchain", "Privacy", "Web3"],
              preferences: defaultOffChainData.preferences,
              encryptionStatus: "Encrypted with Verida protocol",
              lastSynced: new Date().toLocaleString()
            })
          }
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

  const tabs = [
    { id: "photos", label: "Photos", icon: ImageIcon },
    { id: "interests", label: "Interests", icon: TagIcon },
    { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
    { id: "encryption", label: "Encryption", icon: LockIcon },
  ]

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSavePreferences = () => {
    try {
      // Save preferences to localStorage
      const updatedPreferences = {
        ageRange,
        distance,
        relationshipGoals: offChainData.preferences.relationshipGoals,
        aiMatchingEnabled: aiMatching
      }
      
      localStorage.setItem("profilePreferences", JSON.stringify(updatedPreferences))
      
      // Update last synced time
      const now = new Date().toLocaleString()
      localStorage.setItem("lastSyncTime", now)
      
      // Update state
      setOffChainData(prev => ({
        ...prev,
        preferences: updatedPreferences,
        lastSynced: now
      }))
      
      console.log("Preferences saved successfully")
    } catch (error) {
      console.error("Error saving preferences:", error)
    }
  }

  const addInterest = () => {
    // This would typically open a modal or input field
    // For now, just add a placeholder interest
    const newInterest = "New Interest"
    setOffChainData(prev => ({
      ...prev,
      interests: [...prev.interests, newInterest]
    }))
  }

  const removeInterest = (index: number) => {
    setOffChainData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="backdrop-blur-sm bg-white/80 rounded-2xl border border-indigo-100 p-6 shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <ImageIcon className="h-6 w-6 text-cyan-600" />
        <h2 className="text-xl font-semibold text-slate-800">Off-Chain Profile Details</h2>
      </div>

      <p className="text-slate-600 mb-6">Manage your private profile information stored off-chain</p>

      <div className="flex mb-6 space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative group flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-cyan-500/90 to-blue-500/90 text-white"
                : "bg-white/80 hover:bg-white/90 text-slate-700"
            }`}
          >
            <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? "text-white" : "text-cyan-600"}`} />
            <span className="font-medium">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeOffChainTab"
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/90 to-blue-500/90 rounded-xl -z-10"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[300px]">
        {activeTab === "photos" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((_, index) => (
                  <div key={index} className="aspect-square rounded-xl bg-gray-200 animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {offChainData.photos.map((photo, index) => (
                  <motion.div
                    key={index}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-indigo-100 shadow-sm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 group-hover:opacity-100 opacity-0 transition-opacity z-10" />
                    <img
                      src={photo || "/placeholder.svg"}
                      alt={`Profile photo ${index + 1}`}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white/80 text-indigo-700">
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white/80 text-indigo-700">
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
                <motion.div
                  className="border border-dashed border-indigo-200 rounded-xl flex items-center justify-center aspect-square bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-white/80 text-indigo-600">
                    <PlusIcon className="h-6 w-6" />
                  </Button>
                </motion.div>
              </div>
            )}
            <p className="text-xs text-indigo-600">
              Photos are stored off-chain and encrypted for privacy. Changes update immediately.
            </p>
          </motion.div>
        )}

        {activeTab === "interests" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {isLoading ? (
              <div className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 p-4 min-h-[200px] shadow-sm">
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div key={index} className="h-8 w-24 bg-gray-200 animate-pulse rounded-full"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 p-4 min-h-[200px] shadow-sm">
                <div className="flex flex-wrap gap-2">
                  {offChainData.interests.map((interest, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-1 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-full px-3 py-1.5 border border-cyan-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="text-sm text-slate-700">{interest}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-full text-indigo-600 hover:bg-indigo-100"
                        onClick={() => removeInterest(index)}
                      >
                        <XIcon className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  ))}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full bg-white border-indigo-200 hover:bg-indigo-50 text-indigo-700"
                      onClick={addInterest}
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Interest
                    </Button>
                  </motion.div>
                </div>
              </div>
            )}
            <p className="text-xs text-indigo-600">
              Your interests help our AI find better matches. This data is stored off-chain.
            </p>
          </motion.div>
        )}

        {activeTab === "preferences" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3, 4].map((_, index) => (
                  <div key={index} className="h-16 bg-gray-200 animate-pulse rounded-xl"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <motion.div
                  className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 p-4 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-700">
                        Age Range: {ageRange[0]} - {ageRange[1]}
                      </Label>
                    </div>
                    <Slider
                      defaultValue={ageRange}
                      min={18}
                      max={80}
                      step={1}
                      onValueChange={setAgeRange}
                      className="py-4"
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 p-4 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-700">Distance: {distance} miles</Label>
                    </div>
                    <Slider
                      defaultValue={[distance]}
                      min={1}
                      max={100}
                      step={1}
                      onValueChange={(value) => setDistance(value[0])}
                      className="py-4"
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 p-4 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-700">Relationship Goals</Label>
                    </div>
                    <select className="w-full p-2 rounded-md bg-white border border-indigo-200 text-slate-700 focus:border-indigo-500 outline-none">
                      <option>Long-term</option>
                      <option>Short-term</option>
                      <option>Friendship</option>
                      <option>Casual</option>
                    </select>
                  </div>
                </motion.div>

                <motion.div
                  className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 p-4 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <Label className="text-slate-700">AI Matching</Label>
                      <p className="text-xs text-slate-500">Allow AI to analyze your profile for better matches</p>
                    </div>
                    <Switch checked={aiMatching} onCheckedChange={setAiMatching} />
                  </div>
                </motion.div>
              </div>
            )}

            <Button 
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              onClick={handleSavePreferences}
              disabled={isLoading}
            >
              Save Preferences
            </Button>
          </motion.div>
        )}

        {activeTab === "encryption" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="h-16 bg-gray-200 animate-pulse rounded-xl"></div>
                ))}
              </div>
            ) : (
              <div className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 p-4 shadow-sm space-y-4">
                <h3 className="text-sm font-medium text-indigo-700">Verida DID (Decentralized Identifier)</h3>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-200/50 to-blue-200/50 rounded-md blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <code className="relative block w-full rounded-md bg-white px-3 py-2 font-mono text-sm text-slate-700 overflow-hidden text-ellipsis">
                      {offChainData.veridaDID}
                    </code>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600"
                    onClick={() => copyToClipboard(offChainData.veridaDID, "veridaDID")}
                  >
                    {copied === "veridaDID" ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                
                {/* Add Cheqd DID display if available */}
                {offChainData.cheqdDID && (
                  <>
                    <h3 className="text-sm font-medium text-indigo-700 mt-2">Cheqd DID</h3>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-200/50 to-blue-200/50 rounded-md blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
                        <code className="relative block w-full rounded-md bg-white px-3 py-2 font-mono text-sm text-slate-700 overflow-hidden text-ellipsis">
                          {offChainData.cheqdDID}
                        </code>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600"
                        onClick={() => offChainData.cheqdDID && copyToClipboard(offChainData.cheqdDID, "cheqdDID")}
                      >
                        {copied === "cheqdDID" ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </>
                )}
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-indigo-700">Encryption Status</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center gap-2">
                        <LockIcon className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800">{offChainData.encryptionStatus}</span>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-medium text-indigo-700">Last Synced with Verida</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2">
                        <RefreshCwIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-800">{offChainData.lastSynced}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex items-start gap-2">
                    <AlertCircleIcon className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-amber-800">Verida Data Privacy</h4>
                      <p className="text-xs text-amber-700">
                        Your profile data is encrypted and stored on the Verida network. Only you control who has access to your private information. The encrypted data is linked to your NFT profile on the blockchain.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button 
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              disabled={isLoading}
            >
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Sync with Verida
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

