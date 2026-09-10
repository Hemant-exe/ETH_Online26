"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  BadgeCheck,
  Coins,
  ExternalLink,
  Heart,
  MessageSquare,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import {
  fetchReport,
  type ScreeningReportView,
  type ScreeningTurnView,
} from "@/app/lib/screening/screening-client"

/**
 * Screening report.
 *
 * Shows the compatibility verdict, the full transcript, what the conversation
 * cost in HBAR turn by turn, and a HashScan link for every settled payment.
 *
 * The per-turn cost column is not decoration. This product charges people for
 * conversations their twin held while they were not watching, so the report
 * has to show exactly what was spent and let them verify each payment
 * independently on the ledger.
 */
export default function ScreeningReportPage() {
  const router = useRouter()
  const params = useParams<{ matchId: string }>()
  const matchId = decodeURIComponent(String(params?.matchId ?? ""))

  const [report, setReport] = useState<ScreeningReportView | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!matchId) return

    const load = async () => {
      setReport(await fetchReport(matchId))
      setIsLoading(false)
    }

    load()
  }, [matchId])

  if (isLoading) {
    return (
      <Shell>
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4" />
          <p className="text-pink-600">Loading report…</p>
        </div>
      </Shell>
    )
  }

  if (!report) {
    return (
      <Shell>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-lg font-medium">No screening found for this pair</p>
            <p className="text-sm text-muted-foreground">
              Run a screening from Explore to generate a compatibility report.
            </p>
            <Button onClick={() => router.push("/explore")}>Back to Explore</Button>
          </CardContent>
        </Card>
      </Shell>
    )
  }

  const scoreTone =
    report.compatibilityScore >= 75
      ? "text-emerald-600"
      : report.compatibilityScore >= report.unlockThreshold
        ? "text-amber-600"
        : "text-rose-600"

  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.push("/explore")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Button>

        {!report.live && (
          <Alert>
            <TriangleAlert className="h-4 w-4" />
            <AlertDescription>
              At least one turn came from the local sandbox because no inference key is
              configured. The payments, receipts and cost meter are real; some transcript text is
              locally generated.
            </AlertDescription>
          </Alert>
        )}

        {/* Verdict */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-600" />
              Compatibility Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="text-center shrink-0">
                <div className={`text-6xl font-bold ${scoreTone}`}>
                  {report.compatibilityScore}
                </div>
                <div className="text-xs text-muted-foreground mt-1">out of 100</div>
              </div>

              <div className="flex-1 space-y-3">
                <p className="text-sm leading-relaxed">{report.summary}</p>

                <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${report.compatibilityScore}%` }}
                  />
                  {/* The bar shows where the unlock threshold sits, so a
                      near-miss is legible rather than just a refusal. */}
                  <div
                    className="absolute top-0 h-2.5 border-l-2 border-slate-500"
                    style={{ left: `${report.unlockThreshold}%` }}
                    title={`Unlock threshold: ${report.unlockThreshold}`}
                  />
                </div>

                {report.unlocked ? (
                  <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
                    <MessageSquare className="h-4 w-4" />
                    Direct chat unlocked — you cleared the threshold of {report.unlockThreshold}.
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-700 text-sm font-medium">
                    <ShieldAlert className="h-4 w-4" />
                    Below the threshold of {report.unlockThreshold}. Direct chat stays closed.
                  </div>
                )}
              </div>
            </div>

            {/* Agent provenance */}
            <div className="grid sm:grid-cols-2 gap-3">
              {[report.agents.a, report.agents.b].map((agent) => (
                <div key={agent.agentId} className="bg-slate-50 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{agent.twinName}</span>
                    {agent.humanBacked ? (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 gap-1">
                        <BadgeCheck className="h-3 w-3" />
                        Human-backed
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Unverified</Badge>
                    )}
                  </div>
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {agent.agentId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Resolved via {agent.source === "agentbook" ? "AgentBook" : agent.source}
                  </p>
                </div>
              ))}
            </div>

            {/* Interests and friction */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Shared ground</p>
                {report.sharedInterests.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {report.sharedInterests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">None identified.</p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Friction points</p>
                {report.frictionPoints.length > 0 ? (
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    {report.frictionPoints.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">None surfaced.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Coins className="h-5 w-5 text-amber-600" />
              What this conversation cost
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{report.totalCostHbar}</span>
              <span className="text-muted-foreground">HBAR</span>
              <span className="text-xs text-muted-foreground ml-2">
                across {report.transcript.length} paid turns plus the analysis
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Each turn was priced from its own token count and settled individually over x402 on
              Hedera testnet. {report.hcsMessageIds.length} receipt
              {report.hcsMessageIds.length === 1 ? "" : "s"} published to the audit topic.
            </p>

            {report.topicUrl && (
              <a
                href={report.topicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-pink-600 hover:underline"
              >
                View the receipt topic on HashScan
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </CardContent>
        </Card>

        {/* Transcript */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Transcript</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.transcript.map((turn) => (
              <TurnRow key={turn.index} turn={turn} />
            ))}
          </CardContent>
        </Card>

        {report.unlocked && (
          <Button
            onClick={() => router.push("/chats")}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl py-5"
          >
            Open direct chat
          </Button>
        )}
      </div>
    </Shell>
  )
}

function TurnRow({ turn }: { turn: ScreeningTurnView }) {
  const isA = turn.speaker === "A"

  return (
    <div className={`flex ${isA ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[85%] space-y-1.5 ${isA ? "" : "text-right"}`}>
        <div
          className={`inline-block rounded-2xl px-4 py-3 text-sm text-left ${
            isA ? "bg-purple-50 text-slate-800" : "bg-pink-50 text-slate-800"
          }`}
        >
          <p className="font-medium text-xs mb-1 text-muted-foreground">
            {turn.twinName}&apos;s twin
          </p>
          {turn.text}
        </div>

        <div
          className={`flex items-center gap-2 text-[11px] text-muted-foreground ${
            isA ? "" : "justify-end"
          }`}
        >
          {turn.priceHbar && (
            <span className="font-mono">
              {turn.paymentStatus === "unmetered" ? "unmetered" : `${turn.priceHbar} HBAR`}
            </span>
          )}
          {turn.receipt?.onChain && turn.receipt.sequenceNumber && (
            <span>· HCS #{turn.receipt.sequenceNumber}</span>
          )}
          {turn.receipt?.hashscanUrl && (
            <a
              href={turn.receipt.hashscanUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-pink-600 hover:underline"
            >
              HashScan
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {!turn.live && <span className="text-amber-700">· sandbox text</span>}
        </div>
      </div>
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 text-slate-800">
      <div className="container mx-auto px-4 py-10">{children}</div>
    </div>
  )
}
