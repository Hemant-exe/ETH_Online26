"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, AlertCircle, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { loadExistingNFTData } from "@/utils/nft-check"

import {
  isLeapWalletInstalled,
  connectLeap,
  formatAddress,
  disconnectLeap
} from "@/utils/wallet"

/* ---------- component ---------- */
export default function ConnectButton() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAccountCreationInfo, setShowAccountCreationInfo] = useState(false)

  /* Detect if MetaMask is likely installed */
  const isMetaMaskLikelyInstalled = (): boolean => {
    return window.ethereum !== undefined && 
           typeof window.ethereum === 'object' && 
           'isMetaMask' in window.ethereum;
  }

  /* Connect wallet */
  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)
    setShowAccountCreationInfo(false)

    try {
      // Check if MetaMask is likely installed but Leap is not
      if (isMetaMaskLikelyInstalled() && !isLeapWalletInstalled()) {
        throw new Error("Another wallet extension (likely MetaMask) detected. Please install Leap wallet or disable other wallet extensions for this site.");
      }
      
      if (!isLeapWalletInstalled()) {
          // Open a new tab with the Leap wallet website if not installed
        window.open("https://www.leapwallet.io/", "_blank")
        throw new Error("Leap wallet not installed. Please install it and reload this page.")
      }

      try {
        const address = await connectLeap()
        
        if (address) {
          setWalletAddress(address)
          // Store address in local storage to persist across sessions
          localStorage.setItem("walletAddress", address)
          
          // Trigger storage event for current window
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'walletAddress',
            newValue: address
          }))
          
          // Check if user already has an NFT profile
          const nftData = await loadExistingNFTData()
          
          if (nftData) {
            // User has NFT profile, redirect to user page
            router.push("/user")
          } else {
            // User has wallet but no NFT, redirect to onboarding
            router.push("/onboarding")
          }
        } else {
          throw new Error("No accounts found in Leap wallet. Please create an account for Unichain Sepolia.")
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.includes("No accounts") || errorMessage.includes("account for Unichain")) {
          setShowAccountCreationInfo(true);
          throw new Error("No Unichain Sepolia account found. Please add this network to your wallet.");
        } else {
          throw error;
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet.")
      setShowAccountCreationInfo(true)
      console.error("Wallet connection error:", err)
      
      // Auto-hide simple errors after 5 seconds, but keep account creation info visible
      if (!showAccountCreationInfo) {
        setTimeout(() => {
          setShowAccountCreationInfo(false)
        }, 5000)
      }
    } finally {
      setIsConnecting(false)
    }
  }

  /* Disconnect wallet */
  const disconnectWallet = async () => {
    try {
      // Call the disconnectLeap utility function
      if (isLeapWalletInstalled()) {
        await disconnectLeap()
      }
      
      // Ensure the local state is updated
      setWalletAddress("")
      
      // Make sure localStorage is cleared
      localStorage.removeItem("walletAddress")
      
      // Dispatch storage event to notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'walletAddress',
        oldValue: walletAddress,
        newValue: null
      }))
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
      // Still update the UI state even if there was an error
      setWalletAddress("")
    }
  }

  /* Restore on refresh */
  useEffect(() => {
    const storedAddress = localStorage.getItem("walletAddress")
    if (storedAddress) {
      setWalletAddress(storedAddress)
    }

    // Set up listener for storage changes from other components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "walletAddress") {
        if (e.newValue) {
          setWalletAddress(e.newValue)
        } else {
          setWalletAddress("")
        }
      }
    }
    
    window.addEventListener("storage", handleStorageChange)
    
    // Also listen for localStorage changes in current window
    const handleCurrentWindowStorageChange = () => {
      const currentAddress = localStorage.getItem("walletAddress")
      if (currentAddress !== walletAddress) {
        setWalletAddress(currentAddress || "")
      }
    }
    
    // Poll for changes every second (for same-window updates)
    const interval = setInterval(handleCurrentWindowStorageChange, 1000)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [walletAddress])

  /* ---------- UI ---------- */
  return (
    <div className="flex flex-col items-center">
      {walletAddress ? (
        <Button 
          onClick={disconnectWallet} 
          className="bg-gradient-to-r from-[#6D28D9] to-[#EC4899] text-white hover:opacity-90 group relative overflow-hidden transition-all duration-300"
        >
          <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-10 transition-opacity"></span>
          <span className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJoZWFydHMiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTE1IDVjMS45Ny0xLjk3IDUuMTUtMS45NyA3LjEyIDAgMS45NyAxLjk3IDEuOTcgNS4xNSAwIDcuMTJMMTUgMTkuMjQgNy44OCAxMi4xMmMtMS45Ny0xLjk3LTEuOTctNS4xNSAwLTcuMTIgMS45Ny0xLjk3IDUuMTUtMS45NyA3LjEyIDB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2hlYXJ0cykiIC8+PC9zdmc+')] opacity-10"></span>
          <span className="relative z-10 flex items-center gap-2">
            {formatAddress(walletAddress)}
            <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Button>
      ) : (
        <Button 
          onClick={connectWallet} 
          disabled={isConnecting} 
          className="relative group overflow-hidden px-8 py-4 h-auto bg-gradient-to-r from-[#6D28D9] to-[#EC4899] text-white hover:shadow-lg transition-all duration-300"
        >
          {/* Animated gradient overlay */}
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 bg-[length:200%_100%] animate-shimmer"></span>
          
          {/* Heart pattern background */}
          <span className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJoZWFydHMiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTE1IDVjMS45Ny0xLjk3IDUuMTUtMS45NyA3LjEyIDAgMS45NyAxLjk3IDEuOTcgNS4xNSAwIDcuMTJMMTUgMTkuMjQgNy44OCAxMi4xMmMtMS45Ny0xLjk3LTEuOTctNS4xNSAwLTcuMTIgMS45Ny0xLjk3IDUuMTUtMS45NyA3LjEyIDB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2hlYXJ0cykiIC8+PC9zdmc+')] opacity-10"></span>
          
          {/* Glow effect on hover */}
          <span className="absolute -inset-1 bg-gradient-to-r from-[#6D28D9]/30 to-[#EC4899]/30 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></span>
          
          {/* Button Content */}
          <span className="relative z-10 flex flex-col items-center gap-2">
            {isConnecting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg">Connecting...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-white/90" />
                  <span className="text-lg font-medium">Connect Wallet</span>
                </div>
                <div className="text-xs text-white/80 mt-1">Secure blockchain connection</div>
              </>
            )}
          </span>
          
          {/* Animated particles */}
          {!isConnecting && (
            <>
              <span className="absolute top-1/4 left-[10%] w-1 h-1 rounded-full bg-white/60 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.2s' }}></span>
              <span className="absolute top-3/4 left-[80%] w-1.5 h-1.5 rounded-full bg-white/60 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></span>
              <span className="absolute top-1/2 left-[30%] w-1 h-1 rounded-full bg-white/60 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.7s' }}></span>
            </>
          )}
        </Button>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md shadow-sm w-full max-w-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{error}</p>
              
              {showAccountCreationInfo && (
                <div className="mt-3 p-3 bg-white rounded-md border border-gray-200">
                  <h4 className="text-gray-800 font-medium">How to create a Unichain Sepolia account:</h4>
                  <ol className="mt-2 text-xs text-gray-700 space-y-1.5 list-decimal pl-4">
                    <li>Open your Leap wallet extension</li>
                    <li>Click on the &quot;+&quot; icon or &quot;Add a new account&quot;</li>
                    <li>Select &quot;Connect to EVM chains&quot;</li>
                    <li>Click on &quot;Add custom network&quot;</li>
                    <li>Enter the following details:
                      <ul className="pl-4 mt-1 list-disc">
                        <li>Network Name: <span className="font-mono bg-gray-100 px-1 rounded">Unichain Sepolia</span></li>
                        <li>Chain ID: <span className="font-mono bg-gray-100 px-1 rounded">1301</span></li>
                        <li>Symbol: <span className="font-mono bg-gray-100 px-1 rounded">ETH</span></li>
                        <li>RPC URL: <span className="font-mono bg-gray-100 px-1 rounded text-xs">https://sepolia.unichain.org</span></li>
                        <li>Block Explorer: <span className="font-mono bg-gray-100 px-1 rounded text-xs">https://sepolia.uniscan.xyz</span></li>
                      </ul>
                    </li>
                    <li>Click &quot;Save&quot; and create or import a wallet</li>
                    <li>Return to this page and click &quot;Connect Wallet&quot; again</li>
                  </ol>
                </div>
              )}
              
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href="https://www.leapwallet.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-[#6D28D9] hover:underline"
                >
                  Get Leap Wallet
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
                <button
                  onClick={connectWallet}
                  className="inline-flex items-center text-xs text-[#6D28D9] hover:underline"
                >
                  Try Again
                  <ExternalLink className="ml-1 h-3 w-3 rotate-45" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
