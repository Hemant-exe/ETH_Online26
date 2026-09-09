"use client"

import { InfoIcon } from "lucide-react"

import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SelfieCheckPanel } from "@/app/components/identity/selfie-check-panel"
import { SELFIE_CHECK_VALIDITY_DAYS } from "@/app/lib/identity/world-config"

interface VerifyHumanStepProps {
  onVerified: (accountId: string) => void
}

/**
 * Selfie Check gate in the profile-creation flow.
 *
 * Replaces the DID-creation step. The difference is not cosmetic: creating a
 * DID proved nothing about who was behind it, whereas passing Selfie Check
 * proves a unique living person is — and refuses to let that person hold a
 * second profile.
 */
export default function VerifyHumanStep({ onVerified }: VerifyHumanStepProps) {
  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Prove You&apos;re Human</CardTitle>
        <CardDescription>
          One quick face check. It is what keeps bots and duplicate profiles off Proof of Heart.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <SelfieCheckPanel onVerified={onVerified}>
          <div className="bg-purple-50 p-6 rounded-lg flex items-start space-x-3">
            <InfoIcon className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Why we ask</p>
              <p className="text-sm text-muted-foreground">
                World ID&apos;s Selfie Check confirms a real, unique person is behind this profile and returns
                a single anonymous identifier — never your face, name, or any biometric data. That identifier
                can hold exactly one profile here, which is what makes catfishing structurally impossible
                rather than merely against the rules. Valid for {SELFIE_CHECK_VALIDITY_DAYS} days.
              </p>
            </div>
          </div>
        </SelfieCheckPanel>
      </CardContent>

      <CardFooter />
    </>
  )
}
