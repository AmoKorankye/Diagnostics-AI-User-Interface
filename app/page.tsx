"use client"

import { useState, useEffect } from "react"
import { ScanManagement } from "@/components/scan-management"
import { Chat } from "@/components/chat"
import { useFormContext } from "@/contexts/FormContext"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "sonner"

export default function DashboardPage() {
  const { formData, addRecentUpload, updateFormData } = useFormContext()
  const [mounted, setMounted] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)

  // Only render the component after client-side hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const processImageWithModel = async (image: string, diagnosisArea: string) => {
    setProcessing(true)
    try {
      const response = await fetch('http://localhost:5000/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image,
          diagnosisArea,
        }),
      })
      
      // Get the raw text first to debug
      const textResponse = await response.text();
      console.log("Raw server response:", textResponse);
      
      // Then try to parse it as JSON
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError);
        toast("Invalid Response", {
          description: "Server returned invalid JSON data."
        });
        setProcessing(false);
        return;
      }
      
      if (data.status === 'success') {
        setAnalysisResult(data.result)
        
        // Store the result and heatmap in localStorage
        const diagnosisResult = data.result;
        const modelResult = {
          confidence: diagnosisResult.confidence,
          diagnosis: diagnosisResult.diagnosis,
          otherProbabilities: Object.entries(diagnosisResult.probabilities)
            .filter(([key]) => key !== diagnosisResult.diagnosis)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
        };
        
        // Store model results in localStorage
        localStorage.setItem('diagnosticsModelResult', JSON.stringify(modelResult));
        
        // Store heatmap if available
        if (data.heatmap) {
          localStorage.setItem('diagnosticsHeatmap', data.heatmap);
        }
        
        toast("Analysis Complete", {
          description: "The image has been successfully analyzed."
        })
      } else {
        toast("Analysis Failed", {
          description: data.message || "There was an error processing the image."
        })
      }
    } catch (error) {
      console.error('Error processing image:', error)
      toast("Error", {
        description: "Failed to communicate with the server."
      })
    } finally {
      setProcessing(false)
    }
  }

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
    
    // Process the image with the model
    processImageWithModel(image, area)
  }

  // Don't render content until after hydration
  if (!mounted) {
    return null
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <ScanManagement onImageUpload={handleImageUpload} />
          {processing && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-blue-600">Processing image with AI model...</p>
            </div>
          )}
{analysisResult && (
  <div className="mt-4 p-4 bg-green-50 rounded-md">
    <h3 className="font-semibold">Analysis Complete</h3>
    <p className="text-sm mt-2">
      Your image has been successfully analyzed. Please proceed to the summary report page to see your detailed results.
    </p>
    <button 
      className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
      onClick={() => {
      toast("Results Ready", {
        description: "Your analysis is complete. Redirecting to summary report page."
      });
      }}
    >
      View Summary Report
    </button>
  </div>
)}

          {/* {analysisResult && (
            <div className="mt-4 p-4 bg-green-50 rounded-md">
              <h3 className="font-semibold">Analysis Results:</h3>
              <pre className="text-sm mt-2 overflow-auto">
                {JSON.stringify(analysisResult, null, 2)}
              </pre>
            </div>
          )} */}
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