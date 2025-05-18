"use client"

import { usePathname } from "next/navigation"
import React from "react"

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // List of pages where navbar doesn't appear
  const excludedPages = ["/", "/profile", "/onboarding", "/ai-twin", "/wallet"]
  const isExcludedPage = excludedPages.some(page => pathname === page || pathname.startsWith(`${page}/`))
  
  return (
    <main className={isExcludedPage ? "" : "pt-20 pb-16 md:pb-0"}>
      {children}
    </main>
  )
} 