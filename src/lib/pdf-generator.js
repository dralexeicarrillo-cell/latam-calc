import jsPDF from 'jspdf'
import 'jspdf-autotable'

export function generatePDFReport(assessment, logoBase64 = null) {
  const doc = new jsPDF()
  
  // Colores de NexusHealth Strategies
  const primaryColor = [10, 37, 64] // #0A2540
  const accentColor = [0, 212, 170] // #00D4AA
  
  // HEADER CON LOGO
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 50, 'F')
  
  // Agregar logo si está disponible
  if (logoBase64) {
    try {
      // Logo en la esquina superior izquierda
      doc.addImage(logoBase64, 'PNG', 15, 8, 35, 35)
    } catch (error) {
      console.log('Error al agregar logo, usando texto:', error)
    }
  }
  // Agregar logo si existe
if (logoBase64) {
  try {
    // Círculo blanco de fondo
    doc.setFillColor(255, 255, 255)
    doc.circle(32.5, 25.5, 18, 'F') // x, y, radio, 'F' = filled
    
    // Logo encima
    doc.addImage(logoBase64, 'PNG', 15, 8, 35, 35)
  } catch (error) {
    console.log('Error al agregar logo:', error)
  }
}
  // Si no hay logo, usar texto estilizado
  if (!logoBase64) {
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('NEXUSHEALTH', 20, 18)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text('STRATEGIES', 20, 27)
    
    // Línea decorativa
    doc.setDrawColor(0, 212, 170)
    doc.setLineWidth(0.5)
    doc.line(20, 30, 60, 30)
  }
  
  // Título principal (ajustado según si hay logo)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  const titleX = logoBase64 ? 60 : 105
  const titleAlign = logoBase64 ? 'left' : 'center'
  doc.text('Reporte de Entrada al Mercado LATAM', titleX, 20, { align: titleAlign })
  
  // Subtítulo con nombre de empresa evaluada
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(assessment.company_name || 'Empresa', titleX, 30, { align: titleAlign })
  
  // Fecha del reporte
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`, titleX, 40, { align: titleAlign })
  
  // SCORE BOX
  doc.setTextColor(...primaryColor)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Índice de Preparación para el Mercado', 20, 65)
  
  doc.setFontSize(52)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...accentColor)
  doc.text(`${assessment.total_score}`, 20, 88)
  
  doc.setFontSize(24)
  doc.setTextColor(100, 100, 100)
  doc.text('/100', 50, 88)
  
  // Estado de preparación
  let statusText = ''
  let statusColor = accentColor
  if (assessment.total_score >= 80) {
    statusText = '🚀 Altamente Preparado'
    statusColor = [39, 174, 96]
  } else if (assessment.total_score >= 60) {
    statusText = '✅ Buena Preparación'
    statusColor = accentColor
  } else if (assessment.total_score >= 40) {
    statusText = '⚠️ Preparación Moderada'
    statusColor = [245, 166, 35]
  } else {
    statusText = '🔧 Requiere Fortalecimiento'
    statusColor = [231, 76, 60]
  }
  
  doc.setFontSize(14)
  doc.setTextColor(...statusColor)
  doc.setFont('helvetica', 'bold')
  doc.text(statusText, 20, 98)
  
  // Línea divisoria
  doc.setDrawColor(...accentColor)
  doc.setLineWidth(1.5)
  doc.line(20, 105, 190, 105)
  
  // INFORMACIÓN DEL CLIENTE
  doc.setTextColor(...primaryColor)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Información del Cliente', 20, 115)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  
  let infoY = 122
  if (assessment.contact_name) {
    doc.text(`Contacto: ${assessment.contact_name}`, 20, infoY)
    infoY += 6
  }
  if (assessment.contact_position) {
    doc.text(`Cargo: ${assessment.contact_position}`, 20, infoY)
    infoY += 6
  }
  if (assessment.company_email) {
    doc.text(`Email: ${assessment.company_email}`, 20, infoY)
    infoY += 6
  }
  if (assessment.contact_phone) {
    doc.text(`Teléfono: ${assessment.contact_phone}`, 20, infoY)
    infoY += 6
  }
  
  // DIMENSIONES
  doc.setTextColor(...primaryColor)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Análisis por Dimensión', 20, infoY + 10)
  
  const dimensions = [
    ['Dimensión', 'Puntuación', 'Nivel'],
    ['Perfil Empresarial', `${assessment.scores.company}%`, getLevel(assessment.scores.company)],
    ['Tipo de Producto', `${assessment.scores.product}%`, getLevel(assessment.scores.product)],
    ['Preparación Regulatoria', `${assessment.scores.regulatory}%`, getLevel(assessment.scores.regulatory)],
    ['Capacidad Técnica', `${assessment.scores.technical}%`, getLevel(assessment.scores.technical)],
    ['Capacidad Comercial', `${assessment.scores.commercial}%`, getLevel(assessment.scores.commercial)],
  ]
  
  doc.autoTable({
    head: [dimensions[0]],
    body: dimensions.slice(1),
    startY: infoY + 15,
    theme: 'grid',
    headStyles: { 
      fillColor: primaryColor,
      fontSize: 11,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 10
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 40, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 60, halign: 'center' }
    }
  })
  
  // NUEVA PÁGINA: Recomendaciones
  if (assessment.recommendations && assessment.recommendations.length > 0) {
    doc.addPage()
    
    // Header de página
    addPageHeader(doc, primaryColor, logoBase64)
    
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...primaryColor)
    doc.text('Recomendaciones Estratégicas Prioritarias', 20, 28)
    
    let yPos = 40
    assessment.recommendations.forEach((rec, index) => {
      if (yPos > 260) {
        doc.addPage()
        addPageHeader(doc, primaryColor, logoBase64)
        yPos = 25
      }
      
      // Número de recomendación
      doc.setFillColor(...accentColor)
      doc.circle(25, yPos - 2, 4, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(`${index + 1}`, 25, yPos + 1, { align: 'center' })
      
      // Título
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...primaryColor)
      doc.text(rec.title, 32, yPos)
      
      // Descripción
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(60, 60, 60)
      const splitDesc = doc.splitTextToSize(rec.description, 165)
      doc.text(splitDesc, 32, yPos + 6)
      
      // Prioridad
      if (rec.priority) {
        const priorityColors = {
          high: [231, 76, 60],
          medium: [245, 166, 35],
          low: [52, 152, 219]
        }
        const priorityLabels = {
          high: 'Alta Prioridad',
          medium: 'Prioridad Media',
          low: 'Prioridad Baja'
        }
        
        doc.setFontSize(8)
        doc.setTextColor(...(priorityColors[rec.priority] || accentColor))
        doc.text(`● ${priorityLabels[rec.priority] || rec.priority}`, 32, yPos + 6 + (splitDesc.length * 4) + 3)
      }
      
      yPos += 6 + (splitDesc.length * 4) + 15
    })
  }
  
  // NUEVA PÁGINA: Mercados
  if (assessment.market_fit && assessment.market_fit.length > 0) {
    doc.addPage()
    
    addPageHeader(doc, primaryColor, logoBase64)
    
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...primaryColor)
    doc.text('Compatibilidad por Mercado LATAM', 20, 28)
    
    const marketData = [
      ['Mercado', 'Compatibilidad', 'Recomendación'],
      ...assessment.market_fit.slice(0, 9).map(m => [
        m.name, 
        `${m.score}%`,
        m.score >= 80 ? 'Prioritario' : m.score >= 60 ? 'Viable' : 'Requiere preparación'
      ])
    ]
    
    doc.autoTable({
      head: [marketData[0]],
      body: marketData.slice(1),
      startY: 35,
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor,
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 50, halign: 'center', fontStyle: 'bold' },
        2: { cellWidth: 60, halign: 'center' }
      }
    })
  }
  
  // FOOTER en todas las páginas
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `NexusHealth Strategies © ${new Date().getFullYear()} | Conectando innovación con oportunidades | Página ${i} de ${pageCount}`,
      105,
      290,
      { align: 'center' }
    )
  }
  
  return doc
}

// Función para agregar header en páginas secundarias
function addPageHeader(doc, primaryColor, logoBase64) {
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 15, 'F')
  
  // Logo pequeño en header si está disponible
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 10, 3, 12, 12)
    } catch (error) {
      console.log('Error al agregar logo en header')
    }
  }
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('NEXUSHEALTH STRATEGIES', logoBase64 ? 25 : 20, 10)
}

// Función auxiliar para determinar nivel
function getLevel(score) {
  if (score >= 80) return 'Excelente'
  if (score >= 60) return 'Bueno'
  if (score >= 40) return 'Moderado'
  return 'Bajo'
}