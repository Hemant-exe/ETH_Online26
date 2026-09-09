"use client"

import { useEffect, useState } from "react"
import { AlertCircleIcon, CheckCircle2Icon, ScanFace, ShieldAlert } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"

import { accountSession } from "@/app/lib/account/session"
import {
  SelfieCheckError,
  fetchRequestContext,
  verifyProof,
  verifySandbox,
  type RequestContext,
} from "@/app/lib/identity/world-id-service"

/**
 * Shared Selfie Check panel.
 *
 * Both the onboarding verification step and the profile-creation gate render
 * this, so the proof flow, the duplicate-rejection handling and the sandbox
 * fallback all live in exactly one place. Only the surrounding copy differs
 * between the two.
 *
 * Everything here defers to the server: the panel opens IDKit, forwards the
 * payload, and renders whatever comes back. It never decides that a
 * verification succeeded.
 */

export interface SelfieCheckPanelProps {
  /** Called once verification succeeds, with the resulting account id. */
  onVerified: (accountId: string) => void
  /** Rendered above the action button. */
  children?: React.ReactNode
}

export function SelfieCheckPanel({ onVerified, children }: SelfieCheckPanelProps) {
  const { toast } = useToast()

  const [context, setContext] = useState<RequestContext | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [anchor, setAnchor] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duplicate, setDuplicate] = useState(false)
  const [sandboxSeed, setSandboxSeed] = useState("")

  useEffect(() => {
    const load = async () => {
      await accountSession.init()

      const existing = accountSession.getHumanAnchor()
      if (existing) {
        setAnchor(existing)
        setIsLive(accountSession.getSnapshot()?.credentialType === "selfie-check")
      }

      try {
        setContext(await fetchRequestContext())
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not reach World ID")
      }
    }

    load()
  }, [])

  const succeed = (nullifierHash: string, live: boolean) => {
    setAnchor(nullifierHash)
    setIsLive(live)
    setDuplicate(false)
    setError(null)

    const accountId = accountSession.getAccountId()
    if (accountId) setTimeout(() => onVerified(accountId), 900)
  }

  const fail = (err: unknown) => {
    if (err instanceof SelfieCheckError && err.code === "NULLIFIER_ALREADY_CLAIMED") {
      setDuplicate(true)
      setError("This person already holds a profile on Proof of Heart.")
      toast({
        variant: "destructive",
        title: "Already verified",
        description: "One verified human, one profile. This face is already registered.",
        duration: 5000,
      })
      return
    }

    const message = err instanceof Error ? err.message : "Verification failed. Please try again."
    setError(message)
    toast({ variant: "destructive", title: "Verification failed", description: message, duration: 4000 })
  }

  const runSandbox = async () => {
    if (!sandboxSeed.trim()) {
      setError("Enter a test identity to stand in for a person.")
      return
    }

    setIsVerifying(true)
    setError(null)
    try {
      const result = await verifySandbox(sandboxSeed.trim())
      succeed(result.nullifierHash, result.live)
    } catch (err) {
      fail(err)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="space-y-6">
      {children}

      {duplicate && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">Blocked: one human, one profile.</span> This person is already
            registered. Sign in to the existing profile instead of creating a second one.
          </AlertDescription>
        </Alert>
      )}

      {error && !duplicate && (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center">
          <ScanFace className="h-10 w-10 text-purple-600" />
        </div>

        {anchor && (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle2Icon className="h-5 w-5" />
            <span>{isLive ? "Verified human" : "Verified (sandbox)"}</span>
          </div>
        )}
      </div>

      {anchor && (
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="font-medium mb-1">Your human anchor</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm font-mono bg-white p-2 rounded border overflow-hidden text-ellipsis">
                  {anchor.substring(0, 20)}…{anchor.substring(anchor.length - 12)}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-mono text-xs break-all max-w-xs">{anchor}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-sm text-muted-foreground mt-2">
            A World ID nullifier — anonymous, unique to you, and not linkable back to your identity. Your
            profile, your twin&apos;s agent registration and your screening eligibility all hang from it.
          </p>
          {!isLive && (
            <p className="text-xs text-amber-700 mt-2">
              Produced by the local sandbox path because World credentials are not configured. Not a real
              proof of humanity.
            </p>
          )}
        </div>
      )}

      {!anchor && context && !context.live && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg space-y-3">
          <p className="text-sm font-medium text-amber-900">Sandbox mode</p>
          <p className="text-xs text-amber-800">
            World credentials are not configured, so the real Selfie Check widget cannot open. Enter any test
            identity to stand in for a person. Reusing a value demonstrates the duplicate-rejection path —
            the same server check a repeat Selfie Check would hit.
          </p>
          <Input
            placeholder="e.g. test-person-a"
            value={sandboxSeed}
            onChange={(event) => setSandboxSeed(event.target.value)}
            disabled={isVerifying}
          />
        </div>
      )}

      {anchor ? (
        <Button
          onClick={() => onVerified(accountSession.getAccountId() ?? "")}
          className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] rounded-xl py-5"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="relative">Continue</span>
        </Button>
      ) : context?.live ? (
        <LiveSelfieCheckButton
          context={context}
          isVerifying={isVerifying}
          setIsVerifying={setIsVerifying}
          onSuccess={succeed}
          onFailure={fail}
        />
      ) : (
        <Button
          onClick={runSandbox}
          disabled={isVerifying || !context}
          className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] rounded-xl py-5"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          {isVerifying ? (
            <div className="flex items-center">
              <span className="mr-2 relative">Verifying…</span>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <span className="relative">Run Sandbox Verification</span>
          )}
        </Button>
      )}
    </div>
  )
}

