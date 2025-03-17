"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { useFormContext } from "@/contexts/FormContext"

export function RecentUploadsCard() {
  const { formData } = useFormContext()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Uploads</CardTitle>
      </CardHeader>
      <CardContent>
        {formData.recentUploads.length === 0 ? (
          <p className="text-muted-foreground">No recent uploads</p>
        ) : (
          <div className="space-y-4">
            {formData.recentUploads.map((upload) => (
              <div key={upload.id} className="flex items-center space-x-4">
                <div className="relative w-16 h-16" suppressHydrationWarning>
                <Image
                  src={upload.image}
                  alt={`${upload.scanType} for ${upload.diagnosisArea}`}
                  fill={true}
                  className="rounded-md object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                </div>
                <div>
                  <p className="font-medium">{upload.scanType}</p>
                  <p className="text-sm text-muted-foreground">{upload.diagnosisArea}</p>
                  <p className="text-xs text-muted-foreground">{upload.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

