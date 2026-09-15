'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthForm } from '@/components/auth/AuthForm'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(data: Record<string, string>) {
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#101217] text-[#eef1f7]">
      <header className="flex h-[60px] items-center justify-between border-b border-[#252a33] px-5 sm:px-7">
        <Link href="https://rallyschoolonline.com" className="inline-flex items-center gap-1.5 text-[17px] font-extrabold tracking-tight text-[#5ad05f]">
          <span aria-hidden="true">🎾</span>
          <span>Rally School</span>
        </Link>
        <Link
          href="https://rallyschoolonline.com"
          className="rounded-[10px] border border-[#2b3039] px-3 py-2 text-sm font-semibold text-[#aeb7c9] transition-colors hover:border-[#4b5666] hover:text-white"
        >
          ← Home
        </Link>
      </header>

      <main className="relative flex min-h-[calc(100vh-60px)] items-center justify-center px-4 py-14 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_16%_0%,rgba(48,118,67,0.16),transparent_31%)]">
        <div className="relative w-full">
          <AuthForm
            mode="login"
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
    </div>
  )
}
