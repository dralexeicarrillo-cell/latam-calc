import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      maxWidth: '600px',
      margin: '100px auto',
      textAlign: 'center',
      padding: '40px'
    }}>
      <h1 style={{ fontSize: '3rem', color: '#E74C3C', marginBottom: '20px' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', color: '#0A2540', marginBottom: '20px' }}>
        Reporte no encontrado
      </h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        El reporte que buscas no existe o ha sido eliminado.
      </p>
      <Link 
        href="/"
        style={{
          display: 'inline-block',
          padding: '12px 32px',
          background: '#00D4AA',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: '600'
        }}
      >
        Volver al inicio
      </Link>
    </div>
  )
}