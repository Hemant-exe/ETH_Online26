"use client"

import { motion } from "framer-motion"
import { Heart } from "lucide-react"

export default function DNACompatibility() {
  return (
    <div className="mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="relative p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#E5E7EB] shadow-lg">
          <div className="absolute inset-0 bg-pattern opacity-5 rounded-2xl"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6D28D9]/10 to-[#EC4899]/10 rounded-2xl blur-sm"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2 text-[#1F2937]">DNA Compatibility Visualization</h3>
              <p className="text-[#6B7280]">Our innovative algorithm analyzes compatibility at the deepest level</p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="w-full md:w-1/2 flex justify-center">
                <div className="relative h-[300px] w-[200px]">
                  {/* DNA Helix Animation */}
                  <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className="absolute">
                        <div 
                          className="dna-step" 
                          style={{ 
                            top: `${i * 10}px`, 
                            transform: `rotateY(${i % 2 ? 180 : 0}deg)`,
                            animation: `dna-rotate 3s ease-in-out infinite ${i * 0.15}s` 
                          } as any}
                        ></div>
                      </div>
                    ))}
                    
                    {/* Animated matching indicators */}
                    <div className="absolute top-[50px] left-[5px] sparkle-effect">
                      <div className="bg-[#EC4899] text-white text-xs px-2 py-1 rounded-full">Interests</div>
                    </div>
                    <div className="absolute top-[120px] right-[5px] sparkle-effect" style={{ animationDelay: "1s" }}>
                      <div className="bg-[#6D28D9] text-white text-xs px-2 py-1 rounded-full">Values</div>
                    </div>
                    <div className="absolute top-[190px] left-[5px] sparkle-effect" style={{ animationDelay: "2s" }}>
                      <div className="bg-[#EC4899] text-white text-xs px-2 py-1 rounded-full">Goals</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-1/2">
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-[#1F2937]">Your Perfect Match is Based On:</h4>
                  
                  {[
                    { label: "Shared Interests", percentage: 92, color: "#EC4899" },
                    { label: "Core Values", percentage: 85, color: "#6D28D9" },
                    { label: "Life Goals", percentage: 78, color: "#EC4899" },
                    { label: "Communication Style", percentage: 88, color: "#6D28D9" },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-[#4B5563]">{item.label}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium" style={{ color: item.color }}>{item.percentage}%</span>
                          <Heart className="h-3 w-3 text-[#EC4899]" fill="#EC4899" />
                        </div>
                      </div>
                      <div className="compatibility-meter">
                        <div 
                          className="compatibility-meter-fill" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                        {[...Array(3)].map((_, i) => (
                          <div 
                            key={i} 
                            className="compatibility-meter-bubble"
                            style={{
                              width: `${Math.random() * 10 + 5}px`,
                              height: `${Math.random() * 10 + 5}px`,
                              left: `${(item.percentage / 100) * Math.random() * 80 + 10}%`,
                              top: `${Math.random() * 70 + 15}%`,
                              animationDelay: `${i * 0.5}s`
                            } as any}
                          ></div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-6 pt-4 border-t border-dashed border-[#E5E7EB]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#EC4899] flex items-center justify-center">
                          <Heart className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-[#1F2937]">Overall Compatibility</div>
                          <div className="text-xs text-[#6B7280]">Based on 28 compatibility factors</div>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#EC4899]">
                        87%
                      </div>
                    </div>
                    
                    {/* Heart Rate Line */}
                    <div className="mt-3 heart-rate-line"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 