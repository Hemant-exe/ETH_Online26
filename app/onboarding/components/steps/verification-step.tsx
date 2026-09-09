"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircleIcon, ShieldCheckIcon, RefreshCwIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface VerificationStepProps {
  onComplete: () => void
}

export default function VerificationStep({ onComplete }: VerificationStepProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captchaCompleted, setCaptchaCompleted] = useState(false)
  const [captchaValue, setCaptchaValue] = useState(Math.floor(Math.random() * 10) + 1)
  const [userAnswer, setUserAnswer] = useState<number | null>(null)

  const handleVerify = () => {
    if (userAnswer !== captchaValue + captchaValue) {
      setError("Incorrect answer. Please try again.")
      return
    }

    setIsVerifying(true)
    setError(null)

    // Simulate verification process
    setTimeout(() => {
      setCaptchaCompleted(true)
      setIsVerifying(false)

      // Wait a moment before proceeding to next step
      setTimeout(() => {
        onComplete()
      }, 1000)
    }, 1500)
  }

  const refreshCaptcha = () => {
    setCaptchaValue(Math.floor(Math.random() * 10) + 1)
    setUserAnswer(null)
    setError(null)
  }

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Quick Verification</CardTitle>
        <CardDescription>To keep our platform safe from bots and verify your Cheqd identity, please complete this quick verification</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {captchaCompleted ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-center font-medium text-green-600">Verification complete</p>
            <p className="text-center text-muted-foreground">Thanks for helping us maintain a secure environment</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-6 py-4">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">Please solve this simple math problem:</p>
              <div className="flex items-center justify-center space-x-2">
                <div className="text-2xl font-bold">
                  What is {captchaValue} + {captchaValue}?
                </div>
                <Button variant="ghost" size="icon" onClick={refreshCaptcha} className="h-8 w-8">
                  <RefreshCwIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-center space-x-2">
              {[...Array(5)].map((_, i) => {
                const value = captchaValue + captchaValue - 2 + i
                return (
                  <Button
                    key={i}
                    variant={userAnswer === value ? "default" : "outline"}
                    className={`h-12 w-12 ${userAnswer === value ? "bg-purple-600" : ""}`}
                    onClick={() => {
                      setUserAnswer(value)
                      setError(null)
                    }}
                  >
                    {value}
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        <Separator />

        <div className="text-center text-sm text-muted-foreground">
          This verification helps us prevent automated bots from accessing our platform and ensures your Cheqd identity is properly verified,
          providing a better experience for all users.
        </div>
      </CardContent>
      <CardFooter>
        {!captchaCompleted && (
          <Button
            onClick={handleVerify}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            disabled={isVerifying || userAnswer === null}
          >
            {isVerifying ? (
              <div className="flex items-center">
                <span className="mr-2">Verifying...</span>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              "Verify"
            )}
          </Button>
        )}

        {captchaCompleted && (
          <Button
            onClick={onComplete}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Continue
          </Button>
        )}
      </CardFooter>
    </>
  )
}

