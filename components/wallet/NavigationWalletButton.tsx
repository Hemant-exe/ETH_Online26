"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, AlertCircle, ExternalLink } from "lucide-react"
import { isLeapWalletInstalled, connectLeap, formatAddress, disconnectLeap } from "@/utils/wallet"
import { checkNFTAndRedirect } from "@/utils/nft-check"

export default function NavigationWalletButton() {
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showError, setShowError] = useState(false)
  const [showAccountInfo, setShowAccountInfo] = useState(false)

  // Helper function to detect if another wallet like MetaMask is installed
  const isOtherWalletInstalled = (): boolean => {
    return window.ethereum !== undefined && 
           typeof window.ethereum === 'object' && 
           (
             ('isMetaMask' in window.ethereum) || 
             !('isLeap' in window.ethereum)
           );
  }

  const connectLeapWallet = async () => {
    setIsConnecting(true)
    setError(null)
    setShowError(false)
    setShowAccountInfo(false)

    try {
      // Check for other wallet extensions that might interfere
      if (isOtherWalletInstalled() && !isLeapWalletInstalled()) {
        throw new Error("Another wallet extension detected. Please install Leap wallet or disable other wallet extensions.");
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

          // Check if user has an NFT and redirect accordingly
          await checkNFTAndRedirect()
        } else {
          throw new Error("No accounts found in Leap wallet. Please create an account for Unichain Sepolia.")
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.includes("No accounts") || errorMessage.includes("account for Unichain")) {
          setShowAccountInfo(true);
          throw new Error("No Unichain Sepolia account found. Please add this network to your wallet.");
        } else {
          throw error;
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet.")
      setShowError(true)
      console.error("Wallet connection error:", err)
      
      // Auto-hide simple errors after 5 seconds, but keep account creation info visible
      if (!showAccountInfo) {
        setTimeout(() => {
          setShowError(false)
        }, 5000)
      }
    } finally {
      setIsConnecting(false)
    }
  }

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

  // Check for a stored address on component mount
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

  // For desktop
  const desktopButton = walletAddress ? (
    <Button
      variant="outline"
      onClick={disconnectWallet}
      className="hidden md:flex border-[#6D28D9] bg-gradient-to-r from-[#6D28D9]/10 to-[#EC4899]/10 text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white relative overflow-hidden group transition-all duration-300"
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#6D28D9]/0 to-[#EC4899]/0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
      <span className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJoZWFydHMiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTE1IDVjMS45Ny0xLjk3IDUuMTUtMS45NyA3LjEyIDAgMS45NyAxLjk3IDEuOTcgNS4xNSAwIDcuMTJMMTUgMTkuMjQgNy44OCAxMi4xMmMtMS45Ny0xLjk3LTEuOTctNS4xNSAwLTcuMTIgMS45Ny0xLjk3IDUuMTUtMS45NyA3LjEyIDB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTA5LCA0MCwgMjE3LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2hlYXJ0cykiIC8+PC9zdmc+')] opacity-10"></span>
      <span className="relative flex items-center gap-2 z-10">
        {formatAddress(walletAddress)}
        <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Button>
  ) : (
    <>
      <Button
        variant="outline"
        onClick={connectLeapWallet}
        disabled={isConnecting}
        className="hidden md:flex border-[#6D28D9] text-[#6D28D9] hover:bg-gradient-to-r hover:from-[#6D28D9] hover:to-[#EC4899] hover:text-white relative overflow-hidden group transition-all duration-300"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-[#6D28D9]/10 via-[#EC4899]/10 to-[#6D28D9]/10 opacity-0 group-hover:opacity-100 bg-[length:200%_100%] animate-shimmer"></span>
        <span className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJoZWFydHMiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTE1IDVjMS45Ny0xLjk3IDUuMTUtMS45NyA3LjEyIDAgMS45NyAxLjk3IDEuOTcgNS4xNSAwIDcuMTJMMTUgMTkuMjQgNy44OCAxMi4xMmMtMS45Ny0xLjk3LTEuOTctNS4xNSAwLTcuMTIgMS45Ny0xLjk3IDUuMTUtMS45NyA3LjEyIDB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTA5LCA0MCwgMjE3LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2hlYXJ0cykiIC8+PC9zdmc+')] opacity-10"></span>
        <span className="absolute -inset-[1px] bg-gradient-to-r from-[#6D28D9]/20 to-[#EC4899]/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px]"></span>
        <span className="relative flex items-center gap-2 z-10">
          {isConnecting ? (
            <>
              <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-[#6D28D9]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              Connect Wallet
              <Wallet className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </span>
      </Button>
      {showError && (
        <div className="absolute top-full mt-2 right-0 bg-red-50 border border-red-200 text-red-600 text-xs p-2 rounded-md shadow-sm z-50 w-72">
          <div className="flex items-start gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{error}</p>
              
              {showAccountInfo && (
                <div className="mt-2 text-xs">
                  <p>To add Unichain Sepolia:</p>
                  <ol className="pl-4 mt-1 list-decimal">
                    <li>Open Leap wallet</li>
                    <li>Click &quot;+&quot; → &quot;Connect to EVM chains&quot;</li>
                    <li>Add custom network: ID 1301, RPC https://sepolia.unichain.org</li>
                  </ol>
                  <button onClick={connectLeapWallet} className="mt-1 text-blue-600 hover:underline">Try Again</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )

  // For mobile
  const mobileButton = walletAddress ? (
    <Button
      onClick={disconnectWallet}
      className="bg-gradient-to-r from-[#6D28D9] to-[#EC4899] text-white hover:opacity-90 w-full group relative overflow-hidden transition-all duration-300"
    >
      <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-10 transition-opacity"></span>
      <span className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJoZWFydHMiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTE1IDVjMS45Ny0xLjk3IDUuMTUtMS45NyA3LjEyIDAgMS45NyAxLjk3IDEuOTcgNS4xNSAwIDcuMTJMMTUgMTkuMjQgNy44OCAxMi4xMmMtMS45Ny0xLjk3LTEuOTctNS4xNSAwLTcuMTIgMS45Ny0xLjk3IDUuMTUtMS45NyA3LjEyIDB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2hlYXJ0cykiIC8+PC9zdmc+')] opacity-10"></span>
      <span className="relative flex items-center gap-2 z-10">
        {formatAddress(walletAddress)}
        <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Button>
  ) : (
    <>
      <Button
        onClick={connectLeapWallet}
        disabled={isConnecting}
        className="bg-gradient-to-r from-[#6D28D9] to-[#EC4899] text-white hover:opacity-90 w-full group relative overflow-hidden transition-all duration-300"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 animate-shimmer-fast"></span>
        <span className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJoZWFydHMiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTE1IDVjMS45Ny0xLjk3IDUuMTUtMS45NyA3LjEyIDAgMS45NyAxLjk3IDEuOTcgNS4xNSAwIDcuMTJMMTUgMTkuMjQgNy44OCAxMi4xMmMtMS45Ny0xLjk3LTEuOTctNS4xNSAwLTcuMTIgMS45Ny0xLjk3IDUuMTUtMS45NyA3LjEyIDB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2hlYXJ0cykiIC8+PC9zdmc+')] opacity-10"></span>
        <span className="absolute -inset-[1px] bg-gradient-to-r from-white/20 to-white/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px]"></span>
        <span className="relative flex items-center gap-2 z-10">
          {isConnecting ? (
            <>
              <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              Connect Wallet
              <Wallet className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </span>
      </Button>
      {showError && (
        <div className="mt-2 bg-red-50 border border-red-200 text-red-600 text-xs p-2 rounded-md shadow-sm">
          <div className="flex items-start gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{error}</p>
              
              {showAccountInfo && (
                <div className="mt-2 text-xs">
                  <p>To add Unichain Sepolia:</p>
                  <ol className="pl-4 mt-1 list-decimal">
                    <li>Open Leap wallet</li>
                    <li>Click &quot;+&quot; → &quot;Connect to EVM chains&quot;</li>
                    <li>Add custom network: ID 1301, RPC https://sepolia.unichain.org</li>
                  </ol>
                  <button onClick={connectLeapWallet} className="mt-1 text-blue-600 hover:underline">Try Again</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )

  return {
    desktopButton,
    mobileButton,
    isConnected: !!walletAddress,
    walletAddress
  }
} 