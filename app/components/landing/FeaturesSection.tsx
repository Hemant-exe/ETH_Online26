"use client"

import { motion } from "framer-motion"
import { Sparkles, UserCircle, Shield, Lock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FeaturesSectionProps {
  sectionRef: (el: HTMLElement | null) => void
}

export default function FeaturesSection({ sectionRef }: FeaturesSectionProps) {
  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-20 md:py-32 relative bg-[#F9F5FF]"
    >
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EC4899]/30 to-transparent"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#6D28D9]/10 to-[#EC4899]/10 border border-[#6D28D9]/30 text-sm font-medium text-[#EC4899] mb-6">
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              Unique Features
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[#1F2937]">
              Your Profile as a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#EC4899]">
                Unique NFT
              </span>
            </h2>

            <p className="text-xl text-[#4B5563]">
              Take full ownership of your dating profile with our revolutionary NFT-based approach, ensuring your
              data sovereignty and authenticity.
            </p>
          </motion.div>
        </div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6D28D9]/30 to-[#EC4899]/30 rounded-xl blur-lg opacity-75"></div>
            <div className="relative bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-8 overflow-hidden">
              <div className="absolute inset-0 bg-pattern opacity-5"></div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Profile Ownership",
                    icon: <UserCircle className="h-8 w-8 text-[#EC4899]" />,
                    description:
                      "Your profile is minted as an NFT that you fully own and control, ensuring complete data sovereignty.",
                  },
                  {
                    title: "Verifiable Credentials",
                    icon: <Shield className="h-8 w-8 text-[#6D28D9]" />,
                    description:
                      "Build trust through verified credentials without exposing sensitive personal information.",
                  },
                  {
                    title: "Secure Connections",
                    icon: <Lock className="h-8 w-8 text-[#8B5CF6]" />,
                    description: "All interactions are end-to-end encrypted and secured by blockchain technology.",
                  },
                ].map((item, index) => (
                  <div key={index} className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-xl bg-[#F9F5FF] flex items-center justify-center mb-4">
                        {item.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-[#1F2937]">{item.title}</h3>
                      <p className="text-[#6B7280]">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-[#E5E7EB]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-2 text-[#1F2937]">Ready to Own Your Dating Experience?</h3>
                    <p className="text-[#6B7280]">
                      Join the revolution and take control of your digital dating identity.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#6D28D9] to-[#EC4899] text-white hover:opacity-90 rounded-xl"
                  >
                    <span className="flex items-center">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6D28D9]/30 to-transparent"></div>
    </section>
  )
} 