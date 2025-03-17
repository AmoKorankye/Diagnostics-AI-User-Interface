"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

interface RecentUpload {
  id: string
  image: string
  scanType: string
  diagnosisArea: string
  date: string
}

interface RecentUploadsProps {
  uploads: RecentUpload[]
}

export function RecentUploads({ uploads }: RecentUploadsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Uploads</CardTitle>
      </CardHeader>
      <CardContent>
        {uploads.length === 0 ? (
          <p className="text-muted-foreground">No recent uploads</p>
        ) : (
          <div className="space-y-4">
            {uploads.map((upload) => (
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

