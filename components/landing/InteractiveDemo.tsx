"use client"

import { motion } from "framer-motion"
import { 
  Flame, 
  Verified, 
  MapPin, 
  PercentCircle, 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  Syringe, 
  Shield, 
  HeartPulse, 
  SparklesIcon, 
  ArrowRight 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function InteractiveDemo() {
  return (
    <div className="mt-16 mb-12">
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#6D28D9]/10 to-[#EC4899]/10 border border-[#6D28D9]/30 text-sm font-medium text-[#EC4899] mb-6">
            <Flame className="h-3.5 w-3.5 mr-2" />
            Interactive Demo
          </div>

          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[#1F2937]">
            Experience Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#EC4899]">
              Matching System
            </span>
          </h3>

          <p className="text-lg text-[#4B5563] max-w-2xl mx-auto">
            Try our intuitive swipe interface to see how our matching system works.
          </p>
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
        <div className="swipe-card-container">
          <div className="swipe-card glass-card p-5">
            <div className="flex flex-col h-full">
              <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                <img 
                  src="/Tom_cruise.svg?height=300&width=300" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-1.5">
                  <Verified className="h-5 w-5 text-[#4BB543]" />
                </div>
                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs text-white">
                  94% Match
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xl font-bold">Alex, 28</h4>
                  <div className="flex items-center gap-1 text-xs">
                    <MapPin className="h-3 w-3 text-[#EC4899]" />
                    <span>2 miles away</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">Blockchain developer and coffee enthusiast. Looking for someone to explore the city with!</p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {["Coffee", "Tech", "Hiking", "Art"].map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F9F5FF] text-[#6D28D9]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-auto flex justify-between">
                <button className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center border border-[#E5E7EB]">
                  <ThumbsDown className="h-6 w-6 text-gray-400" />
                </button>
                
                <div className="flex flex-col items-center justify-center">
                  <PercentCircle className="h-6 w-6 text-[#EC4899]" />
                  <span className="text-xs font-medium text-[#EC4899]">94%</span>
                </div>
                
                <button className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center border border-[#E5E7EB]">
                  <Heart className="h-6 w-6 text-[#EC4899]" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-sm">
          <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
            <h4 className="text-lg font-bold mb-4 text-[#1F2937]">How Our Matching Works</h4>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F9F5FF] flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="h-4 w-4 text-[#6D28D9]" />
                </div>
                <div>
                  <p className="text-sm text-[#4B5563]">Our AI analyzes 28+ compatibility factors including values, interests, and goals.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F9F5FF] flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 text-[#6D28D9]" />
                </div>
                <div>
                  <p className="text-sm text-[#4B5563]">All profiles are verified using our decentralized identity system for added security.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F9F5FF] flex items-center justify-center flex-shrink-0">
                  <HeartPulse className="h-4 w-4 text-[#6D28D9]" />
                </div>
                <div>
                  <p className="text-sm text-[#4B5563]">Compatibility scores are calculated in real-time as your preferences evolve.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F9F5FF] flex items-center justify-center flex-shrink-0">
                  <Syringe className="h-4 w-4 text-[#6D28D9]" />
                </div>
                <div>
                  <p className="text-sm text-[#4B5563]">Optional health verification allows sharing of vaccination status through our secure system.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
              <Link href="/wallet">
              <Button className="w-full bg-gradient-to-r from-[#6D28D9] to-[#EC4899] text-white hover:opacity-90 rounded-xl gooey-button">
                <span className="flex items-center justify-center">
                  Try The Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 