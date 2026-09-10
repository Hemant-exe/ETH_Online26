"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  BadgeCheck,
  CheckCircle2,
  Copy,
  Database,
  ScanFace,
  ShieldAlert,
  ShieldIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { accountSession } from "@/app/lib/account/session"
import {
  registerTwinAsAgent,
  resolveAgent,
  type AgentResolutionView,
} from "@/app/lib/identity/agent-identity-service"
import { getTwinAgentId } from "@/app/lib/twin-profile-service"
import { SELFIE_CHECK_VALIDITY_DAYS } from "@/app/lib/identity/world-config"
import { describeStorage } from "@/app/lib/storage"

/**
 * Identity settings.
 *
 * Answers three questions about this account, from live state rather than
 * placeholder data: is the person behind it verified, does their twin speak
 * for them as a registered agent, and where is their data actually kept.
 *
 * The last one matters more than it looks. Data lives in the browser, so
 * "which backend am I on" is the difference between a profile that survives a
 * refresh and one that does not — worth showing plainly instead of letting
 * someone discover it by losing work.
 */
export default function IdentitySettings() {
  const [copied, setCopied] = useState<string | null>(null)
  const [anchor, setAnchor] = useState<string | null>(null)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null)
  const [credentialType, setCredentialType] = useState<string | null>(null)
  const [agentId, setAgentId] = useState<string | null>(null)
  const [agent, setAgent] = useState<AgentResolutionView | null>(null)
  const [backend, setBackend] = useState<string>("…")
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      await accountSession.init()
      const snapshot = accountSession.getSnapshot()

      setAccountId(snapshot?.accountId ?? null)
      setAnchor(snapshot?.humanAnchor ?? null)
      setVerifiedAt(snapshot?.verifiedAt ?? null)
      setCredentialType(snapshot?.credentialType ?? null)
      setBackend(await describeStorage())

      const existing = await getTwinAgentId().catch(() => null)
      setAgentId(existing)
      if (existing) setAgent(await resolveAgent(existing))
    }

    load()
  }, [])

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const register = async () => {
    setIsRegistering(true)
    setRegisterError(null)
    try {
      const registered = await registerTwinAsAgent()
      setAgentId(registered.agentId)
      setAgent(await resolveAgent(registered.agentId))
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setIsRegistering(false)
    }
  }

  const expiresAt = verifiedAt
    ? new Date(
        new Date(verifiedAt).getTime() + SELFIE_CHECK_VALIDITY_DAYS * 24 * 60 * 60 * 1000,
      )
    : null

  return (
    <div className="backdrop-blur-sm bg-white/80 rounded-2xl border border-indigo-100 p-6 relative overflow-hidden shadow-md">
      <div className="absolute -bottom-32 -left-32 opacity-10 pointer-events-none">
        <motion.div
          className="w-64 h-64 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300"
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        />
      </div>

      <div className="relative z-10 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldIcon className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-slate-800">Identity</h2>
          </div>
          <p className="text-slate-600">
            What this app can prove about you, and what it keeps where.
          </p>
        </div>

        {/* Human verification */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ScanFace className="h-5 w-5 text-pink-600" />
            <h3 className="font-medium text-slate-800">Human verification</h3>
            {anchor ? (
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 gap-1">
                <BadgeCheck className="h-3 w-3" />
                {credentialType === "selfie-check" ? "Selfie Check" : "Sandbox"}
              </Badge>
            ) : (
              <Badge variant="destructive">Unverified</Badge>
            )}
          </div>

          {anchor ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 space-y-2">
              <p className="text-xs text-slate-500">Human anchor (World ID nullifier)</p>
              <div className="flex items-start gap-2">
                <code className="text-xs font-mono break-all flex-1">{anchor}</code>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0"
                  onClick={() => copy(anchor, "anchor")}
                >
                  {copied === "anchor" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              {expiresAt && (
                <p className="text-xs text-slate-500">
                  Verified {new Date(verifiedAt as string).toLocaleDateString()} · valid until{" "}
                  {expiresAt.toLocaleDateString()}
                </p>
              )}
              <p className="text-xs text-slate-500">
                Anonymous and unique to you. It cannot be linked back to your identity, and it can
                hold exactly one profile here.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <p className="text-sm text-amber-900">
                You have not completed Selfie Check. Your profile is visible in Explore but flagged
                as unverified, ranked below verified profiles, and cannot run a twin screening.
              </p>
            </div>
          )}
        </section>

        {/* Agent registration */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-purple-600" />
            <h3 className="font-medium text-slate-800">Twin agent</h3>
            {agent?.humanBacked ? (
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                Human-backed
              </Badge>
            ) : agentId ? (
              <Badge variant="secondary">Registered locally</Badge>
            ) : (
              <Badge variant="outline">Not registered</Badge>
            )}
          </div>

          {agentId ? (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <p className="text-xs text-slate-500">AgentBook agent id</p>
              <div className="flex items-start gap-2">
                <code className="text-xs font-mono break-all flex-1">{agentId}</code>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0"
                  onClick={() => copy(agentId, "agent")}
                >
                  {copied === "agent" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Resolved via {agent?.source === "agentbook" ? "AgentBook on World Chain" : agent?.source ?? "local registry"}.
                Every message your twin sends carries this id, and is rejected if it does not
                resolve to a verified human.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Register your twin so it can take part in screening conversations. It needs a
                verified human behind it before anyone else&apos;s twin will talk to it.
              </p>
              {registerError && (
                <p className="text-sm text-rose-600 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" />
                  {registerError}
                </p>
              )}
              <Button onClick={register} disabled={isRegistering || !anchor} size="sm">
                {isRegistering ? "Registering…" : "Register my twin as an agent"}
              </Button>
            </div>
          )}
        </section>

        {/* Storage */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-slate-600" />
            <h3 className="font-medium text-slate-800">Where your data lives</h3>
            <Badge variant="secondary">{backend}</Badge>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-slate-600 cursor-help">
                  Your profile, photos, preferences, chats and twin are stored in this browser
                  {backend === "memory" ? " — for this page load only." : "."}
                </p>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  {backend === "indexeddb"
                    ? "IndexedDB: durable across refreshes and restarts."
                    : backend === "localstorage"
                      ? "localStorage fallback: durable, but with a smaller size limit."
                      : "In-memory fallback: nothing is persisted. Private browsing or blocked site data."}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {accountId && (
            <p className="text-xs font-mono text-slate-400 break-all">{accountId}</p>
          )}
        </section>
      </div>
    </div>
  )
}
