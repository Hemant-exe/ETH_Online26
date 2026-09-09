"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import ChatList from "./chat-list"
import ConversationPanel from "./conversation-panel"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { mockConversations } from "@/data/mock-conversations"
import { useVeridaClient } from "@/app/lib/clientside-verida"
import { 
  getChatGroups, 
  getMessages, 
  convertFromVeridaMessage,
  createChatGroup,
  createChatGroupId,
  createChatGroupName
} from "@/app/lib/chat-message-service"
import { toast } from "@/hooks/use-toast"
import type { Conversation, Message } from "@/app/types/chat"

export default function ChatInterface() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [showChatList, setShowChatList] = useState(!isMobile)
  const [isLoading, setIsLoading] = useState(false)
  const { client, isLoading: veridaLoading, getDidId } = useVeridaClient()
  const [userDid, setUserDid] = useState<string | null>(null)
  const hasInitializedRef = useRef(false)
  const isLoadingMessagesRef = useRef(false)
  const loadedGroupsRef = useRef(new Set<string>())
  const loadedMessagesRef = useRef<Record<string, boolean>>({})

  // Auto-connect to Verida and load chats only once
  useEffect(() => {
    // Only run this effect once
    if (hasInitializedRef.current) return;
    
    async function initializeApp() {
      try {
        console.log("Initializing app...");
        setIsLoading(true);
        
        if (client && !client.isConnected()) {
          await client.connect();
          console.log("Connected to Verida");
        }
        
        if (client && client.isConnected()) {
          const did = await getDidId();
          if (did) {
            console.log("User DID:", did);
            setUserDid(did);
            await loadChatGroups();
          }
        }
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        setIsLoading(false);
        // Mark as initialized so this effect doesn't run again
        hasInitializedRef.current = true;
      }
    }
    
    if (!veridaLoading) {
      initializeApp();
    }
  }, [veridaLoading, client, getDidId]);

  // Update UI when screen size changes
  useEffect(() => {
    setShowChatList(!isMobile || !selectedChat)
  }, [isMobile, selectedChat])

  // Load chat groups from Verida
  const loadChatGroups = async () => {
    try {
      console.log("Loading chat groups...");
      
      // Get chat groups from Verida
      const groups = await getChatGroups();
      console.log("Loaded chat groups:", groups);
      
      if (groups.length > 0) {
        // Map Verida chat groups to conversation format
        const loadedConversations = groups.map(group => {
          // Find other participant (not the current user)
          const otherParticipant = group.participants.find(p => p.did !== userDid);
          
          // Get the actual group name from the data
          const displayName = group.name || (otherParticipant?.name !== "Me" ? otherParticipant?.name : "Unknown User");
          
          // Store that we've loaded this group
          loadedGroupsRef.current.add(group.id);
          
          // For the last message, extract the fromName if available
          let lastMessage = null;
          if (group.lastMessage) {
            lastMessage = convertFromVeridaMessage(group.lastMessage, userDid || "");
            
            // If we have message dictionary, try to extract the sender name
            if (typeof group.lastMessage.messageText === 'string' && group.lastMessage.isMessageDict) {
              try {
                const messageDict = JSON.parse(group.lastMessage.messageText);
                const lastMessageKey = Object.keys(messageDict).sort().pop();
                if (lastMessageKey && messageDict[lastMessageKey] && messageDict[lastMessageKey].fromName) {
                  lastMessage.senderName = messageDict[lastMessageKey].fromName;
                }
              } catch (e) {
                console.warn("Failed to parse message dictionary", e);
              }
            }
          }
          
          // Extract the name by removing "Chat with " prefix if it exists
          let chatName = displayName || "Unknown User";
          if (chatName.startsWith("Chat with ")) {
            chatName = chatName.substring(10);
          }
          
          return {
            id: group.id,
            name: group.name,  // Store the full group name for reference
            user: {
              id: otherParticipant?.did || "unknown",
              name: chatName, // Use the extracted name, ensuring it's not undefined
              avatar: otherParticipant?.avatar || "/placeholders/avatar.png",
              isOnline: false,
              verified: false
            },
            messages: lastMessage ? [lastMessage] : [],
            unreadCount: group.unreadCount || 0
          };
        });

        // Sort conversations by most recent message
        const sortedConversations = loadedConversations.sort((a, b) => {
          const aTimestamp = a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].timestamp).getTime() : 0;
          const bTimestamp = b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].timestamp).getTime() : 0;
          return bTimestamp - aTimestamp;
        });
        
        // Use actual Verida data rather than combining with mock data
        setConversations(sortedConversations);
        
        // If no conversations selected but we have conversations, select the first one
        if (!selectedChat && sortedConversations.length > 0) {
          setSelectedChat(sortedConversations[0].id);
          // Load messages for the first conversation
          await loadMessages(sortedConversations[0].id, sortedConversations[0].name);
        }
      } else {
        // If no Verida conversations, use mock data temporarily
        setConversations(mockConversations);
      }
    } catch (error) {
      console.error("Failed to load chat groups:", error);
      toast({
        title: "Failed to Load Chats",
        description: "There was an error loading your conversations. Using demo data instead.",
        variant: "destructive",
      });
      // Fallback to mock data
      setConversations(mockConversations);
    }
  };

  // Load messages for a specific chat
  const loadMessages = async (chatId: string, groupName?: string) => {
    // Prevent duplicate loading of messages
    const cacheKey = `${chatId}:${groupName || ''}`;
    if (isLoadingMessagesRef.current || loadedMessagesRef.current[cacheKey]) {
      console.log(`Skipping load for ${cacheKey} - already loaded or loading in progress`);
      return;
    }
    
    isLoadingMessagesRef.current = true;
    
    try {
      setIsLoading(true);
      console.log(`Loading messages for chat ${chatId} with name ${groupName || 'unknown'}`);
      
      // Get messages from Verida - IMPORTANT: Pass both groupId AND groupName to properly filter messages
      const messages = await getMessages(chatId, groupName);
      console.log(`Loaded ${messages.length} messages for group ${chatId} with name ${groupName || 'unknown'}`);
      
      if (messages.length > 0) {
        // Convert to app format
        const formattedMessages = messages.map(msg => {
          const converted = convertFromVeridaMessage(msg, userDid || "");
          return converted;
        });
        
        // Update the selected conversation with loaded messages
        setConversations(prevConversations => {
          return prevConversations.map(chat => 
            chat.id === chatId 
              ? { ...chat, messages: formattedMessages } 
              : chat
          );
        });
        
        // Mark these messages as loaded
        loadedMessagesRef.current[cacheKey] = true;
      }
    } catch (error) {
      console.error(`Failed to load messages for chat ${chatId}:`, error);
    } finally {
      setIsLoading(false);
      isLoadingMessagesRef.current = false;
    }
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId)
    if (isMobile) {
      setShowChatList(false)
    }

    // Mark as read when selected
    setConversations(conversations.map((chat) => (chat.id === chatId ? { ...chat, unreadCount: 0 } : chat)))
    
    // Find the selected conversation to get its name
    const selectedConversation = conversations.find(c => c.id === chatId);
    if (selectedConversation) {
      // Load messages for this chat with its name (if not already loaded)
      const cacheKey = `${chatId}:${selectedConversation.name || ''}`;
      if (!loadedMessagesRef.current[cacheKey]) {
        loadMessages(chatId, selectedConversation.name);
      }
    }
  }

  const handleBackToList = () => {
    if (isMobile) {
      setShowChatList(true)
      setSelectedChat(null)
    }
  }

  const handleSendMessage = (chatId: string, message: string) => {
    // Update the UI immediately
    setConversations(
      conversations.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  id: `msg-${Date.now()}`,
                  content: message,
                  sender: "user",
                  timestamp: new Date().toISOString(),
                  isAI: false,
                },
              ],
            }
          : chat,
      ),
    )
    
    // We just need to refresh the messages for this chat after a short delay
    setTimeout(() => {
      // Find the selected conversation to get its name
      const selectedConversation = conversations.find(c => c.id === chatId);
      if (selectedConversation) {
        // Clear the cache for this conversation so we reload fresh messages
        const cacheKey = `${chatId}:${selectedConversation.name || ''}`;
        loadedMessagesRef.current[cacheKey] = false;
        
        // Reload messages for this chat with its name
        loadMessages(chatId, selectedConversation.name);
      }
    }, 1000);
  }

  // Manually connect to Verida if not already connected
  const handleConnectVerida = async () => {
    try {
      setIsLoading(true);
      
      if (client && !client.isConnected()) {
        await client.connect();
        const did = await getDidId();
        if (did) {
          setUserDid(did);
          toast({
            title: "Connected to Verida",
            description: "Successfully connected to your blockchain wallet.",
          });
          await loadChatGroups();
        }
      }
    } catch (error) {
      console.error("Failed to connect to Verida:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to your blockchain wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[600px] overflow-hidden">
      {/* Chat List */}
      {showChatList && (
        <motion.div
          className="w-full md:w-1/3 lg:w-1/4 md:min-w-[300px] h-full"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <ChatList 
            conversations={conversations} 
            selectedChatId={selectedChat} 
            onSelectChat={handleSelectChat} 
            isLoading={isLoading || veridaLoading}
            onRefresh={handleConnectVerida}
          />
        </motion.div>
      )}

      {/* Conversation Panel */}
      {selectedChat && !showChatList && (
        <div className="md:hidden absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToList}
            className="bg-white/80 hover:bg-pink-50 text-pink-600 rounded-full h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      )}

      {selectedChat ? (
        <motion.div
          className="flex-1 h-full"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          {(() => {
            const selectedConversation = conversations.find((c) => c.id === selectedChat);
            return selectedConversation ? (
              <ConversationPanel
                conversation={selectedConversation}
                onSendMessage={(message) => handleSendMessage(selectedChat, message)}
              />
            ) : null;
          })()}
        </motion.div>
      ) : (
        !isMobile && (
          <div className="flex-1 h-full flex items-center justify-center">
            <div className="text-center p-8 backdrop-blur-xl bg-white/60 rounded-[2rem] border border-pink-200 max-w-md">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Select a conversation</h3>
              <p className="text-slate-600">
                Choose a chat from the list to start messaging or let your AI twin assist you with the conversation.
              </p>
            </div>
          </div>
        )
      )}
    </div>
  )
}
