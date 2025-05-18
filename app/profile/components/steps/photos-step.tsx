"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoIcon, UploadIcon, XIcon, StarIcon, AlertTriangleIcon, LoaderIcon } from "lucide-react"
import type { ProfileData } from "../profile-creation-flow"
import { useToast } from "@/components/ui/use-toast"
import { HeartLoader } from "@/components/ui/heart-loader"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useVeridaClient, useProfileRestService } from "@/app/lib/clientside-verida"
import { formatDataToSchema, SCHEMA_URLS, encodeSchemaUrl } from "@/app/lib/verida-schema-mapping"

interface PhotosStepProps {
  profileData: ProfileData
  updateProfileData: (data: Partial<ProfileData>) => void
  onContinue: () => void
}

export default function PhotosStep({ profileData, updateProfileData, onContinue }: PhotosStepProps) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false)
  const { client, getAuthStatus, getDidId } = useVeridaClient()
  const { service: profileRestService, isLoading: serviceLoading } = useProfileRestService()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Keep track of uploaded photos data for later use
  const [photoDataArray, setPhotoDataArray] = useState<any[]>([])
  
  // Fetch existing photos from Verida when component mounts
  useEffect(() => {
    const fetchExistingPhotos = async () => {
      // Only fetch if we don't already have photos and we have a DID
      if (profileData.photos.length === 0 && profileData.did) {
        try {
          setIsLoadingPhotos(true)
          
          if (!serviceLoading && profileRestService) {
            console.log("Fetching photos for DID:", profileData.did)
            
            // Check if the service has a getProfilePhotos method
            if (typeof profileRestService.getProfilePhotos === 'function') {
              try {
                const photos = await profileRestService.getProfilePhotos(profileData.did)
                console.log("Fetched photos:", photos)
                
                if (photos && photos.length > 0) {
                  // Extract URLs and update profile data
                  const photoUrls = photos.map((photo: any) => photo.photoUrl)
                  
                  // Get the profile to ensure we have the correct primaryPhotoIndex
                  try {
                    const profile = await profileRestService.getProfile(profileData.did)
                    console.log("Profile data for primary photo index:", profile)
                    
                    // Update profile data with fetched photos and the correct primaryPhotoIndex from the profile
                    updateProfileData({
                      photos: photoUrls,
                      photoDataArray: photos,
                      // Use the primaryPhotoIndex from the profile if available, otherwise use the current value
                      primaryPhotoIndex: profile?.primaryPhotoIndex !== undefined ? profile.primaryPhotoIndex : profileData.primaryPhotoIndex
                    })
                    
                    console.log(`Using primaryPhotoIndex: ${profile?.primaryPhotoIndex !== undefined ? profile.primaryPhotoIndex : profileData.primaryPhotoIndex}`)
                  } catch (profileError) {
                    console.error("Error fetching profile for primaryPhotoIndex:", profileError)
                    
                    // Fallback to just updating photos without changing primaryPhotoIndex
                    updateProfileData({
                      photos: photoUrls,
                      photoDataArray: photos
                    })
                  }
                  
                  // toast({
                  //   title: "Photos Retrieved",
                  //   description: `Loaded ${photoUrls.length} existing photos from your profile.`,
                  //   duration: 3000,
                  // })
                } else {
                  console.log("No photos found for this DID")
                }
              } catch (photoError) {
                console.error("Error fetching photos:", photoError)
                // Don't show an error toast here, just log it
              }
            } else {
              console.warn("profileRestService.getProfilePhotos method not available")
            }
          }
        } catch (error) {
          console.error("Error in fetchExistingPhotos:", error)
        } finally {
          setIsLoadingPhotos(false)
        }
      } else if (profileData.photos.length > 0) {
        // Initialize photo data from existing profile data
        const initialPhotoData = profileData.photos.map((url, index) => ({
          photoUrl: url,
          order: index,
          description: `Profile Photo ${index + 1}`,
          isPrivate: false,
          did: profileData.did
        }))
        setPhotoDataArray(initialPhotoData)
      }
    }
    
    fetchExistingPhotos()
  }, [profileData.did, serviceLoading, profileRestService])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    
    setUploading(true)
    setUploadError(null)

    try {
      const file = files[0]
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size exceeds 5MB limit")
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error("Only image files are allowed")
      }
      
      // Extract file extension and mimeType from mime type
      let fileExtension = 'jpg'; // Default extension
      let mimeType = file.type; // Get the actual mime type
      let fileSize = file.size; // Get the actual file size
      
      const mimeTypeMatch = file.type.match(/image\/([a-zA-Z0-9]+)/);
      if (mimeTypeMatch && mimeTypeMatch[1]) {
        fileExtension = mimeTypeMatch[1].toLowerCase();
        // Normalize extensions
        if (fileExtension === 'jpeg') fileExtension = 'jpg';
      }
      
      // Convert file to base64 for preview and storage
      const base64 = await fileToBase64(file)
      
      // Get DID if available
      let did = profileData.did || null
      if (!did && client) {
        try {
          const isAuthenticated = await getAuthStatus()
          if (isAuthenticated) {
            did = await getDidId()
          }
          
          // Store DID in profile data if found
          if (did && !profileData.did) {
            updateProfileData({ did })
          }
        } catch (didError) {
          console.error("Error getting DID:", didError)
        }
      }
      
      // Create new photo data
      const order = profileData.photos.length
      const newPhotoData = {
        did: did,
        photoUrl: base64,
        description: `Profile Photo ${order + 1}`,
        isPrivate: false,
        order: order,
        extension: fileExtension,
        mimeType: mimeType,
        size: fileSize
      }
      
      // Add to photo data array
      const updatedPhotoData = [...photoDataArray, newPhotoData]
      setPhotoDataArray(updatedPhotoData)
      
      // Update profile data with new photo
      updateProfileData({
        photos: [...profileData.photos, base64],
        photoDataArray: updatedPhotoData
      })
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      toast({
        title: "Photo Added",
        description: "Your photo has been added to your profile",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error during photo upload:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to upload photo")
    } finally {
      setUploading(false)
    }
  }
  
  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleContinue = async () => {
    if (profileData.photos.length === 0) {
      toast({
        variant: "destructive",
        title: "Required Field Missing",
        description: "Please upload at least one photo to continue",
        duration: 3000,
      })
      return
    }

    // Store the photo data array in profile data for later use in preferences step
    updateProfileData({
      photoDataArray: photoDataArray
    })
    
    onContinue()
  }

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const removePhoto = (index: number) => {
    const updatedPhotos = [...profileData.photos]
    updatedPhotos.splice(index, 1)
    
    const updatedPhotoData = [...photoDataArray]
    updatedPhotoData.splice(index, 1)
    
    // Update order numbers for remaining photos
    updatedPhotoData.forEach((photo, i) => {
      photo.order = i
      photo.description = `Profile Photo ${i + 1}`
    })
    
    setPhotoDataArray(updatedPhotoData)

    // If removing the primary photo, reset the primary index
    let newPrimaryIndex = profileData.primaryPhotoIndex
    if (index === profileData.primaryPhotoIndex) {
      newPrimaryIndex = updatedPhotos.length > 0 ? 0 : -1
    } else if (index < profileData.primaryPhotoIndex) {
      newPrimaryIndex--
    }

    updateProfileData({
      photos: updatedPhotos,
      primaryPhotoIndex: newPrimaryIndex,
      photoDataArray: updatedPhotoData
    })
  }

  const setPrimaryPhoto = (index: number) => {
    updateProfileData({ primaryPhotoIndex: index })
  }

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Add Profile Photos</CardTitle>
        <CardDescription>Upload photos to showcase your personality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {uploadError && (
          <Alert variant="destructive">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertTitle>Upload Error</AlertTitle>
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
      
        <div className="bg-purple-50 p-4 rounded-lg flex items-start space-x-3">
          <InfoIcon className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">
              All images are stored securely off-chain using the Verida network. Your NFT profile will link to these photos via a hashed
              reference for authenticity.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-2/3">
            {isLoadingPhotos ? (
              <div className="flex items-center justify-center h-40">
                <HeartLoader size="md" />
                <p className="ml-3 text-purple-600">Loading your photos...</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {profileData.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${index === profileData.primaryPhotoIndex ? "border-pink-500" : "border-gray-200"}`}
                    >
                      <img
                        src={photo || "/placeholder.svg"}
                        alt={`Profile photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(index)}
                      >
                        <XIcon className="h-3 w-3" />
                      </Button>
                      {index !== profileData.primaryPhotoIndex && (
                        <Button
                          variant="default"
                          size="icon"
                          className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-amber-500 hover:bg-amber-600"
                          onClick={() => setPrimaryPhoto(index)}
                        >
                          <StarIcon className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    {index === profileData.primaryPhotoIndex && (
                      <div className="absolute bottom-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                        Primary
                      </div>
                    )}
                  </div>
                ))}

                {profileData.photos.length < 6 && (
                  <div
                    className="aspect-square rounded-lg border-2 border-dashed border-purple-300 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50/50 transition-all duration-300 hover:border-pink-400 hover:shadow-inner"
                    onClick={triggerFileUpload}
                  >
                    {uploading ? (
                      <HeartLoader size="sm" />
                    ) : (
                      <>
                        <UploadIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-muted-foreground">Upload Photo</p>
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          className="hidden" 
                          accept="image/jpeg, image/png, image/gif"
                          onChange={handleFileUpload}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="w-full md:w-1/3 bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-700 mb-4">Photo Guidelines</h3>
            <div className="text-sm text-muted-foreground space-y-3">
              <p className="flex items-center">
                <span className="inline-block w-4 h-4 bg-purple-200 rounded-full mr-2 flex-shrink-0"></span>
                Upload up to 6 photos
              </p>
              <p className="flex items-center">
                <span className="inline-block w-4 h-4 bg-purple-200 rounded-full mr-2 flex-shrink-0"></span>
                First photo will be your primary photo by default
              </p>
              <p className="flex items-center">
                <span className="inline-block w-4 h-4 bg-purple-200 rounded-full mr-2 flex-shrink-0"></span>
                Click the star icon to set a different primary photo
              </p>
              <p className="flex items-center">
                <span className="inline-block w-4 h-4 bg-purple-200 rounded-full mr-2 flex-shrink-0"></span>
                Supported formats: JPEG, PNG (max 5MB each)
              </p>
              <p className="flex items-center">
                <span className="inline-block w-4 h-4 bg-purple-200 rounded-full mr-2 flex-shrink-0"></span>
                Clear, recent photos work best
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleContinue}
          className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] rounded-xl py-5"
          disabled={uploading || isLoadingPhotos}
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="relative">Continue to Preferences</span>
        </Button>
      </CardFooter>
    </>
  )
}


