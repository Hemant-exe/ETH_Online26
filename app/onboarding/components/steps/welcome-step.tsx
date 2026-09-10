"use client"

import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, ScanFace, ShieldIcon } from "lucide-react"

interface WelcomeStepProps {
  onContinue: () => void
}

export default function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Welcome to Proof of Heart
        </CardTitle>
        <CardDescription className="text-lg mt-2">
          Dating where every profile belongs to a real, unique person — and where your AI twin does
          the first round of screening for you.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <h2 className="text-2xl font-semibold text-center">How it works</h2>
        <p className="text-center text-muted-foreground">
          One face check proves you are human. Your AI twin then holds a short, paid conversation
          with someone else&apos;s twin and reports back before either of you invests an evening.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-pink-50">
            <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center mb-3">
              <ScanFace className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="font-medium">Prove you&apos;re human</h3>
            <p className="text-sm text-muted-foreground">
              World ID Selfie Check. One person, one profile.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-purple-50">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
              <Coins className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium">Twins screen first</h3>
            <p className="text-sm text-muted-foreground">
              Each turn is a metered HBAR payment on Hedera.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-purple-50">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
              <ShieldIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium">Your data, your device</h3>
            <p className="text-sm text-muted-foreground">
              Profiles and chats stay in your browser.
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          size="lg"
        >
          Let&apos;s Get Started
        </Button>
      </CardFooter>
    </>
  )
}
