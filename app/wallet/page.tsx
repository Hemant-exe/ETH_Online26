"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ConnectButton from "@/components/wallet/ConnectButton"
import { Wallet, Shield, Fingerprint } from "lucide-react"
import Link from "next/link"
import { loadExistingNFTData } from "@/utils/nft-check"

export default function WalletPage() {
  const router = useRouter()
  
  // Check for wallet connection on mount and after wallet state changes
  useEffect(() => {
    const checkWalletConnection = async () => {
      const walletAddress = localStorage.getItem("walletAddress")
      if (walletAddress) {
        // Check if user already has an NFT profile
        const nftData = await loadExistingNFTData()
        
        if (nftData) {
          // User has NFT profile, redirect to user page
          router.push("/user")
        } else {
          // User has wallet but no NFT, redirect to onboarding
          router.push("/onboarding")
        }
      }
    }
    
    // Initial check
    checkWalletConnection()
    
    // Set up listener for storage changes (in case wallet is connected in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "walletAddress" && e.newValue) {
        checkWalletConnection()
      }
    }
    
    window.addEventListener("storage", handleStorageChange)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [router])
  
  return (
    <div className="min-h-screen bg-[#F9F5FF]">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-10 h-10">
                <img src="/logo2.svg" alt="VeraLove Logo" className="w-full h-full" />
              </div>
              <span className="font-bold text-xl tracking-tight text-[#1F2937]">VeraLove</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="bg-[#6D28D9]/10 p-3 rounded-full inline-flex justify-center mb-4">
              <Wallet className="h-6 w-6 text-[#6D28D9]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937] mb-2">Connect Your Wallet</h1>
            <p className="text-[#6B7280]">
              Connect your Leap wallet to access the full VeraLove experience
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 mb-8">
            <div className="flex justify-center mb-6">
              <ConnectButton />
            </div>

            <div className="border-t border-[#E5E7EB] pt-5 mt-5 text-center">
              <p className="text-sm text-[#6B7280]">
                Don't have a Leap wallet yet?{" "}
                <a 
                  href="https://www.leapwallet.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#6D28D9] hover:underline"
                >
                  Download and install it
                </a>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-[#6D28D9]/10 p-2 rounded-full mt-0.5">
                <Shield className="h-4 w-4 text-[#6D28D9]" />
              </div>
              <div>
                <h3 className="font-medium text-[#1F2937]">Secure Blockchain Technology</h3>
                <p className="text-sm text-[#6B7280]">Your data is protected by advanced encryption and blockchain security.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-[#6D28D9]/10 p-2 rounded-full mt-0.5">
                <Fingerprint className="h-4 w-4 text-[#6D28D9]" />
              </div>
              <div>
                <h3 className="font-medium text-[#1F2937]">You Own Your Profile</h3>
                <p className="text-sm text-[#6B7280]">Your dating profile becomes an NFT that you fully control.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#E5E7EB] bg-white py-6">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-center text-sm text-[#6B7280]">
            © {new Date().getFullYear()} VeraLove. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
} 