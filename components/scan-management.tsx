"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUploadCard } from "./image-upload-card"
import { RecentUploads } from "./recent-uploads"
import { useFormContext } from "@/contexts/FormContext"
import { useToast } from "@/components/ui/toast"

interface ScanManagementProps {
  onImageUpload: (image: string, scanType: string, area: string, bodyPartImaged: string, fracturedBone?: string) => void
}

export function ScanManagement({ onImageUpload }: ScanManagementProps) {
  const [activeTab, setActiveTab] = useState("upload")
  const { formData } = useFormContext()
  const { toast } = useToast()

  const handleImageUpload = (
    image: string,
    scanType: string,
    area: string,
    bodyPartImaged: string,
    fracturedBone?: string,
  ) => {
    onImageUpload(image, scanType, area, bodyPartImaged, fracturedBone)
    toast({
      title: "Image Uploaded",
      description: "Your scan has been successfully uploaded.",
    })
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload">Upload Scan</TabsTrigger>
        <TabsTrigger value="recent">Recent Uploads</TabsTrigger>
      </TabsList>
      <TabsContent value="upload">
        <ImageUploadCard onImageUpload={handleImageUpload} />
      </TabsContent>
      <TabsContent value="recent">
        <RecentUploads uploads={formData.recentUploads} />
      </TabsContent>
    </Tabs>
  )
}

