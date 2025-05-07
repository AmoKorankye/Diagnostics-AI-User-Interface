import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { scanType, diagnosisArea, bodyPartImaged, fracturedBone } = await req.json()

    if (!scanType || !diagnosisArea) {
      return NextResponse.json({ error: "Missing required scan information" }, { status: 400 })
    }

    // Generate analysis paragraph
    const analysisPrompt = `Generate a detailed medical analysis paragraph for a ${scanType} of the ${bodyPartImaged.toLowerCase()}${fracturedBone ? ` (${fracturedBone})` : ""} focusing on ${diagnosisArea.toLowerCase()}. The analysis should be professional, detailed but concise (100-150 words), and describe potential findings without making definitive claims. Include appropriate medical terminology.`

    const analysisResponse = await generateText({
      model: openai("gpt-4o"),
      prompt: analysisPrompt,
    })

    // Generate recommendations paragraph
    const recommendationsPrompt = `Based on a ${scanType} of the ${bodyPartImaged.toLowerCase()}${fracturedBone ? ` (${fracturedBone})` : ""} focusing on ${diagnosisArea.toLowerCase()}, generate a concise paragraph (60-80 words) of medical recommendations. Include appropriate next steps, potential specialist referrals, and follow-up procedures. Be professional and avoid making definitive claims.`

    const recommendationsResponse = await generateText({
      model: openai("gpt-4o"),
      prompt: recommendationsPrompt,
    })

    return NextResponse.json({
      analysis: analysisResponse.text,
      recommendations: recommendationsResponse.text,
    })
  } catch (error) {
    console.error("Summary analysis API error:", error)
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 })
  }
}
