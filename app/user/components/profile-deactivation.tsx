"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AlertTriangleIcon, FlameIcon, PowerOffIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProfileDeactivation() {
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [burnDialogOpen, setBurnDialogOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")

  return (
    <>
      <div className="backdrop-blur-sm bg-white/80 rounded-2xl border border-indigo-100 p-6 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangleIcon className="h-6 w-6 text-amber-500" />
          <h2 className="text-xl font-semibold text-slate-800">Deactivate or Delete Your Profile</h2>
        </div>

        <p className="text-slate-600 mb-6">Options for temporarily or permanently removing your profile</p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 mb-8">
          <AlertTriangleIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-700 mb-1">Warning</h3>
            <p className="text-sm text-amber-600">
              Deactivating your profile will hide it from other users but preserve your data. Burning your NFT is
              permanent and cannot be undone.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 h-full shadow-sm">
              <div className="p-4 border-b border-indigo-100 bg-indigo-50">
                <h3 className="text-lg font-semibold text-indigo-700">Deactivate Profile</h3>
                <p className="text-sm text-slate-600">Temporarily hide your profile</p>
              </div>
              <div className="p-4 text-sm text-slate-700">
                <p>Your profile will be hidden from search and discovery. You can reactivate at any time.</p>
                <ul className="list-disc list-inside mt-3 space-y-1 text-slate-500">
                  <li>Profile hidden from other users</li>
                  <li>NFT and data preserved</li>
                  <li>No blockchain transaction required</li>
                  <li>Reactivate anytime</li>
                </ul>
              </div>
              <div className="p-4 border-t border-indigo-100">
                <Button
                  variant="outline"
                  className="w-full bg-white border-indigo-200 hover:bg-indigo-50 text-indigo-700"
                  onClick={() => setDeactivateDialogOpen(true)}
                >
                  <PowerOffIcon className="h-4 w-4 mr-2" />
                  Deactivate Profile
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="backdrop-blur-sm bg-white/90 rounded-xl border border-indigo-100 h-full shadow-sm">
              <div className="p-4 border-b border-indigo-100 bg-red-50">
                <h3 className="text-lg font-semibold text-red-600">Burn NFT Profile</h3>
                <p className="text-sm text-slate-600">Permanently delete your profile</p>
              </div>
              <div className="p-4 text-sm text-slate-700">
                <p>Your NFT will be burned and your profile permanently deleted. This action cannot be undone.</p>
                <ul className="list-disc list-inside mt-3 space-y-1 text-slate-500">
                  <li>NFT permanently burned</li>
                  <li>Profile data deleted</li>
                  <li>Requires blockchain transaction</li>
                  <li>Cannot be reversed</li>
                </ul>
              </div>
              <div className="p-4 border-t border-indigo-100">
                <Button
                  variant="destructive"
                  className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white border-0"
                  onClick={() => setBurnDialogOpen(true)}
                >
                  <FlameIcon className="h-4 w-4 mr-2" />
                  Burn NFT Profile
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <DialogContent className="bg-white border border-indigo-100 text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-indigo-700">Deactivate Your Profile</DialogTitle>
            <DialogDescription className="text-slate-600">
              Your profile will be hidden from other users but your data will be preserved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-700">
              Are you sure you want to deactivate your profile? You can reactivate it at any time by logging back in.
            </p>
            <div className="bg-indigo-50 p-4 rounded-xl text-sm text-slate-600">
              <p>When you deactivate your profile:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your profile will be hidden from search and discovery</li>
                <li>Your messages will be inaccessible</li>
                <li>Your NFT and data will remain intact</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeactivateDialogOpen(false)}
              className="bg-white border-indigo-200 hover:bg-indigo-50 text-slate-700"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
            >
              Confirm Deactivation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={burnDialogOpen} onOpenChange={setBurnDialogOpen}>
        <DialogContent className="bg-white border border-indigo-100 text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-red-600">Burn NFT Profile</DialogTitle>
            <DialogDescription className="text-slate-600">
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
              <AlertTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-600 mb-1">Warning</h3>
                <p className="text-sm text-red-500">
                  Burning your NFT is irreversible and requires a blockchain transaction. Your history will still remain
                  on-chain as an immutable record.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-slate-700">
                Type "BURN MY PROFILE" to confirm
              </Label>
              <Input
                id="confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="BURN MY PROFILE"
                className="bg-white border-indigo-200 text-slate-800 focus:border-red-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBurnDialogOpen(false)}
              className="bg-white border-indigo-200 hover:bg-indigo-50 text-slate-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirmText !== "BURN MY PROFILE"}
              className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white border-0"
            >
              <FlameIcon className="h-4 w-4 mr-2" />
              Burn NFT Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

