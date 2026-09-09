"use client"

import { ShieldCheckIcon } from "lucide-react"

import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SelfieCheckPanel } from "@/app/components/identity/selfie-check-panel"

interface VerificationStepProps {
  onComplete: () => void
}

/**
 * Human verification during onboarding.
 *
 * This step used to be an arithmetic captcha ("what is 7 + 7?"), which stops
 * nobody: a scripted signup solves it faster than a person, and it says
 * nothing at all about whether the same person already has ten other
 * profiles. Selfie Check answers both questions — a unique living human, and
 * one profile each.
 */
export default function VerificationStep({ onComplete }: VerificationStepProps) {
  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Verify You&apos;re Human</CardTitle>
        <CardDescription>
          The one check that keeps bots, scammers and duplicate profiles out.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <SelfieCheckPanel onVerified={() => onComplete()}>
          <div className="bg-purple-50 p-6 rounded-lg flex items-start space-x-3">
            <ShieldCheckIcon className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">What this proves</p>
              <p className="text-sm text-muted-foreground">
                That you are a real, unique person — and that you do not already have an account here. World
                ID returns one anonymous identifier and nothing else: no face, no name, no biometrics, and
                nothing we could link back to you. You can browse without verifying, but verified profiles
                rank higher, are not rate-limited, and are the only ones that can run a twin screening.
              </p>
            </div>
          </div>
        </SelfieCheckPanel>
      </CardContent>

      <CardFooter />
    </>
  )
}
