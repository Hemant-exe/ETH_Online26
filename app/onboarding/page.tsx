"use client"

import { Suspense, lazy } from 'react'
import { Card } from "@/components/ui/card"
import { HeartLoader } from "@/components/ui/heart-loader"

// Use dynamic import to avoid SSR issues
const OnboardingFlow = lazy(() => import("./components/onboarding-flow"))

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 to-purple-50 flex items-center justify-center p-4">
      <Suspense fallback={
        <Card className="w-full max-w-2xl shadow-xl flex items-center justify-center p-10">
          <div className="text-center">
            <HeartLoader size="lg" showText text="Loading wallet connection..." />
          </div>
        </Card>
      }>
        <OnboardingFlow />
      </Suspense>
    </main>
  )
}

