/**
 * Gemini AI Service
 * Generates intelligent incident explanations, severity levels, and fix suggestions
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

let genAI: GoogleGenerativeAI | null = null
let model: any = null

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
}

export interface IncidentAnalysis {
  explanation: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  suggestedFix: string
}

const AI_TIMEOUT_MS = 6000 // 6 second timeout for AI calls

/**
 * Generate incident analysis using Gemini AI with timeout protection
 */
export async function analyzeIncident(params: {
  url: string
  statusCode?: number | null
  responseTime?: number | null
  errorMessage?: string
  previousIncidents?: number
}): Promise<IncidentAnalysis> {
  const {
    url,
    statusCode,
    responseTime,
    errorMessage,
    previousIncidents = 0,
  } = params

  // Fallback if AI not configured
  if (!model) {
    console.warn('Gemini API not configured, using fallback analysis')
    return getFallbackAnalysis(url, statusCode, responseTime, errorMessage)
  }

  try {
    // Create a timeout promise that rejects after 6 seconds
    const timeoutPromise = new Promise<IncidentAnalysis>((_resolve, reject) => {
      setTimeout(() => reject(new Error('AI analysis timeout')), AI_TIMEOUT_MS)
    })

    const analysisPromise = callGeminiAPI(url, statusCode, responseTime, errorMessage, previousIncidents)

    const result = await Promise.race([analysisPromise, timeoutPromise])
    return result
  } catch (error) {
    console.error('AI analysis error:', error)
    return getFallbackAnalysis(url, statusCode, responseTime, errorMessage)
  }
}

/**
 * Call Gemini API for incident analysis
 */
async function callGeminiAPI(
  url: string,
  statusCode: number | null | undefined,
  responseTime: number | null | undefined,
  errorMessage: string | undefined,
  previousIncidents: number
): Promise<IncidentAnalysis> {
  const prompt = `You are an expert SRE. Analyze this website incident and respond as JSON:

Website: ${url}
Status Code: ${statusCode ?? 'No response'}
Response Time: ${responseTime ? responseTime + 'ms' : 'N/A'}
Error: ${errorMessage || 'Unknown'}
Previous Incidents (24h): ${previousIncidents}

Respond ONLY with valid JSON (no markdown):
{
  "explanation": "1-2 sentence technical explanation of the likely cause",
  "severity": "LOW|MEDIUM|HIGH",
  "suggestedFix": "1-2 sentence immediate action to resolve"
}`

  try {
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI')
    }

    const parsed = JSON.parse(jsonMatch[0])

    return {
      explanation: parsed.explanation || 'Unable to determine cause',
      severity: ['LOW', 'MEDIUM', 'HIGH'].includes(parsed.severity)
        ? parsed.severity
        : determineSeverity(statusCode),
      suggestedFix: parsed.suggestedFix || 'Check server logs and connectivity',
    }
  } catch (error) {
    console.error('Gemini API call failed:', error)
    throw error
  }
}

/**
 * Fallback analysis when AI is unavailable
 */
function getFallbackAnalysis(
  url: string,
  statusCode?: number | null,
  responseTime?: number | null,
  errorMessage?: string
): IncidentAnalysis {
  let explanation = 'Website is unreachable'
  let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'HIGH'
  let suggestedFix = 'Check server status and connectivity'

  if (statusCode) {
    if (statusCode === 503) {
      explanation = 'Service temporarily unavailable (503). Check server status.'
      severity = 'MEDIUM'
      suggestedFix = 'Wait a few minutes or check for maintenance notifications.'
    } else if (statusCode >= 500) {
      explanation = `Server error (${statusCode}). Check application logs.`
      severity = 'HIGH'
      suggestedFix = 'Review server logs for error details.'
    } else if (statusCode >= 400) {
      explanation = `Client error (${statusCode}). Check request configuration.`
      severity = 'MEDIUM'
      suggestedFix = 'Verify URL and request parameters are correct.'
    }
  }

  if (responseTime && responseTime > 5000) {
    severity = 'MEDIUM'
    explanation = `Slow response (${responseTime}ms). Possible performance issue.`
    suggestedFix = 'Investigate server performance and database queries.'
  }

  if (errorMessage?.includes('timeout')) {
    explanation = 'Request timeout. Server not responding.'
    severity = 'HIGH'
    suggestedFix = 'Verify server is running and accessible.'
  }

  return { explanation, severity, suggestedFix }
}

/**
 * Determine severity based on HTTP status code
 */
function determineSeverity(statusCode?: number | null): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (!statusCode) return 'HIGH'
  if (statusCode >= 500) return 'HIGH'
  if (statusCode >= 400) return 'MEDIUM'
  return 'LOW'
}

export default genAI
