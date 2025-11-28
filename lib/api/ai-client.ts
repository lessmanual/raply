/**
 * AI Client - Unified interface for OpenAI and Claude API
 *
 * This module provides a unified interface for working with both OpenAI and Claude APIs.
 * It automatically selects the provider based on environment variables and transforms
 * responses to a consistent format.
 *
 * Configuration via .env.local:
 * - AI_PROVIDER=openai or AI_PROVIDER=claude
 * - OPENAI_API_KEY (if using OpenAI)
 * - OPENAI_MODEL (optional, defaults to gpt-5)
 * - ANTHROPIC_API_KEY (if using Claude)
 * - CLAUDE_MODEL (optional, defaults to claude-4.5-haiku)
 *
 * Primary models:
 * - OpenAI: gpt-5 (latest, cost-efficient)
 * - Claude: claude-4.5-haiku (latest haiku, fast & cheap)
 */

import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { aiConfigSchema } from '@/lib/validators/ai'
import type {
  AICompletionRequest,
  AICompletionResponse,
  AIProvider,
  AIClientConfig,
  AIError,
} from '@/lib/types/ai'

/**
 * Get AI configuration from environment variables
 */
function getAIConfig(): AIClientConfig {
  const env = {
    AI_PROVIDER: process.env.AI_PROVIDER,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    CLAUDE_MODEL: process.env.CLAUDE_MODEL,
  }

  // Validate configuration
  const validated = aiConfigSchema.parse(env)

  const provider = validated.AI_PROVIDER as AIProvider

  if (provider === 'openai') {
    return {
      provider: 'openai',
      apiKey: validated.OPENAI_API_KEY!,
      model: validated.OPENAI_MODEL || 'gpt-5',
      defaultTemperature: 0.7,
      defaultMaxTokens: 2000,
    }
  } else {
    return {
      provider: 'claude',
      apiKey: validated.ANTHROPIC_API_KEY!,
      model: validated.CLAUDE_MODEL || 'claude-4.5-haiku',
      defaultTemperature: 0.7,
      defaultMaxTokens: 2000,
    }
  }
}

/**
 * Create OpenAI completion
 */
async function createOpenAICompletion(
  request: AICompletionRequest,
  config: AIClientConfig
): Promise<AICompletionResponse> {
  try {
    const openai = new OpenAI({
      apiKey: config.apiKey,
    })

    const modelName = request.model || config.model || 'gpt-5'
    const maxTokensValue = request.maxTokens ?? config.defaultMaxTokens ?? 2000

    // GPT-5 and newer models use max_completion_tokens instead of max_tokens
    const isGPT5 = modelName === 'gpt-5' || modelName.startsWith('gpt-5-')
    const maxTokensParam = isGPT5
      ? { max_completion_tokens: maxTokensValue }
      : { max_tokens: maxTokensValue }

    // GPT-5 only supports temperature=1 (default), so omit temperature parameter for GPT-5
    const temperatureParam = isGPT5
      ? {}
      : { temperature: request.temperature ?? config.defaultTemperature ?? 0.7 }

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: request.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      ...temperatureParam,
      ...maxTokensParam,
    })

    const choice = response.choices[0]
    if (!choice || !choice.message) {
      throw new Error('No completion returned from OpenAI')
    }

    return {
      content: choice.message.content || '',
      model: response.model,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      finishReason: choice.finish_reason as AICompletionResponse['finishReason'],
    }
  } catch (error: any) {
    const aiError: AIError = {
      provider: 'openai',
      error: error.message || 'OpenAI API error',
      code: error.code,
      status: error.status,
    }
    throw aiError
  }
}

/**
 * Create Claude completion
 */
async function createClaudeCompletion(
  request: AICompletionRequest,
  config: AIClientConfig
): Promise<AICompletionResponse> {
  try {
    const anthropic = new Anthropic({
      apiKey: config.apiKey,
    })

    // Separate system message from other messages
    const systemMessage = request.messages.find((msg) => msg.role === 'system')
    const conversationMessages = request.messages.filter((msg) => msg.role !== 'system')

    const response = await anthropic.messages.create({
      model: request.model || config.model || 'claude-4.5-haiku',
      max_tokens: request.maxTokens ?? config.defaultMaxTokens ?? 2000,
      temperature: request.temperature ?? config.defaultTemperature ?? 0.7,
      system: systemMessage?.content,
      messages: conversationMessages.map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })),
    })

    const content = response.content[0]
    if (!content || content.type !== 'text') {
      throw new Error('No text content returned from Claude')
    }

    return {
      content: content.text,
      model: response.model,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      finishReason: response.stop_reason as AICompletionResponse['finishReason'],
    }
  } catch (error: any) {
    const aiError: AIError = {
      provider: 'claude',
      error: error.message || 'Claude API error',
      code: error.error?.type,
      status: error.status,
    }
    throw aiError
  }
}

/**
 * Create AI completion with unified interface
 *
 * Automatically uses the provider configured in environment variables.
 * Returns a unified response format regardless of provider.
 *
 * @param request - Completion request with messages and options
 * @returns Promise<AICompletionResponse> - Unified completion response
 * @throws AIError - If API call fails
 *
 * @example
 * ```ts
 * const response = await createAICompletion({
 *   messages: [
 *     { role: 'system', content: 'You are a helpful assistant.' },
 *     { role: 'user', content: 'Analyze this ad campaign data...' }
 *   ],
 *   temperature: 0.7,
 *   maxTokens: 1000
 * })
 *
 * console.log(response.content) // AI-generated insights
 * console.log(response.usage.totalTokens) // Token usage
 * ```
 */
export async function createAICompletion(
  request: AICompletionRequest
): Promise<AICompletionResponse> {
  const config = getAIConfig()

  if (config.provider === 'openai') {
    return createOpenAICompletion(request, config)
  } else {
    return createClaudeCompletion(request, config)
  }
}

/**
 * Get current AI provider
 *
 * Useful for debugging or displaying which AI service is active.
 *
 * @returns AIProvider - Current provider ('openai' or 'claude')
 */
export function getCurrentAIProvider(): AIProvider {
  const config = getAIConfig()
  return config.provider
}

/**
 * Get current AI model
 *
 * Returns the model name currently configured.
 *
 * @returns string - Model name (e.g., 'gpt-4-turbo', 'claude-3-5-sonnet-20241022')
 */
export function getCurrentAIModel(): string {
  const config = getAIConfig()
  return config.model || 'unknown'
}
