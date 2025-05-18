"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, ArrowRight, Heart, UserCircle, Lock, Fingerprint, HeartPulse, Flame, Zap, Sparkles, Star, CheckCircle, Stars, Database, Server, Brain, Wallet, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { checkNFTAndRedirect } from "@/utils/nft-check"
import { formatAddress, connectLeap, disconnectLeap, isLeapWalletInstalled } from "@/utils/wallet"

interface HeroSectionProps {
  sectionRef: (el: HTMLElement | null) => void
}

export default function HeroSection({ sectionRef }: HeroSectionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Handle Enter App button click
  const handleEnterApp = async () => {
    await checkNFTAndRedirect();
  };
  
  // Handle wallet connection
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      if (!isLeapWalletInstalled()) {
        window.open("https://www.leapwallet.io/", "_blank");
        alert("Please install Leap wallet and reload the page");
        return;
      }
      
      const address = await connectLeap();
      if (address) {
        setIsConnected(true);
        setWalletAddress(address);
        localStorage.setItem("walletAddress", address);
        await checkNFTAndRedirect();
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Handle wallet disconnection
  const handleDisconnectWallet = async () => {
    try {
      await disconnectLeap();
      setIsConnected(false);
      setWalletAddress("");
      localStorage.removeItem("walletAddress");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };
  
  // Check wallet connection status on component mount
  useEffect(() => {
    const storedAddress = localStorage.getItem("walletAddress");
    if (storedAddress) {
      setIsConnected(true);
      setWalletAddress(storedAddress);
    }
    
    // Listen for wallet connection changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "walletAddress") {
        if (e.newValue) {
          setIsConnected(true);
          setWalletAddress(e.newValue);
        } else {
          setIsConnected(false);
          setWalletAddress("");
        }
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  
  const sponsors = [
    {
      name: "Cheqd",
      logo: "/placeholder.svg",
      color: "from-purple-600 to-indigo-700",
      description: "Ensuring blockchain integrity and security with next-generation identity solutions.",
      website: "https://cheqd.io",
      role: "Verifiable AI",
      icon: Brain
    },
    {
      name: "Verida",
      logo: "/placeholder.svg",
      color: "from-pink-600 to-purple-700",
      description: "Empowering decentralized identities through innovative blockchain technology.",
      website: "https://www.verida.network",
      role: "Secure Data Storage",
      icon: Database
    },
  ];

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-screen pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-b from-white to-purple-50/30"
    >
      {/* Enhanced background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-full h-full bg-grid-pattern opacity-[0.025]"></div>
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-purple-200/20 to-transparent rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-pink-200/20 to-transparent rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#6D28D9]/10 to-[#EC4899]/10 border border-[#6D28D9]/30 text-sm font-medium text-[#EC4899] mb-6">
                <Shield className="h-3.5 w-3.5 mr-2" />
                Secure. Private. Decentralized.
              </div>

              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-[#1F2937]">
                Discover Love on the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#EC4899]">
                  Decentralized Frontier
                </span>
              </h1>

              <p className="text-lg md:text-xl text-[#4B5563] max-w-3xl mx-auto mb-10">
                Powered by the security of Cheqd and the trust of Verida.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {!isConnected ? (
                  <>
                    <Button
                      size="lg"
                      onClick={handleConnectWallet}
                      disabled={isConnecting}
                      className="bg-gradient-to-r from-[#6D28D9] to-[#EC4899] text-white hover:opacity-90 group relative overflow-hidden rounded-xl"
                    >
                      <span className="absolute inset-0 bg-pattern opacity-20"></span>
                      <span className="relative flex items-center">
                        {isConnecting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Connecting...
                          </>
                        ) : (
                          <>
                            Connect Wallet
                            <Wallet className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </span>
                    </Button>
                    
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-[#6D28D9]/30 text-[#6D28D9] hover:bg-[#6D28D9]/10 rounded-xl"
                    >
                      <Link href="https://github.com/hiten1010/Dating-Blockchain">
                        Learn More
                      </Link>
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-[#6D28D9] to-[#EC4899] text-white hover:opacity-90 group relative overflow-hidden rounded-xl"
                      onClick={handleEnterApp}
                    >
                      <span className="absolute inset-0 bg-pattern opacity-20"></span>
                      <span className="relative flex items-center">
                        Join the Revolution
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleDisconnectWallet}
                      className="border-[#6D28D9]/30 text-[#6D28D9] hover:bg-[#6D28D9]/10 rounded-xl"
                    >
                      <span className="flex items-center">
                        {formatAddress(walletAddress)}
                        <LogOut className="ml-2 h-4 w-4" />
                      </span>
                    </Button>
                  </div>  
                )}
              </div>

              {/* <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#EC4899] flex items-center justify-center text-xs text-white font-medium border-2 border-white"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                
              </div>  */}
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              {/* Main illustration - creative blob shape with 3D effect */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#6D28D9]/20 to-[#EC4899]/20 rounded-blob-3 blur-lg"></div>
                <div className="relative bg-white rounded-blob-3 shadow-xl overflow-hidden p-6">
                  <div className="absolute inset-0 bg-pattern opacity-5"></div>

                  {/* 3D floating elements */}
                  <div className="relative h-[350px] w-full">
                    {/* Floating profile cards */}
                    <div className="absolute top-[25%] left-[5%] w-48 transform rotate-[-5deg] animate-float-slow">
                      <div className="bg-white rounded-xl shadow-lg p-4 border border-[#E5E7EB]">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#EC4899] flex items-center justify-center">
                            <UserCircle className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">NFT Profile #3872</h3>
                            <div className="flex items-center text-xs text-[#EC4899]">
                              <Shield className="h-3 w-3 mr-1" />
                              <span>Verified</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-[#F9F5FF] p-1 rounded-full">
                              <div className="h-3 w-3" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-[10%] right-[2%] w-56 transform rotate-[5deg] animate-float">
                      <div className="bg-white rounded-xl shadow-lg p-4 border border-[#E5E7EB]">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#EC4899] flex items-center justify-center">
                            <UserCircle className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">NFT Profile #4291</h3>
                            <div className="flex items-center text-xs text-[#EC4899]">
                              <Shield className="h-3 w-3 mr-1" />
                              <span>Verified</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-[#F9F5FF] rounded p-2 text-xs">
                            <span className="text-[#6B7280]">Trust Score</span>
                            <div className="flex items-center">
                              <span className="text-[#EC4899] font-medium">98%</span>
                              <div className="ml-2 h-1 bg-[#E5E7EB] rounded-full w-full overflow-hidden">
                                <div className="h-full bg-[#EC4899] rounded-full w-[98%]"></div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-[#F9F5FF] rounded p-2 text-xs">
                            <span className="text-[#6B7280]">Compatibility</span>
                            <div className="flex items-center">
                              <span className="text-[#6D28D9] font-medium">87%</span>
                              <div className="ml-2 h-1 bg-[#E5E7EB] rounded-full w-full overflow-hidden">
                                <div className="h-full bg-[#6D28D9] rounded-full w-[87%]"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-[#F9F5FF] p-1 rounded-full">
                              <div className="h-3 w-3" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Floating match elements */}
                    <div className="absolute bottom-[15%] left-[20%] animate-float-medium">
                      <div className="flex items-center gap-2 bg-white rounded-full shadow-lg px-4 py-2 border border-[#E5E7EB]">
                        <Lock className="h-4 w-4 text-[#6D28D9]" />
                        <span className="text-xs font-medium">End-to-End Encrypted</span>
                      </div>
                    </div>

                    <div className="absolute bottom-[5%] right-[25%] animate-float-slow">
                      <div className="flex items-center gap-2 bg-white rounded-full shadow-lg px-4 py-2 border border-[#E5E7EB]">
                        <Fingerprint className="h-4 w-4 text-[#EC4899]" />
                        <span className="text-xs font-medium">Verified Identity</span>
                      </div>
                    </div>

                    {/* New dating-themed floating elements */}
                    <div className="absolute top-[15%] right-[40%] animate-float-medium">
                      <div className="flex items-center gap-2 bg-white rounded-full shadow-lg px-4 py-2 border border-[#E5E7EB]">
                        <HeartPulse className="h-4 w-4 text-[#EC4899]" />
                        <span className="text-xs font-medium">95% Match</span>
                      </div>
                    </div>

                    <div className="absolute bottom-[25%] left-[60%] animate-float">
                      <div className="flex items-center gap-2 bg-white rounded-full shadow-lg px-4 py-2 border border-[#E5E7EB]">
                        <Flame className="h-4 w-4 text-[#F97316]" />
                        <span className="text-xs font-medium">Popular Profile</span>
                      </div>
                    </div>

                    {/* Central element */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28">
                      <motion.div 
                        className="relative w-full h-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                      >
                        {/* Simple, minimalist ring */}
                        <motion.div 
                          className="absolute inset-0 rounded-full border-2 border-[#EC4899]/30"
                          animate={{ 
                            scale: [1, 1.15, 1],
                            opacity: [0.3, 0.7, 0.3],
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />

                        {/* Inner clean circle */}
                        <motion.div 
                          className="absolute inset-2 bg-white rounded-full shadow-sm"
                          animate={{ 
                            boxShadow: [
                              "0 4px 12px rgba(236, 72, 153, 0.1)",
                              "0 6px 16px rgba(236, 72, 153, 0.2)",
                              "0 4px 12px rgba(236, 72, 153, 0.1)"
                            ]
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />

                        {/* Heart with clean animation */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ 
                              scale: [0.9, 1, 0.9],
                            }}
                            transition={{ 
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="relative"
                          >
                            <Heart className="h-10 w-10 text-[#EC4899]" strokeWidth={1.5} />
                            
                            {/* Sparkle effect that shows periodically at the center */}
                            <motion.div 
                              className="absolute inset-0 flex items-center justify-center"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ 
                                opacity: [0, 1, 0],
                                scale: [0.5, 1.2, 0.5]
                              }}
                              transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                repeatDelay: 5, // First sparkle happens after 5 seconds
                                ease: "easeOut"
                              }}
                            >
                              <Sparkles className="h-6 w-6 text-[#F59E0B]" />
                            </motion.div>

                            {/* Second sparkle effect with different timing */}
                            <motion.div 
                              className="absolute inset-0 flex items-center justify-center"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ 
                                opacity: [0, 1, 0],
                                scale: [0.5, 1.3, 0.5]
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                repeatDelay: 8, // Second sparkle happens after 8 seconds (different time than first)
                                ease: "easeOut"
                              }}
                            >
                              <Sparkles className="h-5 w-5 text-[#6D28D9]" />
                            </motion.div>
                          </motion.div>
                        </div>

                        {/* Minimalist curved path for particle */}
                        <motion.div
                          className="absolute inset-0"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                        >
                          <motion.div 
                            className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#EC4899]"
                            animate={{
                              pathOffset: [0, 1]
                            }}
                            transition={{
                              duration: 6,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            style={{
                              offsetPath: "path('M 14,14 a 14,14 0 1,0 28,0 a 14,14 0 1,0 -28,0')",
                              offsetDistance: "0%"
                            }}
                            onAnimationComplete={() => {
                              // This would trigger the sparkle if we had state control
                              // We'll use timed animations instead since this is a static component
                            }}
                          />
                        </motion.div>

                        {/* Second particle on the opposite direction */}
                        <motion.div
                          className="absolute inset-0"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                        >
                          <motion.div 
                            className="absolute w-1.5 h-1.5 rounded-full bg-[#6D28D9]"
                            animate={{
                              pathOffset: [0, 1]
                            }}
                            transition={{
                              duration: 8,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            style={{
                              offsetPath: "path('M 14,14 a 14,14 0 1,1 28,0 a 14,14 0 1,1 -28,0')",
                              offsetDistance: "0%"
                            }}
                          />
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Connection lines */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 350" fill="none">
                      <path d="M120 120 L200 175" stroke="url(#gradient1)" strokeWidth="1" strokeDasharray="5 3" />
                      <path d="M280 140 L200 175" stroke="url(#gradient1)" strokeWidth="1" strokeDasharray="5 3" />
                      <path d="M120 250 L200 175" stroke="url(#gradient1)" strokeWidth="1" strokeDasharray="5 3" />
                      <path d="M280 230 L200 175" stroke="url(#gradient1)" strokeWidth="1" strokeDasharray="5 3" />
                      <path d="M180 80 L200 175" stroke="url(#gradient1)" strokeWidth="1" strokeDasharray="5 3" />
                      <path d="M240 280 L200 175" stroke="url(#gradient1)" strokeWidth="1" strokeDasharray="5 3" />

                      {/* Animated heart pulse along the connection lines */}
                      <circle r="3" fill="#EC4899">
                        <animateMotion path="M120 120 L200 175" dur="3s" repeatCount="indefinite" />
                      </circle>
                      <circle r="3" fill="#6D28D9">
                        <animateMotion path="M280 140 L200 175" dur="4s" repeatCount="indefinite" />
                      </circle>
                      <circle r="3" fill="#EC4899">
                        <animateMotion path="M120 250 L200 175" dur="3.5s" repeatCount="indefinite" />
                      </circle>
                      <circle r="3" fill="#EC4899">
                        <animateMotion path="M120 250 L200 175" dur="3.5s" repeatCount="indefinite" />
                      </circle>

                      <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6D28D9" />
                          <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Floating hearts */}
                    <div className="absolute top-[10%] right-[10%] animate-float-slow opacity-20">
                      <Heart className="h-6 w-6 text-[#EC4899]" />
                    </div>
                    <div className="absolute bottom-[20%] right-[30%] animate-float opacity-20">
                      <Heart className="h-4 w-4 text-[#EC4899]" />
                    </div>
                    <div className="absolute top-[30%] left-[30%] animate-float-medium opacity-20">
                      <Heart className="h-5 w-5 text-[#EC4899]" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Custom Sponsors Banner - Added directly below the hero content for tighter integration */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="relative p-4 md:p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-[#E5E7EB] shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300 hover:bg-white/90">
            <div className="absolute inset-0 bg-pattern opacity-5 rounded-xl"></div>
            <motion.div 
              className="absolute -inset-0.5 bg-gradient-to-r from-[#6D28D9]/10 to-[#EC4899]/10 rounded-xl blur-sm"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ 
                duration: 10,
                repeat: Infinity
              }}
              style={{ backgroundSize: "200% 200%" }}
            ></motion.div>
            
            {/* Animated particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div 
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#6D28D9]/40 to-[#EC4899]/40"
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `${Math.random() * 100}%`,
                  opacity: 0
                }}
                animate={{ 
                  y: [0, -15, 0],
                  x: [0, Math.random() > 0.5 ? 10 : -10, 0],
                  opacity: [0, 0.8, 0]
                }}
                transition={{ 
                  duration: 3 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "easeInOut"
                }}
              />
            ))}
            
            {/* Connection line between sponsors */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-8 pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-500 hidden md:block">
              <svg width="100%" height="100%" viewBox="0 0 500 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M150 25 C 200 -10, 300 60, 350 25" 
                  stroke="url(#gradient-line)" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 3" 
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6D28D9" />
                    <stop offset="50%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#6D28D9" />
                  </linearGradient>
                </defs>
                {/* Animated dot along the path */}
                <circle r="3" fill="#EC4899" opacity="0.7">
                  <animateMotion 
                    path="M150 25 C 200 -10, 300 60, 350 25" 
                    dur="3s" 
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            </div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#EC4899] flex items-center justify-center text-white relative overflow-hidden"
                    animate={{ 
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity
                    }}
                    whileHover={{
                      rotate: [0, 5, -5, 0],
                      transition: { duration: 0.5 }
                    }}
                  >
                    {/* Animated ring */}
                    <motion.div 
                      className="absolute inset-0 border-2 border-white/30 rounded-full"
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.3, 0.8, 0.3]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <Stars className="h-5 w-5 relative z-10" />
                  </motion.div>
                  <div>
                    <motion.p 
                      className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#6D28D9] to-[#EC4899]"
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      style={{ backgroundSize: "200% auto" }}
                    >
                      Technology Partners
                    </motion.p>
                  </div>
                </div>

                <div className="flex items-center gap-6 md:gap-10">
                  {sponsors.map((sponsor, index) => (
                    <motion.a 
                      key={index}
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:no-underline"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.2 + 0.7 }}
                      whileHover={{ 
                        scale: 1.05,
                        transition: { type: "spring", stiffness: 300, damping: 10 }
                      }}
                    >
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${sponsor.color} flex items-center justify-center text-white font-bold relative overflow-hidden p-0.5 shadow-md`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                        <motion.div 
                          className="absolute inset-0 bg-pattern opacity-10"
                          animate={{
                            backgroundPosition: ["0% 0%", "100% 100%"],
                          }}
                          transition={{
                            duration: 20,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        ></motion.div>
                        
                        <div className="w-full h-full rounded-md bg-gradient-to-br from-black/10 to-black/0 flex items-center justify-center backdrop-blur-[1px]">
                          <motion.div
                            className="text-white"
                            animate={{ 
                              scale: [1, 1.1, 1],
                            }} 
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              delay: index
                            }}
                          >
                            {index === 0 ? (
                              <Brain className="h-6 w-6" />
                            ) : (
                              <Database className="h-6 w-6" />
                            )}
                          </motion.div>
                        </div>
                        
                        {/* Corner sparkle */}
                        <motion.div 
                          className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-white rounded-full"
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0.8, 1.2, 0.8]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 1.5
                          }}
                        />
                      </div>
                      <div>
                        <motion.p 
                          className="font-bold text-[#1F2937] relative"
                          whileHover={{
                            color: index === 0 ? "#6D28D9" : "#EC4899",
                            transition: { duration: 0.2 }
                          }}
                        >
                          {sponsor.name}
                          <motion.span 
                            className="absolute -bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6D28D9] to-[#EC4899]"
                            whileHover={{
                              width: "100%",
                              transition: { duration: 0.3 }
                            }}
                          />
                        </motion.p>
                        <div className="flex items-center">
                          <motion.div 
                            className={`mr-1 text-xs font-medium px-1.5 py-0.5 rounded-sm bg-gradient-to-r ${index === 0 ? 'from-purple-100 to-indigo-100 text-purple-700' : 'from-pink-100 to-purple-100 text-pink-700'}`}
                            whileHover={{ y: -1 }}
                          >
                            {sponsor.role}
                          </motion.div>
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </div>

                <motion.button
                  className="text-sm font-medium flex items-center gap-1 relative overflow-hidden"
                  whileHover={{ x: 3 }}
                >
                  <Link href="https://github.com/hiten1010/Dating-Blockchain" className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-[#6D28D9] to-[#EC4899]">Learn More</Link>
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-[#6D28D9]/50 to-[#EC4899]/50"
                    initial={{ scaleX: 0, originX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <ArrowRight className="h-3.5 w-3.5 text-[#EC4899]" />
                  </motion.span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6D28D9]/30 to-transparent"></div>
    </section>
  )
} 