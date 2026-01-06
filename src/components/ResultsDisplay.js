'use client'

import { 
  Download, 
  Share2, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  Activity,
  Globe2,
  Building2,
  Briefcase,
  Lock, 
  ChevronRight,
  Star
} from 'lucide-react'

// IMPORTAMOS LA NUEVA FUNCIÓN GENERADORA
import { generatePDFReport } from '@/lib/pdf-generator'

// Mapeo de códigos de país para banderas
const countryCodes = {
  mexico: 'mx', colombia: 'co', costarica: 'cr', panama: 'pa',
  peru: 'pe', ecuador: 'ec', dominicana: 'do', elsalvador: 'sv', guatemala: 'gt'
}

const getScoreStatus = (score) => {
  if (score >= 80) return { label: 'Excelente', color: 'text-emerald-500', bg: 'bg-emerald-500' };
  if (score >= 60) return { label: 'Bueno', color: 'text-teal-500', bg: 'bg-teal-500' };
  if (score >= 40) return { label: 'Moderado', color: 'text-amber-500', bg: 'bg-amber-500' };
  return { label: 'Inicial', color: 'text-red-500', bg: 'bg-red-500' };
}

export default function ResultsDisplay({ results }) {
  const { company_name, total_score, scores, market_fit, recommendations } = results
  const status = getScoreStatus(total_score)

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* HEADER */}
      <header className="bg-[#1A1F2C] text-white pt-8 pb-24 px-4 relative overflow-hidden">
        <div className="max-w-5xl mx-auto flex justify-between items-center mb-10">
            <div className="text-2xl font-serif font-bold tracking-wider">NHS+</div>
            <div className="text-xs text-slate-400 font-medium tracking-widest">INTERNAL TOOLS</div>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F7941D] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <h2 className="text-[#F7941D] font-bold tracking-widest text-xs uppercase mb-2">Reporte Estratégico Confidencial</h2>
              <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">Panorama de Entrada a LATAM</h1>
              <p className="text-slate-300">Análisis preliminar para: <span className="text-white font-semibold">{company_name}</span></p>
            </div>
            
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all text-sm font-medium">
                <Share2 size={16} /> Compartir
              </button>
              
              {/* BOTÓN CONECTADO AL GENERADOR PDF */}
              <button 
                onClick={() => generatePDFReport(results)}
                className="flex items-center gap-2 px-4 py-2 bg-[#F7941D] hover:bg-[#d47c12] text-white rounded-lg shadow-lg hover:shadow-orange-500/20 transition-all text-sm font-bold"
              >
                <Download size={16} /> Descargar PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-5xl mx-auto px-4 -mt-16 pb-20 relative z-20">
        
        {/* TARJETA DE PUNTAJE */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-100 flex flex-col md:flex-row items-center gap-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
              <circle 
                cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                strokeDasharray={440} strokeDashoffset={440 - (440 * total_score) / 100} 
                className={`${status.color} transition-all duration-1000 ease-out`} strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${status.color}`}>{total_score}</span>
              <span className="text-xs text-slate-400 uppercase font-bold">Puntaje</span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Estado: <span className={status.color}>{status.label}</span></h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              {total_score >= 60 ? "Fundamentos sólidos detectados. Se recomienda proceder a la fase de planificación detallada." : "Se recomienda fortalecer capacidades internas antes de la expansión."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUMNA IZQUIERDA (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <Activity className="text-[#1A1F2C]" size={20} />
                <h3 className="font-bold text-slate-800">Análisis por Área</h3>
              </div>
              <div className="p-6 space-y-6">
                <ScoreBar label="Perfil Corporativo" score={scores.company} icon={<Building2 size={18} />} />
                <ScoreBar label="Producto / Servicio" score={scores.product} icon={<ShieldCheck size={18} />} />
                <ScoreBar label="Regulatorio" score={scores.regulatory} icon={<AlertTriangle size={18} />} />
                <ScoreBar label="Técnico" score={scores.technical} icon={<TrendingUp size={18} />} />
                <ScoreBar label="Comercial" score={scores.commercial} icon={<Briefcase size={18} />} />
              </div>
            </div>

            {/* MERCADOS CON SELECCIÓN */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
               <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe2 className="text-[#1A1F2C]" size={20} />
                  <h3 className="font-bold text-slate-800">Potencial de Mercado</h3>
                </div>
                <span className="text-xs text-slate-500 font-normal">* Ordenado por compatibilidad</span>
              </div>
              <div className="p-6 space-y-4">
                {market_fit.map((market) => (
                  <div key={market.key} className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all ${market.selected ? 'border-[#F7941D] bg-orange-50/50' : 'border-slate-100 bg-white'}`}>
                    <div className="flex-shrink-0">
                       <img src={`https://flagcdn.com/w40/${countryCodes[market.key] || 'xx'}.png`} width="40" alt={market.name} className="rounded shadow-sm" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-bold ${market.selected ? 'text-[#1A1F2C]' : 'text-slate-800'}`}>{market.name}</h4>
                          {market.selected && <span className="flex items-center gap-1 text-[10px] font-bold bg-[#F7941D] text-white px-2 py-0.5 rounded-full uppercase"><Star size={10} fill="currentColor" /> Tu Selección</span>}
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-700">{market.score}% Match</span>
                      </div>
                      <p className="text-xs text-slate-500">{market.highlights}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="font-bold text-slate-800 text-lg px-2">Áreas de Mejora</h3>
            {recommendations.map((rec, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-[#F7941D]">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-1">{rec.icon}</span>
                  <div>
                      <h4 className="font-bold text-slate-800 text-sm">{rec.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">Requiere atención estratégica.</p>
                  </div>
                </div>
              </div>
            ))}

            {/* CTA AGENDAR */}
            <div className="bg-[#1A1F2C] text-white p-6 rounded-2xl text-center mt-8 relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#F7941D] opacity-20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-30 transition-opacity"></div>
               <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <Lock size={24} className="text-[#F7941D]" />
                  </div>
                  <h4 className="font-bold mb-2">Desbloquear Hoja de Ruta</h4>
                  <p className="text-xs text-slate-300 mb-6">Plan de acción de 12 pasos disponible.</p>
                  <button className="w-full py-3 bg-[#F7941D] rounded-lg font-bold hover:bg-[#d47c12] transition-colors text-sm flex items-center justify-center gap-2">
                    Agendar Revisión <ChevronRight size={16} />
                  </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function ScoreBar({ label, score, icon }) {
  const status = getScoreStatus(score);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
           <span className="text-slate-400">{icon}</span> {label}
        </div>
        <span className={`text-sm font-bold ${status.color}`}>{score}/100</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${status.bg} rounded-full`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}