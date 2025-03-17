"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useFormContext } from "@/contexts/FormContext"

export function ReportIssueCard() {
  const { formData, updateFormData } = useFormContext()
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(String(email).toLowerCase())
  }

  const addEmail = () => {
    if (!formData.currentEmail.trim()) {
      setAlertMessage("Please enter an email address.")
      setShowAlert(true)
      return
    }
    if (validateEmail(formData.currentEmail)) {
      if (!formData.emails.includes(formData.currentEmail)) {
        updateFormData({ emails: [...formData.emails, formData.currentEmail] })
        updateFormData({ currentEmail: "" })
      } else {
        setAlertMessage("This email has already been added.")
        setShowAlert(true)
      }
    } else {
      setAlertMessage("Invalid Email")
      setShowAlert(true)
    }
  }

  const removeEmail = (email: string) => {
    updateFormData({ emails: formData.emails.filter((e) => e !== email) })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.emails.length === 0) {
      setAlertMessage("No Email Address Found")
      setShowAlert(true)
      return
    }
    // Proceed with form submission
    console.log("Form submitted successfully")
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="recipient-email">Recipient Email Address</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.emails.map((email) => (
                <div
                  key={email}
                  className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center"
                >
                  {email}
                  <button
                    onClick={() => removeEmail(email)}
                    className="ml-2 text-secondary-foreground hover:text-primary"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="recipient-email"
                value={formData.currentEmail}
                onChange={(e) => updateFormData({ currentEmail: e.target.value })}
                placeholder="Enter email address"
              />
              <Button onClick={addEmail} type="button">
                Add
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject (Optional)</Label>
            <Input
              id="subject"
              placeholder="Enter subject"
              value={formData.subject}
              onChange={(e) => updateFormData({ subject: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Any Additional Text"
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Share Results
          </Button>
        </CardFooter>
      </form>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAlert(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

