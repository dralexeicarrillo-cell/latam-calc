'use client'

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <h1>🏥 Calculadora de Entrada al Mercado</h1>
        <p className="subtitle">Salud Digital & Productos Sanitarios en América Latina</p>
        <p className="description">
          Evalúa la preparación de tu empresa para ingresar a los mercados de salud de 
          México, Colombia, Costa Rica, Panamá, Perú, Ecuador, República Dominicana, 
          El Salvador y Guatemala.
        </p>
      </div>

      <style jsx>{`
        .header {
          background: linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%);
          padding: 3rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 70%, rgba(0, 212, 170, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 70% 30%, rgba(0, 184, 148, 0.08) 0%, transparent 40%);
          animation: pulse 15s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(5deg); }
        }

        .header-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
          margin: 0 auto;
        }

        .header h1 {
          font-family: 'Fraunces', serif;
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          color: white;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .subtitle {
          color: #00D4AA;
          font-size: 1.1rem;
          font-weight: 500;
        }

        .description {
          color: rgba(255,255,255,0.8);
          font-size: 0.95rem;
          margin-top: 1rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
      `}</style>
    </header>
  )
}
