"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { LockIcon, EyeIcon, ShieldIcon } from "lucide-react"

export default function SecurityControls() {
  const [visibilitySettings, setVisibilitySettings] = useState({
    showAge: true,
    showLocation: false,
    showInterests: true,
    showPhotos: true,
  })

  const [encryptionSettings, setEncryptionSettings] = useState({
    encryptMessages: true,
    encryptPhotos: true,
    allowAiAccess: true,
  })

  const toggleSetting = (category: string, setting: string) => {
    if (category === "visibility") {
      setVisibilitySettings((prev) => ({
        ...prev,
        [setting]: !prev[setting as keyof typeof prev],
      }))
    } else if (category === "encryption") {
      setEncryptionSettings((prev) => ({
        ...prev,
        [setting]: !prev[setting as keyof typeof prev],
      }))
    }
  }

  return (
    <div className="backdrop-blur-sm bg-white/80 rounded-2xl border border-indigo-100 p-6 shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <LockIcon className="h-6 w-6 text-indigo-600" />
        <h2 className="text-xl font-semibold text-slate-800">Control Your Data & Privacy</h2>
      </div>

      <p className="text-slate-600 mb-6">Manage who can see your information and how it's protected</p>

      <div className="space-y-8">
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-medium flex items-center gap-2 text-slate-700">
            <EyeIcon className="h-5 w-5 text-indigo-600" />
            Visibility Settings
          </h3>
          <p className="text-sm text-slate-600">Control which parts of your profile are visible to other users.</p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-slate-700">Show Age</Label>
                  <p className="text-xs text-slate-500">Display your age on your public profile</p>
                </div>
                <Switch
                  checked={visibilitySettings.showAge}
                  onCheckedChange={() => toggleSetting("visibility", "showAge")}
                />
              </div>
            </div>

            <div className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-slate-700">Show Location</Label>
                  <p className="text-xs text-slate-500">Display your location on your public profile</p>
                </div>
                <Switch
                  checked={visibilitySettings.showLocation}
                  onCheckedChange={() => toggleSetting("visibility", "showLocation")}
                />
              </div>
            </div>

            <div className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-slate-700">Show Interests</Label>
                  <p className="text-xs text-slate-500">Display your interests on your public profile</p>
                </div>
                <Switch
                  checked={visibilitySettings.showInterests}
                  onCheckedChange={() => toggleSetting("visibility", "showInterests")}
                />
              </div>
            </div>

            <div className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-slate-700">Show Photos</Label>
                  <p className="text-xs text-slate-500">Make your photos visible to other users</p>
                </div>
                <Switch
                  checked={visibilitySettings.showPhotos}
                  onCheckedChange={() => toggleSetting("visibility", "showPhotos")}
                />
              </div>
            </div>
          </div>
        </motion.div>

        <Separator className="bg-indigo-100" />

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-medium flex items-center gap-2 text-slate-700">
            <ShieldIcon className="h-5 w-5 text-indigo-600" />
            Encryption & Data Protection
          </h3>
          <p className="text-sm text-slate-600">Control how your data is encrypted and accessed.</p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-slate-700">Encrypt Messages</Label>
                  <p className="text-xs text-slate-500">End-to-end encrypt all your conversations</p>
                </div>
                <Switch
                  checked={encryptionSettings.encryptMessages}
                  onCheckedChange={() => toggleSetting("encryption", "encryptMessages")}
                />
              </div>
            </div>

            <div className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-slate-700">Encrypt Photos</Label>
                  <p className="text-xs text-slate-500">Store your photos with additional encryption</p>
                </div>
                <Switch
                  checked={encryptionSettings.encryptPhotos}
                  onCheckedChange={() => toggleSetting("encryption", "encryptPhotos")}
                />
              </div>
            </div>

            <div className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 p-4 md:col-span-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-slate-700">AI Data Access</Label>
                  <p className="text-xs text-slate-500">Allow AI to analyze your data for better matches</p>
                </div>
                <Switch
                  checked={encryptionSettings.allowAiAccess}
                  onCheckedChange={() => toggleSetting("encryption", "allowAiAccess")}
                />
              </div>
            </div>
          </div>
        </motion.div>

        <Button className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white">
          Save Privacy Settings
        </Button>
      </div>
    </div>
  )
}

