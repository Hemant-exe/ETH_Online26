"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BadgeCheck, Coins, Sparkles, TriangleAlert } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { accountSession } from "@/app/lib/account/session"
import { getMyAgentId } from "@/app/lib/identity/agent-identity-service"
import { startScreening, ScreeningRequestError } from "@/app/lib/screening/screening-client"
import { quoteInferenceCost } from "@/app/lib/twin-inference-service"

interface DirectoryEntry {
  accountId: string
  agentId: string
  twinName: string
  humanBacked: boolean
  registeredInAgentBook: boolean
}

/**
 * Launcher for a twin-to-twin screening date.
 *
 * Only lists counterparts whose twin is registered as a human-backed agent,
 * because a screening against anything else would be refused server-side
 * anyway — better to not offer it than to charge someone for a call that
 * cannot happen.
 *
 * The estimated cost is shown before the user commits. A screening is several
 * paid turns, and asking someone to start one without telling them the price
 * would be indefensible.
 */
export default function TwinScreeningPanel() {
  const router = useRouter()

  const [directory, setDirectory] = useState<DirectoryEntry[]>([])
  const [myAgentId, setMyAgentId] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [turns, setTurns] = useState(4)
  /** Per-turn price. Multiplied by turn count at render, not here. */
  const [perTurn, setPerTurn] = useState<{ priceHbar: number; metered: boolean } | null>(null)
  const [runningFor, setRunningFor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      await accountSession.connect()
      setIsVerified(accountSession.isVerifiedHuman())
      setMyAgentId(await getMyAgentId())

      const accountId = accountSession.getAccountId()
      try {
        const response = await fetch(
          `/api/agent/directory?exclude=${encodeURIComponent(accountId ?? "")}`,
        )
        const result = await response.json()
        setDirectory((result.agents ?? []).filter((entry: DirectoryEntry) => entry.humanBacked))
      } catch {
        setDirectory([])
      }

      // Quote one representative turn. The total scales linearly with the
      // turn count, so there is no need to re-quote when the user changes it.
      const quote = await quoteInferenceCost("x".repeat(2400), 320)
      if (quote) {
        setPerTurn({ priceHbar: Number.parseFloat(quote.priceHbar), metered: quote.metered })
      }
    }

    load()
  }, [])

  // Turns, plus one more paid call for the compatibility analysis.
  const estimatedTotal = perTurn
    ? Number.parseFloat((perTurn.priceHbar * (turns + 1)).toFixed(6))
    : null

  const run = async (target: DirectoryEntry) => {
    setRunningFor(target.accountId)
    setError(null)

    try {
      const report = await startScreening(target.accountId, turns)
      router.push(`/screening/${encodeURIComponent(report.matchId)}`)
    } catch (err) {
      const message =
        err instanceof ScreeningRequestError
          ? err.message
          : "The screening could not be completed."
      setError(message)
    } finally {
      setRunningFor(null)
    }
  }

  const blocked = !isVerified || !myAgentId

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Screen with my twin
        </CardTitle>
        <CardDescription>
          Your AI twin holds a short conversation with theirs and reports back on compatibility —
          before either of you spends an evening finding out.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {blocked && (
          <Alert>
            <TriangleAlert className="h-4 w-4" />
            <AlertDescription>
              {!isVerified
                ? "Verify with Selfie Check to run a screening. Both twins must be backed by a verified human."
                : "Create and register your AI twin first — a screening needs an agent to speak for you."}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Turns</span>
            {[2, 4, 6].map((option) => (
              <Button
                key={option}
                size="sm"
                variant={turns === option ? "default" : "outline"}
                onClick={() => setTurns(option)}
                className="h-7 px-2.5"
              >
                {option}
              </Button>
            ))}
          </div>

          {perTurn && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Coins className="h-3.5 w-3.5 text-amber-600" />
              {perTurn.metered ? (
                <span className="font-mono">≈ {estimatedTotal} HBAR</span>
              ) : (
                <span>unmetered (no payee configured)</span>
              )}
            </div>
          )}
        </div>

        {directory.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No other verified twins are registered yet. Create a second verified profile with its
            own twin to try a screening.
          </p>
        ) : (
          <div className="space-y-2">
            {directory.map((entry) => (
              <div
                key={entry.accountId}
                className="flex items-center justify-between gap-3 bg-slate-50 rounded-lg p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{entry.twinName}</span>
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 gap-1 shrink-0">
                      <BadgeCheck className="h-3 w-3" />
                      Human-backed
                    </Badge>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground truncate">
                    {entry.agentId}
                  </p>
                </div>

                <Button
                  size="sm"
                  disabled={blocked || runningFor !== null}
                  onClick={() => run(entry)}
                  className="shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  {runningFor === entry.accountId ? (
                    <span className="flex items-center gap-2">
                      Screening…
                      <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </span>
                  ) : (
                    "Screen"
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
