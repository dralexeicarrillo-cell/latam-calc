'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  calculateAllScores, 
  calculateMarketFit, 
  generateRecommendations 
} from '@/lib/calculations'

const TOTAL_SECTIONS = 6

export default function AssessmentForm() {
  const router = useRouter()
  const [currentSection, setCurrentSection] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  
  const [responses, setResponses] = useState({
    // Section 1 - Company Profile & Contact Info
    companyName: '',
    companyEmail: '',
    contactName: '',
    contactPhone: '',
    contactPosition: '',
    companyWebsite: '',
    companySize: '',
    experience: 5,
    headquarters: '',
    latamExp: '',
    // Section 2 - Product Type
    productTypes: [],
    deviceClass: '',
    healthData: '',
    // Section 3 - Regulatory
    certifications: [],
    clv: '',
    spanish: '',
    vigilance: '',
    // Section 4 - Technical
    standards: [],
    dataResidency: '',
    support: '',
    // Section 5 - Commercial
    budget: '',
    entity: '',
    segments: [],
    procurement: '',
    // Section 6 - Markets
    selectedMarkets: [],
    timeline: '',
    multiCountry: 5,
  })

  const updateResponse = (key, value) => {
    setResponses(prev => ({ ...prev, [key]: value }))
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }))
    }
  }

  const toggleArrayValue = (key, value) => {
    setResponses(prev => {
      const current = prev[key] || []
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter(v => v !== value) }
      } else {
        // Limit markets to 3
        if (key === 'selectedMarkets' && current.length >= 3) {
          alert('Por favor selecciona máximo 3 mercados prioritarios.')
          return prev
        }
        return { ...prev, [key]: [...current, value] }
      }
    })
  }

  // Validación de campos obligatorios en Sección 1
  const validateSection1 = () => {
    const newErrors = {}
    
    if (!responses.companyName.trim()) {
      newErrors.companyName = 'El nombre de la empresa es obligatorio'
    }
    
    if (!responses.contactName.trim()) {
      newErrors.contactName = 'El nombre de contacto es obligatorio'
    }
    
    if (!responses.companyEmail.trim()) {
      newErrors.companyEmail = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responses.companyEmail)) {
      newErrors.companyEmail = 'Por favor ingresa un email válido'
    }
    
    if (!responses.contactPhone.trim()) {
      newErrors.contactPhone = 'El teléfono es obligatorio'
    }
    
    if (!responses.contactPosition.trim()) {
      newErrors.contactPosition = 'El cargo es obligatorio'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const progress = ((currentSection - 1) / TOTAL_SECTIONS) * 100

  const nextSection = () => {
    // Validar sección 1 antes de avanzar
    if (currentSection === 1 && !validateSection1()) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    
    if (currentSection < TOTAL_SECTIONS) {
      setCurrentSection(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevSection = () => {
    if (currentSection > 1) {
      setCurrentSection(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Calculate scores
      const { scores, totalScore } = calculateAllScores(responses)
      const marketFit = calculateMarketFit(scores, totalScore, responses.selectedMarkets)
      const recommendations = generateRecommendations(scores)

      // Submit to API (incluyendo datos de contacto)
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: responses.companyName,
          company_email: responses.companyEmail,
          company_website: responses.companyWebsite || null,
          contact_name: responses.contactName,
          contact_phone: responses.contactPhone,
          contact_position: responses.contactPosition,
          responses,
          scores,
          total_score: totalScore,
          market_fit: marketFit,
          recommendations,
          selected_markets: responses.selectedMarkets,
        }),
      })

      const data = await res.json()

      if (data.success && data.id) {
        router.push(`/results/${data.id}`)
      } else {
        // If no database, still show results in URL with encoded data
        const encodedData = btoa(JSON.stringify({
          companyName: responses.companyName,
          contactName: responses.contactName,
          scores,
          totalScore,
          marketFit,
          recommendations,
        }))
        router.push(`/results/preview?data=${encodedData}`)
      }
    } catch (error) {
      console.error('Error submitting assessment:', error)
      alert('Hubo un error al procesar tu evaluación. Por favor intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        {Array.from({ length: TOTAL_SECTIONS }, (_, i) => (
          <div
            key={i}
            className={`step-dot ${i + 1 === currentSection ? 'active' : ''} ${i + 1 < currentSection ? 'completed' : ''}`}
          />
        ))}
      </div>

      {/* Section 1: Company Profile & Contact */}
      {currentSection === 1 && (
        <Section
          icon="🏢"
          title="Información de tu Empresa"
          subtitle="Comencemos conociendo tu organización"
        >
          <div className="info-box">
            <p>📧 <strong>¿Por qué pedimos tus datos?</strong></p>
            <p>Necesitamos tu información para enviarte un reporte personalizado y poder contactarte con recomendaciones específicas para tu entrada al mercado LATAM.</p>
          </div>

          <div className="form-group">
            <label className="form-label">Nombre de la empresa *</label>
            <input
              type="text"
              className={`form-input ${errors.companyName ? 'error' : ''}`}
              placeholder="Ej: HealthTech Solutions Inc."
              value={responses.companyName}
              onChange={(e) => updateResponse('companyName', e.target.value)}
            />
            {errors.companyName && <span className="error-message">{errors.companyName}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tu nombre completo *</label>
              <input
                type="text"
                className={`form-input ${errors.contactName ? 'error' : ''}`}
                placeholder="Ej: María González"
                value={responses.contactName}
                onChange={(e) => updateResponse('contactName', e.target.value)}
              />
              {errors.contactName && <span className="error-message">{errors.contactName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Tu cargo/posición *</label>
              <input
                type="text"
                className={`form-input ${errors.contactPosition ? 'error' : ''}`}
                placeholder="Ej: CEO, Director Comercial"
                value={responses.contactPosition}
                onChange={(e) => updateResponse('contactPosition', e.target.value)}
              />
              {errors.contactPosition && <span className="error-message">{errors.contactPosition}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email corporativo *</label>
              <input
                type="email"
                className={`form-input ${errors.companyEmail ? 'error' : ''}`}
                placeholder="correo@empresa.com"
                value={responses.companyEmail}
                onChange={(e) => updateResponse('companyEmail', e.target.value)}
              />
              {errors.companyEmail && <span className="error-message">{errors.companyEmail}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono de contacto *</label>
              <input
                type="tel"
                className={`form-input ${errors.contactPhone ? 'error' : ''}`}
                placeholder="+1 (555) 123-4567"
                value={responses.contactPhone}
                onChange={(e) => updateResponse('contactPhone', e.target.value)}
              />
              {errors.contactPhone && <span className="error-message">{errors.contactPhone}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Sitio web de la empresa (opcional)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://www.empresa.com"
              value={responses.companyWebsite}
              onChange={(e) => updateResponse('companyWebsite', e.target.value)}
            />
          </div>

          <hr style={{ margin: '2rem 0', border: 'none', borderTop: '2px solid var(--border)' }} />

          <div className="form-group">
            <label className="form-label">¿Cuál es el tamaño de tu empresa?</label>
            <div className="radio-group">
              {[
                { value: 'startup', label: 'Startup', sub: '1-10 empleados' },
                { value: 'small', label: 'Pequeña', sub: '11-50 empleados' },
                { value: 'medium', label: 'Mediana', sub: '51-250 empleados' },
                { value: 'large', label: 'Grande', sub: '250+ empleados' },
              ].map(opt => (
                <RadioOption
                  key={opt.value}
                  name="companySize"
                  value={opt.value}
                  checked={responses.companySize === opt.value}
                  onChange={() => updateResponse('companySize', opt.value)}
                  label={opt.label}
                  sublabel={opt.sub}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">¿Cuántos años de experiencia tiene tu empresa en el sector salud?</label>
            <SliderInput
              value={responses.experience}
              onChange={(val) => updateResponse('experience', val)}
              min={0}
              max={20}
              unit="años"
              labels={['0 años', '10 años', '20+ años']}
            />
          </div>

          <div className="form-group">
            <label className="form-label">¿En qué región tiene su sede principal?</label>
            <select
              className="form-select"
              value={responses.headquarters}
              onChange={(e) => updateResponse('headquarters', e.target.value)}
            >
              <option value="">Selecciona una región...</option>
              <option value="latam">América Latina</option>
              <option value="usa">Estados Unidos</option>
              <option value="europe">Europa</option>
              <option value="asia">Asia</option>
              <option value="other">Otra</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">¿Ha operado previamente en América Latina?</label>
            <div className="radio-group">
              {[
                { value: 'none', label: 'No, nunca' },
                { value: 'some', label: 'Sí, 1-2 países' },
                { value: 'extensive', label: 'Sí, 3+ países' },
              ].map(opt => (
                <RadioOption
                  key={opt.value}
                  name="latamExp"
                  value={opt.value}
                  checked={responses.latamExp === opt.value}
                  onChange={() => updateResponse('latamExp', opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>

          <NavButtons onNext={nextSection} showPrev={false} />
        </Section>
      )}

      {/* Section 2: Product Type */}
      {currentSection === 2 && (
        <Section
          icon="📦"
          title="Tipo de Producto o Servicio"
          subtitle="Define tu oferta para el mercado"
        >
          <div className="form-group">
            <label className="form-label">¿Qué tipo de producto/servicio ofreces? (Selecciona todos los que apliquen)</label>
            <div className="checkbox-group">
              {[
                { value: 'software', label: 'Software de salud / SaaS' },
                { value: 'telemedicine', label: 'Telemedicina' },
                { value: 'ehr', label: 'HCE / EMR' },
                { value: 'ai', label: 'IA / Machine Learning' },
                { value: 'devices', label: 'Dispositivos médicos' },
                { value: 'pharma', label: 'Farmacéuticos' },
                { value: 'cosmetics', label: 'Cosméticos / Cuidado personal' },
                { value: 'supplements', label: 'Suplementos alimenticios' },
                { value: 'wearables', label: 'Wearables / IoT médico' },
                { value: 'consulting', label: 'Consultoría / Servicios' },
              ].map(opt => (
                <CheckboxOption
                  key={opt.value}
                  value={opt.value}
                  checked={responses.productTypes.includes(opt.value)}
                  onChange={() => toggleArrayValue('productTypes', opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>

          {responses.productTypes.includes('devices') && (
            <div className="form-group animate-fadeIn">
              <label className="form-label">Si tienes dispositivos médicos, ¿cuál es su clasificación de riesgo?</label>
              <div className="radio-group">
                {[
                  { value: '1', label: 'Clase I', sub: 'Bajo riesgo' },
                  { value: '2', label: 'Clase II', sub: 'Riesgo moderado' },
                  { value: '3', label: 'Clase III', sub: 'Alto riesgo' },
                  { value: '4', label: 'Clase IV', sub: 'Crítico' },
                ].map(opt => (
                  <RadioOption
                    key={opt.value}
                    name="deviceClass"
                    value={opt.value}
                    checked={responses.deviceClass === opt.value}
                    onChange={() => updateResponse('deviceClass', opt.value)}
                    label={opt.label}
                    sublabel={opt.sub}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">¿Tu producto/servicio procesa datos de salud de pacientes?</label>
            <div className="radio-group">
              {[
                { value: 'no', label: 'No' },
                { value: 'anonymized', label: 'Sí, anonimizados' },
                { value: 'identified', label: 'Sí, identificables' },
              ].map(opt => (
                <RadioOption
                  key={opt.value}
                  name="healthData"
                  value={opt.value}
                  checked={responses.healthData === opt.value}
                  onChange={() => updateResponse('healthData', opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>

          <NavButtons onPrev={prevSection} onNext={nextSection} />
        </Section>
      )}

      {/* Section 3: Regulatory Preparation */}
      {currentSection === 3 && (
        <Section
          icon="📋"
          title="Preparación Regulatoria"
          subtitle="Evalúa tu cumplimiento normativo actual"
        >
          <div className="form-group">
            <label className="form-label">¿Tienes certificaciones o aprobaciones regulatorias actuales?</label>
            <div className="checkbox-group">
              {[
                { value: 'fda', label: 'FDA (EE.UU.)' },
                { value: 'ce', label: 'Marcado CE (Europa)' },
                { value: 'iso13485', label: 'ISO 13485' },
                { value: 'iso27001', label: 'ISO 27001' },
                { value: 'hipaa', label: 'HIPAA Compliance' },
                { value: 'gdpr', label: 'GDPR Compliance' },
                { value: 'gmp', label: 'BPM / GMP' },
                { value: 'none', label: 'Ninguna actualmente' },
              ].map(opt => (
                <CheckboxOption
                  key={opt.value}
                  value={opt.value}
                  checked={responses.certifications.includes(opt.value)}
                  onChange={() => toggleArrayValue('certifications', opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">¿Cuentas con un Certificado de Libre Venta (CLV) de tu país de origen?</label>
            <div className="radio-group">
              {[
                { value: 'yes', label: 'Sí, actualizado' },
                { value: 'process', label: 'En proceso' },
                { value: 'no', label: 'No' },
                { value: 'na', label: 'No aplica' },
              ].map(opt => (
                <RadioOption
                  key={opt.value}
                  name="clv"
                  value={opt.value}
                  checked={responses.clv === opt.value}
                  onChange={() => updateResponse('clv', opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">¿Tu documentación técnica está disponible en español?</label>
            <div className="radio-group">
              {[
                { value: 'full', label: 'Sí, completa' },
                { value: 'partial', label: 'Parcialmente' },
                { value: 'no', label: 'No' },
              ].map(opt => (
                <RadioOption
                  key={opt.value}
                  name="spanish"
                  value={opt.value}
                  checked={responses.spanish === opt.value}
                  onChange={() => updateResponse('spanish', opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">¿Tienes implementado un sistema de farmacovigilancia o tecnovigilancia?</label>
            <div className="radio-group">
              {[
                { value: 'full', label: 'Sí, robusto' },
                { value: 'basic', label: 'Básico' },
                { value: 'no', label: 'No' },
                { value: 'na', label: 'No aplica' },
              ].map(opt => (
                <RadioOption
                  key={opt.value}
                  name="vigilance"
                  value={opt.value}
                  checked={responses.vigilance === opt.value}
                  onChange={() => updateResponse('vigilance', opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>

          <NavButtons onPrev={prevSection} onNext={nextSection} />
        </Section>
      )}

      {/* Section 4: Technical Capacity */}
      {currentSection === 4 && (
        <Section
          icon="⚙️"
          title="Capacidad Técnica"
          subtitle="Evalúa tu infraestructura y estándares técnicos"
        >
          <div className="form-group">
            <label className="form-label">Si ofreces software de salud, ¿qué estándares de interoperabilidad soportas?</label>
            <div className="checkbox-group">
              {[
                { value: 'hl7fhir', label: 'HL7 FHIR' },
                { value: 'hl7v2', label: 'HL7 v2.x' },
                { value: 'dicom', label: 'DICOM' },
                { value: 'icd10', label: 'ICD-10' },
                { value: 'snomed', label: 'SNOMED CT' },
                { value: 'loinc', label: 'LOINC' },
                { value: 'api', label: 'API REST' },
                { value: 'none', label: 'Ninguno / No aplica' },
              ].map(opt => (
                <CheckboxOption
                  key={opt.value}
                  value={opt.value}
                  checked={responses.standards.includes(opt.value)}
                  onChange={() => toggleArrayValue('standards', opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">¿Tu infraestructura tecnológica puede alojar datos en la región?</label>
            <div className="radio-group">
              {[
                { value: 'latam', label: 'Sí, en LATAM' },
                { value: 'usa', label: 'Solo en EE.UU.' },
                { value: 'europe', label: 'Solo en Europa' },
                { value: 'flexible', label: 'Flexible / Multi-región' },
              ].map(opt => (
                <RadioOption
                  key={opt.value}
                  name="dataResidency"
                  value={opt.value}
                  checked={responses.dataResidency === opt.value}
                  onChange={() => updateResponse('dataResidency', opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">¿Tienes capacidad de soporte técnico en español?</label>
            <div className="radio-group">
              {[
                { value: '24-7', label: 'Sí, 24/7' },
                { value: 'business', label: 'Horario laboral' },
                { value: 'limited', label: 'Limitado' },
                { value: 'no', label: 'No' },
              ].map(opt => (
                <RadioOption
                  key={opt.value}
                  name="support"
                  value={opt.value}
                  checked={responses.support === opt.value}
                  onChange={() => updateResponse('support', opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>

          <NavButtons onPrev={prevSection} onNext={nextSection} />
        </Section>
      )}

      {/* Section 5: Commercial Capacity */}
      {currentSection === 5 && (
        <Section
          icon="💼"
          title="Capacidad Comercial y Financiera"
          subtitle="Evalúa tus recursos para la expansión"
        >
          <div className="form-group">
            <label className="form-label">¿Cuál es tu presupuesto estimado para entrada al mercado (por país)?</label>
            <div className="radio-group">
              {[
                { value: 'low', label: '< USD 50K' },
                { value: 'medium', label: 'USD 50K - 200K' },
                { value: 'high', label: 'USD 200K - 500K' },
                { value: 'enterprise', label: '> USD 500K' },
              ].map(opt => (
                <RadioOption
                  key={opt.value}
                  name="budget"
                  value={opt.value}
                  checked={responses.budget === opt.value}
                  onChange={() => updateResponse('budget', opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">¿Tienes o estás dispuesto a establecer una entidad legal local?</label>
            <div className="radio-group">
              {[
                { value: 'yes', label: 'Sí, tenemos' },
                { value: 'willing', label: 'Dispuesto a crear' },
                { value: 'distributor', label: 'Prefiero distribuidor' },
                { value: 'no', label: 'No es posible' },
              ].map(opt => (
                <RadioOption
                  key={opt.value}
                  name="entity"
                  value={opt.value}
                  checked={responses.entity === opt.value}
                  onChange={() => updateResponse('entity', opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">¿A qué segmentos de mercado te diriges? (Selecciona todos)</label>
            <div className="checkbox-group">
              {[
                { value: 'public', label: 'Sector público / Gobierno' },
                { value: 'private_hospitals', label: 'Hospitales privados' },
                { value: 'clinics', label: 'Clínicas / Consultorios' },
                { value: 'insurers', label: 'Aseguradoras' },
                { value: 'pharma', label: 'Farmacéuticas' },
                { value: 'b2c', label: 'Consumidor final (B2C)' },
              ].map(opt => (
                <CheckboxOption
                  key={opt.value}
                  value={opt.value}
                  checked={responses.segments.includes(opt.value)}
                  onChange={() => toggleArrayValue('segments', opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">¿Tienes experiencia participando en licitaciones públicas?</label>
            <div className="radio-group">
              {[
                { value: 'extensive', label: 'Sí, amplia' },
                { value: 'some', label: 'Algo de experiencia' },
                { value: 'no', label: 'No' },
              ].map(opt => (
                <RadioOption
                  key={opt.value}
                  name="procurement"
                  value={opt.value}
                  checked={responses.procurement === opt.value}
                  onChange={() => updateResponse('procurement', opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>

          <NavButtons onPrev={prevSection} onNext={nextSection} />
        </Section>
      )}

      {/* Section 6: Target Markets */}
      {currentSection === 6 && (
        <Section
          icon="🌎"
          title="Mercados Objetivo"
          subtitle="Define tus prioridades geográficas"
        >
          <div className="form-group">
            <label className="form-label">¿Qué mercados te interesan prioritariamente? (Selecciona hasta 3)</label>
            <div className="checkbox-group">
              {[
                { value: 'mexico', label: '🇲🇽 México' },
                { value: 'colombia', label: '🇨🇴 Colombia' },
                { value: 'costarica', label: '🇨🇷 Costa Rica' },
                { value: 'panama', label: '🇵🇦 Panamá' },
                { value: 'peru', label: '🇵🇪 Perú' },
                { value: 'ecuador', label: '🇪🇨 Ecuador' },
                { value: 'dominicana', label: '🇩🇴 Rep. Dominicana' },
                { value: 'elsalvador', label: '🇸🇻 El Salvador' },
                { value: 'guatemala', label: '🇬🇹 Guatemala' },
              ].map(opt => (
                <CheckboxOption
                  key={opt.value}
                  value={opt.value}
                  checked={responses.selectedMarkets.includes(opt.value)}
                  onChange={() => toggleArrayValue('selectedMarkets', opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">¿Cuál es tu horizonte temporal para la entrada al mercado?</label>
            <div className="radio-group">
              {[
                { value: 'immediate', label: 'Inmediato', sub: '0-6 meses' },
                { value: 'short', label: 'Corto plazo', sub: '6-12 meses' },
                { value: 'medium', label: 'Mediano plazo', sub: '1-2 años' },
                { value: 'long', label: 'Largo plazo', sub: '2+ años' },
              ].map(opt => (
                <RadioOption
                  key={opt.value}
                  name="timeline"
                  value={opt.value}
                  checked={responses.timeline === opt.value}
                  onChange={() => updateResponse('timeline', opt.value)}
                  label={opt.label}
                  sublabel={opt.sub}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">¿Qué tan crítico es para ti tener operaciones en múltiples países simultáneamente?</label>
            <SliderInput
              value={responses.multiCountry}
              onChange={(val) => updateResponse('multiCountry', val)}
              min={1}
              max={10}
              unit="/ 10"
              labels={['Un país a la vez', 'Muy importante']}
            />
          </div>

          <button
            className="btn btn-accent"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', marginTop: '1rem' }}
          >
            {isSubmitting ? '⏳ Procesando tu evaluación...' : '🔍 Calcular mi Panorama de Mercado'}
          </button>

          <div style={{ marginTop: '1rem' }}>
            <button 
              className="btn btn-secondary" 
              onClick={prevSection}
              style={{ width: '100%' }}
            >
              ← Anterior
            </button>
          </div>
        </Section>
      )}

      <style jsx>{`
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }

        .form-input.error {
          border-color: var(--danger);
        }

        .error-message {
          color: var(--danger);
          font-size: 0.85rem;
          margin-top: 0.25rem;
          display: block;
        }

        .info-box {
          background: linear-gradient(135deg, rgba(0, 212, 170, 0.08) 0%, rgba(0, 184, 148, 0.05) 100%);
          border-left: 4px solid var(--accent);
          padding: 1rem 1.25rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .info-box p {
          margin: 0.5rem 0;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .info-box p:first-child {
          margin-top: 0;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}

// Sub-components
function Section({ icon, title, subtitle, children }) {
  return (
    <div className="card animate-fadeIn">
      <div className="section-header">
        <div className="section-icon">{icon}</div>
        <div>
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>
      </div>
      {children}

      <style jsx>{`
        .section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--border);
        }

        .section-icon {
          width: 48px;
          height: 48px;
          background: var(--gradient-accent);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .section-title {
          font-family: 'Fraunces', serif;
          font-size: 1.4rem;
          color: var(--primary);
          margin: 0;
        }

        .section-subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 0;
        }
      `}</style>
    </div>
  )
}

function RadioOption({ name, value, checked, onChange, label, sublabel }) {
  return (
    <div className="radio-option">
      <input
        type="radio"
        name={name}
        id={`${name}-${value}`}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <label htmlFor={`${name}-${value}`}>
        {label}
        {sublabel && <><br /><small>{sublabel}</small></>}
      </label>
    </div>
  )
}

function CheckboxOption({ value, checked, onChange, label }) {
  return (
    <div className="checkbox-option">
      <input
        type="checkbox"
        id={`check-${value}`}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <label htmlFor={`check-${value}`}>{label}</label>
    </div>
  )
}

function SliderInput({ value, onChange, min, max, unit, labels }) {
  return (
    <div className="slider-container">
      <div className="slider-value">
        <span>{value}</span> <span>{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
      />
      <div className="slider-labels">
        {labels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
    </div>
  )
}

function NavButtons({ onPrev, onNext, showPrev = true }) {
  return (
    <div className="nav-buttons">
      {showPrev ? (
        <button className="btn btn-secondary" onClick={onPrev}>
          ← Anterior
        </button>
      ) : (
        <div />
      )}
      {onNext && (
        <button className="btn btn-primary" onClick={onNext}>
          Siguiente →
        </button>
      )}

      <style jsx>{`
        .nav-buttons {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 2rem;
        }

        @media (max-width: 640px) {
          .nav-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}