"use client"

import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { HeartIcon, ShieldIcon, WalletIcon } from "lucide-react"

interface WelcomeStepProps {
  onContinue: () => void
}

export default function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Welcome to Our Decentralized Dating Platform
        </CardTitle>
        <CardDescription className="text-lg mt-2">
          We use Verida and Cheqd blockchain technology to power your NFT-based dating profile. Please connect your wallets to get
          started.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <h2 className="text-2xl font-semibold text-center">Start Your AI-Powered Dating Journey</h2>
        <p className="text-center text-muted-foreground">
          Connect both your Verida and Cheqd wallets. Next, you'll create your profile with a secure DID for
          maximum security and privacy.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-purple-50">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
              <img src="/verida.jpg" alt="Verida" className="h-8 w-8 rounded-full" />
            </div>
            <h3 className="font-medium">Connect Verida</h3>
            <p className="text-sm text-muted-foreground">Secure data storage</p>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-pink-50">
            <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center mb-3">
              <img src="/cheqd.png" alt="Cheqd" className="h-8 w-8 rounded-full" />
            </div>
            <h3 className="font-medium">Connect Cheqd</h3>
            <p className="text-sm text-muted-foreground">Identity verification</p>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-purple-50">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
              <ShieldIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium">Privacy & Security</h3>
            <p className="text-sm text-muted-foreground">You control your data</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          size="lg"
        >
          Let's Get Started
        </Button>
      </CardFooter>
    </>
  )
}

