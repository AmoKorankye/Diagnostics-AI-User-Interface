"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import Image from "next/image"
import { useFormContext } from "@/contexts/FormContext"

interface Message {
  id: number
  content: string
  role: "assistant" | "user"
}

interface ChatProps {
  scanType: string
  diagnosisArea: string
  bodyPartImaged: string
  fracturedBone?: string
}

export function Chat({ scanType, diagnosisArea, bodyPartImaged, fracturedBone }: ChatProps) {
  const { formData, updateChatMessages } = useFormContext()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (formData.chatMessages.length === 0) {
      updateChatMessages([
        {
          id: 1,
          content: "Hello, my name is Kwaku from diagnostics AI. I'm here to assist you.",
          role: "assistant",
        },
      ])
    }

    if (scanType && diagnosisArea && formData.currentScan.isSubmitted && formData.chatMessages.length === 1) {
      handleScanUploadMessage()
    }
  }, [scanType, diagnosisArea, bodyPartImaged, fracturedBone, formData.chatMessages, formData.currentScan.isSubmitted])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [formData.chatMessages])

  const handleScanUploadMessage = async () => {
    setIsLoading(true)
    try {
      // Convert the existing messages to the format expected by the API
      const apiMessages = formData.chatMessages.map((msg) => ({
        content: msg.content,
        role: msg.role,
      }))

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          scanInfo: {
            scanType,
            diagnosisArea,
            bodyPartImaged,
            fracturedBone,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      updateChatMessages([
        ...formData.chatMessages,
        {
          id: Date.now(),
          content: data.text || "I see you've uploaded a scan. How can I help you with this?",
          role: "assistant",
        },
      ])
    } catch (error) {
      console.error("Error getting scan upload message:", error)
      updateChatMessages([
        ...formData.chatMessages,
        {
          id: Date.now(),
          content: `I see you've uploaded a ${scanType} for a diagnosis focused on ${diagnosisArea} of the ${bodyPartImaged.toLowerCase()}${fracturedBone ? ` (${fracturedBone})` : ""}. Let's get started!`,
          role: "assistant",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      const userMessage = { id: Date.now(), content: input, role: "user" as const }
      updateChatMessages([...formData.chatMessages, userMessage])
      setInput("")
      setIsLoading(true)

      try {
        // Convert the messages to the format expected by the API
        const apiMessages = [...formData.chatMessages, userMessage].map((msg) => ({
          content: msg.content,
          role: msg.role,
        }))

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: apiMessages,
            scanInfo: {
              scanType,
              diagnosisArea,
              bodyPartImaged,
              fracturedBone,
            },
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to get response")
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error("No reader available")

        let assistantMessage = ""
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          try {
            const lines = chunk.split("\n").filter((line) => line.trim() !== "")
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") continue

                try {
                  const parsed = JSON.parse(data)
                  if (parsed.type === "text-delta") {
                    assistantMessage += parsed.text
                    updateChatMessages([
                      ...formData.chatMessages,
                      userMessage,
                      {
                        id: Date.now(),
                        content: assistantMessage,
                        role: "assistant",
                      },
                    ])
                  }
                } catch (e) {
                  console.error("Error parsing JSON:", e)
                }
              }
            }
          } catch (e) {
            console.error("Error processing chunk:", e)
          }
        }

        if (!assistantMessage) {
          throw new Error("No response generated")
        }
      } catch (error) {
        console.error("Error in chat:", error)
        updateChatMessages([
          ...formData.chatMessages,
          userMessage,
          {
            id: Date.now(),
            content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
            role: "assistant",
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex flex-col items-center space-y-2">
        <Avatar className="h-16 w-16">
          <AvatarImage src="/doctor.png" alt="Kwaku" />
          <AvatarFallback className="flex items-center justify-center">
            <Image src="/doctor-fallback.png" alt="Doctor" width={64} height={64} className="object-cover" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center">
          <CardTitle className="font-bold text-xl">Kwaku</CardTitle>
          <p className="text-sm text-muted-foreground">Diagnostics AI</p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden" ref={scrollAreaRef}>
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4 pb-4">
            {formData.chatMessages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === "assistant" ? "ml-2" : ""} ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && formData.chatMessages[formData.chatMessages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-2 max-w-[80%] ml-2 bg-muted">
                  <span className="inline-block animate-pulse">...</span>
                </div>
              </div>
            )}
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
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
