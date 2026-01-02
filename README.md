# 🏥 Calculadora de Entrada al Mercado de Salud LATAM

Herramienta interactiva para evaluar la preparación de empresas que desean ingresar a los mercados de salud de América Latina.

## 🌎 Mercados Cubiertos

- 🇲🇽 México
- 🇨🇴 Colombia
- 🇨🇷 Costa Rica
- 🇵🇦 Panamá
- 🇵🇪 Perú
- 🇪🇨 Ecuador
- 🇩🇴 República Dominicana
- 🇸🇻 El Salvador
- 🇬🇹 Guatemala

## 🚀 Despliegue Rápido

### Opción 1: Vercel (Recomendado)

1. **Fork o clona este repositorio**

2. **Crea un proyecto en Supabase** (opcional pero recomendado):
   - Ve a [supabase.com](https://supabase.com) y crea una cuenta
   - Crea un nuevo proyecto
   - Ve a SQL Editor y ejecuta el script `supabase-schema.sql`
   - Copia tus credenciales de Settings > API

3. **Despliega en Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio
   - En "Environment Variables" agrega:
     ```
     NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
     NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
     ```
   - Click en "Deploy"

4. **Conecta tu dominio de GoDaddy**:
   - En Vercel, ve a Settings > Domains
   - Agrega tu dominio (ej: `calculadora.tudominio.com`)
   - En GoDaddy, agrega los registros DNS que Vercel te indica:
     - Tipo: CNAME
     - Nombre: calculadora (o el subdominio que quieras)
     - Valor: cname.vercel-dns.com

### Opción 2: Sin Base de Datos

La aplicación funciona sin Supabase (los resultados se generan localmente y no se persisten).

## 🛠 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local

# Editar .env.local con tus credenciales de Supabase (opcional)

# Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📊 Estructura de la Base de Datos

La tabla principal `assessments` almacena:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| company_name | VARCHAR | Nombre de la empresa |
| company_email | VARCHAR | Email (opcional) |
| responses | JSONB | Todas las respuestas del formulario |
| scores | JSONB | Puntuaciones por dimensión |
| total_score | INTEGER | Puntuación total (0-100) |
| market_fit | JSONB | Compatibilidad por mercado |
| selected_markets | TEXT[] | Mercados seleccionados |
| created_at | TIMESTAMP | Fecha de creación |

## 📁 Estructura del Proyecto

```
latam-health-calculator/
├── src/
│   ├── app/
│   │   ├── page.js              # Página principal
│   │   ├── layout.js            # Layout global
│   │   ├── api/
│   │   │   └── assessments/     # API endpoints
│   │   └── results/
│   │       ├── [id]/            # Resultados por ID
│   │       └── preview/         # Resultados sin DB
│   ├── components/
│   │   ├── Header.js
│   │   ├── AssessmentForm.js
│   │   └── ResultsDisplay.js
│   ├── lib/
│   │   ├── supabase.js          # Cliente Supabase
│   │   └── calculations.js      # Lógica de cálculo
│   └── styles/
│       └── globals.css
├── supabase-schema.sql          # Script de BD
├── .env.example
└── package.json
```

## 🔧 Configuración de GoDaddy + Vercel

### Paso 1: En Vercel
1. Ve a tu proyecto > Settings > Domains
2. Agrega tu dominio: `tudominio.com` o `app.tudominio.com`
3. Vercel te mostrará los registros DNS necesarios

### Paso 2: En GoDaddy
1. Ve a tu dominio > DNS > Manage Zones
2. Agrega los registros:

**Para subdominio (recomendado):**
```
Tipo: CNAME
Nombre: app (o calculadora)
Valor: cname.vercel-dns.com
TTL: 600
```

**Para dominio raíz:**
```
Tipo: A
Nombre: @
Valor: 76.76.21.21
TTL: 600
```

3. Espera 5-30 minutos para propagación DNS
4. Vercel detectará automáticamente y generará SSL

## 📈 Dimensiones Evaluadas

1. **Perfil Empresarial** (15%)
   - Tamaño de empresa
   - Años de experiencia
   - Sede principal
   - Experiencia en LATAM

2. **Tipo de Producto** (20%)
   - Categoría de producto/servicio
   - Clasificación de riesgo
   - Manejo de datos de salud

3. **Preparación Regulatoria** (25%)
   - Certificaciones (FDA, CE, ISO)
   - Certificado de Libre Venta
   - Documentación en español
   - Sistema de vigilancia

4. **Capacidad Técnica** (20%)
   - Estándares de interoperabilidad
   - Residencia de datos
   - Soporte técnico en español

5. **Capacidad Comercial** (20%)
   - Presupuesto
   - Entidad legal local
   - Segmentos objetivo
   - Experiencia en licitaciones

## 📝 Licencia

MIT License - Desarrollado por Clinix

## 🤝 Soporte

Para consultas sobre la herramienta o servicios de consultoría para entrada al mercado latinoamericano, contacta a [tu-email@clinix.com]
