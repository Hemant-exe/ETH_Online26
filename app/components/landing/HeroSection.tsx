"use client"

import { motion } from "framer-motion"
import { Shield, ArrowRight, Heart, UserCircle, Lock, Fingerprint, HeartPulse, Flame, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface HeroSectionProps {
  sectionRef: (el: HTMLElement | null) => void
}

export default function HeroSection({ sectionRef }: HeroSectionProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Responsive handling
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Initial check
    checkScreenSize()
    
    // Add event listener
    window.addEventListener('resize', checkScreenSize)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const sponsors = [
    {
      name: "Cheqd",
      logo: "/placeholder.svg",
    },
    {
      name: "Verida",
      logo: "/placeholder.svg",
    },
  ]

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-screen pt-24 pb-16 md:pt-32 md:pb-28 lg:pt-40 lg:pb-32 overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-purple-600/10 to-pink-500/10 border border-purple-600/30 text-sm font-medium text-pink-500 mb-6">
                <Shield className="h-3.5 w-3.5 mr-2" />
                Secure. Private. Decentralized.
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 text-gray-800">
                Discover Love on the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                  Decentralized Frontier
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 md:mb-10">
                Powered by the security of Cheqd and the trust of Verida.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 group relative overflow-hidden rounded-xl"
                >
                  <span className="absolute inset-0 bg-pattern opacity-20"></span>
                  <span className="relative flex items-center">
                    Join the Revolution
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-purple-600/30 text-purple-600 hover:bg-purple-600/10 rounded-xl"
                >
                  Learn More
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-xs text-white font-medium border-2 border-white"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span>
                  Join <span className="text-pink-500 font-medium">2,500+</span> early adopters
                </span>
              </div>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              {/* Main illustration - creative blob shape with 3D effect */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-pink-500/20 rounded-3xl blur-lg"></div>
                <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden p-4 sm:p-6">
                  <div className="absolute inset-0 bg-pattern opacity-5"></div>

                  {/* 3D floating elements with improved responsiveness */}
                  <div className="relative h-72 sm:h-80 md:h-96 w-full">
                    {/* Floating profile cards - enhanced with better animations */}
                    <FloatingProfileCard 
                      position="top-[5%] left-[5%] sm:top-[10%] sm:left-[10%]" 
                      width="w-36 sm:w-44 md:w-48"
                      animationProps={{
                        y: [-5, -15, -5],
                        rotate: [-5, -2, -5],
                        duration: 5,
                        delay: 0
                      }}
                      profileId="3872"
                    />

                    <FloatingProfileCard 
                      position="top-[25%] right-[3%] sm:top-[30%] sm:right-[5%]" 
                      width="w-40 sm:w-48 md:w-56"
                      animationProps={{
                        y: [-8, -20, -8],
                        rotate: [3, 5, 3],
                        duration: 6,
                        delay: 0.5
                      }}
                      profileId="4291"
                      withStats={true}
                    />

                    {/* Floating feature badges - Enhanced with better animations */}
                    <FloatingBadge
                      position="bottom-[12%] left-[15%] sm:bottom-[15%] sm:left-[20%]"
                      icon={<Lock className="h-4 w-4 text-purple-600" />}
                      text="End-to-End Encrypted"
                      animationProps={{
                        y: [-4, -12, -4],
                        x: [0, 5, 0],
                        duration: 4.2,
                        delay: 0.3
                      }}
                    />

                    <FloatingBadge
                      position="bottom-[28%] right-[10%] sm:bottom-[30%] sm:right-[15%]"
                      icon={<Fingerprint className="h-4 w-4 text-pink-500" />}
                      text="Verified Identity"
                      animationProps={{
                        y: [-5, -15, -5],
                        x: [0, -5, 0],
                        duration: 5.1,
                        delay: 0.7
                      }}
                    />

                    <FloatingBadge
                      position="top-[12%] right-[20%] sm:top-[15%] sm:right-[25%]"
                      icon={<HeartPulse className="h-4 w-4 text-pink-500" />}
                      text="95% Match"
                      animationProps={{
                        y: [-3, -10, -3],
                        x: [0, -3, 0],
                        duration: 4.5,
                        delay: 0.2
                      }}
                      pulseEffect="pink"
                    />

                    <FloatingBadge
                      position="bottom-[40%] left-[30%] sm:bottom-[45%] sm:left-[35%]"
                      icon={<Flame className="h-4 w-4 text-orange-500" />}
                      text="Popular Profile"
                      animationProps={{
                        y: [-4, -13, -4],
                        x: [0, 4, 0],
                        duration: 3.8,
                        delay: 0.5
                      }}
                      pulseEffect="orange"
                    />

                    {/* Central heart element - Enhanced with better animations */}
                    <motion.div 
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 sm:w-24 h-20 sm:h-24"
                      animate={{ 
                        y: [0, -12, 0]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="relative w-full h-full">
                        {/* Pulsing background circles */}
                        <motion.div 
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: "radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(109,40,217,0.2) 70%, rgba(255,255,255,0) 100%)"
                          }}
                          animate={{ 
                            scale: [1, 1.5, 1],
                            opacity: [0.4, 0.2, 0.4]
                          }}
                          transition={{ 
                            duration: 4,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        />
                        <motion.div 
                          className="absolute inset-2 rounded-full"
                          style={{
                            background: "radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(109,40,217,0.2) 50%, rgba(255,255,255,0) 100%)"
                          }}
                          animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.25, 0.4, 0.25],
                            rotate: [0, 180, 360]
                          }}
                          transition={{ 
                            duration: 8,
                            repeat: Infinity
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            <motion.div
                              animate={{ 
                                scale: [1, 1.15, 1],
                                rotate: [0, 5, 0, -5, 0]
                              }}
                              transition={{ 
                                duration: 3,
                                repeat: Infinity,
                                repeatType: "mirror"
                              }}
                            >
                              <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-pink-500 drop-shadow-lg" />
                            </motion.div>
                            <motion.div 
                              className="absolute -top-1 -right-1"
                              animate={{
                                y: [0, -3, 0],
                                x: [0, 3, 0]
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse"
                              }}
                            >
                              <div className="relative">
                                <motion.div 
                                  className="absolute inset-0 bg-white rounded-full" 
                                  animate={{ 
                                    opacity: [0, 0.75, 0],
                                    scale: [1, 1.5, 1]
                                  }}
                                  transition={{ 
                                    duration: 2,
                                    repeat: Infinity
                                  }}
                                />
                                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 relative" />
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Enhanced connection lines with better responsive SVG */}
                    <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <ConnectionLine 
                        path="M25,25 L50,50" 
                        delay={0.5} 
                        duration={3} 
                      />
                      <ConnectionLine 
                        path="M75,30 L50,50" 
                        delay={0.7} 
                        duration={4} 
                      />
                      <ConnectionLine 
                        path="M30,75 L50,50" 
                        delay={0.9} 
                        duration={3.5} 
                      />
                      <ConnectionLine 
                        path="M70,70 L50,50" 
                        delay={1.1} 
                        duration={2.5} 
                      />

                      <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6D28D9" />
                          <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Floating hearts - Enhanced with better responsive sizing and positioning */}
                    {[...Array(isMobile ? 4 : 6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{
                          top: `${20 + Math.random() * 60}%`,
                          left: `${20 + Math.random() * 60}%`,
                          zIndex: -1,
                          opacity: 0.15 + Math.random() * 0.15
                        }}
                        animate={{
                          y: [0, -15 - Math.random() * 10, 0],
                          x: [0, Math.random() > 0.5 ? 10 : -10, 0],
                          rotate: [0, Math.random() > 0.5 ? 15 : -15, 0],
                          scale: [0.8 + Math.random() * 0.3, 1 + Math.random() * 0.3, 0.8 + Math.random() * 0.3]
                        }}
                        transition={{
                          duration: 3 + Math.random() * 4,
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: Math.random() * 2
                        }}
                      >
                        <Heart className={i % 2 === 0 ? "h-3 w-3 sm:h-4 sm:w-4 text-pink-500" : "h-2 w-2 sm:h-3 sm:w-3 text-purple-500"} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sponsors Section */}
      <div className="container mx-auto px-4 md:px-6 mt-12 sm:mt-16 md:mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">Powered By Industry Leaders</h2>
            <p className="text-gray-500">
              Our platform is built on the foundations of trusted blockchain technology partners, ensuring security,
              privacy, and innovation.
            </p>
          </div>

          <div className="relative p-6 sm:p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
            <div className="absolute inset-0 bg-pattern opacity-5 rounded-2xl"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/10 to-pink-500/10 rounded-2xl blur-sm"></div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {sponsors.map((sponsor, index) => (
                <div key={index} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-pink-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-r from-purple-600/10 to-pink-500/10 flex items-center justify-center text-2xl sm:text-3xl font-bold text-purple-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-pattern opacity-10"></div>
                        <span className="relative z-10">{sponsor.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800">{sponsor.name}</h3>
                      </div>
                    </div>
                    <p className="text-gray-500">{sponsor.name === "Cheqd" ? "Cheqd" : "Verida"}</p>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Trusted Partner</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 h-6 bg-gradient-to-t from-purple-600 to-pink-500 rounded-full mx-0.5"
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button
                variant="outline"
                className="border-purple-600/30 text-purple-600 hover:bg-purple-600/10 rounded-xl"
              >
                <span className="flex items-center">
                  Learn About Our Partners
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-600/30 to-transparent"></div>
    </section>
  )
}

// Reusable Floating Profile Card Component
interface FloatingProfileCardProps {
  position: string
  width: string
  animationProps: {
    y: number[]
    rotate: number[]
    duration: number
    delay: number
  }
  profileId: string
  withStats?: boolean
}

const FloatingProfileCard = ({ position, width, animationProps, profileId, withStats = false }: FloatingProfileCardProps) => {
  return (
    <motion.div 
      className={`absolute ${position} ${width} transform z-10`}
      animate={{ 
        y: animationProps.y,
        rotate: animationProps.rotate
      }}
      transition={{ 
        duration: animationProps.duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: animationProps.delay
      }}
    >
      <motion.div 
        className="bg-white rounded-xl shadow-lg p-3 sm:p-4 border border-gray-200 backdrop-blur-sm bg-white/90"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <motion.div 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center"
            animate={{ 
              boxShadow: ["0px 0px 0px rgba(109, 40, 217, 0)", "0px 0px 8px rgba(109, 40, 217, 0.3)", "0px 0px 0px rgba(109, 40, 217, 0)"] 
            }}
            transition={{ duration: 4, repeat: Infinity, delay: animationProps.delay }}
          >
            <UserCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </motion.div>
          <div>
            <h3 className="font-medium text-xs sm:text-sm text-gray-800">NFT Profile #{profileId}</h3>
            <div className="flex items-center text-xs text-pink-500">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ duration: 2, repeat: Infinity, delay: animationProps.delay }}
              >
                <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
              </motion.div>
              <span className="text-xs">Verified</span>
            </div>
          </div>
        </div>

        {withStats && (
          <div className="grid grid-cols-2 gap-2 mb-2 sm:mb-3">
            <motion.div 
              className="bg-purple-50 rounded p-1.5 sm:p-2 text-xs overflow-hidden relative"
              whileHover={{ backgroundColor: "#F3E8FF" }}
            >
              <span className="text-gray-500 text-xs">Trust Score</span>
              <div className="flex items-center">
                <span className="text-pink-500 font-medium text-xs">98%</span>
                <div className="ml-2 h-1 bg-gray-200 rounded-full w-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-pink-500 rounded-full" 
                    initial={{ width: "0%" }}
                    animate={{ width: "98%" }}
                    transition={{ duration: 1, delay: 0.5 + animationProps.delay }}
                  />
                </div>
              </div>
              <motion.div 
                className="absolute -right-1 -bottom-1 bg-pink-200 rounded-full w-5 h-5 sm:w-6 sm:h-6 opacity-20" 
                animate={{ scale: [0, 1.5, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 + animationProps.delay }}
              />
            </motion.div>
            <motion.div 
              className="bg-purple-50 rounded p-1.5 sm:p-2 text-xs overflow-hidden relative"
              whileHover={{ backgroundColor: "#F3E8FF" }}
            >
              <span className="text-gray-500 text-xs">Compatibility</span>
              <div className="flex items-center">
                <span className="text-purple-600 font-medium text-xs">87%</span>
                <div className="ml-2 h-1 bg-gray-200 rounded-full w-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-purple-600 rounded-full" 
                    initial={{ width: "0%" }}
                    animate={{ width: "87%" }}
                    transition={{ duration: 1, delay: 0.8 + animationProps.delay }}
                  />
                </div>
              </div>
              <motion.div 
                className="absolute -right-1 -bottom-1 bg-purple-200 rounded-full w-5 h-5 sm:w-6 sm:h-6 opacity-20" 
                animate={{ scale: [0, 1.5, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 2 + animationProps.delay }}
              />
            </motion.div>
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i} 
              className="bg-purple-50 p-1 rounded-full"
              whileHover={{ scale: 1.2, backgroundColor: "#F3E8FF" }}
              animate={{ 
                scale: [1, i === (withStats ? 1 : 2) ? 1.1 : 1, 1]
              }}
              transition={{ 
                duration: 2 + i, 
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.3 + animationProps.delay * 0.5
              }}
            >
              <div className="h-2 w-2 sm:h-3 sm:w-3" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Reusable Floating Badge Component
interface FloatingBadgeProps {
  position: string
  icon: React.ReactNode
  text: string
  animationProps: {
    y: number[]
    x: number[]
    duration: number
    delay: number
  }
  pulseEffect?: "pink" | "purple" | "orange"
}

const FloatingBadge = ({ position, icon, text, animationProps, pulseEffect }: FloatingBadgeProps) => {
  return (
    <motion.div 
      className={`absolute ${position} z-20`}
      animate={{ 
        y: animationProps.y,
        x: animationProps.x
      }}
      transition={{ 
        duration: animationProps.duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: animationProps.delay
      }}
    >
      <motion.div 
        className="flex items-center gap-1.5 sm:gap-2 bg-white rounded-full shadow-lg px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-200 backdrop-blur-sm bg-white/90"
        whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <motion.div
          animate={
            pulseEffect === "pink" ? { 
              scale: [1, 1.2, 1],
              color: ["#EC4899", "#F43F5E", "#EC4899"]
            } : 
            pulseEffect === "orange" ? { 
              rotate: [0, 5, 0, -5, 0],
              scale: [1, 1.1, 1, 1.1, 1]
            } : { 
              rotate: [0, pulseEffect ? 5 : 10, 0]
            }
          }
          transition={
            pulseEffect ? { 
              duration: 1.5, 
              repeat: Infinity 
            } : { 
              duration: 2, 
              repeat: Infinity, 
              repeatType: "reverse"
            }
          }
        >
          {icon}
        </motion.div>
        <span className="text-xs sm:text-xs font-medium">{text}</span>
      </motion.div>
    </motion.div>
  )
}

// Connection Line Component
interface ConnectionLineProps {
  path: string
  delay: number
  duration: number
}

const ConnectionLine = ({ path, delay, duration }: ConnectionLineProps) => {
  return (
    <>
      <motion.path 
        d={path} 
        stroke="url(#gradient1)" 
        strokeWidth="0.5" 
        strokeDasharray="3 2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.7 }}
        transition={{ duration: 2, delay }}
      />
      <motion.circle r="0.7" fill="#EC4899">
        <animateMotion 
          path={path} 
          dur={`${duration}s`} 
          repeatCount="indefinite" 
          rotate="auto"
        />
      </motion.circle>
    </>
  )
}