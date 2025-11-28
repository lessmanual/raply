/**
 * AI Types - Unified interface for OpenAI and Claude API
 */

/**
 * Supported AI providers
 */
export type AIProvider = 'openai' | 'claude'

/**
 * AI model names
 */
export type OpenAIModel =
  | 'gpt-5'              // Latest model (primary)
  | 'gpt-4o'             // GPT-4 Optimized
  | 'gpt-4o-mini'        // GPT-4 Mini
  | 'gpt-4-turbo'        // GPT-4 Turbo
  | 'gpt-4'              // GPT-4
  | 'gpt-3.5-turbo'      // GPT-3.5

export type ClaudeModel =
  | 'claude-haiku-4-5'              // Latest Haiku model (fast & cheap)
  | 'claude-4.5-haiku'              // Latest Haiku model (fast & cheap)
  | 'claude-3-5-sonnet-20241022'    // Latest Sonnet (balanced)
  | 'claude-3-opus-20240229'        // Opus (most capable)
  | 'claude-3-sonnet-20240229'      // Sonnet (balanced)
  | 'claude-3-haiku-20240307'       // Haiku (fast)

export type AIModel = OpenAIModel | ClaudeModel

/**
 * AI message structure (unified format)
 */
export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * AI completion request
 */
export interface AICompletionRequest {
  messages: AIMessage[]
  temperature?: number
  maxTokens?: number
  model?: AIModel
}

/**
 * AI completion response (unified format)
 */
export interface AICompletionResponse {
  content: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  finishReason: 'stop' | 'length' | 'content_filter' | 'tool_calls' | null
}

/**
 * AI error
 */
export interface AIError {
  provider: AIProvider
  error: string
  code?: string
  status?: number
}

/**
 * AI client configuration
 */
export interface AIClientConfig {
  provider: AIProvider
  apiKey: string
  model?: AIModel
  defaultTemperature?: number
  defaultMaxTokens?: number
}
