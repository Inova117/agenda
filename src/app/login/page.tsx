'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const router = useRouter()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password })
                if (error) throw error
                setMessage('Check your email for the confirmation link!')
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
                router.push('/')
                router.refresh()
            }
        } catch (error: any) {
            setMessage(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="flex h-screen w-full items-center justify-center p-6"
            style={{ background: 'var(--cream)' }}
        >
            {/* Subtle warm glow */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(123,137,111,0.08) 0%, transparent 70%)'
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-sm relative z-10"
            >
                {/* Card */}
                <div
                    className="rounded-[24px] px-8 py-10"
                    style={{
                        background: 'var(--paper)',
                        border: '1px solid var(--border)',
                        boxShadow: '0 8px 40px rgba(44,36,22,0.12), 0 2px 8px rgba(44,36,22,0.06)',
                    }}
                >
                    {/* Heading */}
                    <div className="text-center mb-8">
                        <h1
                            className="font-serif text-4xl mb-2"
                            style={{ color: 'var(--ink)' }}
                        >
                            Agenda
                        </h1>
                        <p className="font-sans text-sm" style={{ color: 'var(--ink-muted)' }}>
                            {isSignUp ? 'Create your sanctuary.' : 'Welcome back.'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleAuth} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="email"
                                className="font-sans text-xs uppercase tracking-widest"
                                style={{ color: 'var(--ink-muted)' }}
                            >
                                Email
                            </Label>
                            <input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-transparent px-0 py-2 font-sans text-base transition-colors duration-200 outline-none placeholder:opacity-40 border-b-[1.5px]"
                                style={{
                                    color: 'var(--ink)',
                                    borderColor: 'var(--border)',
                                    caretColor: 'var(--sage)',
                                }}
                                onFocus={e => (e.target.style.borderColor = 'var(--sage)')}
                                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="password"
                                className="font-sans text-xs uppercase tracking-widest"
                                style={{ color: 'var(--ink-muted)' }}>
                                Password
                            </Label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-transparent px-0 py-2 font-sans text-base transition-colors duration-200 outline-none placeholder:opacity-40 border-b-[1.5px]"
                                style={{
                                    color: 'var(--ink)',
                                    borderColor: 'var(--border)',
                                    caretColor: 'var(--sage)',
                                }}
                                onFocus={e => (e.target.style.borderColor = 'var(--sage)')}
                                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                            />
                        </div>

                        {message && (
                            <p
                                className="text-sm text-center font-sans px-3 py-2 rounded-xl"
                                style={{
                                    color: message.includes('Check') ? 'var(--sage)' : 'var(--dusty-rose)',
                                    background: message.includes('Check') ? 'var(--sage-light)' : 'var(--dusty-rose-light)',
                                }}
                            >
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-full font-sans font-semibold text-sm transition-all duration-200 mt-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                            style={{
                                background: 'var(--sage)',
                                color: 'var(--paper)',
                            }}
                        >
                            {loading ? 'One moment…' : (isSignUp ? 'Create Account' : 'Sign In')}
                        </button>
                    </form>

                    {/* Toggle */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="font-sans text-sm transition-colors duration-200 hover:opacity-80"
                            style={{ color: 'var(--ink-muted)' }}
                        >
                            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
