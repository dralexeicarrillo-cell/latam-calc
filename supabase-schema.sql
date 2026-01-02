-- =====================================================
-- SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS SUPABASE
-- Calculadora de Entrada al Mercado de Salud LATAM
-- =====================================================

-- Tabla principal de evaluaciones
CREATE TABLE IF NOT EXISTS assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Información de la empresa
    company_name VARCHAR(255) NOT NULL,
    company_email VARCHAR(255),
    company_website VARCHAR(500),
    
    -- Respuestas del formulario (JSON completo)
    responses JSONB NOT NULL DEFAULT '{}',
    
    -- Puntuaciones calculadas
    scores JSONB NOT NULL DEFAULT '{}',
    total_score INTEGER NOT NULL DEFAULT 0,
    
    -- Compatibilidad de mercados
    market_fit JSONB NOT NULL DEFAULT '[]',
    
    -- Recomendaciones generadas
    recommendations JSONB DEFAULT '[]',
    
    -- Mercados seleccionados por el usuario
    selected_markets TEXT[] DEFAULT '{}',
    
    -- Metadatos
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_assessments_company_name ON assessments(company_name);
CREATE INDEX IF NOT EXISTS idx_assessments_company_email ON assessments(company_email);
CREATE INDEX IF NOT EXISTS idx_assessments_total_score ON assessments(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at DESC);

-- Índice para búsqueda en JSON de mercados seleccionados
CREATE INDEX IF NOT EXISTS idx_assessments_selected_markets ON assessments USING GIN(selected_markets);

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para auto-actualizar updated_at
DROP TRIGGER IF EXISTS update_assessments_updated_at ON assessments;
CREATE TRIGGER update_assessments_updated_at
    BEFORE UPDATE ON assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security)
-- =====================================================

-- Habilitar RLS en la tabla
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción anónima (cualquiera puede crear evaluación)
CREATE POLICY "Allow anonymous inserts" ON assessments
    FOR INSERT
    WITH CHECK (true);

-- Política para permitir lectura por ID (cualquiera puede ver su evaluación con el link)
CREATE POLICY "Allow read by id" ON assessments
    FOR SELECT
    USING (true);

-- =====================================================
-- TABLA DE ANALYTICS (OPCIONAL)
-- =====================================================

CREATE TABLE IF NOT EXISTS assessment_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    
    -- Métricas de engagement
    page_views INTEGER DEFAULT 0,
    report_downloads INTEGER DEFAULT 0,
    share_clicks INTEGER DEFAULT 0,
    
    -- Tiempo en cada sección (en segundos)
    time_section_1 INTEGER,
    time_section_2 INTEGER,
    time_section_3 INTEGER,
    time_section_4 INTEGER,
    time_section_5 INTEGER,
    time_section_6 INTEGER,
    total_time INTEGER,
    
    -- Fuente de tráfico
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_assessment_id ON assessment_analytics(assessment_id);

-- Habilitar RLS
ALTER TABLE assessment_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow analytics inserts" ON assessment_analytics
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow analytics updates" ON assessment_analytics
    FOR UPDATE
    USING (true);

-- =====================================================
-- VISTA PARA REPORTES AGREGADOS
-- =====================================================

CREATE OR REPLACE VIEW assessment_summary AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_assessments,
    AVG(total_score) as avg_score,
    COUNT(CASE WHEN total_score >= 80 THEN 1 END) as highly_prepared,
    COUNT(CASE WHEN total_score >= 60 AND total_score < 80 THEN 1 END) as good_preparation,
    COUNT(CASE WHEN total_score >= 40 AND total_score < 60 THEN 1 END) as moderate,
    COUNT(CASE WHEN total_score < 40 THEN 1 END) as needs_improvement
FROM assessments
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL - COMENTAR EN PRODUCCIÓN)
-- =====================================================

-- INSERT INTO assessments (company_name, company_email, responses, scores, total_score, market_fit, selected_markets)
-- VALUES (
--     'Empresa Demo',
--     'demo@empresa.com',
--     '{"companySize": "medium", "experience": 5, "headquarters": "latam", "latamExp": "some"}',
--     '{"company": 65, "product": 70, "regulatory": 55, "technical": 60, "commercial": 50}',
--     60,
--     '[{"key": "mexico", "score": 72}, {"key": "colombia", "score": 68}]',
--     ARRAY['mexico', 'colombia']
-- );

-- =====================================================
-- COMENTARIOS ÚTILES
-- =====================================================

COMMENT ON TABLE assessments IS 'Almacena las evaluaciones de empresas para entrada al mercado de salud LATAM';
COMMENT ON COLUMN assessments.responses IS 'JSON con todas las respuestas del formulario';
COMMENT ON COLUMN assessments.scores IS 'JSON con puntuaciones por dimensión: company, product, regulatory, technical, commercial';
COMMENT ON COLUMN assessments.market_fit IS 'JSON array con compatibilidad calculada para cada mercado';
-- 
Agregar columnas de contacto
ALTER TABLE assessments 
ADD COLUMN contact_name VARCHAR(255),
ADD COLUMN contact_phone VARCHAR(50),
ADD COLUMN contact_position VARCHAR(100),
ADD COLUMN company_website VARCHAR(500);

-- Agregar índice para búsqueda por nombre de contacto
CREATE INDEX IF NOT EXISTS idx_assessments_contact_name ON assessments(contact_name);