import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import DatingNavbar from "./components/dating-navbar"
import MainWrapper from "./components/main-wrapper"

export const metadata = {
  title: "Proof of Heart — Dating Where Everyone Is Provably Human",
  description:
    "A dating platform where World ID Selfie Check proves every profile belongs to a unique real person, and AI twins screen for compatibility over paid, auditable Hedera x402 calls.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <div className="min-h-screen">
            <DatingNavbar />
            <MainWrapper>{children}</MainWrapper>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}