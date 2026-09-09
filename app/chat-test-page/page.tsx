"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useVeridaClient } from "@/app/lib/clientside-verida"
import { 
  saveMessage, 
  getMessages, 
  createChatGroup, 
  getChatGroups,
  convertToVeridaMessage,
  convertFromVeridaMessage,
  createChatGroupId,
  createChatGroupName
} from "@/app/lib/chat-message-service"
import { toast } from "@/hooks/use-toast"
import { Loader2, MessageSquare, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ChatTestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [userDid, setUserDid] = useState<string | null>(null)
  const [userName, setUserName] = useState("Test User")
  const [targetDid, setTargetDid] = useState("")
  const [targetName, setTargetName] = useState("")
  const [message, setMessage] = useState("")
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
  const [chatGroups, setChatGroups] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const { client, isLoading: veridaLoading, getDidId } = useVeridaClient()

  // Store messages by group ID to keep separate message histories
  const [messagesByGroup, setMessagesByGroup] = useState<Record<string, any[]>>({})

  // Get user DID when client is loaded
  useEffect(() => {
    if (!veridaLoading && client) {
      loadUserInfo()
    }
  }, [veridaLoading, client])

  // Load user info
  const loadUserInfo = async () => {
    try {
      if (client) {
        // Connect if not already connected
        if (!client.isConnected()) {
          await client.connect()
        }
        
        const did = await getDidId()
        setUserDid(did)
        
        // Try to get stored username
        const storedName = localStorage.getItem("testUserName")
        if (storedName) {
          setUserName(storedName)
        }
      }
    } catch (error) {
      console.error("Failed to load user info:", error)
      toast({
        title: "Connection Error",
        description: "Failed to connect to Verida network. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Save username to localStorage
  const saveUserName = () => {
    localStorage.setItem("testUserName", userName)
    toast({
      title: "Name Saved",
      description: "Your display name has been saved.",
    })
  }

  // Load user's chat groups
  const loadChatGroups = async () => {
    setIsLoading(true)
    try {
      if (!userDid) {
        throw new Error("User not authenticated")
      }
      
      const groups = await getChatGroups()
      console.log("Loaded chat groups:", groups)
      
      // Group chats by name to avoid duplicates in UI
      const groupsByName: Record<string, any> = {};
      groups.forEach(group => {
        const groupName = group.name || 'Unnamed Group';
        // Keep only the most recent group with this name
        if (!groupsByName[groupName] || new Date(group.updatedAt) > new Date(groupsByName[groupName].updatedAt)) {
          groupsByName[groupName] = group;
        }
      });
      
      // Convert back to array
      const uniqueGroups = Object.values(groupsByName);
      setChatGroups(uniqueGroups)
      
      toast({
        title: "Groups Loaded",
        description: `Loaded ${uniqueGroups.length} chat groups.`,
      })
    } catch (error) {
      console.error("Failed to load chat groups:", error)
      toast({
        title: "Error Loading Groups",
        description: "Failed to load your conversations.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Create a new chat group
  const handleCreateGroup = async () => {
    if (!userDid || !targetDid || !targetName) {
      toast({
        title: "Missing Information",
        description: "Please enter both target DID and name.",
        variant: "destructive",
      })
      return
    }
    
    // Validate DIDs
    if (!targetDid.startsWith('did:')) {
      toast({
        title: "Invalid DID Format",
        description: "Target DID must start with 'did:' prefix.",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
    try {
      // Try to create a consistent group ID first
      let groupId
      try {
        groupId = createChatGroupId(userDid, targetDid)
        console.log("Created group ID:", groupId)
      } catch (idError) {
        console.error("Failed to create group ID:", idError)
        throw new Error(`Invalid DIDs: ${idError instanceof Error ? idError.message : String(idError)}`)
      }
      
      // Create group name
      const groupName = createChatGroupName(userDid, userName, targetDid, targetName)
      
      // Create participants array
      const participants = [
        { did: userDid, name: userName },
        { did: targetDid, name: targetName }
      ]
      
      // Check if there's an existing group with this ID
      let shouldCreateNewGroup = true
      const existingGroups = await getChatGroups()
      for (const group of existingGroups) {
        if (group.id === groupId) {
          shouldCreateNewGroup = false
          console.log("Found existing group with ID:", groupId)
          break
        }
      }
      
      // Create group if needed, otherwise use existing
      if (shouldCreateNewGroup) {
        // Create initial message to establish the group
        const initialMessage = {
          id: `msg-${Date.now()}`,
          content: "Chat conversation created",
          sender: "user",
          timestamp: new Date().toISOString(),
          isAI: false,
        }
        
        // Convert to Verida format
        const veridaMessage = convertToVeridaMessage(
          initialMessage,
          groupId,
          userDid,
          userName
        )
        
        // Add group name
        veridaMessage.groupName = groupName
        
        // Save message to establish the group
        await saveMessage(veridaMessage)
        console.log("Created new conversation with message:", veridaMessage)
        
        toast({
          title: "Group Created",
          description: "New conversation has been created!",
        })
      } else {
        toast({
          title: "Using Existing Group",
          description: "Connected to existing conversation.",
        })
      }
      
      // Set as active group
      setActiveGroupId(groupId)
      
      // Reload groups
      await loadChatGroups()
      
      // Load messages for this group
      await loadMessages(groupId)
    } catch (error) {
      console.error("Failed to create group:", error)
      toast({
        title: "Error Creating Group",
        description: error instanceof Error ? error.message : "Failed to create new conversation.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load messages for a specific group
  const loadMessages = async (groupId: string, groupName?: string) => {
    setIsLoading(true);
    try {
      // Display the group ID for debugging
      console.log(`Loading messages for group: ${groupId}, name: ${groupName || 'unknown'}`);
      
      // Get messages from Verida with groupName filter
      const chatMessages = await getMessages(groupId, groupName);
      
      console.log(`Loaded ${chatMessages.length} messages for group ${groupId} with name ${groupName || 'unknown'}`);
      
      if (chatMessages.length > 0) {
        console.log("First message sample:", chatMessages[0]);
      }
      
      // Convert to app format
      const formattedMessages = chatMessages.map((msg: any) => 
        convertFromVeridaMessage(msg, userDid || "")
      );
      
      // Store messages for this specific group ID and name
      const groupKey = groupName ? `${groupId}:${groupName}` : groupId;
      setMessagesByGroup(prev => ({
        ...prev,
        [groupKey]: formattedMessages
      }));
      
      // Set active group
      setActiveGroupId(groupId);
      setActiveGroupName(groupName || '');
      
      toast({
        title: "Messages Loaded",
        description: `Loaded ${formattedMessages.length} messages.`,
      });
    } catch (error) {
      console.error("Failed to load messages:", error);
      
      // More informative error message with details
      let errorMessage = "Failed to load messages";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      toast({
        title: "Error Loading Messages",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add state for active group name
  const [activeGroupName, setActiveGroupName] = useState<string>('');

  // Get current messages for the active group
  const groupKey = activeGroupName ? `${activeGroupId}:${activeGroupName}` : (activeGroupId || '');
  const currentMessages = groupKey ? messagesByGroup[groupKey] || [] : [];

  // Send a message
  const handleSendMessage = async () => {
    if (!message.trim() || !activeGroupId || !userDid) {
      toast({
        title: "Missing Information",
        description: "Please select a conversation and enter a message.",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
    try {
      // Get the active group to include its name
      const activeGroup = chatGroups.find(group => group.id === activeGroupId);
      if (!activeGroup) {
        throw new Error("Active group not found");
      }
      
      // Create message object
      const messageObj = {
        id: `msg-${Date.now()}`,
        content: message,
        sender: "user",
        timestamp: new Date().toISOString(),
        isAI: false,
      }
      
      // Convert to Verida format
      const veridaMessage = convertToVeridaMessage(
        messageObj,
        activeGroupId,
        userDid,
        userName
      )
      
      // Add group name to ensure message goes to the correct group record
      veridaMessage.groupName = activeGroupName || activeGroup.name;
      
      // Save message
      await saveMessage(veridaMessage)
      console.log("Message sent:", veridaMessage)
      
      // Clear message input
      setMessage("")
      
      // Reload messages for this specific group
      await loadMessages(activeGroupId, activeGroupName || activeGroup.name)
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent and stored in Verida.",
      })
    } catch (error) {
      console.error("Failed to send message:", error)
      toast({
        title: "Error Sending Message",
        description: "Failed to send your message.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Verida Chat Message Test</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>Your identity for testing chat messages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your DID</label>
              <div className="flex items-center gap-2">
                <Input value={userDid || "Not connected"} readOnly />
                <Button 
                  onClick={loadUserInfo} 
                  disabled={isLoading || veridaLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Display Name</label>
              <div className="flex items-center gap-2">
                <Input 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)} 
                  placeholder="Enter your name"
                />
                <Button onClick={saveUserName}>Save</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* New Conversation */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Conversation</CardTitle>
            <CardDescription>Start a chat with another user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target User DID</label>
              <Input 
                value={targetDid} 
                onChange={(e) => setTargetDid(e.target.value)} 
                placeholder="Enter target user DID (e.g., did:vda:0x...)"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Target User Name</label>
              <Input 
                value={targetName} 
                onChange={(e) => setTargetName(e.target.value)} 
                placeholder="Enter target user name"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              onClick={handleCreateGroup} 
              disabled={isLoading || !userDid || !targetDid || !targetName}
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-2" />}
              Create Chat
            </Button>
            
            <Button
              variant="outline"
              onClick={loadChatGroups}
              disabled={isLoading || !userDid}
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Users className="h-4 w-4 mr-2" />}
              Load My Chats
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 mt-8">
        {/* Chat Groups List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Your Conversations</CardTitle>
            <CardDescription>Select a conversation to view messages</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                </div>
              ) : chatGroups.length > 0 ? (
                <div className="space-y-2">
                  {chatGroups.map((group) => (
                    <div 
                      key={group.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        activeGroupId === group.id && activeGroupName === group.name
                          ? "bg-pink-100 border-pink-200" 
                          : "hover:bg-gray-100 border-transparent"
                      } border`}
                      onClick={() => loadMessages(group.id, group.name)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-medium">{group.name}</span>
                          <span className="text-xs text-gray-500">
                            {group.participants.length} participants
                          </span>
                          <span className="text-xs text-gray-500">
                            Last activity: {new Date(group.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No conversations found</p>
                  <p className="text-sm mt-2">Create a new conversation or load your chats</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Messages */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Messages</CardTitle>
            <CardDescription>
              {activeGroupId 
                ? `Viewing conversation ${activeGroupId}` 
                : "Select a conversation to view messages"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                </div>
              ) : currentMessages.length > 0 ? (
                <div className="space-y-4">
                  {currentMessages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.sender === "user" 
                          ? "bg-pink-100 ml-auto max-w-[80%]" 
                          : "bg-gray-100 mr-auto max-w-[80%]"
                      }`}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          {msg.sender === "user" ? "You" : "Other User"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  ))}
                </div>
              ) : activeGroupId ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No messages in this conversation</p>
                  <p className="text-sm mt-2">Start sending messages below</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Select a conversation to view messages</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <Separator />
          <CardFooter className="flex flex-col space-y-2 pt-4">
            <Textarea 
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!activeGroupId || isLoading}
              className="w-full resize-none"
            />
            <div className="flex justify-end w-full">
              <Button
                onClick={handleSendMessage}
                disabled={!activeGroupId || !message.trim() || isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                Send Message
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 