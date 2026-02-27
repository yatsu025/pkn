'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'

export default function QuizLoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError('')

    try {
      // Check if email exists in registrations
      const { data, error: fetchError } = await supabase
        .from('registrations')
        .select('email, name')
        .eq('email', email.trim())
        .single()

      if (fetchError || !data) {
        setError('This email is not registered. Please register first to participate.')
        return
      }

      // Store user info in session storage for the quiz
      sessionStorage.setItem('quiz_user_email', data.email)
      sessionStorage.setItem('quiz_user_name', data.name)
      
      router.push('/quiz/play')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <Link href="/" className="text-primary hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Quiz Portal</h1>
        </div>

        <Card className="border border-border shadow-xl">
          <CardHeader>
            <CardTitle>Verify Registration</CardTitle>
            <CardDescription>Enter the email you used during registration to access the quiz.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Access Quiz'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
