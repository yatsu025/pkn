'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

export default function RegistrationSuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border border-border shadow-2xl text-center overflow-hidden">
          <div className="h-2 bg-green-500" />
          <CardHeader className="pt-8">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3 text-green-600">
                <CheckCircle2 size={48} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">Registration Successful!</CardTitle>
            <CardDescription className="text-lg">
              Thank you for registering for Prayagraj ka Novel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-10">
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground text-left space-y-2">
              <p>• Your registration has been recorded in our system.</p>
              <p>• Please complete the payment of <strong>₹99</strong> via your chosen method.</p>
              <p>• You will receive a confirmation email once the payment is verified.</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Link href="/">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-medium">
                  Go back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center mt-8 text-sm text-muted-foreground">
          Need help? Contact us at <a href="mailto:support@prayagrajkanovel.com" className="text-primary hover:underline">support@pkn.com</a>
        </p>
      </div>
    </main>
  )
}
