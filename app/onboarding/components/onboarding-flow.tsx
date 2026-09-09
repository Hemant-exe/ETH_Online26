"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import WelcomeStep from "./steps/welcome-step"
import ConnectWalletStep from "./steps/connect-wallet-step"
import AgreementsStep from "./steps/agreements-step"
import VerificationStep from "./steps/verification-step"
import SuccessStep from "./steps/success-step"
import ProgressBar from "./progress-bar"

export type OnboardingStep = "welcome" | "connect-wallet" | "agreements" | "verification" | "success"

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome")
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [includeVerification, setIncludeVerification] = useState<boolean>(true) // Set to false to skip verification

  const goToNextStep = (step: OnboardingStep) => {
    setCurrentStep(step)
  }

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address)
    goToNextStep("agreements")
  }

  const handleAgreementsComplete = () => {
    if (includeVerification) {
      goToNextStep("verification")
    } else {
      goToNextStep("success")
    }
  }

  const handleVerificationComplete = () => {
    goToNextStep("success")
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "welcome":
        return <WelcomeStep onContinue={() => goToNextStep("connect-wallet")} />
      case "connect-wallet":
        return <ConnectWalletStep onWalletConnected={handleWalletConnect} />
      case "agreements":
        return <AgreementsStep onComplete={handleAgreementsComplete} />
      case "verification":
        return <VerificationStep onComplete={handleVerificationComplete} />
      case "success":
        return <SuccessStep walletAddress={walletAddress} />
      default:
        return <WelcomeStep onContinue={() => goToNextStep("connect-wallet")} />
    }
  }

  const getStepNumber = () => {
    const steps: OnboardingStep[] = includeVerification
      ? ["welcome", "connect-wallet", "agreements", "verification", "success"]
      : ["welcome", "connect-wallet", "agreements", "success"]
    return steps.indexOf(currentStep) + 1
  }

  const getTotalSteps = () => {
    return includeVerification ? 5 : 4
  }

  return (
    <Card className="w-full max-w-2xl shadow-xl">
      <ProgressBar currentStep={getStepNumber()} totalSteps={getTotalSteps()} />
      {renderCurrentStep()}
    </Card>
  )
}

