"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import IntroStep from "./steps/intro-step"
import CreateDIDStep from "./steps/create-did-step"
import BasicInfoStep from "./steps/basic-info-step"
import PhotosStep from "./steps/photos-step"
import PreferencesStep from "./steps/preferences-step"
import MintNFTStep from "./steps/mint-nft-step"
import SuccessStep from "./steps/success-step"
import ProgressBar from "./progress-bar"

export type ProfileStep = "intro" | "create-did" | "basic-info" | "photos" | "preferences" | "mint-nft" | "success"

export interface ProfileData {
  displayName: string
  age: string
  location: string
  bio: string
  photos: string[]
  interests: string[]
  relationshipGoals: string
  primaryPhotoIndex: number
  did?: string
  photoDataArray?: any[]
  _id?: string
  _rev?: string
}

export default function ProfileCreationFlow() {
  const [currentStep, setCurrentStep] = useState<ProfileStep>("intro")
  const [didId, setDidId] = useState<string>("")
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: "",
    age: "",
    location: "",
    bio: "",
    photos: [],
    interests: [],
    relationshipGoals: "",
    primaryPhotoIndex: 0,
  })
  const [nftTokenId, setNftTokenId] = useState<string>("")
  const [transactionHash, setTransactionHash] = useState<string>("")

  const goToNextStep = (step: ProfileStep) => {
    setCurrentStep(step)
  }

  const handleDidCreated = (did: string) => {
    setDidId(did)
    goToNextStep("basic-info")
  }

  const updateProfileData = (data: Partial<ProfileData>) => {
    setProfileData((prev) => ({ ...prev, ...data }))
  }

  const handleMintSuccess = (tokenId: string, txHash: string) => {
    setNftTokenId(tokenId)
    setTransactionHash(txHash)
    goToNextStep("success")
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "intro":
        return <IntroStep onContinue={() => goToNextStep("create-did")} />
      case "create-did":
        return <CreateDIDStep onDidCreated={handleDidCreated} />
      case "basic-info":
        return (
          <BasicInfoStep
            profileData={profileData}
            updateProfileData={updateProfileData}
            onContinue={() => goToNextStep("photos")}
          />
        )
      case "photos":
        return (
          <PhotosStep
            profileData={profileData}
            updateProfileData={updateProfileData}
            onContinue={() => goToNextStep("preferences")}
          />
        )
      case "preferences":
        return (
          <PreferencesStep
            profileData={profileData}
            updateProfileData={updateProfileData}
            onContinue={() => goToNextStep("mint-nft")}
          />
        )
      case "mint-nft":
        return (
          <MintNFTStep
            profileData={profileData}
            didId={didId}
            onMintSuccess={handleMintSuccess}
            onEdit={() => goToNextStep("basic-info")}
          />
        )
      case "success":
        return (
          <SuccessStep
            profileData={profileData}
            didId={didId}
            nftTokenId={nftTokenId}
            transactionHash={transactionHash}
          />
        )
      default:
        return <IntroStep onContinue={() => goToNextStep("create-did")} />
    }
  }

  const getStepNumber = () => {
    const steps: ProfileStep[] = ["intro", "create-did", "basic-info", "photos", "preferences", "mint-nft", "success"]
    return steps.indexOf(currentStep) + 1
  }

  return (
    <Card className="w-full max-w-5xl shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
      <ProgressBar currentStep={getStepNumber()} totalSteps={7} />
      {renderCurrentStep()}
    </Card>
  )
}

