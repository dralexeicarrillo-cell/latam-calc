import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ResultsDisplay from '@/components/ResultsDisplay'

export default async function ResultsPage({ params }) {
  const { id } = params

  // Intentar obtener el assessment de Supabase
  let assessment = null
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching assessment:', error)
      } else {
        assessment = data
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Si no se encuentra en Supabase, mostrar página no encontrada
  if (!assessment) {
    notFound()
  }

  // Formatear los datos para ResultsDisplay
  const results = {
    company_name: assessment.company_name || 'Empresa',
    contact_name: assessment.contact_name,
    contact_email: assessment.company_email,
    contact_phone: assessment.contact_phone,
    contact_position: assessment.contact_position,
    company_email: assessment.company_email,
    total_score: assessment.total_score || 0,
    scores: assessment.scores || {
      company: 0,
      product: 0,
      regulatory: 0,
      technical: 0,
      commercial: 0
    },
    recommendations: assessment.recommendations || [],
    market_fit: assessment.market_fit || [],
    selected_markets: assessment.selected_markets || []
  }

  return (
    <div>
      <ResultsDisplay results={results} />
    </div>
  )
}