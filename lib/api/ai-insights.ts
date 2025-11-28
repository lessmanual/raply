/**
 * AI Insights Generator
 *
 * Generates AI-powered descriptions and recommendations for advertising campaigns
 * using GPT-5 (or Claude as fallback).
 */

import { createAICompletion } from './ai-client'
import type { AggregatedCampaignData } from './campaign-data'

export interface AIInsights {
  description: string
  recommendations: string[]
}

/**
 * Generate AI insights for campaign data
 *
 * @param campaignData - Aggregated campaign metrics
 * @param templateType - Report template (leads/sales/reach)
 * @returns AI-generated description and recommendations
 */
export async function generateAIInsights(
  campaignData: AggregatedCampaignData,
  templateType: 'leads' | 'sales' | 'reach'
): Promise<AIInsights> {
  const systemPrompt = getSystemPrompt(templateType)
  const userPrompt = generateUserPrompt(campaignData, templateType)

  try {
    const response = await createAICompletion({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Parse AI response to extract description and recommendations
    const insights = parseAIResponse(response.content)

    return insights
  } catch (error) {
    console.error('Error generating AI insights:', error)
    throw new Error(
      `Failed to generate AI insights: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { cause: error }
    )
  }
}

/**
 * Get system prompt based on template type
 */
function getSystemPrompt(templateType: 'leads' | 'sales' | 'reach'): string {
  const basePrompt = `Jesteś ekspertem od analityki reklamowej i optymalizacji kampanii.
Specjalizujesz się w analizie danych kampanii reklamowych i generowaniu praktycznych rekomendacji.`

  const templateSpecific = {
    leads: `Skupiasz się na kampaniach lead generation - analizujesz CPL (Cost Per Lead), conversion rate, jakość leadów i efektywność formularzy.`,
    sales: `Skupiasz się na kampaniach sprzedażowych - analizujesz ROAS, wartość konwersji, koszt akwizycji klienta i ścieżki zakupowe.`,
    reach: `Skupiasz się na kampaniach zasięgowych - analizujesz reach, frequency, brand awareness, engagement i efektywność budowania świadomości marki.`,
  }

  return `${basePrompt}\n\n${templateSpecific[templateType]}\n\nTwoim zadaniem jest:\n1. Przeanalizować dane kampanii reklamowych\n2. Opisać najważniejsze wyniki i trendy (2-3 zdania)\n3. Zaproponować 3-5 konkretnych, działających rekomendacji optymalizacyjnych\n\nOdpowiadaj w języku polskim, profesjonalnie ale przystępnie.`
}

/**
 * Generate user prompt with campaign data
 */
function generateUserPrompt(
  data: AggregatedCampaignData,
  templateType: 'leads' | 'sales' | 'reach'
): string {
  const { platform, account_name, currency, date_from, date_to, campaigns, totals } =
    data

  const platformName = platform === 'meta' ? 'Meta Ads' : 'Google Ads'
  const daysCount = Math.ceil(
    (new Date(date_to).getTime() - new Date(date_from).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  let prompt = `Przeanalizuj dane kampanii reklamowych z ${platformName}:\n\n`
  prompt += `**Konto:** ${account_name}\n`
  prompt += `**Okres:** ${date_from} - ${date_to} (${daysCount} dni)\n`
  prompt += `**Liczba kampanii:** ${campaigns.length}\n\n`

  prompt += `**Podsumowanie wyników:**\n`
  prompt += `- Wydatki: ${totals.spend.toFixed(2)} ${currency}\n`
  prompt += `- Wyświetlenia: ${totals.impressions.toLocaleString()}\n`
  prompt += `- Kliknięcia: ${totals.clicks.toLocaleString()}\n`
  prompt += `- CTR: ${totals.ctr.toFixed(2)}%\n`
  prompt += `- CPC: ${totals.cpc.toFixed(2)} ${currency}\n`
  prompt += `- CPM: ${totals.cpm.toFixed(2)} ${currency}\n`
  prompt += `- Konwersje: ${totals.conversions}\n`

  if (templateType === 'reach' && totals.reach) {
    prompt += `- Zasięg: ${totals.reach.toLocaleString()}\n`
  }

  if (templateType === 'sales') {
    if (totals.roas) {
      prompt += `- ROAS: ${totals.roas.toFixed(2)}\n`
    }
    if (totals.conversion_value) {
      prompt += `- Wartość konwersji: ${totals.conversion_value.toFixed(2)} ${currency}\n`
    }
  }

  if (templateType === 'leads') {
    const costPerLead = totals.conversions > 0 ? totals.spend / totals.conversions : 0
    prompt += `- Koszt za lead (CPL): ${costPerLead.toFixed(2)} ${currency}\n`
  }

  // Add top performing campaigns
  const sortedCampaigns = [...campaigns].sort((a, b) => b.spend - a.spend).slice(0, 3)

  if (sortedCampaigns.length > 0) {
    prompt += `\n**Top kampanie (wg budżetu):**\n`
    sortedCampaigns.forEach((campaign, index) => {
      prompt += `${index + 1}. ${campaign.campaign_name}\n`
      prompt += `   - Budżet: ${campaign.spend.toFixed(2)} ${currency}\n`
      prompt += `   - Konwersje: ${campaign.conversions}\n`
      prompt += `   - CTR: ${campaign.ctr.toFixed(2)}%\n`
    })
  }

  prompt += `\n\nNa podstawie tych danych:\n`
  prompt += `1. Napisz zwięzły opis wyników kampanii (2-3 zdania)\n`
  prompt += `2. Zaproponuj 3-5 konkretnych rekomendacji optymalizacyjnych\n\n`
  prompt += `Format odpowiedzi:\n`
  prompt += `OPIS:\n[Twój opis]\n\n`
  prompt += `REKOMENDACJE:\n`
  prompt += `1. [Pierwsza rekomendacja]\n`
  prompt += `2. [Druga rekomendacja]\n`
  prompt += `3. [Trzecia rekomendacja]\n`

  return prompt
}

/**
 * Parse AI response to extract description and recommendations
 */
function parseAIResponse(content: string): AIInsights {
  const lines = content.split('\n').map((line) => line.trim())

  let description = ''
  const recommendations: string[] = []

  let currentSection: 'description' | 'recommendations' | null = null

  for (const line of lines) {
    if (line.toUpperCase().includes('OPIS:')) {
      currentSection = 'description'
      continue
    }

    if (line.toUpperCase().includes('REKOMENDACJE:')) {
      currentSection = 'recommendations'
      continue
    }

    if (!line || line.length === 0) continue

    if (currentSection === 'description') {
      description += line + ' '
    } else if (currentSection === 'recommendations') {
      // Remove numbering and extract recommendation
      const cleaned = line.replace(/^\d+[\.\)\-]\s*/, '').trim()
      if (cleaned.length > 0) {
        recommendations.push(cleaned)
      }
    }
  }

  // Fallback if parsing fails
  if (!description) {
    description = content.substring(0, 500)
  }

  if (recommendations.length === 0) {
    // Try to extract bullet points or numbered items
    const bulletRegex = /[-•]\s*(.+)/g
    const numberRegex = /\d+[\.\)]\s*(.+)/g

    let match
    while ((match = bulletRegex.exec(content)) !== null) {
      recommendations.push(match[1].trim())
    }

    if (recommendations.length === 0) {
      while ((match = numberRegex.exec(content)) !== null) {
        recommendations.push(match[1].trim())
      }
    }
  }

  return {
    description: description.trim(),
    recommendations: recommendations.slice(0, 5), // Max 5 recommendations
  }
}
