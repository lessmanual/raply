/**
 * AI Test Endpoint
 *
 * Simple endpoint to test AI client functionality.
 * Returns current provider and model, and generates a test completion.
 *
 * GET /api/ai/test
 */

import { NextResponse } from 'next/server'
import {
  createAICompletion,
  getCurrentAIProvider,
  getCurrentAIModel,
} from '@/lib/api/ai-client'

export async function GET() {
  // Security: Disable test endpoint in production to prevent unauthorized API usage
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoint not available in production' },
      { status: 403 }
    )
  }

  try {
    const provider = getCurrentAIProvider()
    const model = getCurrentAIModel()

    // Test completion
    const response = await createAICompletion({
      messages: [
        {
          role: 'user',
          content: 'Write a short test message confirming the AI client is working.',
        },
      ],
      temperature: 0.7,
      maxTokens: 1500,
    })

    return NextResponse.json({
      success: true,
      provider,
      model,
      test: {
        response: response.content,
        usage: response.usage,
        finishReason: response.finishReason,
      },
    })
  } catch (error: any) {
    console.error('AI test error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.error || error.message || 'AI client test failed',
        provider: error.provider || 'unknown',
        code: error.code,
        status: error.status,
      },
      { status: 500 }
    )
  }
}
