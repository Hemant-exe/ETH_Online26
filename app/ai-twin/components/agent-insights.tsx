"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart, RefreshCw, Heart, MessageCircle, Clock, ThumbsUp } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Chart } from "@/components/ui/chart"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

// Mock data for charts
const matchSuccessData = [
  { month: "Jan", success: 65 },
  { month: "Feb", success: 59 },
  { month: "Mar", success: 80 },
  { month: "Apr", success: 81 },
  { month: "May", success: 76 },
  { month: "Jun", success: 85 },
  { month: "Jul", success: 90 },
]

const interestData = [
  { name: "Blockchain", value: 35 },
  { name: "Hiking", value: 25 },
  { name: "Photography", value: 20 },
  { name: "Reading", value: 15 },
  { name: "Travel", value: 5 },
]

const COLORS = ["#FF6B8B", "#FF8E72", "#FFA477", "#FFB56B", "#FFC764"]

export default function AgentInsights() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)

    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false)
      toast({
        title: "Insights Refreshed",
        description: "Your AI twin insights have been updated with the latest data.",
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-xl">
              <BarChart className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">AI Insights & Performance</h3>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="bg-white border-pink-200 hover:bg-pink-50 text-pink-700 rounded-full"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="backdrop-blur-sm bg-white/80 rounded-xl border border-pink-100 p-4 flex items-center gap-3">
            <div className="p-3 rounded-full bg-pink-100">
              <Heart className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">87%</div>
              <div className="text-sm text-slate-600">Match Accuracy</div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-white/80 rounded-xl border border-pink-100 p-4 flex items-center gap-3">
            <div className="p-3 rounded-full bg-pink-100">
              <MessageCircle className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">92%</div>
              <div className="text-sm text-slate-600">Conversation Engagement</div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-white/80 rounded-xl border border-pink-100 p-4 flex items-center gap-3">
            <div className="p-3 rounded-full bg-pink-100">
              <Clock className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">2.5 min</div>
              <div className="text-sm text-slate-600">Average Response Time</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="backdrop-blur-sm bg-white/80 rounded-xl border border-pink-100 p-4">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Match Success Over Time</h4>
            <div className="h-64">
              <Chart>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={matchSuccessData}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "0.5rem",
                        border: "1px solid #fecdd3",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="success"
                      stroke="#f43f5e"
                      fill="url(#colorGradient)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </Chart>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-white/80 rounded-xl border border-pink-100 p-4">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Top Interests Driving Matches</h4>
            <div className="h-64">
              <Chart>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={interestData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {interestData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "0.5rem",
                        border: "1px solid #fecdd3",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Chart>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-sm bg-white/80 rounded-xl border border-pink-100 p-4">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">AI Learning Insights</h4>
          <p className="text-slate-700 mb-4">
            Based on your recent interactions, your AI is prioritizing shared hobbies over location by a factor of 2:1.
            Your AI has learned that you prefer matches with similar interests in blockchain and outdoor activities.
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge className="bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 border-0 px-3 py-1 rounded-full">
              <ThumbsUp className="h-3 w-3 mr-1" />
              Blockchain enthusiasts
            </Badge>
            <Badge className="bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 border-0 px-3 py-1 rounded-full">
              <ThumbsUp className="h-3 w-3 mr-1" />
              Hiking lovers
            </Badge>
            <Badge className="bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 border-0 px-3 py-1 rounded-full">
              <ThumbsUp className="h-3 w-3 mr-1" />
              Photography interest
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

