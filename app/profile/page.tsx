"use client"

import { Suspense, lazy } from 'react'
import { Card } from "@/components/ui/card"
import { HeartLoader } from "@/components/ui/heart-loader"

// Use dynamic import to avoid SSR issues
const ProfileCreationFlow = lazy(() => import("./components/profile-creation-flow"))

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-100 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Suspense fallback={
        <Card className="w-full max-w-5xl shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden flex items-center justify-center p-10">
          <div className="text-center">
            <HeartLoader size="lg" showText text="Loading profile creation..." />
          </div>
        </Card>
      }>
        <ProfileCreationFlow />
      </Suspense>
    </main>
  )
}

