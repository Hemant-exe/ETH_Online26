"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useAnimation, AnimatePresence } from "framer-motion"
import { MessageSquare, Brain, Shield, Zap, Users, Heart, Sparkles, Cpu, Network, Lock, ArrowRight, Star, UserCircle2, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useMobile } from "@/hooks/use-mobile"
import Link from "next/link"

const chatMessages = [
  { role: "user", message: "I'm looking for someone who loves hiking and photography" },
  {
    role: "ai",
    message:
      "Based on your interests, I've found 3 potential matches who share your passion for outdoor activities and photography.",
  },
  { role: "user", message: "That sounds great! What else do they enjoy?" },
  {
    role: "ai",
    message:
      "Match #1 also enjoys cooking Italian food and playing guitar. Match #2 is into rock climbing and travel photography. Match #3 loves camping and landscape photography.",
  },
  { role: "user", message: "I'd like to know more about Match #2" },
  {
    role: "ai",
    message:
      "Great choice! Match #2 has traveled to 12 countries, specializes in adventure photography, and hosts a small photography workshop. Would you like me to initiate a conversation?",
  },
]

const suggestionMessages = [
  "They mentioned they love Italian cuisine. Maybe share your favorite pasta dish?",
  "This would be a good time to ask about their recent hiking trip they mentioned earlier.",
  "They seem interested in your photography. Consider sharing some of your favorite shots.",
  "Their profile shows they're passionate about environmental causes. This could be a good conversation topic.",
  "They've mentioned feeling nervous about first dates. A casual coffee meetup might be perfect to suggest.",
]

