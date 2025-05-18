"use client"

import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Fingerprint, ShieldIcon, LockIcon } from "lucide-react"

interface IntroStepProps {
  onContinue: () => void
}

export default function IntroStep({ onContinue }: IntroStepProps) {
  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Create Your Decentralized Dating Profile
        </CardTitle>
        <CardDescription className="text-lg mt-2">
          Here, you'll set up your secure profile and mint it as an NFT on the Cheqd protocol. We'll also create your
          Decentralized Identity (DID) to protect your privacy and ownership rights.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <h2 className="text-2xl font-semibold text-center">Complete Your Profile & Mint Your NFT</h2>
        <p className="text-center text-muted-foreground">
          By creating a DID, you gain full control of your data. Only minimal information will be stored on-chain, with
          sensitive details kept securely off-chain via Verida.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-purple-50">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
              <Fingerprint className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium">Create Your DID</h3>
            <p className="text-sm text-muted-foreground">Establish your secure digital identity</p>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-pink-50">
            <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center mb-3">
              <ShieldIcon className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="font-medium">Build Your Profile</h3>
            <p className="text-sm text-muted-foreground">Share what makes you unique</p>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-purple-50">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
              <LockIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium">Mint as NFT</h3>
            <p className="text-sm text-muted-foreground">Secure ownership of your profile</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onContinue}
          className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] rounded-xl py-6"
          size="lg"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="relative text-lg font-medium">Let's Get Started</span>
        </Button>
      </CardFooter>
    </>
  )
}

