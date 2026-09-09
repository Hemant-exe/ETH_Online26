"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SponsorsProps {
  sponsors: {
    name: string
    logo: string
    tagline: string
    letter: string
  }[]
}

export default function Sponsors({ sponsors }: SponsorsProps) {
  return (
    <div className="container mx-auto px-4 md:px-6 mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 text-[#1F2937]">Powered By Industry Leaders</h2>
          <p className="text-[#6B7280]">
            Our platform is built on the foundations of trusted blockchain technology partners, ensuring security,
            privacy, and innovation.
          </p>
        </div>

        <div className="relative p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#E5E7EB] shadow-lg">
          <div className="absolute inset-0 bg-pattern opacity-5 rounded-2xl"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6D28D9]/10 to-[#EC4899]/10 rounded-2xl blur-sm"></div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {sponsors.map((sponsor, index) => (
              <div key={index} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6D28D9]/20 to-[#EC4899]/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                <div className="relative bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 h-full hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-[#6D28D9]/10 to-[#EC4899]/10 flex items-center justify-center text-3xl font-bold text-[#6D28D9] relative overflow-hidden">
                      <div className="absolute inset-0 bg-pattern opacity-10"></div>
                      <span className="relative z-10">{sponsor.letter}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#1F2937]">{sponsor.name}</h3>
                    </div>
                  </div>
                  <p className="text-[#6B7280]">{sponsor.tagline}</p>

                  <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B7280]">Trusted Partner</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1.5 h-6 bg-gradient-to-t from-[#6D28D9] to-[#EC4899] rounded-full mx-0.5"
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="outline"
              className="border-[#6D28D9]/30 text-[#6D28D9] hover:bg-[#6D28D9]/10 rounded-xl"
            >
              <span className="flex items-center">
                Learn About Our Partners
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 