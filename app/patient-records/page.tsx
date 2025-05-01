"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"
import { useFormContext } from "@/contexts/FormContext"
import { savePatientRecord } from "./actions" // Import the server action
import { useRouter } from "next/navigation"

export default function PatientRecordsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { formData, updateFormData } = useFormContext()
  const [date, setDate] = useState<Date | undefined>(
    formData.patientInfo.dateOfBirth ? new Date(formData.patientInfo.dateOfBirth) : undefined,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Ensure gender and bloodGroup have initial values to prevent hydration errors
  const gender = formData.patientInfo.gender || ""
  const bloodGroup = formData.patientInfo.bloodGroup || ""

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    updateFormData({
      patientInfo: {
        ...formData.patientInfo,
        [name]: value,
      },
    })
  }

  const handleSelectChange = (name: string) => (value: string) => {
    updateFormData({
      patientInfo: {
        ...formData.patientInfo,
        [name]: value,
      },
    })
  }

  const handlePhoneChange = (value: string | undefined, name: string) => {
    updateFormData({
      patientInfo: {
        ...formData.patientInfo,
        [name]: value || "",
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const requiredFields = [
      "firstName",
      "lastName",
      "gender",
      "dateOfBirth",
      "phone",
      "emergencyContactName",
      "emergencyContactRelation",
      "emergencyContactPhone",
      "doctorsName",
    ]

    const missingFields = requiredFields.filter(
      (field) => !formData.patientInfo[field as keyof typeof formData.patientInfo],
    )

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Information",
        description: "Please fill in all required fields marked with an asterisk (*).",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Replace direct DB operation with server action
      const result = await savePatientRecord(formData.patientInfo)
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Patient record for ${formData.patientInfo.firstName} ${formData.patientInfo.lastName} has been saved.`,
          duration: 1000,
        })
        router.replace("/")
      } else {
        toast({
          title: "Error Saving Record",
          description: result.error || "Unknown database error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving patient record:", error)
      toast({
        title: "System Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred while processing your request.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Patient Records</h1>
      <p className="text-sm text-muted-foreground mb-4">Fields marked with an asterisk (*) are required.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.patientInfo.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.patientInfo.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select name="gender" value={gender} onValueChange={handleSelectChange("gender")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.patientInfo.dateOfBirth && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.patientInfo.dateOfBirth ? (
                      format(new Date(formData.patientInfo.dateOfBirth), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3">
                    <Select
                      value={date ? date.getFullYear().toString() : undefined}
                      onValueChange={(value) => {
                        const newYear = Number.parseInt(value, 10)
                        const newDate = date
                          ? new Date(newYear, date.getMonth(), date.getDate())
                          : new Date(newYear, 0, 1)
                        setDate(newDate)
                        updateFormData({
                          patientInfo: {
                            ...formData.patientInfo,
                            dateOfBirth: newDate.toISOString(),
                          },
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate)
                      if (newDate) {
                        updateFormData({
                          patientInfo: {
                            ...formData.patientInfo,
                            dateOfBirth: newDate.toISOString(),
                          },
                        })
                      }
                    }}
                    initialFocus
                    month={date || new Date()}
                    onMonthChange={(newMonth) => {
                      // Keep the same year when changing months
                      const currentYear = date ? date.getFullYear() : new Date().getFullYear()
                      const newDate = new Date(currentYear, newMonth.getMonth(), 1)
                      setDate(newDate)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone *</Label>
              <PhoneInput
                international
                countryCallingCodeEditable={false}
                defaultCountry="GH"
                value={formData.patientInfo.phone}
                onChange={(value) => handlePhoneChange(value, "phone")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.patientInfo.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" value={formData.patientInfo.address} onChange={handleInputChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="emergencyContactName">Name *</Label>
              <Input
                id="emergencyContactName"
                name="emergencyContactName"
                value={formData.patientInfo.emergencyContactName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emergencyContactRelation">Relation *</Label>
              <Input
                id="emergencyContactRelation"
                name="emergencyContactRelation"
                value={formData.patientInfo.emergencyContactRelation}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emergencyContactPhone">Phone *</Label>
              <PhoneInput
                international
                countryCallingCodeEditable={false}
                defaultCountry="GH"
                value={formData.patientInfo.emergencyContactPhone}
                onChange={(value) => handlePhoneChange(value, "emergencyContactPhone")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select
                name="bloodGroup"
                value={bloodGroup}
                onValueChange={handleSelectChange("bloodGroup")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                name="allergies"
                value={formData.patientInfo.allergies}
                onChange={handleInputChange}
                placeholder="List any allergies..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="preExistingConditions">Pre-existing Conditions</Label>
              <Textarea
                id="preExistingConditions"
                name="preExistingConditions"
                value={formData.patientInfo.preExistingConditions}
                onChange={handleInputChange}
                placeholder="List any pre-existing conditions..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                value={formData.patientInfo.height}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                value={formData.patientInfo.weight}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="doctorsName">Doctor's Name *</Label>
              <Input
                id="doctorsName"
                name="doctorsName"
                value={formData.patientInfo.doctorsName}
                onChange={handleInputChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Patient Record"}
        </Button>
      </form>
    </div>
  )
}

