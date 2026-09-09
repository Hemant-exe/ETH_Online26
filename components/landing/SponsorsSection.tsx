// "use client"

// import { motion, useAnimation, useInView } from "framer-motion"
// import { ArrowRight, SparklesIcon, Zap } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { useEffect, useRef } from "react"

// interface SponsorsSectionProps {
//   sectionRef: (el: HTMLElement | null) => void
// }

// export default function SponsorsSection({ sectionRef }: SponsorsSectionProps) {
//   const controls = useAnimation()
//   const containerRef = useRef(null)
//   const isInView = useInView(containerRef, { once: false, amount: 0.3 })
  
//   useEffect(() => {
//     if (isInView) {
//       controls.start("visible")
//     }
//   }, [controls, isInView])
  
//   const sponsors = [
//     {
//       name: "Cheqd",
//       logo: "/placeholder.svg",
//       tagline: "Ensuring blockchain integrity.",
//       letter: "C",
//       color: "from-purple-600 to-indigo-700",
//       delay: 0.2,
//     },
//     {
//       name: "Verida",
//       logo: "/placeholder.svg",
//       tagline: "Empowering decentralized identities.",
//       letter: "V",
//       color: "from-pink-600 to-purple-700",
//       delay: 0.4,
//     },
//   ]

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.3,
//         delayChildren: 0.2
//       }
//     }
//   }
  
//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { 
//       opacity: 1, 
//       y: 0,
//       transition: {
//         type: "spring",
//         stiffness: 100,
//         damping: 10
//       }
//     }
//   }

//   return (
//     <section
//       id="partners"
//       ref={sectionRef}
//       className="py-16 sm:py-20 md:py-32 relative bg-[#F9F5FF] overflow-hidden"
//     >
//       {/* Animated background elements */}
//       <div className="absolute inset-0 bg-pattern opacity-5"></div>
//       <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6D28D9]/30 to-transparent"></div>
//       <motion.div 
//         className="absolute -left-16 -top-16 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl"
//         animate={{ 
//           scale: [1, 1.2, 1],
//           opacity: [0.5, 0.8, 0.5]
//         }}
//         transition={{ 
//           duration: 8,
//           repeat: Infinity,
//           repeatType: "reverse"
//         }}
//       ></motion.div>
//       <motion.div 
//         className="absolute -right-16 -bottom-16 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl"
//         animate={{ 
//           scale: [1, 1.2, 1],
//           opacity: [0.5, 0.8, 0.5]
//         }}
//         transition={{ 
//           duration: 8,
//           repeat: Infinity,
//           repeatType: "reverse",
//           delay: 2
//         }}
//       ></motion.div>
      
//       {/* Floating particles */}
//       {[...Array(15)].map((_, i) => (
//         <motion.div 
//           key={i}
//           className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20"
//           style={{ 
//             left: `${Math.random() * 100}%`, 
//             top: `${Math.random() * 100}%`,
//             filter: `blur(${Math.random() > 0.5 ? '1px' : '0px'})` 
//           }}
//           animate={{ 
//             y: [0, -15, 0],
//             x: [0, Math.random() > 0.5 ? 10 : -10, 0],
//             opacity: [0, 1, 0],
//             scale: [0.8, Math.random() * 0.5 + 1, 0.8]
//           }}
//           transition={{ 
//             duration: 5 + Math.random() * 5,
//             repeat: Infinity,
//             delay: Math.random() * 5
//           }}
//         />
//       ))}

