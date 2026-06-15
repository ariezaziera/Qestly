'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [userName, setUserName] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setServerError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
        data: { full_name: data.full_name },
        },
    })

    if (error) {
        setServerError(error.message)
        return
    }

    // Send welcome email via Resend
    await fetch('/api/auth/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, name: data.full_name }),
    })

    // Sign out so user manually logs in
    await supabase.auth.signOut()

    setUserName(data.full_name)
    setSuccess(true)
    }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-3">Account created! 🎯</h2>
        <p className="text-muted text-sm leading-relaxed max-w-xs mx-auto">
          Welcome to JobRadar{userName ? `, ${userName}` : ''}. A welcome email is on its way. You can sign in now.
        </p>
        <Link
          href="/login"
          className="inline-block mt-8 px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]"
        >
          Sign in →
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create your account</h1>
        <p className="text-muted text-sm">Start tracking your job search today. Free forever.</p>
      </div>

      <div className="space-y-4">
        <Input
          id="full_name"
          label="Full name"
          placeholder="Arieza Aziera"
          {...register('full_name')}
          error={errors.full_name?.message}
        />
        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="Min. 8 characters"
          {...register('password')}
          error={errors.password?.message}
        />
        <Input
          id="confirm"
          type="password"
          label="Confirm password"
          placeholder="••••••••"
          {...register('confirm')}
          error={errors.confirm?.message}
        />

        {serverError && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {serverError}
          </div>
        )}

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="w-full py-3.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </div>

      <p className="text-center text-sm text-muted mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}