"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldCheckIcon, AlertCircleIcon, UploadIcon, BadgeCheckIcon, InfoIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface VerifyIdentityStepProps {
  onVerificationComplete: (verified: boolean) => void
  onSkip: () => void
}

export default function VerifyIdentityStep({ onVerificationComplete, onSkip }: VerifyIdentityStepProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fullName, setFullName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [idUploaded, setIdUploaded] = useState(false)
  const [selfieUploaded, setSelfieUploaded] = useState(false)

  const handleVerify = async () => {
    if (!fullName || !dateOfBirth || !idUploaded || !selfieUploaded) {
      setError("Please complete all required fields")
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      // Simulate verification process
      await new Promise((resolve) => setTimeout(resolve, 2000))
      onVerificationComplete(true)
    } catch (err) {
      setError("Verification failed. Please try again.")
      setIsVerifying(false)
    }
  }

  const simulateFileUpload = (setter: (value: boolean) => void) => {
    setter(true)
  }

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Verify Your Identity (Optional)</CardTitle>
        <CardDescription>Get verified to increase trust and security on the platform</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-purple-50 p-6 rounded-lg flex items-start space-x-3">
          <InfoIcon className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Why verify?</p>
            <p className="text-sm text-muted-foreground">
              Verifying your identity earns you a "Verified" badge on your profile, increasing trust among potential
              matches. This information is securely stored off-chain via Verida and never publicly disclosed.
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
          <div className="space-y-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input
              id="full-name"
              placeholder="Enter your legal name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-of-birth">Date of Birth</Label>
            <Input
              id="date-of-birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>ID Document</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
              {idUploaded ? (
                <div className="flex flex-col items-center text-green-600">
                  <BadgeCheckIcon className="h-8 w-8 mb-2" />
                  <p>ID Document Uploaded</p>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center text-muted-foreground"
                  onClick={() => simulateFileUpload(setIdUploaded)}
                >
                  <UploadIcon className="h-8 w-8 mb-2" />
                  <p>Upload a photo of your government-issued ID</p>
                  <p className="text-xs mt-1">(Passport, Driver's License, ID Card)</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Selfie Verification</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
              {selfieUploaded ? (
                <div className="flex flex-col items-center text-green-600">
                  <BadgeCheckIcon className="h-8 w-8 mb-2" />
                  <p>Selfie Uploaded</p>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center text-muted-foreground"
                  onClick={() => simulateFileUpload(setSelfieUploaded)}
                >
                  <UploadIcon className="h-8 w-8 mb-2" />
                  <p>Upload a clear photo of your face</p>
                  <p className="text-xs mt-1">(Will be compared to your ID document)</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button
          onClick={handleVerify}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          disabled={isVerifying}
        >
          {isVerifying ? (
            <div className="flex items-center">
              <span className="mr-2">Verifying...</span>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <ShieldCheckIcon className="mr-2 h-5 w-5" />
              <span>Verify My Identity</span>
            </div>
          )}
        </Button>
        <Button variant="ghost" onClick={onSkip} className="w-full" disabled={isVerifying}>
          Skip Verification
        </Button>
      </CardFooter>
    </>
  )
}

