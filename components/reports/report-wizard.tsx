'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { AdAccount, CreateReportInput, ReportTemplate } from '@/lib/validators/report'
import { Step1Account } from './wizard-steps/step-1-account'
import { Step2Template } from './wizard-steps/step-2-template'
import { Step3Dates } from './wizard-steps/step-3-dates'
import { Step4Review } from './wizard-steps/step-4-review'

interface ReportWizardProps {
  locale: string
  accounts: AdAccount[]
}

/**
 * Report Creator Wizard - Multi-step form to create advertising reports
 *
 * Flow:
 * 1. Select Ad Account (Meta/Google)
 * 2. Select Template (Leads/Sales/Reach)
 * 3. Select Date Range
 * 4. Review & Generate
 */
export function ReportWizard({ locale, accounts }: ReportWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState<Partial<CreateReportInput>>({
    accountId: undefined,
    templateType: undefined,
    dateRange: undefined,
  })

  const steps = [
    { number: 1, title: 'Account', description: 'Select ad account' },
    { number: 2, title: 'Template', description: 'Choose report type' },
    { number: 3, title: 'Dates', description: 'Set time period' },
    { number: 4, title: 'Review', description: 'Confirm & generate' },
  ]

  const updateFormData = (data: Partial<CreateReportInput>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.accountId
      case 2:
        return !!formData.templateType
      case 3:
        return !!formData.dateRange
      case 4:
        return formData.accountId && formData.templateType && formData.dateRange
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    if (!canProceed()) return

    try {
      setIsSubmitting(true)

      // Show loading toast
      const loadingToast = toast.loading('Generating your report...')

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      // Dismiss loading toast
      toast.dismiss(loadingToast)

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || 'Failed to generate report'

        // User-friendly error messages based on status codes
        if (response.status === 401) {
          toast.error('Session expired', {
            description: 'Please sign in again to continue.',
          })
        } else if (response.status === 403) {
          toast.error('Access denied', {
            description: 'You don\'t have permission to access this ad account.',
          })
        } else if (response.status === 429) {
          toast.error('Too many requests', {
            description: 'Please wait a moment before trying again.',
          })
        } else if (response.status >= 500) {
          toast.error('Server error', {
            description: 'Something went wrong on our end. Please try again in a moment.',
            action: {
              label: 'Retry',
              onClick: () => handleSubmit(),
            },
          })
        } else {
          toast.error('Failed to generate report', {
            description: errorMessage,
            action: {
              label: 'Retry',
              onClick: () => handleSubmit(),
            },
          })
        }

        throw new Error(errorMessage)
      }

      const result = await response.json()

      // Validate response contains reportId
      if (!result.reportId) {
        toast.error('Invalid response', {
          description: 'Report was created but ID is missing. Please check your reports list.',
        })
        throw new Error('Invalid API response: missing reportId')
      }

      // Show success toast
      toast.success('Report generated successfully!', {
        description: 'Redirecting you to your report...',
      })

      // Redirect to report page
      router.push(`/${locale}/reports/${result.reportId}`)
    } catch (error) {
      console.error('Error generating report:', error)
      setIsSubmitting(false)

      // Handle network errors (fetch failures)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Network error', {
          description: 'Please check your internet connection and try again.',
          action: {
            label: 'Retry',
            onClick: () => handleSubmit(),
          },
        })
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Step Navigation */}
      <div className="glass rounded-lg p-6">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => (
              <li
                key={step.number}
                className={cn(
                  'relative flex-1',
                  index !== steps.length - 1 && 'pr-8'
                )}
              >
                <div className="flex items-center">
                  {/* Step Circle */}
                  <div
                    className={cn(
                      'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                      step.number < currentStep
                        ? 'border-primary bg-primary text-primary-foreground'
                        : step.number === currentStep
                        ? 'border-primary bg-background text-primary scale-110'
                        : 'border-muted bg-muted text-muted-foreground'
                    )}
                  >
                    {step.number < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step.number}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="ml-4 flex-1">
                    <p
                      className={cn(
                        'text-sm font-medium transition-colors',
                        step.number <= currentStep
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  {/* Connector Line */}
                  {index !== steps.length - 1 && (
                    <div
                      className={cn(
                        'absolute left-[calc(50%+2.5rem)] top-5 h-0.5 w-full transition-all duration-300',
                        step.number < currentStep
                          ? 'bg-primary'
                          : 'bg-muted'
                      )}
                      aria-hidden="true"
                    />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <Card className="glass-intense border-border/50">
        <CardContent className="p-8">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Select Ad Account</h2>
              <p className="text-muted-foreground mb-6">
                Choose which advertising account to generate the report for
              </p>
              <Step1Account
                accounts={accounts}
                selectedAccountId={formData.accountId}
                onSelectAccount={(accountId) =>
                  updateFormData({ accountId })
                }
              />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Choose Template</h2>
              <p className="text-muted-foreground mb-6">
                Select the type of report you want to create
              </p>
              <Step2Template
                selectedTemplate={formData.templateType}
                onSelectTemplate={(template) =>
                  updateFormData({ templateType: template })
                }
              />
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Select Date Range</h2>
              <p className="text-muted-foreground mb-6">
                Choose the time period for your report
              </p>
              <Step3Dates
                dateRange={formData.dateRange}
                onSelectDateRange={(dateRange) =>
                  updateFormData({ dateRange })
                }
              />
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Review & Generate</h2>
              <p className="text-muted-foreground mb-6">
                Confirm your selections and generate the report
              </p>
              <Step4Review
                account={accounts.find((acc) => acc.id === formData.accountId)}
                template={formData.templateType}
                dateRange={formData.dateRange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={nextStep}
            disabled={!canProceed()}
            className="gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? 'Generating...' : 'Generate Report'}
            {!isSubmitting && <Check className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  )
}
