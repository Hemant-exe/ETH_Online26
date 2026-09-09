"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import {
  ExternalLinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  HistoryIcon,
  Copy,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock data - would be fetched from your API
const activityData = [
  {
    id: "tx1",
    date: "2023-10-15T14:30:00Z",
    action: "Profile Update",
    hash: "0xabcd...1234",
    status: "success",
    explorerUrl: "https://explorer.cheqd.io/tx/abcd1234",
  },
  {
    id: "tx2",
    date: "2023-09-22T09:15:00Z",
    action: "DID Verification",
    hash: "0xefgh...5678",
    status: "success",
    explorerUrl: "https://explorer.cheqd.io/tx/efgh5678",
  },
  {
    id: "tx3",
    date: "2023-08-10T11:45:00Z",
    action: "NFT Mint",
    hash: "0xijkl...9012",
    status: "success",
    explorerUrl: "https://explorer.cheqd.io/tx/ijkl9012",
  },
  {
    id: "tx4",
    date: "2023-10-18T16:20:00Z",
    action: "Key Rotation",
    hash: "0xmnop...3456",
    status: "pending",
    explorerUrl: "https://explorer.cheqd.io/tx/mnop3456",
  },
]

export default function ActivityLog() {
  const [copied, setCopied] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case "pending":
        return <ClockIcon className="h-4 w-4 text-yellow-500" />
      case "failed":
        return <XCircleIcon className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-gradient-to-r from-green-400 to-emerald-400 text-white border-0">Success</Badge>
      case "pending":
        return <Badge className="bg-gradient-to-r from-yellow-400 to-amber-400 text-white border-0">Pending</Badge>
      case "failed":
        return <Badge className="bg-gradient-to-r from-red-400 to-rose-400 text-white border-0">Failed</Badge>
      default:
        return null
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="backdrop-blur-sm bg-white/80 rounded-2xl border border-indigo-100 p-6 shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <HistoryIcon className="h-6 w-6 text-indigo-600" />
        <h2 className="text-xl font-semibold text-slate-800">Activity Log</h2>
      </div>

      <p className="text-slate-600 mb-6">History of your profile-related blockchain transactions</p>

      <div className="rounded-xl border border-indigo-100 overflow-hidden shadow-sm">
        <div className="grid grid-cols-5 p-3 text-sm font-medium border-b border-indigo-100 bg-indigo-50">
          <div className="text-slate-700">Date</div>
          <div className="text-slate-700">Action</div>
          <div className="text-slate-700">Transaction</div>
          <div className="text-slate-700">Status</div>
          <div></div>
        </div>

        {activityData.map((activity, index) => (
          <motion.div
            key={activity.id}
            className="grid grid-cols-5 p-3 text-sm border-b border-indigo-100 last:border-0 items-center hover:bg-indigo-50/50 transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="text-slate-700">{formatDate(activity.date)}</div>
            <div className="text-slate-700">{activity.action}</div>
            <div className="flex items-center gap-2">
              <code className="font-mono text-xs text-slate-700">{activity.hash}</code>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600"
                onClick={() => copyToClipboard(activity.hash, activity.id)}
              >
                {copied === activity.id ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(activity.status)}
              {getStatusBadge(activity.status)}
            </div>
            <div className="text-right">
              <a
                href={activity.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-cyan-600 hover:text-cyan-700 transition-colors"
              >
                View
                <ExternalLinkIcon className="h-3 w-3 ml-1" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

