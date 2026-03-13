'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password'

interface AuthFormProps {
  mode: AuthMode
  onSubmit: (data: Record<string, string>) => Promise<void>
  isLoading?: boolean
  error?: string
  success?: string
  token?: string   // for reset-password mode
}

const config: Record<
  AuthMode,
  { title: string; subtitle: string; submitLabel: string; fields: Array<{ name: string; label: string; type: string; placeholder?: string }> }
> = {
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in to track your tennis progress',
    submitLabel: 'Sign in',
    fields: [
      { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
      { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
    ],
  },
  register: {
    title: 'Create your account',
    subtitle: 'Start tracking your tennis journey today',
    submitLabel: 'Create account',
    fields: [
      { name: 'name', label: 'Full name', type: 'text', placeholder: 'Alex Johnson' },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
      { name: 'password', label: 'Password', type: 'password', placeholder: 'Min. 8 chars, 1 uppercase, 1 number' },
    ],
  },
  'forgot-password': {
    title: 'Reset your password',
    subtitle: "Enter your email and we'll send a reset link",
    submitLabel: 'Send reset link',
    fields: [
      { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
    ],
  },
  'reset-password': {
    title: 'Set new password',
    subtitle: 'Enter your new password below',
    submitLabel: 'Update password',
    fields: [
      { name: 'password', label: 'New password', type: 'password', placeholder: 'Min. 8 chars, 1 uppercase, 1 number' },
      { name: 'confirmPassword', label: 'Confirm password', type: 'password', placeholder: '••••••••' },
    ],
  },
}

export function AuthForm({ mode, onSubmit, isLoading, error, success, token }: AuthFormProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [validationError, setValidationError] = useState('')
  const { title, subtitle, submitLabel, fields } = config[mode]

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setValidationError('')

    // Client-side confirm password check
    if (mode === 'reset-password' && values.password !== values.confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }

    const data = { ...values }
    if (token) data.token = token
    await onSubmit(data)
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-green-600 rounded-2xl mb-4 shadow-lg">
          <span className="text-2xl">🎾</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <Input
            key={field.name}
            label={field.label}
            type={field.type}
            placeholder={field.placeholder}
            value={values[field.name] ?? ''}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
            }
            required
            autoComplete={
              field.name === 'password'
                ? mode === 'login'
                  ? 'current-password'
                  : 'new-password'
                : field.name === 'email'
                ? 'email'
                : 'name'
            }
          />
        ))}

        {(error || validationError) && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700">{error || validationError}</p>
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
          {submitLabel}
        </Button>
      </form>

      {/* Footer links */}
      <div className="mt-6 text-center space-y-2">
        {mode === 'login' && (
          <>
            <p className="text-sm text-gray-500">
              <Link href="/forgot-password" className="text-green-600 hover:underline">
                Forgot your password?
              </Link>
            </p>
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link href="/register" className="text-green-600 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </>
        )}
        {mode === 'register' && (
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-green-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        )}
        {(mode === 'forgot-password' || mode === 'reset-password') && (
          <p className="text-sm text-gray-500">
            <Link href="/login" className="text-green-600 hover:underline">
              Back to sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
