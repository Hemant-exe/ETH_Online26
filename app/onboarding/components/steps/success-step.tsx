import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRightIcon, CheckCircle2Icon, Coins, InfoIcon, ScanFace } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

import { accountSession } from "@/app/lib/account/session"

interface SuccessStepProps {
  walletAddress: string
}

export default function SuccessStep({ walletAddress }: SuccessStepProps) {
  const [humanAnchor, setHumanAnchor] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      await accountSession.init();
      setHumanAnchor(accountSession.getHumanAnchor());
    };

    load();
  }, []);

  return (
    <>
      <CardHeader className="text-center pt-6 pb-4">
        <div className="flex justify-center mb-3">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2Icon className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-xl">You&apos;re Verified — Let&apos;s Set Up Your Profile</CardTitle>
        <CardDescription className="text-sm">
          Your account is set up and your humanity is proven. Next, build your profile and your AI
          twin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <div className="bg-purple-50 p-4 rounded-lg flex items-start space-x-3">
          <InfoIcon className="h-5 w-5 mt-0.5 flex-shrink-0 text-purple-600" />
          <div>
            <p className="text-xs text-muted-foreground">
              Your profile and chats stay on this device. The only thing recorded about you
              elsewhere is an anonymous World ID nullifier proving you are one unique person.
            </p>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2 text-sm">Your Onboarding Summary</h3>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-xs flex items-center">
                <Coins className="h-3 w-3 mr-1 text-purple-600" />
                <span className="text-muted-foreground">Wallet:</span>
              </div>
              <div className="font-mono text-xs">
                {walletAddress
                  ? `${walletAddress.substring(0, 6)}…${walletAddress.substring(walletAddress.length - 4)}`
                  : "Not connected"}
              </div>
            </div>

            <Separator className="my-1" />

            <div className="flex justify-between items-center">
              <div className="text-xs flex items-center">
                <ScanFace className="h-3 w-3 mr-1 text-pink-600" />
                <span className="text-muted-foreground">Human anchor:</span>
              </div>
              <div className="font-mono text-xs">
                {humanAnchor ? 
                  `${humanAnchor.substring(0, 6)}...${humanAnchor.substring(humanAnchor.length - 4)}` : 
                  "Not connected"}
              </div>
            </div>

            <Separator className="my-1" />

            <div className="flex justify-between items-center">
              <div className="text-xs">
                <span className="text-muted-foreground">Verification:</span>
              </div>
              <div className="text-xs">
                <span className="text-green-600">Verified with World ID</span>
              </div>
            </div>

            <Separator className="my-1" />

            <div className="flex justify-between items-center">
              <div className="text-xs">
                <span className="text-muted-foreground">Next Step:</span>
              </div>
              <div className="text-xs font-medium">Profile Creation</div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="font-medium mb-1 text-sm">What's Next?</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
            <div className="bg-white p-2 rounded-md">Create your dating profile</div>
            <div className="bg-white p-2 rounded-md">Set your preferences</div>
            <div className="bg-white p-2 rounded-md">Create your AI twin</div>
            <div className="bg-white p-2 rounded-md">Run your first twin screening</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pb-6 pt-4">
        <Link href="/profile" className="w-full">
          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <span className="mr-2">Go to Profile Creation</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </>
  )
}
