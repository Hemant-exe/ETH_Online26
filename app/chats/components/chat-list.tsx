"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Bot, Clock, Shield } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Conversation } from "@/app/types/chat"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useVeridaClient } from "@/app/lib/clientside-verida"
import { toast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChatListProps {
  conversations: Conversation[]
  selectedChatId: string | null
  onSelectChat: (chatId: string) => void
  isLoading?: boolean
  onRefresh?: () => void
}

export default function ChatList({ 
  conversations, 
  selectedChatId, 
  onSelectChat, 
  isLoading = false,
  onRefresh
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const { client, isLoading: veridaLoading } = useVeridaClient()

  const filteredConversations = conversations.filter((conversation) =>
    conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      
      if (client) {
        // Use client's connect method directly
        await client.connect();
        
        toast({
          title: "Connected to Verida",
          description: "Successfully connected to your Verida wallet.",
        });
        
        // If there's a refresh callback, call it to reload conversations
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast({
          title: "Verida Client Not Available",
          description: "The Verida client is not initialized.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      toast({
        title: "Connection Error",
        description: "An error occurred while connecting to Verida.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()

    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // If this week, show day name
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    }

    // Otherwise show date
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  const getLastMessage = (conversation: Conversation) => {
    if (conversation.messages.length === 0) return null
    return conversation.messages[conversation.messages.length - 1]
  }

  return (
    <div className="h-full backdrop-blur-xl bg-white/60 rounded-[2rem] border border-pink-200 p-4 flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Your Conversations</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search conversations..."
            className="pl-10 bg-white/80 border-pink-100 focus:border-pink-300 rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4">
        {isLoading || isConnecting ? (
          // Loading skeletons
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-xl border border-transparent">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-[120px] mb-2" />
                    <Skeleton className="h-3 w-[180px]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => {
                const lastMessage = getLastMessage(conversation)

                return (
                  <motion.div
                    key={conversation.id}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      selectedChatId === conversation.id
                        ? "bg-gradient-to-r from-pink-100 to-rose-100 border-pink-200"
                        : "hover:bg-white/80 bg-white/40"
                    } border border-transparent hover:border-pink-100`}
                    onClick={() => onSelectChat(conversation.id)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-white">
                          <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-400 text-white">
                            {conversation.user.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.user.isOnline && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-1">
                            <h3 className="font-semibold text-slate-800 truncate">{conversation.user.name}</h3>
                            {conversation.user.id?.startsWith('did:') && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Shield className="h-3 w-3 text-blue-400" />
                                  </TooltipTrigger>
                                  <TooltipContent>Verified on blockchain</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {lastMessage ? formatTimestamp(lastMessage.timestamp) : ""}
                          </span>
                        </div>

                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm text-slate-600 truncate max-w-[150px]">
                            {lastMessage && lastMessage.isAI && <Bot className="h-3 w-3 inline mr-1 text-pink-500" />}
                            {lastMessage ? 
                              (lastMessage.senderName && lastMessage.senderName !== "Me" ? 
                                <span className="font-medium text-pink-600 mr-1">{lastMessage.senderName}:</span> : "") + 
                                lastMessage.content 
                              : "Start a conversation"}
                          </p>

                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-2 py-0 text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <div className="text-center py-8 text-slate-500 flex flex-col items-center">
                <p>No conversations found</p>
                <p className="text-sm mt-2">Start a new conversation to chat with your matches</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

