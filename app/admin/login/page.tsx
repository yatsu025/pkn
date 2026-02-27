'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Automatically redirect to dashboard as auth is disabled
    router.push('/admin/dashboard')
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      if (data.user) {
        // Check if user is an admin
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select()
          .eq('user_id', data.user.id)
          .single()

        if (adminError || !adminUser) {
          setError('You do not have admin access')
          // Sign out
          await supabase.auth.signOut()
          return
        }

        // Redirect to dashboard
        router.push('/admin/dashboard')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      if (err.message === 'Failed to fetch') {
        setError('Network error: Could not connect to Supabase. Please check your internet connection or if the Supabase project is active.')
      } else {
        setError(err.message || 'An error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-primary hover:underline inline-block mb-6">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Prayagraj ka Novel - Admin Login</h1>
          <p className="text-muted-foreground">Access the competition dashboard</p>
        </div>

        {/* Login Card */}
        <Card className="border border-border shadow-lg">
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Sign in with your admin credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="bg-background"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-background"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-md font-medium"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs">
                <p className="font-semibold text-blue-900 mb-2">Demo Credentials:</p>
                <p className="text-blue-800"><strong>Email:</strong> admin@prayagraj.com</p>
                <p className="text-blue-800"><strong>Password:</strong> Admin@123</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
