"use client"

import { motion } from "framer-motion"
import { SparklesIcon as Sparkles, Flame, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CompatibilityCalculator() {
  return (
    <section className="py-20 md:py-32 relative bg-[#F9F5FF]">
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
              <Flame className="h-3.5 w-3.5 mr-2" />
              Interactive Experience
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[#1F2937]">
              Find Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#EC4899]">
                Perfect Match
              </span>
            </h2>

            <p className="text-xl text-[#4B5563]">
              Try our interactive compatibility calculator to see how our AI-powered matching works.
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

              <div className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-2xl font-bold mb-6 text-[#1F2937]">Your Preferences</h3>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-[#4B5563] mb-2">
                          What are your top interests?
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {["Travel", "Music", "Food", "Art", "Sports", "Technology", "Reading", "Movies"].map(
                            (interest, i) => (
                              <label
                                key={i}
                                className="flex items-center gap-2 cursor-pointer bg-[#F9F5FF] hover:bg-[#F9F5FF]/80 transition-colors px-3 py-1.5 rounded-md border border-[#E5E7EB]"
                              >
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-4 h-4 rounded border border-[#D1D5DB] peer-checked:bg-gradient-to-r from-[#6D28D9] to-[#EC4899] peer-checked:border-transparent flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
                                </div>
                                <span className="text-sm">{interest}</span>
                              </label>
                            ),
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#4B5563] mb-2">
                          What values matter most to you?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {["Family", "Career", "Adventure", "Spirituality", "Growth", "Community"].map(
                            (value, i) => (
                              <div key={i} className="relative">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  defaultValue="50"
                                  className="w-full h-2 bg-[#F9F5FF] rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="block text-xs text-[#6B7280] mt-1">{value}</span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#4B5563] mb-2">
                          What are you looking for?
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {["Casual Dating", "Serious Relationship", "Friendship", "Marriage"].map((type, i) => (
                            <label
                              key={i}
                              className="flex items-center gap-2 cursor-pointer bg-[#F9F5FF] hover:bg-[#F9F5FF]/80 transition-colors px-3 py-1.5 rounded-md border border-[#E5E7EB]"
                            >
                              <input type="radio" name="relationship-type" className="sr-only peer" />
                              <div className="w-4 h-4 rounded-full border border-[#D1D5DB] peer-checked:bg-gradient-to-r from-[#6D28D9] to-[#EC4899] peer-checked:border-transparent"></div>
                              <span className="text-sm">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <h3 className="text-2xl font-bold mb-6 text-[#1F2937]">Your Compatibility Results</h3>

                    <div className="flex-1 bg-[#F9F5FF] rounded-xl p-6 relative overflow-hidden">
                      <div className="absolute inset-0 bg-pattern opacity-5"></div>

                      <div className="relative z-10">
                        <div className="flex justify-center mb-8">
                          <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center">
                              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#EC4899] flex items-center justify-center text-white text-3xl font-bold">
                                87%
                              </div>
                            </div>
                            <div className="absolute -top-2 -right-2">
                              <div className="relative">
                                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
                                <Sparkles className="h-6 w-6 text-[#F59E0B] relative" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <h4 className="text-lg font-bold text-center mb-4 text-[#1F2937]">
                          Excellent Match Potential!
                        </h4>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-[#6B7280]">Shared Interests</span>
                              <span className="font-medium text-[#6D28D9]">92%</span>
                            </div>
                            <div className="h-2 bg-white rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#6D28D9] to-[#EC4899] rounded-full w-[92%]"></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-[#6B7280]">Value Alignment</span>
                              <span className="font-medium text-[#6D28D9]">85%</span>
                            </div>
                            <div className="h-2 bg-white rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#6D28D9] to-[#EC4899] rounded-full w-[85%]"></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-[#6B7280]">Relationship Goals</span>
                              <span className="font-medium text-[#6D28D9]">78%</span>
                            </div>
                            <div className="h-2 bg-white rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#6D28D9] to-[#EC4899] rounded-full w-[78%]"></div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 p-4 bg-white rounded-lg border border-[#E5E7EB]">
                          <p className="text-sm text-[#4B5563]">
                            Based on your preferences, our AI would match you with profiles that share your love for
                            music, art, and technology, with strong family values and a desire for meaningful
                            connections.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button className="mt-6 bg-gradient-to-r from-[#6D28D9] to-[#EC4899] text-white hover:opacity-90 rounded-xl">
                      <span className="flex items-center">
                        Find Real Matches
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

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6D28D9]/30 to-transparent"></div>
    </section>
  )
} 