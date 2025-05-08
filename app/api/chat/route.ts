// app/api/chat/route.ts

import { OpenAI } from 'openai'

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Option 1: Disable streaming for simplicity
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: false, // Changed to false
    messages,
  })

  // Return properly formatted JSON
  return Response.json({
    text: response.choices[0].message.content
  })
}