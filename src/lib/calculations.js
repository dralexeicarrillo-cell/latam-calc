// Características de cada mercado
export const markets = {
  mexico: { 
    flag: '🇲🇽', 
    name: 'México', 
    size: 5, 
    complexity: 3, 
    digital: 4,
    highlights: 'Mayor mercado, 628 startups healthtech, equivalencia FDA'
  },
  colombia: { 
    flag: '🇨🇴', 
    name: 'Colombia', 
    size: 4, 
    complexity: 3, 
    digital: 5,
    highlights: 'Mejor regulación telemedicina, IHCE obligatoria 2025'
  },
  costarica: { 
    flag: '🇨🇷', 
    name: 'Costa Rica', 
    size: 2, 
    complexity: 2, 
    digital: 5,
    highlights: 'Alta digitalización (EDUS), estabilidad, hub RTCA'
  },
  panama: { 
    flag: '🇵🇦', 
    name: 'Panamá', 
    size: 2, 
    complexity: 2, 
    digital: 4,
    highlights: 'Hub regional, afiliación Johns Hopkins, dolarizado'
  },
  peru: { 
    flag: '🇵🇪', 
    name: 'Perú', 
    size: 3, 
    complexity: 4, 
    digital: 3,
    highlights: 'Tiempos largos de registro, inversión KOICA $7M'
  },
  ecuador: { 
    flag: '🇪🇨', 
    name: 'Ecuador', 
    size: 2, 
    complexity: 3, 
    digital: 3,
    highlights: 'Dolarizado, CAN para cosméticos, inversión BID $50M'
  },
  dominicana: { 
    flag: '🇩🇴', 
    name: 'Rep. Dominicana', 
    size: 2, 
    complexity: 2, 
    digital: 3,
    highlights: '#1 turismo médico Caribe, DR-CAFTA'
  },
  elsalvador: { 
    flag: '🇸🇻', 
    name: 'El Salvador', 
    size: 1, 
    complexity: 2, 
    digital: 3,
    highlights: '$77M inversión CAF, contrato Google $500M'
  },
  guatemala: { 
    flag: '🇬🇹', 
    name: 'Guatemala', 
    size: 2, 
    complexity: 3, 
    digital: 2,
    highlights: 'Mayor población CA, $312M BCIE hospitales'
  }
};

export function calculateCompanyScore(responses) {
  let score = 0;
  
  // Tamaño de empresa
  if (responses.companySize) {
    const sizeScores = { startup: 40, small: 60, medium: 80, large: 100 };
    score += (sizeScores[responses.companySize] || 0) * 0.2;
  }

  // Experiencia
  const exp = parseInt(responses.experience) || 0;
  score += Math.min(exp * 4, 100) * 0.3;

  // Sede
  if (responses.headquarters) {
    const hqScores = { latam: 100, usa: 80, europe: 70, asia: 50, other: 40 };
    score += (hqScores[responses.headquarters] || 0) * 0.2;
  }

  // Experiencia LATAM
  if (responses.latamExp) {
    const latamScores = { none: 30, some: 70, extensive: 100 };
    score += (latamScores[responses.latamExp] || 0) * 0.3;
  }

  return Math.round(score);
}

export function calculateProductScore(responses) {
  let score = 0;
  
  const productTypes = responses.productTypes || [];
  
  // Software/SaaS es más fácil de escalar
  if (productTypes.includes('software') || productTypes.includes('telemedicine')) {
    score += 30;
  }
  
  // Dispositivos médicos requieren más regulación
  if (productTypes.includes('devices')) {
    if (responses.deviceClass) {
      const classScores = { '1': 80, '2': 60, '3': 40, '4': 20 };
      score += (classScores[responses.deviceClass] || 0) * 0.3;
    }
  } else {
    score += 25;
  }

  // Manejo de datos de salud
  if (responses.healthData) {
    const dataScores = { no: 100, anonymized: 70, identified: 40 };
    score += (dataScores[responses.healthData] || 0) * 0.4;
  }

  return Math.min(Math.round(score), 100);
}

