"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Wrench, Save, ThumbsDown, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Mock data for feedback history
const feedbackHistory = [
  {
    id: 1,
    date: "2023-10-12T09:30:00Z",
    type: "Match Recommendation",
    feedback: "Too focused on location, ignoring shared interests",
  },
  {
    id: 2,
    date: "2023-10-08T14:15:00Z",
    type: "Conversation Suggestion",
    feedback: "Too formal for my style",
  },
]

export default function ManualOverride() {
  const [feedbackType, setFeedbackType] = useState("")
  const [feedbackText, setFeedbackText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRetraining, setIsRetraining] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!feedbackType || !feedbackText.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a feedback type and provide details.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setFeedbackType("")
      setFeedbackText("")

      toast({
        title: "Feedback Submitted",
        description: "Your AI twin will learn from your feedback.",
        variant: "default",
      })
    }, 1500)
  }

  const handleRetrain = () => {
    setIsRetraining(true)

    // Simulate API call
    setTimeout(() => {
      setIsRetraining(false)

      toast({
        title: "AI Twin Retrained",
        description: "Your AI twin has been retrained with your feedback.",
        variant: "default",
      })
    }, 3000)
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
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Help Improve Your AI</h3>
        </div>

        <div className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="feedback-type" className="text-slate-700">
                Which recommendation or suggestion was off?
              </Label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger id="feedback-type" className="bg-white/80 border-pink-200 rounded-xl">
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent className="bg-white border-pink-100 rounded-xl">
                  <SelectItem value="match">Match Recommendation</SelectItem>
                  <SelectItem value="conversation">Conversation Suggestion</SelectItem>
                  <SelectItem value="profile">Profile Analysis</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-details" className="text-slate-700">
                Tell us what was wrong and how to improve
              </Label>
              <Textarea
                id="feedback-details"
                placeholder="Provide details about what was incorrect or how the AI could better match your preferences..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="bg-white/80 border-pink-200 rounded-xl min-h-[120px]"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full py-6"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-800">Feedback History</h4>
              <Button
                variant="outline"
                size="sm"
                className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700 rounded-full"
                onClick={handleRetrain}
                disabled={isRetraining}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRetraining ? "animate-spin" : ""}`} />
                {isRetraining ? "Retraining..." : "Retrain Now"}
              </Button>
            </div>

            {feedbackHistory.length > 0 ? (
              <div className="space-y-4">
                {feedbackHistory.map((item) => (
                  <div key={item.id} className="backdrop-blur-sm bg-white/80 rounded-xl border border-pink-100 p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-pink-100 mt-1">
                        <ThumbsDown className="h-4 w-4 text-pink-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-800">{item.type}</span>
                          <span className="text-xs text-slate-500">{formatDate(item.date)}</span>
                        </div>
                        <p className="text-sm text-slate-700">{item.feedback}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <p className="text-sm text-pink-600">
                  You've provided {feedbackHistory.length} pieces of feedback — AI adapted on Oct 15, 2023
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>No feedback history yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

