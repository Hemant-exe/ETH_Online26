"use client"

import { Heart } from "lucide-react"

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#F9F5FF] to-[#FFF0F5] flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 border-t-2 border-b-2 border-[#6D28D9] rounded-full animate-spin"></div>
          <div className="absolute inset-0 border-r-2 border-l-2 border-[#EC4899] rounded-full animate-spin animate-delay-150"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart className="h-10 w-10 text-[#EC4899]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#4B5563]">VeraLove</h2>
        <p className="text-[#EC4899] mt-2">Initializing secure environment...</p>
      </div>
    </div>
  )
} 