export function calculateRegulatoryScore(responses) {
  let score = 0;
  
  const certifications = responses.certifications || [];
  
  if (certifications.includes('none') || certifications.length === 0) {
    score += 10;
  } else {
    const certPoints = {
      fda: 20, ce: 20, iso13485: 15, iso27001: 15,
      hipaa: 10, gdpr: 10, gmp: 10
    };
    certifications.forEach(cert => {
      score += certPoints[cert] || 0;
    });
  }
  score = Math.min(score, 40);

  // CLV
  if (responses.clv) {
    const clvScores = { yes: 100, process: 60, no: 20, na: 50 };
    score += (clvScores[responses.clv] || 0) * 0.2;
  }

  // Documentación en español
  if (responses.spanish) {
    const spanishScores = { full: 100, partial: 60, no: 20 };
    score += (spanishScores[responses.spanish] || 0) * 0.2;
  }

  // Sistema de vigilancia
  if (responses.vigilance) {
    const vigScores = { full: 100, basic: 60, no: 20, na: 50 };
    score += (vigScores[responses.vigilance] || 0) * 0.2;
  }

  return Math.round(score);
}

export function calculateTechnicalScore(responses) {
  let score = 0;
  
  const standards = responses.standards || [];
  
  if (standards.includes('none') || standards.length === 0) {
    score += 20;
  } else {
    if (standards.includes('hl7fhir')) score += 25;
    if (standards.includes('hl7v2')) score += 10;
    if (standards.includes('dicom')) score += 10;
    if (standards.includes('icd10')) score += 10;
    if (standards.includes('snomed')) score += 10;
    if (standards.includes('loinc')) score += 5;
    if (standards.includes('api')) score += 10;
  }
  score = Math.min(score, 40);

  // Residencia de datos
  if (responses.dataResidency) {
    const resScores = { latam: 100, flexible: 90, usa: 50, europe: 50 };
    score += (resScores[responses.dataResidency] || 0) * 0.3;
  }

  // Soporte técnico
  if (responses.support) {
    const supScores = { '24-7': 100, business: 70, limited: 40, no: 10 };
    score += (supScores[responses.support] || 0) * 0.3;
  }

  return Math.round(score);
}

export function calculateCommercialScore(responses) {
  let score = 0;
  
  // Presupuesto
  if (responses.budget) {
    const budgetScores = { low: 30, medium: 60, high: 85, enterprise: 100 };
    score += (budgetScores[responses.budget] || 0) * 0.3;
  }

  // Entidad legal
  if (responses.entity) {
    const entityScores = { yes: 100, willing: 70, distributor: 50, no: 20 };
    score += (entityScores[responses.entity] || 0) * 0.25;
  }

  // Segmentos de mercado
  const segments = responses.segments || [];
  score += Math.min(segments.length * 10, 25);

  // Experiencia en licitaciones
  if (responses.procurement) {
    const procScores = { extensive: 100, some: 60, no: 30 };
    score += (procScores[responses.procurement] || 0) * 0.2;
  }

  return Math.round(score);
}

export function calculateAllScores(responses) {
  const scores = {
    company: calculateCompanyScore(responses),
    product: calculateProductScore(responses),
    regulatory: calculateRegulatoryScore(responses),
    technical: calculateTechnicalScore(responses),
    commercial: calculateCommercialScore(responses)
  };

  const totalScore = Math.round(
    (scores.company * 0.15) +
    (scores.product * 0.20) +
    (scores.regulatory * 0.25) +
    (scores.technical * 0.20) +
    (scores.commercial * 0.20)
  );

  return { scores, totalScore };
}

export function calculateMarketFit(scores, totalScore, selectedMarkets = []) {
  const marketScores = Object.entries(markets).map(([key, market]) => {
    let compatibility = totalScore;
    
    // Ajustar por complejidad regulatoria
    if (scores.regulatory < 50 && market.complexity > 3) {
      compatibility -= 15;
    }
    
    // Bonus por madurez digital
    if (scores.technical >= 60 && market.digital >= 4) {
      compatibility += 10;
    }

    // Bonus si es un mercado más pequeño y tienen buen presupuesto
    if (scores.commercial >= 60 && market.size <= 2) {
      compatibility += 5;
    }

    const isSelected = selectedMarkets.includes(key);
    
    return {
      key,
      ...market,
      score: Math.min(Math.max(Math.round(compatibility), 0), 100),
      selected: isSelected
    };
  });

  // Ordenar por compatibilidad
  marketScores.sort((a, b) => b.score - a.score);

  return marketScores;
}

