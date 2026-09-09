"use client"

import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeartLoaderProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  text?: string
  className?: string
}

export function HeartLoader({ 
  size = "md", 
  showText = false, 
  text = "Loading...", 
  className 
}: HeartLoaderProps) {
  // Size mappings
  const sizes = {
    sm: {
      container: "w-10 h-10",
      heart: "h-4 w-4"
    },
    md: {
      container: "w-16 h-16",
      heart: "h-6 w-6"
    },
    lg: {
      container: "w-24 h-24",
      heart: "h-10 w-10"
    }
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("relative mx-auto mb-2", sizes[size].container)}>
        <div className="absolute inset-0 border-t-2 border-b-2 border-[#6D28D9] rounded-full animate-spin"></div>
        <div className="absolute inset-0 border-r-2 border-l-2 border-[#EC4899] rounded-full animate-spin animate-delay-150"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart className={cn("text-[#EC4899]", sizes[size].heart)} />
        </div>
      </div>
      
      {showText && (
        <p className="text-[#EC4899] text-sm font-medium">{text}</p>
      )}
    </div>
  )
} 