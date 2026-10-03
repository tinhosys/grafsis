/* ==============================================================================
   GRAFSIS - Configurações Globais & Conexão Supabase Cloud
   ============================================================================== */

window.GRAFSIS_CONFIG = {
  VERSION: '1.3.0',
  // URL do projeto Supabase criado pelo usuário
  DEFAULT_SUPABASE_URL: 'https://mirhgxsiwjuondnpekru.supabase.co',
  // Chave anon pública (salva localmente ou fornecida)
  DEFAULT_SUPABASE_KEY: '',

  getSupabaseConfig() {
    const saved = JSON.parse(localStorage.getItem('grafsis_settings') || '{}');
    return {
      url: saved.supabaseUrl || this.DEFAULT_SUPABASE_URL,
      key: saved.supabaseKey || this.DEFAULT_SUPABASE_KEY
    };
  },

  setSupabaseConfig(url, key) {
    const current = JSON.parse(localStorage.getItem('grafsis_settings') || '{}');
    current.supabaseUrl = url.trim();
    current.supabaseKey = key.trim();
    localStorage.setItem('grafsis_settings', JSON.stringify(current));
  }
};
