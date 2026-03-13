'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AuthForm } from '@/components/auth/AuthForm'

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useParams()
  const token = params?.token as string

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(data: Record<string, string>) {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Reset failed')
      } else {
        setSuccess(json.message + ' Redirecting to login...')
        setTimeout(() => router.push('/login'), 2000)
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
        mode="reset-password"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        success={success}
        token={token}
      />
    </div>
  )
}
