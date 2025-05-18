"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ProfileSnapshot from "./profile-snapshot"
import NftDetails from "./nft-details"
import DidSettings from "./did-settings"
import OffChainData from "./off-chain-data"
import SecurityControls from "./security-controls"
import ActivityLog from "./activity-log"
import ProfileDeactivation from "./profile-deactivation"
import {
  LockIcon,
  ShieldIcon,
  HistoryIcon,
  UserIcon,
  KeyIcon,
  ImageIcon,
  AlertTriangleIcon,
  Hexagon,
} from "lucide-react"
import { useVeridaClient, useProfileRestService } from "@/app/lib/clientside-verida"

export default function ProfileOverview() {
  const [activeTab, setActiveTab] = useState("overview")
  const [mounted, setMounted] = useState(false)
  const [userData, setUserData] = useState({
    did: "",
    name: "",
    hasNFT: false
  })
  const [dataLoaded, setDataLoaded] = useState(false)
  
  // Get Verida client and profile service
  const { client, isLoading: clientLoading, getDidId } = useVeridaClient()
  const { service: profileRestService, isLoading: serviceLoading } = useProfileRestService()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load user data from Verida
  useEffect(() => {
    const loadUserData = async () => {
      // Skip if already loaded or dependencies are still loading
      if (dataLoaded || clientLoading || serviceLoading || !profileRestService || !mounted) {
        return
      }
      
      try {
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
            console.log("Loaded profile data for overview:", profile)
            
            if (profile) {
              setUserData({
                did,
                name: profile.displayName || "User",
                hasNFT: !!localStorage.getItem("nftData")
              })
            }
          } catch (error) {
            console.error("Error loading profile:", error)
            // Use default data if profile loading fails
            setUserData({
              did,
              name: "User",
              hasNFT: !!localStorage.getItem("nftData")
            })
          }
        }
        
        // Mark as loaded to prevent further calls
        setDataLoaded(true)
      } catch (error) {
        console.error("Error in loadUserData:", error)
      }
    }
    
    loadUserData()
  }, [client, clientLoading, serviceLoading, profileRestService, getDidId, mounted, dataLoaded])

  const tabs = [
    { id: "overview", label: "Overview", icon: UserIcon },
    { id: "nft", label: "NFT Details", icon: KeyIcon },
    { id: "did", label: "DID", icon: ShieldIcon },
    { id: "offchain", label: "Off-Chain", icon: ImageIcon },
    { id: "security", label: "Privacy", icon: LockIcon },
    { id: "activity", label: "Activity", icon: HistoryIcon },
    { id: "deactivate", label: "Deactivate", icon: AlertTriangleIcon },
  ]

  if (!mounted) return null

  return (
    <div className="space-y-8">
      <div className="relative backdrop-blur-sm bg-white/80 p-6 rounded-2xl border border-indigo-100 shadow-xl">
        <div className="absolute -top-3 -left-3">
          <Hexagon className="h-10 w-10 text-indigo-500 fill-indigo-100" />
        </div>
        <h2 className="text-xl font-semibold mb-2 text-indigo-800 ml-8">
          {userData.name ? `${userData.name}'s Profile` : 'Your Profile at a Glance'}
        </h2>
        <p className="text-sm text-slate-600">
          Any on-chain updates may involve blockchain transactions. Sensitive details are stored off-chain for privacy.
        </p>
      </div>

      <div className="flex overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative group flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-pink-500/90 to-rose-500/90 text-white"
                  : "bg-white/80 hover:bg-white/90 text-slate-700"
              }`}
            >
              <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? "text-white" : "text-pink-500"}`} />
              <span className="font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-pink-500/90 to-rose-500/90 rounded-xl -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
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
          {activeTab === "overview" && <ProfileSnapshot />}
          {activeTab === "nft" && <NftDetails />}
          {activeTab === "did" && <DidSettings />}
          {activeTab === "offchain" && <OffChainData />}
          {activeTab === "security" && <SecurityControls />}
          {activeTab === "activity" && <ActivityLog />}
          {activeTab === "deactivate" && <ProfileDeactivation />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

