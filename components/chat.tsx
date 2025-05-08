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
  const scrollRef = useRef<HTMLDivElement>(null)

  // Initial assistant messages
  useEffect(() => {
    if (formData.chatMessages.length === 0) {
      updateChatMessages([
        {
          id: 1,
          content: "Hello, my name is Kwaku from Diagnostics AI. I'm here to assist you.",
          role: "assistant",
        },
      ])
    }

    if (
      scanType &&
      diagnosisArea &&
      formData.currentScan.isSubmitted &&
      formData.chatMessages.length === 1
    ) {
      updateChatMessages([
        ...formData.chatMessages,
        {
          id: Date.now(),
          content: `I see you've uploaded a ${scanType} for a diagnosis focused on ${diagnosisArea} of the ${bodyPartImaged.toLowerCase()}${
            fracturedBone ? ` (${fracturedBone})` : ""
          }. How can I help you with this scan?`,
          role: "assistant",
        },
      ])
    }
  }, [scanType, diagnosisArea, bodyPartImaged, fracturedBone, formData.chatMessages, formData.currentScan.isSubmitted])

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [formData.chatMessages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      content: input,
      role: "user" as const,
    }

    const tempLoadingMessage = {
      id: Date.now() + 1,
      content: "Thinking...",
      role: "assistant" as const,
    }

    updateChatMessages([...formData.chatMessages, userMessage, tempLoadingMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Use the correct Flask API URL - make sure this matches your Flask server setup
      // If your Flask server is running on a different port or host, adjust accordingly
      const flaskApiUrl = 'http://127.0.0.1:5000/chatbot';
      
      console.log("Sending request to:", flaskApiUrl);
      console.log("Request payload:", JSON.stringify({ message: userMessage.content }));

      const response = await fetch(flaskApiUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // Add this header to explicitly allow cross-origin requests
          "Access-Control-Allow-Origin": "*"
        },
        // Include credentials if your API requires authentication
        // credentials: 'include', 
        body: JSON.stringify({ 
          message: userMessage.content 
        }),
      });
      
      console.log("Response status:", response.status);
      
      const data = await response.json();
      console.log("Response data:", data);

      const filteredMessages = formData.chatMessages.filter(
        (msg) => msg.content !== "Thinking..."
      );

      if (response.ok) {
        updateChatMessages([
          ...filteredMessages,
          userMessage,
          {
            id: Date.now(),
            content: data.ai_response, // Use ai_response from Flask API
            role: "assistant",
          },
        ]);
      } else {
        updateChatMessages([
          ...filteredMessages,
          userMessage,
          {
            id: Date.now(),
            content: `Error: ${data.message || "Unable to get a response"}`,
            role: "assistant",
          },
        ]);
      }
    } catch (error) {
      console.error("Error in chat:", error);
      updateChatMessages([
        ...formData.chatMessages.filter(msg => msg.content !== "Thinking..."),
        userMessage,
        {
          id: Date.now(),
          content: `Connection error: ${error instanceof Error ? error.message : "Unable to reach the server"}`,
          role: "assistant",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

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

      <CardContent className="flex-grow overflow-hidden">
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
            <div ref={scrollRef} />
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
