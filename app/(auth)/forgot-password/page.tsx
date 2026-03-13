'use client'

import { useState } from 'react'
import { AuthForm } from '@/components/auth/AuthForm'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(data: Record<string, string>) {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Something went wrong')
      } else {
        setSuccess(json.message)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AuthForm
        mode="forgot-password"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        success={success}
      />
    </div>
  )
}
