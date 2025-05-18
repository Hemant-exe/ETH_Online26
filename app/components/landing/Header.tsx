// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import { motion, AnimatePresence } from "framer-motion"
// import { Heart, Menu, X, Wallet } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { cn } from "@/lib/utils"
// import EthereumConnectButton from "@/components/wallet/EthereumConnectButton"

// interface HeaderProps {
//   activeSection: number
//   scrollY: number
//   navItems: { name: string; href: string }[]
// }

// export default function Header({ activeSection, scrollY, navItems }: HeaderProps) {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

//   return (
//     <>
//       <header
//         className={cn(
//           "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
//           scrollY > 50 ? "bg-white/90 backdrop-blur-md py-3 shadow-sm" : "bg-transparent py-5",
//         )}
//       >
//         <div className="container mx-auto px-4 md:px-6">
//           <div className="flex items-center justify-between">
//             <Link href="/" className="flex items-center space-x-2">
//               <div className="relative w-10 h-10 bg-gradient-to-r from-[#6D28D9] to-[#EC4899] rounded-xl flex items-center justify-center overflow-hidden group">
//                 <div className="absolute inset-0 bg-gradient-to-r from-[#6D28D9] to-[#EC4899] opacity-80 group-hover:opacity-100 transition-opacity"></div>
//                 <div className="absolute inset-0 bg-pattern opacity-30"></div>
//                 <Heart className="h-5 w-5 text-white relative z-10" />
//               </div>
//               <span className="font-bold text-xl tracking-tight text-[#1F2937]">DecentralMatch</span>
//             </Link>

//             <nav className="hidden md:flex items-center space-x-6">
//               {navItems.map((item, index) => (
//                 <Link
//                   key={index}
//                   href={item.href}
//                   className={cn(
//                     "text-sm font-medium transition-colors hover:text-[#EC4899]",
//                     activeSection === index ? "text-[#EC4899]" : "text-[#4B5563]",
//                   )}
//                   onClick={(e) => {
//                     e.preventDefault()
//                     document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" })
//                   }}
//                 >
//                   {item.name}
//                 </Link>
//               ))}
//             </nav>

//             <div className="flex items-center gap-4">
//               <div className="hidden md:block">
//                 <EthereumConnectButton />
//               </div>

//               <button
//                 className="md:hidden text-[#4B5563] hover:text-[#1F2937]"
//                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               >
//                 {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Mobile menu */}
//       <AnimatePresence>
//         {mobileMenuOpen && (
//           <motion.div
//             className="fixed inset-0 z-30 bg-white/98 md:hidden pt-20"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             transition={{ duration: 0.2 }}
//           >
//             <div className="flex flex-col items-center justify-start h-full gap-6 p-6">
//               {navItems.map((item, index) => (
//                 <Link
//                   key={index}
//                   href={item.href}
//                   className={cn(
//                     "text-xl font-medium py-2 border-b-2 w-full text-center",
//                     activeSection === index ? "text-[#EC4899] border-[#EC4899]" : "text-[#4B5563] border-transparent",
//                   )}
//                   onClick={(e) => {
//                     e.preventDefault()
//                     document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" })
//                     setMobileMenuOpen(false)
//                   }}
//                 >
//                   {item.name}
//                 </Link>
//               ))}
//               <div className="mt-4 w-full">
//                 <EthereumConnectButton />
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   )
// } 