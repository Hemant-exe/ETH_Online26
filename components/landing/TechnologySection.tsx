"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronRight, ArrowRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FeatureProps {
  title: string
  icon: React.ReactNode
  description: string
  details: string[]
}

interface TechnologySectionProps {
  sectionRef: (el: HTMLElement | null) => void
  features: FeatureProps[]
}

export default function TechnologySection({ sectionRef, features }: TechnologySectionProps) {
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null)

  return (
    <section
      id="technology"
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
              <Zap className="h-3.5 w-3.5 mr-2" />
              Revolutionary Technology
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[#1F2937]">
              Blockchain-Powered{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#EC4899]">
                Dating Revolution
              </span>
            </h2>

            <p className="text-xl text-[#4B5563]">
              Our platform combines cutting-edge blockchain technology, decentralized identities, and AI-powered
              matchmaking to create a secure and authentic dating experience.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative group"
                onClick={() => setExpandedFeature(expandedFeature === index ? null : index)}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6D28D9]/20 to-[#EC4899]/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                <div className="relative bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 h-full hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#6D28D9]/10 to-[#EC4899]/10 flex items-center justify-center flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-[#1F2937]">{feature.title}</h3>
                      <p className="text-[#6B7280]">{feature.description}</p>

                      <AnimatePresence>
                        {expandedFeature === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 pt-4 border-t border-[#E5E7EB]"
                          >
                            <h4 className="font-medium mb-2 text-[#EC4899]">Key Benefits:</h4>
                            <ul className="space-y-2">
                              {feature.details.map((detail, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <Check className="h-4 w-4 text-[#6D28D9] flex-shrink-0 mt-0.5" />
                                  <span className="text-[#4B5563]">{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="mt-4">
                        <button className="text-[#EC4899] text-sm font-medium hover:text-[#EC4899]/80 transition-colors flex items-center">
                          {expandedFeature === index ? "Show less" : "Learn more"}
                          <ChevronRight
                            className={`ml-1 h-4 w-4 transition-transform ${expandedFeature === index ? "rotate-90" : ""}`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6D28D9]/30 to-[#EC4899]/30 rounded-xl blur-lg opacity-75"></div>
            <div className="relative bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 overflow-hidden">
              <div className="absolute inset-0 bg-pattern opacity-5"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2">
                  <div className="aspect-video relative bg-[#F9F5FF] rounded-xl overflow-hidden border border-[#E5E7EB]">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#6D28D9]/20 to-[#EC4899]/20 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-[#EC4899]"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                        </svg>
                      </div>
                    </div>

                    {/* Blockchain visualization overlay */}
                    <div className="absolute inset-0 bg-[#F9F5FF]/60 backdrop-blur-sm pointer-events-none">
                      <div className="blockchain-visualization-light">
                        <div className="blockchain-block-light block-1"></div>
                        <div className="blockchain-block-light block-2"></div>
                        <div className="blockchain-block-light block-3"></div>
                        <div className="blockchain-block-light block-4"></div>
                        <div className="blockchain-connection-light connection-1-2"></div>
                        <div className="blockchain-connection-light connection-2-3"></div>
                        <div className="blockchain-connection-light connection-3-4"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4 text-[#1F2937]">How Our Technology Works</h3>
                  <p className="text-[#4B5563] mb-6">
                    Our platform uses zero-knowledge proofs, decentralized identifiers, and verifiable credentials
                    to create a secure dating environment where your data remains under your control at all times.
                  </p>

                  <div className="space-y-4">
                    {[
                      "Self-sovereign identity management",
                      "Decentralized data storage",
                      "Cryptographic verification",
                      "Privacy-preserving AI",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#6D28D9]/20 to-[#EC4899]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-[#EC4899]" />
                        </div>
                        <span className="text-[#4B5563]">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <Button className="bg-gradient-to-r from-[#6D28D9] to-[#EC4899] text-white hover:opacity-90 rounded-xl">
                      <span className="flex items-center">
                        Read Whitepaper
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EC4899]/30 to-transparent"></div>
    </section>
  )
} 