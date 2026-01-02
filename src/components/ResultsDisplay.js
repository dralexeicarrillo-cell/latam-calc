'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { generatePDFReport } from '@/lib/pdf-generator'

export default function ResultsDisplay({ results }) {
  const [logoBase64, setLogoBase64] = useState(null)

  // Cargar el logo al montar el componente
  useEffect(() => {
    async function loadLogo() {
      try {
        const response = await fetch('/logo-nexushealth.png')
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onloadend = () => {
          setLogoBase64(reader.result)
        }
        reader.readAsDataURL(blob)
      } catch (error) {
        console.log('No se pudo cargar el logo:', error)
      }
    }
    loadLogo()
  }, [])

  const handleDownloadPDF = () => {
    try {
      const pdfDoc = generatePDFReport(results, logoBase64)
      const fileName = `reporte-latam-${results.company_name.replace(/\s+/g, '-')}.pdf`
      pdfDoc.save(fileName)
    } catch (error) {
      console.error('Error generando PDF:', error)
      alert('Error al generar el PDF. Por favor intenta de nuevo.')
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Reporte de Mercado LATAM - ${results.company_name}`,
          text: `Mi empresa obtuvo ${results.total_score} puntos en la evaluación de preparación para mercados LATAM`,
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('¡Link copiado al portapapeles!')
      }
    } catch (error) {
      console.error('Error al compartir:', error)
    }
  }

  // Determinar el nivel de preparación
  let preparationLevel = ''
  let levelColor = ''
  if (results.total_score >= 80) {
    preparationLevel = 'Alta Preparación'
    levelColor = '#27AE60'
  } else if (results.total_score >= 60) {
    preparationLevel = 'Buena Preparación'
    levelColor = '#00D4AA'
  } else if (results.total_score >= 40) {
    preparationLevel = 'Preparación Moderada'
    levelColor = '#F5A623'
  } else {
    preparationLevel = 'Requiere Fortalecimiento'
    levelColor = '#E74C3C'
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h1>Tu Panorama de Mercado LATAM</h1>
        <p className="company-name">{results.company_name}</p>
      </div>

      {/* Score principal */}
      <div className="score-card" style={{ borderColor: levelColor }}>
        <div className="score-label">Índice de Preparación</div>
        <div className="score-value" style={{ color: levelColor }}>
          {results.total_score}
          <span className="score-max">/100</span>
        </div>
        <div className="score-level" style={{ background: levelColor }}>
          {preparationLevel}
        </div>
      </div>

      {/* Dimensiones */}
      <div className="dimensions-grid">
        <h2>Análisis por Dimensión</h2>
        <div className="dimensions">
          <div className="dimension-card">
            <div className="dimension-name">Perfil Empresarial</div>
            <div className="dimension-score">{results.scores.company}%</div>
            <div className="dimension-bar">
              <div 
                className="dimension-bar-fill" 
                style={{ width: `${results.scores.company}%` }}
              />
            </div>
          </div>

          <div className="dimension-card">
            <div className="dimension-name">Tipo de Producto</div>
            <div className="dimension-score">{results.scores.product}%</div>
            <div className="dimension-bar">
              <div 
                className="dimension-bar-fill" 
                style={{ width: `${results.scores.product}%` }}
              />
            </div>
          </div>

          <div className="dimension-card">
            <div className="dimension-name">Preparación Regulatoria</div>
            <div className="dimension-score">{results.scores.regulatory}%</div>
            <div className="dimension-bar">
              <div 
                className="dimension-bar-fill" 
                style={{ width: `${results.scores.regulatory}%` }}
              />
            </div>
          </div>

          <div className="dimension-card">
            <div className="dimension-name">Capacidad Técnica</div>
            <div className="dimension-score">{results.scores.technical}%</div>
            <div className="dimension-bar">
              <div 
                className="dimension-bar-fill" 
                style={{ width: `${results.scores.technical}%` }}
              />
            </div>
          </div>

          <div className="dimension-card">
            <div className="dimension-name">Capacidad Comercial</div>
            <div className="dimension-score">{results.scores.commercial}%</div>
            <div className="dimension-bar">
              <div 
                className="dimension-bar-fill" 
                style={{ width: `${results.scores.commercial}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recomendaciones */}
      {results.recommendations && results.recommendations.length > 0 && (
        <div className="recommendations-section">
          <h2>Recomendaciones Prioritarias</h2>
          <div className="recommendations-grid">
            {results.recommendations.map((rec, index) => (
              <div 
                key={index} 
                className={`recommendation-card priority-${rec.priority}`}
              >
                <div className="recommendation-header">
                  <span className="recommendation-icon">{rec.icon}</span>
                  <span className={`recommendation-priority priority-${rec.priority}`}>
                    {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Baja'}
                  </span>
                </div>
                <h3>{rec.title}</h3>
                <p>{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compatibilidad de mercados */}
      {results.market_fit && results.market_fit.length > 0 && (
        <div className="markets-section">
          <h2>Compatibilidad por Mercado</h2>
          <div className="markets-grid">
            {results.market_fit.map((market, index) => (
              <div key={index} className="market-card">
                <div className="market-flag">{market.flag}</div>
                <div className="market-name">{market.name}</div>
                <div className="market-score">{market.score}%</div>
                <div className="market-bar">
                  <div 
                    className="market-bar-fill"
                    style={{ 
                      width: `${market.score}%`,
                      background: market.score >= 80 ? '#27AE60' : 
                                 market.score >= 60 ? '#00D4AA' : 
                                 market.score >= 40 ? '#F5A623' : '#E74C3C'
                    }}
                  />
                </div>
                {market.selected && (
                  <span className="market-selected">Seleccionado</span>
                )}
                {market.factors && market.factors.length > 0 && (
                  <div className="market-factors">
                    {market.factors.map((factor, i) => (
                      <span key={i} className="market-factor">{factor}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="actions">
        <button className="btn btn-primary" onClick={handleDownloadPDF}>
          📥 Descargar Reporte PDF
        </button>
        <button className="btn btn-secondary" onClick={handleShare}>
          🔗 Compartir
        </button>
        <Link href="/" className="btn btn-secondary">
          🔄 Nueva Evaluación
        </Link>
      </div>

      <style jsx>{`
        .results-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .results-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .results-header h1 {
          font-size: 2.5rem;
          color: #0A2540;
          margin-bottom: 10px;
        }

        .company-name {
          font-size: 1.2rem;
          color: #666;
        }

        .score-card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          border: 4px solid;
          margin-bottom: 40px;
        }

        .score-label {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .score-value {
          font-size: 6rem;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 20px;
        }

        .score-max {
          font-size: 2.5rem;
          opacity: 0.6;
        }

        .score-level {
          display: inline-block;
          padding: 12px 32px;
          border-radius: 50px;
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .dimensions-grid h2,
        .recommendations-section h2,
        .markets-section h2 {
          font-size: 2rem;
          color: #0A2540;
          margin-bottom: 24px;
        }

        .dimensions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .dimension-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .dimension-name {
          font-size: 1rem;
          color: #0A2540;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .dimension-score {
          font-size: 2rem;
          color: #00D4AA;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .dimension-bar {
          height: 8px;
          background: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .dimension-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #00D4AA 0%, #00B894 100%);
          transition: width 0.5s ease;
        }

        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .recommendation-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border-left: 4px solid;
        }

        .recommendation-card.priority-high {
          border-left-color: #E74C3C;
        }

        .recommendation-card.priority-medium {
          border-left-color: #F5A623;
        }

        .recommendation-card.priority-low {
          border-left-color: #3498DB;
        }

        .recommendation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .recommendation-icon {
          font-size: 1.5rem;
        }

        .recommendation-priority {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: white;
        }

        .recommendation-priority.priority-high {
          background: #E74C3C;
        }

        .recommendation-priority.priority-medium {
          background: #F5A623;
        }

        .recommendation-priority.priority-low {
          background: #3498DB;
        }

        .recommendation-card h3 {
          font-size: 1.2rem;
          color: #0A2540;
          margin-bottom: 12px;
        }

        .recommendation-card p {
          color: #666;
          line-height: 1.6;
        }

        .markets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .market-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          position: relative;
        }

        .market-flag {
          font-size: 2.5rem;
          margin-bottom: 8px;
        }

        .market-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #0A2540;
          margin-bottom: 8px;
        }

        .market-score {
          font-size: 1.5rem;
          color: #00D4AA;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .market-bar {
          height: 6px;
          background: #f0f0f0;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .market-bar-fill {
          height: 100%;
          transition: width 0.5s ease;
        }

        .market-selected {
          display: inline-block;
          padding: 4px 12px;
          background: #0A2540;
          color: white;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .market-factors {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .market-factor {
          font-size: 0.75rem;
          padding: 4px 8px;
          background: #f0f0f0;
          border-radius: 8px;
          color: #666;
        }

        .actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 40px;
        }

        .btn {
          padding: 16px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #00D4AA 0%, #00B894 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 212, 170, 0.4);
        }

        .btn-secondary {
          background: white;
          color: #0A2540;
          border: 2px solid #0A2540;
        }

        .btn-secondary:hover {
          background: #0A2540;
          color: white;
        }

        @media (max-width: 768px) {
          .results-header h1 {
            font-size: 2rem;
          }

          .score-value {
            font-size: 4rem;
          }

          .dimensions {
            grid-template-columns: 1fr;
          }

          .recommendations-grid {
            grid-template-columns: 1fr;
          }

          .markets-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}