"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface JourneyStep {
  step: number
  title: string
  description: string
  icon: React.ReactNode
}

interface JourneySectionProps {
  sectionRef: (el: HTMLElement | null) => void
  journeySteps: JourneyStep[]
}

export default function JourneySection({ sectionRef, journeySteps }: JourneySectionProps) {
  return (
    <section 
      id="journey" 
      ref={sectionRef} 
      className="py-20 md:py-32 relative bg-white"
    >
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6D28D9]/30 to-transparent"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#6D28D9]/10 to-[#EC4899]/10 border border-[#6D28D9]/30 text-sm font-medium text-[#EC4899] mb-6">
              <ArrowRight className="h-3.5 w-3.5 mr-2" />
              Your Journey
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[#1F2937]">
              From Wallet to {" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#EC4899]">
                Meaningful Connection
              </span>
            </h2>

            <p className="text-xl text-[#4B5563]">
              Our streamlined process makes it easy to get started with decentralized dating, from connecting your
              wallets to finding your perfect match.
            </p>
          </motion.div>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#6D28D9] to-[#EC4899] md:-translate-x-px"></div>

          <div className="space-y-12 relative">
            {journeySteps.map((step, index) => {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="relative"
                >
                  {/* Center icon on the timeline for all steps */}
                  <div className="absolute left-[14px] md:left-1/2 md:-ml-5 z-10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#EC4899] flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>
                  
                  {/* Content layout */}
                  <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-start gap-8 pt-2`}>
                    <div className="flex items-center md:w-1/2">
                      <div className="md:hidden ml-14">
                        <span className="text-sm text-[#EC4899] font-medium">Step {step.step}</span>
                        <h3 className="text-xl font-bold text-[#1F2937]">{step.title}</h3>
                      </div>
                      <div className="md:block hidden"></div>
                    </div>

                    <div className="pl-14 md:pl-0 md:w-1/2">
                      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
                        <div className="hidden md:block mb-2">
                          <span className="text-sm text-[#EC4899] font-medium">Step {step.step}</span>
                          <h3 className="text-xl font-bold text-[#1F2937]">{step.title}</h3>
                        </div>
                        <p className="text-[#6B7280]">{step.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link href="/wallet">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#6D28D9] to-[#EC4899] text-white hover:opacity-90 rounded-xl"
            >
              <span className="flex items-center">
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EC4899]/30 to-transparent"></div>
    </section>
  )
}
