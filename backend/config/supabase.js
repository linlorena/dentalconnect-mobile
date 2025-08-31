require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY são obrigatórias');
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Configuração Supabase carregada');
console.log('URL:', supabaseUrl);
console.log('Chave:', supabaseKey.substring(0, 20) + '...');

module.exports = { supabase };
