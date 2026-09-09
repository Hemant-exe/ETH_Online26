"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Send,
  Bot,
  Sparkles,
  RefreshCw,
  ImageIcon,
  Mic,
  MoreVertical,
  Settings,
  AlertTriangle,
  Info,
  Trash,
  Shield,
  Loader2,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Conversation, Message } from "@/app/types/chat"
import { aiSuggestions } from "@/data/ai-suggestions"
import { useVeridaClient } from "@/app/lib/clientside-verida"
import { saveMessage, convertToVeridaMessage } from "@/app/lib/chat-message-service"
import { generateAiTwinChatResponse } from "@/app/lib/ai-twin-chat-service"
import { getUserAiTwin } from "@/app/lib/verida-ai-twin-service"
import { HeartLoader } from "@/components/ui/heart-loader"

// Extended Conversation type to include name property
interface ExtendedConversation extends Conversation {
  name?: string;
}

interface ConversationPanelProps {
  conversation: ExtendedConversation
  onSendMessage: (message: string) => void
}

export default function ConversationPanel({ conversation, onSendMessage }: ConversationPanelProps) {
  const [message, setMessage] = useState("")
  const [aiMode, setAiMode] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [currentSuggestion, setCurrentSuggestion] = useState("")
  const [showAiInsight, setShowAiInsight] = useState(false)
  const [aiInsight, setAiInsight] = useState("")
  const [autoSendCountdown, setAutoSendCountdown] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showSettings, setShowSettings] = useState(false)
  const { client, isLoading, getDidId } = useVeridaClient()
  const [userDid, setUserDid] = useState<string | null>(null)
  const [userName, setUserName] = useState("Me")
  const autoSendTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [twinData, setTwinData] = useState<any>(null)
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false)
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false)
  const initialSuggestionGeneratedRef = useRef(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Add effect to handle initial loading state
  useEffect(() => {
    // Set a timeout to simulate loading and show the heart loader
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Get user DID when Verida client is loaded
  useEffect(() => {
    let isMounted = true;
    
    if (!isLoading && client && client.isConnected()) {
      getDidId().then(did => {
        if (did && isMounted) {
          setUserDid(did);
          
          // Try to get stored username from localStorage
          const storedName = localStorage.getItem("testUserName");
          if (storedName) {
            setUserName(storedName);
          }
          
          // Load AI twin data
          loadAiTwinData();
        }
      });
    }
    
    return () => {
      isMounted = false;
    };
  }, [isLoading, client, getDidId]);
  
  // Fix the loadAiTwinData function
  const loadAiTwinData = async () => {
    if (twinData) return; // Prevent duplicate loading
    
    try {
      const data = await getUserAiTwin();
      if (data) {
        console.log("AI twin data loaded:", data.name);
        setTwinData(data);
        
        // Generate initial suggestion only once
        if (!initialSuggestionGeneratedRef.current) {
          initialSuggestionGeneratedRef.current = true;
          setTimeout(() => {
            if (conversation?.messages?.length > 0) {
              generateAiSuggestion(data);
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Failed to load AI twin data:", error);
    }
  };

  // Scroll to bottom when messages change - with protection against undefined messages
  useEffect(() => {
    if (conversation?.messages?.length) {
      scrollToBottom()
    }
  }, [conversation?.messages])

  // Use memo to keep messages stable between renders
  const messages = useMemo(() => {
    return conversation?.messages || [];
  }, [conversation?.messages]);

  // Generate AI suggestion on mount
  useEffect(() => {
    generateAiSuggestion()

    // Show AI insight after a delay
    const timer = setTimeout(() => {
      const randomInsight = aiSuggestions.insights[Math.floor(Math.random() * aiSuggestions.insights.length)]
      setAiInsight(randomInsight)
      setShowAiInsight(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Fix the auto-send effect to prevent infinite loops
  useEffect(() => {
    // Only run this effect if AI mode is active and we have a suggestion
    if (!aiMode || !currentSuggestion || isTyping) {
      return;
    }
    
    console.log("Setting up auto-send timer");
    
    // Clear any existing timeout and interval
    if (autoSendTimeoutRef.current) {
      clearTimeout(autoSendTimeoutRef.current);
      autoSendTimeoutRef.current = null;
    }
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    // Reset countdown
    setAutoSendCountdown(5);
    
    // Set the delay (5 seconds)
    const autoSendDelay = 5000;
    const startTime = Date.now();
    
    // Update countdown every second
    countdownIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((autoSendDelay - elapsed) / 1000));
      setAutoSendCountdown(remaining);
      
      if (remaining <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }
    }, 1000);
    
    // Set timeout to send the message
    autoSendTimeoutRef.current = setTimeout(() => {
      console.log("Auto-sending message:", currentSuggestion);
      setMessage(currentSuggestion);
      handleSendMessage();
    }, autoSendDelay);
    
    // Clean up on unmount or when dependencies change
    return () => {
      if (autoSendTimeoutRef.current) {
        clearTimeout(autoSendTimeoutRef.current);
        autoSendTimeoutRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [aiMode, currentSuggestion, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    // In AI mode, we might be sending an empty message (using suggestion)
    // In manual mode, we need a non-empty message
    if ((!message.trim() && !aiMode) || isTyping) return;
    
    const messageToSend = message.trim() || currentSuggestion;
    
    if (!messageToSend) return;
    
    try {
      // Create message object for storing
      const messageObj = {
        id: `msg-${Date.now()}`,
        content: messageToSend,
        sender: "user",
        timestamp: new Date().toISOString(),
        isAI: false,
        // Track if this message was sent by AI mode
        sentByAiMode: aiMode
      };
      
      // Call the onSendMessage callback to update UI immediately
      onSendMessage(messageToSend);
      
      // Save to Verida if authenticated
      if (userDid && client && client.isConnected()) {
        try {
          // Convert to Verida format
          const veridaMessage = convertToVeridaMessage(
            messageObj,
            conversation.id,
            userDid,
            userName
          );
          
          // CRITICAL: Use the exact conversation name as the group name
          veridaMessage.groupName = conversation.name || `Chat with ${conversation.user.name}`;
          console.log(`Sending message to group: ${conversation.id} with name: ${veridaMessage.groupName}`);
          
          // Save to Verida
          await saveMessage(veridaMessage);
          console.log("Message saved to Verida:", veridaMessage);
        } catch (error) {
          console.error("Failed to save message to Verida:", error);
          toast({
            title: "Message Sent",
            description: "Message delivered but failed to save to blockchain.",
            variant: "destructive",
          });
        }
      } else {
        console.warn("Cannot save to Verida: Not authenticated");
      }
      
      // Clear the input
      setMessage("");
      
      // Simulate AI response if AI mode is on
      // But only if this message wasn't generated by AI mode itself
      if (aiMode && !messageObj.sentByAiMode) {
        simulateAiResponse();
      }
      
      // Generate new AI suggestion
      generateAiSuggestion();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to Send",
        description: "Could not send your message. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Fix the simulateAiResponse function
  const simulateAiResponse = async () => {
    // Guard against recursive calls
    if (isGeneratingResponse) return;
    
    // Check if the last message was from the AI to prevent responding to self
    if (conversation.messages.length > 0) {
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      if (lastMessage.sender === "ai" || lastMessage.isAI) {
        console.log("Skipping AI response to prevent responding to self");
        return;
      }
    }
    
    setIsGeneratingResponse(true);
    setIsTyping(true);

    try {
      // If we have twin data, use it for more personalized responses
      if (twinData) {
        // Get conversation history from the UI (simplified)
        const conversationHistory = conversation.messages.slice(-10).map(msg => ({
          id: msg.id || `msg-${Date.now()}`,
          content: msg.content,
          sender: msg.sender,
          senderName: msg.senderName || (msg.sender === "user" ? userName : conversation.user.name),
          timestamp: msg.timestamp
        }));
        
        // Get the last user message
        const lastUserMessage = conversationHistory.length > 0 ? 
          conversationHistory[conversationHistory.length - 1].content : "";
        
        // Generate response with AI twin data
        const aiResponse = await generateAiTwinChatResponse({
          userMessage: lastUserMessage,
          conversationHistory: conversationHistory,
          profileData: twinData,
          temperature: 0.7,
          promptType: 'auto'
        });
        
        // Simulate typing delay
        setTimeout(() => {
          setIsTyping(false);
          
          // Create AI message object with flag to prevent responding to it
          const aiMessageObj = {
            content: aiResponse,
            isAI: true,
            fromAI: true // Flag to identify AI-generated messages
          };
          
          onSendMessage(aiResponse);
          
          // Save AI response to Verida
          saveAiMessageToVerida(aiResponse);
          
          // Generate new suggestion after response with a delay
          setTimeout(() => {
            generateAiSuggestion(twinData);
          }, 1000);
          
          setIsGeneratingResponse(false);
        }, 1500 + Math.random() * 1000);
        
        return;
      }
      
      // Fallback to random responses if no twin data
      setTimeout(async () => {
        setIsTyping(false);

        // Get random AI response
        const responses = aiSuggestions.responses;
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        // Call the onSendMessage callback to update UI immediately
        onSendMessage(randomResponse);
        
        // Save AI message to Verida
        saveAiMessageToVerida(randomResponse);
        
        // Generate new suggestion after a short delay
        setTimeout(() => {
          generateAiSuggestion();
        }, 1000);
        
        setIsGeneratingResponse(false);
      }, 2000);
    } catch (error) {
      console.error("Error generating AI response:", error);
      setIsTyping(false);
      
      // Fallback to random response
      const responses = aiSuggestions.responses;
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      onSendMessage(randomResponse);
      
      // Save AI message to Verida
      saveAiMessageToVerida(randomResponse);
      
      setIsGeneratingResponse(false);
    }
  };
  
  // Helper function to save AI messages to Verida
  const saveAiMessageToVerida = async (content: string) => {
    if (userDid && client && client.isConnected()) {
      const aiMessage = {
        id: `ai-msg-${Date.now()}`,
        content: content,
        sender: "ai",
        timestamp: new Date().toISOString(),
        isAI: true,
      };
      
      try {
        // Convert to Verida format and save
        const veridaMessage = convertToVeridaMessage(
          aiMessage,
          conversation.id,
          `ai-twin-${userDid}`, // AI twin DID
          "AI Twin" // AI name
        );
        
        // CRITICAL: Use the exact conversation name as the group name
        veridaMessage.groupName = conversation.name || `Chat with ${conversation.user.name}`;
        console.log(`Sending AI message to group: ${conversation.id} with name: ${veridaMessage.groupName}`);
        
        // Save the message to Verida
        await saveMessage(veridaMessage);
        console.log("AI message saved to Verida:", veridaMessage);
      } catch (error) {
        console.error("Failed to save AI message to Verida:", error);
      }
    }
  };

  // Fix the generateAiSuggestion function
  const generateAiSuggestion = async (profile?: any) => {
    // Guard against recursive calls
    if (isGeneratingSuggestion) return;
    
    setIsGeneratingSuggestion(true);
    
    try {
      // Use provided profile or state
      const profileData = profile || twinData;
      
      // If we have twin data and conversation history, use the API
      if (profileData && conversation?.messages?.length > 0) {
        // Get conversation history from the UI (simplified)
        const conversationHistory = conversation.messages.slice(-10).map(msg => ({
          id: msg.id || `msg-${Date.now()}`,
          content: msg.content,
          sender: msg.sender,
          senderName: msg.senderName || (msg.sender === "user" ? userName : conversation.user.name),
          timestamp: msg.timestamp
        }));
        
        // Generate suggestion with AI twin data
        const suggestion = await generateAiTwinChatResponse({
          userMessage: "Suggest a short message I could send to continue the conversation",
          conversationHistory: conversationHistory,
          profileData: profileData,
          temperature: 0.8,
          promptType: 'suggestion'
        });
        
        // Clean up the suggestion
        const cleanSuggestion = suggestion
          .replace(/^["']|["']$/g, '') // Remove quotes
          .replace(/^(I would |You could |Try |Say |Suggestion: )/i, '') // Remove prefixes
          .trim();
        
        setCurrentSuggestion(cleanSuggestion);
        setIsGeneratingSuggestion(false);
        return;
      }
      
      // Fallback to random suggestions if no twin data or no conversation history
      const suggestions = aiSuggestions.suggestions;
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      setCurrentSuggestion(randomSuggestion);
    } catch (error) {
      console.error("Error generating suggestion:", error);
      
      // Fallback to random suggestion
      const suggestions = aiSuggestions.suggestions;
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      setCurrentSuggestion(randomSuggestion);
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  const useSuggestion = () => {
    setMessage(currentSuggestion)
    generateAiSuggestion()
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const toggleAiMode = () => {
    const newMode = !aiMode;
    setAiMode(newMode);

    toast({
      title: newMode ? "AI Mode Enabled" : "AI Mode Disabled",
      description: newMode
        ? "Your AI twin will now automatically respond on your behalf."
        : "You are now in manual mode. Your AI twin will only provide suggestions.",
      variant: "default",
    });
    
    // If enabling AI mode and we have a suggestion, start countdown
    if (newMode && currentSuggestion) {
      // Clear any existing timeout
      if (autoSendTimeoutRef.current) {
        clearTimeout(autoSendTimeoutRef.current);
      }
      
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      
      // Set countdown
      setAutoSendCountdown(5);
      
      const startTime = Date.now();
      const autoSendDelay = 5000;
      
      // Update countdown every second
      countdownIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, Math.ceil((autoSendDelay - elapsed) / 1000));
        setAutoSendCountdown(remaining);
        
        if (remaining <= 0) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
        }
      }, 1000);
      
      // Send after a delay
      autoSendTimeoutRef.current = setTimeout(() => {
        setMessage(currentSuggestion);
        handleSendMessage();
        autoSendTimeoutRef.current = null;
      }, 5000);
    }
  }

  const dismissAiInsight = () => {
    setShowAiInsight(false)
  }

  const handleDeleteChat = () => {
    toast({
      title: "Chat Deleted",
      description: "This conversation has been deleted.",
      variant: "default",
    })
    setShowSettings(false)
  }

  // Show loading state with heart loader
  if (isInitialLoading) {
    return (
      <div className="h-full backdrop-blur-xl bg-white/60 rounded-[2rem] border border-pink-200 flex flex-col items-center justify-center">
        <HeartLoader size="lg" showText text="Loading conversation..." />
        <p className="text-pink-500 mt-4 text-sm">Connecting to your matches...</p>
      </div>
    );
  }

  // Safety check in case conversation is undefined
  if (!conversation) {
    return (
      <div className="h-full backdrop-blur-xl bg-white/60 rounded-[2rem] border border-pink-200 flex flex-col items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Conversation not found</h3>
          <p className="text-slate-600">
            The conversation you're looking for could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full backdrop-blur-xl bg-white/60 rounded-[2rem] border border-pink-200 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-pink-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
            <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-400 text-white">
              {conversation.user.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div>
            <h3 className="font-semibold text-slate-800">{conversation.user.name}</h3>
            <div className="flex items-center gap-2">
              {conversation.user.isOnline ? (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 text-xs rounded-full px-2 py-0"
                >
                  Online
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-slate-50 text-slate-700 border-slate-200 text-xs rounded-full px-2 py-0"
                >
                  Offline
                </Badge>
              )}

              {conversation.user.verified && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 text-xs rounded-full px-2 py-0"
                >
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <MoreVertical className="h-5 w-5 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-pink-100 rounded-xl">
              <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Chat Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isUser={msg.sender === "user"}
              showAvatar={index === 0 || messages[index - 1].sender !== msg.sender}
              userAvatar={conversation.user.avatar}
              userName={conversation.user.name}
            />
          ))}

          {isTyping && (
            <div className="flex items-end gap-2">
              <Avatar className="h-8 w-8 border-2 border-white">
                <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-400 text-white text-xs">
                  {conversation.user.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="bg-white rounded-2xl rounded-bl-none px-4 py-2 max-w-[80%] shadow-sm">
                <div className="flex space-x-1">
                  <div
                    className="h-2 w-2 bg-slate-300 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="h-2 w-2 bg-slate-300 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                  <div
                    className="h-2 w-2 bg-slate-300 rounded-full animate-bounce"
                    style={{ animationDelay: "600ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* AI Insight */}
          {/* <AnimatePresence>
            {showAiInsight && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-3 border border-pink-100 flex items-start gap-2"
              >
                <Sparkles className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-semibold text-pink-700 mb-1">AI Insight</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full hover:bg-pink-100 text-pink-500"
                      onClick={dismissAiInsight}
                    >
                      <span className="sr-only">Dismiss</span>
                      <span aria-hidden>×</span>
                    </Button>
                  </div>
                  <p className="text-sm text-pink-600">{aiInsight}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence> */}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* AI Suggestions */}
      <div className="px-4 py-2 border-t border-pink-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <div className="flex gap-2">
              {!aiMode ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/80 border-pink-200 hover:bg-pink-50 text-pink-700 rounded-full flex-shrink-0"
                  onClick={useSuggestion}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {currentSuggestion.length > 50 ? `${currentSuggestion.substring(0, 80)}...` : currentSuggestion}
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-sm text-pink-700 bg-pink-50 rounded-lg p-2 w-full">
                  <Sparkles className="h-3 w-3 flex-shrink-0 text-pink-500" />
                  <span className="flex-1 overflow-hidden text-ellipsis">
                    <span className="font-medium">Next message: </span>
                    {currentSuggestion.length > 50 ? (
                      <span title={currentSuggestion}>{`${currentSuggestion.substring(0, 50)}...`}</span>
                    ) : (
                      currentSuggestion
                    )}
                  </span>
                  {autoSendCountdown > 0 && (
                    <span className="text-xs bg-pink-200 text-pink-800 px-2 py-1 rounded-full flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Sending in {autoSendCountdown}s
                    </span>
                  )}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 border-pink-200 hover:bg-pink-50 text-pink-700 rounded-full flex-shrink-0"
                onClick={generateAiSuggestion}
              >
                <RefreshCw className="h-3 w-3" />
                <span className="sr-only">New suggestion</span>
              </Button>
            </div>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white/80 hover:bg-pink-50 text-slate-600"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-white border border-pink-100 text-slate-700 max-w-xs p-3 rounded-xl">
                <p>AI suggestions are based on your conversation history and shared interests.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-pink-100">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              placeholder={aiMode ? "AI Mode is active - messages will be sent automatically" : "Type a message..."}
              className={`min-h-[60px] max-h-[150px] bg-white/80 border-pink-100 focus:border-pink-300 rounded-xl resize-none pr-20 ${aiMode ? 'bg-gray-50 text-gray-400' : ''}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={aiMode}
            />
            <div className="absolute bottom-2 right-2 flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/80 hover:bg-pink-50 text-slate-600"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/80 hover:bg-pink-50 text-slate-600"
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full h-10 w-10 flex-shrink-0"
            size="icon"
            onClick={handleSendMessage}
            disabled={(!message.trim() && !aiMode) || isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {aiMode && (
          <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
            <Bot className="h-3 w-3 flex-shrink-0" />
            <span>AI Mode is active. Messages will be sent automatically.</span>
          </div>
        )}
      </div>

      {/* Chat Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-white border border-pink-100 text-slate-800 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-pink-700">Chat Settings</DialogTitle>
            <DialogDescription className="text-slate-600">
              Manage your conversation settings and privacy.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <Label className="text-slate-700">Secure Chat Logs</Label>
                <p className="text-xs text-slate-500">Verify messages with Sprite+ for authenticity</p>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <Label className="text-slate-700">AI Analysis</Label>
                <p className="text-xs text-slate-500">Allow AI to analyze this conversation</p>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <Label className="text-slate-700">Message Encryption</Label>
                <p className="text-xs text-slate-500">End-to-end encrypt all messages</p>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <div className="bg-slate-50 p-3 rounded-lg flex items-start gap-2 mt-4">
              <Shield className="h-4 w-4 text-slate-600 mt-0.5" />
              <p className="text-xs text-slate-600">
                Messages are stored securely off-chain. Only you and your match can see them.
              </p>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="destructive" onClick={handleDeleteChat} className="bg-red-500 hover:bg-red-600 text-white">
              <Trash className="h-4 w-4 mr-2" />
              Delete Chat
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
              className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface MessageBubbleProps {
  message: Message
  isUser: boolean
  showAvatar: boolean
  userAvatar: string
  userName: string
}

// Add a new component for truncating long messages
function TruncatedMessage({ content, maxLength = 150 }: { content: string; maxLength?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (content.length <= maxLength) {
    return <p className="text-sm whitespace-pre-wrap">{content}</p>;
  }
  
  return (
    <div className="text-sm">
      <p className="whitespace-pre-wrap">
        {isExpanded ? content : `${content.substring(0, maxLength)}...`}
      </p>
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="text-xs mt-1 text-blue-500 hover:text-blue-700 font-medium"
      >
        {isExpanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}

// Update the MessageBubble component to use TruncatedMessage
function MessageBubble({ message, isUser, showAvatar, userAvatar, userName }: MessageBubbleProps) {
  // Get the actual sender name from the message or fall back to the conversation user name
  const displayName = isUser ? "Me" : (message.senderName || userName);
  
  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : ""}`}>
      {!isUser && showAvatar ? (
        <Avatar className="h-8 w-8 border-2 border-white">
          <AvatarImage src={userAvatar} alt={displayName} />
          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-400 text-white text-xs">
            {displayName.substring(0, 2)}
          </AvatarFallback>
        </Avatar>
      ) : !isUser ? (
        <div className="w-8" />
      ) : null}

      <div
        className={`px-4 py-2 max-w-[80%] shadow-sm ${
          isUser
            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl rounded-br-none"
            : "bg-white rounded-2xl rounded-bl-none"
        }`}
      >
        {message.isAI && (
          <div className="flex items-center gap-1 mb-1">
            <Bot className="h-3 w-3 text-pink-300" />
            <span className="text-xs text-pink-200">AI Response</span>
          </div>
        )}
        {!isUser && showAvatar && message.senderName && (
          <div className="text-xs font-semibold text-pink-500 mb-1">
            {message.senderName}
          </div>
        )}
        <TruncatedMessage content={message.content} maxLength={200} />
        <div className={`text-xs mt-1 ${isUser ? "text-pink-200" : "text-slate-400"}`}>
          {formatTimestamp(message.timestamp)}
        </div>
      </div>

      {isUser && showAvatar ? (
        <Avatar className="h-8 w-8 border-2 border-white">
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="You" />
          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-400 text-white text-xs">
            Me
          </AvatarFallback>
        </Avatar>
      ) : isUser ? (
        <div className="w-8" />
      ) : null}
    </div>
  )
}

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

