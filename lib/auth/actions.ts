'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import type { SignInInput, SignUpInput } from '@/lib/validators/auth'

/**
 * Sign in with email and password
 */
export async function signIn(credentials: SignInInput) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      data: data.user,
    }
  } catch (error) {
    console.error('Sign in error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(credentials: SignUpInput) {
  try {
    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    // Use environment variable in production, fallback to origin header
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin || 'http://localhost:3000'

    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        emailRedirectTo: `${baseUrl}/auth/callback`,
        data: {
          full_name: credentials.email.split('@')[0], // Default name from email
        },
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      return {
        success: true,
        requiresEmailConfirmation: true,
        message: 'Please check your email to confirm your account',
      }
    }

    return {
      success: true,
      data: data.user,
    }
  } catch (error) {
    console.error('Sign up error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Sign out
 */
export async function signOut() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Sign out error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string) {
  try {
    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    // Use environment variable in production, fallback to origin header
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin || 'http://localhost:3000'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/auth/reset-password`,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message: 'Password reset email sent. Please check your inbox.',
    }
  } catch (error) {
    console.error('Password reset request error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message: 'Password updated successfully',
    }
  } catch (error) {
    console.error('Password update error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      return {
        user: null,
        error: error.message,
      }
    }

    return {
      user,
      error: null,
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return {
      user: null,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  try {
    const supabase = await createClient()

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      return {
        session: null,
        error: error.message,
      }
    }

    return {
      session,
      error: null,
    }
  } catch (error) {
    console.error('Get current session error:', error)
    return {
      session: null,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Sign in with Google OAuth
 * Returns the OAuth URL for client-side redirect
 */
export async function signInWithGoogle(locale: string) {
  try {
    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    // Use environment variable in production, fallback to origin header
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin || 'http://localhost:3000'

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/api/auth/callback?next=/${locale}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    // Return OAuth URL for client-side redirect
    return {
      success: true,
      url: data.url,
    }
  } catch (error) {
    console.error('Google sign in error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}
