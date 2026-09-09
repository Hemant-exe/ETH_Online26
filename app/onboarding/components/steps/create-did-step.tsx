"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Fingerprint, AlertCircleIcon, CheckCircle2Icon, InfoIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CreateDIDStepProps {
  walletAddress: string
  onDidCreated: (did: string) => void
}

export default function CreateDIDStep({ walletAddress, onDidCreated }: CreateDIDStepProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [didId, setDidId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const createDID = async () => {
    setIsCreating(true)
    setError(null)
    setProgress(0)

    try {
      // Simulate DID creation with progress updates
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Generate a random DID for demo purposes
      const randomDid = `did:verida:${[...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join("")}`
      setDidId(randomDid)
      setProgress(100)

      // Wait a moment before proceeding to next step
      setTimeout(() => {
        onDidCreated(randomDid)
      }, 1000)
    } catch (err) {
      setError("Failed to create DID. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  // Auto-start DID creation when component mounts
  useEffect(() => {
    if (walletAddress && !didId && !isCreating) {
      createDID()
    }
  }, [walletAddress])

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Your Decentralized Identity (DID)</CardTitle>
        <CardDescription>Establish your secure digital identity on the platform</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-purple-50 p-6 rounded-lg flex items-start space-x-3">
          <InfoIcon className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">What is a DID?</p>
            <p className="text-sm text-muted-foreground">
              Your DID is a secure identifier that ensures authenticity and privacy. It lets you control what data you
              share and how it's used across the platform.
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
                  ? "Initializing..."
                  : progress < 60
                    ? "Generating cryptographic keys..."
                    : progress < 90
                      ? "Registering on Verida network..."
                      : "Finalizing your DID..."}
              </div>
            </div>
          )}
        </div>

        {didId && (
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="font-medium mb-1">Your DID:</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm font-mono bg-white p-2 rounded border overflow-hidden text-ellipsis">
                    {didId.substring(0, 15)}...{didId.substring(didId.length - 10)}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-mono text-xs">{didId}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={createDID}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          disabled={isCreating || !!didId}
        >
          {isCreating ? "Creating DID..." : didId ? "DID Created" : "Generate My DID"}
        </Button>
      </CardFooter>
    </>
  )
}

