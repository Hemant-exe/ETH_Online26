"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import AgentSnapshot from "./agent-snapshot"
import MatchingPreferences from "./matching-preferences"
import ConversationSettings from "./conversation-settings"
import DataPermissions from "./data-permissions"
import AgentInsights from "./agent-insights"
import ManualOverride from "./manual-override"
import SecurityPrivacy from "./security-privacy"
import { Brain, Heart, MessageCircle, Database, BarChart, Wrench, Shield, Sparkles } from "lucide-react"

export default function AiTwinDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-8">
      {/* Agent Snapshot Card - Always visible */}
      <AgentSnapshot />

      {/* Tabs Navigation */}
      <div className="flex justify-center mb-8">
        <motion.div
          className="backdrop-blur-xl bg-white/40 p-2 rounded-full border border-pink-100 shadow-lg overflow-x-auto max-w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex space-x-1 px-2">
            {[
              { id: "overview", label: "Overview", icon: Brain },
              { id: "matching", label: "Matching", icon: Heart },
              { id: "conversation", label: "Conversation", icon: MessageCircle },
              { id: "data", label: "Data", icon: Database },
              { id: "insights", label: "Insights", icon: BarChart },
              { id: "feedback", label: "Feedback", icon: Wrench },
              { id: "security", label: "Security", icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative whitespace-nowrap px-4 py-3 rounded-full transition-all duration-300 ${
                  activeTab === tab.id ? "text-white" : "text-slate-700 hover:text-pink-600"
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeAiTwinTab"
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full -z-0"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <MatchingPreferences />
            <ConversationSettings />
          </div>
        )}

        {activeTab === "matching" && <MatchingPreferences />}

        {activeTab === "conversation" && <ConversationSettings />}

        {activeTab === "data" && <DataPermissions />}

        {activeTab === "insights" && <AgentInsights />}

        {activeTab === "feedback" && <ManualOverride />}

        {activeTab === "security" && <SecurityPrivacy />}
      </motion.div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8">
        <motion.button
          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Sparkles className="h-6 w-6" />
        </motion.button>
      </div>
    </div>
  )
}

