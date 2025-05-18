"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2Icon, ExternalLinkIcon, Sparkles, ShieldCheck, Zap, Users, Star, Shield } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import type { ProfileData } from "../profile-creation-flow"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface SuccessStepProps {
  profileData: ProfileData
  didId: string
  nftTokenId: string
  transactionHash: string
}

export default function SuccessStep({ profileData, didId, nftTokenId, transactionHash }: SuccessStepProps) {
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nftCardRef = useRef<HTMLDivElement>(null)
  const [nftHovered, setNftHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [cardAnimationFrame, setCardAnimationFrame] = useState(0)
  const router = useRouter()

  // Handle mouse movement for 3D card effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    if (nftCardRef.current && nftHovered) {
      const rect = nftCardRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      const rotateX = (y - 0.5) * 20 // -10 to 10 degrees
      const rotateY = (x - 0.5) * 20 // -10 to 10 degrees

      nftCardRef.current.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`
    }
  }

  // Reset card rotation when not hovering
  const handleMouseLeave = () => {
    if (nftCardRef.current) {
      nftCardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"
    }
    setNftHovered(false)
  }

  // Animate card border
  useEffect(() => {
    const animateCard = () => {
      setCardAnimationFrame((prev) => (prev + 1) % 360)
      requestAnimationFrame(animateCard)
    }

    const animation = requestAnimationFrame(animateCard)
    return () => cancelAnimationFrame(animation)
  }, [])

  // Confetti animation effect
  useEffect(() => {
    if (!showConfetti || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const confetti: {
      x: number
      y: number
      size: number
      color: string
      speedX: number
      speedY: number
      speedRotation: number
      rotation: number
    }[] = []

    // Create confetti particles
    for (let i = 0; i < 200; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        size: Math.random() * 10 + 5,
        color: `hsl(${Math.random() * 60 + 280}, 100%, 70%)`,
        speedX: Math.random() * 6 - 3,
        speedY: Math.random() * 3 + 2,
        speedRotation: Math.random() * 0.2 - 0.1,
        rotation: Math.random() * Math.PI * 2,
      })
    }

    const animate = () => {
      if (!showConfetti) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      confetti.forEach((c) => {
        c.x += c.speedX
        c.y += c.speedY
        c.rotation += c.speedRotation

        ctx.save()
        ctx.translate(c.x, c.y)
        ctx.rotate(c.rotation)

        ctx.fillStyle = c.color
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size / 3)

        ctx.restore()

        if (c.y > canvas.height) {
          c.y = -20
          c.x = Math.random() * canvas.width
        }
      })

      requestAnimationFrame(animate)
    }

    animate()

    // Auto-hide confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)

    return () => {
      clearTimeout(timer)
    }
  }, [showConfetti])

  // Function to handle navigation to dashboard
  const handleNavigateToDashboard = () => {
    router.push('/user')
  }
  
  // Navigation functions for different features
  const navigateToCreateTwin = () => {
    router.push('/create-twin')
  }
  
  const navigateToExplore = () => {
    router.push('/explore')
  }
  
  const navigateToProfile = () => {
    router.push('/user')
  }
  
  const navigateToSettings = () => {
    // Assuming there's a settings page or section for data access control
    router.push('/user') // Redirect to profile page for now
  }

  // Function to open transaction in explorer
  const openTransactionInExplorer = () => {
    window.open(`https://sepolia.uniscan.xyz/tx/${transactionHash}`, '_blank')
  }

  return (
    <>
      <CardHeader className="text-center py-2">
        <div className="flex justify-center mb-2">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center shadow-lg">
            <CheckCircle2Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
          Congratulations! Your NFT Profile Is Ready
        </CardTitle>
        <CardDescription className="text-base mt-2">
          You are now the sole owner of this profile NFT. Manage it anytime from your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 relative" ref={containerRef} onMouseMove={handleMouseMove}>
        {/* Confetti canvas */}
        {showConfetti && (
          <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ width: "100vw", height: "100vh" }}
          ></canvas>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* NFT Card - Using the same design as in mint-nft-step */}
          <div>
            <div
              ref={nftCardRef}
              className="relative w-full max-w-[350px] mx-auto aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-300 ease-out"
              style={{
                transformStyle: "preserve-3d",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2), 0 0 30px rgba(138, 43, 226, 0.2)",
              }}
              onMouseEnter={() => setNftHovered(true)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Animated border */}
              <div
                className="absolute -inset-0.5 rounded-2xl z-0"
                style={{
                  background: `linear-gradient(${cardAnimationFrame}deg, rgba(138, 43, 226, 0.8), rgba(233, 30, 99, 0.8), rgba(156, 39, 176, 0.8), rgba(138, 43, 226, 0.8))`,
                  backgroundSize: "400% 400%",
                  animation: "gradient 3s ease infinite",
                }}
              ></div>

              {/* Card background with enhanced holographic effect */}
              <div className="absolute inset-0 z-10 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900"></div>

              {/* Holographic pattern */}
              <div
                className="absolute inset-0 z-20 opacity-40"
                style={{
                  backgroundImage: `
                    linear-gradient(125deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0) 60%),
                    radial-gradient(circle at 40% 60%, rgba(255,0,255,0.5), transparent 50%),
                    radial-gradient(circle at 60% 30%, rgba(0,255,255,0.5), transparent 50%)
                  `,
                  backgroundSize: "200% 200%, 100% 100%, 100% 100%",
                  backgroundPosition: `${mousePosition.x / 5}% ${mousePosition.y / 5}%`,
                  transitionProperty: "background-position",
                  transitionDuration: "0.1s",
                  transitionTimingFunction: "ease-out",
                }}
              ></div>

              {/* Premium card texture */}
              <div
                className="absolute inset-0 z-30 opacity-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fillOpacity='0.1' fillRule='evenodd'/%3E%3C/svg%3E")`,
                  backgroundSize: "100px 100px",
                }}
              ></div>

              {/* Premium card content */}
              <div className="absolute inset-0 p-3 flex flex-col z-40" style={{ transform: "translateZ(20px)" }}>
                {/* NFT Badge */}
                <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg px-2 py-1 flex items-center gap-1 shadow-lg">
                  <Star className="h-3 w-3 text-white" />
                  <span className="text-white text-xs font-bold tracking-wider">NFT PROFILE</span>
                </div>

                {/* Profile header */}
                <div className="flex items-center gap-2 mt-5 mb-1">
                  <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white/80 shadow-lg">
                    {profileData.photos.length > 0 ? (
                      <img
                        src={profileData.photos[profileData.primaryPhotoIndex] || "/placeholder.svg"}
                        alt="Primary profile photo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {profileData.displayName ? profileData.displayName.charAt(0).toUpperCase() : "?"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white drop-shadow-md">
                      {profileData.displayName || "Your Name"}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {profileData.age} • {profileData.location || "No location"}
                    </p>
                  </div>
                </div>

                <Separator className="bg-white/30 my-1" />

                {/* Bio */}
                <div className="mb-2">
                  <h4 className="text-white/90 font-medium mb-1 text-sm">Bio</h4>
                  <p className="text-white/80 text-sm line-clamp-2 bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                    {profileData.bio || "No bio provided"}
                  </p>
                </div>

                {/* Interests */}
                <div className="mb-2">
                  <h4 className="text-white/90 font-medium mb-1 text-sm">Interests</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profileData.interests.slice(0, 4).map((interest) => (
                      <div
                        key={interest}
                        className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm"
                      >
                        {interest}
                      </div>
                    ))}
                    {profileData.interests.length > 4 && (
                      <div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                        +{profileData.interests.length - 4} more
                      </div>
                    )}
                    {profileData.interests.length === 0 && (
                      <p className="text-white/50 text-xs italic">No interests added</p>
                    )}
                  </div>
                </div>

                {/* Security Badge */}
                <div className="mt-auto flex justify-between items-end">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-1.5 py-0.5 flex items-center gap-1">
                    <Shield className="h-2.5 w-2.5 text-white/80" />
                    <span className="text-white/90 text-[9px]">Secured by Cheqd</span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-1.5 py-0.5">
                    <div className="text-[9px] text-white/90 font-mono">
                      {didId.substring(0, 4)}...{didId.substring(didId.length - 4)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced shine effect */}
              <div
                className="absolute inset-0 z-50 opacity-0 transition-opacity duration-300"
                style={{
                  opacity: nftHovered ? 0.2 : 0,
                  transform: `rotate(${mousePosition.x / 5}deg)`,
                  backgroundImage: "linear-gradient(to tr, transparent, white, transparent)",
                }}
              ></div>
            </div>
          </div>

          <div className="space-y-4">
            {/* NFT Details */}
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-200/50 to-pink-200/50 rounded-3xl blur-lg opacity-50"></div>
              <div className="relative bg-white p-4 rounded-2xl border border-purple-100 shadow-md">
                <h3 className="font-medium mb-3 text-center text-sm text-purple-700">Your NFT Details</h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-xs">
                      <span className="text-muted-foreground">NFT Token ID:</span>
                    </div>
                    <div className="font-mono text-xs bg-purple-50 px-2 py-0.5 rounded-lg">{nftTokenId}</div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Transaction Hash:</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-mono text-xs mr-1 bg-purple-50 px-2 py-0.5 rounded-lg">
                        {transactionHash.substring(0, 10)}...{transactionHash.substring(transactionHash.length - 6)}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 bg-purple-100 hover:bg-purple-200"
                        onClick={openTransactionInExplorer}
                      >
                        <ExternalLinkIcon className="h-3 w-3 text-purple-700" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <div className="text-xs">
                      <span className="text-muted-foreground">DID:</span>
                    </div>
                    <div className="font-mono text-xs bg-purple-50 px-2 py-0.5 rounded-lg">
                      {didId.substring(0, 10)}...{didId.substring(didId.length - 6)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Next Section */}
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-200/50 to-pink-200/50 rounded-3xl blur-lg opacity-50"></div>
              <div className="relative bg-white p-4 rounded-2xl border border-purple-100 shadow-md">
                <h3 className="font-medium mb-3 text-center text-sm text-purple-700">What's Next?</h3>
                <p className="text-xs text-muted-foreground mb-4 text-center">
                  Now that your profile is minted as an NFT, you can:
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      icon: <Zap className="h-4 w-4 text-purple-500" />,
                      title: "Configure AI Twin",
                      description: "Set up your AI agent for personalized matchmaking",
                      onClick: navigateToCreateTwin
                    },
                    {
                      icon: <Users className="h-4 w-4 text-pink-500" />,
                      title: "Browse Matches",
                      description: "Discover potential matches on the platform",
                      onClick: navigateToExplore
                    },
                    {
                      icon: <Sparkles className="h-4 w-4 text-purple-500" />,
                      title: "Update Profile",
                      description: "Modify your profile information anytime",
                      onClick: navigateToProfile
                    },
                    {
                      icon: <ShieldCheck className="h-4 w-4 text-pink-500" />,
                      title: "Control Data Access",
                      description: "Manage who can access your private data",
                      onClick: navigateToSettings
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
                        activeFeature === `feature-${index}` ? "scale-105 shadow-lg" : "shadow-md"
                      } cursor-pointer`}
                      onMouseEnter={() => setActiveFeature(`feature-${index}`)}
                      onMouseLeave={() => setActiveFeature(null)}
                      onClick={feature.onClick}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${
                          index % 2 === 0 ? "from-purple-500/10 to-purple-500/5" : "from-pink-500/10 to-pink-500/5"
                        } transition-opacity duration-300 ${
                          activeFeature === `feature-${index}` ? "opacity-100" : "opacity-50"
                        }`}
                      ></div>

                      <div className="relative p-2 flex flex-col items-center text-center">
                        <div className={`p-2 rounded-full mb-1 ${index % 2 === 0 ? "bg-purple-100" : "bg-pink-100"}`}>
                          {feature.icon}
                        </div>
                        <h4 className="font-medium text-xs mb-0.5">{feature.title}</h4>
                        <p className="text-[10px] text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 py-2">
        <Button 
          className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] rounded-xl py-3"
          onClick={handleNavigateToDashboard}
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400/30 to-pink-600/30 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="relative flex items-center justify-center gap-1">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="font-medium text-sm text-white">Go to Dashboard</span>
          </span>
        </Button>
      </CardFooter>
    </>
  )
}

