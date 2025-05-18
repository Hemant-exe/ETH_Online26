"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WalletIcon, AlertCircleIcon, CheckCircle2Icon, InfoIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useVeridaClient } from "@/app/lib/clientside-verida"
import { HeartLoader } from "@/components/ui/heart-loader"
import { setupCheqdWallet } from "@/app/lib/cheqd-service"

interface ConnectWalletStepProps {
  onWalletConnected: (address: string) => void
}

export default function ConnectWalletStep({ onWalletConnected }: ConnectWalletStepProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isCheqdConnecting, setIsCheqdConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [cheqdWalletAddress, setCheqdWalletAddress] = useState<string | null>(null)
  const { client, isLoading, error: clientError } = useVeridaClient();

  useEffect(() => {
    if (clientError) {
      setError("Failed to initialize Verida client. Please try again.");
    }
  }, [clientError]);

  useEffect(() => {
    // Check if already connected
    if (client && client.isConnected()) {
      const did = client.getDid();
      if (did) {
        setWalletAddress(did);
      }
    }
    
    // Check if Cheqd wallet was previously connected
    const storedCheqdAddress = localStorage.getItem("cheqdWalletAddress");
    if (storedCheqdAddress) {
      setCheqdWalletAddress(storedCheqdAddress);
    }
  }, [client]);

  const connectVeridaWallet = async () => {
    if (!client) {
      setError("Verida client not available. Please reload the page.");
      return;
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Connect to Verida network
      const success = await client.connect();
      
      if (success) {
        const did = client.getDid();
        if (did) {
          setWalletAddress(did);
          
          // Store Verida DID in localStorage for future use
          localStorage.setItem("veridaDID", did);
          
          // Only proceed to next step if both wallets are connected
          if (cheqdWalletAddress) {
            setTimeout(() => {
              onWalletConnected(did);
            }, 1000);
          }
        } else {
          setError("Connected to Verida but couldn't retrieve DID");
        }
      } else {
        setError("Failed to connect to Verida network");
      }
    } catch (err) {
      console.error("Verida connection error:", err);
      setError("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false)
    }
  }

  const connectCheqdWallet = async () => {
    setIsCheqdConnecting(true)
    setError(null)

    try {
      // Connect to Cheqd network
      const walletSetup = await setupCheqdWallet();
      
      if (walletSetup && walletSetup.did) {
        const cheqdDid = walletSetup.did.did;
        setCheqdWalletAddress(cheqdDid);
        
        // Store Cheqd DID in localStorage for future use
        localStorage.setItem("cheqdWalletAddress", cheqdDid);
        localStorage.setItem("cheqdWalletData", JSON.stringify(walletSetup));
        
        // Only proceed to next step if both wallets are connected
        if (walletAddress && cheqdDid) {
          setTimeout(() => {
            onWalletConnected(walletAddress);
          }, 1000);
        }
      } else {
        setError("Failed to connect to Cheqd network");
      }
    } catch (err) {
      console.error("Cheqd connection error:", err);
      setError("Failed to connect Cheqd wallet. Please try again.");
    } finally {
      setIsCheqdConnecting(false)
    }
  }

  const disconnectWallet = () => {
    if (client) {
      client.disconnect();
      setWalletAddress(null);
    }
  }

  const disconnectCheqdWallet = () => {
    setCheqdWalletAddress(null);
    localStorage.removeItem("cheqdWalletAddress");
    localStorage.removeItem("cheqdWalletData");
  }

  // Check if both wallets are connected
  const areBothWalletsConnected = walletAddress && cheqdWalletAddress;

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Connect Your Wallets</CardTitle>
        <CardDescription>Connect both wallets to create your decentralized profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-purple-50 p-6 rounded-lg flex items-start space-x-3">
          <InfoIcon className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">
              You need to connect both your Verida and Cheqd wallets. Verida stores your encrypted profile data, 
              while Cheqd provides blockchain-based identity verification.
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="flex flex-col items-center space-y-4">
            <HeartLoader size="lg" showText text="Loading Verida client..." />
          </div>
        )}

        {!isLoading && (
          <div className="space-y-6">
            {/* Verida Wallet Section */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Verida Wallet</h3>
              
              {walletAddress ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Connected</p>
                      <p className="text-xs text-muted-foreground">
                        {walletAddress.substring(0, 12)}...{walletAddress.substring(walletAddress.length - 8)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={disconnectWallet}>
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img src="/verida.jpg" alt="Verida" className="h-6 w-6 rounded-full" />
                    <span>Verida Wallet</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={connectVeridaWallet}
                    disabled={isConnecting || !client}
                  >
                    {isConnecting ? "Connecting..." : "Connect"}
                  </Button>
                </div>
              )}
            </div>
            
            {/* Cheqd Wallet Section */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Cheqd Wallet</h3>
              
              {cheqdWalletAddress ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Connected</p>
                      <p className="text-xs text-muted-foreground">
                        {cheqdWalletAddress.substring(0, 12)}...{cheqdWalletAddress.substring(cheqdWalletAddress.length - 8)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={disconnectCheqdWallet}>
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img src="/cheqd.png" alt="Cheqd" className="h-6 w-6 rounded-full" />
                    <span>Cheqd Wallet</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={connectCheqdWallet}
                    disabled={isCheqdConnecting}
                  >
                    {isCheqdConnecting ? "Connecting..." : "Connect"}
                  </Button>
                </div>
              )}
            </div>
            
            {/* Connection Status */}
            {!areBothWalletsConnected && (
              <div className="bg-amber-50 p-3 rounded-md text-center">
                <p className="text-sm text-amber-700">
                  Please connect both wallets to continue
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onWalletConnected(walletAddress!)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          disabled={!areBothWalletsConnected || isConnecting || isCheqdConnecting}
        >
          {isConnecting || isCheqdConnecting ? (
            <div className="flex items-center justify-center">
              <HeartLoader size="sm" />
              <span className="ml-2">Connecting...</span>
            </div>
          ) : areBothWalletsConnected ? (
            "Continue"
          ) : (
            "Connect Both Wallets to Continue"
          )}
        </Button>
      </CardFooter>
    </>
  )
}
