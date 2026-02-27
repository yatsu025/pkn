'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    address: '',
    phone: '',
    studentType: '',
    upiId: '',
    paymentMethod: 'upi',
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleStudentTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      studentType: value,
    }))
  }

  const handlePaymentMethodChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: value,
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required'
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Valid email is required'
    if (!formData.age || parseInt(formData.age) < 1) return 'Valid age is required'
    if (!formData.address.trim()) return 'Address is required'
    if (!formData.phone.match(/^[0-9]{10}$/)) return 'Phone must be 10 digits'
    if (!formData.studentType) return 'Student type is required'
    if (!formData.upiId.trim()) return 'UPI ID is required'
    if (!formData.paymentMethod) return 'Payment method is required'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const error = validateForm()
    if (error) {
      setMessage({ type: 'error', text: error })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          age: parseInt(formData.age),
          address: formData.address,
          phone: formData.phone,
          studentType: formData.studentType,
          upiId: formData.upiId,
          paymentMethod: formData.paymentMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Registration API error status:', response.status)
        console.error('Registration API error data:', data)
        setMessage({ 
          type: 'error', 
          text: data.error || `Registration failed (Status ${response.status})` 
        })
        return
      }

      setMessage({
        type: 'success',
        text: 'Registration successful! Redirecting...',
      })
      
      // Redirect to success page
      router.push('/register/success')
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-secondary py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline mb-6 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-2">Prayagraj ka Novel Registration</h1>
          <p className="text-muted-foreground">Fill in your details to participate in the competition</p>
        </div>

        {/* Registration Card */}
        <Card className="border border-border shadow-lg">
          <CardHeader>
            <CardTitle>Participant Information</CardTitle>
            <CardDescription>Please provide accurate information for registration</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {message && (
                <Alert className={message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                  <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="bg-background"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address *</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="bg-background"
                />
              </div>

              {/* Age */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Age *</label>
                <Input
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter your age"
                  min="1"
                  className="bg-background"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone Number *</label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                  maxLength={10}
                  className="bg-background"
                />
              </div>

              {/* Category */}
              

              {/* UPI ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">UPI ID *</label>
                <Input
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleChange}
                  placeholder="yourname@upi"
                  className="bg-background"
                />
              </div>

              {/* Student Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Student Type *</label>
                <Select value={formData.studentType} onValueChange={handleStudentTypeChange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select your student type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="School Student">School Student</SelectItem>
                    <SelectItem value="UG Student">UG Student</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Payment Method *</label>
                <Select value={formData.paymentMethod} onValueChange={handlePaymentMethodChange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="netbanking">Net Banking</SelectItem>
                    <SelectItem value="card">Debit/Credit Card</SelectItem>
                    <SelectItem value="demo">Demo Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-medium">Registration Fee:</span>
                  <span className="text-2xl font-bold text-primary">₹99</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-md font-medium"
              >
                {loading ? 'Processing...' : 'Complete Registration'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By registering, you agree to our terms and conditions
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
