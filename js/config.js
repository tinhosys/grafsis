/* ==============================================================================
   GRAFSIS - Configurações Globais & Conexão Supabase Cloud
   ============================================================================== */

window.GRAFSIS_CONFIG = {
  VERSION: '1.3.1',
  DEFAULT_SUPABASE_URL: 'https://mirhgxsiwjuondnpekru.supabase.co',
  DEFAULT_SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pcmhneHNpd2p1b25kbnBla3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5ODcyNzAsImV4cCI6MjEwNjU2MzI3MH0.DaHF9NQiUyYB8GpT-8pCmEWSX321zd3AMYMWKlWOTos',

  getSupabaseConfig() {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem('grafsis_settings') || '{}');
    } catch (e) {
      saved = {};
    }
    return {
      url: (saved.supabaseUrl && saved.supabaseUrl.trim()) ? saved.supabaseUrl.trim() : this.DEFAULT_SUPABASE_URL,
      key: (saved.supabaseKey && saved.supabaseKey.trim()) ? saved.supabaseKey.trim() : this.DEFAULT_SUPABASE_KEY
    };
  },

  setSupabaseConfig(url, key) {
    let current = {};
    try {
      current = JSON.parse(localStorage.getItem('grafsis_settings') || '{}');
    } catch (e) {
      current = {};
    }
    current.supabaseUrl = (url || '').trim();
    current.supabaseKey = (key || '').trim();
    localStorage.setItem('grafsis_settings', JSON.stringify(current));
  }
};
