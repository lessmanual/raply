'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  FileText,
  Link as LinkIcon,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { signOut } from '@/lib/auth/actions'

interface DashboardNavProps {
  userEmail: string
  isAdmin: boolean
}

export function DashboardNav({ userEmail, isAdmin }: DashboardNavProps) {
  const pathname = usePathname()
  const t = useTranslations('dashboard.nav')
  const locale = useLocale()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setIsCollapsed(saved === 'true')
    }
  }, [])

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
  }

  const navItems = [
    {
      href: `/${locale}/dashboard`,
      label: t('dashboard'),
      icon: LayoutDashboard,
    },
    {
      href: `/${locale}/reports`,
      label: t('reports'),
      icon: FileText,
    },
    {
      href: `/${locale}/integrations`,
      label: t('integrations'),
      icon: LinkIcon,
    },
    {
      href: `/${locale}/settings`,
      label: t('settings'),
      icon: Settings,
    },
  ]

  // Add admin link for admin users
  if (isAdmin) {
    navItems.push({
      href: `/${locale}/admin`,
      label: t('admin'),
      icon: ShieldCheck,
    })
  }

  async function handleSignOut() {
    await signOut()
  }

  return (
    <aside
      className={cn(
        'border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <Link href={`/${locale}`} className="flex items-center">
              <img
                src="/images/raply-logo.svg"
                alt="Raply"
                className="h-8 w-auto"
              />
            </Link>
          )}
          {isCollapsed && (
            <Link href={`/${locale}`} className="flex items-center justify-center w-full">
              <img
                src="/images/raply-logo.svg"
                alt="Raply"
                className="h-8 w-8 object-contain"
              />
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isCollapsed ? 'justify-center' : 'gap-3',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse Toggle Button */}
        <div className="border-t p-4">
          <Button
            onClick={toggleCollapsed}
            variant="ghost"
            size="sm"
            className={cn(
              'w-full justify-center',
              !isCollapsed && 'justify-start'
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="mr-2 h-4 w-4" />
                <span>{t('collapse')}</span>
              </>
            )}
          </Button>
        </div>

        {/* User Section */}
        <div className="border-t p-4">
          {!isCollapsed && (
            <div className="mb-3 flex items-center gap-3 px-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {userEmail?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{userEmail}</p>
                {isAdmin && (
                  <p className="text-xs text-muted-foreground">{t('adminBadge')}</p>
                )}
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="mb-3 flex justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {userEmail?.[0]?.toUpperCase()}
              </div>
            </div>
          )}
          <form action={handleSignOut}>
            <Button
              type="submit"
              variant="ghost"
              className={cn(
                'w-full text-muted-foreground',
                isCollapsed ? 'justify-center px-2' : 'justify-start'
              )}
              size="sm"
              title={isCollapsed ? t('signOut') : undefined}
            >
              <LogOut className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
              {!isCollapsed && t('signOut')}
            </Button>
          </form>
        </div>
      </div>
    </aside>
  )
}
