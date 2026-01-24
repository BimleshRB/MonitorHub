import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

let genAI: GoogleGenerativeAI | null = null
let model: any = null

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
}

export async function generateIncidentExplanation(params: {
  url: string
  statusCode: number | null
  responseTime: number | null
  status: 'DOWN' | 'UP'
}) {
  const { url, statusCode, responseTime, status } = params

  if (!model) {
    console.warn('Gemini API not configured, using fallback explanation')
    return `Website ${url} is currently ${status}. Status code: ${statusCode ?? 'N/A'}. Response time: ${responseTime ?? 'N/A'} ms.`
  }

  try {
    const prompt = `You are an SRE assistant. Give concise, actionable incident explanations for website uptime checks. Limit to 2-3 sentences.

Website: ${url}
Status: ${status}
Status Code: ${statusCode ?? 'N/A'}
Response Time: ${responseTime ?? 'N/A'} ms

Explain the likely cause and suggest remediation.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    return text?.trim() || null
  } catch (error) {
    console.error('Gemini AI error', error)
    return `Website ${url} is ${status}. Status: ${statusCode ?? 'N/A'}, Response time: ${responseTime ?? 'N/A'} ms.`
  }
}

export default genAI
