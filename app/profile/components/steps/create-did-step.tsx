"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Fingerprint, CheckCircle2Icon, InfoIcon, AlertCircleIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { veridaClient } from "@/app/lib/verida-client-wrapper"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CreateDIDStepProps {
  onDidCreated: (did: string) => void
}

export default function CreateDIDStep({ onDidCreated }: CreateDIDStepProps) {
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [didId, setDidId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Check if user already has a DID with Verida
  useEffect(() => {
    const checkExistingDid = async () => {
      try {
        if (veridaClient.isConnected()) {
          const did = veridaClient.getDid();
          if (did) {
            setDidId(did);
            setProgress(100);
          }
        }
      } catch (error) {
        console.error("Error checking existing DID:", error);
      }
    };

    checkExistingDid();
  }, []);

  const createVeridaDID = async () => {
    setIsCreating(true)
    setProgress(0)
    setError(null)

    try {
      // Step 1: Initialize Verida client if not already initialized
      setProgress(20);
      if (!veridaClient.getClient()) {
        await veridaClient.init();
      }

      // Step 2: Connect to Verida network if not already connected
      setProgress(50);
      if (!veridaClient.isConnected()) {
        const success = await veridaClient.connect();
        if (!success) {
          throw new Error("Failed to connect to Verida network");
        }
      }

      // Step 3: Get the DID from Verida account
      setProgress(80);
      const did = veridaClient.getDid();
      if (!did) {
        throw new Error("Failed to retrieve DID from Verida account");
      }

      // Success!
      setDidId(did);
      setProgress(100);

      // Wait a moment before proceeding to next step
      setTimeout(() => {
        onDidCreated(did);
      }, 1000);
      
      // toast({
      //   title: "DID Created Successfully",
      //   description: "Your decentralized identity has been created on the Verida network.",
      //   duration: 3000,
      // });
    } catch (err) {
      console.error("DID creation error:", err);
      setError(err instanceof Error ? err.message : "Failed to create DID. Please try again.");
      toast({
        variant: "destructive",
        title: "DID Creation Failed",
        description: "Failed to create DID. Please try again.",
        duration: 3000,
      });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Your Decentralized Identity (DID)</CardTitle>
        <CardDescription>A secure foundation for your dating profile using Verida</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-purple-50 p-6 rounded-lg flex items-start space-x-3">
          <InfoIcon className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">What is a DID?</p>
            <p className="text-sm text-muted-foreground">
              A DID ensures you fully own and control your identity. It allows you to manage your personal data
              securely through Verida's decentralized database. Your data is encrypted and only you control who can access it.
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center">
            <Fingerprint className="h-10 w-10 text-purple-600" />
          </div>

          {didId ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle2Icon className="h-5 w-5" />
              <span>DID Successfully Created!</span>
            </div>
          ) : (
            <div className="w-full">
              {progress > 0 && (
                <>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Creating your DID</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {progress < 30
                      ? "Initializing Verida client..."
                      : progress < 60
                        ? "Connecting to Verida network..."
                        : progress < 90
                          ? "Retrieving your DID..."
                          : "Finalizing your DID..."}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {didId && (
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="font-medium mb-1">Your Verida DID:</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm font-mono bg-white p-2 rounded border overflow-hidden text-ellipsis">
                    {didId.substring(0, 20)}...{didId.substring(didId.length - 15)}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-mono text-xs">{didId}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-sm text-muted-foreground mt-2">
              Your Verida DID has been successfully created. This will be used to securely store your dating profile data in a decentralized database.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!didId ? (
          <Button
            onClick={createVeridaDID}
            className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] rounded-xl py-5"
            disabled={isCreating}
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            {isCreating ? (
              <div className="flex items-center">
                <span className="mr-2 relative">Creating DID...</span>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <span className="relative">Set Up My Verida DID</span>
            )}
          </Button>
        ) : (
          <Button
            onClick={() => onDidCreated(didId)}
            className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] rounded-xl py-5"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative">Continue to Profile Setup</span>
          </Button>
        )}
      </CardFooter>
    </>
  )
}

