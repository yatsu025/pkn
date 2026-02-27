import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const registrationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  age: z.number().min(1, 'Age must be valid'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  studentType: z.enum(['School Student', 'UG Student', 'Other']),
  upiId: z.string().min(1, 'UPI ID is required'),
  paymentMethod: z.enum(['upi', 'netbanking', 'card', 'demo']),
})

export async function POST(request: NextRequest) {
  console.log('Registration API POST request received');
  try {
    const body = await request.json()
    console.log('Registration request body:', body);
    const validatedData = registrationSchema.parse(body)
    console.log('Validation successful');

    let supabase;
    try {
      supabase = await createClient()
    } catch (clientError: any) {
      console.error('Failed to create Supabase client:', clientError)
      return NextResponse.json(
        { error: `Database connection failed: ${clientError.message}` },
        { status: 500 }
      )
    }

    const { data, error } = await supabase
      .from('registrations')
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        age: validatedData.age,
        address: validatedData.address,
        phone: validatedData.phone,
        student_type: validatedData.studentType,
        upi_id: validatedData.upiId,
        payment_method: validatedData.paymentMethod,
        payment_status: validatedData.paymentMethod === 'demo' ? 'completed' : 'pending',
      })
      .select()

    if (error) {
      console.error('Supabase registration error:', error)
      return NextResponse.json(
        { error: `Failed to register: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration API Catch Block:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: error.errors[0].message,
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
