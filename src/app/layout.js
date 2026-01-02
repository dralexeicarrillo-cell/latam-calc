import '../styles/globals.css'

export const metadata = {
  title: 'Calculadora de Entrada al Mercado de Salud LATAM',
  description: 'Evalúa la preparación de tu empresa para ingresar a los mercados de salud de México, Colombia, Costa Rica, Panamá, Perú, Ecuador, República Dominicana, El Salvador y Guatemala.',
  keywords: 'healthtech, salud digital, latam, telemedicina, dispositivos médicos, regulación sanitaria',
  authors: [{ name: 'Clinix' }],
  openGraph: {
    title: 'Calculadora de Entrada al Mercado de Salud LATAM',
    description: 'Evalúa tu preparación para entrar al mercado de salud latinoamericano',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
