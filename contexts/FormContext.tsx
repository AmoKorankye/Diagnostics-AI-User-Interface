"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface Message {
  id: number
  content: string
  role: "assistant" | "user"
}

interface UploadedScan {
  id: string
  image: string
  scanType: string
  diagnosisArea: string
  bodyPartImaged: string
  fracturedBone?: string
  date: string
}

interface FormData {
  patientInfo: {
    firstName: string
    lastName: string
    gender: string
    dateOfBirth: string
    phone: string
    email: string
    address: string
    emergencyContactName: string
    emergencyContactRelation: string
    emergencyContactPhone: string
    bloodGroup: string
    allergies: string
    preExistingConditions: string
    height: string
    weight: string
    doctorsName: string
  }
  emails: string[]
  currentEmail: string
  subject: string
  description: string
  currentScan: {
    image: string | null
    scanType: string
    diagnosisArea: string
    bodyPartImaged: string
    fracturedBone?: string
    isSubmitted: boolean
  }
  recentUploads: UploadedScan[]
  chatMessages: Message[]
}

interface FormContextType {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  clearFormData: () => void
  addRecentUpload: (upload: UploadedScan) => void
  updateChatMessages: (messages: Message[]) => void
}

const FormContext = createContext<FormContextType | undefined>(undefined)

export const useFormContext = () => {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider")
  }
  return context
}

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<FormData>(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("formData")
      if (savedData) {
        return JSON.parse(savedData)
      }
    }
    return {
      patientInfo: {
        firstName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        phone: "",
        email: "",
        address: "",
        emergencyContactName: "",
        emergencyContactRelation: "",
        emergencyContactPhone: "",
        bloodGroup: "",
        allergies: "",
        preExistingConditions: "",
        height: "",
        weight: "",
        doctorsName: "",
      },
      emails: [],
      currentEmail: "",
      subject: "",
      description: "",
      currentScan: {
        image: null,
        scanType: "",
        diagnosisArea: "",
        bodyPartImaged: "",
        fracturedBone: "",
        isSubmitted: false,
      },
      recentUploads: [],
      chatMessages: [],
    }
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("formData", JSON.stringify(formData))
    }
  }, [formData])

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => {
      const newData = { ...prev, ...data }
      if (typeof window !== "undefined") {
        localStorage.setItem("formData", JSON.stringify(newData))
      }
      return newData
    })
  }

  const clearFormData = () => {
    const initialState = {
      patientInfo: {
        firstName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        phone: "",
        email: "",
        address: "",
        emergencyContactName: "",
        emergencyContactRelation: "",
        emergencyContactPhone: "",
        bloodGroup: "",
        allergies: "",
        preExistingConditions: "",
        height: "",
        weight: "",
        doctorsName: "",
      },
      emails: [],
      currentEmail: "",
      subject: "",
      description: "",
      currentScan: {
        image: null,
        scanType: "",
        diagnosisArea: "",
        bodyPartImaged: "",
        fracturedBone: "",
        isSubmitted: false,
      },
      recentUploads: [],
      chatMessages: [],
    }
    setFormData(initialState)
    if (typeof window !== "undefined") {
      localStorage.removeItem("formData")
    }
  }

  const addRecentUpload = (upload: UploadedScan) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        recentUploads: [upload, ...prev.recentUploads.slice(0, 4)],
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("formData", JSON.stringify(newData))
      }
      return newData
    })
  }

  const updateChatMessages = (messages: Message[]) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        chatMessages: messages,
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("formData", JSON.stringify(newData))
      }
      return newData
    })
  }

  return (
    <FormContext.Provider value={{ formData, updateFormData, clearFormData, addRecentUpload, updateChatMessages }}>
      {children}
    </FormContext.Provider>
  )
}

