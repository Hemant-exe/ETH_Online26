"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Database, Save, Info, User, MessageCircle, Heart, Globe } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock data - would be fetched from your API
const initialPermissions = {
  profileData: true,
  chatHistories: true,
  likedProfiles: true,
  externalData: false,
}

// Mock usage data
const usageData = {
  profileData: "high",
  chatHistories: "medium",
  likedProfiles: "high",
  externalData: "low",
}

export default function DataPermissions() {
  const [permissions, setPermissions] = useState(initialPermissions)
  const [isSaving, setIsSaving] = useState(false)

  const handleToggleChange = (name: string) => {
    setPermissions({
      ...permissions,
      [name]: !permissions[name as keyof typeof permissions],
    })
  }

  const getUsageBadge = (usage: string) => {
    switch (usage) {
      case "high":
        return <span className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded-full">High usage</span>
      case "medium":
        return <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Medium usage</span>
      case "low":
        return <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-full">Low usage</span>
      default:
        return null
    }
  }

  const handleSave = () => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Data Permissions Updated",
        description: "Your AI twin's data access has been updated according to your preferences.",
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
      <div className="absolute -bottom-12 -left-12 w-24 h-24 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 opacity-30"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-xl">
            <Database className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Data Access & Permissions</h3>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-pink-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-pink-700">
                Turning off certain data sources may reduce the AI's accuracy in finding or recommending matches. Your
                AI needs access to your preferences to provide personalized recommendations.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="backdrop-blur-sm bg-white/80 rounded-xl border border-pink-100 p-4">
              <div className="flex items-center justify-between space-y-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-pink-500" />
                    <Label className="text-slate-700 font-medium">Profile Data</Label>
                    <div className="ml-2">{getUsageBadge(usageData.profileData)}</div>
                  </div>
                  <p className="text-sm text-slate-500">Your basic profile information, interests, and preferences</p>
                </div>
                <Switch checked={permissions.profileData} onCheckedChange={() => handleToggleChange("profileData")} />
              </div>

              {permissions.profileData && (
                <div className="mt-3 text-xs text-pink-600 bg-pink-50 p-2 rounded-lg">
                  Permission updated. Your AI will use your profile data to find better matches.
                </div>
              )}
            </div>

            <div className="backdrop-blur-sm bg-white/80 rounded-xl border border-pink-100 p-4">
              <div className="flex items-center justify-between space-y-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-pink-500" />
                    <Label className="text-slate-700 font-medium">Chat Histories</Label>
                    <div className="ml-2">{getUsageBadge(usageData.chatHistories)}</div>
                  </div>
                  <p className="text-sm text-slate-500">Your conversations with other users</p>
                </div>
                <Switch
                  checked={permissions.chatHistories}
                  onCheckedChange={() => handleToggleChange("chatHistories")}
                />
              </div>

              {permissions.chatHistories && (
                <div className="mt-3 text-xs text-pink-600 bg-pink-50 p-2 rounded-lg">
                  Permission updated. Your AI will analyze your conversation style to provide better assistance.
                </div>
              )}
            </div>

            <div className="backdrop-blur-sm bg-white/80 rounded-xl border border-pink-100 p-4">
              <div className="flex items-center justify-between space-y-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    <Label className="text-slate-700 font-medium">Liked/Passed Profiles</Label>
                    <div className="ml-2">{getUsageBadge(usageData.likedProfiles)}</div>
                  </div>
                  <p className="text-sm text-slate-500">Your swiping history and match preferences</p>
                </div>
                <Switch
                  checked={permissions.likedProfiles}
                  onCheckedChange={() => handleToggleChange("likedProfiles")}
                />
              </div>

              {permissions.likedProfiles && (
                <div className="mt-3 text-xs text-pink-600 bg-pink-50 p-2 rounded-lg">
                  Permission updated. Your AI will learn from your likes and passes to improve recommendations.
                </div>
              )}
            </div>

            <div className="backdrop-blur-sm bg-white/80 rounded-xl border border-pink-100 p-4">
              <div className="flex items-center justify-between space-y-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-pink-500" />
                    <Label className="text-slate-700 font-medium">External Data</Label>
                    <div className="ml-2">{getUsageBadge(usageData.externalData)}</div>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white border border-pink-100 text-slate-700 max-w-xs p-3 rounded-xl">
                          <p>
                            This allows your AI to access external data sources like social media (if you've connected
                            them) to better understand your preferences.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-slate-500">Connected social media or other external sources</p>
                </div>
                <Switch checked={permissions.externalData} onCheckedChange={() => handleToggleChange("externalData")} />
              </div>

              {permissions.externalData && (
                <div className="mt-3 text-xs text-pink-600 bg-pink-50 p-2 rounded-lg">
                  Permission updated. Your AI will use connected external data to enhance recommendations.
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full py-6"
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Data Permissions"}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

