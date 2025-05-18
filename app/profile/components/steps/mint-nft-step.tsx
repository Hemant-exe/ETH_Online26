"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  InfoIcon,
  CheckCircle2Icon,
  ArrowLeftIcon,
  LockIcon,
  UnlockIcon,
  Star,
  Shield,
} from "lucide-react"
import type { ProfileData } from "../profile-creation-flow"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { nftService } from "@/app/services/nft-service"
import { profileMetadataService } from "@/app/services/profile-metadata-service"
import { updateDidWithNFT } from "@/app/lib/cheqd-service"
import { checkExistingNFT } from "@/app/utils/nft-check"

interface MintNFTStepProps {
  profileData: ProfileData
  didId: string
  onMintSuccess: (tokenId: string, txHash: string) => void
  onEdit: () => void
}

export default function MintNFTStep({ profileData, didId, onMintSuccess, onEdit }: MintNFTStepProps) {
  const { toast } = useToast()
  const [isMinting, setIsMinting] = useState(false)
  const [mintProgress, setMintProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("summary")
  const [rotateY, setRotateY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showParticles, setShowParticles] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nftCardRef = useRef<HTMLDivElement>(null)
  const [mintingStage, setMintingStage] = useState<string | null>(null)
  const [cardAnimationFrame, setCardAnimationFrame] = useState(0)

  // Keep only the card border animation
  useEffect(() => {
    const animateCard = () => {
      setCardAnimationFrame((prev) => (prev + 1) % 360)
      requestAnimationFrame(animateCard)
    }

    const animation = requestAnimationFrame(animateCard)
    return () => cancelAnimationFrame(animation)
  }, [])

  const handleMint = async () => {
    setIsMinting(true)
    setMintProgress(0)
    setShowParticles(true)
    setMintingStage("preparing")

    try {
      // Step 1: Check if user already has an NFT profile (25%)
      let tokenId = "";
      let txHash = "";
      let alreadyMinted = false;
      
      // Check for existing NFT using our utility
      const existingNFT = await checkExistingNFT();
      if (existingNFT.hasNFT) {
        tokenId = existingNFT.tokenId;
        txHash = "existing"; // We don't have the original tx hash, but that's ok
        alreadyMinted = true;
        
        console.log(`User already has NFT profile with token ID ${tokenId}`);
        
        toast({
          title: "Profile NFT Already Exists",
          description: `You already have a profile NFT with token ID ${tokenId}`,
          duration: 5000,
        });
      } else if (existingNFT.error) {
        console.warn("Error checking for existing NFT:", existingNFT.error);
        // Continue with the flow anyway
      }
      
      await new Promise<void>((resolve) => {
        let progress = 0
        const interval = setInterval(() => {
          progress += 5
          setMintProgress(progress)
          if (progress >= 25) {
            clearInterval(interval)
            resolve()
          }
        }, 200)
      })
      setMintingStage("metadata")

      // Step 2: Generate and store metadata (25%-50%)
      const metadata = profileMetadataService.generateMetadata(profileData, didId)
      const tokenURI = await profileMetadataService.storeMetadata(metadata)
      
      await new Promise<void>((resolve) => {
        let progress = 25
        const interval = setInterval(() => {
          progress += 5
          setMintProgress(progress)
          if (progress >= 50) {
            clearInterval(interval)
            resolve()
          }
        }, 200)
      })
      setMintingStage("minting")

      // Step 3: Mint NFT or use existing (50%-75%)
      if (!alreadyMinted) {
        // Only mint if user doesn't already have an NFT
        const mintResult = await nftService.createProfile(tokenURI)
        tokenId = mintResult.tokenId
        txHash = mintResult.txHash
      }
      
      // Get Cheqd wallet data from localStorage
      const cheqdWalletData = JSON.parse(localStorage.getItem("cheqdWalletData") || "{}")
      const cheqdDid = localStorage.getItem("cheqdWalletAddress")
      
      // Update Cheqd DID with NFT information if available
      if (cheqdWalletData && cheqdWalletData.keypair && cheqdDid) {
        try {
          // Get the Verida DID from localStorage (preferred) or use the one passed as prop
          const veridaDID = localStorage.getItem("veridaDID") || didId;
          
          console.log("Using Verida DID for Cheqd update:", veridaDID);
          
          // Update the Cheqd DID document with NFT information
          await updateDidWithNFT(cheqdDid, cheqdWalletData.keypair.publicKeyHex, {
            tokenId,
            transactionHash: txHash,
            contractAddress: nftService.getContractAddress(),
            chainId: "1301", // Unichain Sepolia
            chainName: "Unichain Sepolia"
          }, veridaDID);
          
          // Save NFT data in localStorage for access across the app
          localStorage.setItem("nftData", JSON.stringify({
            tokenId,
            transactionHash: txHash,
            contractAddress: nftService.getContractAddress(),
            mintDate: new Date().toISOString(),
            chainId: "1301",
            chainName: "Unichain Sepolia",
            veridaDID: veridaDID
          }));
          
          console.log("Successfully updated Cheqd DID with NFT information and linked Verida DID")
        } catch (cheqdError) {
          console.error("Error updating Cheqd DID with NFT data:", cheqdError)
          // Continue with the flow even if Cheqd update fails
        }
      }
      
      await new Promise<void>((resolve) => {
        let progress = 50
        const interval = setInterval(() => {
          progress += 5
          setMintProgress(progress)
          if (progress >= 75) {
            clearInterval(interval)
            resolve()
          }
        }, 200)
      })
      setMintingStage("finalizing")

      // Step 4: Finalize (75%-100%)
      await new Promise<void>((resolve) => {
        let progress = 75
        const interval = setInterval(() => {
          progress += 5
          setMintProgress(progress)
          if (progress >= 100) {
            clearInterval(interval)
            resolve()
          }
        }, 200)
      })

      // Wait a moment before proceeding to next step
      setTimeout(() => {
        toast({
          title: alreadyMinted ? "NFT Profile Loaded" : "NFT Minted Successfully",
          description: `Your profile is ${alreadyMinted ? "linked to" : "now secured on"} the blockchain with token ID ${tokenId}`,
          duration: 5000,
        })
        onMintSuccess(tokenId, txHash)
      }, 1500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      
      // Check for "Already minted" error
      if (errorMessage.includes("Already minted")) {
        toast({
          variant: "destructive",
          title: "NFT Already Minted",
          description: "You already have a profile NFT. Loading existing profile...",
          duration: 5000,
        });
        
        try {
          // Use our utility to check for existing NFT
          const existingNFT = await checkExistingNFT();
          if (existingNFT.hasNFT && existingNFT.tokenId) {
            // Continue with the success flow using the existing token ID
            setTimeout(() => {
              onMintSuccess(existingNFT.tokenId, "existing");
            }, 1500);
            return;
          }
        } catch (innerError) {
          console.error("Error retrieving existing profile:", innerError);
        }
      }
      
      console.error("NFT Minting Error:", err)
      
      toast({
        variant: "destructive",
        title: "NFT Minting Failed",
        description: `Failed to mint NFT: ${errorMessage}`,
        duration: 5000,
      })
      
      setIsMinting(false)
      setShowParticles(false)
      setMintingStage(null)
    }
  }

  // Particle effect for minting animation
  useEffect(() => {
    if (!showParticles || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles: {
      x: number
      y: number
      size: number
      color: string
      speedX: number
      speedY: number
      gravity: number
      life: number
      maxLife: number
    }[] = []

    const createParticle = () => {
      const x = canvas.width / 2
      const y = canvas.height / 2

      particles.push({
        x,
        y,
        size: Math.random() * 5 + 1,
        color: `hsl(${Math.random() * 60 + 280}, 100%, ${Math.random() * 30 + 60}%)`,
        speedX: (Math.random() - 0.5) * 8,
        speedY: (Math.random() - 0.5) * 8,
        gravity: 0.05,
        life: 0,
        maxLife: Math.random() * 100 + 50,
      })
    }

    const animate = () => {
      if (!showParticles) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Create new particles
      if (particles.length < 200 && Math.random() > 0.5) {
        createParticle()
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        p.x += p.speedX
        p.y += p.speedY
        p.speedY += p.gravity
        p.life++

        // Fade out as life increases
        const opacity = 1 - p.life / p.maxLife

        ctx.fillStyle =
          p.color +
          Math.floor(opacity * 255)
            .toString(16)
            .padStart(2, "0")
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        // Remove dead particles
        if (p.life >= p.maxLife) {
          particles.splice(i, 1)
          i--
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      // Cleanup
    }
  }, [showParticles])

  return (
    <>
      <CardHeader className="text-center py-3">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
          Mint Your Profile as an NFT
        </CardTitle>
        <CardDescription className="text-sm mt-1">
          Review your profile and create your NFT on the Cheqd protocol
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 px-3 relative" ref={containerRef}>
        {/* Particle canvas for minting animation */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-10"
          style={{ opacity: showParticles ? 1 : 0, transition: "opacity 0.5s ease" }}
        />

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-100 shadow-sm flex items-start space-x-3">
          <InfoIcon className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">
              Once minted, your profile becomes tamper-proof on the Cheqd protocol. You'll own your profile as an NFT in
              your wallet. Sensitive data is stored securely off-chain via Verida.
            </p>
          </div>
        </div>

        <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="relative z-20">
          <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-purple-100 to-pink-100 p-1 rounded-xl">
            <TabsTrigger
              value="summary"
              className={`rounded-lg transition-all duration-300 text-sm ${
                activeTab === "summary"
                  ? "bg-white shadow-md text-purple-700 font-medium"
                  : "bg-transparent text-purple-600/70"
              }`}
            >
              Profile Summary
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className={`rounded-lg transition-all duration-300 text-sm ${
                activeTab === "data"
                  ? "bg-white shadow-md text-purple-700 font-medium"
                  : "bg-transparent text-purple-600/70"
              }`}
            >
              Data Storage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="pt-3 relative">
            <div className="flex flex-col md:flex-row gap-4">
              {/* NFT Card Preview with space for expansion */}
              <div className="w-full md:w-5/12 flex justify-center">
                <div className="relative w-full h-[400px] max-w-[260px] flex items-center justify-center" style={{ perspective: '1000px' }}>
                  {/* Background glow effect */}
                  <div 
                    className="absolute inset-0 rounded-2xl blur-xl opacity-50"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.3), rgba(217, 70, 239, 0.3), rgba(236, 72, 153, 0.2))',
                      transform: 'translateZ(-10px)'
                    }}
                  ></div>
                  
                  <div
                    ref={nftCardRef}
                    className="absolute w-full max-w-[250px] aspect-[3/4] rounded-xl overflow-hidden z-10 origin-center"
                    style={{
                      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3), 0 0 30px rgba(138, 43, 226, 0.4)",
                      transform: "scale(1.15)",
                    }}
                  >
                    {/* Animated border */}
                    <div
                      className="absolute -inset-0.5 rounded-xl z-0"
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
                        backgroundSize: "200% 200%, 100% 100%, 100% 100%"
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

                    {/* Premium card content - more compact */}
                    <div className="absolute inset-0 p-3 flex flex-col z-40">
                      {/* NFT Badge */}
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg px-1.5 py-0.5 flex items-center gap-1 shadow-lg">
                        <Star className="h-2.5 w-2.5 text-white" />
                        <span className="text-white text-[10px] font-bold tracking-wider">NFT PROFILE</span>
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
                          <h3 className="text-base font-bold text-white drop-shadow-md">
                            {profileData.displayName || "Your Name"}
                          </h3>
                          <p className="text-white/90 text-xs">
                            {profileData.age} • {profileData.location || "No location"}
                          </p>
                        </div>
                      </div>

                      <Separator className="bg-white/30 my-1" />

                      {/* Bio */}
                      <div className="mb-1.5">
                        <h4 className="text-white/90 font-medium mb-0.5 text-[10px]">Bio</h4>
                        <p className="text-white/80 text-[10px] line-clamp-2 bg-white/10 p-1.5 rounded-lg backdrop-blur-sm">
                          {profileData.bio || "No bio provided"}
                        </p>
                      </div>

                      {/* Interests */}
                      <div className="mb-1.5">
                        <h4 className="text-white/90 font-medium mb-0.5 text-[10px]">Interests</h4>
                        <div className="flex flex-wrap gap-1">
                          {profileData.interests.slice(0, 4).map((interest) => (
                            <div
                              key={interest}
                              className="bg-white/20 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full text-[8px] font-medium shadow-sm"
                            >
                              {interest}
                            </div>
                          ))}
                          {profileData.interests.length > 4 && (
                            <div className="bg-white/20 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full text-[8px] font-medium shadow-sm">
                              +{profileData.interests.length - 4} more
                            </div>
                          )}
                          {profileData.interests.length === 0 && (
                            <p className="text-white/50 text-[9px] italic">No interests added</p>
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
                  </div>
                </div>
              </div>

              {/* Profile photos and details - adjusted width */}
              <div className="w-full md:w-7/12 space-y-2">
                <div>
                  <h4 className="font-medium mb-1 text-xs text-purple-700">Your Photos</h4>
                  <div className="grid grid-cols-4 gap-1">
                    {profileData.photos.map((photo, index) => (
                      <div
                        key={index}
                        className={`aspect-square rounded-md overflow-hidden ${
                          index === profileData.primaryPhotoIndex ? "ring-2 ring-pink-500" : ""
                        }`}
                      >
                        <img
                          src={photo || "/placeholder.svg"}
                          alt={`Profile photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {profileData.photos.length === 0 && (
                      <div className="col-span-4 bg-gray-100 rounded-md p-2 text-center text-gray-500 text-xs">
                        No photos added
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-1 text-xs text-purple-700">Profile Details</h4>
                  <div className="bg-purple-50 p-2 rounded-lg space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-purple-700">Display Name:</span>
                      <span className="text-xs font-medium">{profileData.displayName || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-purple-700">Age:</span>
                      <span className="text-xs font-medium">{profileData.age || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-purple-700">Location:</span>
                      <span className="text-xs font-medium">{profileData.location || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-purple-700">Relationship Goal:</span>
                      <span className="text-xs font-medium">{profileData.relationshipGoals || "Not set"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-200/50 to-pink-200/50 rounded-3xl blur-lg opacity-50"></div>
                <div className="relative bg-white p-2.5 rounded-xl border border-purple-100 shadow-md">
                  <h4 className="font-medium text-center mb-2 text-xs text-purple-700">On-Chain Data (Public)</h4>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-xs">Public Information</h5>
                      <div className="h-4 w-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 flex items-center justify-center">
                        <UnlockIcon className="h-2 w-2 text-white" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      {[
                        { name: "Display Name", value: profileData.displayName || "Not set" },
                        {
                          name: "DID Reference",
                          value: `${didId.substring(0, 8)}...${didId.substring(didId.length - 4)}`,
                        },
                        {
                          name: "Interests (Categories)",
                          value:
                            profileData.interests.length > 0 ? `${profileData.interests.length} interests` : "None",
                        },
                        {
                          name: "Photo References (Hashed)",
                          value: profileData.photos.length > 0 ? `${profileData.photos.length} photos` : "None",
                        },
                      ].map((item, index) => (
                        <div key={index} className="relative group overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-100 to-amber-200 rounded-lg transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                          <div className="relative flex items-center justify-between p-2 bg-amber-50 rounded-lg z-10">
                            <span className="text-xs">{item.name}</span>
                            <span className="text-xs font-mono bg-white/80 px-1.5 py-0.5 rounded">{item.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-200/50 to-pink-200/50 rounded-3xl blur-lg opacity-50"></div>
                <div className="relative bg-white p-2.5 rounded-xl border border-purple-100 shadow-md">
                  <h4 className="font-medium text-center mb-2 text-xs text-purple-700">Off-Chain Data (Private)</h4>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-xs">Private Information</h5>
                      <div className="h-4 w-4 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center">
                        <LockIcon className="h-2 w-2 text-white" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      {[
                        { name: "Age", value: profileData.age || "Not set" },
                        { name: "Location", value: profileData.location || "Not set" },
                        {
                          name: "Detailed Bio",
                          value: profileData.bio ? `${profileData.bio.length} characters` : "None",
                        },
                        {
                          name: "Photo Files",
                          value: profileData.photos.length > 0 ? `${profileData.photos.length} photos` : "None",
                        },
                        { name: "Relationship Preferences", value: profileData.relationshipGoals || "Not set" },
                      ].map((item, index) => (
                        <div key={index} className="relative group overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-green-200 rounded-lg transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                          <div className="relative flex items-center justify-between p-2 bg-green-50 rounded-lg z-10">
                            <span className="text-xs">{item.name}</span>
                            <span className="text-xs font-mono bg-white/80 px-1.5 py-0.5 rounded">{item.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-[10px] text-muted-foreground mt-1">
                      Private data is encrypted and stored via Verida. You control who can access it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {isMinting && (
          <div className="relative">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-200/50 to-pink-200/50 rounded-3xl blur-lg opacity-50"></div>
            <div className="relative bg-white p-2.5 rounded-xl border border-purple-100 shadow-md">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-xs text-purple-700">Minting your NFT profile</h4>
                <span className="text-xs font-medium text-pink-600">{mintProgress}%</span>
              </div>

              <div className="relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${mintProgress}%` }}
                ></div>

                {/* Animated glow effect */}
                <div
                  className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white to-transparent opacity-70 animate-pulse"
                  style={{
                    left: `${mintProgress - 10}%`,
                    animation: "pulse 1.5s infinite",
                    display: mintProgress > 0 ? "block" : "none",
                  }}
                ></div>
              </div>

              <div className="mt-2 grid grid-cols-4 gap-1">
                {[
                  { stage: "preparing", label: "Preparing Data", icon: "📋" },
                  { stage: "metadata", label: "Creating Metadata", icon: "🔗" },
                  { stage: "minting", label: "Minting on Cheqd", icon: "🔨" },
                  { stage: "finalizing", label: "Finalizing", icon: "✨" },
                ].map((step, index) => (
                  <div
                    key={index}
                    className={`relative flex flex-col items-center p-1.5 rounded-lg ${
                      mintingStage === step.stage
                        ? "bg-gradient-to-br from-purple-100 to-pink-100"
                        : mintingStage &&
                          index < ["preparing", "metadata", "minting", "finalizing"].indexOf(mintingStage) + 1
                        ? "bg-gradient-to-br from-purple-50 to-pink-50 opacity-70"
                        : "bg-gray-50 opacity-50"
                    }`}
                  >
                    <div className={`text-xs mb-0.5 ${mintingStage === step.stage ? "animate-bounce" : ""}`}>
                      {step.icon}
                    </div>
                    <span className="text-[9px] text-center font-medium">{step.label}</span>

                    {mintingStage === step.stage && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {mintProgress === 100 && (
          <div className="bg-green-50 p-2 rounded-lg flex items-center gap-2">
            <CheckCircle2Icon className="h-3.5 w-3.5 text-green-600" />
            <p className="text-green-600 font-medium text-xs">NFT successfully minted! Proceeding to confirmation...</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 relative z-20 px-3 pt-2 pb-3">
        {!isMinting && mintProgress < 100 && (
          <div className="flex w-full gap-3">
            <Button
              onClick={handleMint}
              className="flex-[2] relative overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] rounded-xl py-2"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative text-sm">Mint My NFT Profile</span>
            </Button>
            <Button
              variant="outline"
              onClick={onEdit}
              className="flex-[1] border-purple-300 hover:border-pink-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 py-1.5 text-sm"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5 mr-1.5" />
              <span>Edit Profile First</span>
            </Button>
          </div>
        )}

        {isMinting && mintProgress < 100 && (
          <Button disabled className="w-full bg-gradient-to-r from-purple-600/70 to-pink-600/70 rounded-xl py-2 text-sm">
            <div className="flex items-center">
              <span className="mr-2">Minting in progress...</span>
              <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </Button>
        )}
      </CardFooter>
    </>
  )
}

