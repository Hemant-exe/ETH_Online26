"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useVeridaClient } from "../../lib/clientside-verida"
import { formatAiTwinData, saveAiTwin } from "../../lib/verida-ai-twin-service"
import { HeartLoader } from "@/components/ui/heart-loader"
import {
  User,
  Brain,
  Heart,
  Sparkles,
  MessageCircle,
  Star,
  Compass,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Info,
  BookOpen,
  Shield,
  Lock,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AiTwinCreationFormProps {
  currentStep: number
  formData: any
  updateFormData: (data: any) => void
  nextStep: () => void
  prevStep: () => void
  onSaveSuccess?: () => void
}

export default function AiTwinCreationForm({
  currentStep,
  formData,
  updateFormData,
  nextStep,
  prevStep,
  onSaveSuccess,
}: AiTwinCreationFormProps) {
  const [tagInputs, setTagInputs] = useState({
    significantEvents: "",
    achievements: "",
    challenges: "",
    personalityTraits: "",
    interests: "",
    hobbies: "",
    expertise: "",
    specificLikes: "",
    specificDislikes: "",
    dealBreakers: "",
    lookingFor: "",
    coreValues: "",
    beliefs: "",
    conversationTopics: "",
    avoidTopics: "",
    communicationPatterns: "",
    typicalPhrases: "",
    aiConfidentiality: ""
  })
  const [newSituation, setNewSituation] = useState("")
  const [newResponse, setNewResponse] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { client, getAuthStatus, getDidId } = useVeridaClient()

  const handleAddTag = (field: string, e?: React.FormEvent) => {
    e?.preventDefault()

    if (tagInputs[field as keyof typeof tagInputs].trim()) {
      updateFormData({
        [field]: [...formData[field], tagInputs[field as keyof typeof tagInputs].trim()],
      })
      setTagInputs({
        ...tagInputs,
        [field]: ""
      })
    }
  }

  const handleTagInputChange = (field: string, value: string) => {
    setTagInputs({
      ...tagInputs,
      [field]: value
    })
  }

  const handleRemoveTag = (field: string, index: number) => {
    const newTags = [...formData[field]]
    newTags.splice(index, 1)
    updateFormData({ [field]: newTags })
  }

  const handleAddEmotionalResponse = (e: React.FormEvent) => {
    e.preventDefault()

    if (newSituation.trim() && newResponse.trim()) {
      updateFormData({
        emotionalResponses: [
          ...(formData.emotionalResponses || []),
          { situation: newSituation.trim(), response: newResponse.trim() },
        ],
      })
      setNewSituation("")
      setNewResponse("")
    }
  }

  const handleRemoveEmotionalResponse = (index: number) => {
    const newResponses = [...formData.emotionalResponses]
    newResponses.splice(index, 1)
    updateFormData({ emotionalResponses: newResponses })
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      // Check if we're connected to Verida
      const isAuthenticated = await getAuthStatus()
      if (!isAuthenticated) {
        // Connect if not already connected
        if (client) {
          await client.connect()
        } else {
          throw new Error('Verida client not available')
        }
      }
      
      // Get current DID
      const did = await getDidId()
      
      // Format AI twin data according to Verida favorite schema
      const veridaData = formatAiTwinData(formData)
      
      // Add the DID if available
      if (did) {
        veridaData.did = did
      }
      
      // Check if this is an update of an existing twin (if URI and _id exist)
      const isUpdate = !!(formData.uri && formData._id)
      
      // Log the formatted data for debugging
      console.log(`${isUpdate ? "Updating" : "Creating"} Verida Data:`, veridaData)
      
      // Save the data to Verida
      const savedData = await saveAiTwin(veridaData)
      
      // Display success toast
      toast({
        title: isUpdate ? "AI Twin Updated!" : "AI Twin Created!",
        description: isUpdate 
          ? "Your AI twin has been successfully updated in your Verida wallet." 
          : "Your AI twin has been successfully created and saved to your Verida wallet.",
        variant: "default",
      })
      
      console.log("Saved AI Twin data:", savedData)

      if (onSaveSuccess) {
        onSaveSuccess()
      }
    } catch (error) {
      console.error("Failed to create AI twin:", error)
      // Display error toast
      toast({
        title: "Error Saving AI Twin",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { number: 1, title: "Personal Details", icon: User },
    { number: 2, title: "Life Story", icon: BookOpen },
    { number: 3, title: "Personality", icon: Brain },
    { number: 4, title: "Interests", icon: Star },
    { number: 5, title: "Relationships", icon: Heart },
    { number: 6, title: "Values", icon: Compass },
    { number: 7, title: "Communication", icon: MessageCircle },
    { number: 8, title: "AI Behavior", icon: Sparkles },
  ]

  return (
    <>
      <div className="backdrop-blur-xl bg-white/60 rounded-[2rem] border border-pink-200 p-6 shadow-xl">
        {/* Step Indicator */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex justify-between items-center min-w-[800px]">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                <div
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep === step.number
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                      : currentStep > step.number
                        ? "bg-green-500 text-white"
                        : "bg-white text-slate-400 border border-slate-200"
                  }`}
                >
                  {currentStep > step.number ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}

                  {step.number < steps.length && (
                    <div
                      className={`absolute top-1/2 -right-full w-full h-0.5 ${
                        currentStep > step.number ? "bg-green-500" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`text-xs mt-2 ${
                    currentStep === step.number ? "text-pink-600 font-medium" : "text-slate-500"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content - Add max height with scrolling */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 350px)", minHeight: "400px" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Personal Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-xl">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Tell Us About Yourself</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-700">
                        Your Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter your name"
                        className="bg-white/80 border-pink-100 focus:border-pink-300"
                        value={formData.name}
                        onChange={(e) => updateFormData({ name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-slate-700">
                        Your Age
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Enter your age"
                        className="bg-white/80 border-pink-100 focus:border-pink-300"
                        value={formData.age}
                        onChange={(e) => updateFormData({ age: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-slate-700">
                        Your Location
                      </Label>
                      <Input
                        id="location"
                        placeholder="City, Country"
                        className="bg-white/80 border-pink-100 focus:border-pink-300"
                        value={formData.location}
                        onChange={(e) => updateFormData({ location: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="occupation" className="text-slate-700">
                        Your Occupation
                      </Label>
                      <Input
                        id="occupation"
                        placeholder="What do you do?"
                        className="bg-white/80 border-pink-100 focus:border-pink-300"
                        value={formData.occupation}
                        onChange={(e) => updateFormData({ occupation: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio" className="text-slate-700">
                        Short Bio
                      </Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us a bit about yourself..."
                        className="bg-white/80 border-pink-100 focus:border-pink-300 min-h-[120px]"
                        value={formData.bio}
                        onChange={(e) => updateFormData({ bio: e.target.value })}
                      />
                      <p className="text-xs text-pink-600">
                        This will help your AI twin understand who you are and how to represent you.
                      </p>
                    </div>
                  </div>

                  {/* Verida Schema Required Fields - Hidden from user interface but still maintained in state */}
                  {/* These fields are required for proper storage in Verida but don't need to be shown to users */}
                  <div className="hidden">
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100 mt-6">
                      <div className="flex gap-3 mb-4">
                        <Shield className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <h3 className="font-medium text-indigo-700">Verida Storage Configuration</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="favouriteType" className="text-slate-700">
                            AI Twin Type
                          </Label>
                          <Select
                            value={formData.favouriteType}
                            onValueChange={(value) => updateFormData({ favouriteType: value })}
                          >
                            <SelectTrigger id="favouriteType" className="bg-white/80 border-pink-100">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-pink-100">
                              <SelectItem value="recommendation">Recommendation</SelectItem>
                              <SelectItem value="favourite">Favourite</SelectItem>
                              <SelectItem value="like">Like</SelectItem>
                              <SelectItem value="share">Share</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-slate-500">Required for Verida storage</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contentType" className="text-slate-700">
                            Content Type
                          </Label>
                          <Select
                            value={formData.contentType}
                            onValueChange={(value) => updateFormData({ contentType: value })}
                          >
                            <SelectTrigger id="contentType" className="bg-white/80 border-pink-100">
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-pink-100">
                              <SelectItem value="document">Document</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="audio">Audio</SelectItem>
                              <SelectItem value="webpage">Webpage</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-slate-500">Required for Verida storage</p>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="uri" className="text-slate-700">
                            URI (Optional)
                          </Label>
                          <Input
                            id="uri"
                            placeholder="Custom URI identifier"
                            className="bg-white/80 border-pink-100 focus:border-pink-300"
                            value={formData.uri}
                            onChange={(e) => updateFormData({ uri: e.target.value })}
                          />
                          <p className="text-xs text-slate-500">
                            An optional identifier for this AI twin. Will be auto-generated if left blank.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Life Story */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-xl">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Your Life Story</h2>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100 mb-6">
                    <div className="flex gap-3">
                      <Shield className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-indigo-700">
                        This deeply personal information helps your AI twin understand your background and experiences.
                        All data is securely stored in your Verida wallet and never shared without your consent.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="childhood" className="text-slate-700">
                        Your Childhood & Background
                      </Label>
                      <Textarea
                        id="childhood"
                        placeholder="Share details about your upbringing, family dynamics, and early life experiences..."
                        className="bg-white/80 border-pink-100 focus:border-pink-300 min-h-[120px]"
                        value={formData.childhood}
                        onChange={(e) => updateFormData({ childhood: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700">Significant Life Events</Label>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.significantEvents.map((event: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-pink-50 text-pink-700 border-pink-200 px-3 py-1 rounded-full flex items-center gap-1"
                          >
                            {event}
                            <button
                              onClick={() => handleRemoveTag("significantEvents", index)}
                              className="ml-1 hover:text-rose-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <form onSubmit={(e) => handleAddTag("significantEvents", e)} className="flex gap-2">
                        <Input
                          placeholder="Add a significant life event..."
                          value={tagInputs.significantEvents}
                          onChange={(e) => handleTagInputChange("significantEvents", e.target.value)}
                          className="flex-1 bg-white/80 border-pink-100 focus:border-pink-300"
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </form>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-700">Key Achievements</Label>

                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.achievements.map((item: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-pink-50 text-pink-700 border-pink-200 px-3 py-1 rounded-full flex items-center gap-1"
                            >
                              {item}
                              <button
                                onClick={() => handleRemoveTag("achievements", index)}
                                className="ml-1 hover:text-rose-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>

                        <form onSubmit={(e) => handleAddTag("achievements", e)} className="flex gap-2">
                          <Input
                            placeholder="Add an achievement..."
                            value={tagInputs.achievements}
                            onChange={(e) => handleTagInputChange("achievements", e.target.value)}
                            className="flex-1 bg-white/80 border-pink-100 focus:border-pink-300"
                          />
                          <Button
                            type="submit"
                            variant="outline"
                            className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </form>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700">Challenges Overcome</Label>

                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.challenges.map((item: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-pink-50 text-pink-700 border-pink-200 px-3 py-1 rounded-full flex items-center gap-1"
                            >
                              {item}
                              <button
                                onClick={() => handleRemoveTag("challenges", index)}
                                className="ml-1 hover:text-rose-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>

                        <form onSubmit={(e) => handleAddTag("challenges", e)} className="flex gap-2">
                          <Input
                            placeholder="Add a challenge you've overcome..."
                            value={tagInputs.challenges}
                            onChange={(e) => handleTagInputChange("challenges", e.target.value)}
                            className="flex-1 bg-white/80 border-pink-100 focus:border-pink-300"
                          />
                          <Button
                            type="submit"
                            variant="outline"
                            className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </form>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lifePhilosophy" className="text-slate-700">
                        Your Life Philosophy
                      </Label>
                      <Textarea
                        id="lifePhilosophy"
                        placeholder="Share your approach to life, guiding principles, or personal philosophy..."
                        className="bg-white/80 border-pink-100 focus:border-pink-300 min-h-[100px]"
                        value={formData.lifePhilosophy}
                        onChange={(e) => updateFormData({ lifePhilosophy: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Personality */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-xl">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Your Personality</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700 flex items-center gap-2">
                        Personality Traits
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-slate-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-white border border-pink-100 text-slate-700 max-w-xs p-3 rounded-xl">
                              <p>
                                Add traits that describe your personality (e.g., outgoing, thoughtful, adventurous,
                                analytical, empathetic)
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.personalityTraits.map((trait: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-pink-50 text-pink-700 border-pink-200 px-3 py-1 rounded-full flex items-center gap-1"
                          >
                            {trait}
                            <button
                              onClick={() => handleRemoveTag("personalityTraits", index)}
                              className="ml-1 hover:text-rose-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <form onSubmit={(e) => handleAddTag("personalityTraits", e)} className="flex gap-2">
                        <Input
                          placeholder="Add a personality trait..."
                          value={tagInputs.personalityTraits}
                          onChange={(e) => handleTagInputChange("personalityTraits", e.target.value)}
                          className="flex-1 bg-white/80 border-pink-100 focus:border-pink-300"
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </form>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-slate-700">Communication Style</Label>
                      <RadioGroup
                        value={formData.communicationStyle}
                        onValueChange={(value) => updateFormData({ communicationStyle: value })}
                        className="grid grid-cols-2 gap-4"
                      >
                        {[
                          { value: "direct", label: "Direct & Straightforward" },
                          { value: "thoughtful", label: "Thoughtful & Reflective" },
                          { value: "enthusiastic", label: "Enthusiastic & Expressive" },
                          { value: "diplomatic", label: "Diplomatic & Tactful" },
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

                    <div className="space-y-4">
                      <Label className="text-slate-700">Humor Style</Label>
                      <RadioGroup
                        value={formData.humorStyle}
                        onValueChange={(value) => updateFormData({ humorStyle: value })}
                        className="grid grid-cols-2 gap-4"
                      >
                        {[
                          { value: "witty", label: "Witty & Clever" },
                          { value: "sarcastic", label: "Sarcastic & Dry" },
                          { value: "silly", label: "Silly & Playful" },
                          { value: "minimal", label: "Minimal Humor" },
                        ].map((option) => (
                          <div key={option.value} className="relative">
                            <RadioGroupItem value={option.value} id={`humor-${option.value}`} className="peer sr-only" />
                            <Label
                              htmlFor={`humor-${option.value}`}
                              className="flex p-4 bg-white/80 border border-pink-100 rounded-xl cursor-pointer hover:bg-pink-50 peer-data-[state=checked]:border-pink-500 peer-data-[state=checked]:bg-pink-50"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-slate-700">Decision Making Style</Label>
                      <RadioGroup
                        value={formData.decisionMakingStyle}
                        onValueChange={(value) => updateFormData({ decisionMakingStyle: value })}
                        className="grid grid-cols-2 gap-4"
                      >
                        {[
                          { value: "analytical", label: "Analytical & Logical" },
                          { value: "intuitive", label: "Intuitive & Gut-Feeling" },
                          { value: "cautious", label: "Cautious & Deliberate" },
                          { value: "spontaneous", label: "Spontaneous & Quick" },
                        ].map((option) => (
                          <div key={option.value} className="relative">
                            <RadioGroupItem
                              value={option.value}
                              id={`decision-${option.value}`}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={`decision-${option.value}`}
                              className="flex p-4 bg-white/80 border border-pink-100 rounded-xl cursor-pointer hover:bg-pink-50 peer-data-[state=checked]:border-pink-500 peer-data-[state=checked]:bg-pink-50"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700">Emotional Responses</Label>
                      <p className="text-sm text-slate-600 mb-2">
                        How do you typically respond emotionally to different situations?
                      </p>

                      <div className="space-y-3 mb-4">
                        {formData.emotionalResponses.map(
                          (item: { situation: string; response: string }, index: number) => (
                            <div
                              key={index}
                              className="bg-white/80 rounded-lg border border-pink-100 p-3 flex justify-between items-start"
                            >
                              <div>
                                <p className="font-medium text-slate-700">{item.situation}</p>
                                <p className="text-sm text-slate-600">{item.response}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-400 hover:text-rose-500"
                                onClick={() => handleRemoveEmotionalResponse(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ),
                        )}
                      </div>

                      <form onSubmit={handleAddEmotionalResponse} className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="situation" className="text-slate-700">
                            Situation
                          </Label>
                          <Input
                            id="situation"
                            placeholder="E.g., When I receive criticism..."
                            value={newSituation}
                            onChange={(e) => setNewSituation(e.target.value)}
                            className="bg-white/80 border-pink-100 focus:border-pink-300"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="response" className="text-slate-700">
                            Your Response
                          </Label>
                          <Input
                            id="response"
                            placeholder="E.g., I tend to get defensive at first, then reflect..."
                            value={newResponse}
                            onChange={(e) => setNewResponse(e.target.value)}
                            className="bg-white/80 border-pink-100 focus:border-pink-300"
                          />
                        </div>

                        <Button
                          type="submit"
                          variant="outline"
                          className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Emotional Response
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Interests */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-xl">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Your Interests & Preferences</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700">Interests</Label>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.interests.map((interest: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-pink-50 text-pink-700 border-pink-200 px-3 py-1 rounded-full flex items-center gap-1"
                          >
                            {interest}
                            <button
                              onClick={() => handleRemoveTag("interests", index)}
                              className="ml-1 hover:text-rose-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <form onSubmit={(e) => handleAddTag("interests", e)} className="flex gap-2">
                        <Input
                          placeholder="Add an interest..."
                          value={tagInputs.interests}
                          onChange={(e) => handleTagInputChange("interests", e.target.value)}
                          className="flex-1 bg-white/80 border-pink-100 focus:border-pink-300"
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </form>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700">Hobbies</Label>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.hobbies.map((hobby: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-pink-50 text-pink-700 border-pink-200 px-3 py-1 rounded-full flex items-center gap-1"
                          >
                            {hobby}
                            <button
                              onClick={() => handleRemoveTag("hobbies", index)}
                              className="ml-1 hover:text-rose-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <form onSubmit={(e) => handleAddTag("hobbies", e)} className="flex gap-2">
                        <Input
                          placeholder="Add a hobby..."
                          value={tagInputs.hobbies}
                          onChange={(e) => handleTagInputChange("hobbies", e.target.value)}
                          className="flex-1 bg-white/80 border-pink-100 focus:border-pink-300"
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </form>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700">Areas of Expertise</Label>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.expertise.map((item: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-pink-50 text-pink-700 border-pink-200 px-3 py-1 rounded-full flex items-center gap-1"
                          >
                            {item}
                            <button
                              onClick={() => handleRemoveTag("expertise", index)}
                              className="ml-1 hover:text-rose-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <form onSubmit={(e) => handleAddTag("expertise", e)} className="flex gap-2">
                        <Input
                          placeholder="Add an area of expertise..."
                          value={tagInputs.expertise}
                          onChange={(e) => handleTagInputChange("expertise", e.target.value)}
                          className="flex-1 bg-white/80 border-pink-100 focus:border-pink-300"
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </form>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-700">Specific Things You Like</Label>

                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.specificLikes.map((item: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 px-3 py-1 rounded-full flex items-center gap-1"
                            >
                              {item}
                              <button
                                onClick={() => handleRemoveTag("specificLikes", index)}
                                className="ml-1 hover:text-rose-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>

                        <form onSubmit={(e) => handleAddTag("specificLikes", e)} className="flex gap-2">
                          <Input
                            placeholder="Add something you like..."
                            value={tagInputs.specificLikes}
                            onChange={(e) => handleTagInputChange("specificLikes", e.target.value)}
                            className="flex-1 bg-white/80 border-pink-100 focus:border-pink-300"
                          />
                          <Button
                            type="submit"
                            variant="outline"
                            className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </form>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700">Specific Things You Dislike</Label>

                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.specificDislikes.map((item: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-rose-50 text-rose-700 border-rose-200 px-3 py-1 rounded-full flex items-center gap-1"
                            >
                              {item}
                              <button
                                onClick={() => handleRemoveTag("specificDislikes", index)}
                                className="ml-1 hover:text-rose-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>

                        <form onSubmit={(e) => handleAddTag("specificDislikes", e)} className="flex gap-2">
                          <Input
                            placeholder="Add something you dislike..."
                            value={tagInputs.specificDislikes}
                            onChange={(e) => handleTagInputChange("specificDislikes", e.target.value)}
                            className="flex-1 bg-white/80 border-pink-100 focus:border-pink-300"
                          />
                          <Button
                            type="submit"
                            variant="outline"
                            className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Relationship Preferences */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-xl">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Relationship Preferences</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-slate-700">Relationship Goals</Label>
                      <RadioGroup
                        value={formData.relationshipGoals}
                        onValueChange={(value) => updateFormData({ relationshipGoals: value })}
                        className="grid grid-cols-2 gap-4"
                      >
                        {[
                          { value: "casual", label: "Casual Dating" },
                          { value: "serious", label: "Serious Relationship" },
                          { value: "friendship", label: "Friendship" },
                          { value: "marriage", label: "Marriage" },
                        ].map((option) => (
                          <div key={option.value} className="relative">
                            <RadioGroupItem value={option.value} id={`goal-${option.value}`} className="peer sr-only" />
                            <Label
                              htmlFor={`goal-${option.value}`}
                              className="flex p-4 bg-white/80 border border-pink-100 rounded-xl cursor-pointer hover:bg-pink-50 peer-data-[state=checked]:border-pink-500 peer-data-[state=checked]:bg-pink-50"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700">Deal Breakers</Label>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.dealBreakers.map((item: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-pink-50 text-pink-700 border-pink-200 px-3 py-1 rounded-full flex items-center gap-1"
                          >
                            {item}
                            <button
                              onClick={() => handleRemoveTag("dealBreakers", index)}
                              className="ml-1 hover:text-rose-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <form onSubmit={(e) => handleAddTag("dealBreakers", e)} className="flex gap-2">
                        <Input
                          placeholder="Add a deal breaker..."
                          value={tagInputs.dealBreakers}
                          onChange={(e) => handleTagInputChange("dealBreakers", e.target.value)}
                          className="flex-1 bg-white/80 border-pink-100 focus:border-pink-300"
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </form>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700">Looking For</Label>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.lookingFor.map((item: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-pink-50 text-pink-700 border-pink-200 px-3 py-1 rounded-full flex items-center gap-1"
                          >
                            {item}
                            <button
                              onClick={() => handleRemoveTag("lookingFor", index)}
                              className="ml-1 hover:text-rose-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <form onSubmit={(e) => handleAddTag("lookingFor", e)} className="flex gap-2">
                        <Input
                          placeholder="Add qualities you're looking for..."
                          value={tagInputs.lookingFor}
                          onChange={(e) => handleTagInputChange("lookingFor", e.target.value)}
                          className="flex-1 bg-white/80 border-pink-100 focus:border-pink-300"
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </form>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pastRelationships" className="text-slate-700">
                        Past Relationship Patterns
                      </Label>
                      <Textarea
                        id="pastRelationships"
                        placeholder="Describe patterns in your past relationships, what worked, what didn't..."
                        className="bg-white/80 border-pink-100 focus:border-pink-300 min-h-[100px]"
                        value={formData.pastRelationships}
                        onChange={(e) => updateFormData({ pastRelationships: e.target.value })}
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-slate-700">Attachment Style</Label>
                      <RadioGroup
                        value={formData.attachmentStyle}
                        onValueChange={(value) => updateFormData({ attachmentStyle: value })}
                        className="grid grid-cols-2 gap-4"
                      >
                        {[
                          { value: "secure", label: "Secure" },
                          { value: "anxious", label: "Anxious" },
                          { value: "avoidant", label: "Avoidant" },
                          { value: "fearful", label: "Fearful-Avoidant" },
                        ].map((option) => (
                          <div key={option.value} className="relative">
                            <RadioGroupItem
                              value={option.value}
                              id={`attachment-${option.value}`}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={`attachment-${option.value}`}
                              className="flex p-4 bg-white/80 border border-pink-100 rounded-xl cursor-pointer hover:bg-pink-50 peer-data-[state=checked]:border-pink-500 peer-data-[state=checked]:bg-pink-50"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Values */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-xl">
                      <Compass className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Your Values & Beliefs</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700">Core Values</Label>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.coreValues.map((item: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-pink-50 text-pink-700 border-pink-200 px-3 py-1 rounded-full flex items-center gap-1"
                          >
                            {item}
                            <button
                              onClick={() => handleRemoveTag("coreValues", index)}
                              className="ml-1 hover:text-rose-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <form onSubmit={(e) => handleAddTag("coreValues", e)} className="flex gap-2">
                        <Input
                          placeholder="Add a core value..."
                          value={tagInputs.coreValues}
                          onChange={(e) => handleTagInputChange("coreValues", e.target.value)}
                          className="flex-1 bg-white/80 border-pink-100 focus:border-pink-300"
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </form>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700">Important Beliefs</Label>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.beliefs.map((item: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-pink-50 text-pink-700 border-pink-200 px-3 py-1 rounded-full flex items-center gap-1"
                          >
                            {item}
                            <button
                              onClick={() => handleRemoveTag("beliefs", index)}
                              className="ml-1 hover:text-rose-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <form onSubmit={(e) => handleAddTag("beliefs", e)} className="flex gap-2">
                        <Input
                          placeholder="Add an important belief..."
                          value={tagInputs.beliefs}
                          onChange={(e) => handleTagInputChange("beliefs", e.target.value)}
                          className="flex-1 bg-white/80 border-pink-100 focus:border-pink-300"
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </form>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-700">Political Views</Label>
                        <Select
                          value={formData.politicalViews}
                          onValueChange={(value) => updateFormData({ politicalViews: value })}
                        >
                          <SelectTrigger className="bg-white/80 border-pink-100">
                            <SelectValue placeholder="Select your political views" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-pink-100">
                            <SelectItem value="veryLiberal">Very Liberal</SelectItem>
                            <SelectItem value="liberal">Liberal</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="conservative">Conservative</SelectItem>
                            <SelectItem value="veryConservative">Very Conservative</SelectItem>
                            <SelectItem value="libertarian">Libertarian</SelectItem>
                            <SelectItem value="apolitical">Apolitical</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700">Spirituality</Label>
                        <Select
                          value={formData.spirituality}
                          onValueChange={(value) => updateFormData({ spirituality: value })}
                        >
                          <SelectTrigger className="bg-white/80 border-pink-100">
                            <SelectValue placeholder="Select your spiritual views" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-pink-100">
                            <SelectItem value="religious">Religious</SelectItem>
                            <SelectItem value="spiritual">Spiritual but not Religious</SelectItem>
                            <SelectItem value="agnostic">Agnostic</SelectItem>
                            <SelectItem value="atheist">Atheist</SelectItem>
                            <SelectItem value="questioning">Questioning</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Communication Preferences */}
              {currentStep === 7 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-xl">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Communication Preferences</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700">Favorite Conversation Topics</Label>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.conversationTopics.map((item: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-pink-50 text-pink-700 border-pink-200 px-3 py-1 rounded-full flex items-center gap-1"
                          >
                            {item}
                            <button
                              onClick={() => handleRemoveTag("conversationTopics", index)}
                              className="ml-1 hover:text-rose-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <form onSubmit={(e) => handleAddTag("conversationTopics", e)} className="flex gap-2">
                        <Input
                          placeholder="Add a conversation topic..."
                          value={tagInputs.conversationTopics}
                          onChange={(e) => handleTagInputChange("conversationTopics", e.target.value)}
                          className="flex-1 bg-white/80 border-pink-100 focus:border-pink-300"
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </form>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700">Topics to Avoid</Label>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.avoidTopics.map((item: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-rose-50 text-rose-700 border-rose-200 px-3 py-1 rounded-full flex items-center gap-1"
                          >
                            {item}
                            <button
                              onClick={() => handleRemoveTag("avoidTopics", index)}
                              className="ml-1 hover:text-rose-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <form onSubmit={(e) => handleAddTag("avoidTopics", e)} className="flex gap-2">
                        <Input
                          placeholder="Add a topic to avoid..."
                          value={tagInputs.avoidTopics}
                          onChange={(e) => handleTagInputChange("avoidTopics", e.target.value)}
                          className="flex-1 bg-white/80 border-pink-100 focus:border-pink-300"
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </form>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700">Communication Patterns</Label>
                      <p className="text-sm text-slate-600 mb-2">
                        Add specific communication patterns or habits that are unique to you
                      </p>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.communicationPatterns.map((item: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-pink-50 text-pink-700 border-pink-200 px-3 py-1 rounded-full flex items-center gap-1"
                          >
                            {item}
                            <button
                              onClick={() => handleRemoveTag("communicationPatterns", index)}
                              className="ml-1 hover:text-rose-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <form onSubmit={(e) => handleAddTag("communicationPatterns", e)} className="flex gap-2">
                        <Input
                          placeholder="E.g., I use a lot of emojis, I ask many questions..."
                          value={tagInputs.communicationPatterns}
                          onChange={(e) => handleTagInputChange("communicationPatterns", e.target.value)}
                          className="flex-1 bg-white/80 border-pink-100 focus:border-pink-300"
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </form>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700">Typical Phrases or Expressions</Label>
                      <p className="text-sm text-slate-600 mb-2">
                        Add phrases, expressions, or slang that you commonly use
                      </p>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.typicalPhrases.map((item: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-pink-50 text-pink-700 border-pink-200 px-3 py-1 rounded-full flex items-center gap-1"
                          >
                            {item}
                            <button
                              onClick={() => handleRemoveTag("typicalPhrases", index)}
                              className="ml-1 hover:text-rose-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <form onSubmit={(e) => handleAddTag("typicalPhrases", e)} className="flex gap-2">
                        <Input
                          placeholder="E.g., 'That's awesome!', 'To be honest...'"
                          value={tagInputs.typicalPhrases}
                          onChange={(e) => handleTagInputChange("typicalPhrases", e.target.value)}
                          className="flex-1 bg-white/80 border-pink-100 focus:border-pink-300"
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 8: AI Behavior */}
              {currentStep === 8 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-xl">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">AI Twin Behavior</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-slate-700">AI Response Style</Label>
                      <RadioGroup
                        value={formData.aiResponseStyle}
                        onValueChange={(value) => updateFormData({ aiResponseStyle: value })}
                        className="grid grid-cols-2 gap-4"
                      >
                        {[
                          { value: "mirror", label: "Mirror My Style Exactly" },
                          { value: "enhanced", label: "Enhanced Version of Me" },
                          { value: "casual", label: "More Casual Than Me" },
                          { value: "formal", label: "More Formal Than Me" },
                        ].map((option) => (
                          <div key={option.value} className="relative">
                            <RadioGroupItem value={option.value} id={`style-${option.value}`} className="peer sr-only" />
                            <Label
                              htmlFor={`style-${option.value}`}
                              className="flex p-4 bg-white/80 border border-pink-100 rounded-xl cursor-pointer hover:bg-pink-50 peer-data-[state=checked]:border-pink-500 peer-data-[state=checked]:bg-pink-50"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-slate-700 flex items-center gap-2">
                          AI Proactiveness
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-slate-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-white border border-pink-100 text-slate-700 max-w-xs p-3 rounded-xl">
                                <p>
                                  How proactive should your AI twin be in conversations? Higher values mean it will
                                  initiate topics and suggestions more often.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <span className="font-bold text-pink-600">{formData.aiProactiveness}%</span>
                      </div>
                      <Slider
                        defaultValue={[formData.aiProactiveness]}
                        min={0}
                        max={100}
                        step={10}
                        onValueChange={(value) => updateFormData({ aiProactiveness: value[0] })}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Reactive (Responds Only)</span>
                        <span>Balanced</span>
                        <span>Proactive (Initiates)</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-slate-700">AI Personality</Label>
                      <RadioGroup
                        value={formData.aiPersonality}
                        onValueChange={(value) => updateFormData({ aiPersonality: value })}
                        className="grid grid-cols-2 gap-4"
                      >
                        {[
                          { value: "exact", label: "Exactly Like Me" },
                          { value: "confident", label: "More Confident Version" },
                          { value: "flirty", label: "Flirtier Version" },
                          { value: "reserved", label: "More Reserved Version" },
                        ].map((option) => (
                          <div key={option.value} className="relative">
                            <RadioGroupItem
                              value={option.value}
                              id={`personality-${option.value}`}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={`personality-${option.value}`}
                              className="flex p-4 bg-white/80 border border-pink-100 rounded-xl cursor-pointer hover:bg-pink-50 peer-data-[state=checked]:border-pink-500 peer-data-[state=checked]:bg-pink-50"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700">Confidential Information</Label>
                      <p className="text-sm text-slate-600 mb-2">
                        Add topics or information that your AI twin should never share or discuss
                      </p>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.aiConfidentiality.map((item: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-rose-50 text-rose-700 border-rose-200 px-3 py-1 rounded-full flex items-center gap-1"
                          >
                            {item}
                            <button
                              onClick={() => handleRemoveTag("aiConfidentiality", index)}
                              className="ml-1 hover:text-rose-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <form onSubmit={(e) => handleAddTag("aiConfidentiality", e)} className="flex gap-2">
                        <Input
                          placeholder="E.g., financial details, specific family information..."
                          value={tagInputs.aiConfidentiality}
                          onChange={(e) => handleTagInputChange("aiConfidentiality", e.target.value)}
                          className="flex-1 bg-white/80 border-pink-100 focus:border-pink-300"
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < 8 ? (
            <Button
              onClick={nextStep}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <HeartLoader size="sm" showText={true} text="Saving..." className="mr-2" />
                </div>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {formData._id ? "Update AI Twin" : "Create AI Twin"}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Security & Privacy Section as a separate box */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-indigo-50 to-blue-50 rounded-[2rem] border border-indigo-200 p-6 shadow-xl mt-6">
        <div className="flex gap-3">
          <Lock className="h-6 w-6 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-indigo-700 text-lg mb-2">Security & Privacy</h4>
            <p className="text-indigo-600">
              Your AI twin will only access the information you've provided when needed to represent you.
              All data is securely stored in your Verida wallet with end-to-end encryption.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

