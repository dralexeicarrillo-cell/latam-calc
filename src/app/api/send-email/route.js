import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const body = await request.json()
    const { to, subject, html, type } = body

    console.log('📧 Intentando enviar email a:', to)

    if (!to || !subject || !html) {
      console.error('❌ Faltan campos obligatorios')
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY no configurado')
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const fromEmail = process.env.FROM_EMAIL || 'NexusHealth Strategies <noreply@mail.nhealths.com>'
    console.log('📤 Enviando desde:', fromEmail)

    const data = await resend.emails.send({
      from: fromEmail,
      to: to,
      subject: subject,
      html: html,
    })

    console.log('✅ Email enviado exitosamente:', data)

    return NextResponse.json({ 
      success: true, 
      id: data.id,
      message: 'Email sent successfully'
    })

  } catch (error) {
    console.error('❌ Error completo:', error)
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const isConfigured = !!process.env.RESEND_API_KEY
  
  return NextResponse.json({
    status: 'Email service is running',
    configured: isConfigured,
    message: isConfigured 
      ? 'Resend API key is configured' 
      : 'Resend API key is NOT configured'
  })
}