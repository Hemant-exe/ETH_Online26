"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircleIcon, InfoIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface AgreementsStepProps {
  onComplete: () => void
}

export default function AgreementsStep({ onComplete }: AgreementsStepProps) {
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [aiAgreed, setAiAgreed] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleContinue = () => {
    if (!termsAgreed || !aiAgreed) {
      setError("You must agree to the terms and conditions to continue")
      return
    }

    onComplete()
  }

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Important Terms & Acknowledgments</CardTitle>
        <CardDescription>Please review and accept our terms before continuing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-purple-50 p-6 rounded-lg flex items-start space-x-3">
          <InfoIcon className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">
              Our platform uses AI for personalized matchmaking and stores critical data on-chain using Verida and Cheqd, 
              ensuring integrity and transparency. You retain ownership of your data via NFTs and can manage sensitive info off-chain.
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={termsAgreed}
              onCheckedChange={(checked) => setTermsAgreed(checked === true)}
            />
            <div className="space-y-1">
              <Label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the Terms of Service and Privacy Policy
              </Label>
              <p className="text-sm text-muted-foreground">
                By checking this box, you agree to our{" "}
                <Link href="#" className="text-purple-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-purple-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox id="ai" checked={aiAgreed} onCheckedChange={(checked) => setAiAgreed(checked === true)} />
            <div className="space-y-1">
              <Label
                htmlFor="ai"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I understand that this platform uses blockchain technology and AI
              </Label>
              <p className="text-sm text-muted-foreground">
                I understand that this platform uses Verida and Cheqd blockchain technology for storing profile data and identity verification, 
                and AI for matchmaking purposes
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm">
            Email (Optional)
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email for notifications"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            We'll only use your email for important notifications and updates
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleContinue}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          I Agree & Continue
        </Button>
      </CardFooter>
    </>
  )
}

