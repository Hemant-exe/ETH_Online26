"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { Sparkles, UserCircle, Shield, Lock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRef } from "react"

interface FeaturesSectionProps {
  sectionRef: (el: HTMLElement | null) => void
}

export default function FeaturesSection({ sectionRef }: FeaturesSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8])

  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-20 md:py-32 relative bg-[#F9F5FF] overflow-hidden"
    >
      <motion.div 
        className="absolute inset-0 bg-pattern opacity-5"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.div 
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EC4899]/30 to-transparent"
        animate={{
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10" ref={containerRef}>
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-16"
          style={{ opacity, scale }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#6D28D9]/10 to-[#EC4899]/10 border border-[#6D28D9]/30 text-sm font-medium text-[#EC4899] mb-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              Unique Features
            </motion.div>

            <motion.h2 
              className="text-3xl md:text-5xl font-bold mb-6 text-[#1F2937]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Your Profile as a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#EC4899]">
                Unique NFT
              </span>
            </motion.h2>

            <motion.p 
              className="text-xl text-[#4B5563]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Take full ownership of your dating profile with our revolutionary NFT-based approach, ensuring your
              data sovereignty and authenticity.
            </motion.p>
          </motion.div>
        </motion.div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="absolute -inset-0.5 bg-gradient-to-r from-[#6D28D9]/30 to-[#EC4899]/30 rounded-xl blur-lg opacity-75"
              animate={{
                opacity: [0.5, 0.75, 0.5],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-[#E5E7EB] p-8 overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-pattern opacity-5"
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />

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
                  <motion.div 
                    key={index} 
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <motion.div 
                        className="w-16 h-16 rounded-xl bg-[#F9F5FF] flex items-center justify-center mb-4"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {item.icon}
                      </motion.div>
                      <h3 className="text-xl font-bold mb-2 text-[#1F2937]">{item.title}</h3>
                      <p className="text-[#6B7280]">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                className="mt-12 pt-8 border-t border-[#E5E7EB]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-2 text-[#1F2937]">Ready to Own Your Dating Experience?</h3>
                    <p className="text-[#6B7280]">
                      Join the revolution and take control of your digital dating identity.
                    </p>
                  </div>
                  <Link href="/wallet">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-[#6D28D9] to-[#EC4899] text-white hover:opacity-90 rounded-xl relative overflow-hidden group"
                      >
                        <motion.span 
                          className="absolute inset-0 bg-gradient-to-r from-[#EC4899] to-[#6D28D9] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          initial={false}
                          animate={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        />
                        <span className="flex items-center relative z-10">
                          Get Started
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </motion.div>
                        </span>
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6D28D9]/30 to-transparent"
        animate={{
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />
    </section>
  )
} 