//       <div className="container mx-auto px-4 md:px-6 relative z-10">
//         <motion.div
//           ref={containerRef}
//           initial="hidden"
//           animate={controls}
//           variants={containerVariants}
//         >
//           <motion.div 
//             variants={itemVariants}
//             className="text-center mb-12"
//           >
//             <motion.div
//               className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-medium mb-3"
//               whileHover={{ scale: 1.05 }}
//             >
//               <motion.span 
//                 className="inline-flex items-center"
//                 animate={{ 
//                   scale: [1, 1.05, 1]
//                 }}
//                 transition={{ 
//                   duration: 2,
//                   repeat: Infinity
//                 }}
//               >
//                 <SparklesIcon className="h-3.5 w-3.5 mr-2" />
//                 Trusted Partners
//               </motion.span>
//             </motion.div>
//             <motion.h2 
//               className="text-3xl sm:text-4xl font-bold mb-3 text-[#1F2937] bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-pink-700"
//               animate={{ 
//                 backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
//               }}
//               transition={{ 
//                 duration: 15,
//                 repeat: Infinity
//               }}
//               style={{ backgroundSize: "200% 200%" }}
//             >
//               Powered By Industry Leaders
//             </motion.h2>
//             <p className="text-[#6B7280] max-w-2xl mx-auto">
//               Our platform is built on the foundations of trusted blockchain technology partners, ensuring security,
//               privacy, and innovation.
//             </p>
//           </motion.div>

//           <motion.div 
//             variants={itemVariants}
//             className="relative p-6 sm:p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#E5E7EB] shadow-lg"
//             whileHover={{ boxShadow: "0px 8px 30px rgba(109, 40, 217, 0.1)" }}
//           >
//             <div className="absolute inset-0 bg-pattern opacity-5 rounded-2xl"></div>
//             <motion.div 
//               className="absolute -inset-0.5 bg-gradient-to-r from-[#6D28D9]/10 to-[#EC4899]/10 rounded-2xl blur-sm"
//               animate={{ 
//                 backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
//               }}
//               transition={{ 
//                 duration: 10,
//                 repeat: Infinity
//               }}
//               style={{ backgroundSize: "200% 200%" }}
//             ></motion.div>

//             <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
//               {sponsors.map((sponsor, index) => (
//                 <motion.div 
//                   key={index} 
//                   className="relative group"
//                   variants={itemVariants}
//                   whileHover={{ 
//                     translateY: -5,
//                     transition: {
//                       type: "spring",
//                       stiffness: 400,
//                       damping: 10
//                     }
//                   }}
//                 >
//                   <motion.div 
//                     className="absolute -inset-0.5 bg-gradient-to-r from-[#6D28D9]/20 to-[#EC4899]/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm"
//                     animate={{ 
//                       backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
//                     }}
//                     transition={{ 
//                       duration: 10,
//                       repeat: Infinity
//                     }}
//                     style={{ backgroundSize: "200% 200%" }}
//                   ></motion.div>
//                   <motion.div 
//                     className="relative bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 h-full hover:shadow-md transition-all duration-500"
//                     whileHover={{
//                       backgroundColor: "rgba(255, 255, 255, 0.95)"
//                     }}
//                   >
//                     <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4">
//                       <motion.div 
//                         className={`w-16 h-16 rounded-xl bg-gradient-to-r ${sponsor.color} flex items-center justify-center text-3xl font-bold text-white relative overflow-hidden`}
//                         whileHover={{ 
//                           rotate: 5,
//                           scale: 1.05,
//                           boxShadow: "0px 5px 15px rgba(0,0,0,0.1)"
//                         }}
//                         transition={{
//                           type: "spring",
//                           stiffness: 300,
//                           damping: 10
//                         }}
//                       >
//                         <motion.div 
//                           className="absolute inset-0 bg-pattern opacity-10"
//                           animate={{
//                             backgroundPosition: ["0% 0%", "100% 100%"],
//                           }}
//                           transition={{
//                             duration: 20,
//                             repeat: Infinity,
//                             repeatType: "reverse"
//                           }}
//                         ></motion.div>
//                         <motion.span 
//                           className="relative z-10"
//                           animate={{ 
//                             scale: [1, 1.2, 1],
//                             textShadow: ["0px 0px 0px rgba(255,255,255,0)", "0px 0px 8px rgba(255,255,255,0.5)", "0px 0px 0px rgba(255,255,255,0)"],
//                           }}
//                           transition={{ 
//                             duration: 3,
//                             repeat: Infinity,
//                             delay: index * 1.5
//                           }}
//                         >
//                           {sponsor.letter}
//                         </motion.span>
                        
