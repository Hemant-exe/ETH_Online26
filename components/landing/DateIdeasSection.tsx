"use client"

import { motion } from "framer-motion"
import {
  Coffee,
  Wine,
  Palette,
  Laugh,
  Tag,
  Clock,
  Check,
  Podcast,
  Film,
  ArrowRight,
  Utensils,
  Link
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DateIdeasSection() {
  return (
    <section className="py-20 md:py-32 relative bg-white">
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
              <Utensils className="h-3.5 w-3.5 mr-2" />
              Date Inspiration
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[#1F2937]">
              Discover Perfect{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#EC4899]">
                Date Ideas
              </span>
            </h2>

            <p className="text-xl text-[#4B5563]">
              Get personalized date suggestions based on shared interests and preferences, all while maintaining
              your privacy.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Coffee Date",
              icon: <Coffee className="h-8 w-8 text-white" />,
              description: "Start with a casual coffee meetup in a cozy café. Perfect for first introductions.",
              color: "from-[#FB923C] to-[#EA580C]",
              price: "$$",
              duration: "1-2 hours",
              attributes: ["Casual", "Conversation", "Relaxed"]
            },
            {
              title: "Fine Dining",
              icon: <Wine className="h-8 w-8 text-white" />,
              description: "Enjoy an elegant dinner at a top-rated restaurant. Ideal for special occasions.",
              color: "from-[#F9A8D4] to-[#BE185D]",
              price: "$$$$",
              duration: "2-3 hours",
              attributes: ["Romantic", "Upscale", "Intimate"]
            },
            {
              title: "Art Gallery",
              icon: <Palette className="h-8 w-8 text-white" />,
              description: "Explore local art exhibitions and discuss your impressions of various pieces.",
              color: "from-[#A5B4FC] to-[#4338CA]",
              price: "$$",
              duration: "1-3 hours",
              attributes: ["Cultural", "Inspiring", "Interactive"]
            },
            {
              title: "Comedy Show",
              icon: <Laugh className="h-8 w-8 text-white" />,
              description: "Share laughs at a stand-up comedy performance. Great for breaking the ice.",
              color: "from-[#BEF264] to-[#65A30D]",
              price: "$$$",
              duration: "2 hours",
              attributes: ["Fun", "Entertaining", "Shared Experience"]
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group flip-card"
            >
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <div className="relative bg-white shadow-sm border border-[#E5E7EB] h-full">
                    <div className={`h-32 bg-gradient-to-r ${item.color} flex items-center justify-center relative`}>
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="relative z-10">{item.icon}</div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-[#1F2937]">{item.title}</h3>
                      <p className="text-[#6B7280] mb-4">{item.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-[#6B7280]">
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-1" />
                          <span>{item.price}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{item.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flip-card-back">
                  <div className={`bg-gradient-to-br ${item.color} h-full p-6 text-white`}>
                    <h3 className="text-xl font-bold mb-4">Why It Works</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-sm">Perfect for discovering shared interests</p>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-sm">Creates memorable shared experiences</p>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-sm">83% of our successful couples started here</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <div className="flex flex-wrap gap-2">
                        {item.attributes.map((attr, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white"
                          >
                            {attr}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="absolute bottom-6 left-6 right-6">
                      <button className="w-full py-2 bg-white text-sm font-medium rounded-lg" style={{ color: `var(--tw-gradient-to)` }}>
                        Save Idea
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add a complementary music taste visualization section */}
        <div className="mt-12 text-center">
          <div className="inline-block">
            <h3 className="text-xl font-bold mb-6 text-[#1F2937]">Finding Your Perfect Date Based On Music Taste</h3>
            
            <div className="flex items-end justify-center h-20 gap-1 mb-4">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className="music-bar"
                  style={{ 
                    animationDelay: `${i * 0.1}s`,
                    height: `${Math.random() * 15 + 5}px`
                  }}
                ></div>
              ))}
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9F5FF] text-[#6D28D9] text-sm">
                <Podcast className="h-4 w-4" />
                <span>Shared Playlist Generation</span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9F5FF] text-[#6D28D9] text-sm">
                <Film className="h-4 w-4" />
                <span>Concert Date Planning</span>
              </div>
            </div>
          </div>
          <Link href="/wallet">
          <Button className="mt-8 bg-gradient-to-r from-[#6D28D9] to-[#EC4899] text-white hover:opacity-90 rounded-xl gooey-button">
            <span className="flex items-center">
              Explore More Date Ideas
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