/**
 * The real IDKit widget.
 *
 * `@worldcoin/idkit` is imported lazily so it only enters the bundle on the
 * path that actually opens it.
 */
function LiveSelfieCheckButton({
  context,
  isVerifying,
  setIsVerifying,
  onSuccess,
  onFailure,
}: {
  context: RequestContext
  isVerifying: boolean
  setIsVerifying: (value: boolean) => void
  onSuccess: (nullifierHash: string, live: boolean) => void
  onFailure: (error: unknown) => void
}) {
  const [Widget, setWidget] = useState<any>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    import("@worldcoin/idkit")
      .then((module) => setWidget(() => module.IDKitRequestWidget))
      .catch((err) => onFailure(err))
    // onFailure is stable for the lifetime of the parent panel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!Widget) {
    return (
      <Button disabled className="w-full rounded-xl py-5">
        Loading World ID…
      </Button>
    )
  }

  return (
    <Widget
      open={open}
      onOpenChange={setOpen}
      app_id={process.env.NEXT_PUBLIC_WORLD_APP_ID}
      action={context.action}
      rp_context={context.rp_context}
      /**
       * Server-side verification happens here. Rethrowing on failure is
       * important: it tells IDKit the proof was rejected, so a nullifier that
       * is already claimed shows as a failure rather than a success the
       * server actually refused.
       */
      handleVerify={async (payload: unknown) => {
        setIsVerifying(true)
        try {
          const result = await verifyProof(payload)
          onSuccess(result.nullifierHash, result.live)
        } catch (err) {
          onFailure(err)
          throw err
        } finally {
          setIsVerifying(false)
        }
      }}
    >
      {({ open: openWidget }: { open: () => void }) => (
        <Button
          onClick={openWidget}
          disabled={isVerifying}
          className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] rounded-xl py-5"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          {isVerifying ? (
            <div className="flex items-center">
              <span className="mr-2 relative">Verifying…</span>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <span className="relative">Start Selfie Check</span>
          )}
        </Button>
      )}
    </Widget>
  )
}

export default SelfieCheckPanel