export default function AiTwinSection() {
  const isMobile = useMobile()
  const [currentChatIndex, setCurrentChatIndex] = useState(0)
  const [currentSuggestion, setCurrentSuggestion] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [typedText, setTypedText] = useState("")
  const controls = useAnimation()
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [activeTab, setActiveTab] = useState("assistant")

  // Handle mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Typing animation effect
  useEffect(() => {
    if (currentChatIndex < chatMessages.length) {
      const message = chatMessages[currentChatIndex].message
      let i = 0
      setIsTyping(true)
      setTypedText("")

      const typingInterval = setInterval(() => {
        if (i < message.length) {
          setTypedText((prev) => prev + message[i])
          i++
        } else {
          clearInterval(typingInterval)
          setIsTyping(false)
          setTimeout(() => {
            setCurrentChatIndex((prev) => prev + 1)
          }, 1500)
        }
      }, 30)

      return () => clearInterval(typingInterval)
    }
  }, [currentChatIndex])

  // Rotate through suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % suggestionMessages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Scroll to bottom of chat when new messages appear
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [typedText])

  // Reset chat after all messages are shown
  useEffect(() => {
    if (currentChatIndex >= chatMessages.length) {
      const timeout = setTimeout(() => {
        setCurrentChatIndex(0)
      }, 5000)

      return () => clearTimeout(timeout)
    }
  }, [currentChatIndex])

  // Animation for the agent connections
  useEffect(() => {
    controls.start({
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      },
    })
  }, [controls])

  // Generate particles for the background
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }))

  const features = [
    {
      icon: <Lock className="w-5 h-5 text-white" />,
      title: "Privacy Protected",
      description: "Your data stays encrypted and secure throughout your dating journey",
      color: "from-[#6D28D9] to-[#8B5CF6]"
    },
    {
      icon: <Zap className="w-5 h-5 text-white" />,
      title: "Smart Suggestions",
      description: "Get real-time conversation guidance that helps you connect",
      color: "from-[#EC4899] to-[#F472B6]"
    },
    {
      icon: <Network className="w-5 h-5 text-white" />,
      title: "Match Finding",
      description: "Discovers compatible partners based on deeper compatibility",
      color: "from-[#6D28D9] to-[#8B5CF6]"
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-white" />,
      title: "Conversation Coach",
      description: "Personalized advice to improve your dating interactions",
      color: "from-[#EC4899] to-[#F472B6]"
    }
  ];

  const capabilities = [
    {
      icon: <UserCircle2 className="w-6 h-6 text-white" />,
      title: "Profile Completion",
      description: "Enhances your dating profile with personalized suggestions",
    },
    {
      icon: <Shield className="w-6 h-6 text-white" />,
      title: "Privacy Guardian",
      description: "Protects your sensitive information while dating online",
    },
    {
      icon: <Star className="w-6 h-6 text-white" />,
      title: "Match Selection",
      description: "Analyzes compatibility beyond surface-level preferences",
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-white" />,
      title: "Conversation Helper",
      description: "Suggests topics and responses to keep connections strong",
    },
    {
      icon: <Gift className="w-6 h-6 text-white" />,
      title: "Date Planner",
      description: "Recommends perfect date ideas based on shared interests",
    },
    {
      icon: <Heart className="w-6 h-6 text-white" />,
      title: "Relationship Coach",
      description: "Provides guidance as your relationship develops",
    },
  ];

  return (
    <section id="your-personal-ai-twin" className="relative bg-gradient-to-b from-[#F9F5FF] to-white py-24 md:py-32 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-[#6D28D9]/20 to-[#EC4899]/20"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Number.POSITIVE_INFINITY,
              delay: particle.delay,
              ease: "linear",
            }}
          />
        ))}
      </div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6D28D9]/30 to-transparent"></div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header with animated badge */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#6D28D9]/10 to-[#EC4899]/10 border border-[#6D28D9]/30 text-sm font-medium text-[#EC4899] mb-6"
              animate={{ 
                boxShadow: ['0 0 0 rgba(236, 72, 153, 0)', '0 0 20px rgba(236, 72, 153, 0.5)', '0 0 0 rgba(236, 72, 153, 0)'] 
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Cpu className="h-3.5 w-3.5 mr-2" />
              AI Technology
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-[#1F2937]">
              Your Personal{" "}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#EC4899]">
                  AI Twin
                </span>
                <motion.span 
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#6D28D9] to-[#EC4899] rounded-full"
                  initial={{ width: 0, left: "50%" }}
                  whileInView={{ width: "100%", left: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  viewport={{ once: true }}
                />
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-[#4B5563] max-w-2xl mx-auto">
              Meet your AI companion that works behind the scenes to find your perfect match and guide your dating journey.
            </p>
          </motion.div>
        </div>

        {/* Main content container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          {/* Left section - Features and capabilities */}
          <div className="lg:col-span-4">
            {/* Features cards - redesigned with more visual appeal */}
            <motion.div
              className="space-y-5 mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-6">
                <div className="h-8 w-1 bg-gradient-to-b from-[#6D28D9] to-[#EC4899] rounded-full mr-3"></div>
                <h3 className="text-2xl font-bold text-[#1F2937]">Key Features</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {features.map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="relative overflow-hidden group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#6D28D9]/5 to-[#EC4899]/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all p-5 relative z-10">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center flex-shrink-0`}>
                          {feature.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#1F2937] text-lg mb-1">{feature.title}</h4>
                          <p className="text-sm text-[#6B7280]">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Create AI Twin button - animated with gradient border */}
            <motion.div
              className="relative mt-8 group"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6D28D9] to-[#EC4899] rounded-xl opacity-75 blur group-hover:opacity-100 transition duration-200"></div>
              <Link href="/wallet">
                <Button className="relative w-full bg-gradient-to-r from-[#6D28D9] to-[#EC4899] text-white py-6 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-200">
                  <span className="flex items-center text-lg">
                    Create Your AI Twin
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Middle Section - Interactive AI Twin Visualization */}
          <motion.div
            className="lg:col-span-4 relative z-20 mt-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative mx-auto max-w-md">
              {/* Glowing background */}
              <div className="absolute -inset-6 bg-gradient-to-r from-[#6D28D9]/20 to-[#EC4899]/20 rounded-[30px] blur-xl opacity-70"></div>
              
              {/* Main visualization card */}
              <div className="relative bg-white rounded-[24px] shadow-xl overflow-hidden p-6 border border-[#E5E7EB]">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F9F5FF]/50 to-white"></div>
                
                <div className="relative aspect-square">
                  {/* Circular pulse animations */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      className="w-[90%] h-[90%] rounded-full border border-[#6D28D9]/20"
                      animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    ></motion.div>
                    <motion.div
                      className="absolute w-[70%] h-[70%] rounded-full border border-[#EC4899]/20"
                      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    ></motion.div>
                    <motion.div
                      className="absolute w-[50%] h-[50%] rounded-full border border-[#6D28D9]/20"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    ></motion.div>
                  </div>

                  {/* Central user node - enhanced with better shadow and animation */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#EC4899] p-[3px] z-20"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: 0.3,
                      type: "spring",
                      stiffness: 100
                    }}
                    style={{
                      boxShadow: "0 0 20px rgba(236, 72, 153, 0.5)",
                      transform: `translate(-50%, -50%) translate(${(mousePosition.x - window.innerWidth / 2) / 50}px, ${(mousePosition.y - window.innerHeight / 2) / 50}px)`,
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-30">
                        <motion.div 
                          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EC4899] to-transparent"
                          animate={{ x: [-100, 100, -100] }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        ></motion.div>
                        <motion.div 
                          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6D28D9] to-transparent"
                          animate={{ x: [100, -100, 100] }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        ></motion.div>
                        <motion.div 
                          className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#EC4899] to-transparent"
                          animate={{ y: [-100, 100, -100] }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        ></motion.div>
                        <motion.div 
                          className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#6D28D9] to-transparent"
                          animate={{ y: [100, -100, 100] }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        ></motion.div>
                      </div>

                      <div className="relative z-10 text-center">
                        <div className="relative">
                          <Brain className="w-12 h-12 mx-auto mb-2 text-[#EC4899]" />
                          <motion.div 
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#EC4899]"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>
                        <span className="text-sm font-bold text-[#1F2937]">Your AI Twin</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Enhanced SVG connection lines with better animations */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                    <defs>
                      <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(236, 72, 153, 0.6)" />
                        <stop offset="100%" stopColor="rgba(109, 40, 217, 0.6)" />
                      </linearGradient>
                      <linearGradient id="gradientParticle" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#EC4899" />
                        <stop offset="100%" stopColor="#6D28D9" />
                      </linearGradient>
                      
                      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    
                    {/* Connection lines with improved animation */}
                    {[
                      { x1: 200, y1: 200, x2: 100, y2: 100, duration: "2s", delay: "0s" },
                      { x1: 200, y1: 200, x2: 300, y2: 100, duration: "2.5s", delay: "0.1s" },
                      { x1: 200, y1: 200, x2: 320, y2: 200, duration: "3s", delay: "0.2s" },
                      { x1: 200, y1: 200, x2: 300, y2: 300, duration: "2.2s", delay: "0.3s" },
                      { x1: 200, y1: 200, x2: 100, y2: 300, duration: "2.7s", delay: "0.4s" },
                      { x1: 200, y1: 200, x2: 80, y2: 200, duration: "2.3s", delay: "0.5s" },
                    ].map((line, i) => (
                      <g key={i} filter="url(#glow)">
                        <line
                          x1={line.x1}
                          y1={line.y1}
                          x2={line.x2}
                          y2={line.y2}
                          stroke="url(#gradientLine)"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        >
                          <animate attributeName="stroke-dashoffset" from="0" to="20" dur={line.duration} repeatCount="indefinite" />
                        </line>
                        <circle r="3.5" fill="url(#gradientParticle)">
                          <animateMotion 
                            path={`M${line.x1},${line.y1} L${line.x2},${line.y2}`} 
                            dur={`${parseFloat(line.duration) * 1.5}s`} 
                            repeatCount="indefinite" 
                            begin={line.delay}
                          />
                        </circle>
                      </g>
                    ))}
                  </svg>

                  {/* Enhanced satellite nodes */}
                  {[
                    { top: "25%", left: "25%", color: "from-[#6D28D9]/90 to-[#6D28D9]/60", icon: <Users className="w-7 h-7 text-[#6D28D9]" /> },
                    { top: "25%", left: "75%", color: "from-[#EC4899]/90 to-[#EC4899]/60", icon: <Users className="w-7 h-7 text-[#EC4899]" /> },
                    { top: "75%", left: "75%", color: "from-[#6D28D9]/90 to-[#6D28D9]/60", icon: <Users className="w-7 h-7 text-[#6D28D9]" /> },
                    { top: "75%", left: "25%", color: "from-[#EC4899]/90 to-[#EC4899]/60", icon: <Users className="w-7 h-7 text-[#EC4899]" /> },
                  ].map((node, i) => (
                    <motion.div 
                      key={i}
                      className={`absolute top-[${node.top}] left-[${node.left}] transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-r ${node.color} p-[2px] z-10`}
                      whileHover={{ scale: 1.15, boxShadow: "0 0 15px rgba(236, 72, 153, 0.3)" }}
                      transition={{ duration: 0.2 }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{ 
                        boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                        transition: "all 0.3s ease" 
                      }}
                    >
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                        {node.icon}
                      </div>
                    </motion.div>
                  ))}

                  {/* Floating icons with improved animations */}
                  <motion.div 
                    className="absolute top-[40%] left-[40%] transform -translate-x-1/2 -translate-y-1/2"
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, 0, -5, 0],
                      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <motion.div 
                      className="p-2 rounded-full bg-gradient-to-r from-[#EC4899]/30 to-[#EC4899]/10 shadow-md"
                      whileHover={{ scale: 1.2, boxShadow: "0 0 20px rgba(236, 72, 153, 0.5)" }}
                    >
                      <Heart className="w-6 h-6 text-[#EC4899]" />
                    </motion.div>
                  </motion.div>

                  <motion.div 
                    className="absolute top-[60%] left-[60%] transform -translate-x-1/2 -translate-y-1/2"
                    animate={{ 
                      y: [0, -12, 0],
                      rotate: [0, -5, 0, 5, 0],
                      transition: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
                    }}
                  >
                    <motion.div 
                      className="p-2 rounded-full bg-gradient-to-r from-[#6D28D9]/30 to-[#6D28D9]/10 shadow-md"
                      whileHover={{ scale: 1.2, boxShadow: "0 0 20px rgba(109, 40, 217, 0.5)" }}
                    >
                      <Shield className="w-6 h-6 text-[#6D28D9]" />
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Section - AI Chat Interface */}
          <motion.div
            className="lg:col-span-4 flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#6D28D9]/40 to-[#EC4899]/40 rounded-2xl blur-lg opacity-75"></div>
              <div className="relative bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden">
                {/* Chat interface tabs */}
                <div className="flex border-b border-[#E5E7EB]">
                  {["assistant", "coach", "matcher"].map((tab) => (
                    <button
                      key={tab}
                      className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
                        activeTab === tab 
                          ? "text-[#6D28D9]" 
                          : "text-[#6B7280] hover:text-[#1F2937]"
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab === "assistant" && "AI Assistant"}
                      {tab === "coach" && "Dating Coach"}
                      {tab === "matcher" && "Match Finder"}
                      
                      {activeTab === tab && (
                        <motion.div 
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6D28D9] to-[#EC4899]"
                          layoutId="activeTab"
                          initial={false}
                        />
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Chat header */}
                <div className="bg-gradient-to-r from-[#6D28D9]/10 to-[#EC4899]/10 p-4 border-b border-[#E5E7EB]">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#EC4899] p-[2px] mr-3 shadow-md">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative overflow-hidden">
                        <Brain className="w-5 h-5 text-[#EC4899]" />
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-[#6D28D9]/10 to-[#EC4899]/10 opacity-0"
                          animate={{ opacity: [0, 0.5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1F2937]">Your AI Twin Assistant</h3>
                      <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                        <span className="text-xs text-[#6B7280]">Online | Ready to help</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat messages - with improved styling */}
                <div 
                  ref={chatContainerRef} 
                  className="p-5 h-72 overflow-y-auto flex flex-col space-y-4 bg-[#F9F5FF]/50 custom-scrollbar"
                >
                  {chatMessages.slice(0, currentChatIndex).map((chat, index) => (
                    <motion.div 
                      key={index} 
                      className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {chat.role === "ai" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6D28D9]/80 to-[#EC4899]/80 p-[1px] mr-2 flex-shrink-0 self-end">
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                            <Brain className="w-4 h-4 text-[#EC4899]" />
                          </div>
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          chat.role === "user"
                            ? "bg-gradient-to-r from-[#6D28D9] to-[#EC4899] text-white shadow-md"
                            : "bg-white border border-[#E5E7EB] text-[#1F2937] shadow-sm"
                        }`}
                      >
                        <p className="text-sm">{chat.message}</p>
                      </div>
                      
                      {chat.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#EC4899] ml-2 flex-shrink-0 self-end">
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                            <span className="text-xs font-bold text-[#EC4899]">YOU</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {currentChatIndex < chatMessages.length && (
                    <motion.div
                      className={`flex ${chatMessages[currentChatIndex].role === "user" ? "justify-end" : "justify-start"}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {chatMessages[currentChatIndex].role === "ai" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6D28D9]/80 to-[#EC4899]/80 p-[1px] mr-2 flex-shrink-0 self-end">
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                            <Brain className="w-4 h-4 text-[#EC4899]" />
                          </div>
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          chatMessages[currentChatIndex].role === "user"
                            ? "bg-gradient-to-r from-[#6D28D9] to-[#EC4899] text-white shadow-md"
                            : "bg-white border border-[#E5E7EB] text-[#1F2937] shadow-sm"
                        }`}
                      >
                        <p className="text-sm">
                          {typedText}
                          {isTyping && (
                            <motion.span 
                              className="inline-block ml-1 text-sm opacity-75"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              |
                            </motion.span>
                          )}
                        </p>
                      </div>
                      
                      {chatMessages[currentChatIndex].role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#EC4899] ml-2 flex-shrink-0 self-end">
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                            <span className="text-xs font-bold text-[#EC4899]">YOU</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Suggestion box - improved design */}
                <div className="p-4 border-t border-[#E5E7EB] bg-gradient-to-r from-[#F9F5FF]/80 to-white">
                  <div className="flex">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#EC4899] flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-medium text-[#6B7280]">Smart Suggestion</p>
                        <div className="flex space-x-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div 
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                i === currentSuggestion % 5 
                                  ? "bg-gradient-to-r from-[#6D28D9] to-[#EC4899]" 
                                  : "bg-[#E5E7EB]"
                              }`}
                            ></div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-[#E5E7EB]">
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={currentSuggestion}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="text-sm text-[#1F2937]"
                          >
                            {suggestionMessages[currentSuggestion]}
                          </motion.p>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat input - improved design */}
                <div className="p-4 border-t border-[#E5E7EB] bg-white">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="w-full bg-[#F9F5FF] border border-[#E5E7EB] rounded-full pl-4 pr-10 py-3 text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/50 transition-all"
                      />
                      <button className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-[#6D28D9]/20 to-[#EC4899]/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-[#EC4899]" />
                      </button>
                    </div>
                    <motion.button 
                      className="h-12 w-12 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#EC4899] flex items-center justify-center shadow-md"
                      whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(236, 72, 153, 0.5)" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* AI Twin Capabilities Section
        <motion.div
          className="mt-24 md:mt-32"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <motion.h3 
              className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              What Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#EC4899]">AI Twin</span> Can Do
            </motion.h3>
            <motion.p
              className="text-lg text-[#4B5563] max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Your AI Twin works tirelessly behind the scenes to enhance your dating experience in multiple ways
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {capabilities.map((capability, index) => (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6D28D9]/0 to-[#EC4899]/0 rounded-xl opacity-75 blur group-hover:from-[#6D28D9]/20 group-hover:to-[#EC4899]/20 transition duration-300"></div>
                <div className="relative bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 overflow-hidden">
                  <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-br from-[#6D28D9]/5 to-[#EC4899]/5 rounded-bl-[100px] -mr-10 -mt-10 transition-all group-hover:scale-110"></div>
                  
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-r from-[#6D28D9] to-[#EC4899] flex items-center justify-center mb-5">
                    {capability.icon}
                  </div>
                  
                  <h4 className="text-xl font-bold text-[#1F2937] mb-3">{capability.title}</h4>
                  <p className="text-[#6B7280]">{capability.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div> */}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EC4899]/30 to-transparent"></div>
    </section>
  )
}

