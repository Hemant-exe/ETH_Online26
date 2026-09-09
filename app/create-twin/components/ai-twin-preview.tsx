"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Brain, Bot, User, Database, Sparkles, Send } from "lucide-react"
import { generateAiTwinResponse } from "../../lib/prompts/ai-twin-service"
import { toast } from "@/components/ui/use-toast"
import { HeartLoader } from "@/components/ui/heart-loader"

interface AiTwinPreviewProps {
  formData: any
}

export default function AiTwinPreview({ formData }: AiTwinPreviewProps) {
  const [previewMessage, setPreviewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<{ content: string; isAi: boolean }[]>([])
  const [userInput, setUserInput] = useState("")
  const [veridaStatus, setVeridaStatus] = useState<'loading' | 'loaded' | 'none'>('none')
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const initialLoadRef = useRef(false)
  const lastNameRef = useRef<string | null>(null)
  const nameTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Check for Verida data
  useEffect(() => {
    if (formData.name && formData.favouriteType) {
      setVeridaStatus('loaded');
    }
  }, [formData]);

  // Generate static preview message when name changes, with debouncing
  useEffect(() => {
    // Only proceed if we have a name
    if (!formData.name) {
      return;
    }
    
    // Clear any existing timeout
    if (nameTimeoutRef.current) {
      clearTimeout(nameTimeoutRef.current);
    }
    
    // Set a new timeout with 10-15 second delay
    const delayTime = Math.floor(Math.random() * 5000); // 10-15 seconds
    
    // Create a new timeout
    nameTimeoutRef.current = setTimeout(() => {
      // If this is the same name as before, don't regenerate
      if (formData.name === lastNameRef.current) {
        return;
      }
      
      // Update the last name ref
      lastNameRef.current = formData.name;
      
      // Clear existing messages
      setMessages([]);
      
      // Add a user greeting message
      setMessages([{ content: "Hi there! Tell me about yourself.", isAi: false }]);
      
      // Show typing indicator
      setIsTyping(true);
      
      // Generate a static preview message based on form data after a delay
      setTimeout(() => {
        setIsTyping(false);
        
        const staticResponse = `Hi! I'm ${formData.name}${formData.age ? `, ${formData.age}` : ""}${formData.location ? ` from ${formData.location}` : ""}. ${formData.bio || "Nice to meet you!"} ${formData.occupation ? `I work as a ${formData.occupation}.` : ""}`;
        
        setPreviewMessage(staticResponse);
        setMessages(prev => [...prev, { content: staticResponse, isAi: true }]);
      }, 1500);
    }, delayTime);
    
    // Cleanup function to clear the timeout if the component unmounts
    return () => {
      if (nameTimeoutRef.current) {
        clearTimeout(nameTimeoutRef.current);
      }
    };
  }, [formData.name]);

  // Simulate typing with LLM-generated response - only used for chat messages, not form changes
  const simulateTypingWithLLM = async (userMessage: string) => {
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Generate response using LLM service
      const response = await generateAiTwinResponse(formData, userMessage);
      
      // Hide typing indicator and show message
      setIsTyping(false);
      setPreviewMessage(response);
      
      // Add to message history
      setMessages((prev) => [...prev, { content: response, isAi: true }]);
    } catch (error) {
      console.error('Error generating LLM response:', error);
      
      // Hide typing indicator
      setIsTyping(false);
      
      // Add fallback response
      const fallbackResponse = "I'm sorry, I couldn't connect to my brain right now. Let's try again later.";
      setPreviewMessage(fallbackResponse);
      setMessages((prev) => [...prev, { content: fallbackResponse, isAi: true }]);
      
      // Show error toast
      toast({
        title: "Connection Error",
        description: "Could not connect to the AI service. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Handle user input submission
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim()) return;
    
    // Add user message to chat
    const userMessage = userInput.trim();
    setMessages(prev => [...prev, { content: userMessage, isAi: false }]);
    setUserInput('');
    
    // Generate AI response using LLM - only make API call when user explicitly sends a message
    setTimeout(() => {
      simulateTypingWithLLM(userMessage);
    }, 500);
  };

  return (
    <div className="backdrop-blur-xl bg-white/60 rounded-[2rem] border border-pink-200 p-6 shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-xl">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">AI Twin Preview</h2>
        </div>
        
        {/* Add Verida Badge if data exists */}
        {veridaStatus === 'loaded' && (
          <Badge 
            variant="outline" 
            className="bg-green-50 text-green-700 border-green-200 px-3 py-1 flex items-center gap-1"
          >
            <Database className="h-3 w-3 mr-1" />
            Verida Data Loaded
          </Badge>
        )}
        
        {/* Add Record Status Badge */}
        {/* {formData._id && (
          <Badge 
            variant="outline" 
            className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 flex items-center gap-1 ml-2"
          >
            <Database className="h-3 w-3 mr-1" />
            Existing Record
          </Badge>
        )} */}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-14 w-14 border-2 border-white">
          <AvatarImage 
            src={formData.photo || `/ai-twin-avatar-${formData.gender || 'neutral'}.png`} 
            alt={formData.name || "AI Twin"} 
          />
          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-400 text-white">
            {formData.name ? formData.name.substring(0, 2).toUpperCase() : "AI"}
          </AvatarFallback>
        </Avatar>

        <div>
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            {formData.name || "Your AI Twin"}
            <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200 text-xs">
              AI Twin
            </Badge>
          </h3>
          <p className="text-sm text-slate-600 line-clamp-1">
            {formData.bio
              ? `${formData.bio.substring(0, 50)}${formData.bio.length > 50 ? "..." : ""}`
              : "Your digital representative"}
          </p>
        </div>
      </div>

      {/* Chat container with fixed height and scrolling */}
      <div
        className="flex-1 bg-white/80 rounded-xl border border-pink-100 p-4 mb-4 flex flex-col overflow-hidden"
        style={{ minHeight: "350px", maxHeight: "350px" }}
      >
        <div 
          className="overflow-y-auto flex-1 space-y-4 pr-1"
          style={{ 
            scrollBehavior: "smooth",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(236, 72, 153, 0.3) transparent",
            msOverflowStyle: "none"
          }}
          ref={chatContainerRef}
        >
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${!msg.isAi ? "justify-end" : ""}`}>
              {msg.isAi && (
                <Avatar className="h-8 w-8 border-2 border-white flex-shrink-0">
                  <AvatarImage 
                    src={formData.photo || `/ai-twin-avatar-${formData.gender || 'neutral'}.png`}
                    alt={formData.name || "AI Twin"}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-400 text-white text-xs">
                    {formData.name ? formData.name.substring(0, 2).toUpperCase() : "AI"}
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`px-4 py-2 max-w-[80%] shadow-sm ${
                  !msg.isAi
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl rounded-br-none"
                    : "bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl rounded-bl-none"
                }`}
              >
                {msg.isAi && (
                  <div className="flex items-center gap-1 mb-1">
                    <Bot className="h-3 w-3 text-pink-200" />
                    <span className="text-xs text-pink-200">AI Twin</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>

              {!msg.isAi && (
                <Avatar className="h-8 w-8 border-2 border-white flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-400 text-white text-xs">
                    YOU
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-end gap-2">
              <Avatar className="h-8 w-8 border-2 border-white flex-shrink-0">
                <AvatarImage 
                  src={formData.photo || `/ai-twin-avatar-${formData.gender || 'neutral'}.png`}
                  alt={formData.name || "AI Twin"}
                />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-400 text-white text-xs">
                  {formData.name ? formData.name.substring(0, 2).toUpperCase() : "AI"}
                </AvatarFallback>
              </Avatar>
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl rounded-bl-none px-4 py-2 max-w-[80%] shadow-sm">
                <div className="flex items-center gap-1 mb-1">
                  <Bot className="h-3 w-3 text-pink-200" />
                  <span className="text-xs text-pink-200">AI Twin</span>
                </div>
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div
                    className="h-2 w-2 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                  <div
                    className="h-2 w-2 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: "600ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
        
      {/* Chat input section */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 mt-auto">
        <Input
          placeholder="Type a message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="flex-1 bg-white border-pink-100 focus:border-pink-300"
          disabled={!formData.name || isTyping}
        />
        <Button 
          type="submit" 
          disabled={!formData.name || !userInput.trim() || isTyping}
          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}

