"use client"

import { motion } from "framer-motion"
import { Shield, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HeroContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#6D28D9]/10 to-[#EC4899]/10 border border-[#6D28D9]/30 text-sm font-medium text-[#EC4899] mb-6">
        <Shield className="h-3.5 w-3.5 mr-2" />
        Secure. Private. Decentralized.
      </div>

      <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-[#1F2937]">
        Discover Love on the{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#EC4899]">
          Decentralized Frontier
        </span>
      </h1>

      <p className="text-lg md:text-xl text-[#4B5563] max-w-3xl mx-auto mb-8">
        Powered by the security of Cheqd and the trust of Verida.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button
          size="lg"
          className="bg-gradient-to-r from-[#6D28D9] to-[#EC4899] text-white hover:opacity-90 group relative overflow-hidden rounded-xl"
        >
          <span className="absolute inset-0 bg-pattern opacity-20"></span>
          <span className="relative flex items-center">
            Join the Revolution
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="border-[#6D28D9]/30 text-[#6D28D9] hover:bg-[#6D28D9]/10 rounded-xl"
        >
          Learn More
        </Button>
      </div>

      <div className="flex items-center gap-4 text-sm text-[#6B7280]">
        <div className="flex -space-x-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#EC4899] flex items-center justify-center text-xs text-white font-medium border-2 border-white"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
        <span>
          Join <span className="text-[#EC4899] font-medium">2,500+</span> early adopters
        </span>
      </div>
    </motion.div>
  )
} 