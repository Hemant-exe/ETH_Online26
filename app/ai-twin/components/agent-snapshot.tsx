"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, RefreshCw, Clock, Edit2, Sparkles, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Mock data - would be fetched from your API
const agentData = {
  name: "Cupid",
  personality: "Friendly & Witty",
  status: "active", // active, paused, learning
  lastSync: "2023-10-15T14:30:00Z",
  matchAccuracy: 87,
}

export default function AgentSnapshot() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const handleRefresh = () => {
    setIsRefreshing(true)

    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false)
      toast({
        title: "AI Twin Updated",
        description: "Your AI twin has been refreshed with your latest data.",
        variant: "default",
      })
    }, 2000)
  }

  return (
    <motion.div
      className="backdrop-blur-xl bg-white/60 rounded-[2.5rem] border border-pink-200 p-6 shadow-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative elements */}
      <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 opacity-50"></div>
      <div className="absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 opacity-50"></div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-300 to-rose-300 rounded-full blur-md animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-pink-500 to-rose-500 p-4 rounded-full">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-800">{agentData.name}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full bg-white/80 hover:bg-pink-50 text-pink-600"
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="sr-only">Edit Name</span>
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 border-pink-200 rounded-full"
                >
                  {agentData.personality}
                </Badge>
                <Badge
                  variant="outline"
                  className={`rounded-full ${
                    agentData.status === "active"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : agentData.status === "paused"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {agentData.status === "active" && <CheckCircle className="h-3 w-3 mr-1" />}
                  {agentData.status === "paused" && <Clock className="h-3 w-3 mr-1" />}
                  {agentData.status === "learning" && <Sparkles className="h-3 w-3 mr-1" />}
                  {agentData.status.charAt(0).toUpperCase() + agentData.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <Clock className="h-4 w-4 text-pink-500" />
              <span>Last updated: {formatDate(agentData.lastSync)}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700 rounded-full"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh AI"}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="backdrop-blur-sm bg-white/80 rounded-xl border border-pink-100 p-4 flex flex-col items-center">
            <div className="text-3xl font-bold text-pink-600 mb-1">{agentData.matchAccuracy}%</div>
            <div className="text-sm text-slate-600">Match Accuracy</div>
          </div>

          <div className="backdrop-blur-sm bg-white/80 rounded-xl border border-pink-100 p-4 flex flex-col items-center">
            <div className="text-3xl font-bold text-pink-600 mb-1">24</div>
            <div className="text-sm text-slate-600">Matches Found</div>
          </div>

          <div className="backdrop-blur-sm bg-white/80 rounded-xl border border-pink-100 p-4 flex flex-col items-center">
            <div className="text-3xl font-bold text-pink-600 mb-1">12</div>
            <div className="text-sm text-slate-600">Conversations Assisted</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

