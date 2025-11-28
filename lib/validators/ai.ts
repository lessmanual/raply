/**
 * AI Validators - Zod schemas for AI configuration
 */

import { z } from 'zod'

/**
 * AI Provider validation
 */
export const aiProviderSchema = z.enum(['openai', 'claude'])

/**
 * OpenAI Model validation
 */
export const openAIModelSchema = z.enum([
  'gpt-5',              // Latest model (primary)
  'gpt-4o',             // GPT-4 Optimized
  'gpt-4o-mini',        // GPT-4 Mini
  'gpt-4-turbo',        // GPT-4 Turbo
  'gpt-4',              // GPT-4
  'gpt-3.5-turbo',      // GPT-3.5
])

/**
 * Claude Model validation
 */
export const claudeModelSchema = z.enum([
  'claude-4.5-haiku',              // Latest Haiku model (fast & cheap)
  'claude-3-5-sonnet-20241022',    // Latest Sonnet (balanced)
  'claude-3-opus-20240229',        // Opus (most capable)
  'claude-3-sonnet-20240229',      // Sonnet (balanced)
  'claude-3-haiku-20240307',       // Haiku (fast)
])

/**
 * AI configuration environment variables schema
 */
export const aiConfigSchema = z
  .object({
    AI_PROVIDER: aiProviderSchema,
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_MODEL: openAIModelSchema.optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    CLAUDE_MODEL: claudeModelSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.AI_PROVIDER === 'openai') {
        return !!data.OPENAI_API_KEY
      }
      return true
    },
    {
      message: 'OPENAI_API_KEY is required when AI_PROVIDER is "openai"',
      path: ['OPENAI_API_KEY'],
    }
  )
  .refine(
    (data) => {
      if (data.AI_PROVIDER === 'claude') {
        return !!data.ANTHROPIC_API_KEY
      }
      return true
    },
    {
      message: 'ANTHROPIC_API_KEY is required when AI_PROVIDER is "claude"',
      path: ['ANTHROPIC_API_KEY'],
    }
  )

/**
 * AI message schema
 */
export const aiMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1, 'Message content cannot be empty'),
})

/**
 * AI completion request schema
 */
export const aiCompletionRequestSchema = z.object({
  messages: z.array(aiMessageSchema).min(1, 'At least one message is required'),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
  model: z.string().optional(),
})

export type AIProvider = z.infer<typeof aiProviderSchema>
export type OpenAIModel = z.infer<typeof openAIModelSchema>
export type ClaudeModel = z.infer<typeof claudeModelSchema>
export type AIMessage = z.infer<typeof aiMessageSchema>
export type AICompletionRequest = z.infer<typeof aiCompletionRequestSchema>
