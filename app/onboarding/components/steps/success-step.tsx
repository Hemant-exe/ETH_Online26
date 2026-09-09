import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2Icon, ArrowRightIcon, InfoIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface SuccessStepProps {
  walletAddress: string
}

export default function SuccessStep({ walletAddress }: SuccessStepProps) {
  const [cheqdWalletAddress, setCheqdWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    // Get Cheqd wallet address from localStorage
    const storedCheqdAddress = localStorage.getItem("cheqdWalletAddress");
    if (storedCheqdAddress) {
      setCheqdWalletAddress(storedCheqdAddress);
    }
  }, []);

  return (
    <>
      <CardHeader className="text-center pt-6 pb-4">
        <div className="flex justify-center mb-3">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2Icon className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-xl">Wallets Connected — Let's Set Up Your Profile</CardTitle>
        <CardDescription className="text-sm">
          Both your Verida and Cheqd wallets are now linked. Next, you'll create a Decentralized Identity (DID) and mint your NFT-based profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <div className="bg-purple-50 p-4 rounded-lg flex items-start space-x-3">
          <img src="/verida.jpg" alt="Verida" className="h-5 w-5 mt-0.5 flex-shrink-0 rounded-full" />
          <div>
            <p className="text-xs text-muted-foreground">
              Your data remains secure and private with Verida, while your identity is verified through Cheqd blockchain technology.
            </p>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2 text-sm">Your Onboarding Summary</h3>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-xs flex items-center">
                <img src="/verida.jpg" alt="Verida" className="h-3 w-3 mr-1 rounded-full" />
                <span className="text-muted-foreground">Verida Wallet:</span>
              </div>
              <div className="font-mono text-xs">
                {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
              </div>
            </div>

            <Separator className="my-1" />

            <div className="flex justify-between items-center">
              <div className="text-xs flex items-center">
                <img src="/cheqd.png" alt="Cheqd" className="h-3 w-3 mr-1 rounded-full" />
                <span className="text-muted-foreground">Cheqd Wallet:</span>
              </div>
              <div className="font-mono text-xs">
                {cheqdWalletAddress ? 
                  `${cheqdWalletAddress.substring(0, 6)}...${cheqdWalletAddress.substring(cheqdWalletAddress.length - 4)}` : 
                  "Not connected"}
              </div>
            </div>

            <Separator className="my-1" />

            <div className="flex justify-between items-center">
              <div className="text-xs">
                <span className="text-muted-foreground">DID Status:</span>
              </div>
              <div className="text-xs">
                <span className="text-green-600">Created with Cheqd</span>
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
            <div className="bg-white p-2 rounded-md">Mint your profile as an NFT</div>
            <div className="bg-white p-2 rounded-md">Start matching securely</div>
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
