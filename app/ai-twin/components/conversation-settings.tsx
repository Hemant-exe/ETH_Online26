"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MessageCircle, AlertTriangle, Save, Info } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock data - would be fetched from your API
const initialSettings = {
  suggestionMode: true,
  autoReply: false,
  tone: "friendly", // friendly, humorous, formal, playful
}

export default function ConversationSettings() {
  const [settings, setSettings] = useState(initialSettings)
  const [isSaving, setIsSaving] = useState(false)

  const handleToggleChange = (name: string) => {
    setSettings({
      ...settings,
      [name]: !settings[name as keyof typeof settings],
    })
  }

  const handleToneChange = (value: string) => {
    setSettings({
      ...settings,
      tone: value,
    })
  }

  const handleSave = () => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Conversation Settings Saved",
        description: "Your AI twin will now use these settings when assisting with conversations.",
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
      <div className="absolute -bottom-12 -left-12 w-24 h-24 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 opacity-30"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-xl">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Chat & Conversation Settings</h3>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-pink-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-pink-700">
                Your AI can help break the ice or even converse on your behalf if you choose auto-reply. Note that
                enabling auto-reply means the AI will use your personal data to craft responses.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between space-y-0">
              <div>
                <Label className="text-slate-700 font-medium">Suggestion Mode</Label>
                <p className="text-sm text-slate-500">AI proposes conversation starters or responses</p>
              </div>
              <Switch checked={settings.suggestionMode} onCheckedChange={() => handleToggleChange("suggestionMode")} />
            </div>

            <div className="flex items-center justify-between space-y-0">
              <div>
                <Label className="text-slate-700 font-medium flex items-center gap-2">
                  Auto-Reply
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertTriangle className="h-4 w-4 text-amber-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white border border-amber-100 text-slate-700 max-w-xs p-3 rounded-xl">
                        <p>
                          Enabling this allows the AI to respond on your behalf. You are responsible for messages sent
                          by your AI.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <p className="text-sm text-slate-500">AI can respond on your behalf</p>
              </div>
              <Switch checked={settings.autoReply} onCheckedChange={() => handleToggleChange("autoReply")} />
            </div>

            {settings.autoReply && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">
                    You are responsible for messages sent on your behalf. Always review your chat history to ensure it
                    reflects what you want.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-slate-700 font-medium">Conversation Tone & Style</Label>

            <RadioGroup value={settings.tone} onValueChange={handleToneChange} className="grid grid-cols-2 gap-4">
              {[
                { value: "friendly", label: "Friendly" },
                { value: "humorous", label: "Humorous" },
                { value: "formal", label: "Formal" },
                { value: "playful", label: "Playful" },
              ].map((option) => (
                <div key={option.value} className="relative">
                  <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                  <Label
                    htmlFor={option.value}
                    className="flex p-4 bg-white/80 border border-pink-100 rounded-xl cursor-pointer hover:bg-pink-50 peer-data-[state=checked]:border-pink-500 peer-data-[state=checked]:bg-pink-50"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full py-6"
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Conversation Settings"}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

