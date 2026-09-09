"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldIcon, KeyIcon, RefreshCwIcon, Copy, CheckCircle2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock data - would be fetched from your API or localStorage
const defaultDidData = {
  veridaDid: "", // 
  cheqdDid: "", // 
  verificationStatus: "Verified",
  lastVerified: "2023-09-10T11:20:00Z",
  expirationDate: "2024-09-10T11:20:00Z",
}

export default function DidSettings() {
  const [copied, setCopied] = useState<string | null>(null)
  const [didData, setDidData] = useState(defaultDidData)
  
  useEffect(() => {
    // Try to get DIDs from localStorage
    const veridaDid = localStorage.getItem("veridaDID");
    const cheqdDid = localStorage.getItem("cheqdWalletAddress");
    
    if (veridaDid || cheqdDid) {
      setDidData(prev => ({
        ...prev,
        ...(veridaDid ? { veridaDid } : {}),
        ...(cheqdDid ? { cheqdDid } : {})
      }));
    }
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="backdrop-blur-sm bg-white/80 rounded-2xl border border-indigo-100 p-6 relative overflow-hidden shadow-md">
      <div className="absolute -bottom-32 -left-32 opacity-10 pointer-events-none">
        <motion.div
          className="w-64 h-64 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <ShieldIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-slate-800">Your Decentralized Identity (DID)</h2>
        </div>

        <p className="text-slate-600 mb-6">Manage your DID and verification status</p>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 mb-8">
                <p className="text-sm text-slate-700">
                  Your DID is your secure, private identifier. You can update its keys or verification status here.
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-white border border-blue-200 text-slate-700">
              <p className="max-w-xs">
                Your DID enables secure, private interactions and verifiable credentials in the decentralized ecosystem.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <motion.div
          className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 p-4 mb-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-medium text-indigo-700 mb-3">Verida DID</h3>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200/50 to-indigo-200/50 rounded-md blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <code className="relative block w-full rounded-md bg-white px-3 py-2 font-mono text-xs sm:text-sm text-slate-700 overflow-x-auto whitespace-nowrap">
                {didData.veridaDid}
              </code>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600"
              onClick={() => copyToClipboard(didData.veridaDid, "veridaDid")}
            >
              {copied === "veridaDid" ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Badge className="bg-gradient-to-r from-purple-400 to-fuchsia-400 text-white border-0">
              Data Storage
            </Badge>
          </div>
        </motion.div>

        <motion.div
          className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 p-4 mb-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-medium text-indigo-700 mb-3">Cheqd DID</h3>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200/50 to-indigo-200/50 rounded-md blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <code className="relative block w-full rounded-md bg-white px-3 py-2 font-mono text-xs sm:text-sm text-slate-700 overflow-x-auto whitespace-nowrap">
                {didData.cheqdDid}
              </code>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600"
              onClick={() => copyToClipboard(didData.cheqdDid, "cheqdDid")}
            >
              {copied === "cheqdDid" ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Badge className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white border-0">
              Identity
            </Badge>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <motion.div
            className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 p-4 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sm font-medium text-indigo-700 mb-3">Verification Status</h3>
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-green-400 to-emerald-400 text-white border-0">
                {didData.verificationStatus}
              </Badge>
              <ShieldIcon className="h-4 w-4 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 p-4 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-sm font-medium text-indigo-700 mb-3">Last Verified</h3>
            <p className="text-slate-700">{formatDate(didData.lastVerified)}</p>
          </motion.div>

          <motion.div
            className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 p-4 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-sm font-medium text-indigo-700 mb-3">Expires</h3>
            <p className="text-slate-700">{formatDate(didData.expirationDate)}</p>
          </motion.div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:bg-blue-100 text-blue-700"
          >
            <KeyIcon className="h-4 w-4" />
            Rotate DID Keys
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200 hover:bg-indigo-100 text-indigo-700"
          >
            <RefreshCwIcon className="h-4 w-4" />
            Renew Verification
          </Button>
        </div>
      </div>
    </div>
  )
}