export function generateRecommendations(scores) {
  const recommendations = [];

  if (scores.regulatory < 50) {
    recommendations.push({
      priority: 'high',
      icon: '📋',
      title: 'Fortalecer preparación regulatoria',
      description: 'Prioriza obtener certificaciones internacionales (FDA, CE, ISO 13485) y traduce tu documentación técnica al español. Considera contratar una consultora regulatoria local.',
      actionItems: [
        'Obtener Certificado de Libre Venta del país de origen',
        'Traducir documentación técnica al español (traducción jurada)',
        'Implementar sistema de farmacovigilancia/tecnovigilancia',
        'Contactar consultoría regulatoria en mercado objetivo'
      ]
    });
  }

  if (scores.technical < 50) {
    recommendations.push({
      priority: 'high',
      icon: '⚙️',
      title: 'Mejorar capacidades técnicas',
      description: 'Implementa estándares de interoperabilidad como HL7 FHIR. Evalúa establecer infraestructura de datos en la región.',
      actionItems: [
        'Implementar API HL7 FHIR R4',
        'Evaluar AWS São Paulo o Azure México para residencia de datos',
        'Establecer soporte técnico en español',
        'Adoptar codificaciones ICD-10, SNOMED CT, LOINC'
      ]
    });
  }

  if (scores.commercial < 50) {
    recommendations.push({
      priority: 'medium',
      icon: '💼',
      title: 'Desarrollar estrategia comercial',
      description: 'Considera alianzas con distribuidores locales establecidos. Regístrate en portales de compras públicas.',
      actionItems: [
        'Identificar distribuidores/representantes locales',
        'Registrarse en CompraNet (MX), SECOP (CO), SICOP (CR)',
        'Establecer entidad legal local o contrato de representación',
        'Desarrollar modelo de precios para mercado local'
      ]
    });
  }

  if (scores.company < 50) {
    recommendations.push({
      priority: 'medium',
      icon: '🏢',
      title: 'Fortalecer presencia regional',
      description: 'Evalúa establecer una oficina regional o contratar personal local. La experiencia previa en LATAM es altamente valorada.',
      actionItems: [
        'Contratar personal comercial/técnico local',
        'Establecer oficina regional (Panamá como hub)',
        'Desarrollar casos de éxito en la región',
        'Participar en eventos de la industria (FIME, Expo Med)'
      ]
    });
  }

  // Recomendaciones positivas
  if (scores.regulatory >= 70) {
    recommendations.push({
      priority: 'low',
      icon: '✅',
      title: 'Ventaja regulatoria',
      description: 'Tu preparación regulatoria es sólida. Aprovecha las equivalencias con FDA/CE para procesos de registro simplificados.',
      actionItems: [
        'Solicitar proceso de registro simplificado donde aplique',
        'Documentar equivalencias para acelerar aprobaciones',
        'Considerar expansión multi-país simultánea'
      ]
    });
  }

  if (scores.technical >= 70) {
    recommendations.push({
      priority: 'low',
      icon: '✅',
      title: 'Fortaleza técnica',
      description: 'Tu infraestructura técnica está bien posicionada. Los estándares de interoperabilidad que manejas son requisito creciente en la región.',
      actionItems: [
        'Destacar cumplimiento de HL7 FHIR en propuestas',
        'Ofrecer integración con sistemas existentes como diferenciador',
        'Posicionarse para iniciativas gubernamentales de interoperabilidad'
      ]
    });
  }

  return recommendations;
}

export function getScoreStatus(score) {
  if (score >= 80) return { status: '🚀 Altamente Preparado', color: '#27AE60' };
  if (score >= 60) return { status: '✅ Buena Preparación', color: '#00D4AA' };
  if (score >= 40) return { status: '⚠️ Preparación Moderada', color: '#F5A623' };
  return { status: '🔧 Requiere Fortalecimiento', color: '#E74C3C' };
}
