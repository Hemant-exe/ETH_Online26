"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Shield, Lock, Key, ExternalLink, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function SecurityPrivacy() {
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerify = () => {
    setIsVerifying(true)

    // Simulate API call
    setTimeout(() => {
      setIsVerifying(false)

      toast({
        title: "Security Verified",
        description: "Your AI twin's security settings have been verified.",
        variant: "default",
      })
    }, 2000)
  }

  return (
    <motion.div
      className="backdrop-blur-xl bg-white/60 rounded-[2rem] border border-pink-200 p-6 shadow-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative elements */}
      <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 opacity-30"></div>
      <div className="absolute -bottom-12 -left-12 w-24 h-24 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 opacity-30"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-xl">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Privacy & Security</h3>
        </div>

        <div className="space-y-8">
          <div className="backdrop-blur-sm bg-white/80 rounded-xl border border-pink-100 p-5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-pink-100">
                <Key className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">DID Integration</h4>
                <p className="text-slate-700 mb-4">
                  Your DID ensures you own your data. Your AI can be revoked at any time, giving you complete control
                  over your digital identity.
                </p>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Your DID is securely linked to your profile</span>
                </div>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-white/80 rounded-xl border border-pink-100 p-5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-pink-100">
                <Lock className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">Data Encryption</h4>
                <p className="text-slate-700 mb-4">
                  Your chat data is analyzed privately—no third parties can read your messages. The AI processes your
                  data locally or within a secure environment.
                </p>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>End-to-end encryption enabled</span>
                </div>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-white/80 rounded-xl border border-pink-100 p-5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-pink-100">
                <Shield className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">Blockchain Protocol</h4>
                <p className="text-slate-600">
                  All AI transactions (updates, logs) are verified using blockchain technology for added security, ensuring the
                  authenticity of every interaction with your AI Twin.
                </p>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Protocol verification active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700 rounded-full"
              onClick={handleVerify}
              disabled={isVerifying}
            >
              <Shield className="h-4 w-4 mr-2" />
              {isVerifying ? "Verifying..." : "Verify Security"}
            </Button>

            <Button
              variant="outline"
              className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700 rounded-full"
              onClick={() => window.open("#", "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Privacy Policy
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

