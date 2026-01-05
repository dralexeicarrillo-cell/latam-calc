'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building2, 
  Package, 
  FileCheck, 
  ServerCog, 
  Briefcase, 
  Globe2,
  ChevronRight, 
  ChevronLeft,
  Loader2,
  CheckCircle2
} from 'lucide-react'
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
  
  // --- MANTENEMOS TU ESTADO ORIGINAL ---
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

  // --- TUS FUNCIONES DE LÓGICA (INTACTAS) ---
  const updateResponse = (key, value) => {
    setResponses(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  const toggleArrayValue = (key, value) => {
    setResponses(prev => {
      const current = prev[key] || []
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter(v => v !== value) }
      } else {
        if (key === 'selectedMarkets' && current.length >= 3) {
          alert('Por favor selecciona máximo 3 mercados prioritarios.')
          return prev
        }
        return { ...prev, [key]: [...current, value] }
      }
    })
  }

  const validateSection1 = () => {
    const newErrors = {}
    if (!responses.companyName.trim()) newErrors.companyName = 'El nombre de la empresa es obligatorio'
    if (!responses.contactName.trim()) newErrors.contactName = 'El nombre de contacto es obligatorio'
    if (!responses.companyEmail.trim()) {
      newErrors.companyEmail = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responses.companyEmail)) {
      newErrors.companyEmail = 'Por favor ingresa un email válido'
    }
    if (!responses.contactPhone.trim()) newErrors.contactPhone = 'El teléfono es obligatorio'
    if (!responses.contactPosition.trim()) newErrors.contactPosition = 'El cargo es obligatorio'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const progress = ((currentSection - 1) / TOTAL_SECTIONS) * 100

  const nextSection = () => {
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
      const { scores, totalScore } = calculateAllScores(responses)
      const marketFit = calculateMarketFit(scores, totalScore, responses.selectedMarkets)
      const recommendations = generateRecommendations(scores)

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

  // --- RENDERIZADO CON NUEVO DISEÑO ---
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Barra de Progreso */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
          <span>Progreso</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#F7941D] transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      {/* Indicador de Pasos (Dots) */}
      <div className="flex justify-center gap-2 mb-10">
        {Array.from({ length: TOTAL_SECTIONS }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i + 1 === currentSection ? 'bg-[#1A1F2C] scale-125' : 
              i + 1 < currentSection ? 'bg-[#F7941D]' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* --- SECCIONES --- */}
      
      {/* Section 1 */}
      {currentSection === 1 && (
        <Section
          icon={<Building2 className="text-white" size={24} />}
          title="Información de tu Empresa"
          subtitle="Comencemos conociendo tu organización."
        >
          <div className="bg-blue-50 border-l-4 border-[#1A1F2C] p-4 rounded-r-lg mb-8">
            <p className="text-sm text-slate-700">
              <span className="font-bold block mb-1">🔒 Confidencialidad</span>
              Tus datos se usan únicamente para generar tu reporte personalizado de entrada al mercado.
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Nombre de la empresa" required error={errors.companyName}>
                <input
                  type="text"
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1A1F2C] focus:border-transparent outline-none transition-all"
                  placeholder="Ej: HealthTech Solutions Inc."
                  value={responses.companyName}
                  onChange={(e) => updateResponse('companyName', e.target.value)}
                />
              </InputGroup>
              
              <InputGroup label="Sitio Web" optional>
                <input
                  type="url"
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1A1F2C] outline-none"
                  placeholder="https://..."
                  value={responses.companyWebsite}
                  onChange={(e) => updateResponse('companyWebsite', e.target.value)}
                />
              </InputGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputGroup label="Tu nombre completo" required error={errors.contactName}>
                <input
                  type="text"
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1A1F2C] outline-none"
                  value={responses.contactName}
                  onChange={(e) => updateResponse('contactName', e.target.value)}
                />
              </InputGroup>

              <InputGroup label="Cargo / Posición" required error={errors.contactPosition}>
                <input
                  type="text"
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1A1F2C] outline-none"
                  value={responses.contactPosition}
                  onChange={(e) => updateResponse('contactPosition', e.target.value)}
                />
              </InputGroup>

              <InputGroup label="Teléfono" required error={errors.contactPhone}>
                <input
                  type="tel"
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1A1F2C] outline-none"
                  value={responses.contactPhone}
                  onChange={(e) => updateResponse('contactPhone', e.target.value)}
                />
              </InputGroup>
            </div>

            <InputGroup label="Email corporativo" required error={errors.companyEmail}>
              <input
                type="email"
                className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1A1F2C] outline-none"
                placeholder="nombre@empresa.com"
                value={responses.companyEmail}
                onChange={(e) => updateResponse('companyEmail', e.target.value)}
              />
            </InputGroup>

            <div className="pt-6 border-t border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-3">¿Cuál es el tamaño de tu empresa?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                   { value: 'startup', label: 'Startup', sub: '1-10' },
                   { value: 'small', label: 'Pequeña', sub: '11-50' },
                   { value: 'medium', label: 'Mediana', sub: '51-250' },
                   { value: 'large', label: 'Grande', sub: '250+' },
                ].map(opt => (
                  <SelectableCard
                    key={opt.value}
                    selected={responses.companySize === opt.value}
                    onClick={() => updateResponse('companySize', opt.value)}
                    label={opt.label}
                    sub={opt.sub}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">Años de experiencia en salud: <span className="text-[#F7941D] text-lg ml-2">{responses.experience} años</span></label>
              <input 
                type="range" min="0" max="20" 
                value={responses.experience} 
                onChange={(e) => updateResponse('experience', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1A1F2C]"
              />
            </div>

             {/* Nuevos campos de Sede y Latam */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Sede Principal</label>
                   <select
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1A1F2C] outline-none"
                      value={responses.headquarters}
                      onChange={(e) => updateResponse('headquarters', e.target.value)}
                   >
                      <option value="">Seleccionar...</option>
                      <option value="latam">América Latina</option>
                      <option value="usa">Estados Unidos</option>
                      <option value="europe">Europa</option>
                      <option value="asia">Asia</option>
                      <option value="other">Otra</option>
                   </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Experiencia previa en LATAM</label>
                  <select
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1A1F2C] outline-none"
                      value={responses.latamExp}
                      onChange={(e) => updateResponse('latamExp', e.target.value)}
                   >
                      <option value="">Seleccionar...</option>
                      <option value="none">No, nunca</option>
                      <option value="some">Sí, 1-2 países</option>
                      <option value="extensive">Sí, 3+ países</option>
                   </select>
                </div>
             </div>

          </div>
          <NavButtons onNext={nextSection} showPrev={false} />
        </Section>
      )}

      {/* Section 2 */}
      {currentSection === 2 && (
        <Section
          icon={<Package className="text-white" size={24} />}
          title="Producto o Servicio"
          subtitle="Define qué vas a ofrecer al mercado."
        >
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-4">Selecciona todos los que apliquen:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { value: 'software', label: 'Software / SaaS' },
                { value: 'telemedicine', label: 'Telemedicina' },
                { value: 'ehr', label: 'HCE / EMR' },
                { value: 'ai', label: 'IA / Machine Learning' },
                { value: 'devices', label: 'Dispositivos médicos' },
                { value: 'pharma', label: 'Farmacéuticos' },
                { value: 'wearables', label: 'Wearables / IoT' },
                { value: 'consulting', label: 'Consultoría' },
              ].map(opt => (
                <SelectableCard
                  key={opt.value}
                  multi
                  selected={responses.productTypes.includes(opt.value)}
                  onClick={() => toggleArrayValue('productTypes', opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>

          {responses.productTypes.includes('devices') && (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 animate-in fade-in slide-in-from-top-4">
              <label className="block text-sm font-bold text-slate-700 mb-3">Clasificación de Riesgo (Dispositivos)</label>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {[
                  { value: '1', label: 'Clase I', sub: 'Bajo' },
                  { value: '2', label: 'Clase II', sub: 'Moderado' },
                  { value: '3', label: 'Clase III', sub: 'Alto' },
                  { value: '4', label: 'Clase IV', sub: 'Crítico' },
                ].map(opt => (
                  <SelectableCard
                    key={opt.value}
                    selected={responses.deviceClass === opt.value}
                    onClick={() => updateResponse('deviceClass', opt.value)}
                    label={opt.label}
                    sub={opt.sub}
                    small
                  />
                ))}
              </div>
            </div>
          )}

          <div>
             <label className="block text-sm font-bold text-slate-700 mb-3">¿Procesas datos de salud?</label>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <SelectableCard selected={responses.healthData === 'no'} onClick={() => updateResponse('healthData', 'no')} label="No" />
                <SelectableCard selected={responses.healthData === 'anonymized'} onClick={() => updateResponse('healthData', 'anonymized')} label="Sí, Anonimizados" />
                <SelectableCard selected={responses.healthData === 'identified'} onClick={() => updateResponse('healthData', 'identified')} label="Sí, Identificables" />
             </div>
          </div>

          <NavButtons onPrev={prevSection} onNext={nextSection} />
        </Section>
      )}

      {/* Section 3: Regulatory */}
      {currentSection === 3 && (
        <Section
          icon={<FileCheck className="text-white" size={24} />}
          title="Preparación Regulatoria"
          subtitle="Cumplimiento normativo y certificaciones."
        >
          <div className="mb-8">
             <label className="block text-sm font-bold text-slate-700 mb-4">Certificaciones Actuales</label>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['fda', 'ce', 'iso13485', 'iso27001', 'hipaa', 'gdpr'].map(val => (
                   <SelectableCard 
                      key={val} multi 
                      selected={responses.certifications.includes(val)} 
                      onClick={() => toggleArrayValue('certifications', val)} 
                      label={val.toUpperCase()} 
                   />
                ))}
                <SelectableCard multi selected={responses.certifications.includes('none')} onClick={() => toggleArrayValue('certifications', 'none')} label="Ninguna" />
             </div>
          </div>

          <div className="space-y-6">
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">¿Certificado de Libre Venta (CLV)?</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                   <SelectableCard selected={responses.clv === 'yes'} onClick={() => updateResponse('clv', 'yes')} label="Sí, actualizado" />
                   <SelectableCard selected={responses.clv === 'process'} onClick={() => updateResponse('clv', 'process')} label="En proceso" />
                   <SelectableCard selected={responses.clv === 'no'} onClick={() => updateResponse('clv', 'no')} label="No tengo" />
                </div>
             </div>

             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Documentación Técnica en Español</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                   <SelectableCard selected={responses.spanish === 'full'} onClick={() => updateResponse('spanish', 'full')} label="Sí, Completa" />
                   <SelectableCard selected={responses.spanish === 'partial'} onClick={() => updateResponse('spanish', 'partial')} label="Parcialmente" />
                   <SelectableCard selected={responses.spanish === 'no'} onClick={() => updateResponse('spanish', 'no')} label="No" />
                </div>
             </div>
          </div>

          <NavButtons onPrev={prevSection} onNext={nextSection} />
        </Section>
      )}

      {/* Section 4: Technical */}
      {currentSection === 4 && (
        <Section
          icon={<ServerCog className="text-white" size={24} />}
          title="Capacidad Técnica"
          subtitle="Infraestructura e interoperabilidad."
        >
           <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-3">Estándares Soportados</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                 {[
                    {v: 'hl7fhir', l: 'HL7 FHIR'}, {v: 'hl7v2', l: 'HL7 v2.x'}, {v: 'dicom', l: 'DICOM'},
                    {v: 'icd10', l: 'ICD-10'}, {v: 'api', l: 'API REST'}, {v: 'none', l: 'Ninguno'}
                 ].map(opt => (
                    <SelectableCard key={opt.v} multi selected={responses.standards.includes(opt.v)} onClick={() => toggleArrayValue('standards', opt.v)} label={opt.l} />
                 ))}
              </div>
           </div>

           <div className="space-y-6">
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Alojamiento de Datos (Residencia)</label>
                 <select className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none" value={responses.dataResidency} onChange={(e) => updateResponse('dataResidency', e.target.value)}>
                    <option value="">Seleccionar...</option>
                    <option value="latam">Sí, servidores en LATAM</option>
                    <option value="usa">Solo EE.UU.</option>
                    <option value="europe">Solo Europa</option>
                    <option value="flexible">Flexible / Cloud Agnostic</option>
                 </select>
              </div>
              
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Soporte Técnico en Español</label>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <SelectableCard selected={responses.support === '24-7'} onClick={() => updateResponse('support', '24-7')} label="24/7" />
                    <SelectableCard selected={responses.support === 'business'} onClick={() => updateResponse('support', 'business')} label="Horario Laboral" />
                    <SelectableCard selected={responses.support === 'no'} onClick={() => updateResponse('support', 'no')} label="No disponible" />
                 </div>
              </div>
           </div>

          <NavButtons onPrev={prevSection} onNext={nextSection} />
        </Section>
      )}

      {/* Section 5: Commercial */}
      {currentSection === 5 && (
        <Section
          icon={<Briefcase className="text-white" size={24} />}
          title="Comercial y Financiero"
          subtitle="Recursos para la expansión."
        >
           <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-3">Segmentos Objetivo</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {[
                    { v: 'public', l: 'Sector Público / Gobierno' },
                    { v: 'private_hospitals', l: 'Hospitales Privados' },
                    { v: 'insurers', l: 'Aseguradoras' },
                    { v: 'b2c', l: 'Pacientes Directos (B2C)' }
                 ].map(opt => (
                    <SelectableCard key={opt.v} multi selected={responses.segments.includes(opt.v)} onClick={() => toggleArrayValue('segments', opt.v)} label={opt.l} />
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Presupuesto Go-to-Market</label>
                 <select className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none" value={responses.budget} onChange={(e) => updateResponse('budget', e.target.value)}>
                    <option value="">Seleccionar rango...</option>
                    <option value="low">Menos de $50k</option>
                    <option value="medium">$50k - $200k</option>
                    <option value="high">$200k - $500k</option>
                    <option value="enterprise">Más de $500k</option>
                 </select>
              </div>
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Entidad Legal Local</label>
                 <select className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none" value={responses.entity} onChange={(e) => updateResponse('entity', e.target.value)}>
                    <option value="">Seleccionar...</option>
                    <option value="yes">Ya tenemos entidad</option>
                    <option value="willing">Dispuesto a crearla</option>
                    <option value="distributor">Prefiero distribuidor</option>
                 </select>
              </div>
           </div>

          <NavButtons onPrev={prevSection} onNext={nextSection} />
        </Section>
      )}

      {/* Section 6: Markets */}
      {currentSection === 6 && (
        <Section
          icon={<Globe2 className="text-white" size={24} />}
          title="Mercados Objetivo"
          subtitle="Selecciona tus prioridades (Máximo 3)."
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {[
              { value: 'mexico', label: '🇲🇽 México' },
              { value: 'colombia', label: '🇨🇴 Colombia' },
              { value: 'costarica', label: '🇨🇷 Costa Rica' },
              { value: 'panama', label: '🇵🇦 Panamá' },
              { value: 'peru', label: '🇵🇪 Perú' },
              { value: 'ecuador', label: '🇪🇨 Ecuador' },
              { value: 'dominicana', label: '🇩🇴 Rep. Dom.' },
              { value: 'elsalvador', label: '🇸🇻 El Salvador' },
              { value: 'guatemala', label: '🇬🇹 Guatemala' },
            ].map(opt => (
              <SelectableCard
                key={opt.value}
                multi
                selected={responses.selectedMarkets.includes(opt.value)}
                onClick={() => toggleArrayValue('selectedMarkets', opt.value)}
                label={opt.label}
                className="text-center justify-center"
              />
            ))}
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
             <label className="block text-sm font-bold text-slate-700 mb-3">Horizonte Temporal</label>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <SelectableCard selected={responses.timeline === 'immediate'} onClick={() => updateResponse('timeline', 'immediate')} label="Inmediato" sub="< 6 meses" small />
                <SelectableCard selected={responses.timeline === 'short'} onClick={() => updateResponse('timeline', 'short')} label="Corto Plazo" sub="6-12 meses" small />
                <SelectableCard selected={responses.timeline === 'medium'} onClick={() => updateResponse('timeline', 'medium')} label="Medio" sub="1-2 años" small />
                <SelectableCard selected={responses.timeline === 'long'} onClick={() => updateResponse('timeline', 'long')} label="Largo" sub="2+ años" small />
             </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 bg-[#F7941D] text-white rounded-xl font-bold text-lg hover:bg-[#d47c12] hover:shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" /> Procesando...
              </>
            ) : (
              <>Calcular mi Panorama <ChevronRight /></>
            )}
          </button>
          
          <div className="mt-4 text-center">
             <button onClick={prevSection} className="text-slate-500 hover:text-[#1A1F2C] text-sm font-medium">Volver atrás</button>
          </div>

        </Section>
      )}
    </div>
  )
}

