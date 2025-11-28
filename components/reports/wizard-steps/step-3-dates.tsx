'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { dateRangePresets, type DateRange } from '@/lib/validators/report'

interface Step3DatesProps {
  dateRange?: DateRange
  onSelectDateRange: (dateRange: DateRange) => void
}

/**
 * UTC-safe conversion to YYYY-MM-DD format
 * Prevents timezone issues when converting ISO strings to date inputs
 */
function toYYYYMMDD(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Step 3: Date Range Selection
 * Allows selection via presets or custom date inputs
 */
export function Step3Dates({
  dateRange,
  onSelectDateRange,
}: Step3DatesProps) {
  const [customMode, setCustomMode] = useState(false)

  const handlePresetClick = (preset: typeof dateRangePresets[number]) => {
    const range = preset.getValue()
    onSelectDateRange(range)
    setCustomMode(false)
  }

  const handleCustomDateChange = (field: 'from' | 'to', value: string) => {
    if (!value) return

    const date = new Date(value)
    const isoString = date.toISOString()

    if (field === 'from') {
      onSelectDateRange({
        from: isoString,
        to: dateRange?.to || new Date().toISOString(),
      })
    } else {
      onSelectDateRange({
        from: dateRange?.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        to: isoString,
      })
    }
  }

  // Convert ISO strings to YYYY-MM-DD format for input fields (UTC-safe)
  const fromDateValue = dateRange?.from
    ? toYYYYMMDD(new Date(dateRange.from))
    : ''
  const toDateValue = dateRange?.to
    ? toYYYYMMDD(new Date(dateRange.to))
    : ''

  return (
    <div className="space-y-6">
      {/* Preset Buttons */}
      <div>
        <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Quick Presets
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {dateRangePresets.map((preset) => {
            const presetRange = preset.getValue()
            const isSelected =
              dateRange?.from === presetRange.from &&
              dateRange?.to === presetRange.to &&
              !customMode

            return (
              <Button
                key={preset.id}
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  'h-auto py-3 transition-all duration-200',
                  isSelected && 'ring-2 ring-primary'
                )}
              >
                {preset.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-3 text-muted-foreground">or</span>
        </div>
      </div>

      {/* Custom Date Range */}
      <div>
        <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Custom Date Range
        </Label>

        <Card className="glass border-border">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* From Date */}
              <div className="space-y-2">
                <Label htmlFor="from-date" className="text-sm font-medium">
                  Start Date
                </Label>
                <Input
                  id="from-date"
                  type="date"
                  value={fromDateValue}
                  onChange={(e) => {
                    handleCustomDateChange('from', e.target.value)
                    setCustomMode(true)
                  }}
                  max={toDateValue || toYYYYMMDD(new Date())}
                  className="w-full"
                />
              </div>

              {/* To Date */}
              <div className="space-y-2">
                <Label htmlFor="to-date" className="text-sm font-medium">
                  End Date
                </Label>
                <Input
                  id="to-date"
                  type="date"
                  value={toDateValue}
                  onChange={(e) => {
                    handleCustomDateChange('to', e.target.value)
                    setCustomMode(true)
                  }}
                  min={fromDateValue}
                  max={toYYYYMMDD(new Date())}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Range Display */}
      {dateRange && (
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium">Selected Period:</span>
            <span className="text-muted-foreground">
              {new Date(dateRange.from).toLocaleDateString()} →{' '}
              {new Date(dateRange.to).toLocaleDateString()}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              (
              {Math.ceil(
                (new Date(dateRange.to).getTime() -
                  new Date(dateRange.from).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{' '}
              days)
            </span>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="p-4 bg-muted/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Tip:</strong> Choose a time period that best represents the
          performance you want to analyze. Longer periods provide more data but
          may take longer to generate.
        </p>
      </div>
    </div>
  )
}
