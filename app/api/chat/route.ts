import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { messages, scanInfo } = await req.json()

    // Create a system prompt that includes scan information if available
    let systemPrompt =
      "You are Kwaku, a helpful medical AI assistant from Diagnostics AI. Provide concise, professional responses about medical imaging and diagnostics. Do not provide specific medical advice or diagnosis without proper context."

    if (scanInfo && scanInfo.scanType && scanInfo.diagnosisArea) {
      systemPrompt += ` The user has uploaded a ${scanInfo.scanType} focusing on ${scanInfo.diagnosisArea}`

      if (scanInfo.bodyPartImaged) {
        systemPrompt += ` of the ${scanInfo.bodyPartImaged.toLowerCase()}`

        if (scanInfo.fracturedBone) {
          systemPrompt += ` (${scanInfo.fracturedBone})`
        }
      }

      systemPrompt +=
        ". Provide relevant information about this type of scan and potential findings, but avoid making specific diagnoses about the user's condition."
    }

    // Stream the response
    const result = streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
