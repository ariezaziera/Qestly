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
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setServerError('Incorrect email or password.')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
        <p className="text-muted text-sm">Sign in to continue tracking your applications.</p>
      </div>

      <div className="space-y-4">
        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          {...register('email')}
          error={errors.email?.message}
        />

        <div className="space-y-1.5">
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />
          <div className="text-right">
            <Link href="#" className="text-xs text-muted hover:text-primary transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>

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
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </div>

      <p className="text-center text-sm text-muted mt-6">
        No account yet?{' '}
        <Link href="/auth/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
          Create one free
        </Link>
      </p>
    </div>
  )
}