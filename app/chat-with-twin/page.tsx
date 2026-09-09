"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Brain, Bot, User, Database, Sparkles, Send, Loader2, ArrowLeft, X as CloseIcon } from "lucide-react"
import { getUserAiTwin } from "../lib/verida-ai-twin-service"
import { generateAiTwinChatResponse } from "../lib/ai-twin-chat-service"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { HeartLoader } from "@/components/ui/heart-loader"

export default function ChatWithTwinPage() {
  const [twinData, setTwinData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<{ content: string; isAi: boolean; timestamp: string }[]>([])
  const [userInput, setUserInput] = useState("")
  const [aiMode, setAiMode] = useState(false)
  const [currentSuggestion, setCurrentSuggestion] = useState("")
  const [autoSendCountdown, setAutoSendCountdown] = useState(0)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const autoSendTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Auto-send messages when in AI mode and a new suggestion is generated
  useEffect(() => {
    // Clear any existing timeout
    if (autoSendTimeoutRef.current) {
      clearTimeout(autoSendTimeoutRef.current);
      autoSendTimeoutRef.current = null;
    }
    
    // Reset countdown
    setAutoSendCountdown(0);
    
    // If AI mode is enabled and we have a suggestion and we're not already typing
    if (aiMode && currentSuggestion && !isTyping) {
      console.log("Setting up auto-send timer");
      
      // Set the delay (5 seconds)
      const autoSendDelay = 5000;
      const startTime = Date.now();
      
      // Start countdown
      setAutoSendCountdown(5);
      
      // Update countdown every second
      const countdownInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, Math.ceil((autoSendDelay - elapsed) / 1000));
        setAutoSendCountdown(remaining);
        
        if (remaining <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);
      
      // Set timeout to send the message
      autoSendTimeoutRef.current = setTimeout(() => {
        console.log("Auto-sending message:", currentSuggestion);
        setUserInput(currentSuggestion);
        handleSendMessage();
        clearInterval(countdownInterval);
      }, autoSendDelay);
      
      // Clean up on unmount or when dependencies change
      return () => {
        clearTimeout(autoSendTimeoutRef.current as NodeJS.Timeout);
        clearInterval(countdownInterval);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSuggestion, aiMode, isTyping]);

  // Fetch Twin data when component mounts
  useEffect(() => {
    const fetchTwinData = async () => {
      try {
        setIsLoading(true);
        
        // Get AI twin data using the service function
        const data = await getUserAiTwin();
        
        if (data) {
          console.log('Successfully loaded AI twin data:', data.name);
          setTwinData(data);
          
          // Start conversation with welcome message after a delay
          setTimeout(() => {
            const welcomeMessage = { 
              id: `welcome-msg-${Date.now()}`,
              content: `Welcome! I'm ${data.name}'s AI twin. How can I help you today?`, 
              isAi: true,
              timestamp: new Date().toISOString()
            };
            setMessages([welcomeMessage]);
            
            // Generate initial suggestion with a longer delay
            // to prevent API call conflicts
            setTimeout(() => {
              if (!isTyping) {
                generateSuggestion(data, [welcomeMessage]);
              }
            }, 3000);
          }, 1000);
          
          toast({
            title: "Twin Connected",
            description: `${data.name}'s AI twin is ready to chat with you.`,
          });
        } else {
          console.log("No AI twin data found in Verida");
          toast({
            title: "No AI Twin Found",
            description: "You need to create an AI twin first before chatting.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to fetch twin data:", error);
        toast({
          title: "Error Loading Twin",
          description: error instanceof Error ? error.message : "Could not load your AI twin from Verida.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTwinData();
  }, []);

  // Generate a suggestion based on conversation history
  const generateSuggestion = async (profile: any, conversationHistory: any[]) => {
    // Don't generate suggestions if already typing
    if (isTyping) {
      return;
    }
    
    try {
      // Format messages for the API
      const formattedMessages = conversationHistory.map(msg => ({
        id: msg.id || `msg-${msg.isAi ? 'ai' : 'user'}-${msg.timestamp}`,
        content: msg.content,
        sender: msg.isAi ? "ai" : "user",
        senderName: msg.isAi ? (profile?.name || "AI Twin") : "User",
        timestamp: msg.timestamp || new Date().toISOString()
      }));
      
      // Create suggestion prompt with full profile data
      const suggestion = await generateAiTwinChatResponse({
        userMessage: "Suggest a short message I could send to continue the conversation",
        conversationHistory: formattedMessages,
        profileData: profile, // Pass the complete twin data with all profile fields
        temperature: 0.8, // More creative for suggestions
        promptType: 'suggestion'
      });
      
      // Clean up the suggestion
      const cleanSuggestion = suggestion
        .replace(/^["']|["']$/g, '') // Remove quotes
        .replace(/^(I would |You could |Try |Say |Suggestion: )/i, '') // Remove prefixes
        .trim();
      
      setCurrentSuggestion(cleanSuggestion);
    } catch (error) {
      console.error("Error generating suggestion:", error);
      setCurrentSuggestion("How are you feeling today?");
    }
  };

  // Handle user input submission
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // In AI mode, we might be sending an empty message (using suggestion)
    // In manual mode, we need a non-empty message
    if ((!userInput.trim() && !aiMode) || !twinData || isTyping) return;
    
    // Add user message to chat
    const userMessage = userInput.trim() || currentSuggestion;
    const timestamp = new Date().toISOString();
    
    const newMessage = { content: userMessage, isAi: false, timestamp };
    setMessages(prev => [...prev, newMessage]);
    setUserInput('');
    
    // Clear the current suggestion since we're using it
    if (aiMode) {
      setCurrentSuggestion('');
    }
    
    // Generate AI response
    await generateAiResponse(userMessage, [...messages, newMessage]);
  };
  
  // Generate AI response using conversation history
  const generateAiResponse = async (userMessage: string, currentMessages: any[]) => {
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Format messages for the API
      const formattedMessages = currentMessages.map(msg => ({
        id: msg.id || `msg-${msg.isAi ? 'ai' : 'user'}-${msg.timestamp}`,
        content: msg.content,
        sender: msg.isAi ? "ai" : "user",
        senderName: msg.isAi ? (twinData?.name || "AI Twin") : "User",
        timestamp: msg.timestamp || new Date().toISOString()
      }));
      
      // Generate response with conversation history context and full twin profile data
      const response = await generateAiTwinChatResponse({
        userMessage,
        conversationHistory: formattedMessages,
        profileData: twinData, // Pass the complete twin data with all profile fields
        temperature: 0.7,
        maxHistoryMessages: 15 // Keep a good amount of history for context
      });
      
      // Hide typing indicator after a delay for realism
      setTimeout(() => {
        setIsTyping(false);
        
        // Add AI response to chat with timestamp
        const timestamp = new Date().toISOString();
        const aiMessage = { 
          id: `ai-msg-${Date.now()}`,
          content: response, 
          isAi: true, 
          timestamp 
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Generate new suggestion based on updated conversation
        // but with a longer delay to prevent too many API calls
        setTimeout(() => {
          // Only generate a suggestion if not currently typing
          if (!isTyping) {
            generateSuggestion(twinData, [...currentMessages, aiMessage]);
          }
        }, 2000);
      }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds for realism
    } catch (error) {
      console.error('Error generating LLM response:', error);
      
      // Hide typing indicator
      setIsTyping(false);
      
      // Add fallback response
      const fallbackResponse = "I'm sorry, I couldn't process your message right now. Could you try again?";
      setMessages(prev => [...prev, { 
        id: `error-msg-${Date.now()}`,
        content: fallbackResponse, 
        isAi: true, 
        timestamp: new Date().toISOString() 
      }]);
      
      // Show error toast
      toast({
        title: "Connection Error",
        description: "Could not connect to the AI service. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  // Handle using a suggestion
  const useSuggestion = () => {
    if (!currentSuggestion) return;
    
    // Clear any auto-send timeout
    if (autoSendTimeoutRef.current) {
      clearTimeout(autoSendTimeoutRef.current);
      autoSendTimeoutRef.current = null;
    }
    
    setUserInput(currentSuggestion);
    
    // If AI mode is on, automatically send the message
    if (aiMode) {
      setTimeout(() => {
        handleSendMessage();
      }, 100);
    }
  };
  
  // Toggle AI mode
  const toggleAiMode = () => {
    const newMode = !aiMode;
    setAiMode(newMode);
    
    toast({
      title: newMode ? "AI Mode Enabled" : "AI Mode Disabled",
      description: newMode 
        ? "Suggestions will be automatically sent without your confirmation." 
        : "You'll need to manually send messages.",
      variant: "default"
    });
    
    // If enabling AI mode and we have a suggestion, use it immediately
    if (newMode && currentSuggestion) {
      // Clear any existing timeout
      if (autoSendTimeoutRef.current) {
        clearTimeout(autoSendTimeoutRef.current);
      }
      
      // Set countdown
      setAutoSendCountdown(3);
      
      // Send after a short delay
      autoSendTimeoutRef.current = setTimeout(() => {
        setUserInput(currentSuggestion);
        handleSendMessage();
        autoSendTimeoutRef.current = null;
      }, 3000);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 text-slate-800 overflow-hidden">
      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl flex flex-col items-center">
            <HeartLoader size="lg" showText text="Connecting to Your Twin" />
            <p className="text-pink-500 mt-4 text-sm">Retrieving your AI twin from Verida...</p>
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

        {/* Decorative pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LCAxMjgsIDE3MCwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')]" />
      </div>

      <div className="relative container mx-auto px-4 py-8 flex flex-col h-screen max-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/create-twin" className="p-2 rounded-full hover:bg-white/30 transition-colors">
              <ArrowLeft className="h-5 w-5 text-pink-600" />
            </Link>
            
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="AI Twin" />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-400 text-white">
                  {twinData?.name ? twinData.name.substring(0, 2).toUpperCase() : "AI"}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {twinData?.name || "AI Twin"}
                  <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200 text-xs">
                    AI Twin
                  </Badge>
                </h1>
                {twinData && (
                  <p className="text-sm text-slate-600">
                    {twinData.age && `${twinData.age} • `}
                    {twinData.location && `${twinData.location} • `}
                    {twinData.occupation || ""}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* AI Mode Toggle */}
          <div className="flex items-center space-x-2 bg-white/80 px-3 py-2 rounded-full shadow-sm">
            <Switch 
              id="ai-mode" 
              checked={aiMode} 
              onCheckedChange={toggleAiMode}
              className={aiMode ? "data-[state=checked]:bg-pink-500" : ""} 
            />
            <Label htmlFor="ai-mode" className="flex items-center gap-1 text-slate-700 cursor-pointer">
              <Bot className={`h-4 w-4 ${aiMode ? "text-pink-500" : "text-slate-500"}`} />
              <span className={aiMode ? "font-medium text-pink-700" : ""}>
                {aiMode ? "AI Mode Active" : "AI Mode"}
              </span>
            </Label>
          </div>
        </div>
        
        {/* Main chat area */}
        <div className="flex-1 backdrop-blur-xl bg-white/60 rounded-[2rem] border border-pink-200 p-6 shadow-xl flex flex-col overflow-hidden">
          {!twinData && !isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Sparkles className="h-16 w-16 text-pink-300 mb-4" />
              <h2 className="text-xl font-bold text-slate-700 mb-2">No AI Twin Found</h2>
              <p className="text-slate-600 text-center max-w-md mb-6">
                You need to create an AI twin before you can chat with it. Go to the twin creation page to get started.
              </p>
              <Link href="/wallet">
                <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white">
                  Create Your AI Twin
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Chat messages */}
              <div 
                className="flex-1 overflow-y-auto pr-2 space-y-4"
                style={{ 
                  scrollBehavior: "smooth",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(236, 72, 153, 0.3) transparent"
                }}
                ref={chatContainerRef}
              >
                {messages.map((msg, index) => (
                  <div key={index} className={`flex items-end gap-2 ${!msg.isAi ? "justify-end" : ""}`}>
                    {msg.isAi && (
                      <Avatar className="h-8 w-8 border-2 border-white flex-shrink-0">
                        <AvatarImage src={twinData?.photo || "/placeholder.svg?height=32&width=32"} alt={twinData?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-400 text-white text-xs">
                          {twinData?.name ? twinData.name.substring(0, 2).toUpperCase() : "AI"}
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
                          <span className="text-xs text-pink-200">{twinData?.name || "AI Twin"}</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <div className="text-xs mt-1 text-white/70">{formatTime(msg.timestamp)}</div>
                    </div>

                    {!msg.isAi && (
                      <Avatar className="h-8 w-8 border-2 border-white flex-shrink-0">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="You" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-400 text-white text-xs">
                          You
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-end gap-2">
                    <Avatar className="h-8 w-8 border-2 border-white flex-shrink-0">
                      <AvatarImage src={twinData?.photo || "/placeholder.svg?height=32&width=32"} alt={twinData?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-400 text-white text-xs">
                        {twinData?.name ? twinData.name.substring(0, 2).toUpperCase() : "AI"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white rounded-2xl rounded-bl-none px-4 py-2 max-w-[80%] shadow-sm">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="h-2 w-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        <div className="h-2 w-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Suggestion */}
              {currentSuggestion && (
                <div className="px-4 py-2 border-t border-pink-100 mt-4">
                  <div className="flex items-center gap-2">
                    {!aiMode ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/80 border-pink-200 hover:bg-pink-50 text-pink-700 rounded-full flex-shrink-0"
                        onClick={useSuggestion}
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        {currentSuggestion}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-pink-700 bg-pink-50 rounded-lg p-2 w-full">
                        <Sparkles className="h-3 w-3 flex-shrink-0 text-pink-500" />
                        <span className="flex-1">
                          <span className="font-medium">Next message: </span>
                          {currentSuggestion}
                        </span>
                        <span className="text-xs bg-pink-200 text-pink-800 px-2 py-1 rounded-full flex items-center gap-1">
                          <Loader2 className={`h-3 w-3 ${autoSendCountdown > 0 ? "animate-spin" : ""}`} />
                          {autoSendCountdown > 0 
                            ? `Sending in ${autoSendCountdown}s` 
                            : "Sending..."}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {aiMode && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                      <Bot className="h-3 w-3 flex-shrink-0" />
                      <span>AI Mode is active. Messages will be sent automatically.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Message input */}
              <form onSubmit={handleSendMessage} className="mt-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder={aiMode ? "AI Mode is active - messages will be sent automatically" : "Type a message..."}
                      className={`min-h-[60px] max-h-[150px] bg-white/80 border-pink-100 focus:border-pink-300 rounded-xl resize-none pr-12 ${aiMode ? 'bg-gray-50 text-gray-400' : ''}`}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      disabled={aiMode}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !aiMode) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    {!aiMode && userInput && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 bottom-2 h-8 w-8 rounded-full bg-white/80 hover:bg-pink-50 text-slate-600"
                        onClick={() => setUserInput("")}
                      >
                        <CloseIcon className="h-4 w-4" />
                        <span className="sr-only">Clear</span>
                      </Button>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full h-10 w-10 flex-shrink-0"
                    size="icon"
                    disabled={(!userInput.trim() && !aiMode) || isTyping}
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-4 text-center text-sm text-slate-500">
          <p>Powered by Verida LLM API • Your data is securely stored in your Verida wallet</p>
        </div>
      </div>
    </div>
  )
} 