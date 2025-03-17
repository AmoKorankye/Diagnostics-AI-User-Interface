"use client"

import { useState } from "react"
import { ScanManagement } from "@/components/scan-management"
import { Chat } from "@/components/chat"
import { useFormContext } from "@/contexts/FormContext"
import { Toaster } from "@/components/ui/toaster"

export default function DashboardPage() {
  const { formData, addRecentUpload, updateFormData } = useFormContext()

  const handleImageUpload = (
    image: string,
    scanType: string,
    area: string,
    bodyPartImaged: string,
    fracturedBone?: string,
  ) => {
    const newUpload = {
      id: Date.now().toString(),
      image,
      scanType,
      diagnosisArea: area,
      bodyPartImaged,
      fracturedBone,
      date: new Date().toISOString().split("T")[0],
    }
    addRecentUpload(newUpload)
    updateFormData({
      currentScan: {
        ...formData.currentScan,
        bodyPartImaged,
        fracturedBone,
      },
    })
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <ScanManagement onImageUpload={handleImageUpload} />
        </div>
        <div className="md:col-span-1">
          <Chat
            scanType={formData.currentScan.scanType}
            diagnosisArea={formData.currentScan.diagnosisArea}
            bodyPartImaged={formData.currentScan.bodyPartImaged}
            fracturedBone={formData.currentScan.fracturedBone}
          />
        </div>
      </div>
      <Toaster />
    </>
  )
}

