import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const body = await request.json()
    
    const {
      company_name,
      company_email,
      company_website,
      contact_name,
      contact_phone,
      contact_position,
      responses,
      scores,
      total_score,
      market_fit,
      recommendations,
      selected_markets,
    } = body

    // Validate required fields
    if (!company_name || !contact_name || !company_email || !contact_phone) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company_email)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      )
    }

    // If Supabase is not configured, return success with a mock ID
    if (!supabase) {
      console.log('Supabase not configured, returning mock response')
      return NextResponse.json({
        success: true,
        id: `local-${Date.now()}`,
        message: 'Database not configured - results calculated locally'
      })
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('assessments')
      .insert({
        company_name,
        company_email,
        company_website: company_website || null,
        contact_name,
        contact_phone,
        contact_position,
        responses,
        scores,
        total_score,
        market_fit,
        recommendations,
        selected_markets: selected_markets || [],
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // 📧 ENVIAR EMAIL AL ADMIN (a ti)
try {
  console.log('🔵 [ADMIN] Iniciando envío de email al admin')
  console.log('🔵 [ADMIN] Email destino:', process.env.ADMIN_EMAIL)
  
  const adminEmailHtml = generateAdminEmail({
    company_name,
    contact_name,
    contact_phone,
    company_email,
    contact_position,
    company_website: company_website || '',
    total_score,
    selected_markets: selected_markets || [],
    assessment_id: data.id,
    scores
  })

  console.log('🔵 [ADMIN] HTML generado, enviando...')

  const adminResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: process.env.ADMIN_EMAIL || 'gerencia@nhealths.com',
      subject: `🎯 Nuevo Lead: ${company_name} - Puntuación: ${total_score}/100`,
      html: adminEmailHtml,
      type: 'admin'
    })
  })

  const adminResult = await adminResponse.json()
  console.log('🔵 [ADMIN] Respuesta:', adminResult)

} catch (emailError) {
  console.error('❌ [ADMIN] Error completo:', emailError.message)
  console.error('❌ [ADMIN] Stack:', emailError.stack)
  // No fallar el request si el email falla
}

    // 📧 ENVIAR EMAIL AL PROSPECTO
    try {
      const clientEmailHtml = generateClientEmail({
        contact_name,
        company_name,
        total_score,
        assessment_id: data.id,
        scores,
        recommendations: recommendations.slice(0, 3) // Solo las 3 principales
      })

      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: company_email,
          subject: `Tu Evaluación de Mercado LATAM - ${company_name}`,
          html: clientEmailHtml,
          type: 'client'
        })
      })
    } catch (emailError) {
      console.error('Error sending client email:', emailError)
    }

    return NextResponse.json({
      success: true,
      id: data.id,
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Get summary statistics (opcional - for admin dashboard)
  if (!supabase) {
    return NextResponse.json({ 
      success: false, 
      error: 'Database not configured' 
    })
  }

  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('id, company_name, contact_name, total_score, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 📧 FUNCIÓN PARA GENERAR EMAIL AL ADMIN
// ========================================
function generateAdminEmail(data) {
  // Validar datos requeridos
  const {
    company_name = 'Sin nombre',
    contact_name = 'Sin nombre',
    contact_phone = 'Sin teléfono',
    company_email = 'Sin email',
    contact_position = 'Sin cargo',
    company_website = '',
    total_score = 0,
    selected_markets = [],
    assessment_id = 'unknown',
    scores = { company: 0, product: 0, regulatory: 0, technical: 0, commercial: 0 }
  } = data

  console.log('📝 [generateAdminEmail] Generando HTML para:', company_name)

  const resultsUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/results/${assessment_id}`
  // Determinar nivel de preparación
  let preparacionNivel = ''
  let preparacionColor = '#00D4AA'
  if (data.total_score >= 80) {
    preparacionNivel = '🚀 Alta Preparación'
    preparacionColor = '#27AE60'
  } else if (data.total_score >= 60) {
    preparacionNivel = '✅ Buena Preparación'
    preparacionColor = '#00D4AA'
  } else if (data.total_score >= 40) {
    preparacionNivel = '⚠️ Preparación Moderada'
    preparacionColor = '#F5A623'
  } else {
    preparacionNivel = '🔧 Requiere Fortalecimiento'
    preparacionColor = '#E74C3C'
  }

  // Formatear mercados
  const marketNames = {
    mexico: 'México',
    colombia: 'Colombia',
    costarica: 'Costa Rica',
    panama: 'Panamá',
    peru: 'Perú',
    ecuador: 'Ecuador',
    dominicana: 'Rep. Dominicana',
    elsalvador: 'El Salvador',
    guatemala: 'Guatemala'
  }
  const mercadosTexto = data.selected_markets?.map(m => marketNames[m] || m).join(', ') || 'No especificado'
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center;
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: 700;
        }
        .header p {
          margin: 0;
          opacity: 0.9;
          font-size: 14px;
        }
        .content { 
          padding: 30px;
        }
        .score-banner {
          background: linear-gradient(135deg, ${preparacionColor}15 0%, ${preparacionColor}08 100%);
          border-left: 4px solid ${preparacionColor};
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
          text-align: center;
        }
        .score-number {
          font-size: 48px;
          font-weight: 800;
          color: ${preparacionColor};
          margin: 0;
          line-height: 1;
        }
        .score-label {
          font-size: 16px;
          font-weight: 600;
          color: #666;
          margin-top: 8px;
        }
        .info-section {
          margin-bottom: 20px;
        }
        .info-row { 
          margin: 12px 0; 
          padding: 15px; 
          background: #f8f9fa; 
          border-radius: 8px; 
          border-left: 4px solid #00D4AA;
        }
        .label { 
          font-weight: 700; 
          color: #0A2540;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 4px;
        }
        .value {
          font-size: 15px;
          color: #333;
        }
        .dimensions {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .dimensions h3 {
          margin: 0 0 15px 0;
          font-size: 16px;
          color: #0A2540;
        }
        .dimension-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .dimension-item:last-child {
          border-bottom: none;
        }
        .dimension-name {
          font-size: 14px;
          color: #555;
        }
        .dimension-score {
          font-weight: 700;
          color: #00D4AA;
        }
        .button { 
          display: inline-block; 
          background: linear-gradient(135deg, #00D4AA 0%, #00B894 100%);
          color: white; 
          padding: 14px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 20px 0;
          font-weight: 600;
          font-size: 15px;
          box-shadow: 0 4px 12px rgba(0, 212, 170, 0.3);
        }
        .footer {
          background: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          border-top: 1px solid #e0e0e0;
        }
        .footer p {
          margin: 5px 0;
          font-size: 13px;
          color: #666;
        }
        .timestamp {
          color: #999;
          font-size: 12px;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 Nuevo Lead Generado</h1>
          <p>Calculadora de Mercado LATAM - nHealths</p>
        </div>
        
        <div class="content">
          <div class="score-banner">
            <div class="score-number">${data.total_score}<span style="font-size: 24px; opacity: 0.7;">/100</span></div>
            <div class="score-label">${preparacionNivel}</div>
          </div>

          <div class="info-section">
            <div class="info-row">
              <span class="label">🏢 Empresa</span>
              <span class="value">${data.company_name}</span>
            </div>
            
            <div class="info-row">
              <span class="label">👤 Contacto</span>
              <span class="value">${data.contact_name} - ${data.contact_position}</span>
            </div>
            
            <div class="info-row">
              <span class="label">📧 Email</span>
              <span class="value"><a href="mailto:${data.company_email}" style="color: #00D4AA; text-decoration: none;">${data.company_email}</a></span>
            </div>
            
            <div class="info-row">
              <span class="label">📱 Teléfono</span>
              <span class="value"><a href="tel:${data.contact_phone}" style="color: #00D4AA; text-decoration: none;">${data.contact_phone}</a></span>
            </div>
            
            ${data.company_website ? `
            <div class="info-row">
              <span class="label">🌐 Sitio Web</span>
              <span class="value"><a href="${data.company_website}" target="_blank" style="color: #00D4AA; text-decoration: none;">${data.company_website}</a></span>
            </div>
            ` : ''}
            
            <div class="info-row">
              <span class="label">🌎 Mercados de Interés</span>
              <span class="value">${mercadosTexto}</span>
            </div>
          </div>

          <div class="dimensions">
            <h3>📊 Desglose por Dimensión</h3>
            <div class="dimension-item">
              <span class="dimension-name">Perfil Empresarial</span>
              <span class="dimension-score">${data.scores.company}%</span>
            </div>
            <div class="dimension-item">
              <span class="dimension-name">Tipo de Producto</span>
              <span class="dimension-score">${data.scores.product}%</span>
            </div>
            <div class="dimension-item">
              <span class="dimension-name">Prep. Regulatoria</span>
              <span class="dimension-score">${data.scores.regulatory}%</span>
            </div>
            <div class="dimension-item">
              <span class="dimension-name">Capacidad Técnica</span>
              <span class="dimension-score">${data.scores.technical}%</span>
            </div>
            <div class="dimension-item">
              <span class="dimension-name">Cap. Comercial</span>
              <span class="dimension-score">${data.scores.commercial}%</span>
            </div>
          </div>
          
          <center>
            <a href="${resultsUrl}" class="button">📄 Ver Reporte Completo</a>
          </center>
          
          <p class="timestamp">
            Lead generado el ${new Date().toLocaleString('es-ES', { 
              dateStyle: 'full', 
              timeStyle: 'short',
              timeZone: 'America/Costa_Rica'
            })}
          </p>
        </div>

        <div class="footer">
          <p><strong>nNexusHealth Strategies</strong> - Conectando innovación con oportunidades</p>
          <p>www.nhealths.com</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// ==========================================
// 📧 FUNCIÓN PARA GENERAR EMAIL AL CLIENTE
// ==========================================
function generateClientEmail(data) {
  const resultsUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/results/${data.assessment_id}`
  
  let scoreStatus = ''
  let statusColor = '#00D4AA'
  if (data.total_score >= 80) {
    scoreStatus = '🚀 Altamente Preparado'
    statusColor = '#27AE60'
  } else if (data.total_score >= 60) {
    scoreStatus = '✅ Buena Preparación'
    statusColor = '#00D4AA'
  } else if (data.total_score >= 40) {
    scoreStatus = '⚠️ Preparación Moderada'
    statusColor = '#F5A623'
  } else {
    scoreStatus = '🔧 Requiere Fortalecimiento'
    statusColor = '#E74C3C'
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%); 
          color: white; 
          padding: 50px 30px; 
          text-align: center;
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 26px;
          font-weight: 700;
        }
        .header p {
          margin: 0;
          opacity: 0.9;
          font-size: 16px;
        }
        .content { 
          padding: 40px 30px;
        }
        .score-box { 
          background: linear-gradient(135deg, ${statusColor}15 0%, ${statusColor}08 100%);
          padding: 30px; 
          text-align: center; 
          border-radius: 12px; 
          margin: 20px 0;
          border: 2px solid ${statusColor}30;
        }
        .score-label {
          color: #666; 
          margin: 0 0 10px 0;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .score { 
          font-size: 64px; 
          color: ${statusColor}; 
          font-weight: 800;
          margin: 10px 0;
          line-height: 1;
        }
        .score span {
          font-size: 28px;
          opacity: 0.6;
        }
        .status { 
          background: ${statusColor}; 
          color: white; 
          padding: 10px 24px; 
          border-radius: 25px; 
          display: inline-block; 
          margin-top: 15px;
          font-weight: 600;
          font-size: 15px;
        }
        .summary {
          margin: 30px 0;
        }
        .summary h3 {
          color: #0A2540;
          margin: 0 0 15px 0;
          font-size: 20px;
        }
        .summary p {
          color: #555;
          margin: 10px 0;
        }
        .dimensions {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .dimension-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .dimension-item:last-child {
          border-bottom: none;
        }
        .dimension-name {
          font-size: 14px;
          color: #555;
        }
        .dimension-value {
          font-weight: 700;
          color: #00D4AA;
          font-size: 15px;
        }
        .recommendations {
          margin: 25px 0;
        }
        .recommendations h3 {
          color: #0A2540;
          margin: 0 0 15px 0;
          font-size: 18px;
        }
        .rec-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 10px;
          border-left: 4px solid #F5A623;
        }
        .rec-item h4 {
          margin: 0 0 5px 0;
          font-size: 15px;
          color: #0A2540;
        }
        .rec-item p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
        .button { 
          display: inline-block; 
          background: linear-gradient(135deg, #00D4AA 0%, #00B894 100%);
          color: white; 
          padding: 16px 40px; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 25px 0;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 0 4px 15px rgba(0, 212, 170, 0.4);
        }
        .cta-box {
          background: linear-gradient(135deg, #0A254015 0%, #1E3A5F08 100%);
          padding: 25px;
          border-radius: 8px;
          margin: 30px 0;
          text-align: center;
        }
        .cta-box h3 {
          margin: 0 0 10px 0;
          color: #0A2540;
          font-size: 18px;
        }
        .cta-box p {
          margin: 0 0 15px 0;
          color: #555;
        }
        .contact-link {
          color: #00D4AA;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
        }
        .footer { 
          background: #0A2540; 
          color: white; 
          padding: 25px; 
          text-align: center;
        }
        .footer p {
          margin: 5px 0;
        }
        .footer-brand {
          font-weight: 700;
          font-size: 16px;
        }
        .footer-tagline {
          opacity: 0.8;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Gracias por tu interés, ${data.contact_name}!</h1>
          <p>Tu evaluación de entrada al mercado LATAM está lista</p>
        </div>
        
        <div class="content">
          <div class="score-box">
            <p class="score-label">Índice de Preparación de ${data.company_name}</p>
            <div class="score">${data.total_score}<span>/100</span></div>
            <div class="status">${scoreStatus}</div>
          </div>
          
          <div class="summary">
            <h3>📊 Resumen de tu Evaluación</h3>
            <p>Hemos analizado la preparación de <strong>${data.company_name}</strong> en 5 dimensiones clave para entrada al mercado latinoamericano:</p>
          </div>

          <div class="dimensions">
            <div class="dimension-item">
              <span class="dimension-name">Perfil Empresarial</span>
              <span class="dimension-value">${data.scores.company}%</span>
            </div>
            <div class="dimension-item">
              <span class="dimension-name">Tipo de Producto</span>
              <span class="dimension-value">${data.scores.product}%</span>
            </div>
            <div class="dimension-item">
              <span class="dimension-name">Preparación Regulatoria</span>
              <span class="dimension-value">${data.scores.regulatory}%</span>
            </div>
            <div class="dimension-item">
              <span class="dimension-name">Capacidad Técnica</span>
              <span class="dimension-value">${data.scores.technical}%</span>
            </div>
            <div class="dimension-item">
              <span class="dimension-name">Capacidad Comercial</span>
              <span class="dimension-value">${data.scores.commercial}%</span>
            </div>
          </div>

          ${data.recommendations && data.recommendations.length > 0 ? `
          <div class="recommendations">
            <h3>⚡ Principales Recomendaciones</h3>
            ${data.recommendations.map(rec => `
              <div class="rec-item">
                <h4>${rec.icon || '•'} ${rec.title}</h4>
                <p>${rec.description}</p>
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          <center>
            <a href="${resultsUrl}" class="button">📄 Ver Reporte Completo con Análisis Detallado</a>
          </center>

          <div class="cta-box">
            <h3>¿Necesitas ayuda personalizada?</h3>
            <p>Nuestro equipo en Nexus health Strategies puede ayudarte a desarrollar una estrategia específica para tu entrada al mercado latinoamericano.</p>
            <a href="mailto:gerencia@nhealths.com" class="contact-link">📧 gerencia@nhealths.com</a>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-brand">nHealths</p>
          <p class="footer-tagline">Conectando innovación con oportunidades en LATAM</p>
          <p style="margin-top: 10px; font-size: 12px; opacity: 0.7;">© ${new Date().getFullYear()} nHealths - www.nhealths.com</p>
        </div>
      </div>
    </body>
    </html>
  `
}