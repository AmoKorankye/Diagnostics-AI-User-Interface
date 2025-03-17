"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from 'lucide-react'
import Image from 'next/image'
import { useFormContext } from "@/contexts/FormContext"

interface Message {
  id: number
  content: string
  role: "assistant" | "user"
}

interface ChatProps {
  scanType: string
  diagnosisArea: string
}

export function Chat({ scanType, diagnosisArea }: ChatProps) {
  const { formData, updateChatMessages } = useFormContext()
  const [input, setInput] = useState("")

  useEffect(() => {
    if (formData.chatMessages.length === 0) {
      updateChatMessages([
        {
          id: 1,
          content: "Hello, my name is Kwaku from diagnostics AI. I'm here to assist you.",
          role: "assistant"
        }
      ]);
    }

    if (scanType && diagnosisArea && formData.currentScan.isSubmitted && formData.chatMessages.length === 1) {
      updateChatMessages([
        ...formData.chatMessages,
        {
          id: Date.now(),
          content: `I see you've uploaded a ${scanType} for a diagnosis focused on ${diagnosisArea}. Let's get started!`,
          role: "assistant"
        }
      ]);
    }
  }, [scanType, diagnosisArea, formData.chatMessages, formData.currentScan.isSubmitted, updateChatMessages])

  const handleSend = () => {
    if (input.trim()) {
      const newMessage = { id: Date.now(), content: input, role: "user" as const }
      updateChatMessages([...formData.chatMessages, newMessage])
      setInput("")
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex flex-col items-center space-y-2">
        <Avatar className="h-16 w-16">
          <AvatarImage src="/doctor.png" alt="Kwaku" />
          <AvatarFallback className="flex items-center justify-center">
            <Image
              src="/doctor-fallback.png"
              alt="Doctor"
              width={64}
              height={64}
              className="object-cover"
            />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center">
          <CardTitle className="font-bold text-xl">Kwaku</CardTitle>
          <p className="text-sm text-muted-foreground">Diagnostics AI</p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4 pb-4">
            {formData.chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Avatar removed from message rendering */}
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === "assistant" ? "ml-2" : ""} ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }} 
          className="flex w-full items-center space-x-2"
        >
          <Input
            id="message"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