// --- SUB-COMPONENTES ESTILIZADOS ---

function Section({ icon, title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#1A1F2C] p-6 md:p-8 text-white flex items-center gap-4">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
          {icon}
        </div>
        <div>
          <h2 className="font-serif text-2xl font-bold">{title}</h2>
          <p className="text-slate-300 text-sm">{subtitle}</p>
        </div>
      </div>
      <div className="p-6 md:p-8">
        {children}
      </div>
    </div>
  )
}

function InputGroup({ label, required, optional, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-bold text-slate-700 ml-1">
        {label} 
        {required && <span className="text-[#F7941D] ml-1">*</span>}
        {optional && <span className="text-slate-400 font-normal ml-1">(Opcional)</span>}
      </label>
      {children}
      {error && <span className="text-red-500 text-xs ml-1 mt-1">{error}</span>}
    </div>
  )
}

function SelectableCard({ selected, onClick, label, sub, multi, small, className = '' }) {
  return (
    <div 
      onClick={onClick}
      className={`
        cursor-pointer rounded-xl border-2 transition-all duration-200 flex items-center gap-3 relative
        ${small ? 'p-3' : 'p-4'}
        ${selected 
          ? 'border-[#F7941D] bg-orange-50 text-[#1A1F2C]' 
          : 'border-slate-100 hover:border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
        }
        ${className}
      `}
    >
      <div className={`
        flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors
        ${selected ? 'border-[#F7941D] bg-[#F7941D]' : 'border-slate-300'}
      `}>
         {selected && <CheckCircle2 size={14} className="text-white" />}
      </div>
      
      <div className="flex flex-col">
        <span className={`font-medium ${small ? 'text-xs' : 'text-sm'}`}>{label}</span>
        {sub && <span className="text-xs opacity-70">{sub}</span>}
      </div>
    </div>
  )
}

function NavButtons({ onNext, onPrev, showPrev = true }) {
  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
      {showPrev ? (
        <button 
          onClick={onPrev}
          className="flex items-center gap-2 px-6 py-3 text-slate-600 hover:text-[#1A1F2C] hover:bg-slate-100 rounded-lg transition-colors font-medium"
        >
          <ChevronLeft size={20} /> Anterior
        </button>
      ) : <div />}
      
      {onNext && (
        <button 
          onClick={onNext}
          className="flex items-center gap-2 px-8 py-3 bg-[#1A1F2C] text-white rounded-lg hover:bg-[#262262] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all font-bold"
        >
          Siguiente <ChevronRight size={20} />
        </button>
      )}
    </div>
  )
}