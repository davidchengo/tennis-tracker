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
  const isLogin = mode === 'login'

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

  if (isLogin) {
    return (
      <section className="mx-auto w-full max-w-[430px] rounded-2xl border border-[#303743] bg-[#171c23] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:p-[22px]" aria-labelledby="login-title">
        <p className="mb-2 text-xs font-extrabold tracking-[0.11em] text-[#64d26d]">SECURE PLAYER ACCESS</p>
        <h1 id="login-title" className="text-[3.15rem] font-extrabold leading-[1.02] tracking-[-0.045em] text-[#f1f3f8] sm:text-[3.35rem]">
          Player<br />Progress
        </h1>
        <p className="mt-2.5 max-w-[355px] text-[16px] font-medium leading-[1.28] text-[#aeb7c9]">
          Sign in with the email authorized by your coach. A shared report link never grants access by itself.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <label className="block text-sm font-bold text-[#d9dee8]" htmlFor="email">
            Authorized email
            <input
              id="email"
              name="email"
              type="email"
              value={values.email ?? ''}
              onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))}
              autoComplete="email"
              required
              className="mt-1 block w-full rounded-[10px] border border-[#353c47] bg-[#13181f] px-3 py-2.5 text-base text-[#eef1f7] outline-none transition focus:border-[#58c968] focus:ring-1 focus:ring-[#58c968]"
            />
          </label>

          <label className="block text-sm font-bold text-[#d9dee8]" htmlFor="password">
            Password
            <input
              id="password"
              name="password"
              type="password"
              value={values.password ?? ''}
              onChange={(e) => setValues((prev) => ({ ...prev, password: e.target.value }))}
              autoComplete="current-password"
              required
              className="mt-1 block w-full rounded-[10px] border border-[#353c47] bg-[#13181f] px-3 py-2.5 text-base text-[#eef1f7] outline-none transition focus:border-[#58c968] focus:ring-1 focus:ring-[#58c968]"
            />
          </label>

          {(error || validationError) && (
            <div className="rounded-lg border border-red-400/40 bg-red-500/10 p-3" role="alert">
              <p className="text-sm text-red-200">{error || validationError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex min-h-10 items-center justify-center rounded-[9px] bg-[#55c75d] px-4 py-2.5 text-base font-extrabold text-[#09100b] transition hover:bg-[#67d36f] focus:outline-none focus:ring-2 focus:ring-[#76dc7d] focus:ring-offset-2 focus:ring-offset-[#171c23] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Signing in…' : 'Sign in with email'}
          </button>
        </form>

        <p className="mt-4 max-w-[355px] text-sm font-medium leading-[1.25] text-[#aeb7c9]">
          Training-report emails contain only a report link—never an authentication link.
        </p>
      </section>
    )
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
                ? 'new-password'
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
