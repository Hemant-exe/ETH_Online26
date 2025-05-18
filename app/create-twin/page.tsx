"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import AiTwinCreationForm from "./components/ai-twin-creation-form"
import AiTwinPreview from "./components/ai-twin-preview"
import { Shield, Lock, Sparkles, Database, MessageCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getUserAiTwin } from "../lib/verida-ai-twin-service"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HeartLoader } from "@/components/ui/heart-loader"

export default function CreateAiTwinPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [formData, setFormData] = useState({
    // Personal details
    name: "",
    age: "",
    location: "",
    occupation: "",
    bio: "",

    // Verida favorite schema required fields
    favouriteType: "recommendation",
    contentType: "document",
    uri: "",
    
    // Life story
    childhood: "",
    significantEvents: [] as string[],
    achievements: [] as string[],
    challenges: [] as string[],
    lifePhilosophy: "",

    // Personality
    personalityTraits: [] as string[],
    communicationStyle: "",
    humorStyle: "",
    emotionalResponses: [] as { situation: string; response: string }[],
    decisionMakingStyle: "",

    // Interests
    interests: [] as string[],
    hobbies: [] as string[],
    expertise: [] as string[],
    specificLikes: [] as string[],
    specificDislikes: [] as string[],

    // Relationship preferences
    relationshipGoals: "",
    dealBreakers: [] as string[],
    lookingFor: [] as string[],
    pastRelationships: "",
    attachmentStyle: "",

    // Values
    coreValues: [] as string[],
    beliefs: [] as string[],
    politicalViews: "",
    spirituality: "",

    // Conversation preferences
    conversationTopics: [] as string[],
    avoidTopics: [] as string[],
    communicationPatterns: [] as string[],
    typicalPhrases: [] as string[],

    // AI behavior
    aiResponseStyle: "",
    aiProactiveness: 50,
    aiPersonality: "",
    aiConfidentiality: [] as string[],
  })

  const [binaryElements, setBinaryElements] = useState<Array<{top: string, left: string, fontSize: string, animation: string, delay: string, value: string}>>([])
  
  // Generate floating binary elements on client side only
  useEffect(() => {
    // Generate floating binary elements
    const elements = Array.from({ length: 15 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      fontSize: `${Math.random() * 1 + 0.8}rem`,
      animation: `float ${Math.random() * 10 + 10}s linear infinite`,
      delay: `${Math.random() * 5}s`,
      value: Math.random() > 0.5 ? "1" : "0"
    }));
    
    setBinaryElements(elements);
  }, []);

  // Fetch Twin data when component mounts
  useEffect(() => {
    const fetchTwinData = async () => {
      try {
        setIsLoading(true);
        
        // Get AI twin data using the service function
        const twinData = await getUserAiTwin();
        
        if (twinData) {
          console.log('Successfully loaded AI twin data:', twinData.name);
          setFormData(prevState => ({
            ...prevState,
            ...twinData
          }));
          
          // toast({
          //   title: "Data Loaded",
          //   description: "Your previous AI twin data has been loaded from Verida.",
          // });
        } else {
          console.log("No AI twin data found in Verida");
          // toast({
          //   title: "No Existing Data",
          //   description: "No previous AI twin data found. Starting with a new form.",
          // });
        }
      } catch (error) {
        console.error("Failed to fetch twin data:", error);
        // toast({
        //   title: "Error Loading Data",
        //   description: error instanceof Error ? error.message : "Could not load your existing data from Verida.",
        //   variant: "destructive",
        // });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTwinData();
  }, []);

  const updateFormData = (newData: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...newData }))
  }

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 8))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSaveSuccess = () => {
    setIsSaved(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 text-slate-800 overflow-hidden">
      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl">
            <div className="flex flex-col items-center space-y-4">
              <HeartLoader size="lg" showText={true} text="Loading Your Twin Data" />
              <p className="text-sm text-gray-500">Retrieving your saved data from Verida...</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-gradient-to-r from-pink-300 to-rose-300 blur-3xl animate-pulse"></div>
          <div
            className="absolute top-[40%] right-[10%] w-80 h-80 rounded-full bg-gradient-to-r from-purple-300 to-pink-300 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-[15%] left-[20%] w-72 h-72 rounded-full bg-gradient-to-r from-rose-300 to-red-300 blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Floating binary elements - now client-side only */}
        <div className="absolute top-0 left-0 w-full h-full">
          {binaryElements.map((element, i) => (
            <div
              key={i}
              className="absolute text-pink-500 opacity-10 font-mono"
              style={{
                top: element.top,
                left: element.left,
                fontSize: element.fontSize,
                animation: element.animation,
                animationDelay: element.delay,
              }}
            >
              {element.value}
            </div>
          ))}
        </div>

        {/* Decorative pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LCAxMjgsIDE3MCwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')]" />
      </div>

      <div className="relative container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AiTwinCreationForm
              currentStep={currentStep}
              formData={formData}
              updateFormData={updateFormData}
              nextStep={nextStep}
              prevStep={prevStep}
              onSaveSuccess={handleSaveSuccess}
            />
          </motion.div>

          {/* Preview Section */}
          <motion.div
            className="lg:col-span-1 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex-1 flex flex-col">
              <AiTwinPreview formData={formData} />
            </div>

            {/* Security Information */}
            <div className="mt-6 backdrop-blur-sm bg-white/60 rounded-xl border border-indigo-100 p-4">
            {formData.name && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100"
            >
              <div className="flex items-start gap-2">
                <Database className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-medium text-purple-700 mb-1">Verida Storage</h4>
                  <p className="text-xs text-purple-600">
                    Your AI twin will be stored securely using the Verida Favourite schema with 
                    type: <span className="font-medium">{formData.favouriteType || "recommendation"}</span>,
                    content: <span className="font-medium">{formData.contentType || "document"}</span>
                    {formData.uri && (
                      <>, uri: <span className="font-medium">{formData.uri}</span></>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
            )}
            
            {/* Chat button - shown after saving */}
            {isSaved && formData.name && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-3"
              >
                <Link href="/chat-with-twin">
                  <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat with {formData.name}
                  </Button>
                </Link>
              </motion.div>
            )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-100px) rotate(10deg);
          }
          100% {
            transform: translateY(-200px) rotate(0deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