//                         {/* Lightning effect on hover */}
//                         <motion.div
//                           className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"
//                           transition={{ duration: 0.2 }}
//                         >
//                           <Zap className="h-5 w-5 text-white/80" />
//                         </motion.div>
//                       </motion.div>
//                       <div className="text-center sm:text-left">
//                         <motion.h3 
//                           className="text-xl font-bold text-[#1F2937]"
//                           whileHover={{ 
//                             color: index === 0 ? "#6D28D9" : "#EC4899",
//                             scale: 1.02,
//                             originX: 0
//                           }}
//                         >
//                           {sponsor.name}
//                         </motion.h3>
//                         <motion.p 
//                           className="text-[#6B7280] mt-1"
//                           initial={{ opacity: 0.8 }}
//                           whileHover={{ opacity: 1 }}
//                         >
//                           {sponsor.tagline}
//                         </motion.p>
//                       </div>
//                     </div>

//                     <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
//                       <div className="flex items-center justify-between">
//                         <motion.span 
//                           className="text-sm text-[#6B7280]"
//                           whileHover={{ 
//                             color: index === 0 ? "#6D28D9" : "#EC4899",
//                           }}
//                         >
//                           Trusted Partner
//                         </motion.span>
//                         <div className="flex">
//                           {[...Array(5)].map((_, i) => (
//                             <motion.div
//                               key={i}
//                               className={`w-1.5 h-6 bg-gradient-to-t ${sponsor.color} rounded-full mx-0.5`}
//                               initial={{ height: "16px", opacity: 0.8 }}
//                               whileHover={{ 
//                                 height: "24px", 
//                                 opacity: 1,
//                                 transition: {
//                                   type: "spring",
//                                   stiffness: 300,
//                                   damping: 10
//                                 }
//                               }}
//                               animate={{ 
//                                 height: ["16px", "24px", "16px"],
//                                 opacity: [0.7, 1, 0.7]
//                               }}
//                               transition={{ 
//                                 duration: 2,
//                                 delay: i * 0.2 + index,
//                                 repeat: Infinity,
//                                 repeatType: "reverse"
//                               }}
//                             ></motion.div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   </motion.div>
//                 </motion.div>
//               ))}
//             </div>

//             <motion.div 
//               className="mt-12 text-center"
//               variants={itemVariants}
//             >
//               <motion.div
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.98 }}
//                 transition={{ 
//                   type: "spring",
//                   stiffness: 400,
//                   damping: 10
//                 }}
//               >
//                 <Button
//                   variant="outline"
//                   className="border-[#6D28D9]/30 text-[#6D28D9] hover:bg-[#6D28D9]/10 rounded-xl px-6 py-5 text-lg group relative overflow-hidden"
//                 >
//                   <motion.span 
//                     className="flex items-center relative z-10"
//                     whileHover={{
//                       textShadow: "0px 0px 8px rgba(109, 40, 217, 0.3)"
//                     }}
//                   >
//                     Learn About Our Partners
//                     <motion.span
//                       animate={{ x: [0, 5, 0] }}
//                       transition={{ 
//                         duration: 1.5, 
//                         repeat: Infinity,
//                         repeatType: "reverse"
//                       }}
//                       className="inline-block ml-2"
//                     >
//                       <ArrowRight className="h-4 w-4" />
//                     </motion.span>
//                   </motion.span>
                  
//                   {/* Button background animation */}
//                   <motion.div
//                     className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 -z-10 opacity-0 group-hover:opacity-100"
//                     initial={{ x: "-100%" }}
//                     whileHover={{ x: "0%" }}
//                     transition={{ duration: 0.4 }}
//                   />
//                 </Button>
//               </motion.div>
//             </motion.div>
//           </motion.div>
//         </motion.div>
//       </div>

//       <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EC4899]/30 to-transparent"></div>
//     </section>
//   )
// } 