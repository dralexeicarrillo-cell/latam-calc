import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Database features will be disabled.')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Tipos para TypeScript/JSDoc
/**
 * @typedef {Object} Assessment
 * @property {string} id
 * @property {string} company_name
 * @property {string} company_email
 * @property {Object} responses
 * @property {Object} scores
 * @property {number} total_score
 * @property {Object} market_fit
 * @property {string} created_at
 */

/**
 * @typedef {Object} AssessmentInsert
 * @property {string} company_name
 * @property {string} [company_email]
 * @property {Object} responses
 * @property {Object} scores
 * @property {number} total_score
 * @property {Object} market_fit
 */
