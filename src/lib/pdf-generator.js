import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function generatePDFReport(data) {
  const doc = new jsPDF()
  
  // COLORES DE MARCA
  const NHS_BLUE = [26, 31, 44]   // #1A1F2C
  const NHS_ORANGE = [247, 148, 29] // #F7941D
  const LIGHT_GRAY = [241, 245, 249]

  // --- HEADER ---
  // Fondo Azul
  doc.setFillColor(...NHS_BLUE)
  doc.rect(0, 0, 210, 40, 'F')
  
  // Logo Texto
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('NHS+', 15, 20)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('INTERNAL TOOLS', 15, 26)

  // Título del Reporte
  doc.setFontSize(18)
  doc.text('Panorama de Entrada a LATAM', 200, 20, { align: 'right' })
  doc.setFontSize(10)
  doc.setTextColor(200, 200, 200)
  doc.text(`Preparado para: ${data.company_name}`, 200, 28, { align: 'right' })

  // --- SECCIÓN DE PUNTAJE ---
  const score = data.total_score || 0
  let statusText = 'Inicial'
  if (score >= 80) statusText = 'Excelente'
  else if (score >= 60) statusText = 'Bueno'
  else if (score >= 40) statusText = 'Moderado'

  // Círculo de puntaje visual
  doc.setDrawColor(...NHS_ORANGE)
  doc.setLineWidth(2)
  doc.circle(30, 65, 12)
  doc.setFontSize(14)
  doc.setTextColor(...NHS_BLUE)
  doc.setFont('helvetica', 'bold')
  doc.text(`${score}`, 30, 65, { align: 'center', baseline: 'middle' })
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('Puntaje Global', 30, 82, { align: 'center' })

  // Texto de Estado
  doc.setFontSize(12)
  doc.setTextColor(...NHS_BLUE)
  doc.text(`Nivel de Preparación: ${statusText}`, 60, 60)
  
  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  const summary = "Este reporte analiza la preparación regulatoria, técnica y comercial de su empresa para expandirse en Latinoamérica."
  doc.text(doc.splitTextToSize(summary, 130), 60, 68)

  // --- TABLA DE DETALLE ---
  const scores = data.scores || {}
  const tableData = [
    ['Perfil Corporativo', `${scores.company}/100`],
    ['Producto / Servicio', `${scores.product}/100`],
    ['Regulatorio', `${scores.regulatory}/100`],
    ['Técnico', `${scores.technical}/100`],
    ['Comercial', `${scores.commercial}/100`],
  ]

  autoTable(doc, {
    startY: 90,
    head: [['Área de Análisis', 'Puntaje']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: NHS_BLUE, textColor: 255 },
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 
        0: { fontStyle: 'bold' },
        1: { halign: 'center', textColor: NHS_ORANGE } 
    }
  })

  // --- MERCADOS OBJETIVO ---
  const finalY = doc.lastAutoTable.finalY + 15
  doc.setFontSize(12)
  doc.setTextColor(...NHS_BLUE)
  doc.text('Mercados Prioritarios', 15, finalY)

  const markets = data.market_fit || []
  const marketRows = markets.slice(0, 5).map(m => [
    m.name, 
    `${m.score}% Compatibilidad`, 
    m.highlights
  ])

  autoTable(doc, {
    startY: finalY + 5,
    head: [['País', 'Match', 'Highlights']],
    body: marketRows,
    theme: 'striped',
    headStyles: { fillColor: NHS_ORANGE, textColor: 255 },
    styles: { fontSize: 9 },
  })

  // --- RECOMENDACIONES ---
  const recY = doc.lastAutoTable.finalY + 15
  doc.setFontSize(12)
  doc.setTextColor(...NHS_BLUE)
  doc.text('Áreas de Mejora (Resumen)', 15, recY)

  const recs = data.recommendations || []
  const recRows = recs.map(r => [r.title, 'Requiere Atención'])

  autoTable(doc, {
    startY: recY + 5,
    body: recRows,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold' } }
  })

  // --- FOOTER ---
  const pageHeight = doc.internal.pageSize.height
  doc.setFillColor(...NHS_BLUE)
  doc.rect(0, pageHeight - 20, 210, 20, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.text('NexusHealth Strategies - www.nhealths.com', 105, pageHeight - 10, { align: 'center' })

  // Descargar
  doc.save(`Reporte_NHS_${data.company_name.replace(/\s+/g, '_')}.pdf`)
}