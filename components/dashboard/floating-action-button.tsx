'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingActionButtonProps {
  href: string
  label?: string
}

export function FloatingActionButton({ href, label = 'Create Report' }: FloatingActionButtonProps) {
  const pathname = usePathname()

  // Hide on /reports/new page (where wizard is active)
  // Use endsWith to avoid false positives (e.g., /reports/news, /reports/newest)
  if (pathname.endsWith('/reports/new') || pathname.includes('/reports/new/')) {
    return null
  }

  return (
    <Link href={href}>
      <button
        className={cn(
          'fixed bottom-8 right-8 z-40',
          'flex items-center gap-2 px-6 py-4 rounded-full',
          'bg-primary text-primary-foreground',
          'shadow-2xl shadow-primary/30',
          'hover:scale-110 hover:shadow-3xl hover:shadow-primary/40',
          'active:scale-95',
          'transition-all duration-300',
          'group'
        )}
        title={label}
      >
        <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
        <span className="font-semibold hidden md:inline">{label}</span>
      </button>
    </Link>
  )
}
