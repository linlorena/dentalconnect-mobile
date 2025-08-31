const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wvttncioiubiecakmzum.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2dHRuY2lvaXViaWVjYWttenVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDQwMDY3NSwiZXhwIjoyMDU1OTc2Njc1fQ.jOK2dIIARaF8Zmu4xOvNglNOv_Iapt7LzgM9r2CZGtI';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔗 Configuração Supabase carregada');
console.log('URL:', supabaseUrl);
console.log('Chave:', supabaseKey.substring(0, 20) + '...');

module.exports = { supabase };
