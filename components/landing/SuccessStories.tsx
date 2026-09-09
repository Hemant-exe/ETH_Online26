"use client"

import { motion } from "framer-motion"
import { Heart, ArrowRight, MapPin, HeartPulse, Verified, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SuccessStories() {
  const stories = [
    {
      couple: "Sarah & Michael",
      image: "/placeholder.svg?height=300&width=300",
      story:
        "We matched based on our shared love for blockchain technology. Six months later, we're building our first dApp together!",
      location: "New York, USA",
      time: "Together for 6 months",
      rotation: "-3deg",
      tags: ["Tech", "Blockchain", "Startups"]
    },
    {
      couple: "Aisha & David",
      image: "/placeholder.svg?height=300&width=300",
      story:
        "The privacy features gave me confidence to be myself. We connected instantly and are now planning our wedding!",
      location: "London, UK",
      time: "Engaged after 1 year",
      rotation: "2deg",
      tags: ["Privacy", "Travel", "Art"]
    },
    {
      couple: "Carlos & Jun",
      image: "/placeholder.svg?height=300&width=300",
      story:
        "We were matched based on our values and interests. The AI knew we were perfect for each other before we did!",
      location: "Singapore",
      time: "Together for 8 months",
      rotation: "-2deg",
      tags: ["AI", "Gaming", "Food"]
    },
  ]

  return (
    <section className="py-20 relative overflow-hidden bg-white">
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
              <Heart className="h-3.5 w-3.5 mr-2" />
              Love Stories
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#1F2937]">
              Real{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#EC4899]">
                Success Stories
              </span>
            </h2>

            <p className="text-lg text-[#4B5563] max-w-2xl mx-auto">
              Discover how our decentralized platform has helped people find meaningful connections and lasting
              relationships.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {stories.map((story, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="polaroid-frame" style={{ "--rotation": story.rotation } as any}>
                <div className="relative bg-white rounded-lg overflow-hidden h-full hover:shadow-md transition-shadow">
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#6D28D9]/10 to-[#EC4899]/10"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#EC4899] flex items-center justify-center text-white text-xl font-bold">
                          {story.couple
                            .split(" & ")
                            .map((name) => name[0])
                            .join("&")}
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent h-12"></div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-[#1F2937]">{story.couple}</h3>
                      <div className="text-[#EC4899]">
                        <Verified className="h-4 w-4" fill="#EC4899" />
                      </div>
                    </div>
                    
                    <div className="love-letter p-3 mb-4">
                      <p className="love-text text-[#6B7280] italic">"{story.story}"</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {story.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#F9F5FF] text-[#6D28D9]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-[#6B7280]">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {story.location}
                      </span>
                      <span className="flex items-center">
                        <HeartPulse className="h-3.5 w-3.5 mr-1 text-[#EC4899]" />
                        {story.time}
                      </span>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className="emoji-reaction rounded-full bg-[#F9F5FF] p-1">
                            <ThumbsUp className="h-4 w-4 text-[#6D28D9]" />
                          </div>
                          <span className="text-xs text-[#6B7280]">128</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <div className="flex -space-x-2">
                            {[...Array(3)].map((_, i) => (
                              <div
                                key={i}
                                className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#EC4899] flex items-center justify-center text-[10px] text-white font-medium border-2 border-white"
                              >
                                {String.fromCharCode(65 + i)}
                              </div>
                            ))}
                          </div>
                          
                          <div className="gooey-button bg-gradient-to-r from-[#6D28D9] to-[#EC4899] text-white text-xs px-3 py-1 rounded-full">
                            Share Story
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button className="bg-gradient-to-r from-[#6D28D9] to-[#EC4899] text-white hover:opacity-90 rounded-xl">
            <span className="flex items-center">
              Share Your Story
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EC4899]/30 to-transparent"></div>
    </section>
  )
} 