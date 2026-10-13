/* ==============================================================================
   GRAFSIS - Configurações Globais & Conexão Supabase Cloud
   ============================================================================== */

window.GRAFSIS_CONFIG = {
  VERSION: '4.9.4',
  DEFAULT_SUPABASE_URL: 'https://mirhgxsiwjuondnpekru.supabase.co',
  DEFAULT_SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pcmhneHNpd2p1b25kbnBla3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5ODcyNzAsImV4cCI6MjEwNjU2MzI3MH0.DaHF9NQiUyYB8GpT-8pCmEWSX321zd3AMYMWKlWOTos',

  getSupabaseConfig() {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem('grafsis_settings') || '{}');
    } catch (e) {
      saved = {};
    }
    const url = (saved.supabaseUrl && typeof saved.supabaseUrl === 'string') ? saved.supabaseUrl.trim() : '';
    const key = (saved.supabaseKey && typeof saved.supabaseKey === 'string') ? saved.supabaseKey.trim() : '';
    const isValidUrl = url.startsWith('https://') && url.includes('.supabase.co');
    const isValidKey = key.length > 50;

    return {
      url: isValidUrl ? url : this.DEFAULT_SUPABASE_URL,
      key: isValidKey ? key : this.DEFAULT_SUPABASE_KEY
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
