"use client"

import { useEffect, useState } from "react"
import { Coins, ExternalLink } from "lucide-react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { getSessionSpendHbar, onSpendChange } from "@/app/lib/twin-inference-service"

/**
 * Live HBAR spend meter.
 *
 * Every twin reply is a metered x402 payment, so the user is being charged per
 * message. A running total is not a nice-to-have here — charging someone
 * per-message without showing them the meter would be indefensible, and it is
 * also the clearest way to see that the payments are real rather than
 * decorative.
 *
 * Reads from the inference service's in-memory counter, which increments on
 * each settled call. The durable record is the HCS topic; this is just the
 * live view for the conversation on screen.
 */
export default function HbarMeter({ topicUrl }: { topicUrl?: string | null }) {
  const [total, setTotal] = useState(0)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    setTotal(getSessionSpendHbar())

    return onSpendChange((next) => {
      setTotal(next)
      // Brief highlight so a new charge is noticeable mid-conversation
      // instead of the number quietly changing.
      setFlash(true)
      setTimeout(() => setFlash(false), 700)
    })
  }, [])

  if (total <= 0) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors duration-500 ${
              flash
                ? "border-amber-400 bg-amber-100 text-amber-900"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            <Coins className="h-3.5 w-3.5" />
            <span className="font-mono">{Number.parseFloat(total.toFixed(6))} HBAR</span>
            {topicUrl && (
              <a
                href={topicUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="ml-0.5 opacity-70 hover:opacity-100"
                aria-label="View payment receipts on HashScan"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs">
            Spent this session on twin inference, metered per call and settled over x402 on Hedera.
            Each payment has a receipt on the consensus audit topic.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
