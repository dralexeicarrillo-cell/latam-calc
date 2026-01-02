'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminDashboard() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, high, medium, low

  useEffect(() => {
    loadLeads()
  }, [])

  async function loadLeads() {
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      let query = supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter === 'high') {
        query = query.gte('total_score', 80)
      } else if (filter === 'medium') {
        query = query.gte('total_score', 60).lt('total_score', 80)
      } else if (filter === 'low') {
        query = query.lt('total_score', 60)
      }

      const { data, error } = await query

      if (error) throw error
      setLeads(data || [])
    } catch (error) {
      console.error('Error loading leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Fecha', 'Empresa', 'Contacto', 'Email', 'Teléfono', 'Cargo', 'Puntuación', 'Mercados']
    const rows = leads.map(lead => [
      new Date(lead.created_at).toLocaleDateString('es-ES'),
      lead.company_name,
      lead.contact_name,
      lead.company_email,
      lead.contact_phone,
      lead.contact_position,
      lead.total_score,
      lead.selected_markets?.join(', ') || ''
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊 Dashboard de Leads</h1>
        <p style={{ color: '#64748B' }}>Empresas interesadas en entrar al mercado LATAM</p>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('all')} style={filterButtonStyle(filter === 'all')}>
          Todos ({leads.length})
        </button>
        <button onClick={() => setFilter('high')} style={filterButtonStyle(filter === 'high')}>
          Alta Prep. (80+)
        </button>
        <button onClick={() => setFilter('medium')} style={filterButtonStyle(filter === 'medium')}>
          Media Prep. (60-79)
        </button>
        <button onClick={() => setFilter('low')} style={filterButtonStyle(filter === 'low')}>
          Baja Prep. (&lt;60)
        </button>
        <button onClick={exportToCSV} style={exportButtonStyle}>
          📥 Exportar CSV
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#0A2540', color: 'white' }}>
            <tr>
              <th style={thStyle}>Fecha</th>
              <th style={thStyle}>Empresa</th>
              <th style={thStyle}>Contacto</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Puntuación</th>
              <th style={thStyle}>Mercados</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, index) => (
              <tr key={lead.id} style={{ background: index % 2 === 0 ? '#F8FAFC' : 'white' }}>
                <td style={tdStyle}>{new Date(lead.created_at).toLocaleDateString('es-ES')}</td>
                <td style={tdStyle}>
                  <strong>{lead.company_name}</strong>
                  {lead.company_website && <><br /><a href={lead.company_website} target="_blank" style={{ fontSize: '0.85em', color: '#00D4AA' }}>{lead.company_website}</a></>}
                </td>
                <td style={tdStyle}>
                  {lead.contact_name}<br />
                  <span style={{ fontSize: '0.85em', color: '#64748B' }}>{lead.contact_position}</span><br />
                  <span style={{ fontSize: '0.85em' }}>{lead.contact_phone}</span>
                </td>
                <td style={tdStyle}>
                  <a href={`mailto:${lead.company_email}`} style={{ color: '#00D4AA', textDecoration: 'none' }}>
                    {lead.company_email}
                  </a>
                </td>
                <td style={tdStyle}>
                  <span style={scoreStyle(lead.total_score)}>{lead.total_score}/100</span>
                </td>
                <td style={tdStyle}>
                  {lead.selected_markets?.join(', ') || '-'}
                </td>
                <td style={tdStyle}>
                  <Link href={`/results/${lead.id}`} style={{ color: '#00D4AA', textDecoration: 'none', fontWeight: 'bold' }}>
                    Ver Reporte →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {leads.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
          <p style={{ fontSize: '1.2rem' }}>📭 No hay leads registrados aún</p>
        </div>
      )}
    </div>
  )
}

// Estilos
const thStyle = {
  padding: '1rem',
  textAlign: 'left',
  fontWeight: '600',
  fontSize: '0.9rem'
}

const tdStyle = {
  padding: '1rem',
  fontSize: '0.9rem',
  borderBottom: '1px solid #E2E8F0'
}

const filterButtonStyle = (active) => ({
  padding: '0.75rem 1.5rem',
  border: active ? '2px solid #00D4AA' : '2px solid #E2E8F0',
  background: active ? 'rgba(0, 212, 170, 0.1)' : 'white',
  color: active ? '#00B894' : '#64748B',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: active ? '600' : '500',
  transition: 'all 0.2s'
})

const exportButtonStyle = {
  padding: '0.75rem 1.5rem',
  border: 'none',
  background: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)',
  color: 'white',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  marginLeft: 'auto'
}

const scoreStyle = (score) => ({
  display: 'inline-block',
  padding: '0.25rem 0.75rem',
  borderRadius: '20px',
  fontWeight: '700',
  fontSize: '0.9rem',
  background: score >= 80 ? '#D4EDDA' : score >= 60 ? '#FFF3CD' : '#F8D7DA',
  color: score >= 80 ? '#155724' : score >= 60 ? '#856404' : '#721C24'
})