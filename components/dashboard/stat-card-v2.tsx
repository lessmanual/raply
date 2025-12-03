'use client'

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

interface SparklineDataPoint {
  value: number
}

interface StatCardV2Props {
  title: string
  value: number
  description: string
  icon: LucideIcon
  gradient: string
  change?: number | null
  sparklineData?: SparklineDataPoint[]
}

export function StatCardV2({
  title,
  value,
  description,
  icon: Icon,
  gradient,
  change = null,
  sparklineData = [],
}: StatCardV2Props) {
  const isPositive = change !== null && change > 0
  const hasChange = change !== null && change !== 0

  return (
    <div
      className={cn(
        'glass rounded-3xl p-6 border border-glass-border',
        'transition-all duration-300 hover:scale-105',
        'group relative overflow-hidden',
        'hover:shadow-xl hover:shadow-primary/20'
      )}
    >
      {/* Gradient overlay for better contrast */}
      <div
        className="absolute inset-0 rounded-3xl opacity-90"
        style={{ background: gradient }}
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/20 rounded-3xl" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header: Icon and Change Badge */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={cn(
              'p-3 rounded-2xl bg-white/20 backdrop-blur-sm',
              'border border-white/30 shadow-lg',
              'group-hover:scale-110 transition-transform duration-300'
            )}
          >
            <Icon className="w-6 h-6 text-white drop-shadow-sm" />
          </div>

          {hasChange && change !== null && (
            <div
              className={cn(
                'flex items-center space-x-1 px-3 py-1.5 rounded-full',
                'text-xs font-medium backdrop-blur-sm border shadow-sm',
                isPositive
                  ? 'bg-green-100/90 text-green-800 border-green-200/50'
                  : 'bg-red-100/90 text-red-800 border-red-200/50'
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-2 mb-4">
          <h3 className="text-white text-sm font-medium drop-shadow-sm">
            {title}
          </h3>
          <p className="text-white text-3xl font-bold drop-shadow-md">
            {value.toLocaleString()}
          </p>
          <p className="text-white/80 text-xs drop-shadow-sm">
            {description}
          </p>
        </div>

        {/* Sparkline Chart */}
        {sparklineData.length > 0 && (
          <div className="mt-4 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="rgba(255, 255, 255, 0.9)"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Glow effect on hover */}
      <div
        className={cn(
          'absolute inset-0 rounded-3xl opacity-0',
          'group-hover:opacity-100 transition-opacity duration-300',
          'pointer-events-none'
        )}
        style={{
          boxShadow: `0 0 30px ${gradient.match(/#[0-9a-fA-F]{6}/)?.[0] || '#3b82f6'}40`,
        }}
      />
    </div>
  )
}
