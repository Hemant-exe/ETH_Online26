"use client"

import { useEffect, useState } from "react"
import { AlertCircleIcon, CheckCircle2Icon, InfoIcon, WalletIcon } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { accountSession } from "@/app/lib/account/session"
import { connectWallet, formatAddress, getStoredAddress, isWalletAvailable } from "@/utils/wallet"

interface ConnectWalletStepProps {
  onWalletConnected: (address: string) => void
}

/**
 * Wallet connection.
 *
 * One wallet, one purpose: holding the profile NFT on Unichain Sepolia.
 *
 * Onboarding previously required two separate wallet connections before it
 * would advance, which made this the most common place signups stalled.
 * Storage is local and identity comes from World ID, so neither is needed.
 * The step is also skippable: minting is optional, and nothing else in the app
 * depends on a wallet.
 */
export default function ConnectWalletStep({ onWalletConnected }: ConnectWalletStepProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletFound, setWalletFound] = useState(true)

  useEffect(() => {
    setWalletFound(isWalletAvailable())

    const existing = getStoredAddress()
    if (existing) {
      setWalletAddress(existing)
      accountSession.attachWallet(existing)
    }
  }, [])

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      const address = await connectWallet()
      setWalletAddress(address)
      await accountSession.attachWallet(address)
      setTimeout(() => onWalletConnected(address), 800)
    } catch (err) {
      console.error("Wallet connection failed:", err)
      setError(err instanceof Error ? err.message : "Could not connect your wallet. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Connect a Wallet</CardTitle>
        <CardDescription>Optional — it is only used to hold your profile NFT.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-purple-50 p-6 rounded-lg flex items-start space-x-3">
          <InfoIcon className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">What your wallet is for</p>
            <p className="text-sm text-muted-foreground">
              Your profile can be minted as an NFT on Unichain Sepolia, which gives you a portable,
              self-owned record of it. That is all the wallet does here — it is not your login, and it is not
              how we know you are human. You can skip this and connect later.
            </p>
          </div>
        </div>

        {!walletFound && (
          <Alert>
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              No EVM wallet detected. Install MetaMask, Rabby or Leap and reload, or skip this step.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center">
            <WalletIcon className="h-10 w-10 text-purple-600" />
          </div>

          {walletAddress && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle2Icon className="h-5 w-5" />
              <span>Wallet connected</span>
            </div>
          )}
        </div>

        {walletAddress && (
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="font-medium mb-1">Connected address</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm font-mono bg-white p-2 rounded border">
                    {formatAddress(walletAddress, 10, 8)}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-mono text-xs break-all">{walletAddress}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-sm text-muted-foreground mt-2">On Unichain Sepolia.</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        {walletAddress ? (
          <Button
            onClick={() => onWalletConnected(walletAddress)}
            className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] rounded-xl py-5"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative">Continue</span>
          </Button>
        ) : (
          <>
            <Button
              onClick={handleConnect}
              disabled={isConnecting || !walletFound}
              className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] rounded-xl py-5"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              {isConnecting ? (
                <div className="flex items-center">
                  <span className="mr-2 relative">Connecting…</span>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <span className="relative">Connect Wallet</span>
              )}
            </Button>

            <Button variant="ghost" onClick={() => onWalletConnected("")} className="w-full">
              Skip for now
            </Button>
          </>
        )}
      </CardFooter>
    </>
  )
}
