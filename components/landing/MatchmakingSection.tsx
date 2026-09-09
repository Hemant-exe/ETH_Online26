"use client"

import { motion } from "framer-motion"
import {
  HeartHandshake,
  HeartPulse,
  Flame,
  Gem,
  Glasses
} from "lucide-react"

export default function MatchmakingSection() {
  return (
    <section className="py-16 relative bg-[#F9F5FF]/50">
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6D28D9]/30 to-transparent"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#6D28D9]/10 to-[#EC4899]/10 border border-[#6D28D9]/30 text-sm font-medium text-[#EC4899] mb-6">
              <HeartHandshake className="h-3.5 w-3.5 mr-2" />
              Perfect Matches
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#1F2937]">
              Find Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#EC4899]">
                Perfect Match
              </span>
            </h2>

            <p className="text-lg text-[#4B5563] max-w-2xl mx-auto">
              Our AI-powered matching algorithm finds compatible partners based on shared values, interests, and
              preferences.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Shared Interests",
              icon: <Glasses className="h-6 w-6 text-[#EC4899]" />,
              description: "Connect with people who share your passions and hobbies.",
              interests: ["Travel", "Music", "Cooking", "Fitness", "Art", "Reading"],
            },
            {
              title: "Value-Based Matching",
              icon: <Gem className="h-6 w-6 text-[#6D28D9]" />,
              description: "Find partners who align with your core values and life goals.",
              values: ["Family", "Career", "Adventure", "Spirituality", "Growth", "Community"],
            },
            {
              title: "Compatibility Scoring",
              icon: <HeartPulse className="h-6 w-6 text-[#EC4899]" />,
              description: "Our algorithm calculates compatibility scores based on multiple factors.",
              factors: ["Communication Style", "Life Goals", "Personality", "Habits", "Love Language"],
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6D28D9]/20 to-[#EC4899]/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              <div className="relative bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 h-full hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-[#6D28D9]/10 to-[#EC4899]/10 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-[#1F2937]">{item.title}</h3>
                  <p className="text-[#6B7280] mb-4">{item.description}</p>

                  <div className="flex flex-wrap justify-center gap-2 mt-auto">
                    {item.interests &&
                      item.interests.map((interest, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F9F5FF] text-[#6D28D9]"
                        >
                          {interest}
                        </span>
                      ))}
                    {item.values &&
                      item.values.map((value, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F0ABFC]/20 text-[#9D174D]"
                        >
                          {value}
                        </span>
                      ))}
                    {item.factors &&
                      item.factors.map((factor, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#818CF8]/20 text-[#3730A3]"
                        >
                          {factor}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EC4899]/30 to-transparent"></div>
    </section>
  )
} 