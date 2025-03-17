"use client"

import { useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFormContext } from "@/contexts/FormContext"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ImageUploadCardProps {
  onImageUpload: (image: string, scanType: string, area: string, bodyPartImaged: string, fracturedBone?: string) => void
}

export function ImageUploadCard({ onImageUpload }: ImageUploadCardProps) {
  const { formData, updateFormData } = useFormContext()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageData = reader.result as string
        updateFormData({ currentScan: { ...formData.currentScan, image: imageData } })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    if (
      formData.currentScan.image &&
      formData.currentScan.scanType &&
      formData.currentScan.diagnosisArea &&
      formData.currentScan.bodyPartImaged
    ) {
      onImageUpload(
        formData.currentScan.image,
        formData.currentScan.scanType,
        formData.currentScan.diagnosisArea,
        formData.currentScan.bodyPartImaged,
        formData.currentScan.fracturedBone,
      )
      updateFormData({
        currentScan: { ...formData.currentScan, isSubmitted: true },
      })
    }
  }

  const handleDeleteImage = () => {
    updateFormData({
      currentScan: {
        ...formData.currentScan,
        image: null,
        isSubmitted: false,
        bodyPartImaged: "",
        fracturedBone: "",
      },
    })
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const allowedFileTypes = "image/png, image/jpeg, image/gif, image/bmp, image/webp"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Scan</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-6">
        <Select
          value={formData.currentScan.scanType}
          onValueChange={(value) => updateFormData({ currentScan: { ...formData.currentScan, scanType: value } })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select scan type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="X-ray scan">X-ray scan</SelectItem>
            <SelectItem value="MRI scan">MRI scan</SelectItem>
            <SelectItem value="Histopathology image">Histopathology image</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={formData.currentScan.diagnosisArea}
          onValueChange={(value) => updateFormData({ currentScan: { ...formData.currentScan, diagnosisArea: value } })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select area of diagnosis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Brain Tumors">Brain Tumors</SelectItem>
            <SelectItem value="Breast Cancer">Breast Cancer</SelectItem>
            <SelectItem value="Bone Fractures">Bone Fractures</SelectItem>
            <SelectItem value="Lung Cancer">Lung Cancer</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={formData.currentScan.bodyPartImaged}
          onValueChange={(value) => updateFormData({ currentScan: { ...formData.currentScan, bodyPartImaged: value } })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select body part imaged" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Bone suspected of being fractured">Bone suspected of being fractured</SelectItem>
            <SelectItem value="Brain">Brain</SelectItem>
            <SelectItem value="Chest">Chest</SelectItem>
            <SelectItem value="Breast and Lymph Nodes">Breast and Lymph Nodes</SelectItem>
          </SelectContent>
        </Select>
        {formData.currentScan.bodyPartImaged === "Bone suspected of being fractured" && (
          <div className="w-full">
            <Label htmlFor="fracturedBone" className="mb-2 block">
              Specify the bone suspected of being fractured
            </Label>
            <Input
              id="fracturedBone"
              value={formData.currentScan.fracturedBone}
              onChange={(e) =>
                updateFormData({ currentScan: { ...formData.currentScan, fracturedBone: e.target.value } })
              }
              placeholder="e.g., Femur, Tibia, Radius"
            />
          </div>
        )}
        {formData.currentScan.image ? (
          <div className="relative aspect-square w-full flex items-center justify-center">
            <Image
              src={formData.currentScan.image || "/placeholder.svg"}
              alt="Uploaded image"
              width={300}
              height={300}
              className="object-contain max-w-full max-h-full"
            />
            <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={handleDeleteImage}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="text-muted-foreground">No image found</div>
            <Button
              variant="outline"
              className="w-full"
              disabled={
                !formData.currentScan.scanType ||
                !formData.currentScan.diagnosisArea ||
                !formData.currentScan.bodyPartImaged
              }
              onClick={triggerFileInput}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Scan
            </Button>
            <input
              type="file"
              className="hidden"
              accept={allowedFileTypes}
              onChange={handleImageUpload}
              disabled={
                !formData.currentScan.scanType ||
                !formData.currentScan.diagnosisArea ||
                !formData.currentScan.bodyPartImaged
              }
              ref={fileInputRef}
            />
            <p className="text-xs text-muted-foreground">Allowed file types: PNG, JPEG, GIF, BMP, WebP</p>
          </>
        )}
        {formData.currentScan.image &&
          formData.currentScan.scanType &&
          formData.currentScan.diagnosisArea &&
          formData.currentScan.bodyPartImaged &&
          !formData.currentScan.isSubmitted && (
            <Button onClick={handleSubmit} className="w-full">
              Submit
            </Button>
          )}
      </CardContent>
    </Card>
  )
}

